import { describe, it, expect } from "vitest";
import { mockAnimalMovements } from "../animal-movements";
import { mockAnimals } from "../animals";
import { mockLocations } from "../locations";
import { mockCompanies } from "../companies";
import { mockProperties } from "../properties";

describe("animal-movements", () => {
  describe("mockAnimalMovements", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockAnimalMovements)).toBe(true);
    });

    it("should not be empty", () => {
      expect(mockAnimalMovements.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockAnimalMovements.forEach((movement) => {
        expect(movement).toHaveProperty("id");
        expect(movement).toHaveProperty("date");
        expect(movement).toHaveProperty("companyId");
        expect(movement).toHaveProperty("propertyId");
        expect(movement).toHaveProperty("locationId");
        expect(movement).toHaveProperty("animalIds");
        expect(movement).toHaveProperty("createdAt");
      });
    });

    it("should have unique IDs", () => {
      const ids = mockAnimalMovements.map((m) => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid UUID format for IDs", () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      mockAnimalMovements.forEach((movement) => {
        expect(movement.id).toMatch(uuidRegex);
      });
    });

    it("should have valid date format", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      mockAnimalMovements.forEach((movement) => {
        expect(movement.date).toMatch(dateRegex);
        expect(movement.createdAt).toMatch(dateRegex);
      });
    });

    it("should have dates within expected range", () => {
      mockAnimalMovements.forEach((movement) => {
        const date = new Date(movement.date);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2020);
        expect(date.getFullYear()).toBeLessThanOrEqual(2025);
      });
    });

    it("should have valid animal IDs array", () => {
      const animalIds = mockAnimals.map((a) => a.id);
      mockAnimalMovements.forEach((movement) => {
        expect(Array.isArray(movement.animalIds)).toBe(true);
        expect(movement.animalIds.length).toBeGreaterThan(0);
        movement.animalIds.forEach((animalId) => {
          expect(animalIds).toContain(animalId);
        });
      });
    });

    it("should reference valid company IDs", () => {
      const companyIds = mockCompanies.map((c) => c.id);
      mockAnimalMovements.forEach((movement) => {
        expect(companyIds).toContain(movement.companyId);
      });
    });

    it("should reference valid property IDs", () => {
      const propertyIds = mockProperties.map((p) => p.id);
      mockAnimalMovements.forEach((movement) => {
        expect(propertyIds).toContain(movement.propertyId);
      });
    });

    it("should reference valid location IDs", () => {
      const locationIds = mockLocations.map((l) => l.id);
      mockAnimalMovements.forEach((movement) => {
        expect(locationIds).toContain(movement.locationId);
      });
    });

    it("should have location in same property", () => {
      const locationMap = new Map(mockLocations.map((l) => [l.id, l]));
      mockAnimalMovements.forEach((movement) => {
        const location = locationMap.get(movement.locationId);
        if (location) {
          expect(location.propertyId).toBe(movement.propertyId);
        }
      });
    });
  });
});
