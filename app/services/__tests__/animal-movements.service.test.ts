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

vi.mock("~/mocks/animal-movements", () => ({
  mockAnimalMovements: [],
}));

describe("animal-movements.service", () => {
  beforeEach(() => {
    mockAnimalMovements.length = 0;
    mockAnimalMovements.push(
      {
        id: "movement-1",
        animalIds: ["animal-1", "animal-2"],
        locationId: "location-1",
        propertyId: "property-1",
        companyId: "company-1",
        employeeIds: ["employee-1"],
        serviceProviderIds: ["provider-1"],
        date: "2020-01-01",
        createdAt: "2020-01-01",
      },
      {
        id: "movement-2",
        animalIds: ["animal-1"],
        locationId: "location-2",
        propertyId: "property-1",
        companyId: "company-1",
        employeeIds: ["employee-2"],
        serviceProviderIds: undefined,
        date: "2020-02-01",
        createdAt: "2020-02-01",
      },
      {
        id: "movement-3",
        animalIds: ["animal-3"],
        locationId: "location-1",
        propertyId: "property-2",
        companyId: "company-2",
        employeeIds: ["employee-1"],
        serviceProviderIds: ["provider-2"],
        date: "2020-01-15",
        createdAt: "2020-01-15",
      }
    );
  });

  describe("getAnimalMovementsByAnimalId", () => {
    it("should return movements for specific animal", () => {
      const result = getAnimalMovementsByAnimalId("animal-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.animalIds.includes("animal-1"))).toBe(true);
    });

    it("should return empty array when animal has no movements", () => {
      const result = getAnimalMovementsByAnimalId("nonexistent-animal");
      expect(result).toHaveLength(0);
    });
  });

  describe("getAnimalMovementsByLocationId", () => {
    it("should return movements for specific location", () => {
      const result = getAnimalMovementsByLocationId("location-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.locationId === "location-1")).toBe(true);
    });
  });

  describe("getAnimalMovementsByPropertyId", () => {
    it("should return movements for specific property", () => {
      const result = getAnimalMovementsByPropertyId("property-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.propertyId === "property-1")).toBe(true);
    });
  });

  describe("getAnimalMovementsByCompanyId", () => {
    it("should return movements for specific company", () => {
      const result = getAnimalMovementsByCompanyId("company-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.companyId === "company-1")).toBe(true);
    });
  });

  describe("getAnimalMovementsByEmployeeId", () => {
    it("should return movements for specific employee", () => {
      const result = getAnimalMovementsByEmployeeId("employee-1");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.employeeIds.includes("employee-1"))).toBe(true);
    });
  });

  describe("getAnimalMovementsByServiceProviderId", () => {
    it("should return movements for specific service provider", () => {
      const result = getAnimalMovementsByServiceProviderId("provider-1");
      expect(result.length).toBeGreaterThan(0);
      expect(
        result.every((m) => m.serviceProviderIds?.includes("provider-1"))
      ).toBe(true);
    });

    it("should return empty array when service provider has no movements", () => {
      const result = getAnimalMovementsByServiceProviderId("nonexistent-provider");
      expect(result).toHaveLength(0);
    });
  });

  describe("getAnimalMovementById", () => {
    it("should return movement when ID exists", () => {
      const result = getAnimalMovementById("movement-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("movement-1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getAnimalMovementById("nonexistent-id");
      expect(result).toBeUndefined();
    });
  });

  describe("getAnimalsByLastMovementLocation", () => {
    it("should return animals with last movement at specific location", () => {
      const result = getAnimalsByLastMovementLocation("location-2");
      expect(result).toContain("animal-1");
    });

    it("should return empty array when no animals at location", () => {
      const result = getAnimalsByLastMovementLocation("nonexistent-location");
      expect(result).toHaveLength(0);
    });
  });

  describe("addAnimalMovement", () => {
    it("should add new movement with generated ID", () => {
      const formData: Omit<AnimalMovement, "id" | "createdAt"> = {
        animalIds: ["animal-4"],
        locationId: "location-3",
        propertyId: "property-1",
        companyId: "company-1",
        employeeIds: ["employee-1"],
        serviceProviderIds: undefined,
        date: "2020-03-01",
      };

      const initialLength = mockAnimalMovements.length;
      const result = addAnimalMovement(formData);

      expect(mockAnimalMovements).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });
  });

  describe("deleteAnimalMovement", () => {
    it("should delete existing movement", () => {
      const initialLength = mockAnimalMovements.length;
      const result = deleteAnimalMovement("movement-1");

      expect(result).toBe(true);
      expect(mockAnimalMovements).toHaveLength(initialLength - 1);
    });

    it("should return false when movement does not exist", () => {
      const initialLength = mockAnimalMovements.length;
      const result = deleteAnimalMovement("nonexistent-id");

      expect(result).toBe(false);
      expect(mockAnimalMovements).toHaveLength(initialLength);
    });
  });
});

