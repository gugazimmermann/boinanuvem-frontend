import { describe, it, expect } from "vitest";
import { mockLocations } from "../locations";
import type { Location } from "~/types";
import { LocationType, AreaType } from "~/types";

describe("locations mock", () => {
  it("should export mockLocations array", () => {
    expect(Array.isArray(mockLocations)).toBe(true);
    expect(mockLocations.length).toBeGreaterThan(0);
  });

  it("should have valid location structure", () => {
    mockLocations.forEach((location: Location) => {
      expect(location).toHaveProperty("id");
      expect(location).toHaveProperty("code");
      expect(location).toHaveProperty("name");
      expect(location).toHaveProperty("locationType");
      expect(location).toHaveProperty("area");
      expect(location).toHaveProperty("status");
      expect(location).toHaveProperty("createdAt");
      expect(location).toHaveProperty("companyId");
      expect(location).toHaveProperty("propertyId");

      expect(typeof location.id).toBe("string");
      expect(typeof location.code).toBe("string");
      expect(typeof location.name).toBe("string");
      expect(typeof location.locationType).toBe("string");
      expect(typeof location.status).toBe("string");
      expect(typeof location.createdAt).toBe("string");
      expect(typeof location.companyId).toBe("string");
      expect(typeof location.propertyId).toBe("string");
      expect(typeof location.area).toBe("object");
    });
  });

  it("should have valid area structure", () => {
    mockLocations.forEach((location: Location) => {
      expect(location.area).toHaveProperty("value");
      expect(location.area).toHaveProperty("type");
      expect(typeof location.area.value).toBe("number");
      expect(typeof location.area.type).toBe("string");
      expect(location.area.value).toBeGreaterThan(0);
    });
  });

  it("should have valid location type", () => {
    const validTypes = Object.values(LocationType);
    mockLocations.forEach((location: Location) => {
      expect(validTypes).toContain(location.locationType);
    });
  });

  it("should have valid area type", () => {
    const validAreaTypes = Object.values(AreaType);
    mockLocations.forEach((location: Location) => {
      expect(validAreaTypes).toContain(location.area.type);
    });
  });

  it("should have valid status", () => {
    mockLocations.forEach((location: Location) => {
      expect(["active", "inactive", "pending"]).toContain(location.status);
    });
  });

  it("should have valid date format", () => {
    mockLocations.forEach((location: Location) => {
      expect(location.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(() => new Date(location.createdAt)).not.toThrow();
    });
  });

  it("should have unique IDs", () => {
    const ids = mockLocations.map((l) => l.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have unique codes per property", () => {
    const codesByProperty = new Map<string, Set<string>>();
    mockLocations.forEach((location: Location) => {
      if (!codesByProperty.has(location.propertyId)) {
        codesByProperty.set(location.propertyId, new Set());
      }
      codesByProperty.get(location.propertyId)!.add(location.code);
    });

    codesByProperty.forEach((codes, propertyId) => {
      expect(codes.size).toBeGreaterThan(0);
    });
  });
});

