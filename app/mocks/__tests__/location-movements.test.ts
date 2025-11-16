import { describe, it, expect } from "vitest";
import { mockLocationMovements } from "../location-movements";
import { mockLocations } from "../locations";
import { mockEmployees } from "../employees";
import { mockServiceProviders } from "../service-providers";
import { LocationMovementType } from "~/types/location-movement";
import type { LocationMovement } from "~/types/location-movement";

describe("location-movements mock", () => {
  it("should export mockLocationMovements array", () => {
    expect(Array.isArray(mockLocationMovements)).toBe(true);
    expect(mockLocationMovements.length).toBeGreaterThan(0);
  });

  it("should have valid movement structure", () => {
    mockLocationMovements.forEach((movement: LocationMovement) => {
      expect(movement).toHaveProperty("id");
      expect(movement).toHaveProperty("companyId");
      expect(movement).toHaveProperty("propertyId");
      expect(movement).toHaveProperty("locationIds");
      expect(movement).toHaveProperty("employeeIds");
      expect(movement).toHaveProperty("serviceProviderIds");
      expect(movement).toHaveProperty("type");
      expect(movement).toHaveProperty("date");
      expect(movement).toHaveProperty("createdAt");

      expect(typeof movement.id).toBe("string");
      expect(typeof movement.companyId).toBe("string");
      expect(typeof movement.propertyId).toBe("string");
      expect(Array.isArray(movement.locationIds)).toBe(true);
      expect(Array.isArray(movement.employeeIds)).toBe(true);
      expect(Array.isArray(movement.serviceProviderIds)).toBe(true);
      expect(typeof movement.type).toBe("string");
      expect(typeof movement.date).toBe("string");
      expect(typeof movement.createdAt).toBe("string");
    });
  });

  it("should have valid date format", () => {
    mockLocationMovements.forEach((movement: LocationMovement) => {
      expect(movement.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(() => new Date(movement.date)).not.toThrow();
      if (movement.createdAt) {
        const createdAt = movement.createdAt;
        expect(createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
        expect(() => new Date(createdAt)).not.toThrow();
      }
    });
  });

  it("should have at least one location in each movement", () => {
    mockLocationMovements.forEach((movement: LocationMovement) => {
      expect(movement.locationIds.length).toBeGreaterThan(0);
    });
  });

  it("should have valid location IDs", () => {
    const locationIds = new Set(mockLocations.map((l) => l.id));
    mockLocationMovements.forEach((movement: LocationMovement) => {
      movement.locationIds.forEach((locationId) => {
        expect(locationIds.has(locationId)).toBe(true);
      });
    });
  });

  it("should have valid employee IDs when present", () => {
    const employeeIds = new Set(mockEmployees.map((e) => e.id));
    mockLocationMovements.forEach((movement: LocationMovement) => {
      movement.employeeIds.forEach((employeeId) => {
        expect(employeeIds.has(employeeId)).toBe(true);
      });
    });
  });

  it("should have valid service provider IDs when present", () => {
    const serviceProviderIds = new Set(mockServiceProviders.map((sp) => sp.id));
    mockLocationMovements.forEach((movement: LocationMovement) => {
      movement.serviceProviderIds.forEach((serviceProviderId) => {
        expect(serviceProviderIds.has(serviceProviderId)).toBe(true);
      });
    });
  });

  it("should have valid movement type", () => {
    const validTypes = Object.values(LocationMovementType);
    mockLocationMovements.forEach((movement: LocationMovement) => {
      expect(validTypes).toContain(movement.type);
    });
  });

  it("should have valid observation when present", () => {
    mockLocationMovements.forEach((movement: LocationMovement) => {
      if (movement.observation) {
        expect(typeof movement.observation).toBe("string");
        expect(movement.observation.trim().length).toBeGreaterThan(0);
      }
    });
  });

  it("should have valid file IDs when present", () => {
    mockLocationMovements.forEach((movement: LocationMovement) => {
      if (movement.fileIds) {
        expect(Array.isArray(movement.fileIds)).toBe(true);
        movement.fileIds.forEach((fileId) => {
          expect(typeof fileId).toBe("string");
          expect(fileId.length).toBeGreaterThan(0);
        });
      }
    });
  });

  it("should have unique IDs", () => {
    const ids = mockLocationMovements.map((m) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have movements with different types", () => {
    const types = new Set(mockLocationMovements.map((m) => m.type));
    expect(types.size).toBeGreaterThan(1);
  });
});
