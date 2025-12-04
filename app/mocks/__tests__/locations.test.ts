import { describe, it, expect } from "vitest";
import { mockLocations } from "../locations";
import { mockCompanies } from "../companies";
import { mockProperties } from "../properties";
import { LocationType, AreaType } from "../locations";

describe("locations", () => {
  describe("mockLocations", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockLocations)).toBe(true);
    });

    it("should not be empty", () => {
      expect(mockLocations.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockLocations.forEach((location) => {
        expect(location).toHaveProperty("id");
        expect(location).toHaveProperty("code");
        expect(location).toHaveProperty("name");
        expect(location).toHaveProperty("locationType");
        expect(location).toHaveProperty("area");
        expect(location).toHaveProperty("status");
        expect(location).toHaveProperty("createdAt");
        expect(location).toHaveProperty("companyId");
        expect(location).toHaveProperty("propertyId");
      });
    });

    it("should have unique IDs", () => {
      const ids = mockLocations.map((location) => location.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid UUID format for IDs", () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      mockLocations.forEach((location) => {
        expect(location.id).toMatch(uuidRegex);
      });
    });

    it("should have valid date format", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      mockLocations.forEach((location) => {
        expect(location.createdAt).toMatch(dateRegex);
      });
    });

    it("should have dates within expected range", () => {
      mockLocations.forEach((location) => {
        const date = new Date(location.createdAt);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2020);
        expect(date.getFullYear()).toBeLessThanOrEqual(2025);
      });
    });

    it("should have valid location types", () => {
      const validTypes = Object.values(LocationType);
      mockLocations.forEach((location) => {
        expect(validTypes).toContain(location.locationType);
      });
    });

    it("should have valid area structure", () => {
      mockLocations.forEach((location) => {
        expect(location.area).toHaveProperty("value");
        expect(location.area).toHaveProperty("type");
        expect(typeof location.area.value).toBe("number");
        expect(location.area.value).toBeGreaterThan(0);
      });
    });

    it("should have valid area types", () => {
      const validAreaTypes = Object.values(AreaType);
      mockLocations.forEach((location) => {
        expect(validAreaTypes).toContain(location.area.type);
      });
    });

    it("should have valid status", () => {
      const validStatuses = ["active", "inactive"];
      mockLocations.forEach((location) => {
        expect(validStatuses).toContain(location.status);
      });
    });

    it("should reference valid company IDs", () => {
      const companyIds = mockCompanies.map((c) => c.id);
      mockLocations.forEach((location) => {
        expect(companyIds).toContain(location.companyId);
      });
    });

    it("should reference valid property IDs", () => {
      const propertyIds = mockProperties.map((p) => p.id);
      mockLocations.forEach((location) => {
        expect(propertyIds).toContain(location.propertyId);
      });
    });
  });
});
