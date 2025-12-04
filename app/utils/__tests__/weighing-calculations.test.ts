import { describe, it, expect } from "vitest";
import { calculateWeighingsWithCalculations, calculateGMDValue } from "../weighing-calculations";
import type { Weighing } from "~/types";

describe("weighing-calculations", () => {
  describe("calculateWeighingsWithCalculations", () => {
    it("should return empty array for empty weighings", () => {
      const result = calculateWeighingsWithCalculations([]);
      expect(result).toEqual([]);
    });

    it("should return single weighing with null diff and GMD", () => {
      const weighings: Weighing[] = [
        {
          id: "1",
          animalId: "animal1",
          date: "2024-01-15",
          weight: 300,
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2024-01-15",
          companyId: "c1",
        },
      ];
      const result = calculateWeighingsWithCalculations(weighings);
      expect(result).toHaveLength(1);
      expect(result[0].weightDiff).toBeNull();
      expect(result[0].periodGMD).toBeNull();
    });

    it("should calculate weight difference and GMD for multiple weighings", () => {
      const weighings: Weighing[] = [
        {
          id: "1",
          animalId: "animal1",
          date: "2024-01-10",
          weight: 250,
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2024-01-10",
          companyId: "c1",
        },
        {
          id: "2",
          animalId: "animal1",
          date: "2024-01-15",
          weight: 300,
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2024-01-15",
          companyId: "c1",
        },
      ];
      const result = calculateWeighingsWithCalculations(weighings);
      expect(result[0].weightDiff).toBe(50);
      expect(result[0].periodGMD).toBe("10.00"); // 50kg / 5 days
    });

    it("should sort weighings by date descending", () => {
      const weighings: Weighing[] = [
        {
          id: "1",
          animalId: "animal1",
          date: "2024-01-10",
          weight: 250,
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2024-01-10",
          companyId: "c1",
        },
        {
          id: "2",
          animalId: "animal1",
          date: "2024-01-15",
          weight: 300,
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2024-01-15",
          companyId: "c1",
        },
        {
          id: "3",
          animalId: "animal1",
          date: "2024-01-05",
          weight: 200,
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2024-01-05",
          companyId: "c1",
        },
      ];
      const result = calculateWeighingsWithCalculations(weighings);
      expect(new Date(result[0].date).getTime()).toBeGreaterThan(
        new Date(result[1].date).getTime()
      );
    });

    it("should handle zero days difference", () => {
      const weighings: Weighing[] = [
        {
          id: "1",
          animalId: "animal1",
          date: "2024-01-15",
          weight: 250,
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2024-01-15",
          companyId: "c1",
        },
        {
          id: "2",
          animalId: "animal1",
          date: "2024-01-15",
          weight: 300,
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2024-01-15",
          companyId: "c1",
        },
      ];
      const result = calculateWeighingsWithCalculations(weighings);
      expect(result[0].periodGMD).toBeNull();
    });

    it("should handle negative weight difference", () => {
      const weighings: Weighing[] = [
        {
          id: "1",
          animalId: "animal1",
          date: "2024-01-10",
          weight: 300,
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2024-01-10",
          companyId: "c1",
        },
        {
          id: "2",
          animalId: "animal1",
          date: "2024-01-15",
          weight: 250,
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2024-01-15",
          companyId: "c1",
        },
      ];
      const result = calculateWeighingsWithCalculations(weighings);
      expect(result[0].weightDiff).toBe(-50);
    });
  });

  describe("calculateGMDValue", () => {
    it("should return null for empty array", () => {
      expect(calculateGMDValue([])).toBeNull();
    });

    it("should return null for single weighing", () => {
      const weighings: Weighing[] = [
        {
          id: "1",
          animalId: "animal1",
          date: "2024-01-15",
          weight: 300,
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2024-01-15",
          companyId: "c1",
        },
      ];
      expect(calculateGMDValue(weighings)).toBeNull();
    });

    it("should calculate GMD for two weighings", () => {
      const weighings: Weighing[] = [
        {
          id: "1",
          animalId: "animal1",
          date: "2024-01-10",
          weight: 250,
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2024-01-10",
          companyId: "c1",
        },
        {
          id: "2",
          animalId: "animal1",
          date: "2024-01-15",
          weight: 300,
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2024-01-15",
          companyId: "c1",
        },
      ];
      const result = calculateGMDValue(weighings);
      expect(result).toBe("10.00"); // 50kg / 5 days
    });

    it("should use first and last weighing", () => {
      const weighings: Weighing[] = [
        {
          id: "1",
          animalId: "animal1",
          date: "2024-01-05",
          weight: 200,
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2024-01-05",
          companyId: "c1",
        },
        {
          id: "2",
          animalId: "animal1",
          date: "2024-01-10",
          weight: 250,
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2024-01-10",
          companyId: "c1",
        },
        {
          id: "3",
          animalId: "animal1",
          date: "2024-01-15",
          weight: 300,
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2024-01-15",
          companyId: "c1",
        },
      ];
      const result = calculateGMDValue(weighings);
      // Should use first (200kg) and last (300kg) weighing
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
    });

    it("should handle date strings with time", () => {
      const weighings: Weighing[] = [
        {
          id: "1",
          animalId: "animal1",
          date: "2024-01-10T00:00:00Z",
          weight: 250,
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2024-01-10",
          companyId: "c1",
        },
        {
          id: "2",
          animalId: "animal1",
          date: "2024-01-15T00:00:00Z",
          weight: 300,
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2024-01-15",
          companyId: "c1",
        },
      ];
      const result = calculateGMDValue(weighings);
      expect(result).toBeDefined();
    });

    it("should return null for zero days difference", () => {
      const weighings: Weighing[] = [
        {
          id: "1",
          animalId: "animal1",
          date: "2024-01-15",
          weight: 250,
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2024-01-15",
          companyId: "c1",
        },
        {
          id: "2",
          animalId: "animal1",
          date: "2024-01-15",
          weight: 300,
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2024-01-15",
          companyId: "c1",
        },
      ];
      expect(calculateGMDValue(weighings)).toBeNull();
    });
  });
});
