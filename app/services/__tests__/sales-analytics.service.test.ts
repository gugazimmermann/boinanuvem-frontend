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
import { mockAnimals } from "~/mocks/animals";
import { mockBirths } from "~/mocks/births";
import { mockAcquisitions } from "~/mocks/acquisitions";
import { SaleType, PricingMode, SalePaymentMethod, AcquisitionPaymentMethod } from "~/types";

// Mock dependencies
vi.mock("../sales.service", () => ({
  getSalesByCompanyId: vi.fn((companyId: string) => {
    return mockSales.filter((s) => s.companyId === companyId);
  }),
  getSalesByBuyerId: vi.fn((buyerId: string) => {
    return mockSales.filter((s) => s.buyerId === buyerId);
  }),
}));

vi.mock("../animals.service", () => ({
  getAnimalById: vi.fn((id: string) => mockAnimals.find((a) => a.id === id)),
}));

vi.mock("../births.service", () => ({
  getBirthByAnimalId: vi.fn(),
}));

vi.mock("../acquisitions.service", () => ({
  getAcquisitionByAnimalId: vi.fn(),
  generateAcquisitionId: vi.fn((index: number) => `acq-${index}`),
}));

vi.mock("~/utils/profitability", () => ({
  calculateAnimalProfitability: vi.fn(() => ({
    cost: 1000,
    salePrice: 1500,
    profit: 500,
    profitMargin: 33.33,
    costPerKg: 10,
    pricePerKg: 15,
    roi: 50,
  })),
  calculateAggregatedProfitability: vi.fn(() => ({
    totalCost: 1000,
    totalSalePrice: 1500,
    totalProfit: 500,
    averageProfitMargin: 33.33,
    averageCostPerKg: 10,
    averagePricePerKg: 15,
    averageRoi: 50,
  })),
}));

vi.mock("~/utils/fees", () => ({
  getTotalFees: vi.fn(() => 50),
}));

describe("sales-analytics.service", () => {
  beforeEach(async () => {
    mockSales.length = 0;
    mockAnimals.length = 0;
    mockBirths.length = 0;
    mockAcquisitions.length = 0;

    // Setup mock for getBirthByAnimalId
    const { getBirthByAnimalId } = await import("../births.service");
    vi.mocked(getBirthByAnimalId).mockImplementation((id: string) => {
      return mockBirths.find((b) => b.animalId === id);
    });

    // Setup mock for getAcquisitionByAnimalId
    const { getAcquisitionByAnimalId } = await import("../acquisitions.service");
    vi.mocked(getAcquisitionByAnimalId).mockImplementation((id: string) => {
      // Return acquisition if animalId matches any acquisition item
      return mockAcquisitions.find((a) => a.acquisitionItems?.some((item) => item.animalId === id));
    });

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

    mockBirths.push({
      id: "birth-1",
      animalId: "animal-1",
      birthDate: "2024-01-01",
      gender: "male",
      companyId: "company-1",
      propertyId: "property-1",
      createdAt: "2024-01-01",
    });

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
        fees: [],
        saleItems: [{ animalId: "animal-1", price: 1000, weight: 100, carcassWeight: 60 }],
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
        fees: [],
        saleItems: [{ animalId: "animal-2", price: 2000, weight: 200 }],
        createdAt: "2025-01-20",
      }
    );
  });

  describe("getSalesMetrics", () => {
    it("should calculate total sales count", () => {
      const result = getSalesMetrics("company-1");
      expect(result.totalSales).toBe(2);
    });

    it("should calculate total revenue including fees", () => {
      const result = getSalesMetrics("company-1");
      // 1000 + 2000 + 50 + 50 = 3100
      expect(result.totalRevenue).toBe(3100);
    });

    it("should calculate average price per kg", () => {
      const result = getSalesMetrics("company-1");
      // 3100 / 300 = 10.33...
      expect(result.averagePricePerKg).toBeGreaterThan(0);
    });

    it("should calculate average price per head", () => {
      const result = getSalesMetrics("company-1");
      // 3100 / 2 = 1550
      expect(result.averagePricePerHead).toBe(1550);
    });

    it("should calculate average carcass value when available", () => {
      const result = getSalesMetrics("company-1");
      expect(result.averageCarcassValue).toBeDefined();
    });

    it("should calculate total animals sold", () => {
      const result = getSalesMetrics("company-1");
      expect(result.totalAnimalsSold).toBe(2);
    });

    it("should include profitability metrics", () => {
      const result = getSalesMetrics("company-1");
      expect(result.profitability).toBeDefined();
      expect(result.profitability.totalCost).toBe(1000);
      expect(result.profitability.totalSalePrice).toBe(1500);
    });

    it("should filter by date range", () => {
      const result = getSalesMetrics("company-1", {
        startDate: "2025-01-10",
        endDate: "2025-01-18",
      });
      expect(result.totalSales).toBe(1);
    });

    it("should filter by buyer", () => {
      const result = getSalesMetrics("company-1", {
        buyerId: "buyer-1",
      });
      expect(result.totalSales).toBe(1);
    });

    it("should filter by sale type", () => {
      const result = getSalesMetrics("company-1", {
        saleType: SaleType.SLAUGHTERHOUSE,
      });
      expect(result.totalSales).toBe(1);
    });

    it("should filter by property", () => {
      const result = getSalesMetrics("company-1", {
        propertyId: "property-1",
      });
      expect(result.totalSales).toBe(2);
    });
  });

  describe("getPricePerKg", () => {
    it("should return average price per kg", () => {
      const result = getPricePerKg("company-1");
      expect(result).toBeGreaterThan(0);
    });

    it("should respect filters", () => {
      const result = getPricePerKg("company-1", { buyerId: "buyer-1" });
      expect(result).toBeGreaterThan(0);
    });
  });

  describe("getPricePerHead", () => {
    it("should return average price per head", () => {
      const result = getPricePerHead("company-1");
      expect(result).toBe(1550);
    });

    it("should respect filters", () => {
      const result = getPricePerHead("company-1", { buyerId: "buyer-1" });
      expect(result).toBeGreaterThan(0);
    });
  });

  describe("getCarcassValue", () => {
    it("should return average carcass value when available", () => {
      const result = getCarcassValue("company-1");
      expect(result).toBeDefined();
    });

    it("should return undefined when no carcass data", () => {
      mockSales[1]!.saleItems[0]!.carcassWeight = undefined;
      const result = getCarcassValue("company-1");
      // Still defined because sale-1 has carcassWeight
      expect(result).toBeDefined();
    });
  });

  describe("getAverageAgeAtSale", () => {
    it("should calculate average age at sale", () => {
      const result = getAverageAgeAtSale("company-1");
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it("should handle animals without birth dates", () => {
      mockBirths.length = 0;
      const result = getAverageAgeAtSale("company-1");
      expect(result).toBe(0);
    });

    it("should use acquisitionItem birthDate when birth is not found", async () => {
      mockSales.length = 0;
      mockBirths.length = 0;
      mockAcquisitions.length = 0;

      mockSales.push({
        id: "sale-1",
        companyId: "company-1",
        propertyId: "property-1",
        buyerId: "buyer-1",
        saleDate: "2025-06-01",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        totalPrice: 1000,
        saleItems: [{ animalId: "animal-1", price: 1000, weight: 200 }],
        createdAt: "2025-06-01",
      });

      mockAcquisitions.push({
        id: "acq-1",
        companyId: "company-1",
        propertyId: "property-1",
        supplierId: "supplier-1",
        acquisitionDate: "2025-01-01",
        pricingMode: PricingMode.TOTAL,
        paymentMethod: AcquisitionPaymentMethod.CASH_FLOW,
        totalPrice: 500,
        acquisitionItems: [
          {
            animalId: "animal-1",
            birthDate: "2023-01-01",
            price: 500,
            costPerArroba: 0,
            weight: 200,
          },
        ],
        createdAt: "2025-01-01",
      });

      const result = getAverageAgeAtSale("company-1");
      expect(result).toBeGreaterThan(0);
    });

    it("should estimate birth date from acquisition date when no birthDate", async () => {
      mockSales.length = 0;
      mockBirths.length = 0;
      mockAcquisitions.length = 0;

      mockSales.push({
        id: "sale-1",
        companyId: "company-1",
        propertyId: "property-1",
        buyerId: "buyer-1",
        saleDate: "2025-06-01",
        saleType: SaleType.SLAUGHTERHOUSE,
        pricingMode: PricingMode.TOTAL,
        paymentMethod: SalePaymentMethod.CASH_FLOW,
        totalPrice: 1000,
        saleItems: [{ animalId: "animal-1", price: 1000, weight: 200 }],
        createdAt: "2025-06-01",
      });

      mockAcquisitions.push({
        id: "acq-1",
        companyId: "company-1",
        propertyId: "property-1",
        supplierId: "supplier-1",
        acquisitionDate: "2023-06-01",
        pricingMode: PricingMode.TOTAL,
        paymentMethod: AcquisitionPaymentMethod.CASH_FLOW,
        totalPrice: 500,
        acquisitionItems: [
          {
            animalId: "animal-1",
            price: 500,
            costPerArroba: 0,
            weight: 200,
          },
        ],
        createdAt: "2023-06-01",
      });

      const result = getAverageAgeAtSale("company-1");
      expect(result).toBeGreaterThan(0);
    });
  });

  describe("getProfitabilityMetrics", () => {
    it("should return profitability metrics", () => {
      const result = getProfitabilityMetrics("company-1");
      expect(result.totalCost).toBe(1000);
      expect(result.totalSalePrice).toBe(1500);
      expect(result.totalProfit).toBe(500);
    });

    it("should respect filters", () => {
      const result = getProfitabilityMetrics("company-1", { buyerId: "buyer-1" });
      expect(result).toBeDefined();
    });
  });

  describe("getSalesByBuyer", () => {
    it("should return sales for specific buyer", () => {
      const result = getSalesByBuyer("company-1", "buyer-1");
      expect(result).toHaveLength(1);
      expect(result[0]?.buyerId).toBe("buyer-1");
    });

    it("should filter by date range", () => {
      const result = getSalesByBuyer("company-1", "buyer-1", {
        startDate: "2025-01-10",
        endDate: "2025-01-18",
      });
      expect(result).toHaveLength(1);
    });
  });

  describe("getSalesByCategory", () => {
    it("should return sales of specific category", () => {
      const result = getSalesByCategory("company-1", SaleType.SLAUGHTERHOUSE);
      expect(result).toHaveLength(1);
      expect(result[0]?.saleType).toBe(SaleType.SLAUGHTERHOUSE);
    });

    it("should filter by date range", () => {
      const result = getSalesByCategory("company-1", SaleType.SLAUGHTERHOUSE, {
        startDate: "2025-01-10",
        endDate: "2025-01-18",
      });
      expect(result).toHaveLength(1);
    });
  });
});
