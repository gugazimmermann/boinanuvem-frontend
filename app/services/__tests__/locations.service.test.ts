import { describe, it, expect, beforeEach } from "vitest";
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
import { LocationType, AreaType } from "~/types";

describe("locations.service", () => {
  beforeEach(() => {
    mockLocations.length = 0;
    mockLocations.push(
      {
        id: "location-1",
        companyId: "company-1",
        propertyId: "property-1",
        code: "LOC001",
        name: "Location 1",
        locationType: LocationType.PASTURE,
        area: { value: 100, type: AreaType.HECTARES },
        status: "active",
        createdAt: "2025-01-01",
      },
      {
        id: "location-2",
        companyId: "company-1",
        propertyId: "property-2",
        code: "LOC002",
        name: "Location 2",
        locationType: LocationType.BARN,
        area: { value: 50, type: AreaType.SQUARE_METERS },
        status: "active",
        createdAt: "2025-01-02",
      },
      {
        id: "location-3",
        companyId: "company-2",
        propertyId: "property-1",
        code: "LOC003",
        name: "Location 3",
        locationType: LocationType.CORRAL,
        area: { value: 200, type: AreaType.HECTARES },
        status: "inactive",
        createdAt: "2025-01-03",
      }
    );
  });

  describe("getLocationById", () => {
    it("should return location when ID exists", () => {
      const result = getLocationById("location-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("location-1");
      expect(result?.name).toBe("Location 1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getLocationById("location-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getLocationById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getLocationsByPropertyId", () => {
    it("should return all locations for a property", () => {
      const result = getLocationsByPropertyId("property-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("location-1");
      expect(result[1]?.id).toBe("location-3");
    });

    it("should return empty array when property has no locations", () => {
      const result = getLocationsByPropertyId("property-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getLocationsByCompanyId", () => {
    it("should return all locations for a company", () => {
      const result = getLocationsByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("location-1");
      expect(result[1]?.id).toBe("location-2");
    });

    it("should return empty array when company has no locations", () => {
      const result = getLocationsByCompanyId("company-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("addLocation", () => {
    it("should add a new location with generated ID", () => {
      const formData: LocationFormData = {
        companyId: "company-1",
        propertyId: "property-1",
        code: "LOC004",
        name: "Location 4",
        locationType: LocationType.FIELD,
        area: { value: 150, type: AreaType.HECTARES },
        status: "active",
      };

      const initialLength = mockLocations.length;
      const result = addLocation(formData);

      expect(mockLocations).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.companyId).toBe("company-1");
      expect(result.name).toBe("Location 4");
      expect(result.createdAt).toBeDefined();
    });

    it("should generate ID with correct prefix", () => {
      const formData: LocationFormData = {
        companyId: "company-1",
        propertyId: "property-1",
        code: "LOC004",
        name: "Location 4",
        locationType: LocationType.FIELD,
        area: { value: 150, type: AreaType.HECTARES },
        status: "active",
      };

      const result = addLocation(formData);
      expect(result.id).toContain("660e8400-e29b-41d4-a716");
    });
  });

  describe("updateLocation", () => {
    it("should update location when ID exists", () => {
      const updateData: Partial<LocationFormData> = {
        name: "Updated Location 1",
        status: "inactive",
      };

      const result = updateLocation("location-1", updateData);
      expect(result).toBe(true);

      const updated = mockLocations.find((loc) => loc.id === "location-1");
      expect(updated?.name).toBe("Updated Location 1");
      expect(updated?.status).toBe("inactive");
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<LocationFormData> = {
        name: "Updated Location",
      };

      const result = updateLocation("location-nonexistent", updateData);
      expect(result).toBe(false);
    });
  });

  describe("deleteLocation", () => {
    it("should delete location when ID exists", () => {
      const initialLength = mockLocations.length;
      const result = deleteLocation("location-1");

      expect(result).toBe(true);
      expect(mockLocations).toHaveLength(initialLength - 1);
      expect(mockLocations.find((loc) => loc.id === "location-1")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockLocations.length;
      const result = deleteLocation("location-nonexistent");

      expect(result).toBe(false);
      expect(mockLocations).toHaveLength(initialLength);
    });
  });
});
