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

const { mockAnimalMovements } = vi.hoisted(() => {
  const mockAnimalMovements = [
    {
      id: "movement-1",
      animalIds: ["animal-1", "animal-2"],
      locationId: "location-1",
      propertyId: "property-1",
      companyId: "company-1",
      employeeIds: ["employee-1"],
      serviceProviderIds: ["provider-1"],
      date: "2024-01-15",
    },
    {
      id: "movement-2",
      animalIds: ["animal-1"],
      locationId: "location-2",
      propertyId: "property-1",
      companyId: "company-1",
      employeeIds: ["employee-2"],
      date: "2024-02-15",
    },
  ];
  return { mockAnimalMovements };
});

vi.mock("~/mocks/animal-movements", () => ({
  mockAnimalMovements,
}));

vi.mock("~/utils/uuid", () => ({
  generateUUID: vi.fn(() => "generated-uuid"),
}));

describe("animal-movements.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAnimalMovementsByAnimalId", () => {
    it("should find movements by animal id", () => {
      const result = getAnimalMovementsByAnimalId("animal-1");
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no matches", () => {
      const result = getAnimalMovementsByAnimalId("nonexistent");
      expect(result).toEqual([]);
    });
  });

  describe("getAnimalMovementsByLocationId", () => {
    it("should find movements by location id", () => {
      const result = getAnimalMovementsByLocationId("location-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getAnimalMovementsByPropertyId", () => {
    it("should find movements by property id", () => {
      const result = getAnimalMovementsByPropertyId("property-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("getAnimalMovementsByCompanyId", () => {
    it("should find movements by company id", () => {
      const result = getAnimalMovementsByCompanyId("company-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("getAnimalMovementsByEmployeeId", () => {
    it("should find movements by employee id", () => {
      const result = getAnimalMovementsByEmployeeId("employee-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getAnimalMovementsByServiceProviderId", () => {
    it("should find movements by service provider id", () => {
      const result = getAnimalMovementsByServiceProviderId("provider-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getAnimalMovementById", () => {
    it("should find movement by id", () => {
      const result = getAnimalMovementById("movement-1");
      expect(result).toEqual(mockAnimalMovements[0]);
    });
  });

  describe("getAnimalsByLastMovementLocation", () => {
    it("should return animals by last movement location", () => {
      const result = getAnimalsByLastMovementLocation("location-2");
      expect(result).toContain("animal-1");
    });
  });

  describe("addAnimalMovement", () => {
    it("should create new movement", () => {
      const movementData = {
        animalIds: ["animal-3"],
        locationId: "location-3",
        propertyId: "property-1",
        companyId: "company-1",
        employeeIds: [],
        serviceProviderIds: [],
        date: "2024-03-01",
      };

      const result = addAnimalMovement(movementData);

      expect(result.id).toBe("generated-uuid");
      expect(result.createdAt).toBeDefined();
      expect(mockAnimalMovements).toContain(result);
    });
  });

  describe("deleteAnimalMovement", () => {
    it("should delete movement", () => {
      const initialLength = mockAnimalMovements.length;
      const result = deleteAnimalMovement("movement-1");

      expect(result).toBe(true);
      expect(mockAnimalMovements).toHaveLength(initialLength - 1);
    });
  });
});
