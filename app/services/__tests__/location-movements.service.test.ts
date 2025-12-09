import { describe, it, expect, beforeEach, vi } from "vitest";
import { LocationMovementType } from "~/types/location-movement";
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

vi.mock("~/mocks/location-movements", () => ({
  mockLocationMovements: [
    {
      id: "movement-1",
      locationIds: ["location-1", "location-2"],
      propertyId: "property-1",
      companyId: "company-1",
      employeeIds: ["employee-1"],
      serviceProviderIds: ["provider-1"],
      type: LocationMovementType.SEEDING,
      date: "2024-01-15",
    },
    {
      id: "movement-2",
      locationIds: ["location-1"],
      propertyId: "property-1",
      companyId: "company-1",
      employeeIds: ["employee-2"],
      type: LocationMovementType.HARVESTING,
      date: "2024-02-15",
    },
  ],
}));

vi.mock("~/utils/uuid", () => ({
  generateUUID: vi.fn(() => "generated-uuid"),
}));

import { mockLocationMovements } from "~/mocks/location-movements";

describe("location-movements.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getLocationMovementsByLocationId", () => {
    it("should find movements by location id", () => {
      const result = getLocationMovementsByLocationId("location-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("getLocationMovementsByPropertyId", () => {
    it("should find movements by property id", () => {
      const result = getLocationMovementsByPropertyId("property-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("getLocationMovementsByCompanyId", () => {
    it("should find movements by company id", () => {
      const result = getLocationMovementsByCompanyId("company-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("getLocationMovementsByEmployeeId", () => {
    it("should find movements by employee id", () => {
      const result = getLocationMovementsByEmployeeId("employee-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getLocationMovementsByServiceProviderId", () => {
    it("should find movements by service provider id", () => {
      const result = getLocationMovementsByServiceProviderId("provider-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getLocationMovementsByType", () => {
    it("should find movements by type", () => {
      const result = getLocationMovementsByType(LocationMovementType.SEEDING);
      expect(result).toHaveLength(1);
    });
  });

  describe("getLocationMovementById", () => {
    it("should find movement by id", () => {
      const result = getLocationMovementById("movement-1");
      expect(result).toEqual(mockLocationMovements[0]);
    });
  });

  describe("addLocationMovement", () => {
    it("should create new movement", () => {
      const formData = {
        locationIds: ["location-3"],
        propertyId: "property-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        type: LocationMovementType.SEEDING,
        date: "2024-03-01",
      };

      const result = addLocationMovement(formData);

      expect(result.id).toBe("generated-uuid");
      expect(result.createdAt).toBeDefined();
      expect(mockLocationMovements).toContain(result);
    });
  });

  describe("updateLocationMovement", () => {
    it("should update movement", () => {
      const updateData = { type: LocationMovementType.HARVESTING };
      const result = updateLocationMovement("movement-1", updateData);

      expect(result).toBe(true);
      expect(mockLocationMovements[0].type).toBe(LocationMovementType.HARVESTING);
    });
  });

  describe("deleteLocationMovement", () => {
    it("should delete movement", () => {
      const initialLength = mockLocationMovements.length;
      const result = deleteLocationMovement("movement-1");

      expect(result).toBe(true);
      expect(mockLocationMovements).toHaveLength(initialLength - 1);
    });
  });
});
