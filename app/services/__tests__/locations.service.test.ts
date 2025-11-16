import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getLocationById,
  getLocationsByPropertyId,
  getLocationsByCompanyId,
  addLocation,
  updateLocation,
  deleteLocation,
} from "../locations.service";
import { mockLocations } from "~/mocks/locations";
import type { LocationFormData } from "~/types";
import { LocationType, AreaType } from "~/types/location";

vi.mock("~/mocks/locations", () => ({
  mockLocations: [],
}));

describe("locations.service", () => {
  beforeEach(() => {
    mockLocations.length = 0;
    mockLocations.push(
      {
        id: "660e8400-e29b-41d4-a716-446655440010",
        name: "Location One",
        code: "L001",
        locationType: LocationType.PASTURE,
        area: { value: 100, type: AreaType.HECTARES },
        status: "active" as const,
        propertyId: "property-1",
        companyId: "company-1",
        createdAt: "2020-01-01",
      },
      {
        id: "660e8400-e29b-41d4-a716-446655440011",
        name: "Location Two",
        code: "L002",
        locationType: LocationType.PASTURE,
        area: { value: 200, type: AreaType.HECTARES },
        status: "active" as const,
        propertyId: "property-1",
        companyId: "company-1",
        createdAt: "2020-01-02",
      },
      {
        id: "660e8400-e29b-41d4-a716-446655440012",
        name: "Location Three",
        code: "L003",
        locationType: LocationType.PASTURE,
        area: { value: 300, type: AreaType.HECTARES },
        status: "active" as const,
        propertyId: "property-2",
        companyId: "company-2",
        createdAt: "2020-01-03",
      }
    );
  });

  describe("getLocationById", () => {
    it("should return location when ID exists", () => {
      const result = getLocationById("660e8400-e29b-41d4-a716-446655440010");
      expect(result).toBeDefined();
      expect(result?.name).toBe("Location One");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getLocationById("nonexistent-id");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getLocationById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getLocationsByPropertyId", () => {
    it("should return locations for specific property", () => {
      const result = getLocationsByPropertyId("property-1");
      expect(result).toHaveLength(2);
      expect(result.every((location) => location.propertyId === "property-1")).toBe(true);
    });

    it("should return empty array when property has no locations", () => {
      const result = getLocationsByPropertyId("property-999");
      expect(result).toHaveLength(0);
    });
  });

  describe("getLocationsByCompanyId", () => {
    it("should return locations for specific company", () => {
      const result = getLocationsByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result.every((location) => location.companyId === "company-1")).toBe(true);
    });

    it("should return empty array when company has no locations", () => {
      const result = getLocationsByCompanyId("company-999");
      expect(result).toHaveLength(0);
    });
  });

  describe("addLocation", () => {
    it("should add new location with generated ID", () => {
      const formData: LocationFormData = {
        name: "New Location",
        code: "L004",
        locationType: LocationType.PASTURE,
        area: { value: 150, type: AreaType.HECTARES },
        status: "active" as const,
        propertyId: "property-1",
        companyId: "company-1",
      };

      const initialLength = mockLocations.length;
      const result = addLocation(formData);

      expect(mockLocations).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.name).toBe("New Location");
      expect(result.createdAt).toBeDefined();
    });
  });

  describe("updateLocation", () => {
    it("should update existing location", () => {
      const result = updateLocation("660e8400-e29b-41d4-a716-446655440010", {
        name: "Updated Location",
      });

      expect(result).toBe(true);
      const updated = mockLocations.find((l) => l.id === "660e8400-e29b-41d4-a716-446655440010");
      expect(updated?.name).toBe("Updated Location");
    });

    it("should return false when location does not exist", () => {
      const result = updateLocation("nonexistent-id", { name: "New Name" });
      expect(result).toBe(false);
    });
  });

  describe("deleteLocation", () => {
    it("should delete existing location", () => {
      const initialLength = mockLocations.length;
      const result = deleteLocation("660e8400-e29b-41d4-a716-446655440010");

      expect(result).toBe(true);
      expect(mockLocations).toHaveLength(initialLength - 1);
      expect(
        mockLocations.find((l) => l.id === "660e8400-e29b-41d4-a716-446655440010")
      ).toBeUndefined();
    });

    it("should return false when location does not exist", () => {
      const initialLength = mockLocations.length;
      const result = deleteLocation("nonexistent-id");

      expect(result).toBe(false);
      expect(mockLocations).toHaveLength(initialLength);
    });
  });
});
