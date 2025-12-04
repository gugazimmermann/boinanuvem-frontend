import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAnimalMovementsByAnimalId,
  getAnimalMovementsByLocationId,
  getAnimalMovementsByPropertyId,
  getAnimalMovementsByCompanyId,
  getAnimalMovementsByEmployeeId,
  getAnimalMovementsByServiceProviderId,
  getAnimalMovementById,
  getAnimalsByLastMovementLocation,
  addAnimalMovement,
  deleteAnimalMovement,
} from "../animal-movements.service";
import { mockAnimalMovements } from "~/mocks/animal-movements";
import type { AnimalMovement } from "~/types";

// Mock the UUID generator
vi.mock("~/utils/uuid", () => ({
  generateUUID: vi.fn(() => "test-uuid-movement"),
}));

describe("animal-movements.service", () => {
  beforeEach(() => {
    // Reset mock data before each test
    mockAnimalMovements.length = 0;
    mockAnimalMovements.push(
      {
        id: "mov-1",
        companyId: "company-1",
        propertyId: "property-1",
        locationId: "location-1",
        animalIds: ["animal-1", "animal-2"],
        employeeIds: ["employee-1"],
        serviceProviderIds: [],
        date: "2025-01-01",
        observation: "Test movement 1",
        createdAt: "2025-01-01T00:00:00Z",
      },
      {
        id: "mov-2",
        companyId: "company-1",
        propertyId: "property-2",
        locationId: "location-2",
        animalIds: ["animal-1"],
        employeeIds: ["employee-2"],
        serviceProviderIds: ["service-provider-1"],
        date: "2025-01-02",
        observation: "Test movement 2",
        createdAt: "2025-01-02T00:00:00Z",
      },
      {
        id: "mov-3",
        companyId: "company-2",
        propertyId: "property-1",
        locationId: "location-1",
        animalIds: ["animal-3"],
        employeeIds: ["employee-1"],
        serviceProviderIds: [],
        date: "2025-01-03",
        observation: "Test movement 3",
        createdAt: "2025-01-03T00:00:00Z",
      },
      {
        id: "mov-4",
        companyId: "company-1",
        propertyId: "property-1",
        locationId: "location-3",
        animalIds: ["animal-2"],
        employeeIds: ["employee-1"],
        serviceProviderIds: [],
        date: "2025-01-04",
        observation: "Test movement 4",
        createdAt: "2025-01-04T00:00:00Z",
      }
    );
  });

  describe("getAnimalMovementsByAnimalId", () => {
    it("should return all movements for an animal", () => {
      const result = getAnimalMovementsByAnimalId("animal-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("mov-1");
      expect(result[1]?.id).toBe("mov-2");
    });

    it("should return empty array when animal has no movements", () => {
      const result = getAnimalMovementsByAnimalId("animal-nonexistent");
      expect(result).toHaveLength(0);
    });

    it("should find movements where animal is in animalIds array", () => {
      const result = getAnimalMovementsByAnimalId("animal-2");
      expect(result).toHaveLength(2);
      expect(result.some((mov) => mov.id === "mov-1")).toBe(true);
      expect(result.some((mov) => mov.id === "mov-4")).toBe(true);
    });
  });

  describe("getAnimalMovementsByLocationId", () => {
    it("should return all movements for a location", () => {
      const result = getAnimalMovementsByLocationId("location-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("mov-1");
      expect(result[1]?.id).toBe("mov-3");
    });

    it("should return empty array when location has no movements", () => {
      const result = getAnimalMovementsByLocationId("location-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getAnimalMovementsByPropertyId", () => {
    it("should return all movements for a property", () => {
      const result = getAnimalMovementsByPropertyId("property-1");
      expect(result).toHaveLength(3);
      expect(result[0]?.id).toBe("mov-1");
      expect(result[1]?.id).toBe("mov-3");
      expect(result[2]?.id).toBe("mov-4");
    });

    it("should return empty array when property has no movements", () => {
      const result = getAnimalMovementsByPropertyId("property-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getAnimalMovementsByCompanyId", () => {
    it("should return all movements for a company", () => {
      const result = getAnimalMovementsByCompanyId("company-1");
      expect(result).toHaveLength(3);
      expect(result[0]?.id).toBe("mov-1");
      expect(result[1]?.id).toBe("mov-2");
      expect(result[2]?.id).toBe("mov-4");
    });

    it("should return empty array when company has no movements", () => {
      const result = getAnimalMovementsByCompanyId("company-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getAnimalMovementsByEmployeeId", () => {
    it("should return all movements for an employee", () => {
      const result = getAnimalMovementsByEmployeeId("employee-1");
      expect(result).toHaveLength(3);
      expect(result[0]?.id).toBe("mov-1");
      expect(result[1]?.id).toBe("mov-3");
      expect(result[2]?.id).toBe("mov-4");
    });

    it("should return empty array when employee has no movements", () => {
      const result = getAnimalMovementsByEmployeeId("employee-nonexistent");
      expect(result).toHaveLength(0);
    });

    it("should find movements where employee is in employeeIds array", () => {
      const result = getAnimalMovementsByEmployeeId("employee-2");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("mov-2");
    });
  });

  describe("getAnimalMovementsByServiceProviderId", () => {
    it("should return all movements for a service provider", () => {
      const result = getAnimalMovementsByServiceProviderId("service-provider-1");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("mov-2");
    });

    it("should return empty array when service provider has no movements", () => {
      const result = getAnimalMovementsByServiceProviderId("service-provider-nonexistent");
      expect(result).toHaveLength(0);
    });

    it("should handle undefined serviceProviderIds", () => {
      const result = getAnimalMovementsByServiceProviderId("service-provider-1");
      expect(result.every((mov) => mov.serviceProviderIds?.includes("service-provider-1"))).toBe(
        true
      );
    });
  });

  describe("getAnimalMovementById", () => {
    it("should return movement when ID exists", () => {
      const result = getAnimalMovementById("mov-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("mov-1");
      expect(result?.observation).toBe("Test movement 1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getAnimalMovementById("mov-nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("getAnimalsByLastMovementLocation", () => {
    it("should return animals at a specific location based on latest movement", () => {
      const result = getAnimalsByLastMovementLocation("location-3");
      expect(result).toContain("animal-2");
    });

    it("should return empty array when no animals are at location", () => {
      const result = getAnimalsByLastMovementLocation("location-nonexistent");
      expect(result).toHaveLength(0);
    });

    it("should use the most recent movement for each animal", () => {
      // animal-1 is in mov-1 (location-1, 2025-01-01) and mov-2 (location-2, 2025-01-02)
      // Latest is mov-2, so animal-1 should be at location-2
      const result = getAnimalsByLastMovementLocation("location-2");
      expect(result).toContain("animal-1");
    });

    it("should not return animals that moved away from location", () => {
      // animal-1 was at location-1 but moved to location-2
      const result = getAnimalsByLastMovementLocation("location-1");
      expect(result).not.toContain("animal-1");
    });
  });

  describe("addAnimalMovement", () => {
    it("should add a new movement with generated ID and timestamp", () => {
      const movementData: Omit<AnimalMovement, "id" | "createdAt"> = {
        companyId: "company-1",
        propertyId: "property-1",
        locationId: "location-1",
        animalIds: ["animal-4"],
        employeeIds: ["employee-1"],
        serviceProviderIds: [],
        date: "2025-01-05",
        observation: "New movement",
      };

      const initialLength = mockAnimalMovements.length;
      const result = addAnimalMovement(movementData);

      expect(mockAnimalMovements).toHaveLength(initialLength + 1);
      expect(result.id).toBe("test-uuid-movement");
      expect(result.companyId).toBe("company-1");
      expect(result.observation).toBe("New movement");
      expect(result.createdAt).toBeDefined();
    });

    it("should add movement with service provider IDs", () => {
      const movementData: Omit<AnimalMovement, "id" | "createdAt"> = {
        companyId: "company-1",
        propertyId: "property-1",
        locationId: "location-1",
        animalIds: ["animal-4"],
        employeeIds: ["employee-1"],
        serviceProviderIds: ["service-provider-1", "service-provider-2"],
        date: "2025-01-05",
        observation: "Movement with service providers",
      };

      const result = addAnimalMovement(movementData);
      expect(result.serviceProviderIds).toEqual(["service-provider-1", "service-provider-2"]);
    });

    it("should add movement to the end of the array", () => {
      const movementData: Omit<AnimalMovement, "id" | "createdAt"> = {
        companyId: "company-1",
        propertyId: "property-1",
        locationId: "location-1",
        animalIds: ["animal-4"],
        employeeIds: ["employee-1"],
        serviceProviderIds: [],
        date: "2025-01-05",
        observation: "Last movement",
      };

      const result = addAnimalMovement(movementData);
      const lastItem = mockAnimalMovements[mockAnimalMovements.length - 1];
      expect(lastItem.id).toBe(result.id);
    });
  });

  describe("deleteAnimalMovement", () => {
    it("should delete movement when ID exists", () => {
      const initialLength = mockAnimalMovements.length;
      const result = deleteAnimalMovement("mov-1");

      expect(result).toBe(true);
      expect(mockAnimalMovements).toHaveLength(initialLength - 1);
      expect(mockAnimalMovements.find((mov) => mov.id === "mov-1")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockAnimalMovements.length;
      const result = deleteAnimalMovement("mov-nonexistent");

      expect(result).toBe(false);
      expect(mockAnimalMovements).toHaveLength(initialLength);
    });

    it("should delete the correct movement", () => {
      deleteAnimalMovement("mov-2");
      expect(mockAnimalMovements.find((mov) => mov.id === "mov-2")).toBeUndefined();
      expect(mockAnimalMovements.find((mov) => mov.id === "mov-1")).toBeDefined();
      expect(mockAnimalMovements.find((mov) => mov.id === "mov-3")).toBeDefined();
    });
  });
});
