import { describe, it, expect, beforeEach } from "vitest";
import {
  getAnimalMovementById,
  getAnimalMovementsByPropertyId,
  getAnimalMovementsByLocationId,
  getAnimalMovementsByAnimalId,
  getAnimalMovementsByEmployeeId,
  getAnimalMovementsByServiceProviderId,
  getAnimalsByLastMovementLocation,
  addAnimalMovement,
  mockAnimalMovements,
} from "../animal-movements";
import type { AnimalMovement } from "~/types/animal-movement";

describe("Animal Movements Mock Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAnimalMovementById", () => {
    it("should return animal movement by id", () => {
      if (mockAnimalMovements.length > 0) {
        const movement = getAnimalMovementById(mockAnimalMovements[0].id);
        expect(movement).toBeDefined();
        expect(movement?.id).toBe(mockAnimalMovements[0].id);
      }
    });

    it("should return undefined for non-existent id", () => {
      const movement = getAnimalMovementById("non-existent-id");
      expect(movement).toBeUndefined();
    });
  });

  describe("getAnimalMovementsByPropertyId", () => {
    it("should return movements for a property", () => {
      if (mockAnimalMovements.length > 0) {
        const propertyId = mockAnimalMovements[0].propertyId;
        const movements = getAnimalMovementsByPropertyId(propertyId);
        expect(Array.isArray(movements)).toBe(true);
        movements.forEach((movement) => {
          expect(movement.propertyId).toBe(propertyId);
        });
      }
    });

    it("should return empty array for non-existent property", () => {
      const movements = getAnimalMovementsByPropertyId("non-existent-property");
      expect(movements).toEqual([]);
    });
  });

  describe("getAnimalMovementsByLocationId", () => {
    it("should return movements for a location", () => {
      if (mockAnimalMovements.length > 0) {
        const locationId = mockAnimalMovements[0].locationId;
        const movements = getAnimalMovementsByLocationId(locationId);
        expect(Array.isArray(movements)).toBe(true);
        movements.forEach((movement) => {
          expect(movement.locationId).toBe(locationId);
        });
      }
    });
  });

  describe("getAnimalMovementsByAnimalId", () => {
    it("should return movements for an animal", () => {
      if (mockAnimalMovements.length > 0) {
        const animalId = mockAnimalMovements[0].animalIds[0];
        if (animalId) {
          const movements = getAnimalMovementsByAnimalId(animalId);
          expect(Array.isArray(movements)).toBe(true);
          movements.forEach((movement) => {
            expect(movement.animalIds).toContain(animalId);
          });
        }
      }
    });
  });

  describe("getAnimalMovementsByEmployeeId", () => {
    it("should return movements for an employee", () => {
      if (mockAnimalMovements.length > 0) {
        const movement = mockAnimalMovements.find((m) => m.employeeIds.length > 0);
        if (movement) {
          const employeeId = movement.employeeIds[0];
          const movements = getAnimalMovementsByEmployeeId(employeeId);
          expect(Array.isArray(movements)).toBe(true);
          movements.forEach((m) => {
            expect(m.employeeIds).toContain(employeeId);
          });
        }
      }
    });
  });

  describe("getAnimalMovementsByServiceProviderId", () => {
    it("should return movements for a service provider", () => {
      if (mockAnimalMovements.length > 0) {
        const movement = mockAnimalMovements.find((m) => m.serviceProviderIds.length > 0);
        if (movement) {
          const serviceProviderId = movement.serviceProviderIds[0];
          const movements = getAnimalMovementsByServiceProviderId(serviceProviderId);
          expect(Array.isArray(movements)).toBe(true);
          movements.forEach((m) => {
            expect(m.serviceProviderIds).toContain(serviceProviderId);
          });
        }
      }
    });
  });

  describe("getAnimalsByLastMovementLocation", () => {
    it("should return animal IDs with last movement to location", () => {
      if (mockAnimalMovements.length > 0) {
        const locationId = mockAnimalMovements[0].locationId;
        const animalIds = getAnimalsByLastMovementLocation(locationId);
        expect(Array.isArray(animalIds)).toBe(true);
        animalIds.forEach((id) => {
          expect(typeof id).toBe("string");
        });
      }
    });

    it("should return empty array for non-existent location", () => {
      const animalIds = getAnimalsByLastMovementLocation("non-existent-location");
      expect(animalIds).toEqual([]);
    });
  });

  describe("addAnimalMovement", () => {
    it("should add a new animal movement", () => {
      const _initialCount = mockAnimalMovements.length;
      const newMovement: Omit<AnimalMovement, "id" | "createdAt"> = {
        date: "2024-01-01",
        companyId: "550e8400-e29b-41d4-a716-446655440000",
        propertyId: "550e8400-e29b-41d4-a716-446655440010",
        locationId: "660e8400-e29b-41d4-a716-446655440000",
        animalIds: ["bb0e8400-e29b-41d4-a716-446655440000"],
        employeeIds: [],
        serviceProviderIds: [],
      };

      const added = addAnimalMovement(newMovement);
      expect(added).toBeDefined();
      expect(added.id).toBeDefined();
      expect(added.createdAt).toBeDefined();
      expect(added.date).toBe(newMovement.date);
      expect(added.propertyId).toBe(newMovement.propertyId);
      expect(added.locationId).toBe(newMovement.locationId);
    });

    it("should handle observation field", () => {
      const newMovement: Omit<AnimalMovement, "id" | "createdAt"> = {
        date: "2024-01-01",
        companyId: "550e8400-e29b-41d4-a716-446655440000",
        propertyId: "550e8400-e29b-41d4-a716-446655440010",
        locationId: "660e8400-e29b-41d4-a716-446655440000",
        animalIds: ["bb0e8400-e29b-41d4-a716-446655440000"],
        employeeIds: [],
        serviceProviderIds: [],
        observation: "Test observation",
      };

      const added = addAnimalMovement(newMovement);
      expect(added.observation).toBe("Test observation");
    });

    it("should handle fileIds field", () => {
      const newMovement: Omit<AnimalMovement, "id" | "createdAt"> = {
        date: "2024-01-01",
        companyId: "550e8400-e29b-41d4-a716-446655440000",
        propertyId: "550e8400-e29b-41d4-a716-446655440010",
        locationId: "660e8400-e29b-41d4-a716-446655440000",
        animalIds: ["bb0e8400-e29b-41d4-a716-446655440000"],
        employeeIds: [],
        serviceProviderIds: [],
        fileIds: ["file-1", "file-2"],
      };

      const added = addAnimalMovement(newMovement);
      expect(added.fileIds).toEqual(["file-1", "file-2"]);
    });

    it("should trim observation and handle empty strings", () => {
      const newMovement: Omit<AnimalMovement, "id" | "createdAt"> = {
        date: "2024-01-01",
        companyId: "550e8400-e29b-41d4-a716-446655440000",
        propertyId: "550e8400-e29b-41d4-a716-446655440010",
        locationId: "660e8400-e29b-41d4-a716-446655440000",
        animalIds: ["bb0e8400-e29b-41d4-a716-446655440000"],
        employeeIds: [],
        serviceProviderIds: [],
        observation: "   ",
      };

      const added = addAnimalMovement(newMovement);
      expect(added.observation).toBeUndefined();
    });

    it("should handle empty fileIds array", () => {
      const newMovement: Omit<AnimalMovement, "id" | "createdAt"> = {
        date: "2024-01-01",
        companyId: "550e8400-e29b-41d4-a716-446655440000",
        propertyId: "550e8400-e29b-41d4-a716-446655440010",
        locationId: "660e8400-e29b-41d4-a716-446655440000",
        animalIds: ["bb0e8400-e29b-41d4-a716-446655440000"],
        employeeIds: [],
        serviceProviderIds: [],
        fileIds: [],
      };

      const added = addAnimalMovement(newMovement);
      expect(added.fileIds).toBeUndefined();
    });
  });
});
