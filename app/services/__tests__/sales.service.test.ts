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
import { PricingMode, SalePaymentMethod, SaleType } from "~/types";

const { mockSalesData } = vi.hoisted(() => {
  const mockSalesData = [
    {
      id: "sale-1",
      companyId: "company-1",
      buyerId: "buyer-1",
      propertyId: "property-1",
      saleDate: "2024-01-15",
      saleType: "other_farm" as const,
      paymentMethod: "cash_flow",
      totalPrice: 5000,
      fees: 100,
      transportationFee: 50,
      additionalFees: 25,
      saleItems: [{ animalId: "animal-1", weight: 500, price: 10 }],
      linkedCashFlowId: "cf-1",
    },
    {
      id: "sale-2",
      companyId: "company-1",
      buyerId: "buyer-2",
      propertyId: "property-1",
      saleDate: "2024-02-15",
      saleType: "auction",
      paymentMethod: "accounts_receivable",
      totalPrice: 3000,
      saleItems: [{ animalId: "animal-2", weight: 300, price: 10 }],
      linkedAccountsReceivableId: "ar-1",
    },
  ];
  return { mockSalesData };
});

vi.mock("~/mocks/sales", () => {
  // Return the same array reference so the service uses it
  return {
    get mockSales() {
      return mockSalesData;
    },
  };
});

const { mockUpdateAnimal } = vi.hoisted(() => ({
  mockUpdateAnimal: vi.fn(),
}));

vi.mock("../animals.service", () => ({
  getAnimalById: vi.fn(),
  updateAnimal: mockUpdateAnimal,
  getAnimalsByCompanyId: vi.fn(),
}));

vi.mock("../cash-flow.service", () => ({
  addCashFlow: vi.fn(),
  updateCashFlow: vi.fn(),
  deleteCashFlow: vi.fn(),
}));

const { mockDeleteAccountsReceivable } = vi.hoisted(() => ({
  mockDeleteAccountsReceivable: vi.fn(),
}));

vi.mock("../accounts-receivable.service", () => ({
  addAccountsReceivable: vi.fn(),
  updateAccountsReceivable: vi.fn(),
  deleteAccountsReceivable: mockDeleteAccountsReceivable,
}));

vi.mock("~/utils/fees", () => ({
  getTotalFees: vi.fn(
    (fees: number | undefined, transport: number | undefined, additional: number | undefined) =>
      (fees || 0) + (transport || 0) + (additional || 0)
  ),
}));

import { mockSales } from "~/mocks/sales";
import { getAnimalById, updateAnimal } from "../animals.service";
import { addCashFlow, updateCashFlow, deleteCashFlow } from "../cash-flow.service";
import { addAccountsReceivable, deleteAccountsReceivable } from "../accounts-receivable.service";
import * as salesService from "../sales.service";

describe("sales.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSaleById", () => {
    it("should find sale by id", () => {
      const result = getSaleById("sale-1");
      expect(result).toEqual(mockSales[0]);
    });

    it("should return undefined when not found", () => {
      const result = getSaleById("nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("getSalesByCompanyId", () => {
    it("should find sales by company id", () => {
      const result = getSalesByCompanyId("company-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("getSalesByBuyerId", () => {
    it("should find sales by buyer id", () => {
      const result = getSalesByBuyerId("buyer-1");
      expect(result).toHaveLength(1);
      expect(result[0].buyerId).toBe("buyer-1");
    });
  });

  describe("getSalesByAnimalId", () => {
    it("should find sales by animal id", () => {
      const result = getSalesByAnimalId("animal-1");
      expect(result).toHaveLength(1);
    });

    it("should return empty array when animal id is empty", () => {
      const result = getSalesByAnimalId("");
      expect(result).toEqual([]);
    });
  });

  describe("isAnimalSold", () => {
    it("should return true when animal status is sold", async () => {
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      getAnimal.mockResolvedValue({ id: "animal-1", status: "sold" });

      const result = await isAnimalSold("animal-1");
      expect(result).toBe(true);
    });

    it("should return false when animal status is active", async () => {
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      getAnimal.mockResolvedValue({ id: "animal-1", status: "active" });

      const result = await isAnimalSold("animal-1");
      expect(result).toBe(false);
    });

    it("should return false when animal id is empty", async () => {
      const result = await isAnimalSold("");
      expect(result).toBe(false);
    });

    it("should return false when animal not found", async () => {
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      getAnimal.mockResolvedValue(undefined);

      const result = await isAnimalSold("nonexistent");
      expect(result).toBe(false);
    });
  });

  describe("getSalesByDateRange", () => {
    it("should find sales within date range", () => {
      const result = getSalesByDateRange("company-1", "2024-01-01", "2024-01-31");
      expect(result).toHaveLength(1);
      expect(result[0].saleDate).toBe("2024-01-15");
    });

    it("should return empty array when no sales in range", () => {
      const result = getSalesByDateRange("company-1", "2024-03-01", "2024-03-31");
      expect(result).toEqual([]);
    });
  });

  describe("getSalesBySaleType", () => {
    it("should find sales by sale type", () => {
      const result = getSalesBySaleType("company-1", "other_farm");
      expect(result).toHaveLength(1);
      expect(result[0].saleType).toBe("other_farm");
    });
  });

  describe("addSale", () => {
    it("should create sale with cash flow payment method", async () => {
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const addCash = addCashFlow as ReturnType<typeof vi.fn>;
      const updateAnimalMock = updateAnimal as ReturnType<typeof vi.fn>;
      getAnimal.mockResolvedValue({ id: "animal-3", code: "003", status: "active" });
      addCash.mockResolvedValue({ id: "cf-new" });
      updateAnimalMock.mockResolvedValue({ id: "animal-3", status: "sold" } as never);

      const formData = {
        companyId: "company-1",
        buyerId: "buyer-1",
        propertyId: "property-1",
        saleDate: "2024-03-01",
        saleType: SaleType.OTHER_FARM,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        totalPrice: 4000,
        fees: [],
        transportationFee: 50,
        additionalFees: 25,
        saleItems: [{ animalId: "animal-3", weight: 400, price: 10 }],
        propertyIds: [],
      };

      const result = await addSale(formData);

      expect(result.id).toBeDefined();
      expect(result.linkedCashFlowId).toBe("cf-new");
      expect(updateAnimalMock).toHaveBeenCalledWith("animal-3", { status: "sold" });
      expect(addCash).toHaveBeenCalled();
    });

    it("should create sale with accounts receivable payment method", async () => {
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const addAR = addAccountsReceivable as ReturnType<typeof vi.fn>;
      const updateAnimalMock = updateAnimal as ReturnType<typeof vi.fn>;
      getAnimal.mockResolvedValue({ id: "animal-4", code: "004", status: "active" });
      addAR.mockResolvedValue({ id: "ar-new" });
      updateAnimalMock.mockResolvedValue({ id: "animal-4", status: "sold" } as never);

      const formData = {
        companyId: "company-1",
        buyerId: "buyer-1",
        propertyId: "property-1",
        saleDate: "2024-03-01",
        saleType: SaleType.OTHER_FARM,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.ACCOUNTS_RECEIVABLE,
        totalPrice: 4000,
        fees: [],
        saleItems: [{ animalId: "animal-4", weight: 400, price: 10 }],
        propertyIds: [],
      };

      const result = await addSale(formData);

      expect(result.linkedAccountsReceivableId).toBe("ar-new");
      expect(addAR).toHaveBeenCalled();
    });
  });

  describe("updateSale", () => {
    it("should update sale without changing payment method", async () => {
      const getSale = vi.spyOn(salesService, "getSaleById");
      getSale.mockReturnValue(mockSales[0]);

      const updateData = { totalPrice: 6000 };
      const result = await updateSale("sale-1", updateData);

      expect(result).toBe(true);
      expect(updateCashFlow).toHaveBeenCalled();
    });

    it("should update sale and change payment method", async () => {
      const getSale = vi.spyOn(salesService, "getSaleById");
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const addCash = addCashFlow as ReturnType<typeof vi.fn>;

      getSale.mockReturnValue(mockSales[1]); // Has accounts_receivable
      getAnimal.mockResolvedValue({ id: "animal-2", code: "002" });
      addCash.mockReturnValue({ id: "cf-new" });

      const updateData = {
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        totalPrice: 4000,
      };

      const result = await updateSale("sale-2", updateData);

      expect(result).toBe(true);
      expect(deleteAccountsReceivable).toHaveBeenCalledWith("ar-1");
      expect(addCash).toHaveBeenCalled();
    });

    it("should return false when sale not found", async () => {
      const getSale = vi.spyOn(salesService, "getSaleById");
      getSale.mockReturnValue(undefined);

      const result = await updateSale("nonexistent", { totalPrice: 1000 });
      expect(result).toBe(false);
    });

    it("should update animal statuses when sale items change", async () => {
      // Modify the mock sale to have two animals
      const originalSale = mockSales[0];
      mockSales[0] = {
        ...originalSale,
        saleItems: [
          { animalId: "animal-1", weight: 500, price: 10 },
          { animalId: "animal-2", weight: 400, price: 10 },
        ],
      };

      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      getAnimal.mockImplementation(async (id: string) => {
        if (id === "animal-1") return { id: "animal-1", status: "sold" };
        if (id === "animal-2") return { id: "animal-2", status: "sold" };
        return undefined;
      });

      const updateData = {
        saleItems: [{ animalId: "animal-1", weight: 500, price: 10 }], // Removed animal-2
      };

      await updateSale("sale-1", updateData);

      expect(mockUpdateAnimal).toHaveBeenCalledWith("animal-2", { status: "active" });

      // Restore original sale
      mockSales[0] = originalSale;
    });
  });

  describe("deleteSale", () => {
    it("should delete sale and restore animal statuses", async () => {
      const getSale = vi.spyOn(salesService, "getSaleById");
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const updateAnimalMock = updateAnimal as ReturnType<typeof vi.fn>;
      const deleteCashFlowMock = deleteCashFlow as ReturnType<typeof vi.fn>;
      getSale.mockReturnValue(mockSales[0]);
      getAnimal.mockResolvedValue({ id: "animal-1", code: "001", status: "sold" });
      updateAnimalMock.mockResolvedValue({ id: "animal-1", status: "active" } as never);
      deleteCashFlowMock.mockResolvedValue(undefined);

      const result = await deleteSale("sale-1");

      expect(result).toBe(true);
      expect(updateAnimalMock).toHaveBeenCalledWith("animal-1", { status: "active" });
      expect(deleteCashFlow).toHaveBeenCalledWith("cf-1");
    });

    it("should delete linked accounts receivable", async () => {
      // Ensure the sale has linkedAccountsReceivableId by adding it if it doesn't exist
      const sale = mockSales.find((s) => s.id === "sale-2");
      if (sale && !sale.linkedAccountsReceivableId) {
        sale.linkedAccountsReceivableId = "ar-1";
      }

      // Clear any previous calls
      mockDeleteAccountsReceivable.mockClear();

      const getSale = vi.spyOn(salesService, "getSaleById");
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const updateAnimalMock = updateAnimal as ReturnType<typeof vi.fn>;
      getSale.mockReturnValue(sale);
      getAnimal.mockResolvedValue({ id: "animal-2", code: "002", status: "sold" });
      updateAnimalMock.mockResolvedValue({ id: "animal-2", status: "active" } as never);
      mockDeleteAccountsReceivable.mockResolvedValue(undefined);

      const result = await deleteSale("sale-2");

      expect(result).toBe(true);
      // The imported deleteAccountsReceivable should be the same as our mock
      expect(deleteAccountsReceivable).toBe(mockDeleteAccountsReceivable);
      expect(mockDeleteAccountsReceivable).toHaveBeenCalledWith("ar-1");
    });

    it("should return false when sale not found", async () => {
      const getSale = vi.spyOn(salesService, "getSaleById");
      getSale.mockReturnValue(undefined);

      const result = await deleteSale("nonexistent");
      expect(result).toBe(false);
    });
  });

  describe("generateSaleId", () => {
    it("should generate sale id with correct format", () => {
      const result = generateSaleId(0);
      expect(result).toBe("sa0e8400-e29b-41d4-a716-446655440100");
    });

    it("should generate different ids for different indices", () => {
      const id1 = generateSaleId(0);
      const id2 = generateSaleId(1);
      expect(id1).not.toBe(id2);
    });
  });
});
