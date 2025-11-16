import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getLocationMovementsByLocationId,
  getLocationMovementsByPropertyId,
  getLocationMovementsByCompanyId,
  getLocationMovementsByEmployeeId,
  getLocationMovementsByServiceProviderId,
  getLocationMovementsByType,
  getLocationMovementById,
  addLocationMovement,
  updateLocationMovement,
  deleteLocationMovement,
} from "../location-movements.service";
import { mockLocationMovements } from "~/mocks/location-movements";
import { LocationMovementType } from "~/types/location-movement";
import type { LocationMovementFormData } from "~/types/location-movement";

vi.mock("~/mocks/location-movements", () => ({
  mockLocationMovements: [],
}));

describe("location-movements.service", () => {
  beforeEach(() => {
    mockLocationMovements.length = 0;
    mockLocationMovements.push(
      {
        id: "loc-movement-1",
        locationIds: ["location-1", "location-2"],
        propertyId: "property-1",
        companyId: "company-1",
        employeeIds: ["employee-1"],
        serviceProviderIds: ["provider-1"],
        type: LocationMovementType.FEED_DELIVERY,
        date: "2020-01-01",
        createdAt: "2020-01-01",
      },
      {
        id: "loc-movement-2",
        locationIds: ["location-1"],
        propertyId: "property-1",
        companyId: "company-1",
        employeeIds: ["employee-2"],
        serviceProviderIds: [],
        type: LocationMovementType.VETERINARY_SERVICE,
        date: "2020-02-01",
        createdAt: "2020-02-01",
      }
    );
  });

  describe("getLocationMovementsByLocationId", () => {
    it("should return movements for specific location", () => {
      const result = getLocationMovementsByLocationId("location-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.locationIds.includes("location-1"))).toBe(true);
    });
  });

  describe("getLocationMovementsByPropertyId", () => {
    it("should return movements for specific property", () => {
      const result = getLocationMovementsByPropertyId("property-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.propertyId === "property-1")).toBe(true);
    });
  });

  describe("getLocationMovementsByCompanyId", () => {
    it("should return movements for specific company", () => {
      const result = getLocationMovementsByCompanyId("company-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.companyId === "company-1")).toBe(true);
    });
  });

  describe("getLocationMovementsByEmployeeId", () => {
    it("should return movements for specific employee", () => {
      const result = getLocationMovementsByEmployeeId("employee-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.employeeIds.includes("employee-1"))).toBe(true);
    });
  });

  describe("getLocationMovementsByServiceProviderId", () => {
    it("should return movements for specific service provider", () => {
      const result = getLocationMovementsByServiceProviderId("provider-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.serviceProviderIds?.includes("provider-1"))).toBe(true);
    });
  });

  describe("getLocationMovementsByType", () => {
    it("should return movements of specific type", () => {
      const result = getLocationMovementsByType(LocationMovementType.FEED_DELIVERY);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.type === LocationMovementType.FEED_DELIVERY)).toBe(true);
    });
  });

  describe("getLocationMovementById", () => {
    it("should return movement when ID exists", () => {
      const result = getLocationMovementById("loc-movement-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("loc-movement-1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getLocationMovementById("nonexistent-id");
      expect(result).toBeUndefined();
    });
  });

  describe("addLocationMovement", () => {
    it("should add new movement with generated ID", () => {
      const formData: LocationMovementFormData = {
        locationIds: ["location-3"],
        propertyId: "property-1",
        companyId: "company-1",
        employeeIds: ["employee-1"],
        serviceProviderIds: [],
        type: LocationMovementType.FEED_DELIVERY,
        date: "2020-03-01",
      };

      const initialLength = mockLocationMovements.length;
      const result = addLocationMovement(formData);

      expect(mockLocationMovements).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });
  });

  describe("updateLocationMovement", () => {
    it("should update existing movement", () => {
      const result = updateLocationMovement("loc-movement-1", {
        type: LocationMovementType.VETERINARY_SERVICE,
      });

      expect(result).toBe(true);
      const updated = mockLocationMovements.find((m) => m.id === "loc-movement-1");
      expect(updated?.type).toBe(LocationMovementType.VETERINARY_SERVICE);
    });

    it("should return false when movement does not exist", () => {
      const result = updateLocationMovement("nonexistent-id", {
        type: LocationMovementType.FEED_DELIVERY,
      });
      expect(result).toBe(false);
    });
  });

  describe("deleteLocationMovement", () => {
    it("should delete existing movement", () => {
      const initialLength = mockLocationMovements.length;
      const result = deleteLocationMovement("loc-movement-1");

      expect(result).toBe(true);
      expect(mockLocationMovements).toHaveLength(initialLength - 1);
    });
  });
});
