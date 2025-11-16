import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAnimalById,
  getAnimalsByCompanyId,
  getAnimalsByPropertyId,
  addAnimal,
  updateAnimal,
  deleteAnimal,
} from "../animals.service";
import { mockAnimals } from "~/mocks/animals";
import type { AnimalFormData } from "~/types";

vi.mock("~/mocks/animals", () => ({
  mockAnimals: [],
}));

describe("animals.service", () => {
  beforeEach(() => {
    mockAnimals.length = 0;
    mockAnimals.push(
      {
        id: "bb0e8400-e29b-41d4-a716-446655440100",
        code: "FJ001",
        registrationNumber: "BR-2020-FJ0001",
        status: "active",
        createdAt: "2020-01-01",
        companyId: "company-1",
        propertyId: "property-1",
        locationId: "location-1",
        breed: "Nelore",
        gender: "male",
        birthDate: "2019-01-01",
        weight: 500,
      },
      {
        id: "bb0e8400-e29b-41d4-a716-446655440101",
        code: "FJ002",
        registrationNumber: "BR-2020-FJ0002",
        status: "active",
        createdAt: "2020-01-02",
        companyId: "company-1",
        propertyId: "property-2",
        locationId: "location-2",
        breed: "Angus",
        gender: "female",
        birthDate: "2019-02-01",
        weight: 450,
      },
      {
        id: "bb0e8400-e29b-41d4-a716-446655440102",
        code: "FJ003",
        registrationNumber: "BR-2020-FJ0003",
        status: "inactive",
        createdAt: "2020-01-03",
        companyId: "company-2",
        propertyId: "property-1",
        locationId: "location-1",
        breed: "Brahman",
        gender: "male",
        birthDate: "2019-03-01",
        weight: 600,
      }
    );
  });

  describe("getAnimalById", () => {
    it("should return animal when ID exists", () => {
      const result = getAnimalById("bb0e8400-e29b-41d4-a716-446655440100");
      expect(result).toBeDefined();
      expect(result?.code).toBe("FJ001");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getAnimalById("nonexistent-id");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getAnimalById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getAnimalsByCompanyId", () => {
    it("should return animals for specific company", () => {
      const result = getAnimalsByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result.every((animal) => animal.companyId === "company-1")).toBe(true);
    });

    it("should return empty array when company has no animals", () => {
      const result = getAnimalsByCompanyId("company-999");
      expect(result).toHaveLength(0);
    });
  });

  describe("getAnimalsByPropertyId", () => {
    it("should return animals for specific property", () => {
      const result = getAnimalsByPropertyId("property-1");
      expect(result).toHaveLength(2);
      expect(result.every((animal) => animal.propertyId === "property-1")).toBe(true);
    });

    it("should return empty array when property has no animals", () => {
      const result = getAnimalsByPropertyId("property-999");
      expect(result).toHaveLength(0);
    });
  });

  describe("addAnimal", () => {
    it("should add new animal with generated ID", () => {
      const formData: AnimalFormData = {
        code: "FJ004",
        registrationNumber: "BR-2020-FJ0004",
        status: "active",
        companyId: "company-1",
        propertyId: "property-1",
      };

      const initialLength = mockAnimals.length;
      const result = addAnimal(formData);

      expect(mockAnimals).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.code).toBe("FJ004");
      expect(result.createdAt).toBeDefined();
    });
  });

  describe("updateAnimal", () => {
    it("should update existing animal", () => {
      const result = updateAnimal("bb0e8400-e29b-41d4-a716-446655440100", {
        code: "FJ001-UPDATED",
      });

      expect(result).toBe(true);
      const updated = mockAnimals.find((a) => a.id === "bb0e8400-e29b-41d4-a716-446655440100");
      expect(updated?.code).toBe("FJ001-UPDATED");
    });

    it("should return false when animal does not exist", () => {
      const result = updateAnimal("nonexistent-id", { code: "NEW" });
      expect(result).toBe(false);
    });
  });

  describe("deleteAnimal", () => {
    it("should delete existing animal", () => {
      const initialLength = mockAnimals.length;
      const result = deleteAnimal("bb0e8400-e29b-41d4-a716-446655440100");

      expect(result).toBe(true);
      expect(mockAnimals).toHaveLength(initialLength - 1);
      expect(
        mockAnimals.find((a) => a.id === "bb0e8400-e29b-41d4-a716-446655440100")
      ).toBeUndefined();
    });

    it("should return false when animal does not exist", () => {
      const initialLength = mockAnimals.length;
      const result = deleteAnimal("nonexistent-id");

      expect(result).toBe(false);
      expect(mockAnimals).toHaveLength(initialLength);
    });
  });
});
