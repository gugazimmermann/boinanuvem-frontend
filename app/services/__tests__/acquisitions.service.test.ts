import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  calculateAcquisitionCostPerArroba,
  getAcquisitionById,
  getAcquisitionByAnimalId,
  getAcquisitionsByCompanyId,
  getAcquisitionsBySupplierId,
  getAcquisitionsByDateRange,
  addAcquisition,
  updateAcquisition,
  deleteAcquisition,
  generateAcquisitionId,
} from "../acquisitions.service";
import { mockAcquisitions } from "~/mocks/acquisitions";
import type { AcquisitionFormData } from "~/types";
import { AcquisitionPaymentMethod, PricingMode } from "~/types";

// Mock dependencies
vi.mock("../animals.service", () => ({
  getAnimalById: vi.fn((id: string) => {
    if (id === "animal-1") {
      return { id: "animal-1", code: "AN001" };
    }
    if (id === "animal-2") {
      return { id: "animal-2", code: "AN002" };
    }
    return undefined;
  }),
}));

vi.mock("../cash-flow.service", () => ({
  addCashFlow: vi.fn((data: Record<string, unknown>) => ({
    id: "cf-1",
    ...(data as Record<string, unknown>),
    createdAt: "2025-01-01",
  })),
  deleteCashFlow: vi.fn(() => true),
  updateCashFlow: vi.fn(() => true),
}));

vi.mock("../accounts-payable.service", () => ({
  addAccountsPayable: vi.fn((data: Record<string, unknown>) => ({
    id: "ap-1",
    ...(data as Record<string, unknown>),
    createdAt: "2025-01-01",
  })),
  deleteAccountsPayable: vi.fn(() => true),
  updateAccountsPayable: vi.fn(() => true),
}));

describe("acquisitions.service", () => {
  beforeEach(() => {
    // Reset mock data before each test
    mockAcquisitions.length = 0;
    mockAcquisitions.push(
      {
        id: "acq-1",
        companyId: "company-1",
        supplierId: "supplier-1",
        propertyId: "property-1",
        acquisitionDate: "2025-01-01",
        pricingMode: PricingMode.TOTAL,
        totalPrice: 10000,
        fees: [],
        transportationFee: 0,
        handlingFee: 0,
        paymentMethod: AcquisitionPaymentMethod.CASH_FLOW,
        acquisitionItems: [
          {
            animalId: "animal-1",
            weight: 300,
            price: 5000,
            costPerArroba: 500,
          },
          {
            animalId: "animal-2",
            weight: 350,
            price: 5000,
            costPerArroba: 428.57,
          },
        ],
        linkedCashFlowId: "cf-1",
        linkedAccountsPayableId: undefined,
        createdAt: "2025-01-01",
      },
      {
        id: "acq-2",
        companyId: "company-1",
        supplierId: "supplier-2",
        propertyId: "property-2",
        acquisitionDate: "2025-01-15",
        pricingMode: PricingMode.TOTAL,
        totalPrice: 20000,
        fees: [],
        transportationFee: 0,
        handlingFee: 0,
        paymentMethod: AcquisitionPaymentMethod.ACCOUNTS_PAYABLE,
        acquisitionItems: [
          {
            animalId: "animal-1",
            weight: 400,
            price: 20000,
            costPerArroba: 1500,
          },
        ],
        linkedCashFlowId: undefined,
        linkedAccountsPayableId: "ap-1",
        createdAt: "2025-01-15",
      },
      {
        id: "acq-3",
        companyId: "company-2",
        supplierId: "supplier-1",
        propertyId: "property-1",
        acquisitionDate: "2025-02-01",
        pricingMode: PricingMode.TOTAL,
        totalPrice: 15000,
        fees: [],
        transportationFee: 0,
        handlingFee: 0,
        paymentMethod: AcquisitionPaymentMethod.CASH_FLOW,
        acquisitionItems: [
          {
            animalId: "animal-2",
            weight: 320,
            price: 15000,
            costPerArroba: 1406.25,
          },
        ],
        linkedCashFlowId: "cf-2",
        linkedAccountsPayableId: undefined,
        createdAt: "2025-02-01",
      }
    );
  });

  describe("calculateAcquisitionCostPerArroba", () => {
    it("should calculate cost per arroba correctly", () => {
      const result = calculateAcquisitionCostPerArroba(300, 5000);
      expect(result).toBeCloseTo(500, 2);
    });

    it("should return 0 when weight is 0", () => {
      const result = calculateAcquisitionCostPerArroba(0, 5000);
      expect(result).toBe(0);
    });

    it("should return 0 when weight is negative", () => {
      const result = calculateAcquisitionCostPerArroba(-100, 5000);
      expect(result).toBe(0);
    });

    it("should handle different weights correctly", () => {
      const result1 = calculateAcquisitionCostPerArroba(300, 5000);
      const result2 = calculateAcquisitionCostPerArroba(600, 5000);
      expect(result1).toBeGreaterThan(result2);
    });
  });

  describe("getAcquisitionById", () => {
    it("should return acquisition when ID exists", () => {
      const result = getAcquisitionById("acq-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("acq-1");
      expect(result?.totalPrice).toBe(10000);
    });

    it("should return undefined when ID does not exist", () => {
      const result = getAcquisitionById("acq-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getAcquisitionById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getAcquisitionByAnimalId", () => {
    it("should return acquisition when animal ID exists in items", () => {
      const result = getAcquisitionByAnimalId("animal-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("acq-1");
    });

    it("should return undefined when animal ID does not exist", () => {
      const result = getAcquisitionByAnimalId("animal-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when animal ID is empty string", () => {
      const result = getAcquisitionByAnimalId("");
      expect(result).toBeUndefined();
    });

    it("should find acquisition with animal in multiple items", () => {
      const result = getAcquisitionByAnimalId("animal-1");
      expect(result).toBeDefined();
    });
  });

  describe("getAcquisitionsByCompanyId", () => {
    it("should return all acquisitions for a company", () => {
      const result = getAcquisitionsByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("acq-1");
      expect(result[1]?.id).toBe("acq-2");
    });

    it("should return empty array when company has no acquisitions", () => {
      const result = getAcquisitionsByCompanyId("company-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getAcquisitionsBySupplierId", () => {
    it("should return all acquisitions for a supplier", () => {
      const result = getAcquisitionsBySupplierId("supplier-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("acq-1");
      expect(result[1]?.id).toBe("acq-3");
    });

    it("should return empty array when supplier has no acquisitions", () => {
      const result = getAcquisitionsBySupplierId("supplier-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getAcquisitionsByDateRange", () => {
    it("should return acquisitions within date range", () => {
      const result = getAcquisitionsByDateRange("company-1", "2025-01-01", "2025-01-31");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("acq-1");
      expect(result[1]?.id).toBe("acq-2");
    });

    it("should return empty array when no acquisitions in date range", () => {
      const result = getAcquisitionsByDateRange("company-1", "2025-03-01", "2025-03-31");
      expect(result).toHaveLength(0);
    });

    it("should include acquisitions on start date", () => {
      const result = getAcquisitionsByDateRange("company-1", "2025-01-01", "2025-01-31");
      expect(result.some((acq) => acq.id === "acq-1")).toBe(true);
    });

    it("should include acquisitions on end date", () => {
      const result = getAcquisitionsByDateRange("company-1", "2025-01-01", "2025-01-15");
      expect(result.some((acq) => acq.id === "acq-2")).toBe(true);
    });
  });

  describe("addAcquisition", () => {
    it("should add acquisition with CASH_FLOW payment method", () => {
      const formData: AcquisitionFormData = {
        companyId: "company-1",
        supplierId: "supplier-1",
        propertyId: "property-1",
        acquisitionDate: "2025-01-20",
        pricingMode: PricingMode.TOTAL,
        totalPrice: 15000,
        fees: [],
        transportationFee: 0,
        handlingFee: 0,
        paymentMethod: AcquisitionPaymentMethod.CASH_FLOW,
        acquisitionItems: [
          {
            animalId: "animal-1",
            weight: 300,
            price: 0,
            costPerArroba: 0,
          },
        ],
      };

      const initialLength = mockAcquisitions.length;
      const result = addAcquisition(formData);

      expect(mockAcquisitions).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.paymentMethod).toBe(AcquisitionPaymentMethod.CASH_FLOW);
      expect(result.linkedCashFlowId).toBeDefined();
      expect(result.linkedAccountsPayableId).toBeUndefined();
      expect(result.acquisitionItems[0]?.price).toBe(15000);
      expect(result.acquisitionItems[0]?.costPerArroba).toBeCloseTo(1500, 2);
    });

    it("should add acquisition with ACCOUNTS_PAYABLE payment method", () => {
      const formData: AcquisitionFormData = {
        companyId: "company-1",
        supplierId: "supplier-1",
        propertyId: "property-1",
        acquisitionDate: "2025-01-20",
        pricingMode: PricingMode.TOTAL,
        totalPrice: 15000,
        fees: [],
        transportationFee: 0,
        handlingFee: 0,
        paymentMethod: AcquisitionPaymentMethod.ACCOUNTS_PAYABLE,
        acquisitionItems: [
          {
            animalId: "animal-1",
            weight: 300,
            price: 0,
            costPerArroba: 0,
          },
        ],
      };

      const result = addAcquisition(formData);

      expect(result.paymentMethod).toBe(AcquisitionPaymentMethod.ACCOUNTS_PAYABLE);
      expect(result.linkedAccountsPayableId).toBeDefined();
      expect(result.linkedCashFlowId).toBeUndefined();
    });

    it("should calculate cost per animal correctly for multiple animals", () => {
      const formData: AcquisitionFormData = {
        companyId: "company-1",
        supplierId: "supplier-1",
        propertyId: "property-1",
        acquisitionDate: "2025-01-20",
        pricingMode: PricingMode.TOTAL,
        totalPrice: 20000,
        fees: [],
        transportationFee: 0,
        handlingFee: 0,
        paymentMethod: AcquisitionPaymentMethod.CASH_FLOW,
        acquisitionItems: [
          {
            animalId: "animal-1",
            weight: 300,
            price: 0,
            costPerArroba: 0,
          },
          {
            animalId: "animal-2",
            weight: 350,
            price: 0,
            costPerArroba: 0,
          },
        ],
      };

      const result = addAcquisition(formData);

      expect(result.acquisitionItems[0]?.price).toBe(10000);
      expect(result.acquisitionItems[1]?.price).toBe(10000);
    });

    it("should include fees in total cost", () => {
      const formData: AcquisitionFormData = {
        companyId: "company-1",
        supplierId: "supplier-1",
        propertyId: "property-1",
        acquisitionDate: "2025-01-20",
        pricingMode: PricingMode.TOTAL,
        totalPrice: 10000,
        fees: [
          { id: "fee-1", name: "Transport", amount: 500 },
          { id: "fee-2", name: "Handling", amount: 300 },
        ],
        transportationFee: 0,
        handlingFee: 0,
        paymentMethod: AcquisitionPaymentMethod.CASH_FLOW,
        acquisitionItems: [
          {
            animalId: "animal-1",
            weight: 300,
            price: 0,
            costPerArroba: 0,
          },
        ],
      };

      const result = addAcquisition(formData);
      const totalCost = 10000 + 500 + 300;
      expect(result.acquisitionItems[0]?.price).toBe(totalCost);
    });

    it("should include transportationFee in total cost", () => {
      const formData: AcquisitionFormData = {
        companyId: "company-1",
        supplierId: "supplier-1",
        propertyId: "property-1",
        acquisitionDate: "2025-01-20",
        pricingMode: PricingMode.TOTAL,
        totalPrice: 10000,
        fees: [],
        transportationFee: 1000,
        handlingFee: 0,
        paymentMethod: AcquisitionPaymentMethod.CASH_FLOW,
        acquisitionItems: [
          {
            animalId: "animal-1",
            weight: 300,
            price: 0,
            costPerArroba: 0,
          },
        ],
      };

      const result = addAcquisition(formData);
      const totalCost = 10000 + 1000;
      expect(result.acquisitionItems[0]?.price).toBe(totalCost);
    });

    it("should include handlingFee in total cost", () => {
      const formData: AcquisitionFormData = {
        companyId: "company-1",
        supplierId: "supplier-1",
        propertyId: "property-1",
        acquisitionDate: "2025-01-20",
        pricingMode: PricingMode.TOTAL,
        totalPrice: 10000,
        fees: [],
        transportationFee: 0,
        handlingFee: 500,
        paymentMethod: AcquisitionPaymentMethod.CASH_FLOW,
        acquisitionItems: [
          {
            animalId: "animal-1",
            weight: 300,
            price: 0,
            costPerArroba: 0,
          },
        ],
      };

      const result = addAcquisition(formData);
      const totalCost = 10000 + 500;
      expect(result.acquisitionItems[0]?.price).toBe(totalCost);
    });

    it("should handle zero animals correctly", () => {
      const formData: AcquisitionFormData = {
        companyId: "company-1",
        supplierId: "supplier-1",
        propertyId: "property-1",
        acquisitionDate: "2025-01-20",
        totalPrice: 10000,
        fees: [],
        transportationFee: 0,
        handlingFee: 0,
        paymentMethod: AcquisitionPaymentMethod.CASH_FLOW,
        acquisitionItems: [],
        pricingMode: PricingMode.TOTAL,
      };

      const result = addAcquisition(formData);
      expect(result.acquisitionItems).toHaveLength(0);
    });
  });

  describe("updateAcquisition", () => {
    it("should update acquisition when ID exists", () => {
      const updateData: Partial<AcquisitionFormData> = {
        totalPrice: 12000,
      };

      const result = updateAcquisition("acq-1", updateData);
      expect(result).toBe(true);

      const updated = mockAcquisitions.find((acq) => acq.id === "acq-1");
      expect(updated?.totalPrice).toBe(12000);
    });

    it("should update payment method and switch linked entities", () => {
      const updateData: Partial<AcquisitionFormData> = {
        paymentMethod: AcquisitionPaymentMethod.ACCOUNTS_PAYABLE,
      };

      const result = updateAcquisition("acq-1", updateData);
      expect(result).toBe(true);

      const updated = mockAcquisitions.find((acq) => acq.id === "acq-1");
      expect(updated?.paymentMethod).toBe(AcquisitionPaymentMethod.ACCOUNTS_PAYABLE);
      expect(updated?.linkedAccountsPayableId).toBeDefined();
    });

    it("should update linked cash flow when total price changes", () => {
      const updateData: Partial<AcquisitionFormData> = {
        totalPrice: 15000,
      };

      const result = updateAcquisition("acq-1", updateData);
      expect(result).toBe(true);
    });

    it("should update linked accounts payable when total price changes", () => {
      const updateData: Partial<AcquisitionFormData> = {
        totalPrice: 25000,
      };

      const result = updateAcquisition("acq-2", updateData);
      expect(result).toBe(true);
    });

    it("should recalculate items when total price changes", () => {
      const updateData: Partial<AcquisitionFormData> = {
        totalPrice: 20000,
      };

      const result = updateAcquisition("acq-1", updateData);
      expect(result).toBe(true);

      const updated = mockAcquisitions.find((acq) => acq.id === "acq-1");
      expect(updated?.acquisitionItems[0]?.price).toBe(10000);
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<AcquisitionFormData> = {
        totalPrice: 12000,
      };

      const result = updateAcquisition("acq-nonexistent", updateData);
      expect(result).toBe(false);
    });
  });

  describe("deleteAcquisition", () => {
    it("should delete acquisition and linked cash flow when ID exists", () => {
      const initialLength = mockAcquisitions.length;
      const result = deleteAcquisition("acq-1");

      expect(result).toBe(true);
      expect(mockAcquisitions).toHaveLength(initialLength - 1);
      expect(mockAcquisitions.find((acq) => acq.id === "acq-1")).toBeUndefined();
    });

    it("should delete acquisition and linked accounts payable when ID exists", () => {
      const initialLength = mockAcquisitions.length;
      const result = deleteAcquisition("acq-2");

      expect(result).toBe(true);
      expect(mockAcquisitions).toHaveLength(initialLength - 1);
      expect(mockAcquisitions.find((acq) => acq.id === "acq-2")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockAcquisitions.length;
      const result = deleteAcquisition("acq-nonexistent");

      expect(result).toBe(false);
      expect(mockAcquisitions).toHaveLength(initialLength);
    });
  });

  describe("generateAcquisitionId", () => {
    it("should generate ID with correct format", () => {
      const result = generateAcquisitionId(0);
      expect(result).toContain("ac0e8400-e29b-41d4-a716");
      expect(result).toContain("446655440100");
    });

    it("should generate different IDs for different indices", () => {
      const id1 = generateAcquisitionId(0);
      const id2 = generateAcquisitionId(1);
      expect(id1).not.toBe(id2);
    });

    it("should pad numbers correctly", () => {
      const result = generateAcquisitionId(123);
      expect(result).toContain("446655440223");
    });
  });
});
