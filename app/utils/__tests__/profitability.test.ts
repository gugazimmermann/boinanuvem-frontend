import { describe, it, expect, vi, beforeEach } from "vitest";
import { calculateAnimalProfitability, calculateAggregatedProfitability } from "../profitability";
import { getAnimalTotalCost } from "~/services/location-costs.service";
import { getAcquisitionByAnimalId } from "~/services/acquisitions.service";

// Mock services
vi.mock("~/services/location-costs.service", () => ({
  getAnimalTotalCost: vi.fn(),
}));

vi.mock("~/services/acquisitions.service", () => ({
  getAcquisitionByAnimalId: vi.fn(),
}));

describe("calculateAnimalProfitability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should calculate profitability with all metrics", async () => {
    vi.mocked(getAnimalTotalCost).mockResolvedValue({
      animalId: "animal-1",
      totalCost: 500,
      locationBreakdown: [],
      consumptionPeriods: 0,
    });
    vi.mocked(getAcquisitionByAnimalId).mockReturnValue({
      id: "acq-1",
      acquisitionItems: [
        {
          animalId: "animal-1",
          price: 1000,
          weight: 200,
          costPerArroba: 50,
        },
      ],
    } as unknown as ReturnType<typeof getAcquisitionByAnimalId>);

    const result = await calculateAnimalProfitability("animal-1", 2000, "2024-01-15", 300);

    expect(result.animalId).toBe("animal-1");
    expect(result.totalCost).toBe(1500); // 500 + 1000 + 0
    expect(result.salePrice).toBe(2000);
    expect(result.profit).toBe(500);
    expect(result.profitMargin).toBeCloseTo(25, 1); // (500/2000) * 100
    expect(result.costPerKg).toBeCloseTo(5, 1); // 1500/300
    expect(result.pricePerKg).toBeCloseTo(6.67, 1); // 2000/300
    expect(result.roi).toBeCloseTo(33.33, 1); // (500/1500) * 100
  });

  it("should calculate arroba values when acquisition has weight", async () => {
    vi.mocked(getAnimalTotalCost).mockResolvedValue({
      animalId: "animal-1",
      totalCost: 500,
      locationBreakdown: [],
      consumptionPeriods: 0,
    });
    vi.mocked(getAcquisitionByAnimalId).mockReturnValue({
      id: "acq-1",
      acquisitionItems: [
        {
          animalId: "animal-1",
          price: 1000,
          weight: 200,
          costPerArroba: 50,
        },
      ],
    } as unknown as ReturnType<typeof getAcquisitionByAnimalId>);

    const result = await calculateAnimalProfitability("animal-1", 2000, "2024-01-15", 300);

    expect(result.acquisitionArrobaValue).toBe(50);
    // saleArrobas = 300 / 30 = 10, saleArrobaValue = 2000 / 10 = 200
    expect(result.saleArrobaValue).toBe(200);
    // spreadPerArroba = 200 - 50 = 150
    expect(result.spreadPerArroba).toBe(150);
    // totalSpread = 150 * 10 = 1500
    expect(result.totalSpread).toBe(1500);
  });

  it("should handle zero sale weight", async () => {
    vi.mocked(getAnimalTotalCost).mockResolvedValue({
      animalId: "animal-1",
      totalCost: 500,
      locationBreakdown: [],
      consumptionPeriods: 0,
    });
    vi.mocked(getAcquisitionByAnimalId).mockReturnValue(undefined);

    const result = await calculateAnimalProfitability("animal-1", 2000, "2024-01-15", 0);

    expect(result.costPerKg).toBe(0);
    expect(result.pricePerKg).toBe(0);
  });

  it("should handle zero sale price", async () => {
    vi.mocked(getAnimalTotalCost).mockResolvedValue({
      animalId: "animal-1",
      totalCost: 500,
      locationBreakdown: [],
      consumptionPeriods: 0,
    });
    vi.mocked(getAcquisitionByAnimalId).mockReturnValue(undefined);

    const result = await calculateAnimalProfitability("animal-1", 0, "2024-01-15", 300);

    expect(result.profitMargin).toBe(0);
    expect(result.profit).toBe(-500);
  });

  it("should handle missing cost data", async () => {
    vi.mocked(getAnimalTotalCost).mockResolvedValue(undefined);
    vi.mocked(getAcquisitionByAnimalId).mockReturnValue(undefined);

    const result = await calculateAnimalProfitability("animal-1", 2000, "2024-01-15", 300);

    expect(result.totalCost).toBe(0);
    expect(result.profit).toBe(2000);
  });

  it("should not calculate arroba values when acquisition has no weight", async () => {
    vi.mocked(getAnimalTotalCost).mockResolvedValue({
      animalId: "animal-1",
      totalCost: 500,
      locationBreakdown: [],
      consumptionPeriods: 0,
    });
    vi.mocked(getAcquisitionByAnimalId).mockReturnValue({
      id: "acq-1",
      acquisitionItems: [
        {
          animalId: "animal-1",
          price: 1000,
          weight: 0,
        },
      ],
    } as unknown as ReturnType<typeof getAcquisitionByAnimalId>);

    const result = await calculateAnimalProfitability("animal-1", 2000, "2024-01-15", 300);

    expect(result.acquisitionArrobaValue).toBeUndefined();
    expect(result.saleArrobaValue).toBeUndefined();
  });
});

describe("calculateAggregatedProfitability", () => {
  const mockProfitabilities = [
    {
      animalId: "animal-1",
      totalCost: 1000,
      salePrice: 2000,
      profit: 1000,
      profitMargin: 50,
      costPerKg: 5,
      pricePerKg: 10,
      roi: 100,
      acquisitionArrobaValue: 50,
      saleArrobaValue: 60,
      spreadPerArroba: 10,
      totalSpread: 100,
    },
    {
      animalId: "animal-2",
      totalCost: 1500,
      salePrice: 2500,
      profit: 1000,
      profitMargin: 40,
      costPerKg: 7.5,
      pricePerKg: 12.5,
      roi: 66.67,
      acquisitionArrobaValue: 55,
      saleArrobaValue: 65,
      spreadPerArroba: 10,
      totalSpread: 100,
    },
  ];

  it("should calculate aggregated totals", () => {
    const result = calculateAggregatedProfitability(mockProfitabilities);
    expect(result.totalCost).toBe(2500);
    expect(result.totalSalePrice).toBe(4500);
    expect(result.totalProfit).toBe(2000);
  });

  it("should calculate averages", () => {
    const result = calculateAggregatedProfitability(mockProfitabilities);
    expect(result.averageProfitMargin).toBeCloseTo(45, 1); // (50 + 40) / 2
    expect(result.averageCostPerKg).toBeCloseTo(6.25, 1); // (5 + 7.5) / 2
    expect(result.averagePricePerKg).toBeCloseTo(11.25, 1); // (10 + 12.5) / 2
    expect(result.averageRoi).toBeCloseTo(83.34, 1); // (100 + 66.67) / 2
  });

  it("should calculate arroba averages when available", () => {
    const result = calculateAggregatedProfitability(mockProfitabilities);
    expect(result.averageAcquisitionArrobaValue).toBeCloseTo(52.5, 1); // (50 + 55) / 2
    expect(result.averageSaleArrobaValue).toBeCloseTo(62.5, 1); // (60 + 65) / 2
    expect(result.averageSpreadPerArroba).toBe(10); // (10 + 10) / 2
    expect(result.totalSpread).toBe(200); // 100 + 100
  });

  it("should handle empty array", () => {
    const result = calculateAggregatedProfitability([]);
    expect(result.totalCost).toBe(0);
    expect(result.totalSalePrice).toBe(0);
    expect(result.totalProfit).toBe(0);
    expect(result.averageProfitMargin).toBe(0);
    expect(result.averageAcquisitionArrobaValue).toBeUndefined();
  });

  it("should handle profitabilities without arroba values", () => {
    const withoutArroba = [
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
    ];
    const result = calculateAggregatedProfitability(withoutArroba);
    expect(result.averageAcquisitionArrobaValue).toBeUndefined();
    expect(result.averageSaleArrobaValue).toBeUndefined();
    expect(result.totalSpread).toBeUndefined();
  });

  it("should handle mixed profitabilities (some with arroba, some without)", () => {
    const mixed = [
      mockProfitabilities[0],
      {
        animalId: "animal-3",
        totalCost: 1000,
        salePrice: 2000,
        profit: 1000,
        profitMargin: 50,
        costPerKg: 5,
        pricePerKg: 10,
        roi: 100,
      },
    ];
    const result = calculateAggregatedProfitability(mixed);
    // Should only calculate arroba averages from the one that has them
    expect(result.averageAcquisitionArrobaValue).toBe(50);
    expect(result.averageSaleArrobaValue).toBe(60);
  });
});
