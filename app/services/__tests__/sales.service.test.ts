import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getSaleById,
  getSalesByCompanyId,
  getSalesByBuyerId,
  getSalesByAnimalId,
  isAnimalSold,
  getSalesByDateRange,
  getSalesBySaleType,
  addSale,
  updateSale,
  deleteSale,
  generateSaleId,
} from "../sales.service";
import { mockSales } from "~/mocks/sales";
import { mockAnimals } from "~/mocks/animals";
import type { SaleFormData } from "~/types";
import { SaleType, SalePaymentMethod, PricingMode } from "~/types";

// Mock dependencies
vi.mock("../animals.service", () => ({
  getAnimalById: vi.fn((id: string) => mockAnimals.find((a) => a.id === id)),
  updateAnimal: vi.fn(),
}));

vi.mock("../cash-flow.service", () => ({
  addCashFlow: vi.fn((data: unknown) => ({
    id: "cashflow-1",
    ...(data as Record<string, unknown>),
  })),
  deleteCashFlow: vi.fn(),
  updateCashFlow: vi.fn(),
}));

vi.mock("../accounts-receivable.service", () => ({
  addAccountsReceivable: vi.fn((data: unknown) => ({
    id: "ar-1",
    ...(data as Record<string, unknown>),
  })),
  deleteAccountsReceivable: vi.fn(),
  updateAccountsReceivable: vi.fn(),
}));

vi.mock("~/utils/fees", () => ({
  getTotalFees: vi.fn(() => 100),
}));

describe("sales.service", () => {
  beforeEach(() => {
    mockSales.length = 0;
    mockAnimals.length = 0;

    mockAnimals.push(
      {
        id: "animal-1",
        companyId: "company-1",
        propertyId: "property-1",
        code: "ANM001",
        registrationNumber: "REG001",
        status: "active",
        createdAt: "2025-01-01",
      },
      {
        id: "animal-2",
        companyId: "company-1",
        propertyId: "property-1",
        code: "ANM002",
        registrationNumber: "REG002",
        status: "active",
        createdAt: "2025-01-01",
      }
    );

    mockSales.push(
      {
        id: "sale-1",
        companyId: "company-1",
        propertyId: "property-1",
        buyerId: "buyer-1",
        saleDate: "2025-01-15",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        totalPrice: 1000,
        saleItems: [{ animalId: "animal-1", price: 500, weight: 100 }],
        linkedCashFlowId: "cashflow-1",
        createdAt: "2025-01-15",
      },
      {
        id: "sale-2",
        companyId: "company-1",
        propertyId: "property-1",
        buyerId: "buyer-2",
        saleDate: "2025-01-20",
        saleType: SaleType.AUCTION,
        pricingMode: PricingMode.INDIVIDUAL,
        paymentMethod: SalePaymentMethod.ACCOUNTS_RECEIVABLE,
        totalPrice: 2000,
        saleItems: [{ animalId: "animal-2", price: 2000, weight: 200 }],
        linkedAccountsReceivableId: "ar-1",
        createdAt: "2025-01-20",
      }
    );
  });

  describe("getSaleById", () => {
    it("should return sale when ID exists", () => {
      const result = getSaleById("sale-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("sale-1");
      expect(result?.totalPrice).toBe(1000);
    });

    it("should return undefined when ID does not exist", () => {
      const result = getSaleById("sale-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getSaleById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getSalesByCompanyId", () => {
    it("should return all sales for a company", () => {
      const result = getSalesByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result.every((s) => s.companyId === "company-1")).toBe(true);
    });

    it("should return empty array when company has no sales", () => {
      const result = getSalesByCompanyId("company-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getSalesByBuyerId", () => {
    it("should return all sales for a buyer", () => {
      const result = getSalesByBuyerId("buyer-1");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("sale-1");
    });

    it("should return empty array when buyer has no sales", () => {
      const result = getSalesByBuyerId("buyer-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getSalesByAnimalId", () => {
    it("should return sales containing the animal", () => {
      const result = getSalesByAnimalId("animal-1");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("sale-1");
    });

    it("should return empty array when animal has no sales", () => {
      const result = getSalesByAnimalId("animal-nonexistent");
      expect(result).toHaveLength(0);
    });

    it("should return empty array when animalId is empty", () => {
      const result = getSalesByAnimalId("");
      expect(result).toHaveLength(0);
    });
  });

  describe("isAnimalSold", () => {
    it("should return true when animal status is sold", () => {
      mockAnimals[0]!.status = "sold";
      const result = isAnimalSold("animal-1");
      expect(result).toBe(true);
    });

    it("should return false when animal status is active", () => {
      mockAnimals[0]!.status = "active";
      const result = isAnimalSold("animal-1");
      expect(result).toBe(false);
    });

    it("should return false when animal does not exist", () => {
      const result = isAnimalSold("animal-nonexistent");
      expect(result).toBe(false);
    });

    it("should return false when animalId is empty", () => {
      const result = isAnimalSold("");
      expect(result).toBe(false);
    });
  });

  describe("getSalesByDateRange", () => {
    it("should return sales within date range", () => {
      const result = getSalesByDateRange("company-1", "2025-01-10", "2025-01-25");
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no sales in range", () => {
      const result = getSalesByDateRange("company-1", "2025-02-01", "2025-02-28");
      expect(result).toHaveLength(0);
    });
  });

  describe("getSalesBySaleType", () => {
    it("should return sales of specific type", () => {
      const result = getSalesBySaleType("company-1", SaleType.SLAUGHTERHOUSE);
      expect(result).toHaveLength(1);
      expect(result[0]?.saleType).toBe(SaleType.SLAUGHTERHOUSE);
    });

    it("should return empty array when no sales of type", () => {
      const result = getSalesBySaleType("company-1", SaleType.OTHER_FARM);
      expect(result).toHaveLength(0);
    });
  });

  describe("addSale", () => {
    it("should add sale with cash flow payment method", () => {
      const formData: SaleFormData = {
        companyId: "company-1",
        propertyId: "property-1",
        buyerId: "buyer-1",
        saleDate: "2025-01-25",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        totalPrice: 1500,
        saleItems: [{ animalId: "animal-1", price: 1500, weight: 150 }],
      };

      const initialLength = mockSales.length;
      const result = addSale(formData);

      expect(mockSales).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.linkedCashFlowId).toBeDefined();
      expect(result.linkedAccountsReceivableId).toBeUndefined();
    });

    it("should add sale with accounts receivable payment method", () => {
      const formData: SaleFormData = {
        companyId: "company-1",
        propertyId: "property-1",
        buyerId: "buyer-1",
        saleDate: "2025-01-25",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.ACCOUNTS_RECEIVABLE,
        totalPrice: 1500,
        saleItems: [{ animalId: "animal-1", price: 1500, weight: 150 }],
      };

      const result = addSale(formData);
      expect(result.linkedAccountsReceivableId).toBeDefined();
      expect(result.linkedCashFlowId).toBeUndefined();
    });

    it("should update animal status to sold", async () => {
      const { updateAnimal } = await import("../animals.service");
      const formData: SaleFormData = {
        companyId: "company-1",
        propertyId: "property-1",
        buyerId: "buyer-1",
        saleDate: "2025-01-25",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        totalPrice: 1500,
        saleItems: [{ animalId: "animal-1", price: 1500, weight: 150 }],
      };

      addSale(formData);
      expect(updateAnimal).toHaveBeenCalledWith("animal-1", { status: "sold" });
    });
  });

  describe("updateSale", () => {
    it("should update sale when ID exists", () => {
      const updateData: Partial<SaleFormData> = {
        totalPrice: 1200,
      };

      const result = updateSale("sale-1", updateData);
      expect(result).toBe(true);

      const updated = mockSales.find((s) => s.id === "sale-1");
      expect(updated?.totalPrice).toBe(1200);
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<SaleFormData> = {
        totalPrice: 1200,
      };

      const result = updateSale("sale-nonexistent", updateData);
      expect(result).toBe(false);
    });

    it("should handle payment method change from cash flow to accounts receivable", async () => {
      const { deleteCashFlow } = await import("../cash-flow.service");
      const { addAccountsReceivable } = await import("../accounts-receivable.service");

      const updateData: Partial<SaleFormData> = {
        paymentMethod: SalePaymentMethod.ACCOUNTS_RECEIVABLE,
      };

      const result = updateSale("sale-1", updateData);
      expect(result).toBe(true);
      expect(deleteCashFlow).toHaveBeenCalled();
      expect(addAccountsReceivable).toHaveBeenCalled();
    });

    it("should update sale with new saleItems and update animal statuses", async () => {
      const { updateAnimal } = await import("../animals.service");

      // Clear previous calls
      vi.mocked(updateAnimal).mockClear();

      const updateData: Partial<SaleFormData> = {
        saleItems: [{ animalId: "animal-2", price: 600, weight: 120 }],
      };

      const result = updateSale("sale-1", updateData);
      expect(result).toBe(true);

      // updateAnimalStatuses is called with (previousIds, newIds, status)
      // First call: restore previous animals to active (animal-1 not in newIds, so restore)
      // Second call: set new animals to sold (animal-2 not in previousIds, so set to sold)
      expect(updateAnimal).toHaveBeenCalled();

      const updated = mockSales.find((s) => s.id === "sale-1");
      expect(updated?.saleItems).toHaveLength(1);
      expect(updated?.saleItems[0]?.animalId).toBe("animal-2");
    });
  });

  describe("deleteSale", () => {
    it("should delete sale and restore animal status", async () => {
      const { updateAnimal } = await import("../animals.service");
      const { deleteCashFlow } = await import("../cash-flow.service");

      const initialLength = mockSales.length;
      const result = deleteSale("sale-1");

      expect(result).toBe(true);
      expect(mockSales).toHaveLength(initialLength - 1);
      expect(updateAnimal).toHaveBeenCalledWith("animal-1", { status: "active" });
      expect(deleteCashFlow).toHaveBeenCalledWith("cashflow-1");
    });

    it("should delete sale with linkedAccountsReceivableId", async () => {
      const { updateAnimal } = await import("../animals.service");
      const { deleteAccountsReceivable } = await import("../accounts-receivable.service");

      const initialLength = mockSales.length;
      const result = deleteSale("sale-2");

      expect(result).toBe(true);
      expect(mockSales).toHaveLength(initialLength - 1);
      expect(updateAnimal).toHaveBeenCalled();
      expect(deleteAccountsReceivable).toHaveBeenCalled();
    });

    it("should return false when ID does not exist", () => {
      const result = deleteSale("sale-nonexistent");
      expect(result).toBe(false);
    });
  });

  describe("generateSaleId", () => {
    it("should generate ID with correct format", () => {
      const result = generateSaleId(0);
      expect(result).toContain("sa0e8400-e29b-41d4-a716");
      expect(result).toMatch(/sa0e8400-e29b-41d4-a716-\d{12}/);
    });

    it("should generate different IDs for different indices", () => {
      const id1 = generateSaleId(0);
      const id2 = generateSaleId(1);
      expect(id1).not.toBe(id2);
    });
  });
});
