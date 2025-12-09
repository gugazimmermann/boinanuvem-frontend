import { describe, it, expect } from "vitest";
import { calculateWeighingsWithCalculations, calculateGMDValue } from "../weighing-calculations";
import type { Weighing } from "~/types";

describe("calculateWeighingsWithCalculations", () => {
  const mockWeighings: Weighing[] = [
    {
      id: "1",
      animalId: "animal-1",
      date: "2024-01-01",
      weight: 100,
      locationId: "loc-1",
      companyId: "company-1",
      employeeIds: [],
      serviceProviderIds: [],
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      animalId: "animal-1",
      date: "2024-01-15",
      weight: 120,
      locationId: "loc-1",
      companyId: "company-1",
      employeeIds: [],
      serviceProviderIds: [],
      createdAt: "2024-01-15",
    },
    {
      id: "3",
      animalId: "animal-1",
      date: "2024-01-30",
      weight: 140,
      locationId: "loc-1",
      companyId: "company-1",
      employeeIds: [],
      serviceProviderIds: [],
      createdAt: "2024-01-30",
    },
  ];

  it("should sort weighings by date descending", () => {
    const result = calculateWeighingsWithCalculations(mockWeighings);
    expect(result[0].date).toBe("2024-01-30");
    expect(result[result.length - 1].date).toBe("2024-01-01");
  });

  it("should calculate weight difference", () => {
    const result = calculateWeighingsWithCalculations(mockWeighings);
    expect(result[0].weightDiff).toBe(20); // 140 - 120
    expect(result[1].weightDiff).toBe(20); // 120 - 100
    expect(result[2].weightDiff).toBeNull(); // No previous weighing
  });

  it("should calculate period GMD", () => {
    const result = calculateWeighingsWithCalculations(mockWeighings);
    // GMD = weightDiff / daysDiff
    expect(result[0].periodGMD).toBeDefined();
    expect(result[1].periodGMD).toBeDefined();
    expect(result[2].periodGMD).toBeNull();
  });

  it("should handle empty array", () => {
    const result = calculateWeighingsWithCalculations([]);
    expect(result).toEqual([]);
  });

  it("should handle single weighing", () => {
    const result = calculateWeighingsWithCalculations([mockWeighings[0]]);
    expect(result).toHaveLength(1);
    expect(result[0].weightDiff).toBeNull();
    expect(result[0].periodGMD).toBeNull();
  });

  it("should preserve original weighing properties", () => {
    const result = calculateWeighingsWithCalculations([mockWeighings[0]]);
    expect(result[0].id).toBe("1");
    expect(result[0].animalId).toBe("animal-1");
    expect(result[0].weight).toBe(100);
  });
});

describe("calculateGMDValue", () => {
  const sortedWeighings: Weighing[] = [
    {
      id: "1",
      animalId: "animal-1",
      date: "2024-01-01T00:00:00Z",
      weight: 100,
      locationId: "loc-1",
      companyId: "company-1",
      employeeIds: [],
      serviceProviderIds: [],
      createdAt: "2024-01-01",
    },
    {
      id: "2",
      animalId: "animal-1",
      date: "2024-01-31T00:00:00Z",
      weight: 130,
      locationId: "loc-1",
      companyId: "company-1",
      employeeIds: [],
      serviceProviderIds: [],
      createdAt: "2024-01-31",
    },
  ];

  it("should return null for less than 2 weighings", () => {
    expect(calculateGMDValue([])).toBeNull();
    expect(calculateGMDValue([sortedWeighings[0]])).toBeNull();
  });

  it("should calculate GMD correctly", () => {
    const result = calculateGMDValue(sortedWeighings);
    // Weight diff: 130 - 100 = 30
    // Days diff: 30 days
    // GMD: 30 / 30 = 1.00
    expect(result).toBe("1.00");
  });

  it("should handle date strings with T separator", () => {
    const weighings: Weighing[] = [
      {
        id: "1",
        animalId: "animal-1",
        date: "2024-01-01T10:30:00Z",
        weight: 100,
        locationId: "loc-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: "2024-01-01",
      },
      {
        id: "2",
        animalId: "animal-1",
        date: "2024-01-31T15:45:00Z",
        weight: 130,
        locationId: "loc-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: "2024-01-31",
      },
    ];
    const result = calculateGMDValue(weighings);
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("should return null when days difference is 0", () => {
    const sameDateWeighings: Weighing[] = [
      {
        id: "1",
        animalId: "animal-1",
        date: "2024-01-01",
        weight: 100,
        locationId: "loc-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: "2024-01-01",
      },
      {
        id: "2",
        animalId: "animal-1",
        date: "2024-01-01",
        weight: 130,
        locationId: "loc-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: "2024-01-01",
      },
    ];
    expect(calculateGMDValue(sameDateWeighings)).toBeNull();
  });

  it("should handle missing first or last weighing", () => {
    const weighingsWithUndefined = [
      ...sortedWeighings,
      {
        id: "3",
        animalId: "animal-1",
        date: "2024-02-01",
        weight: 150,
        locationId: "loc-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: "2024-02-01",
      },
    ];
    // Should still work with valid first and last
    const result = calculateGMDValue(weighingsWithUndefined);
    expect(result).toBeDefined();
  });
});
