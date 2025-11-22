import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getSaleById,
  getSalesByCompanyId,
  getSalesByBuyerId,
  getSalesByAnimalId,
  getSalesByDateRange,
  getSalesBySaleType,
  isAnimalSold,
  addSale,
  updateSale,
  deleteSale,
} from "../sales.service";
import { mockSales } from "~/mocks/sales";
import type { SaleFormData } from "~/types";
import { SaleType, PricingMode, SalePaymentMethod } from "~/types";

vi.mock("~/mocks/sales", () => ({
  mockSales: [],
}));

const mockUpdateAnimal = vi.fn();
const mockAddCashFlow = vi.fn(() => ({ id: "cashflow-1" }));
const mockDeleteCashFlow = vi.fn(() => true);
const mockUpdateCashFlow = vi.fn(() => true);
const mockAddAccountsReceivable = vi.fn(() => ({ id: "ar-1" }));
const mockDeleteAccountsReceivable = vi.fn(() => true);
const mockUpdateAccountsReceivable = vi.fn(() => true);

const mockGetAnimalById = vi.fn((id: string) => {
  if (id === "animal-1") {
    return { id: "animal-1", code: "A001", status: "active", companyId: "company-1" };
  }
  if (id === "animal-2") {
    return { id: "animal-2", code: "A002", status: "active", companyId: "company-1" };
  }
  if (id === "animal-3") {
    return { id: "animal-3", code: "A003", status: "active", companyId: "company-1" };
  }
  if (id === "animal-sold") {
    return { id: "animal-sold", code: "A004", status: "sold", companyId: "company-1" };
  }
  return undefined;
});

vi.mock("~/services/animals.service", () => ({
  getAnimalById: (...args: unknown[]) => mockGetAnimalById(...(args as [string])),
  updateAnimal: (...args: unknown[]) => mockUpdateAnimal(...args),
}));

vi.mock("~/services/cash-flow.service", () => ({
  addCashFlow: (...args: unknown[]) => mockAddCashFlow(...args),
  deleteCashFlow: (...args: unknown[]) => mockDeleteCashFlow(...args),
  updateCashFlow: (...args: unknown[]) => mockUpdateCashFlow(...args),
}));

vi.mock("~/services/accounts-receivable.service", () => ({
  addAccountsReceivable: (...args: unknown[]) => mockAddAccountsReceivable(...args),
  deleteAccountsReceivable: (...args: unknown[]) => mockDeleteAccountsReceivable(...args),
  updateAccountsReceivable: (...args: unknown[]) => mockUpdateAccountsReceivable(...args),
}));

describe("sales.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSales.length = 0;
    mockSales.push(
      {
        id: "sa0e8400-e29b-41d4-a716-446655440100",
        companyId: "company-1",
        buyerId: "buyer-1",
        propertyId: "property-1",
        saleDate: "2024-01-15",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.INDIVIDUAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        totalPrice: 5000,
        transportationFee: 200,
        additionalFees: 100,
        saleItems: [
          { animalId: "animal-1", price: 2500, weight: 400 },
          { animalId: "animal-2", price: 2500, weight: 400 },
        ],
        linkedCashFlowId: "cashflow-1",
        linkedAccountsReceivableId: undefined,
        observation: "Test sale 1",
        createdAt: "2024-01-15",
        updatedAt: "2024-01-15",
      },
      {
        id: "sa0e8400-e29b-41d4-a716-446655440101",
        companyId: "company-1",
        buyerId: "buyer-2",
        propertyId: "property-1",
        saleDate: "2024-02-20",
        saleType: SaleType.AUCTION,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.ACCOUNTS_RECEIVABLE,
        totalPrice: 3000,
        transportationFee: 0,
        additionalFees: 0,
        saleItems: [{ animalId: "animal-sold", price: 3000, weight: 350 }],
        linkedCashFlowId: undefined,
        linkedAccountsReceivableId: "ar-1",
        observation: "Test sale 2",
        createdAt: "2024-02-20",
        updatedAt: "2024-02-20",
      },
      {
        id: "sa0e8400-e29b-41d4-a716-446655440102",
        companyId: "company-2",
        buyerId: "buyer-1",
        propertyId: "property-2",
        saleDate: "2024-03-10",
        saleType: SaleType.OTHER_FARM,
        pricingMode: PricingMode.INDIVIDUAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        totalPrice: 2000,
        transportationFee: 100,
        additionalFees: 50,
        saleItems: [{ animalId: "animal-1", price: 2000, weight: 300 }],
        linkedCashFlowId: "cashflow-2",
        linkedAccountsReceivableId: undefined,
        observation: "Test sale 3",
        createdAt: "2024-03-10",
        updatedAt: "2024-03-10",
      }
    );
  });

  describe("getSaleById", () => {
    it("should return sale when ID exists", () => {
      const result = getSaleById("sa0e8400-e29b-41d4-a716-446655440100");
      expect(result).toBeDefined();
      expect(result?.buyerId).toBe("buyer-1");
      expect(result?.saleType).toBe(SaleType.SLAUGHTERHOUSE);
    });

    it("should return undefined when ID does not exist", () => {
      const result = getSaleById("nonexistent-id");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getSaleById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getSalesByCompanyId", () => {
    it("should return sales for specific company", () => {
      const result = getSalesByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result.every((sale) => sale.companyId === "company-1")).toBe(true);
    });

    it("should return empty array when company has no sales", () => {
      const result = getSalesByCompanyId("nonexistent-company");
      expect(result).toHaveLength(0);
    });
  });

  describe("getSalesByBuyerId", () => {
    it("should return sales for specific buyer", () => {
      const result = getSalesByBuyerId("buyer-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((sale) => sale.buyerId === "buyer-1")).toBe(true);
    });

    it("should return empty array when buyer has no sales", () => {
      const result = getSalesByBuyerId("nonexistent-buyer");
      expect(result).toHaveLength(0);
    });
  });

  describe("getSalesByAnimalId", () => {
    it("should return sales for specific animal", () => {
      const result = getSalesByAnimalId("animal-1");
      expect(result.length).toBeGreaterThan(0);
      expect(
        result.every((sale) => sale.saleItems.some((item) => item.animalId === "animal-1"))
      ).toBe(true);
    });

    it("should return empty array when animal has no sales", () => {
      const result = getSalesByAnimalId("nonexistent-animal");
      expect(result).toHaveLength(0);
    });

    it("should return empty array when animalId is empty", () => {
      const result = getSalesByAnimalId("");
      expect(result).toHaveLength(0);
    });
  });

  describe("getSalesByDateRange", () => {
    it("should return sales within date range", () => {
      const result = getSalesByDateRange("company-1", "2024-01-01", "2024-01-31");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((sale) => sale.companyId === "company-1")).toBe(true);
    });

    it("should return empty array when no sales in date range", () => {
      const result = getSalesByDateRange("company-1", "2025-01-01", "2025-01-31");
      expect(result).toHaveLength(0);
    });
  });

  describe("getSalesBySaleType", () => {
    it("should return sales for specific sale type", () => {
      const result = getSalesBySaleType("company-1", SaleType.SLAUGHTERHOUSE);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((sale) => sale.saleType === SaleType.SLAUGHTERHOUSE)).toBe(true);
    });

    it("should return empty array when no sales of that type", () => {
      const result = getSalesBySaleType("company-1", SaleType.OTHER_FARM);
      expect(result).toHaveLength(0);
    });
  });

  describe("isAnimalSold", () => {
    it("should return true when animal is sold", () => {
      const result = isAnimalSold("animal-sold");
      expect(result).toBe(true);
    });

    it("should return false when animal is active", () => {
      const result = isAnimalSold("animal-1");
      expect(result).toBe(false);
    });

    it("should return false when animalId is empty", () => {
      const result = isAnimalSold("");
      expect(result).toBe(false);
    });
  });

  describe("addSale", () => {
    it("should add new sale with cash flow payment", () => {
      const formData: SaleFormData = {
        companyId: "company-1",
        buyerId: "buyer-1",
        propertyId: "property-1",
        saleDate: "2024-04-01",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.INDIVIDUAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        totalPrice: 4000,
        transportationFee: 150,
        additionalFees: 50,
        saleItems: [
          { animalId: "animal-1", price: 2000, weight: 400 },
          { animalId: "animal-2", price: 2000, weight: 400 },
        ],
        observation: "New sale",
      };

      const initialLength = mockSales.length;
      const result = addSale(formData);

      expect(mockSales).toHaveLength(initialLength + 1);
      expect(result.companyId).toBe("company-1");
      expect(result.linkedCashFlowId).toBeDefined();
      expect(result.linkedAccountsReceivableId).toBeUndefined();
    });

    it("should add new sale with accounts receivable payment", () => {
      const formData: SaleFormData = {
        companyId: "company-1",
        buyerId: "buyer-1",
        propertyId: "property-1",
        saleDate: "2024-04-01",
        saleType: SaleType.AUCTION,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.ACCOUNTS_RECEIVABLE,
        totalPrice: 5000,
        transportationFee: 0,
        additionalFees: 0,
        saleItems: [{ animalId: "animal-1", price: 5000, weight: 400 }],
        observation: "New sale AR",
      };

      const result = addSale(formData);

      expect(result.linkedAccountsReceivableId).toBeDefined();
      expect(result.linkedCashFlowId).toBeUndefined();
    });

    it("should update animal status to sold when sale is created", () => {
      const formData: SaleFormData = {
        companyId: "company-1",
        buyerId: "buyer-1",
        propertyId: "property-1",
        saleDate: "2024-04-01",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.INDIVIDUAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        totalPrice: 2000,
        saleItems: [{ animalId: "animal-1", price: 2000, weight: 400 }],
      };

      addSale(formData);

      expect(mockUpdateAnimal).toHaveBeenCalledWith("animal-1", { status: "sold" });
    });
  });

  describe("updateSale", () => {
    it("should update existing sale", () => {
      const result = updateSale("sa0e8400-e29b-41d4-a716-446655440100", {
        observation: "Updated observation",
      });

      expect(result).toBe(true);
      const updated = mockSales.find((s) => s.id === "sa0e8400-e29b-41d4-a716-446655440100");
      expect(updated?.observation).toBe("Updated observation");
    });

    it("should return false when sale does not exist", () => {
      const result = updateSale("nonexistent-id", { observation: "Test" });
      expect(result).toBe(false);
    });

    it("should revert animal status when animal is removed from sale", () => {
      const sale = mockSales[0];
      const newSaleItems = sale.saleItems.slice(0, 1); // Remove one animal

      updateSale(sale.id, { saleItems: newSaleItems });

      expect(mockUpdateAnimal).toHaveBeenCalledWith("animal-2", { status: "active" });
    });

    it("should update animal status to sold when animal is added to sale", () => {
      const sale = mockSales[0];
      // Add a new animal that's not already in the sale
      const newSaleItems = [...sale.saleItems, { animalId: "animal-3", price: 1500, weight: 350 }];

      updateSale(sale.id, { saleItems: newSaleItems });

      // Should update the newly added animal
      expect(mockUpdateAnimal).toHaveBeenCalledWith("animal-3", { status: "sold" });
    });

    it("should change payment method from cash flow to accounts receivable", () => {
      const sale = mockSales[0]; // Has cash flow

      updateSale(sale.id, { paymentMethod: SalePaymentMethod.ACCOUNTS_RECEIVABLE });

      expect(mockDeleteCashFlow).toHaveBeenCalledWith(sale.linkedCashFlowId);
      expect(mockAddAccountsReceivable).toHaveBeenCalled();
    });

    it("should change payment method from accounts receivable to cash flow", () => {
      const sale = mockSales[1]; // Has accounts receivable

      updateSale(sale.id, { paymentMethod: SalePaymentMethod.CASH_FLOW });

      expect(mockDeleteAccountsReceivable).toHaveBeenCalledWith(sale.linkedAccountsReceivableId);
      expect(mockAddCashFlow).toHaveBeenCalled();
    });

    it("should update financial record amount when total price changes", () => {
      const sale = mockSales[0]; // Has cash flow

      updateSale(sale.id, { totalPrice: 6000 });

      expect(mockUpdateCashFlow).toHaveBeenCalledWith(sale.linkedCashFlowId, { amount: 6300 }); // 6000 + 200 + 100
    });
  });

  describe("deleteSale", () => {
    it("should delete existing sale", () => {
      const initialLength = mockSales.length;
      const result = deleteSale("sa0e8400-e29b-41d4-a716-446655440100");

      expect(result).toBe(true);
      expect(mockSales).toHaveLength(initialLength - 1);
    });

    it("should return false when sale does not exist", () => {
      const result = deleteSale("nonexistent-id");
      expect(result).toBe(false);
    });

    it("should revert animal status to active when sale is deleted", () => {
      const sale = mockSales[0];

      deleteSale(sale.id);

      expect(mockUpdateAnimal).toHaveBeenCalledWith("animal-1", { status: "active" });
      expect(mockUpdateAnimal).toHaveBeenCalledWith("animal-2", { status: "active" });
    });

    it("should delete linked cash flow when sale is deleted", () => {
      const sale = mockSales[0]; // Has cash flow

      deleteSale(sale.id);

      expect(mockDeleteCashFlow).toHaveBeenCalledWith(sale.linkedCashFlowId);
    });

    it("should delete linked accounts receivable when sale is deleted", () => {
      const sale = mockSales[1]; // Has accounts receivable

      deleteSale(sale.id);

      expect(mockDeleteAccountsReceivable).toHaveBeenCalledWith(sale.linkedAccountsReceivableId);
    });
  });
});
