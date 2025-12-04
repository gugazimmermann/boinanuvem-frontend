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
  deleteLocationMovement,
  updateLocationMovement,
} from "../location-movements.service";
import { mockLocationMovements } from "~/mocks/location-movements";
import type { LocationMovementFormData } from "~/types/location-movement";
import { LocationMovementType } from "~/types/location-movement";

// Mock the UUID generator
vi.mock("~/utils/uuid", () => ({
  generateUUID: vi.fn(() => "test-uuid-loc-mov"),
}));

describe("location-movements.service", () => {
  beforeEach(() => {
    mockLocationMovements.length = 0;
    mockLocationMovements.push(
      {
        id: "movement-1",
        companyId: "company-1",
        propertyId: "property-1",
        locationIds: ["location-1", "location-2"],
        employeeIds: ["employee-1"],
        serviceProviderIds: [],
        type: LocationMovementType.FEED_DELIVERY,
        date: "2025-01-01",
        observation: "Test observation 1",
        createdAt: "2025-01-01",
      },
      {
        id: "movement-2",
        companyId: "company-1",
        propertyId: "property-1",
        locationIds: ["location-1"],
        employeeIds: ["employee-1", "employee-2"],
        serviceProviderIds: ["provider-1"],
        type: LocationMovementType.VETERINARY_SERVICE,
        date: "2025-01-02",
        observation: "Test observation 2",
        createdAt: "2025-01-02",
      },
      {
        id: "movement-3",
        companyId: "company-2",
        propertyId: "property-2",
        locationIds: ["location-3"],
        employeeIds: ["employee-3"],
        serviceProviderIds: [],
        type: LocationMovementType.FEED_DELIVERY,
        date: "2025-01-03",
        observation: "Test observation 3",
        createdAt: "2025-01-03",
      }
    );
  });

  describe("getLocationMovementsByLocationId", () => {
    it("should return all movements that include the location", () => {
      const result = getLocationMovementsByLocationId("location-1");
      expect(result).toHaveLength(2);
      expect(result.every((m) => m.locationIds.includes("location-1"))).toBe(true);
    });

    it("should return empty array when location has no movements", () => {
      const result = getLocationMovementsByLocationId("location-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getLocationMovementsByPropertyId", () => {
    it("should return all movements for a property", () => {
      const result = getLocationMovementsByPropertyId("property-1");
      expect(result).toHaveLength(2);
      expect(result.every((m) => m.propertyId === "property-1")).toBe(true);
    });

    it("should return empty array when property has no movements", () => {
      const result = getLocationMovementsByPropertyId("property-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getLocationMovementsByCompanyId", () => {
    it("should return all movements for a company", () => {
      const result = getLocationMovementsByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result.every((m) => m.companyId === "company-1")).toBe(true);
    });

    it("should return empty array when company has no movements", () => {
      const result = getLocationMovementsByCompanyId("company-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getLocationMovementsByEmployeeId", () => {
    it("should return all movements that include the employee", () => {
      const result = getLocationMovementsByEmployeeId("employee-1");
      expect(result).toHaveLength(2);
      expect(result.every((m) => m.employeeIds.includes("employee-1"))).toBe(true);
    });

    it("should return empty array when employee has no movements", () => {
      const result = getLocationMovementsByEmployeeId("employee-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getLocationMovementsByServiceProviderId", () => {
    it("should return all movements that include the service provider", () => {
      const result = getLocationMovementsByServiceProviderId("provider-1");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("movement-2");
    });

    it("should return empty array when service provider has no movements", () => {
      const result = getLocationMovementsByServiceProviderId("provider-nonexistent");
      expect(result).toHaveLength(0);
    });

    it("should handle movements without serviceProviderIds", () => {
      const result = getLocationMovementsByServiceProviderId("provider-2");
      expect(result).toHaveLength(0);
    });
  });

  describe("getLocationMovementsByType", () => {
    it("should return all movements of a specific type", () => {
      const result = getLocationMovementsByType(LocationMovementType.FEED_DELIVERY);
      expect(result).toHaveLength(2);
      expect(result.every((m) => m.type === LocationMovementType.FEED_DELIVERY)).toBe(true);
    });

    it("should return empty array when type has no movements", () => {
      const result = getLocationMovementsByType(LocationMovementType.CLEANING);
      expect(result).toHaveLength(0);
    });
  });

  describe("getLocationMovementById", () => {
    it("should return movement when ID exists", () => {
      const result = getLocationMovementById("movement-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("movement-1");
      expect(result?.type).toBe(LocationMovementType.FEED_DELIVERY);
    });

    it("should return undefined when ID does not exist", () => {
      const result = getLocationMovementById("movement-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getLocationMovementById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("addLocationMovement", () => {
    it("should add a new movement with generated ID and timestamp", () => {
      const formData: LocationMovementFormData = {
        companyId: "company-1",
        propertyId: "property-1",
        locationIds: ["location-4"],
        employeeIds: ["employee-4"],
        serviceProviderIds: [],
        type: LocationMovementType.CLEANING,
        date: "2025-01-05",
        observation: "New movement",
      };

      const initialLength = mockLocationMovements.length;
      const result = addLocationMovement(formData);

      expect(mockLocationMovements).toHaveLength(initialLength + 1);
      expect(result.id).toBe("test-uuid-loc-mov");
      expect(result.companyId).toBe("company-1");
      expect(result.type).toBe(LocationMovementType.CLEANING);
      expect(result.createdAt).toBeDefined();
    });

    it("should add movement with file IDs", () => {
      const formData: LocationMovementFormData = {
        companyId: "company-1",
        propertyId: "property-1",
        locationIds: ["location-4"],
        employeeIds: ["employee-4"],
        serviceProviderIds: [],
        type: LocationMovementType.CLEANING,
        date: "2025-01-05",
        fileIds: ["file-1", "file-2"],
      };

      const result = addLocationMovement(formData);
      expect(result.fileIds).toEqual(["file-1", "file-2"]);
    });
  });

  describe("deleteLocationMovement", () => {
    it("should delete movement when ID exists", () => {
      const initialLength = mockLocationMovements.length;
      const result = deleteLocationMovement("movement-1");

      expect(result).toBe(true);
      expect(mockLocationMovements).toHaveLength(initialLength - 1);
      expect(mockLocationMovements.find((m) => m.id === "movement-1")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockLocationMovements.length;
      const result = deleteLocationMovement("movement-nonexistent");

      expect(result).toBe(false);
      expect(mockLocationMovements).toHaveLength(initialLength);
    });
  });

  describe("updateLocationMovement", () => {
    it("should update movement when ID exists", () => {
      const updateData: Partial<LocationMovementFormData> = {
        observation: "Updated observation",
        type: LocationMovementType.INSPECTION,
      };

      const result = updateLocationMovement("movement-1", updateData);
      expect(result).toBe(true);

      const updated = mockLocationMovements.find((m) => m.id === "movement-1");
      expect(updated?.observation).toBe("Updated observation");
      expect(updated?.type).toBe(LocationMovementType.INSPECTION);
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<LocationMovementFormData> = {
        observation: "Updated observation",
      };

      const result = updateLocationMovement("movement-nonexistent", updateData);
      expect(result).toBe(false);
    });
  });
});
