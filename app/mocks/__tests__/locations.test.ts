import { describe, it, expect } from "vitest";
import {
  mockLocations,
  getLocationById,
  getLocationsByPropertyId,
  getLocationsByCompanyId,
  addLocation,
  deleteLocation,
  updateLocation,
} from "../locations";
import type { LocationFormData } from "~/types";
import { AreaType, LocationType } from "~/types";

describe("Locations Mock Functions", () => {
  const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";
  const PROPERTY_ID = "550e8400-e29b-41d4-a716-446655440010";

  describe("getLocationById", () => {
    it("should return location by id", () => {
      if (mockLocations.length > 0) {
        const location = getLocationById(mockLocations[0].id);
        expect(location).toBeDefined();
        expect(location?.id).toBe(mockLocations[0].id);
      }
    });

    it("should return undefined for non-existent id", () => {
      const location = getLocationById("non-existent-id");
      expect(location).toBeUndefined();
    });

    it("should return undefined for undefined id", () => {
      const location = getLocationById(undefined);
      expect(location).toBeUndefined();
    });
  });

  describe("getLocationsByPropertyId", () => {
    it("should return locations for a property", () => {
      const locations = getLocationsByPropertyId(PROPERTY_ID);
      expect(Array.isArray(locations)).toBe(true);
      locations.forEach((location) => {
        expect(location.propertyId).toBe(PROPERTY_ID);
      });
    });

    it("should return empty array for non-existent property", () => {
      const locations = getLocationsByPropertyId("non-existent-property");
      expect(locations).toEqual([]);
    });
  });

  describe("getLocationsByCompanyId", () => {
    it("should return locations for a company", () => {
      const locations = getLocationsByCompanyId(COMPANY_ID);
      expect(Array.isArray(locations)).toBe(true);
      locations.forEach((location) => {
        expect(location.companyId).toBe(COMPANY_ID);
      });
    });

    it("should return empty array for non-existent company", () => {
      const locations = getLocationsByCompanyId("non-existent-company");
      expect(locations).toEqual([]);
    });
  });

  describe("addLocation", () => {
    it("should add a new location", () => {
      const initialCount = mockLocations.length;
      const newLocationData: LocationFormData = {
        code: "999",
        name: "Test Location",
        locationType: LocationType.PASTURE,
        area: { value: 10, type: AreaType.HECTARES },
        status: "active",
        companyId: COMPANY_ID,
        propertyId: PROPERTY_ID,
      };

      const added = addLocation(newLocationData);
      expect(added).toBeDefined();
      expect(added.id).toBeDefined();
      expect(added.createdAt).toBeDefined();
      expect(added.code).toBe(newLocationData.code);
      expect(added.name).toBe(newLocationData.name);
      expect(added.locationType).toBe(newLocationData.locationType);
      expect(added.companyId).toBe(newLocationData.companyId);
      expect(added.propertyId).toBe(newLocationData.propertyId);
      expect(mockLocations.length).toBe(initialCount + 1);
    });

    it("should generate unique id for new location", () => {
      const newLocationData: LocationFormData = {
        code: "998",
        name: "Test Location 2",
        locationType: LocationType.PASTURE,
        area: { value: 20, type: AreaType.HECTARES },
        status: "active",
        companyId: COMPANY_ID,
        propertyId: PROPERTY_ID,
      };

      const added1 = addLocation(newLocationData);
      const added2 = addLocation({ ...newLocationData, code: "997" });
      expect(added1.id).not.toBe(added2.id);
    });
  });

  describe("deleteLocation", () => {
    it("should delete a location by id", () => {
      const newLocationData: LocationFormData = {
        code: "DELETE",
        name: "Delete Location",
        locationType: LocationType.PASTURE,
        area: { value: 5, type: AreaType.HECTARES },
        status: "active",
        companyId: COMPANY_ID,
        propertyId: PROPERTY_ID,
      };

      const added = addLocation(newLocationData);
      const initialCount = mockLocations.length;
      const deleted = deleteLocation(added.id);

      expect(deleted).toBe(true);
      expect(mockLocations.length).toBe(initialCount - 1);
      expect(getLocationById(added.id)).toBeUndefined();
    });

    it("should return false for non-existent id", () => {
      const deleted = deleteLocation("non-existent-id");
      expect(deleted).toBe(false);
    });
  });

  describe("updateLocation", () => {
    it("should update a location", () => {
      const newLocationData: LocationFormData = {
        code: "UPDATE",
        name: "Update Location",
        locationType: LocationType.PASTURE,
        area: { value: 15, type: AreaType.HECTARES },
        status: "active",
        companyId: COMPANY_ID,
        propertyId: PROPERTY_ID,
      };

      const added = addLocation(newLocationData);
      const updated = updateLocation(added.id, {
        name: "Updated Location",
        status: "inactive",
      });

      expect(updated).toBe(true);
      const location = getLocationById(added.id);
      expect(location?.name).toBe("Updated Location");
      expect(location?.status).toBe("inactive");
      expect(location?.code).toBe(newLocationData.code);
    });

    it("should return false for non-existent id", () => {
      const updated = updateLocation("non-existent-id", { name: "Test" });
      expect(updated).toBe(false);
    });
  });
});

