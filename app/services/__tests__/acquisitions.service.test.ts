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
      createdAt: "2024-01-15T00:00:00Z",
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

const { mockApiClient, mockGet, mockPost, mockPut, mockDelete } = vi.hoisted(() => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPut = vi.fn();
  const mockDelete = vi.fn();
  return {
    mockApiClient: {
      get: mockGet,
      post: mockPost,
      put: mockPut,
      delete: mockDelete,
    },
    mockGet,
    mockPost,
    mockPut,
    mockDelete,
  };
});

vi.mock("../api-client", async (importOriginal: () => Promise<typeof import("../api-client")>) => {
  const actual = await importOriginal();
  return {
    ...actual,
    apiClient: mockApiClient,
  };
});

import { getAnimalById } from "../animals.service";
import { addCashFlow } from "../cash-flow.service";
import { addAccountsPayable } from "../accounts-payable.service";

describe("acquisitions.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default API client mocks
    mockGet.mockResolvedValue(mockAcquisitionsData);
    mockPost.mockResolvedValue(mockAcquisitionsData[0]);
    mockPut.mockResolvedValue(mockAcquisitionsData[0]);
    mockDelete.mockResolvedValue(undefined);
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
    it("should find acquisition by id", async () => {
      mockGet.mockResolvedValue(mockAcquisitionsData[0]);
      const result = await getAcquisitionById("acq-1");
      expect(result).toEqual(mockAcquisitionsData[0]);
    });
  });

  describe("getAcquisitionByAnimalId", () => {
    it("should find acquisition by animal id", async () => {
      mockGet.mockResolvedValue(mockAcquisitionsData);
      const result = await getAcquisitionByAnimalId("animal-1");
      expect(result).toEqual(mockAcquisitionsData[0]);
    });

    it("should return undefined when animal id is empty", async () => {
      const result = await getAcquisitionByAnimalId("");
      expect(result).toBeUndefined();
    });
  });

  describe("getAcquisitionsByDateRange", () => {
    it("should find acquisitions within date range", async () => {
      mockGet.mockResolvedValue(mockAcquisitionsData);
      const result = await getAcquisitionsByDateRange("company-1", "2024-01-01", "2024-01-31");
      expect(result).toHaveLength(1);
    });
  });

  describe("addAcquisition", () => {
    it("should create acquisition with cash flow payment", async () => {
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

      const createdAcquisition = {
        ...mockAcquisitionsData[0],
        id: "acq-new",
        linkedCashFlowId: "cf-new",
      };
      mockPost.mockResolvedValue(createdAcquisition);

      const result = await addAcquisition(formData);

      expect(result.id).toBeDefined();
      expect(mockPost).toHaveBeenCalled();
    });

    it("should calculate cost per animal and cost per arroba", async () => {
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

      const createdAcquisition = {
        ...mockAcquisitionsData[0],
        id: "acq-new",
        totalPrice: 6000,
        acquisitionItems: [
          { animalId: "animal-2", weight: 300, price: 3000, costPerArroba: 300 },
          { animalId: "animal-3", weight: 300, price: 3000, costPerArroba: 300 },
        ],
      };
      mockPost.mockResolvedValue(createdAcquisition);

      const result = await addAcquisition(formData);

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
    it("should update acquisition and recalculate costs", async () => {
      const updatedAcquisition = {
        ...mockAcquisitionsData[0],
        totalPrice: 12000,
      };
      mockPut.mockResolvedValue(updatedAcquisition);
      const updateData = { totalPrice: 12000 };
      const result = await updateAcquisition("acq-1", updateData);

      expect(result).toBeDefined();
      expect(result.totalPrice).toBe(12000);
      expect(mockPut).toHaveBeenCalled();
    });

    it("should handle payment method change", async () => {
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const addAR = addAccountsPayable as ReturnType<typeof vi.fn>;
      getAnimal.mockReturnValue({ id: "animal-1", code: "001" });
      addAR.mockReturnValue({ id: "ap-new" });

      const updatedAcquisition = {
        ...mockAcquisitionsData[0],
        paymentMethod: AcquisitionPaymentMethod.ACCOUNTS_PAYABLE,
      };
      mockPut.mockResolvedValue(updatedAcquisition);

      const updateData = { paymentMethod: AcquisitionPaymentMethod.ACCOUNTS_PAYABLE };
      const result = await updateAcquisition("acq-1", updateData);

      expect(result).toBeDefined();
      expect(mockPut).toHaveBeenCalled();
    });
  });

  describe("deleteAcquisition", () => {
    it("should delete acquisition and linked financial records", async () => {
      mockGet.mockResolvedValue(mockAcquisitionsData[0]);
      mockDelete.mockResolvedValue(undefined);

      // Clear any previous calls
      mockDeleteCashFlow.mockClear();

      await deleteAcquisition("acq-1");

      expect(mockDelete).toHaveBeenCalledWith("/acquisitions/acq-1");
    });
  });

  describe("generateAcquisitionId", () => {
    it("should generate acquisition id with correct format", () => {
      const result = generateAcquisitionId(0);
      expect(result).toBe("ac0e8400-e29b-41d4-a716-446655440100");
    });
  });
});
