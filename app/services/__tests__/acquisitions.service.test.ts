import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAcquisitionById,
  getAcquisitionByAnimalId,
  getAcquisitionsByCompanyId,
  addAcquisition,
  updateAcquisition,
  deleteAcquisition,
  generateAcquisitionId,
} from "../acquisitions.service";
import { mockAcquisitions } from "~/mocks/acquisitions";
import type { AcquisitionFormData } from "~/types";
import { PricingMode, AcquisitionPaymentMethod } from "~/types";

const mockGetAnimalById = vi.fn();
const mockAddAnimal = vi.fn((data: Record<string, unknown>) => ({
  ...data,
  id: `animal-${Date.now()}`,
}));
const mockAddWeighing = vi.fn();
const mockAddCashFlow = vi.fn(() => ({ id: "cashflow-1" }));
const mockDeleteCashFlow = vi.fn(() => true);
const mockAddAccountsPayable = vi.fn(() => ({ id: "ap-1" }));
const mockDeleteAccountsPayable = vi.fn(() => true);

vi.mock("~/services/animals.service", () => ({
  getAnimalById: (...args: unknown[]) => mockGetAnimalById(...(args as [string])),
  addAnimal: (...args: unknown[]) => mockAddAnimal(...args),
}));

vi.mock("~/services/weighings.service", () => ({
  addWeighing: (...args: unknown[]) => mockAddWeighing(...args),
}));

vi.mock("~/services/cash-flow.service", () => ({
  addCashFlow: (...args: unknown[]) => mockAddCashFlow(...args),
  deleteCashFlow: (...args: unknown[]) => mockDeleteCashFlow(...args),
}));

vi.mock("~/services/accounts-payable.service", () => ({
  addAccountsPayable: (...args: unknown[]) => mockAddAccountsPayable(...args),
  deleteAccountsPayable: (...args: unknown[]) => mockDeleteAccountsPayable(...args),
}));

vi.mock("~/mocks/acquisitions", () => ({
  mockAcquisitions: [],
}));

describe("acquisitions.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAcquisitions.length = 0;
    mockAcquisitions.push(
      {
        id: "ac0e8400-e29b-41d4-a716-446655440100",
        companyId: "company-1",
        propertyId: "property-1",
        supplierId: "supplier-1",
        acquisitionDate: "2020-01-01",
        pricingMode: PricingMode.INDIVIDUAL,
        paymentMethod: AcquisitionPaymentMethod.CASH_FLOW,
        totalPrice: 5000,
        fees: [
          { id: "fee-1", name: "Transport", amount: 200 },
          { id: "fee-2", name: "Handling", amount: 100 },
        ],
        acquisitionItems: [
          {
            animalId: "animal-1",
            price: 2500,
            weight: 400,
            costPerArroba: 208.33,
          },
          {
            animalId: "animal-2",
            price: 2500,
            weight: 400,
            costPerArroba: 208.33,
          },
        ],
        linkedCashFlowId: "cashflow-1",
        createdAt: "2020-01-01",
      },
      {
        id: "ac0e8400-e29b-41d4-a716-446655440101",
        companyId: "company-1",
        propertyId: "property-1",
        supplierId: "supplier-2",
        acquisitionDate: "2020-01-02",
        pricingMode: PricingMode.TOTAL,
        paymentMethod: AcquisitionPaymentMethod.ACCOUNTS_PAYABLE,
        totalPrice: 3000,
        fees: [],
        acquisitionItems: [
          {
            animalId: "animal-3",
            price: 3000,
            weight: 350,
            costPerArroba: 285.71,
          },
        ],
        linkedAccountsPayableId: "ap-1",
        createdAt: "2020-01-02",
      }
    );
  });

  describe("getAcquisitionById", () => {
    it("should return acquisition when ID exists", () => {
      const result = getAcquisitionById("ac0e8400-e29b-41d4-a716-446655440100");
      expect(result).toBeDefined();
      expect(result?.supplierId).toBe("supplier-1");
      expect(result?.acquisitionItems).toHaveLength(2);
    });

    it("should return undefined when ID does not exist", () => {
      const result = getAcquisitionById("nonexistent-id");
      expect(result).toBeUndefined();
    });
  });

  describe("getAcquisitionByAnimalId", () => {
    it("should return acquisition for specific animal", () => {
      const result = getAcquisitionByAnimalId("animal-1");
      expect(result).toBeDefined();
      expect(result?.acquisitionItems.some((item) => item.animalId === "animal-1")).toBe(true);
    });

    it("should return undefined when animal has no acquisition", () => {
      const result = getAcquisitionByAnimalId("nonexistent-animal");
      expect(result).toBeUndefined();
    });
  });

  describe("getAcquisitionsByCompanyId", () => {
    it("should return acquisitions for specific company", () => {
      const result = getAcquisitionsByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result.every((acquisition) => acquisition.companyId === "company-1")).toBe(true);
    });
  });

  describe("addAcquisition", () => {
    beforeEach(() => {
      mockGetAnimalById.mockReturnValue({
        id: "animal-new",
        code: "A001",
        companyId: "company-1",
        propertyId: "property-1",
        status: "active",
      });
    });

    it("should add new acquisition with fees", () => {
      const formData: AcquisitionFormData = {
        companyId: "company-1",
        propertyId: "property-1",
        supplierId: "supplier-1",
        acquisitionDate: "2020-03-01",
        pricingMode: PricingMode.INDIVIDUAL,
        paymentMethod: AcquisitionPaymentMethod.CASH_FLOW,
        totalPrice: 4000,
        fees: [
          { id: "fee-1", name: "Transport", amount: 150 },
          { id: "fee-2", name: "Handling", amount: 50 },
        ],
        acquisitionItems: [
          {
            animalId: "animal-new",
            price: 2000,
            weight: 400,
            costPerArroba: 166.67,
          },
        ],
      };

      const initialLength = mockAcquisitions.length;
      const result = addAcquisition(formData);

      expect(mockAcquisitions).toHaveLength(initialLength + 1);
      expect(result.supplierId).toBe("supplier-1");
      expect(result.fees).toHaveLength(2);
      expect(result.linkedCashFlowId).toBeDefined();
    });

    it("should add new acquisition with accounts payable", () => {
      const formData: AcquisitionFormData = {
        companyId: "company-1",
        propertyId: "property-1",
        supplierId: "supplier-1",
        acquisitionDate: "2020-03-01",
        pricingMode: PricingMode.TOTAL,
        paymentMethod: AcquisitionPaymentMethod.ACCOUNTS_PAYABLE,
        totalPrice: 3000,
        fees: [],
        acquisitionItems: [
          {
            animalId: "animal-new",
            price: 3000,
            weight: 350,
            costPerArroba: 285.71,
          },
        ],
      };

      const result = addAcquisition(formData);

      expect(result.linkedAccountsPayableId).toBeDefined();
      expect(result.linkedCashFlowId).toBeUndefined();
    });
  });

  describe("updateAcquisition", () => {
    it("should update existing acquisition", () => {
      const result = updateAcquisition("ac0e8400-e29b-41d4-a716-446655440100", {
        acquisitionDate: "2020-01-15",
      });

      expect(result).toBe(true);
      const updated = mockAcquisitions.find((a) => a.id === "ac0e8400-e29b-41d4-a716-446655440100");
      expect(updated?.acquisitionDate).toBe("2020-01-15");
    });

    it("should return false when acquisition does not exist", () => {
      const result = updateAcquisition("nonexistent-id", { acquisitionDate: "2020-01-15" });
      expect(result).toBe(false);
    });
  });

  describe("deleteAcquisition", () => {
    it("should delete existing acquisition", () => {
      const initialLength = mockAcquisitions.length;
      const result = deleteAcquisition("ac0e8400-e29b-41d4-a716-446655440100");

      expect(result).toBe(true);
      expect(mockAcquisitions).toHaveLength(initialLength - 1);
    });

    it("should return false when acquisition does not exist", () => {
      const result = deleteAcquisition("nonexistent-id");
      expect(result).toBe(false);
    });
  });

  describe("generateAcquisitionId", () => {
    it("should generate acquisition ID with correct format", () => {
      const result = generateAcquisitionId(0);
      expect(result).toBe("ac0e8400-e29b-41d4-a716-446655440100");
    });

    it("should generate sequential IDs", () => {
      const id1 = generateAcquisitionId(0);
      const id2 = generateAcquisitionId(1);
      expect(id1).not.toBe(id2);
    });
  });
});
