import { describe, it, expect } from "vitest";
import { mockWeighings } from "../weighings";
import { mockAnimals } from "../animals";
import { mockEmployees } from "../employees";
import { mockServiceProviders } from "../service-providers";
import { getBirthByAnimalId } from "~/services/births.service";
import { getAcquisitionByAnimalId } from "~/services/acquisitions.service";
import type { Weighing } from "~/types";

describe("weighings mock", () => {
  it("should export mockWeighings array", () => {
    expect(Array.isArray(mockWeighings)).toBe(true);
    expect(mockWeighings.length).toBeGreaterThan(0);
  });

  it("should have valid weighing structure", () => {
    mockWeighings.forEach((weighing: Weighing) => {
      expect(weighing).toHaveProperty("id");
      expect(weighing).toHaveProperty("animalId");
      expect(weighing).toHaveProperty("employeeIds");
      expect(weighing).toHaveProperty("serviceProviderIds");
      expect(weighing).toHaveProperty("date");
      expect(weighing).toHaveProperty("weight");
      expect(weighing).toHaveProperty("observation");
      expect(weighing).toHaveProperty("createdAt");
      expect(weighing).toHaveProperty("companyId");

      expect(typeof weighing.id).toBe("string");
      expect(typeof weighing.animalId).toBe("string");
      expect(Array.isArray(weighing.employeeIds)).toBe(true);
      expect(Array.isArray(weighing.serviceProviderIds)).toBe(true);
      expect(typeof weighing.date).toBe("string");
      expect(typeof weighing.weight).toBe("number");
      expect(typeof weighing.observation).toBe("string");
      expect(typeof weighing.createdAt).toBe("string");
      expect(typeof weighing.companyId).toBe("string");
    });
  });

  it("should have valid date format", () => {
    mockWeighings.forEach((weighing: Weighing) => {
      expect(weighing.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(() => new Date(weighing.date)).not.toThrow();
      expect(weighing.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(() => new Date(weighing.createdAt)).not.toThrow();
    });
  });

  it("should have positive weight", () => {
    mockWeighings.forEach((weighing: Weighing) => {
      expect(weighing.weight).toBeGreaterThan(0);
      expect(weighing.weight).toBeLessThan(2000);
    });
  });

  it("should have at least one employee in each weighing", () => {
    mockWeighings.forEach((weighing: Weighing) => {
      expect(weighing.employeeIds.length).toBeGreaterThan(0);
    });
  });

  it("should have valid animal IDs", () => {
    const animalIds = new Set(mockAnimals.map((a) => a.id));
    mockWeighings.forEach((weighing: Weighing) => {
      expect(animalIds.has(weighing.animalId)).toBe(true);
    });
  });

  it("should have valid employee IDs", () => {
    const employeeIds = new Set(mockEmployees.map((e) => e.id));
    mockWeighings.forEach((weighing: Weighing) => {
      weighing.employeeIds.forEach((employeeId) => {
        expect(employeeIds.has(employeeId)).toBe(true);
      });
    });
  });

  it("should have valid service provider IDs when present", () => {
    const serviceProviderIds = new Set(mockServiceProviders.map((sp) => sp.id));
    mockWeighings.forEach((weighing: Weighing) => {
      weighing.serviceProviderIds.forEach((serviceProviderId) => {
        expect(serviceProviderIds.has(serviceProviderId)).toBe(true);
      });
    });
  });

  it("should have non-empty observation", () => {
    mockWeighings.forEach((weighing: Weighing) => {
      expect(weighing.observation?.trim().length).toBeGreaterThan(0);
    });
  });

  it("should have unique IDs", () => {
    const ids = mockWeighings.map((w) => w.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have weighings sorted by date descending per animal", () => {
    const weighingsByAnimal = new Map<string, Weighing[]>();
    mockWeighings.forEach((weighing) => {
      if (!weighingsByAnimal.has(weighing.animalId)) {
        weighingsByAnimal.set(weighing.animalId, []);
      }
      weighingsByAnimal.get(weighing.animalId)!.push(weighing);
    });

    weighingsByAnimal.forEach((weighings) => {
      for (let i = 0; i < weighings.length - 1; i++) {
        const current = new Date(weighings[i].date).getTime();
        const next = new Date(weighings[i + 1].date).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });
  });

  it("should have weighings with dates after animal creation", () => {
    const animalById = new Map(mockAnimals.map((a) => [a.id, a]));
    mockWeighings.forEach((weighing) => {
      const animal = animalById.get(weighing.animalId);
      if (animal) {
        const animalDate = new Date(animal.createdAt).getTime();
        const weighingDate = new Date(weighing.date).getTime();
        expect(weighingDate).toBeGreaterThanOrEqual(animalDate);
      }
    });
  });

  it("should have weighings with dates after birth or acquisition", () => {
    mockWeighings.forEach((weighing) => {
      const birth = getBirthByAnimalId(weighing.animalId);
      const acquisition = getAcquisitionByAnimalId(weighing.animalId);
      const referenceDate =
        birth?.birthDate || acquisition?.birthDate || acquisition?.acquisitionDate;

      if (referenceDate) {
        const refDate = new Date(referenceDate).getTime();
        const weighingDate = new Date(weighing.date).getTime();
        expect(weighingDate).toBeGreaterThanOrEqual(refDate);
      }
    });
  });
});
