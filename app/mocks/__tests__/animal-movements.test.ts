import { describe, it, expect } from "vitest";
import { mockAnimalMovements } from "../animal-movements";
import { mockAnimals } from "../animals";
import { mockLocations } from "../locations";
import { mockEmployees } from "../employees";
import { mockServiceProviders } from "../service-providers";
import type { AnimalMovement } from "~/types";

describe("animal-movements mock", () => {
  it("should export mockAnimalMovements array", () => {
    expect(Array.isArray(mockAnimalMovements)).toBe(true);
    expect(mockAnimalMovements.length).toBeGreaterThan(0);
  });

  it("should have valid movement structure", () => {
    mockAnimalMovements.forEach((movement: AnimalMovement) => {
      expect(movement).toHaveProperty("id");
      expect(movement).toHaveProperty("date");
      expect(movement).toHaveProperty("companyId");
      expect(movement).toHaveProperty("propertyId");
      expect(movement).toHaveProperty("locationId");
      expect(movement).toHaveProperty("animalIds");
      expect(movement).toHaveProperty("employeeIds");
      expect(movement).toHaveProperty("serviceProviderIds");
      expect(movement).toHaveProperty("createdAt");

      expect(typeof movement.id).toBe("string");
      expect(typeof movement.date).toBe("string");
      expect(typeof movement.companyId).toBe("string");
      expect(typeof movement.propertyId).toBe("string");
      expect(typeof movement.locationId).toBe("string");
      expect(Array.isArray(movement.animalIds)).toBe(true);
      expect(Array.isArray(movement.employeeIds)).toBe(true);
      expect(Array.isArray(movement.serviceProviderIds)).toBe(true);
      expect(typeof movement.createdAt).toBe("string");
    });
  });

  it("should have valid date format", () => {
    mockAnimalMovements.forEach((movement: AnimalMovement) => {
      expect(movement.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(() => new Date(movement.date)).not.toThrow();
      if (movement.createdAt) {
        const createdAt = movement.createdAt;
        expect(createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(() => new Date(createdAt)).not.toThrow();
      }
    });
  });

  it("should have at least one animal in each movement", () => {
    mockAnimalMovements.forEach((movement: AnimalMovement) => {
      expect(movement.animalIds.length).toBeGreaterThan(0);
    });
  });

  it("should have valid animal IDs", () => {
    const animalIds = new Set(mockAnimals.map((a) => a.id));
    mockAnimalMovements.forEach((movement: AnimalMovement) => {
      movement.animalIds.forEach((animalId) => {
        expect(animalIds.has(animalId)).toBe(true);
      });
    });
  });

  it("should have valid location IDs", () => {
    const locationIds = new Set(mockLocations.map((l) => l.id));
    mockAnimalMovements.forEach((movement: AnimalMovement) => {
      expect(locationIds.has(movement.locationId)).toBe(true);
    });
  });

  it("should have valid employee IDs when present", () => {
    const employeeIds = new Set(mockEmployees.map((e) => e.id));
    mockAnimalMovements.forEach((movement: AnimalMovement) => {
      movement.employeeIds.forEach((employeeId) => {
        expect(employeeIds.has(employeeId)).toBe(true);
      });
    });
  });

  it("should have valid service provider IDs when present", () => {
    const serviceProviderIds = new Set(mockServiceProviders.map((sp) => sp.id));
    mockAnimalMovements.forEach((movement: AnimalMovement) => {
      movement.serviceProviderIds.forEach((serviceProviderId) => {
        expect(serviceProviderIds.has(serviceProviderId)).toBe(true);
      });
    });
  });

  it("should have valid observation when present", () => {
    mockAnimalMovements.forEach((movement: AnimalMovement) => {
      if (movement.observation) {
        expect(typeof movement.observation).toBe("string");
        expect(movement.observation.trim().length).toBeGreaterThan(0);
      }
    });
  });

  it("should have valid file IDs when present", () => {
    mockAnimalMovements.forEach((movement: AnimalMovement) => {
      if (movement.fileIds) {
        expect(Array.isArray(movement.fileIds)).toBe(true);
        movement.fileIds.forEach((fileId) => {
          expect(typeof fileId).toBe("string");
          expect(fileId.length).toBeGreaterThan(0);
        });
      }
    });
  });

  it("should be sorted by date descending", () => {
    for (let i = 0; i < mockAnimalMovements.length - 1; i++) {
      const current = new Date(mockAnimalMovements[i].date).getTime();
      const next = new Date(mockAnimalMovements[i + 1].date).getTime();
      expect(current).toBeGreaterThanOrEqual(next);
    }
  });

  it("should have unique IDs", () => {
    const ids = mockAnimalMovements.map((m) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
