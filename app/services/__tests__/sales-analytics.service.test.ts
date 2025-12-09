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

vi.mock("../sales.service", () => ({
  getSalesByCompanyId: vi.fn(),
  getSalesByBuyerId: vi.fn(),
}));

vi.mock("../animals.service", () => ({
  getAnimalById: vi.fn(),
}));

vi.mock("../births.service", () => ({
  getBirthByAnimalId: vi.fn(),
}));

vi.mock("../acquisitions.service", () => ({
  getAcquisitionByAnimalId: vi.fn(),
}));

vi.mock("~/utils/profitability", () => ({
  calculateAnimalProfitability: vi.fn(),
  calculateAggregatedProfitability: vi.fn(),
}));

vi.mock("~/utils/fees", () => ({
  getTotalFees: vi.fn((fees: number | undefined) => fees || 0),
}));

import { getSalesByCompanyId, getSalesByBuyerId } from "../sales.service";
import { getBirthByAnimalId } from "../births.service";
import { getAnimalById } from "../animals.service";
import { SaleType } from "~/types";
import {
  calculateAnimalProfitability,
  calculateAggregatedProfitability,
} from "~/utils/profitability";

describe("sales-analytics.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSalesMetrics", () => {
    it("should calculate sales metrics", async () => {
      const mockSales = [
        {
          id: "sale-1",
          companyId: "company-1",
          saleDate: "2024-01-15",
          totalPrice: 5000,
          saleItems: [
            { animalId: "animal-1", weight: 500, price: 10 },
            { animalId: "animal-2", weight: 400, price: 10 },
          ],
        },
      ];

      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;
      const calcProfit = calculateAnimalProfitability as ReturnType<typeof vi.fn>;
      getSales.mockReturnValue(mockSales);
      calcProfit.mockResolvedValue({
        totalCost: 3000,
        salePrice: 5000,
        profit: 2000,
        profitMargin: 40,
        costPerKg: 3,
        pricePerKg: 5,
        roi: 66.67,
      });

      const result = await getSalesMetrics("company-1");

      expect(result.totalSales).toBe(1);
      expect(result.totalRevenue).toBe(5000);
      expect(result.totalAnimalsSold).toBe(2);
    });

    it("should filter sales by date range", async () => {
      const mockSales = [
        {
          id: "sale-1",
          companyId: "company-1",
          saleDate: "2024-01-15",
          totalPrice: 5000,
          saleItems: [{ animalId: "animal-1", weight: 500, price: 10 }],
        },
        {
          id: "sale-2",
          companyId: "company-1",
          saleDate: "2024-03-15",
          totalPrice: 3000,
          saleItems: [{ animalId: "animal-2", weight: 300, price: 10 }],
        },
      ];

      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;
      const calcProfit = calculateAnimalProfitability as ReturnType<typeof vi.fn>;
      getSales.mockReturnValue(mockSales);
      calcProfit.mockResolvedValue({
        totalCost: 2000,
        salePrice: 5000,
        profit: 3000,
        profitMargin: 60,
        costPerKg: 4,
        pricePerKg: 10,
        roi: 150,
      });

      const result = await getSalesMetrics("company-1", {
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });

      expect(result.totalSales).toBe(1);
    });
  });

  describe("getPricePerKg", () => {
    it("should calculate average price per kg", async () => {
      const mockSales = [
        {
          id: "sale-1",
          companyId: "company-1",
          saleDate: "2024-01-15",
          totalPrice: 5000,
          saleItems: [{ animalId: "animal-1", weight: 500, price: 10 }],
        },
      ];

      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;
      getSales.mockReturnValue(mockSales);

      const result = await getPricePerKg("company-1");
      expect(result).toBe(10);
    });
  });

  describe("getPricePerHead", () => {
    it("should calculate average price per head", async () => {
      const mockSales = [
        {
          id: "sale-1",
          companyId: "company-1",
          saleDate: "2024-01-15",
          totalPrice: 5000,
          saleItems: [
            { animalId: "animal-1", weight: 500, price: 10 },
            { animalId: "animal-2", weight: 400, price: 10 },
          ],
        },
      ];

      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;
      getSales.mockReturnValue(mockSales);

      const result = await getPricePerHead("company-1");
      expect(result).toBe(2500); // 5000 / 2
    });
  });

  describe("getCarcassValue", () => {
    it("should calculate average carcass value", async () => {
      const mockSales = [
        {
          id: "sale-1",
          companyId: "company-1",
          saleDate: "2024-01-15",
          totalPrice: 5000,
          saleItems: [{ animalId: "animal-1", weight: 500, carcassWeight: 300, price: 10 }],
        },
      ];

      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;
      getSales.mockReturnValue(mockSales);

      const result = await getCarcassValue("company-1");
      // Average carcass value = totalRevenue / (totalCarcassWeight / totalWeight) = 5000 / (300 / 500) = 5000 / 0.6 = 8333.33
      expect(result).toBeCloseTo(8333.33, 1);
    });
  });

  describe("getAverageAgeAtSale", () => {
    it("should calculate average age at sale", async () => {
      const mockSales = [
        {
          id: "sale-1",
          companyId: "company-1",
          saleDate: "2024-01-15",
          saleItems: [{ animalId: "animal-1", weight: 500, price: 10 }],
        },
      ];

      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getSales.mockReturnValue(mockSales);
      getAnimal.mockReturnValue({ id: "animal-1" });
      getBirth.mockReturnValue({ birthDate: "2022-01-15" });

      const result = await getAverageAgeAtSale("company-1");
      expect(result).toBeGreaterThan(0);
    });
  });

  describe("getProfitabilityMetrics", () => {
    it("should calculate profitability metrics", async () => {
      const mockSales = [
        {
          id: "sale-1",
          companyId: "company-1",
          saleDate: "2024-01-15",
          totalPrice: 5000,
          saleItems: [{ animalId: "animal-1", weight: 500, price: 10 }],
        },
      ];

      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;
      const calcAgg = calculateAggregatedProfitability as ReturnType<typeof vi.fn>;
      getSales.mockReturnValue(mockSales);
      calcAgg.mockResolvedValue({
        totalCost: 3000,
        totalSalePrice: 5000,
        totalProfit: 2000,
        averageProfitMargin: 40,
        averageCostPerKg: 6,
        averagePricePerKg: 10,
        averageRoi: 66.67,
      });

      const result = await getProfitabilityMetrics("company-1");
      expect(result.totalProfit).toBe(2000);
      expect(result.averageProfitMargin).toBe(40);
    });
  });

  describe("getSalesByBuyer", () => {
    it("should group sales by buyer", () => {
      const mockSales = [
        {
          id: "sale-1",
          companyId: "company-1",
          buyerId: "buyer-1",
          totalPrice: 5000,
          saleItems: [{ animalId: "animal-1", weight: 500 }],
        },
        {
          id: "sale-2",
          companyId: "company-1",
          buyerId: "buyer-1",
          totalPrice: 3000,
          saleItems: [{ animalId: "animal-2", weight: 300 }],
        },
      ];

      const getSalesByBuyerIdMock = getSalesByBuyerId as ReturnType<typeof vi.fn>;
      getSalesByBuyerIdMock.mockReturnValue(mockSales);

      const result = getSalesByBuyer("company-1", "buyer-1");
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
    });
  });

  describe("getSalesByCategory", () => {
    it("should group sales by category", () => {
      const mockSales = [
        {
          id: "sale-1",
          saleType: SaleType.OTHER_FARM,
          totalPrice: 5000,
          saleItems: [{ animalId: "animal-1", weight: 500 }],
        },
      ];

      const getSales = getSalesByCompanyId as ReturnType<typeof vi.fn>;
      getSales.mockReturnValue(mockSales);

      const result = getSalesByCategory("company-1", SaleType.OTHER_FARM);
      expect(result).toBeDefined();
    });
  });
});
