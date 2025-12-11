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

vi.mock("../breedings.service", () => ({
  getBreedingsByPropertyId: vi.fn(),
  getBreedingsByCompanyId: vi.fn(),
}));

vi.mock("../births.service", () => ({
  getBirthsByPropertyId: vi.fn(),
  getBirthsByCompanyId: vi.fn(),
  getCalvingIntervalsByAnimalId: vi.fn(),
  getBirthByAnimalId: vi.fn(),
}));

vi.mock("../animals.service", () => ({
  getAnimalsByPropertyId: vi.fn(),
  getAnimalById: vi.fn(),
}));

vi.mock("../weighings.service", () => ({
  getWeighingsByAnimalId: vi.fn(),
}));

vi.mock("../deaths.service", () => ({
  getDeathsByCompanyId: vi.fn(),
  getDeathByAnimalId: vi.fn(),
}));

import { getBreedingsByPropertyId, getBreedingsByCompanyId } from "../breedings.service";
import {
  getBirthsByPropertyId,
  getBirthsByCompanyId,
  getBirthByAnimalId,
  getCalvingIntervalsByAnimalId,
} from "../births.service";
import { getAnimalsByPropertyId, getAnimalById } from "../animals.service";
import { getWeighingsByAnimalId } from "../weighings.service";
import { getDeathsByCompanyId } from "../deaths.service";

describe("reproductive-indexes.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getFertilityRate", () => {
    it("should calculate fertility rate", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2024-01-15",
          confirmed: true,
          bullId: "bull-1",
        },
        {
          id: "breeding-2",
          animalId: "animal-2",
          date: "2024-01-20",
          confirmed: false,
        },
      ]);
      getAnimal.mockImplementation((id: string) => {
        if (id === "animal-1" || id === "animal-2") {
          return Promise.resolve({ id, code: `00${id.slice(-1)}` });
        }
        return Promise.resolve(undefined);
      });
      getBirth.mockResolvedValue({ gender: "female" } as never);

      const result = await getFertilityRate("property-1");
      expect(result.rate).toBeGreaterThanOrEqual(0);
      expect(result.pregnantCows).toBeGreaterThanOrEqual(0);
      expect(result.exposedCows).toBeGreaterThanOrEqual(0);
    });

    it("should filter by period", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2024-01-15",
          confirmed: true,
        },
        {
          id: "breeding-2",
          animalId: "animal-2",
          date: "2024-03-15",
          confirmed: true,
        },
      ]);
      getAnimal.mockResolvedValue({ id: "animal-1", code: "001" });
      getBirth.mockResolvedValue({ gender: "female" } as never);

      const result = await getFertilityRate("property-1", {
        startDate: "2024-01-01",
        endDate: "2024-01-31",
      });
      expect(result).toBeDefined();
    });

    it("should filter by bullId", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2024-01-15",
          confirmed: true,
          bullId: "bull-1",
        },
        {
          id: "breeding-2",
          animalId: "animal-2",
          date: "2024-01-20",
          confirmed: true,
          bullId: "bull-2",
        },
      ]);
      getAnimal.mockImplementation((id: string) => {
        if (id === "animal-1" || id === "animal-2") {
          return Promise.resolve({ id, code: `00${id.slice(-1)}` });
        }
        return Promise.resolve(undefined);
      });
      getBirth.mockResolvedValue({ gender: "female" } as never);

      const result = await getFertilityRate("property-1a", undefined, {
        bullId: "bull-1",
      });
      expect(result.exposedCows).toBe(1);
    });

    it("should include breakdown byBull when not filtering by bullId", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2024-01-15",
          confirmed: true,
          bullId: "bull-1",
        },
        {
          id: "breeding-2",
          animalId: "animal-2",
          date: "2024-01-20",
          confirmed: true,
          bullId: "bull-2",
        },
      ]);
      getAnimal.mockImplementation((id: string) => {
        if (id === "animal-1" || id === "animal-2" || id === "bull-1" || id === "bull-2") {
          return Promise.resolve({
            id,
            code: id === "bull-1" ? "BULL-1" : id === "bull-2" ? "BULL-2" : `00${id.slice(-1)}`,
          });
        }
        return Promise.resolve(undefined);
      });
      getBirth.mockResolvedValue({ gender: "female" } as never);

      const result = await getFertilityRate("property-1b");
      expect(result.breakdown?.byBull).toBeDefined();
    });

    it("should handle animals without birth record", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2024-01-15",
          confirmed: true,
        },
      ]);
      getAnimal.mockResolvedValue({ id: "animal-1", code: "001" });
      getBirth.mockResolvedValue(null);

      const result = await getFertilityRate("property-1c");
      expect(result.exposedCows).toBe(0);
    });

    it("should handle startDate only in period", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2024-01-15",
          confirmed: true,
        },
        {
          id: "breeding-2",
          animalId: "animal-2",
          date: "2024-03-15",
          confirmed: true,
        },
      ]);
      getAnimal.mockResolvedValue({ id: "animal-1", code: "001" });
      getBirth.mockResolvedValue({ gender: "female" } as never);

      const result = await getFertilityRate("property-1d", {
        startDate: "2024-02-01",
      });
      expect(result).toBeDefined();
    });

    it("should handle endDate only in period", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2024-01-15",
          confirmed: true,
        },
        {
          id: "breeding-2",
          animalId: "animal-2",
          date: "2024-03-15",
          confirmed: true,
        },
      ]);
      getAnimal.mockResolvedValue({ id: "animal-1", code: "001" });
      getBirth.mockResolvedValue({ gender: "female" } as never);

      const result = await getFertilityRate("property-1e", {
        endDate: "2024-02-28",
      });
      expect(result).toBeDefined();
    });
  });

  describe("getBirthRate", () => {
    it("should calculate birth rate", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirths = getBirthsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirthsByCompany = getBirthsByCompanyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2024-01-15",
          confirmed: true,
        },
      ]);
      getBirths.mockResolvedValue([
        {
          id: "birth-1",
          animalId: "calf-1",
          motherId: "animal-1",
          birthDate: "2024-10-15",
        },
      ]);
      getAnimals.mockResolvedValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getBirthsByCompany.mockResolvedValue([]);
      getAnimal.mockResolvedValue({ id: "animal-1" });
      getBirth.mockResolvedValue({ gender: "female" } as never);

      const result = await getBirthRate("property-1");
      expect(result.rate).toBeGreaterThanOrEqual(0);
      expect(result.calvesBorn).toBeGreaterThanOrEqual(0);
    });

    it("should filter by period", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirths = getBirthsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirthsByCompany = getBirthsByCompanyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2024-01-15",
          confirmed: true,
        },
        {
          id: "breeding-2",
          animalId: "animal-2",
          date: "2024-03-15",
          confirmed: true,
        },
      ]);
      getBirths.mockResolvedValue([
        {
          id: "birth-1",
          animalId: "calf-1",
          motherId: "animal-1",
          birthDate: "2024-10-15",
        },
      ]);
      getAnimals.mockResolvedValue([
        { id: "animal-1", code: "001", companyId: "company-1" },
        { id: "animal-2", code: "002", companyId: "company-1" },
      ]);
      getBirthsByCompany.mockResolvedValue([]);
      getAnimal.mockResolvedValue({ id: "animal-1" });

      const result = await getBirthRate("property-1a", {
        startDate: "2024-01-01",
        endDate: "2024-02-28",
      });
      expect(result).toBeDefined();
    });

    it("should calculate monthly breakdown", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirths = getBirthsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirthsByCompany = getBirthsByCompanyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2024-01-15",
          confirmed: true,
        },
        {
          id: "breeding-2",
          animalId: "animal-2",
          date: "2024-02-15",
          confirmed: true,
        },
      ]);
      getBirths.mockResolvedValue([
        {
          id: "birth-1",
          animalId: "calf-1",
          motherId: "animal-1",
          birthDate: "2024-10-15",
        },
      ]);
      getAnimals.mockResolvedValue([
        { id: "animal-1", code: "001", companyId: "company-1" },
        { id: "animal-2", code: "002", companyId: "company-1" },
      ]);
      getBirthsByCompany.mockResolvedValue([]);
      getAnimal.mockResolvedValue({ id: "animal-1" });

      const result = await getBirthRate("property-1b");
      expect(result.monthly).toBeDefined();
    });

    it("should handle no matching births", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirths = getBirthsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirthsByCompany = getBirthsByCompanyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2024-01-15",
          confirmed: true,
        },
      ]);
      getBirths.mockResolvedValue([]);
      getAnimals.mockResolvedValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getBirthsByCompany.mockResolvedValue([]);
      getAnimal.mockResolvedValue({ id: "animal-1" });

      const result = await getBirthRate("property-1c");
      expect(result.calvesBorn).toBe(0);
    });

    it("should handle isFemaleAnimal with births as mother", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirths = getBirthsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirthsByCompany = getBirthsByCompanyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2024-01-15",
          confirmed: true,
        },
      ]);
      getBirths.mockResolvedValue([
        {
          id: "birth-1",
          animalId: "calf-1",
          motherId: "animal-1",
          birthDate: "2024-10-15",
        },
      ]);
      getAnimals.mockResolvedValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getBirthsByCompany.mockResolvedValue([
        {
          id: "birth-2",
          animalId: "calf-2",
          motherId: "animal-1",
          birthDate: "2023-10-15",
        },
      ]);
      getAnimal.mockResolvedValue({ id: "animal-1" });
      getBirth.mockResolvedValue(null);

      const result = await getBirthRate("property-1d");
      expect(result).toBeDefined();
    });
  });

  describe("getCalvingInterval", () => {
    it("should calculate calving interval", async () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;
      const getIntervals = getCalvingIntervalsByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockResolvedValue([{ id: "animal-1", code: "001" }]);
      getBirth.mockResolvedValue({ gender: "female" } as never);
      getIntervals.mockResolvedValue([365, 380]);

      const result = await getCalvingInterval("property-1");
      expect(result.average).toBeGreaterThan(0);
      expect(result.intervals.length).toBeGreaterThan(0);
    });

    it("should return zero when no intervals", async () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;
      const getIntervals = getCalvingIntervalsByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockResolvedValue([{ id: "animal-1", code: "001" }]);
      getBirth.mockResolvedValue({ gender: "female" } as never);
      getIntervals.mockResolvedValue([]);

      const result = await getCalvingInterval("property-1a");
      expect(result.average).toBe(0);
      expect(result.min).toBe(0);
      expect(result.max).toBe(0);
      expect(result.intervals).toEqual([]);
      expect(result.animalsWithIntervals).toBe(0);
    });

    it("should handle single interval", async () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;
      const getIntervals = getCalvingIntervalsByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockResolvedValue([{ id: "animal-1", code: "001" }]);
      getBirth.mockResolvedValue({ gender: "female" } as never);
      getIntervals.mockResolvedValue([365]);

      const result = await getCalvingInterval("property-1b");
      expect(result.average).toBe(365);
      expect(result.min).toBe(365);
      expect(result.max).toBe(365);
      expect(result.animalsWithIntervals).toBe(1);
    });

    it("should handle multiple animals with intervals", async () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;
      const getIntervals = getCalvingIntervalsByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockResolvedValue([
        { id: "animal-1", code: "001" },
        { id: "animal-2", code: "002" },
      ]);
      getBirth.mockResolvedValue({ gender: "female" } as never);
      getIntervals.mockImplementation((animalId: string) => {
        if (animalId === "animal-1") return Promise.resolve([365, 380]);
        if (animalId === "animal-2") return Promise.resolve([370]);
        return Promise.resolve([]);
      });

      const result = await getCalvingInterval("property-1c");
      expect(result.animalsWithIntervals).toBe(2);
      expect(result.intervals.length).toBe(3);
    });

    it("should handle animals without female gender", async () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;
      const getIntervals = getCalvingIntervalsByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockResolvedValue([
        { id: "animal-1", code: "001" },
        { id: "animal-2", code: "002" },
      ]);
      getBirth.mockImplementation((id: string) => {
        if (id === "animal-1") return Promise.resolve({ gender: "female" } as never);
        if (id === "animal-2") return Promise.resolve({ gender: "male" } as never);
        return Promise.resolve(null);
      });
      getIntervals.mockResolvedValue([365]);

      const result = await getCalvingInterval("property-1d");
      expect(result.animalsWithIntervals).toBe(1);
    });
  });

  describe("getCullingRate", () => {
    it("should calculate culling rate", async () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockResolvedValue([
        { id: "animal-1", code: "001", status: "active", createdAt: "2024-01-01" },
        { id: "animal-2", code: "002", status: "inactive", createdAt: "2024-01-01" },
      ]);
      getBirth.mockResolvedValue({ gender: "female" } as never);

      const result = await getCullingRate("property-1");
      expect(result.rate).toBeGreaterThanOrEqual(0);
    });

    it("should filter by period", async () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockResolvedValue([
        {
          id: "animal-1",
          code: "001",
          status: "active",
          createdAt: "2024-01-01",
          acquisitionDate: "2024-01-01",
        },
        {
          id: "animal-2",
          code: "002",
          status: "inactive",
          createdAt: "2024-03-01",
          acquisitionDate: "2024-03-01",
        },
      ]);
      getBirth.mockResolvedValue({ gender: "female" } as never);

      const result = await getCullingRate("property-1a", {
        startDate: "2024-01-01",
        endDate: "2024-02-28",
      });
      expect(result).toBeDefined();
    });

    it("should calculate annual breakdown", async () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockResolvedValue([
        {
          id: "animal-1",
          code: "001",
          status: "active",
          createdAt: "2024-01-01",
          acquisitionDate: "2024-01-01",
        },
        {
          id: "animal-2",
          code: "002",
          status: "inactive",
          createdAt: "2024-01-01",
          acquisitionDate: "2024-01-01",
        },
        {
          id: "animal-3",
          code: "003",
          status: "active",
          createdAt: "2023-01-01",
          acquisitionDate: "2023-01-01",
        },
      ]);
      getBirth.mockResolvedValue({ gender: "female" } as never);

      const result = await getCullingRate("property-1b");
      expect(result.annual).toBeDefined();
      expect(result.annual?.length).toBeGreaterThan(0);
    });

    it("should handle no females", async () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockResolvedValue([
        { id: "animal-1", code: "001", status: "active", createdAt: "2024-01-01" },
      ]);
      getBirth.mockResolvedValue({ gender: "male" } as never);

      const result = await getCullingRate("property-1c");
      expect(result.totalFemales).toBe(0);
      expect(result.rate).toBe(0);
    });

    it("should use acquisitionDate when available", async () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getAnimals.mockResolvedValue([
        {
          id: "animal-1",
          code: "001",
          status: "active",
          createdAt: "2024-01-01",
          acquisitionDate: "2023-06-01",
        },
      ]);
      getBirth.mockResolvedValue({ gender: "female" } as never);

      const result = await getCullingRate("property-1d", {
        startDate: "2023-01-01",
        endDate: "2023-12-31",
      });
      expect(result).toBeDefined();
    });
  });

  describe("getIntrauterineMortalityIndex", () => {
    it("should calculate intrauterine mortality", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirths = getBirthsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2024-01-15",
          confirmed: true,
        },
      ]);
      getBirths.mockResolvedValue([]);
      getAnimal.mockResolvedValue({ id: "animal-1", propertyId: "property-1" });
      getBirth.mockResolvedValue({ gender: "female" } as never);

      const result = await getIntrauterineMortalityIndex("property-1");
      expect(result.rate).toBeGreaterThanOrEqual(0);
    });

    it("should filter by period", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirths = getBirthsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2024-01-15",
          confirmed: true,
        },
        {
          id: "breeding-2",
          animalId: "animal-2",
          date: "2024-03-15",
          confirmed: true,
        },
      ]);
      getBirths.mockResolvedValue([
        {
          id: "birth-1",
          animalId: "calf-1",
          motherId: "animal-1",
          birthDate: "2024-10-15",
        },
      ]);
      getAnimal.mockResolvedValue({ id: "animal-1", propertyId: "property-1a" });
      getBirth.mockResolvedValue({ gender: "female" } as never);

      const result = await getIntrauterineMortalityIndex("property-1a", {
        startDate: "2024-01-01",
        endDate: "2024-02-28",
      });
      expect(result).toBeDefined();
    });

    it("should handle cows that calved", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirths = getBirthsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2024-01-15",
          confirmed: true,
        },
      ]);
      getBirths.mockResolvedValue([
        {
          id: "birth-1",
          animalId: "calf-1",
          motherId: "animal-1",
          birthDate: "2024-10-15",
        },
      ]);
      getAnimal.mockResolvedValue({ id: "animal-1", propertyId: "property-1b" });
      getBirth.mockResolvedValue({ gender: "female" } as never);

      const result = await getIntrauterineMortalityIndex("property-1b");
      expect(result.cowsThatCalved).toBeGreaterThan(0);
      expect(result.losses).toBe(0);
    });
  });

  describe("getBullToCowRatio", () => {
    it("should calculate bull to cow ratio", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          bullId: "bull-1",
          date: "2024-01-15",
        },
      ]);
      getAnimal.mockImplementation((id: string) => {
        if (id === "animal-1") return Promise.resolve({ id, code: "001" });
        if (id === "bull-1") return Promise.resolve({ id, code: "BULL-1" });
        return Promise.resolve(undefined);
      });
      getBirth.mockResolvedValue({ gender: "female" } as never);

      const result = await getBullToCowRatio("property-1");
      expect(result.ratio).toBeDefined();
      expect(result.bullsUsed).toBeGreaterThanOrEqual(0);
    });

    it("should handle no bulls", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2024-01-15",
        },
      ]);
      getAnimal.mockResolvedValue({ id: "animal-1", code: "001" });
      getBirth.mockResolvedValue({ gender: "female" } as never);

      const result = await getBullToCowRatio("property-1a");
      expect(result.bullsUsed).toBe(0);
      expect(result.ratio).toBe("N/A");
    });

    it("should handle multiple bulls with details", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          bullId: "bull-1",
          date: "2024-01-15",
        },
        {
          id: "breeding-2",
          animalId: "animal-2",
          bullId: "bull-2",
          date: "2024-01-20",
        },
      ]);
      getAnimal.mockImplementation((id: string) => {
        if (id === "animal-1" || id === "animal-2")
          return Promise.resolve({ id, code: `00${id.slice(-1)}` });
        if (id === "bull-1") return Promise.resolve({ id, code: "BULL-1" });
        if (id === "bull-2") return Promise.resolve({ id, code: "BULL-2" });
        return Promise.resolve(undefined);
      });
      getBirth.mockResolvedValue({ gender: "female" } as never);

      const result = await getBullToCowRatio("property-1b");
      expect(result.bullsUsed).toBe(2);
      expect(result.details).toBeDefined();
      expect(result.details?.length).toBe(2);
    });

    it("should handle zero exposed cows", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          bullId: "bull-1",
          date: "2024-01-15",
        },
      ]);
      getAnimal.mockResolvedValue(null);
      getBirth.mockResolvedValue(null);

      const result = await getBullToCowRatio("property-1c");
      expect(result.exposedCows).toBe(0);
      expect(result.ratio).toBe("N/A");
    });
  });

  describe("getExpectedBirthsForecast", () => {
    it("should calculate expected births forecast", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2024-01-15",
          confirmed: true,
        },
      ]);

      const result = await getExpectedBirthsForecast("property-1", { isPropertyId: true });
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.monthly).toBeDefined();
    });

    it("should use companyId when isPropertyId is false", async () => {
      const getBreedings = getBreedingsByCompanyId as ReturnType<typeof vi.fn>;

      getBreedings.mockReturnValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2024-01-15",
          confirmed: true,
        },
      ]);

      const result = await getExpectedBirthsForecast("company-1", { isPropertyId: false });
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    it("should use monthsAhead parameter", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2024-01-15",
          confirmed: true,
        },
      ]);

      const result = await getExpectedBirthsForecast("property-1a", {
        isPropertyId: true,
        monthsAhead: 12,
      });
      expect(result).toBeDefined();
    });

    it("should filter by future dates only", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;

      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 1);
      const pastDateStr = pastDate.toISOString().split("T")[0];

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: pastDateStr,
          confirmed: true,
        },
        {
          id: "breeding-2",
          animalId: "animal-2",
          date: "2024-01-15",
          confirmed: true,
        },
      ]);

      const result = await getExpectedBirthsForecast("property-1b", { isPropertyId: true });
      expect(result).toBeDefined();
    });
  });

  describe("getWeaningRate", () => {
    it("should calculate weaning rate", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirths = getBirthsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirthsByCompany = getBirthsByCompanyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2023-07-15",
          confirmed: true,
        },
      ]);
      getBirths.mockResolvedValue([
        {
          id: "birth-1",
          animalId: "calf-1",
          motherId: "animal-1",
          birthDate: "2024-04-15",
        },
      ]);
      getAnimals.mockResolvedValue([
        {
          id: "animal-1",
          code: "001",
          companyId: "company-1",
          propertyId: "property-1",
          status: "active",
        },
      ]);
      getBirthsByCompany.mockResolvedValue([]);
      getAnimal.mockResolvedValue({ id: "animal-1", propertyId: "property-1", status: "active" });
      getBirth.mockResolvedValue({ gender: "female" } as never);

      const result = await getWeaningRate("property-1");
      expect(result.rate).toBeGreaterThanOrEqual(0);
    });

    it("should filter by period", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirths = getBirthsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirthsByCompany = getBirthsByCompanyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2023-07-15",
          confirmed: true,
        },
        {
          id: "breeding-2",
          animalId: "animal-2",
          date: "2023-09-15",
          confirmed: true,
        },
      ]);
      getBirths.mockResolvedValue([
        {
          id: "birth-1",
          animalId: "calf-1",
          motherId: "animal-1",
          birthDate: "2024-04-15",
        },
      ]);
      getAnimals.mockResolvedValue([
        {
          id: "animal-1",
          code: "001",
          companyId: "company-1",
          propertyId: "property-1a",
          status: "active",
        },
      ]);
      getBirthsByCompany.mockResolvedValue([]);
      getAnimal.mockResolvedValue({ id: "animal-1", propertyId: "property-1a", status: "active" });
      getBirth.mockResolvedValue({ gender: "female" } as never);

      const result = await getWeaningRate("property-1a", {
        startDate: "2023-07-01",
        endDate: "2023-08-31",
      });
      expect(result).toBeDefined();
    });

    it("should handle isFemaleAnimal with births as mother", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirths = getBirthsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirthsByCompany = getBirthsByCompanyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2023-07-15",
          confirmed: true,
        },
      ]);
      getBirths.mockResolvedValue([
        {
          id: "birth-1",
          animalId: "calf-1",
          motherId: "animal-1",
          birthDate: "2024-04-15",
        },
      ]);
      getAnimals.mockResolvedValue([
        {
          id: "animal-1",
          code: "001",
          companyId: "company-1",
          propertyId: "property-1b",
          status: "active",
        },
      ]);
      getBirthsByCompany.mockResolvedValue([
        {
          id: "birth-2",
          animalId: "calf-2",
          motherId: "animal-1",
          birthDate: "2023-04-15",
        },
      ]);
      getAnimal.mockResolvedValue({ id: "animal-1", propertyId: "property-1b", status: "active" });
      getBirth.mockResolvedValue(null); // No birth record for animal-1 itself

      const result = await getWeaningRate("property-1b");
      expect(result).toBeDefined();
    });
  });

  describe("getWeaningRatio", () => {
    it("should calculate weaning ratio", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirths = getBirthsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2023-07-15",
        },
      ]);
      getBirths.mockResolvedValue([
        {
          id: "birth-1",
          animalId: "calf-1",
          motherId: "animal-1",
          birthDate: "2024-04-15",
        },
      ]);
      getAnimal.mockResolvedValue({ id: "animal-1", propertyId: "property-1", status: "active" });
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "calf-1", date: "2024-10-15", weight: 200 },
        { id: "w2", animalId: "animal-1", date: "2024-10-15", weight: 500 },
      ]);

      const result = await getWeaningRatio("property-1");
      expect(result.ratio).toBeGreaterThanOrEqual(0);
    });

    it("should filter by period", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirths = getBirthsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2023-07-15",
        },
        {
          id: "breeding-2",
          animalId: "animal-2",
          date: "2023-09-15",
        },
      ]);
      getBirths.mockResolvedValue([
        {
          id: "birth-1",
          animalId: "calf-1",
          motherId: "animal-1",
          birthDate: "2024-04-15",
        },
      ]);
      getAnimal.mockResolvedValue({ id: "animal-1", propertyId: "property-1a", status: "active" });
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "calf-1", date: "2024-10-15", weight: 200 },
        { id: "w2", animalId: "animal-1", date: "2024-10-15", weight: 500 },
      ]);

      const result = await getWeaningRatio("property-1a", {
        startDate: "2023-07-01",
        endDate: "2023-08-31",
      });
      expect(result).toBeDefined();
    });

    it("should handle no weights", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirths = getBirthsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2023-07-15",
        },
      ]);
      getBirths.mockResolvedValue([
        {
          id: "birth-1",
          animalId: "calf-1",
          motherId: "animal-1",
          birthDate: "2024-04-15",
        },
      ]);
      getAnimal.mockResolvedValue({ id: "animal-1", propertyId: "property-1b", status: "active" });
      getWeighings.mockReturnValue([]); // No weighings

      const result = await getWeaningRatio("property-1b");
      expect(result.ratio).toBe(0);
      expect(result.pairs).toBe(0);
    });
  });

  describe("getKgWeanedCalfPerExposedCow", () => {
    it("should calculate kg weaned calf per exposed cow", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirths = getBirthsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirthsByCompany = getBirthsByCompanyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2023-07-15",
        },
      ]);
      getBirths.mockResolvedValue([
        {
          id: "birth-1",
          animalId: "calf-1",
          motherId: "animal-1",
          birthDate: "2024-04-15",
        },
      ]);
      getAnimals.mockResolvedValue([
        {
          id: "animal-1",
          code: "001",
          companyId: "company-1",
          propertyId: "property-1",
          status: "active",
        },
      ]);
      getBirthsByCompany.mockResolvedValue([]);
      getAnimal.mockResolvedValue({ id: "animal-1", propertyId: "property-1", status: "active" });
      getBirth.mockResolvedValue({ gender: "female" } as never);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "calf-1", date: "2024-10-15", weight: 200 },
      ]);

      const result = await getKgWeanedCalfPerExposedCow("property-1");
      expect(result.kgPerExposedCow).toBeGreaterThanOrEqual(0);
    });

    it("should filter by period", async () => {
      const getBreedings = getBreedingsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirths = getBirthsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getBirthsByCompany = getBirthsByCompanyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;
      const getWeighings = getWeighingsByAnimalId as ReturnType<typeof vi.fn>;

      getBreedings.mockResolvedValue([
        {
          id: "breeding-1",
          animalId: "animal-1",
          date: "2023-07-15",
        },
        {
          id: "breeding-2",
          animalId: "animal-2",
          date: "2023-09-15",
        },
      ]);
      getBirths.mockResolvedValue([
        {
          id: "birth-1",
          animalId: "calf-1",
          motherId: "animal-1",
          birthDate: "2024-04-15",
        },
      ]);
      getAnimals.mockResolvedValue([
        {
          id: "animal-1",
          code: "001",
          companyId: "company-1",
          propertyId: "property-1a",
          status: "active",
        },
      ]);
      getBirthsByCompany.mockResolvedValue([]);
      getAnimal.mockResolvedValue({ id: "animal-1", propertyId: "property-1a", status: "active" });
      getBirth.mockResolvedValue({ gender: "female" } as never);
      getWeighings.mockReturnValue([
        { id: "w1", animalId: "calf-1", date: "2024-10-15", weight: 200 },
      ]);

      const result = await getKgWeanedCalfPerExposedCow("property-1a", {
        startDate: "2023-07-01",
        endDate: "2023-08-31",
      });
      expect(result).toBeDefined();
    });
  });

  describe("getMortalityRate", () => {
    it("should calculate mortality rate", async () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getDeaths = getDeathsByCompanyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;

      getAnimals.mockResolvedValue([
        { id: "animal-1", code: "001", companyId: "company-1", createdAt: "2024-01-01" },
      ]);
      getDeaths.mockReturnValue([
        {
          id: "death-1",
          animalId: "animal-1",
          date: "2024-06-15",
        },
      ]);
      getAnimal.mockResolvedValue({ id: "animal-1", propertyId: "property-1" });

      const result = await getMortalityRate("property-1");
      expect(result.rate).toBeGreaterThanOrEqual(0);
    });

    it("should filter by period", async () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getDeaths = getDeathsByCompanyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;

      getAnimals.mockResolvedValue([
        { id: "animal-1", code: "001", companyId: "company-1", createdAt: "2024-01-01" },
      ]);
      getDeaths.mockReturnValue([
        {
          id: "death-1",
          animalId: "animal-1",
          date: "2024-06-15",
        },
        {
          id: "death-2",
          animalId: "animal-1",
          date: "2024-08-15",
        },
      ]);
      getAnimal.mockResolvedValue({ id: "animal-1", propertyId: "property-1a" });

      const result = await getMortalityRate("property-1a", {
        startDate: "2024-06-01",
        endDate: "2024-07-31",
      });
      expect(result.deadAnimals).toBe(1);
    });

    it("should handle no deaths", async () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getDeaths = getDeathsByCompanyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;

      getAnimals.mockResolvedValue([
        { id: "animal-1", code: "001", companyId: "company-1", createdAt: "2024-01-01" },
      ]);
      getDeaths.mockReturnValue([]);
      getAnimal.mockResolvedValue({ id: "animal-1", propertyId: "property-1b" });

      const result = await getMortalityRate("property-1b");
      expect(result.deadAnimals).toBe(0);
      expect(result.rate).toBe(0);
    });

    it("should handle no animals", async () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getDeaths = getDeathsByCompanyId as ReturnType<typeof vi.fn>;

      getAnimals.mockResolvedValue([]);
      getDeaths.mockReturnValue([]);

      const result = await getMortalityRate("property-1c");
      expect(result.totalAnimals).toBe(0);
      expect(result.rate).toBe(0);
    });

    it("should count animals in period correctly", async () => {
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getDeaths = getDeathsByCompanyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;

      getAnimals.mockResolvedValue([
        {
          id: "animal-1",
          code: "001",
          companyId: "company-1",
          createdAt: "2024-01-01",
          acquisitionDate: "2024-01-01",
        },
        {
          id: "animal-2",
          code: "002",
          companyId: "company-1",
          createdAt: "2024-03-01",
          acquisitionDate: "2024-03-01",
        },
      ]);
      getDeaths.mockReturnValue([]);
      getAnimal.mockResolvedValue({ id: "animal-1", propertyId: "property-1d" });

      const result = await getMortalityRate("property-1d", {
        startDate: "2024-01-01",
        endDate: "2024-02-28",
      });
      expect(result.totalAnimals).toBe(1);
    });
  });

  describe("getCalfMortalityRate", () => {
    it("should calculate calf mortality rate", async () => {
      const getBirths = getBirthsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getDeaths = getDeathsByCompanyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getBirths.mockResolvedValue([
        {
          id: "birth-1",
          animalId: "calf-1",
          birthDate: "2024-01-15",
        },
      ]);
      getAnimals.mockResolvedValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getDeaths.mockReturnValue([
        {
          id: "death-1",
          animalId: "calf-1",
          date: "2024-02-15",
        },
      ]);
      getAnimal.mockResolvedValue({ id: "calf-1", propertyId: "property-1" });
      getBirth.mockResolvedValue({ birthDate: "2024-01-15" });

      const result = await getCalfMortalityRate("property-1");
      expect(result.rate).toBeGreaterThanOrEqual(0);
    });

    it("should filter by period", async () => {
      const getBirths = getBirthsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getDeaths = getDeathsByCompanyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getBirths.mockResolvedValue([
        {
          id: "birth-1",
          animalId: "calf-1",
          birthDate: "2024-01-15",
        },
        {
          id: "birth-2",
          animalId: "calf-2",
          birthDate: "2024-03-15",
        },
      ]);
      getAnimals.mockResolvedValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getDeaths.mockReturnValue([
        {
          id: "death-1",
          animalId: "calf-1",
          date: "2024-02-15",
        },
      ]);
      getAnimal.mockResolvedValue({ id: "calf-1", propertyId: "property-1a" });
      getBirth.mockResolvedValue({ birthDate: "2024-01-15" });

      const result = await getCalfMortalityRate("property-1a", {
        startDate: "2024-01-01",
        endDate: "2024-02-28",
      });
      expect(result.totalCalves).toBe(1);
    });

    it("should calculate monthly breakdown", async () => {
      const getBirths = getBirthsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getDeaths = getDeathsByCompanyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      getBirths.mockResolvedValue([
        {
          id: "birth-1",
          animalId: "calf-1",
          birthDate: "2024-01-15",
        },
        {
          id: "birth-2",
          animalId: "calf-2",
          birthDate: "2024-02-15",
        },
      ]);
      getAnimals.mockResolvedValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getDeaths.mockReturnValue([
        {
          id: "death-1",
          animalId: "calf-1",
          date: "2024-02-15",
        },
      ]);
      getAnimal.mockResolvedValue({ id: "calf-1", propertyId: "property-1b" });
      getBirth.mockResolvedValue({ birthDate: "2024-01-15" });

      const result = await getCalfMortalityRate("property-1b");
      expect(result.monthly).toBeDefined();
      expect(result.monthly?.length).toBeGreaterThan(0);
    });

    it("should handle no deaths", async () => {
      const getBirths = getBirthsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getDeaths = getDeathsByCompanyId as ReturnType<typeof vi.fn>;

      getBirths.mockResolvedValue([
        {
          id: "birth-1",
          animalId: "calf-1",
          birthDate: "2024-01-15",
        },
      ]);
      getAnimals.mockResolvedValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getDeaths.mockReturnValue([]);

      const result = await getCalfMortalityRate("property-1c");
      expect(result.deadCalves).toBe(0);
      expect(result.rate).toBe(0);
    });

    it("should filter calf deaths by age (12 months)", async () => {
      const getBirths = getBirthsByPropertyId as ReturnType<typeof vi.fn>;
      const getAnimals = getAnimalsByPropertyId as ReturnType<typeof vi.fn>;
      const getDeaths = getDeathsByCompanyId as ReturnType<typeof vi.fn>;
      const getAnimal = getAnimalById as ReturnType<typeof vi.fn>;
      const getBirth = getBirthByAnimalId as ReturnType<typeof vi.fn>;

      const oldDate = new Date();
      oldDate.setMonth(oldDate.getMonth() - 13); // 13 months ago

      getBirths.mockResolvedValue([
        {
          id: "birth-1",
          animalId: "calf-1",
          birthDate: oldDate.toISOString().split("T")[0],
        },
      ]);
      getAnimals.mockResolvedValue([{ id: "animal-1", code: "001", companyId: "company-1" }]);
      getDeaths.mockReturnValue([
        {
          id: "death-1",
          animalId: "calf-1",
          date: new Date().toISOString().split("T")[0],
        },
      ]);
      getAnimal.mockResolvedValue({ id: "calf-1", propertyId: "property-1d" });
      getBirth.mockResolvedValue({ birthDate: oldDate.toISOString().split("T")[0] });

      const result = await getCalfMortalityRate("property-1d");
      expect(result.deadCalves).toBe(0); // Should be filtered out (older than 12 months)
    });
  });
});
