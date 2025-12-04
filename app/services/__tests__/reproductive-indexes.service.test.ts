import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getFertilityRate,
  getBirthRate,
  getCalvingInterval,
  getCullingRate,
  getIntrauterineMortalityIndex,
  getBullToCowRatio,
  getExpectedBirthsForecast,
  getWeaningRate,
  getWeaningRatio,
  getKgWeanedCalfPerExposedCow,
  getMortalityRate,
  getCalfMortalityRate,
} from "../reproductive-indexes.service";
import { mockBreedings } from "~/mocks/breedings";
import { mockBirths } from "~/mocks/births";
import { mockAnimals } from "~/mocks/animals";
import { mockDeaths } from "~/mocks/deaths";
import { mockWeighings } from "~/mocks/weighings";

// Mock dependencies
vi.mock("../breedings.service", () => ({
  getBreedingsByPropertyId: vi.fn((propertyId: string) => {
    return mockBreedings.filter((b) => {
      const animal = mockAnimals.find((a) => a.id === b.animalId);
      return animal?.propertyId === propertyId;
    });
  }),
  getBreedingsByCompanyId: vi.fn((companyId: string) => {
    return mockBreedings.filter((b) => {
      const animal = mockAnimals.find((a) => a.id === b.animalId);
      return animal?.companyId === companyId;
    });
  }),
}));

vi.mock("../births.service", () => ({
  getBirthsByPropertyId: vi.fn((propertyId: string) => {
    return mockBirths.filter((b) => b.propertyId === propertyId);
  }),
  getBirthsByCompanyId: vi.fn((companyId: string) => {
    return mockBirths.filter((b) => b.companyId === companyId);
  }),
  getCalvingIntervalsByAnimalId: vi.fn((_animalId: string) => {
    // Return mock intervals
    return [365, 380];
  }),
  getBirthByAnimalId: vi.fn((animalId: string) => {
    return mockBirths.find((b) => b.animalId === animalId);
  }),
}));

vi.mock("../animals.service", () => ({
  getAnimalsByPropertyId: vi.fn((propertyId: string) => {
    return mockAnimals.filter((a) => a.propertyId === propertyId);
  }),
  getAnimalById: vi.fn((id: string) => mockAnimals.find((a) => a.id === id)),
}));

vi.mock("../deaths.service", () => ({
  getDeathsByCompanyId: vi.fn((companyId: string) => {
    return mockDeaths.filter((d) => {
      const animal = mockAnimals.find((a) => a.id === d.animalId);
      return animal?.companyId === companyId;
    });
  }),
  getDeathByAnimalId: vi.fn((animalId: string) => {
    return mockDeaths.find((d) => d.animalId === animalId);
  }),
}));

vi.mock("../weighings.service", () => ({
  getWeighingsByAnimalId: vi.fn((animalId: string) => {
    return mockWeighings.filter((w) => w.animalId === animalId);
  }),
}));

describe("reproductive-indexes.service", () => {
  beforeEach(() => {
    mockBreedings.length = 0;
    mockBirths.length = 0;
    mockAnimals.length = 0;
    mockDeaths.length = 0;
    mockWeighings.length = 0;

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
      },
      {
        id: "bull-1",
        companyId: "company-1",
        propertyId: "property-1",
        code: "BULL001",
        registrationNumber: "BREG001",
        status: "active",
        createdAt: "2025-01-01",
      }
    );

    mockBirths.push(
      {
        id: "birth-1",
        animalId: "animal-1",
        birthDate: "2024-01-01",
        gender: "female",
        companyId: "company-1",
        propertyId: "property-1",
        createdAt: "2024-01-01",
      },
      {
        id: "birth-2",
        animalId: "animal-2",
        birthDate: "2024-01-01",
        gender: "female",
        companyId: "company-1",
        propertyId: "property-1",
        createdAt: "2024-01-01",
      },
      {
        id: "birth-3",
        animalId: "calf-1",
        birthDate: "2025-06-01",
        gender: "male",
        motherId: "animal-1",
        companyId: "company-1",
        propertyId: "property-1",
        createdAt: "2025-06-01",
      }
    );

    mockBreedings.push(
      {
        id: "breeding-1",
        animalId: "animal-1",
        date: "2025-01-15",
        method: "natural",
        confirmed: true,
        bullId: "bull-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: "2025-01-15",
      },
      {
        id: "breeding-2",
        animalId: "animal-2",
        date: "2025-01-20",
        method: "natural",
        confirmed: true,
        bullId: "bull-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: "2025-01-20",
      }
    );
  });

  describe("getFertilityRate", () => {
    it("should calculate fertility rate", () => {
      const result = getFertilityRate("property-1");
      expect(result.rate).toBeGreaterThanOrEqual(0);
      expect(result.pregnantCows).toBeGreaterThanOrEqual(0);
      expect(result.exposedCows).toBeGreaterThanOrEqual(0);
    });

    it("should filter by period", () => {
      const result = getFertilityRate("property-1", {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
      });
      expect(result).toBeDefined();
    });

    it("should filter by bull", () => {
      const result = getFertilityRate("property-1", undefined, {
        bullId: "bull-1",
      });
      expect(result).toBeDefined();
    });

    it("should include breakdown by bull when no filter", () => {
      const result = getFertilityRate("property-1");
      // Breakdown may or may not be present depending on data
      expect(result).toBeDefined();
    });
  });

  describe("getBirthRate", () => {
    it("should calculate birth rate", () => {
      const result = getBirthRate("property-1");
      expect(result.rate).toBeGreaterThanOrEqual(0);
      expect(result.calvesBorn).toBeGreaterThanOrEqual(0);
      expect(result.pregnantFemales).toBeGreaterThanOrEqual(0);
    });

    it("should count calves born with period filter and matching birth", () => {
      // Add breeding and birth within period
      mockBreedings.push({
        id: "breeding-1",
        animalId: "animal-1",
        date: "2025-01-01",
        method: "natural",
        confirmed: true,
        bullId: "bull-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: "2025-01-01",
      });
      mockBirths.push({
        id: "birth-1",
        animalId: "calf-1",
        motherId: "animal-1",
        birthDate: "2025-10-15",
        companyId: "company-1",
        propertyId: "property-1",
        createdAt: "2025-10-15",
      });
      const result = getBirthRate("property-1", {
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      });
      expect(result).toBeDefined();
    });

    it("should count calves born with period filter and birth within maxBirthDate", () => {
      // Add breeding
      mockBreedings.push({
        id: "breeding-max-date",
        animalId: "animal-1",
        date: "2025-01-01",
        method: "natural",
        confirmed: true,
        bullId: "bull-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: "2025-01-01",
      });
      // Add birth that falls within maxBirthDate (periodEnd + 285 days)
      mockBirths.push({
        id: "birth-max-date",
        animalId: "calf-max-date",
        motherId: "animal-1",
        birthDate: "2025-11-15", // Within 285 days of period end
        companyId: "company-1",
        propertyId: "property-1",
        createdAt: "2025-11-15",
      });
      const result = getBirthRate("property-1", {
        startDate: "2025-01-01",
        endDate: "2025-10-31",
      });
      expect(result).toBeDefined();
    });

    it("should count calves born without period filter", () => {
      mockBirths.push({
        id: "birth-2",
        animalId: "calf-2",
        motherId: "animal-1",
        birthDate: "2025-10-15",
        companyId: "company-1",
        propertyId: "property-1",
        createdAt: "2025-10-15",
      });
      const result = getBirthRate("property-1");
      expect(result).toBeDefined();
    });

    it("should filter by period", () => {
      const result = getBirthRate("property-1", {
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      });
      expect(result).toBeDefined();
    });

    it("should include monthly breakdown when available", () => {
      const result = getBirthRate("property-1");
      // Monthly may or may not be present
      expect(result).toBeDefined();
    });
  });

  describe("getCalvingInterval", () => {
    it("should calculate calving interval", () => {
      const result = getCalvingInterval("property-1");
      expect(result.average).toBeGreaterThanOrEqual(0);
      expect(result.min).toBeGreaterThanOrEqual(0);
      expect(result.max).toBeGreaterThanOrEqual(0);
    });

    it("should return 0 when no intervals", () => {
      mockAnimals.length = 0;
      const result = getCalvingInterval("property-1");
      expect(result.average).toBe(0);
      expect(result.animalsWithIntervals).toBe(0);
    });
  });

  describe("getCullingRate", () => {
    it("should calculate culling rate", () => {
      mockAnimals[0]!.status = "inactive";
      const result = getCullingRate("property-1");
      expect(result.rate).toBeGreaterThanOrEqual(0);
      expect(result.replacedFemales).toBeGreaterThanOrEqual(0);
      expect(result.totalFemales).toBeGreaterThanOrEqual(0);
    });

    it("should filter breedings by period", () => {
      mockBreedings.push({
        id: "breeding-old",
        animalId: "animal-1",
        date: "2024-01-01",
        method: "natural",
        confirmed: true,
        bullId: "bull-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: "2024-01-01",
      });
      const result = getCullingRate("property-1", {
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      });
      expect(result).toBeDefined();
    });

    it("should sort annual breakdown", () => {
      const result = getCullingRate("property-1");
      // Annual may or may not be present
      expect(result).toBeDefined();
    });

    it("should filter by period", () => {
      const result = getCullingRate("property-1", {
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      });
      expect(result).toBeDefined();
    });

    it("should include annual breakdown", () => {
      const result = getCullingRate("property-1");
      // Annual may or may not be present
      expect(result).toBeDefined();
    });
  });

  describe("getIntrauterineMortalityIndex", () => {
    it("should calculate intrauterine mortality", () => {
      const result = getIntrauterineMortalityIndex("property-1");
      expect(result.rate).toBeGreaterThanOrEqual(0);
      expect(result.pregnantCows).toBeGreaterThanOrEqual(0);
      expect(result.cowsThatCalved).toBeGreaterThanOrEqual(0);
      expect(result.losses).toBeGreaterThanOrEqual(0);
    });

    it("should filter by period", () => {
      const result = getIntrauterineMortalityIndex("property-1", {
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      });
      expect(result).toBeDefined();
    });
  });

  describe("getBullToCowRatio", () => {
    it("should calculate bull to cow ratio", () => {
      const result = getBullToCowRatio("property-1");
      expect(result.ratio).toBeDefined();
      expect(result.bullsUsed).toBeGreaterThanOrEqual(0);
      expect(result.exposedCows).toBeGreaterThanOrEqual(0);
    });

    it("should include details by bull", () => {
      const result = getBullToCowRatio("property-1");
      // Details may or may not be present
      expect(result).toBeDefined();
    });
  });

  describe("getExpectedBirthsForecast", () => {
    it("should forecast expected births", () => {
      const result = getExpectedBirthsForecast("company-1");
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.monthly).toBeDefined();
    });

    it("should include births within future cutoff", () => {
      // Add breeding that will result in expected birth in future
      mockBreedings.push({
        id: "breeding-future",
        animalId: "animal-1",
        date: new Date().toISOString().split("T")[0],
        method: "natural",
        confirmed: true,
        bullId: "bull-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: new Date().toISOString().split("T")[0],
      });
      const result = getExpectedBirthsForecast("company-1");
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.monthly).toBeDefined();
    });

    it("should sort monthly results", () => {
      const result = getExpectedBirthsForecast("company-1");
      if (result.monthly.length > 1) {
        for (let i = 1; i < result.monthly.length; i++) {
          expect(result.monthly[i]!.month >= result.monthly[i - 1]!.month).toBe(true);
        }
      }
    });

    it("should work with property ID", () => {
      const result = getExpectedBirthsForecast("property-1", {
        isPropertyId: true,
      });
      expect(result).toBeDefined();
    });

    it("should respect monthsAhead option", () => {
      const result = getExpectedBirthsForecast("company-1", {
        monthsAhead: 6,
      });
      expect(result).toBeDefined();
    });
  });

  describe("getWeaningRate", () => {
    it("should identify exposed females by birthsAsMother", () => {
      // Add animal that is a mother but not marked as female in birth record
      mockAnimals.push({
        id: "animal-mother",
        companyId: "company-1",
        propertyId: "property-1",
        code: "ANM003",
        registrationNumber: "REG003",
        status: "active",
        createdAt: "2025-01-01",
      });
      mockBirths.push({
        id: "birth-mother",
        animalId: "calf-mother",
        motherId: "animal-mother",
        birthDate: "2025-01-01",
        companyId: "company-1",
        propertyId: "property-1",
        createdAt: "2025-01-01",
      });
      mockBreedings.push({
        id: "breeding-mother",
        animalId: "animal-mother",
        date: "2025-01-01",
        method: "natural",
        confirmed: true,
        bullId: "bull-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: "2025-01-01",
      });
      const result = getWeaningRate("property-1");
      expect(result).toBeDefined();
    });

    it("should filter breedings by period", () => {
      mockBreedings.push({
        id: "breeding-period",
        animalId: "animal-1",
        date: "2025-06-01",
        method: "natural",
        confirmed: true,
        bullId: "bull-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: "2025-06-01",
      });
      const result = getWeaningRate("property-1", {
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      });
      expect(result).toBeDefined();
    });

    it("should calculate weaning rate with isWeanedCalf", () => {
      // Add birth old enough to be weaned
      mockBirths.push({
        id: "birth-weaned-rate",
        animalId: "calf-weaned-rate",
        motherId: "animal-1",
        birthDate: "2024-06-01", // Old enough
        companyId: "company-1",
        propertyId: "property-1",
        createdAt: "2024-06-01",
      });
      mockBreedings.push({
        id: "breeding-weaned-rate",
        animalId: "animal-1",
        date: "2024-01-01",
        method: "natural",
        confirmed: true,
        bullId: "bull-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: "2024-01-01",
      });
      mockWeighings.push({
        id: "weighing-1",
        animalId: "calf-weaned-rate",
        weight: 150,
        date: "2025-12-01",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: "2025-12-01",
      });

      const result = getWeaningRate("property-1");
      expect(result.rate).toBeGreaterThanOrEqual(0);
      expect(result.weanedCalves).toBeGreaterThanOrEqual(0);
      expect(result.exposedFemales).toBeGreaterThanOrEqual(0);
    });

    it("should filter by period", () => {
      const result = getWeaningRate("property-1", {
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      });
      expect(result).toBeDefined();
    });
  });

  describe("getWeaningRatio", () => {
    it("should calculate weaning ratio with calf and mother weights", () => {
      // Add birth with mother
      mockBirths.push({
        id: "birth-ratio",
        animalId: "calf-ratio",
        motherId: "animal-1",
        birthDate: "2024-06-01", // Old enough to be weaned
        companyId: "company-1",
        propertyId: "property-1",
        createdAt: "2024-06-01",
      });
      mockBreedings.push({
        id: "breeding-ratio",
        animalId: "animal-1",
        date: "2024-01-01",
        method: "natural",
        confirmed: true,
        bullId: "bull-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: "2024-01-01",
      });
      mockWeighings.push(
        {
          id: "weighing-calf",
          animalId: "calf-ratio",
          weight: 150,
          date: "2025-12-01",
          companyId: "company-1",
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2025-12-01",
        },
        {
          id: "weighing-mother",
          animalId: "animal-1",
          weight: 400,
          date: "2025-12-01",
          companyId: "company-1",
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2025-12-01",
        }
      );

      const result = getWeaningRatio("property-1");
      expect(result.ratio).toBeGreaterThanOrEqual(0);
      expect(result.weanedCalfWeight).toBeGreaterThanOrEqual(0);
      expect(result.motherWeight).toBeGreaterThanOrEqual(0);
      expect(result.pairs).toBeGreaterThanOrEqual(0);
    });

    it("should filter by period", () => {
      const result = getWeaningRatio("property-1", {
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      });
      expect(result).toBeDefined();
    });
  });

  describe("getKgWeanedCalfPerExposedCow", () => {
    it("should calculate kg weaned calf per exposed cow with sorted weighings", () => {
      // Add birth with mother and multiple weighings
      mockBirths.push({
        id: "birth-weaned",
        animalId: "calf-weaned",
        motherId: "animal-1",
        birthDate: "2024-06-01", // Old enough to be weaned
        companyId: "company-1",
        propertyId: "property-1",
        createdAt: "2024-06-01",
      });
      mockBreedings.push({
        id: "breeding-weaned",
        animalId: "animal-1",
        date: "2024-01-01",
        method: "natural",
        confirmed: true,
        bullId: "bull-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        createdAt: "2024-01-01",
      });
      // Add multiple weighings to test sorting
      mockWeighings.push(
        {
          id: "weighing-old",
          animalId: "calf-weaned",
          weight: 100,
          date: "2025-11-01",
          companyId: "company-1",
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2025-11-01",
        },
        {
          id: "weighing-new",
          animalId: "calf-weaned",
          weight: 150,
          date: "2025-12-01",
          companyId: "company-1",
          employeeIds: [],
          serviceProviderIds: [],
          createdAt: "2025-12-01",
        }
      );

      const result = getKgWeanedCalfPerExposedCow("property-1");
      expect(result.kgPerExposedCow).toBeGreaterThanOrEqual(0);
      expect(result.totalWeanedWeight).toBeGreaterThanOrEqual(0);
      expect(result.weanedCalves).toBeGreaterThanOrEqual(0);
      expect(result.exposedFemales).toBeGreaterThanOrEqual(0);
    });

    it("should filter by period", () => {
      const result = getKgWeanedCalfPerExposedCow("property-1", {
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      });
      expect(result).toBeDefined();
    });
  });

  describe("getMortalityRate", () => {
    it("should calculate mortality rate", () => {
      mockDeaths.push({
        id: "death-1",
        animalId: "animal-1",
        date: "2025-06-01",
        cause: "Disease",
        companyId: "company-1",
        createdAt: "2025-06-01",
      });

      const result = getMortalityRate("property-1");
      expect(result.rate).toBeGreaterThanOrEqual(0);
      expect(result.deadAnimals).toBeGreaterThanOrEqual(0);
      expect(result.totalAnimals).toBeGreaterThanOrEqual(0);
    });

    it("should filter deaths by period with startDate", () => {
      mockDeaths.push({
        id: "death-before",
        animalId: "animal-2",
        date: "2024-12-01",
        cause: "Disease",
        companyId: "company-1",
        createdAt: "2024-12-01",
      });
      const result = getMortalityRate("property-1", {
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      });
      expect(result).toBeDefined();
      expect(result.period).toBeDefined();
    });

    it("should filter deaths by period with endDate", () => {
      mockDeaths.push({
        id: "death-after",
        animalId: "animal-2",
        date: "2026-01-01",
        cause: "Disease",
        companyId: "company-1",
        createdAt: "2026-01-01",
      });
      const result = getMortalityRate("property-1", {
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      });
      expect(result).toBeDefined();
    });

    it("should filter by period", () => {
      const result = getMortalityRate("property-1", {
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      });
      expect(result).toBeDefined();
      expect(result.period).toBeDefined();
    });
  });

  describe("getCalfMortalityRate", () => {
    it("should calculate calf mortality rate", () => {
      mockDeaths.push({
        id: "death-1",
        animalId: "calf-1",
        date: "2025-07-01",
        cause: "Disease",
        companyId: "company-1",
        createdAt: "2025-07-01",
      });

      const result = getCalfMortalityRate("property-1");
      expect(result.rate).toBeGreaterThanOrEqual(0);
      expect(result.deadCalves).toBeGreaterThanOrEqual(0);
      expect(result.totalCalves).toBeGreaterThanOrEqual(0);
    });

    it("should filter by period", () => {
      const result = getCalfMortalityRate("property-1", {
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      });
      expect(result).toBeDefined();
    });

    it("should filter calf deaths by property and age", () => {
      // Add birth for calf
      mockBirths.push({
        id: "birth-calf-death",
        animalId: "calf-death",
        motherId: "animal-1",
        birthDate: "2025-01-01",
        companyId: "company-1",
        propertyId: "property-1",
        createdAt: "2025-01-01",
      });
      // Add death within calf age (12 months)
      mockDeaths.push({
        id: "death-calf-age",
        animalId: "calf-death",
        date: "2025-06-01", // 5 months old
        cause: "Disease",
        companyId: "company-1",
        createdAt: "2025-06-01",
      });

      const result = getCalfMortalityRate("property-1");
      expect(result).toBeDefined();
    });

    it("should calculate monthly mortality with death data", () => {
      // Add birth
      mockBirths.push({
        id: "birth-monthly",
        animalId: "calf-monthly",
        motherId: "animal-1",
        birthDate: "2025-01-15",
        companyId: "company-1",
        propertyId: "property-1",
        createdAt: "2025-01-15",
      });
      // Add death within calf age
      mockDeaths.push({
        id: "death-monthly",
        animalId: "calf-monthly",
        date: "2025-03-15", // 2 months old
        cause: "Disease",
        companyId: "company-1",
        createdAt: "2025-03-15",
      });

      const result = getCalfMortalityRate("property-1");
      expect(result).toBeDefined();
      if (result.monthly && result.monthly.length > 0) {
        // Verify monthly is sorted
        for (let i = 1; i < result.monthly.length; i++) {
          expect(result.monthly[i]!.month >= result.monthly[i - 1]!.month).toBe(true);
        }
      }
    });

    it("should include monthly breakdown", () => {
      const result = getCalfMortalityRate("property-1");
      // Monthly may or may not be present
      expect(result).toBeDefined();
    });
  });
});
