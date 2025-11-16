import { describe, it, expect } from "vitest";
import {
  mockLocationMovements,
  getLocationMovementById,
  getLocationMovementsByCompanyId,
  getLocationMovementsByPropertyId,
  getLocationMovementsByLocationId,
  getLocationMovementsByEmployeeId,
  getLocationMovementsByServiceProviderId,
  getLocationMovementsByType,
  addLocationMovement,
  deleteLocationMovement,
  updateLocationMovement,
} from "../location-movements";
import type { LocationMovementFormData } from "~/types";
import { LocationMovementType } from "~/types";

describe("Location Movements Mock Functions", () => {
  const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";
  const PROPERTY_ID = "550e8400-e29b-41d4-a716-446655440010";
  const LOCATION_ID = "660e8400-e29b-41d4-a716-446655440010";
  const EMPLOYEE_ID = "770e8400-e29b-41d4-a716-446655440010";
  const SERVICE_PROVIDER_ID = "880e8400-e29b-41d4-a716-446655440010";

  describe("getLocationMovementById", () => {
    it("should return location movement by id", () => {
      if (mockLocationMovements.length > 0) {
        const movement = getLocationMovementById(mockLocationMovements[0].id);
        expect(movement).toBeDefined();
        expect(movement?.id).toBe(mockLocationMovements[0].id);
      }
    });

    it("should return undefined for non-existent id", () => {
      const movement = getLocationMovementById("non-existent-id");
      expect(movement).toBeUndefined();
    });

    it("should return undefined for undefined id", () => {
      const movement = getLocationMovementById(undefined);
      expect(movement).toBeUndefined();
    });
  });

  describe("getLocationMovementsByCompanyId", () => {
    it("should return movements for a company", () => {
      const movements = getLocationMovementsByCompanyId(COMPANY_ID);
      expect(Array.isArray(movements)).toBe(true);
      movements.forEach((movement) => {
        expect(movement.companyId).toBe(COMPANY_ID);
      });
    });

    it("should return empty array for non-existent company", () => {
      const movements = getLocationMovementsByCompanyId("non-existent-company");
      expect(movements).toEqual([]);
    });
  });

  describe("getLocationMovementsByPropertyId", () => {
    it("should return movements for a property", () => {
      const movements = getLocationMovementsByPropertyId(PROPERTY_ID);
      expect(Array.isArray(movements)).toBe(true);
      movements.forEach((movement) => {
        expect(movement.propertyId).toBe(PROPERTY_ID);
      });
    });

    it("should return empty array for non-existent property", () => {
      const movements = getLocationMovementsByPropertyId("non-existent-property");
      expect(movements).toEqual([]);
    });
  });

  describe("getLocationMovementsByLocationId", () => {
    it("should return movements for a location", () => {
      if (mockLocationMovements.length > 0) {
        const locationId = mockLocationMovements[0].locationIds[0];
        if (locationId) {
          const movements = getLocationMovementsByLocationId(locationId);
          expect(Array.isArray(movements)).toBe(true);
          movements.forEach((movement) => {
            expect(movement.locationIds).toContain(locationId);
          });
        }
      }
    });

    it("should return empty array for non-existent location", () => {
      const movements = getLocationMovementsByLocationId("non-existent-location");
      expect(movements).toEqual([]);
    });
  });

  describe("getLocationMovementsByEmployeeId", () => {
    it("should return movements for an employee", () => {
      if (mockLocationMovements.length > 0) {
        const movement = mockLocationMovements.find((m) => m.employeeIds.length > 0);
        if (movement) {
          const employeeId = movement.employeeIds[0];
          const movements = getLocationMovementsByEmployeeId(employeeId);
          expect(Array.isArray(movements)).toBe(true);
          movements.forEach((m) => {
            expect(m.employeeIds).toContain(employeeId);
          });
        }
      }
    });
  });

  describe("getLocationMovementsByServiceProviderId", () => {
    it("should return movements for a service provider", () => {
      if (mockLocationMovements.length > 0) {
        const movement = mockLocationMovements.find((m) => m.serviceProviderIds.length > 0);
        if (movement) {
          const serviceProviderId = movement.serviceProviderIds[0];
          const movements = getLocationMovementsByServiceProviderId(serviceProviderId);
          expect(Array.isArray(movements)).toBe(true);
          movements.forEach((m) => {
            expect(m.serviceProviderIds).toContain(serviceProviderId);
          });
        }
      }
    });
  });

  describe("getLocationMovementsByType", () => {
    it("should return movements by type", () => {
      const movements = getLocationMovementsByType(LocationMovementType.MAINTENANCE);
      expect(Array.isArray(movements)).toBe(true);
      movements.forEach((movement) => {
        expect(movement.type).toBe(LocationMovementType.MAINTENANCE);
      });
    });
  });

  describe("addLocationMovement", () => {
    it("should add a new location movement", () => {
      const initialCount = mockLocationMovements.length;
      const newMovementData: LocationMovementFormData = {
        type: LocationMovementType.MAINTENANCE,
        date: "2024-01-15",
        companyId: COMPANY_ID,
        propertyId: PROPERTY_ID,
        locationIds: [LOCATION_ID],
        employeeIds: [EMPLOYEE_ID],
        serviceProviderIds: [],
      };

      const added = addLocationMovement(newMovementData);
      expect(added).toBeDefined();
      expect(added.id).toBeDefined();
      expect(added.createdAt).toBeDefined();
      expect(added.updatedAt).toBeDefined();
      expect(added.type).toBe(newMovementData.type);
      expect(added.companyId).toBe(newMovementData.companyId);
      expect(added.propertyId).toBe(newMovementData.propertyId);
      expect(mockLocationMovements.length).toBe(initialCount + 1);
    });
  });

  describe("deleteLocationMovement", () => {
    it("should delete a location movement by id", () => {
      const newMovementData: LocationMovementFormData = {
        type: LocationMovementType.IRRIGATION,
        date: "2024-01-20",
        companyId: COMPANY_ID,
        propertyId: PROPERTY_ID,
        locationIds: [LOCATION_ID],
        employeeIds: [],
        serviceProviderIds: [SERVICE_PROVIDER_ID],
      };

      const added = addLocationMovement(newMovementData);
      const initialCount = mockLocationMovements.length;
      const deleted = deleteLocationMovement(added.id);

      expect(deleted).toBe(true);
      expect(mockLocationMovements.length).toBe(initialCount - 1);
      expect(getLocationMovementById(added.id)).toBeUndefined();
    });

    it("should return false for non-existent id", () => {
      const deleted = deleteLocationMovement("non-existent-id");
      expect(deleted).toBe(false);
    });
  });

  describe("updateLocationMovement", () => {
    it("should update a location movement", () => {
      const newMovementData: LocationMovementFormData = {
        type: LocationMovementType.FERTILIZATION,
        date: "2024-01-25",
        companyId: COMPANY_ID,
        propertyId: PROPERTY_ID,
        locationIds: [LOCATION_ID],
        employeeIds: [EMPLOYEE_ID],
        serviceProviderIds: [],
      };

      const added = addLocationMovement(newMovementData);
      const updated = updateLocationMovement(added.id, {
        observation: "Updated observation",
      });

      expect(updated).toBe(true);
      const movement = getLocationMovementById(added.id);
      expect(movement?.observation).toBe("Updated observation");
      expect(movement?.updatedAt).toBeDefined();
    });

    it("should return false for non-existent id", () => {
      const updated = updateLocationMovement("non-existent-id", {
        observation: "Test",
      });
      expect(updated).toBe(false);
    });
  });
});

