import { describe, it, expect } from "vitest";
import { mockLocationMovements } from "../location-movements";
import { mockCompanies } from "../companies";
import { mockProperties } from "../properties";
import { mockLocations } from "../locations";
import { LocationMovementType } from "../location-movements";

describe("location-movements", () => {
  describe("mockLocationMovements", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockLocationMovements)).toBe(true);
    });

    it("should not be empty", () => {
      expect(mockLocationMovements.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockLocationMovements.forEach((movement) => {
        expect(movement).toHaveProperty("id");
        expect(movement).toHaveProperty("companyId");
        expect(movement).toHaveProperty("propertyId");
        expect(movement).toHaveProperty("locationIds");
        expect(movement).toHaveProperty("type");
        expect(movement).toHaveProperty("date");
        expect(movement).toHaveProperty("createdAt");
      });
    });

    it("should have unique IDs", () => {
      const ids = mockLocationMovements.map((m) => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid UUID format for IDs", () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      mockLocationMovements.forEach((movement) => {
        expect(movement.id).toMatch(uuidRegex);
      });
    });

    it("should have valid date format", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      mockLocationMovements.forEach((movement) => {
        expect(movement.date).toMatch(dateRegex);
      });
    });

    it("should have dates within expected range", () => {
      mockLocationMovements.forEach((movement) => {
        const date = new Date(movement.date);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2020);
        expect(date.getFullYear()).toBeLessThanOrEqual(2025);
      });
    });

    it("should have valid movement types", () => {
      const validTypes = Object.values(LocationMovementType);
      mockLocationMovements.forEach((movement) => {
        expect(validTypes).toContain(movement.type);
      });
    });

    it("should have valid location IDs array", () => {
      const locationIds = mockLocations.map((l) => l.id);
      mockLocationMovements.forEach((movement) => {
        expect(Array.isArray(movement.locationIds)).toBe(true);
        expect(movement.locationIds.length).toBeGreaterThan(0);
        movement.locationIds.forEach((locationId) => {
          expect(locationIds).toContain(locationId);
        });
      });
    });

    it("should reference valid company IDs", () => {
      const companyIds = mockCompanies.map((c) => c.id);
      mockLocationMovements.forEach((movement) => {
        expect(companyIds).toContain(movement.companyId);
      });
    });

    it("should reference valid property IDs", () => {
      const propertyIds = mockProperties.map((p) => p.id);
      mockLocationMovements.forEach((movement) => {
        expect(propertyIds).toContain(movement.propertyId);
      });
    });

    it("should have locations in same property", () => {
      const locationMap = new Map(mockLocations.map((l) => [l.id, l]));
      mockLocationMovements.forEach((movement) => {
        movement.locationIds.forEach((locationId) => {
          const location = locationMap.get(locationId);
          if (location) {
            expect(location.propertyId).toBe(movement.propertyId);
          }
        });
      });
    });
  });
});
