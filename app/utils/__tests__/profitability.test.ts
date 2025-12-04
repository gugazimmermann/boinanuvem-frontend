import { describe, it, expect, vi, beforeEach } from "vitest";
import { calculateAnimalProfitability, calculateAggregatedProfitability } from "../profitability";
import * as locationCostsService from "~/services/location-costs.service";
import * as acquisitionsService from "~/services/acquisitions.service";

vi.mock("~/services/location-costs.service", () => ({
  getAnimalTotalCost: vi.fn(),
}));

vi.mock("~/services/acquisitions.service", () => ({
  getAcquisitionByAnimalId: vi.fn(),
}));

describe("profitability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("calculateAnimalProfitability", () => {
    it("should calculate profitability with all metrics", () => {
      vi.mocked(locationCostsService.getAnimalTotalCost).mockReturnValue({
        totalCost: 5000,
      });

      vi.mocked(acquisitionsService.getAcquisitionByAnimalId).mockReturnValue({
        id: "acq-1",
        acquisitionItems: [
          {
            animalId: "animal-1",
            price: 2000,
            weight: 300,
            costPerArroba: 200,
          },
        ],
      });

      const result = calculateAnimalProfitability("animal-1", 10000, "2024-12-01", 450);

      expect(result.animalId).toBe("animal-1");
      expect(result.totalCost).toBe(7000);
      expect(result.salePrice).toBe(10000);
      expect(result.profit).toBe(3000);
      expect(result.profitMargin).toBeCloseTo(30, 1);
      expect(result.costPerKg).toBeCloseTo(15.56, 1);
      expect(result.pricePerKg).toBeCloseTo(22.22, 1);
      expect(result.roi).toBeCloseTo(42.86, 1);
      expect(result.acquisitionArrobaValue).toBe(200);
      expect(result.saleArrobaValue).toBeCloseTo(666.67, 1);
      expect(result.spreadPerArroba).toBeCloseTo(466.67, 1);
      expect(result.totalSpread).toBeCloseTo(7000, 1);
    });

    it("should handle zero sale weight", () => {
      vi.mocked(locationCostsService.getAnimalTotalCost).mockReturnValue({
        totalCost: 5000,
      });

      vi.mocked(acquisitionsService.getAcquisitionByAnimalId).mockReturnValue(null);

      const result = calculateAnimalProfitability("animal-1", 10000, "2024-12-01", 0);

      expect(result.costPerKg).toBe(0);
      expect(result.pricePerKg).toBe(0);
    });

    it("should handle zero sale price", () => {
      vi.mocked(locationCostsService.getAnimalTotalCost).mockReturnValue({
        totalCost: 5000,
      });

      vi.mocked(acquisitionsService.getAcquisitionByAnimalId).mockReturnValue(null);

      const result = calculateAnimalProfitability("animal-1", 0, "2024-12-01", 450);

      expect(result.profitMargin).toBe(0);
      expect(result.profit).toBe(-5000);
    });

    it("should handle no acquisition data", () => {
      vi.mocked(locationCostsService.getAnimalTotalCost).mockReturnValue({
        totalCost: 5000,
      });

      vi.mocked(acquisitionsService.getAcquisitionByAnimalId).mockReturnValue(null);

      const result = calculateAnimalProfitability("animal-1", 10000, "2024-12-01", 450);

      expect(result.totalCost).toBe(5000);
      expect(result.acquisitionArrobaValue).toBeUndefined();
      expect(result.saleArrobaValue).toBeUndefined();
    });

    it("should handle acquisition with zero weight", () => {
      vi.mocked(locationCostsService.getAnimalTotalCost).mockReturnValue({
        totalCost: 5000,
      });

      vi.mocked(acquisitionsService.getAcquisitionByAnimalId).mockReturnValue({
        id: "acq-1",
        acquisitionItems: [
          {
            animalId: "animal-1",
            price: 2000,
            weight: 0,
            costPerArroba: 200,
          },
        ],
      });

      const result = calculateAnimalProfitability("animal-1", 10000, "2024-12-01", 450);

      expect(result.acquisitionArrobaValue).toBeUndefined();
    });

    it("should handle zero total cost", () => {
      vi.mocked(locationCostsService.getAnimalTotalCost).mockReturnValue(null);
      vi.mocked(acquisitionsService.getAcquisitionByAnimalId).mockReturnValue(null);

      const result = calculateAnimalProfitability("animal-1", 10000, "2024-12-01", 450);

      expect(result.totalCost).toBe(0);
      expect(result.roi).toBe(0);
    });
  });

  describe("calculateAggregatedProfitability", () => {
    it("should calculate aggregated metrics from multiple profitabilities", () => {
      const profitabilities = [
        {
          animalId: "animal-1",
          totalCost: 5000,
          salePrice: 10000,
          profit: 5000,
          profitMargin: 50,
          costPerKg: 10,
          pricePerKg: 20,
          roi: 100,
          acquisitionArrobaValue: 200,
          saleArrobaValue: 250,
          spreadPerArroba: 50,
          totalSpread: 500,
        },
        {
          animalId: "animal-2",
          totalCost: 3000,
          salePrice: 8000,
          profit: 5000,
          profitMargin: 62.5,
          costPerKg: 6,
          pricePerKg: 16,
          roi: 166.67,
          acquisitionArrobaValue: 180,
          saleArrobaValue: 220,
          spreadPerArroba: 40,
          totalSpread: 400,
        },
      ];

      const result = calculateAggregatedProfitability(profitabilities);

      expect(result.totalCost).toBe(8000);
      expect(result.totalSalePrice).toBe(18000);
      expect(result.totalProfit).toBe(10000);
      expect(result.averageProfitMargin).toBeCloseTo(56.25, 1);
      expect(result.averageCostPerKg).toBe(8);
      expect(result.averagePricePerKg).toBe(18);
      expect(result.averageRoi).toBeCloseTo(133.34, 1);
      expect(result.averageAcquisitionArrobaValue).toBe(190);
      expect(result.averageSaleArrobaValue).toBe(235);
      expect(result.averageSpreadPerArroba).toBe(45);
      expect(result.totalSpread).toBe(900);
    });

    it("should return zeros for empty array", () => {
      const result = calculateAggregatedProfitability([]);

      expect(result.totalCost).toBe(0);
      expect(result.totalSalePrice).toBe(0);
      expect(result.totalProfit).toBe(0);
      expect(result.averageProfitMargin).toBe(0);
      expect(result.averageCostPerKg).toBe(0);
      expect(result.averagePricePerKg).toBe(0);
      expect(result.averageRoi).toBe(0);
      expect(result.averageAcquisitionArrobaValue).toBeUndefined();
    });

    it("should handle profitabilities without spread data", () => {
      const profitabilities = [
        {
          animalId: "animal-1",
          totalCost: 5000,
          salePrice: 10000,
          profit: 5000,
          profitMargin: 50,
          costPerKg: 10,
          pricePerKg: 20,
          roi: 100,
        },
      ];

      const result = calculateAggregatedProfitability(profitabilities);

      expect(result.averageAcquisitionArrobaValue).toBeUndefined();
      expect(result.averageSaleArrobaValue).toBeUndefined();
      expect(result.averageSpreadPerArroba).toBeUndefined();
      expect(result.totalSpread).toBeUndefined();
    });

    it("should calculate averages correctly", () => {
      const profitabilities = [
        {
          animalId: "animal-1",
          totalCost: 1000,
          salePrice: 2000,
          profit: 1000,
          profitMargin: 50,
          costPerKg: 5,
          pricePerKg: 10,
          roi: 100,
        },
        {
          animalId: "animal-2",
          totalCost: 2000,
          salePrice: 4000,
          profit: 2000,
          profitMargin: 50,
          costPerKg: 10,
          pricePerKg: 20,
          roi: 100,
        },
        {
          animalId: "animal-3",
          totalCost: 3000,
          salePrice: 6000,
          profit: 3000,
          profitMargin: 50,
          costPerKg: 15,
          pricePerKg: 30,
          roi: 100,
        },
      ];

      const result = calculateAggregatedProfitability(profitabilities);

      expect(result.averageProfitMargin).toBe(50);
      expect(result.averageCostPerKg).toBe(10);
      expect(result.averagePricePerKg).toBe(20);
      expect(result.averageRoi).toBe(100);
    });
  });
});
