import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAcquisitionById,
  getAcquisitionByAnimalId,
  getAcquisitionsByDateRange,
  addAcquisition,
  updateAcquisition,
  deleteAcquisition,
  calculateAcquisitionCostPerArroba,
  generateAcquisitionId,
} from "../acquisitions.service";
import { PricingMode, AcquisitionPaymentMethod } from "~/types";

const { mockAcquisitionsData } = vi.hoisted(() => {
  const mockAcquisitionsData = [
    {
      id: "acq-1",
      companyId: "company-1",
      supplierId: "supplier-1",
      propertyId: "property-1",
      acquisitionDate: "2024-01-15",
      paymentMethod: "cash_flow",
      totalPrice: 10000,
      fees: 200,
      transportationFee: 100,
      acquisitionItems: [{ animalId: "animal-1", weight: 500, price: 5000, costPerArroba: 300 }],
      linkedCashFlowId: "cf-1",
    },
  ];
  return { mockAcquisitionsData };
});

vi.mock("~/mocks/acquisitions", () => ({
  mockAcquisitions: mockAcquisitionsData,
}));

vi.mock("../animals.service", () => ({
  getAnimalById: vi.fn(),
}));

const { mockDeleteCashFlow } = vi.hoisted(() => ({
  mockDeleteCashFlow: vi.fn(),
}));

vi.mock("../cash-flow.service", () => ({
  addCashFlow: vi.fn(),
  updateCashFlow: vi.fn(),
  deleteCashFlow: mockDeleteCashFlow,
}));

vi.mock("../accounts-payable.service", () => ({
  addAccountsPayable: vi.fn(),
  updateAccountsPayable: vi.fn(),
  deleteAccountsPayable: vi.fn(),
}));

vi.mock("~/utils/fees", () => ({
  getTotalFees: vi.fn(
    (
      fees: import("~/types").Fee[] | undefined,
      transport: number | undefined,
      _additional: number | undefined,
      handling: number | undefined
    ) => {
      const feesSum =
        fees && fees.length > 0 ? fees.reduce((sum, fee) => sum + (fee.amount || 0), 0) : 0;
      return feesSum + (transport || 0) + (handling || 0);
    }
  ),
}));

import { mockAcquisitions } from "~/mocks/acquisitions";
import { getAnimalById } from "../animals.service";
import { addCashFlow, updateCashFlow, deleteCashFlow } from "../cash-flow.service";
import { addAccountsPayable } from "../accounts-payable.service";

describe("acquisitions.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("calculateAcquisitionCostPerArroba", () => {
    it("should calculate cost per arroba correctly", () => {
      const result = calculateAcquisitionCostPerArroba(500, 5000);
      // 500kg / 30 = 16.67 arrobas, 5000 / 16.67 = 300
      expect(result).toBeCloseTo(300, 0);
    });

    it("should return 0 when weight is 0", () => {
      const result = calculateAcquisitionCostPerArroba(0, 5000);
      expect(result).toBe(0);
    });

    it("should return 0 when weight is negative", () => {
      const result = calculateAcquisitionCostPerArroba(-100, 5000);
      expect(result).toBe(0);
    });
  });

  describe("getAcquisitionById", () => {
    it("should find acquisition by id", () => {
      const result = getAcquisitionById("acq-1");
      expect(result).toEqual(mockAcquisitions[0]);
    });
  });

  describe("getAcquisitionByAnimalId", () => {
    it("should find acquisition by animal id", () => {
      const result = getAcquisitionByAnimalId("animal-1");
      expect(result).toEqual(mockAcquisitions[0]);
    });

    it("should return undefined when animal id is empty", () => {
      const result = getAcquisitionByAnimalId("");
      expect(result).toBeUndefined();
    });
  });

  describe("getAcquisitionsByDateRange", () => {
    it("should find acquisitions within date range", () => {
      const result = getAcquisitionsByDateRange("company-1", "2024-01-01", "2024-01-31");
      expect(result).toHaveLength(1);
    });
  });

  describe("addAcquisition", () => {
    it("should create acquisition with cash flow payment", () => {
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const addCash = addCashFlow as ReturnType<typeof vi.fn>;
      getAnimal.mockReturnValue({ id: "animal-2", code: "002" });
      addCash.mockReturnValue({ id: "cf-new" });

      const formData = {
        companyId: "company-1",
        supplierId: "supplier-1",
        propertyId: "property-1",
        acquisitionDate: "2024-03-01",
        pricingMode: PricingMode.TOTAL,
        paymentMethod: AcquisitionPaymentMethod.CASH_FLOW,
        totalPrice: 8000,
        fees: [],
        transportationFee: 75,
        acquisitionItems: [{ animalId: "animal-2", weight: 400, price: 8000, costPerArroba: 200 }],
        propertyIds: [],
      };

      const result = addAcquisition(formData);

      expect(result.id).toBeDefined();
      expect(result.linkedCashFlowId).toBe("cf-new");
      expect(addCash).toHaveBeenCalled();
    });

    it("should calculate cost per animal and cost per arroba", () => {
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const addCash = addCashFlow as ReturnType<typeof vi.fn>;
      getAnimal.mockReturnValue({ id: "animal-2", code: "002" });
      addCash.mockReturnValue({ id: "cf-new" });

      const formData = {
        companyId: "company-1",
        supplierId: "supplier-1",
        propertyId: "property-1",
        acquisitionDate: "2024-03-01",
        pricingMode: PricingMode.TOTAL,
        paymentMethod: AcquisitionPaymentMethod.CASH_FLOW,
        totalPrice: 6000,
        fees: [],
        transportationFee: 0,
        acquisitionItems: [
          { animalId: "animal-2", weight: 300, price: 3000, costPerArroba: 300 },
          { animalId: "animal-3", weight: 300, price: 3000, costPerArroba: 300 },
        ],
      };

      const result = addAcquisition(formData);

      // The calculation should be: totalPrice (6000) / animalCount (2) = 3000
      // The service code correctly calculates costPerAnimal = totalCost / animalCount
      // and sets price: costPerAnimal in each item
      const expectedPrice = formData.totalPrice / formData.acquisitionItems.length;
      expect(result.acquisitionItems[0].price).toBe(expectedPrice); // 6000 / 2 = 3000
      const expectedCostPerArroba = expectedPrice / (300 / 30); // price / arrobas = 3000 / 10 = 300
      expect(result.acquisitionItems[0].costPerArroba).toBeCloseTo(expectedCostPerArroba, 0);
    });
  });

  describe("updateAcquisition", () => {
    it("should update acquisition and recalculate costs", () => {
      // getAcquisitionById uses findById which works with mock data
      const updateData = { totalPrice: 12000 };
      const result = updateAcquisition("acq-1", updateData);

      expect(result).toBe(true);
      expect(updateCashFlow).toHaveBeenCalled();
    });

    it("should handle payment method change", () => {
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const addAR = addAccountsPayable as ReturnType<typeof vi.fn>;
      getAnimal.mockReturnValue({ id: "animal-1", code: "001" });
      addAR.mockReturnValue({ id: "ap-new" });

      const updateData = { paymentMethod: AcquisitionPaymentMethod.ACCOUNTS_PAYABLE };
      const result = updateAcquisition("acq-1", updateData);

      expect(result).toBe(true);
      expect(deleteCashFlow).toHaveBeenCalledWith("cf-1");
      expect(addAR).toHaveBeenCalled();
    });
  });

  describe("deleteAcquisition", () => {
    it("should delete acquisition and linked financial records", () => {
      // Ensure the acquisition has linkedCashFlowId by adding it if it doesn't exist
      const acquisition = getAcquisitionById("acq-1");
      if (acquisition && !acquisition.linkedCashFlowId) {
        acquisition.linkedCashFlowId = "cf-1";
      }

      const initialLength = mockAcquisitions.length;
      // Clear any previous calls
      mockDeleteCashFlow.mockClear();

      const result = deleteAcquisition("acq-1");

      expect(result).toBe(true);
      // The imported deleteCashFlow should be the same as our mock
      expect(deleteCashFlow).toBe(mockDeleteCashFlow);
      expect(mockDeleteCashFlow).toHaveBeenCalledWith("cf-1");
      expect(mockAcquisitions).toHaveLength(initialLength - 1);
    });
  });

  describe("generateAcquisitionId", () => {
    it("should generate acquisition id with correct format", () => {
      const result = generateAcquisitionId(0);
      expect(result).toBe("ac0e8400-e29b-41d4-a716-446655440100");
    });
  });
});
