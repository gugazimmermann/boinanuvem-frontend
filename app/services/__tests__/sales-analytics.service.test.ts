import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getSalesMetrics,
  getPricePerKg,
  getPricePerHead,
  getCarcassValue,
  getAverageAgeAtSale,
  getProfitabilityMetrics,
  getSalesByBuyer,
  getSalesByCategory,
} from "../sales-analytics.service";
import { mockSales } from "~/mocks/sales";
import { SaleType, PricingMode, SalePaymentMethod } from "~/types";

vi.mock("~/mocks/sales", () => ({
  mockSales: [],
}));

vi.mock("~/services/sales.service", () => ({
  getSalesByCompanyId: vi.fn((companyId: string) => {
    return mockSales.filter((sale) => sale.companyId === companyId);
  }),
  getSalesByBuyerId: vi.fn((buyerId: string) => {
    return mockSales.filter((sale) => sale.buyerId === buyerId);
  }),
}));

vi.mock("~/services/animals.service", () => ({
  getAnimalById: vi.fn((id: string) => {
    if (id === "animal-1") {
      return { id: "animal-1", code: "A001", status: "sold", companyId: "company-1" };
    }
    if (id === "animal-2") {
      return { id: "animal-2", code: "A002", status: "sold", companyId: "company-1" };
    }
    return undefined;
  }),
}));

vi.mock("~/services/births.service", () => ({
  getBirthByAnimalId: vi.fn((id: string) => {
    if (id === "animal-1") {
      return { id: "birth-1", animalId: "animal-1", birthDate: "2023-01-15" };
    }
    return null;
  }),
}));

vi.mock("~/services/acquisitions.service", () => ({
  getAcquisitionByAnimalId: vi.fn(() => null),
}));

vi.mock("~/utils/profitability", () => ({
  calculateAnimalProfitability: vi.fn(() => ({
    totalCost: 1000,
    salePrice: 2000,
    profit: 1000,
    profitMargin: 50,
    costPerKg: 2.5,
    pricePerKg: 5,
    roi: 100,
  })),
  calculateAggregatedProfitability: vi.fn(
    (profitabilities: Array<{ totalCost: number; salePrice: number }>) => {
      const totalCost = profitabilities.reduce(
        (sum: number, p: { totalCost: number }) => sum + p.totalCost,
        0
      );
      const totalSalePrice = profitabilities.reduce(
        (sum: number, p: { salePrice: number }) => sum + p.salePrice,
        0
      );
      const totalProfit = totalSalePrice - totalCost;
      return {
        totalCost,
        totalSalePrice,
        totalProfit,
        averageProfitMargin: profitabilities.length > 0 ? (totalProfit / totalSalePrice) * 100 : 0,
        averageCostPerKg: profitabilities.length > 0 ? totalCost / profitabilities.length : 0,
        averagePricePerKg: profitabilities.length > 0 ? totalSalePrice / profitabilities.length : 0,
        averageRoi: profitabilities.length > 0 ? (totalProfit / totalCost) * 100 : 0,
      };
    }
  ),
}));

describe("sales-analytics.service", () => {
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
          { animalId: "animal-1", price: 2500, weight: 400, carcassWeight: 240 },
          { animalId: "animal-2", price: 2500, weight: 400, carcassWeight: 240 },
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
        saleItems: [{ animalId: "animal-1", price: 3000, weight: 350 }],
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
        saleItems: [{ animalId: "animal-2", price: 2000, weight: 300 }],
        linkedCashFlowId: "cashflow-2",
        linkedAccountsReceivableId: undefined,
        observation: "Test sale 3",
        createdAt: "2024-03-10",
        updatedAt: "2024-03-10",
      }
    );
  });

  describe("getSalesMetrics", () => {
    it("should calculate metrics for all sales in company", () => {
      const metrics = getSalesMetrics("company-1");

      expect(metrics.totalSales).toBe(2);
      expect(metrics.totalRevenue).toBe(8300); // 5000+200+100 + 3000+0+0
      expect(metrics.totalAnimalsSold).toBe(3); // 2 + 1
    });

    it("should filter sales by date range", () => {
      const metrics = getSalesMetrics("company-1", {
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });

      expect(metrics.totalSales).toBe(1);
      expect(metrics.totalRevenue).toBe(5300); // 5000+200+100
    });

    it("should filter sales by buyer", () => {
      const metrics = getSalesMetrics("company-1", {
        buyerId: "buyer-1",
      });

      expect(metrics.totalSales).toBe(1);
    });

    it("should filter sales by sale type", () => {
      const metrics = getSalesMetrics("company-1", {
        saleType: SaleType.SLAUGHTERHOUSE,
      });

      expect(metrics.totalSales).toBe(1);
    });

    it("should filter sales by property", () => {
      const metrics = getSalesMetrics("company-1", {
        propertyId: "property-1",
      });

      expect(metrics.totalSales).toBe(2);
    });

    it("should calculate average price per kg", () => {
      const metrics = getSalesMetrics("company-1");
      // Total revenue: 8300, Total weight: 400+400+350 = 1150
      expect(metrics.averagePricePerKg).toBeCloseTo(8300 / 1150, 2);
    });

    it("should calculate average price per head", () => {
      const metrics = getSalesMetrics("company-1");
      // Total revenue: 8300, Total animals: 3
      expect(metrics.averagePricePerHead).toBeCloseTo(8300 / 3, 2);
    });

    it("should calculate average carcass value when available", () => {
      const metrics = getSalesMetrics("company-1");
      // Only first sale has carcass weights: 240 + 240 = 480, count = 2
      expect(metrics.averageCarcassValue).toBe(240);
    });

    it("should return undefined for average carcass value when no carcass weights", () => {
      const metrics = getSalesMetrics("company-1", {
        saleType: SaleType.AUCTION,
      });
      // Auction sale has no carcass weight
      expect(metrics.averageCarcassValue).toBeUndefined();
    });

    it("should calculate profitability metrics", () => {
      const metrics = getSalesMetrics("company-1");
      expect(metrics.profitability).toBeDefined();
      expect(metrics.profitability.totalCost).toBeGreaterThan(0);
      expect(metrics.profitability.totalSalePrice).toBeGreaterThan(0);
    });
  });

  describe("getPricePerKg", () => {
    it("should return average price per kg", () => {
      const price = getPricePerKg("company-1");
      expect(price).toBeGreaterThan(0);
    });

    it("should return 0 when no sales", () => {
      const price = getPricePerKg("nonexistent-company");
      expect(price).toBe(0);
    });
  });

  describe("getPricePerHead", () => {
    it("should return average price per head", () => {
      const price = getPricePerHead("company-1");
      expect(price).toBeGreaterThan(0);
    });

    it("should return 0 when no sales", () => {
      const price = getPricePerHead("nonexistent-company");
      expect(price).toBe(0);
    });
  });

  describe("getCarcassValue", () => {
    it("should return average carcass value when available", () => {
      const value = getCarcassValue("company-1");
      expect(value).toBe(240);
    });

    it("should return undefined when no carcass weights", () => {
      const value = getCarcassValue("company-1", { saleType: SaleType.AUCTION });
      expect(value).toBeUndefined();
    });
  });

  describe("getAverageAgeAtSale", () => {
    it("should return average age at sale", () => {
      const age = getAverageAgeAtSale("company-1");
      expect(age).toBeGreaterThanOrEqual(0);
    });

    it("should return 0 when no sales with birth dates", () => {
      const age = getAverageAgeAtSale("nonexistent-company");
      expect(age).toBe(0);
    });
  });

  describe("getProfitabilityMetrics", () => {
    it("should return profitability metrics", () => {
      const metrics = getProfitabilityMetrics("company-1");
      expect(metrics).toBeDefined();
      expect(metrics.totalCost).toBeGreaterThan(0);
      expect(metrics.totalSalePrice).toBeGreaterThan(0);
    });
  });

  describe("getSalesByBuyer", () => {
    it("should return sales for specific buyer", () => {
      const sales = getSalesByBuyer("company-1", "buyer-1");
      expect(sales.length).toBeGreaterThan(0);
      expect(sales.every((sale) => sale.buyerId === "buyer-1")).toBe(true);
      expect(sales.every((sale) => sale.companyId === "company-1")).toBe(true);
    });

    it("should filter sales by date range", () => {
      const sales = getSalesByBuyer("company-1", "buyer-1", {
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });
      expect(sales.length).toBe(1);
    });

    it("should return empty array when buyer has no sales", () => {
      const sales = getSalesByBuyer("company-1", "nonexistent-buyer");
      expect(sales).toHaveLength(0);
    });
  });

  describe("getSalesByCategory", () => {
    it("should return sales for specific category", () => {
      const sales = getSalesByCategory("company-1", SaleType.SLAUGHTERHOUSE);
      expect(sales.length).toBeGreaterThan(0);
      expect(sales.every((sale) => sale.saleType === SaleType.SLAUGHTERHOUSE)).toBe(true);
    });

    it("should filter sales by date range", () => {
      const sales = getSalesByCategory("company-1", SaleType.SLAUGHTERHOUSE, {
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });
      expect(sales.length).toBe(1);
    });

    it("should return empty array when no sales of that category", () => {
      const sales = getSalesByCategory("company-1", SaleType.OTHER_FARM);
      expect(sales).toHaveLength(0);
    });
  });
});
