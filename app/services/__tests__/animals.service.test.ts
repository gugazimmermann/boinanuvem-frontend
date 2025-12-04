import { describe, it, expect, beforeEach } from "vitest";
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

describe("animals.service", () => {
  beforeEach(() => {
    // Reset mock data before each test
    mockAnimals.length = 0;
    mockAnimals.push(
      {
        id: "animal-1",
        companyId: "company-1",
        propertyId: "property-1",
        code: "AN001",
        registrationNumber: "BR-2020-AN001",
        status: "active",
        createdAt: "2025-01-01",
      },
      {
        id: "animal-2",
        companyId: "company-1",
        propertyId: "property-2",
        code: "AN002",
        registrationNumber: "BR-2021-AN002",
        status: "active",
        createdAt: "2025-01-02",
      },
      {
        id: "animal-3",
        companyId: "company-2",
        propertyId: "property-1",
        code: "AN003",
        registrationNumber: "BR-2022-AN003",
        status: "active",
        createdAt: "2025-01-03",
      }
    );
  });

  describe("getAnimalById", () => {
    it("should return animal when ID exists", () => {
      const result = getAnimalById("animal-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("animal-1");
      expect(result?.code).toBe("AN001");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getAnimalById("animal-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getAnimalById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getAnimalsByCompanyId", () => {
    it("should return all animals for a company", () => {
      const result = getAnimalsByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("animal-1");
      expect(result[1]?.id).toBe("animal-2");
    });

    it("should return empty array when company has no animals", () => {
      const result = getAnimalsByCompanyId("company-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getAnimalsByPropertyId", () => {
    it("should return all animals for a property", () => {
      const result = getAnimalsByPropertyId("property-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("animal-1");
      expect(result[1]?.id).toBe("animal-3");
    });

    it("should return empty array when property has no animals", () => {
      const result = getAnimalsByPropertyId("property-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("addAnimal", () => {
    it("should add a new animal with generated ID", () => {
      const formData: AnimalFormData = {
        companyId: "company-1",
        propertyId: "property-1",
        code: "AN004",
        registrationNumber: "BR-2023-AN004",
        status: "active",
      };

      const initialLength = mockAnimals.length;
      const result = addAnimal(formData);

      expect(mockAnimals).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.companyId).toBe("company-1");
      expect(result.code).toBe("AN004");
      expect(result.createdAt).toBeDefined();
    });

    it("should generate ID with correct prefix", () => {
      const formData: AnimalFormData = {
        companyId: "company-1",
        propertyId: "property-1",
        code: "AN004",
        registrationNumber: "BR-2023-AN004",
        status: "active",
      };

      const result = addAnimal(formData);
      expect(result.id).toContain("bb0e8400-e29b-41d4-a716");
    });

    it("should use default ID when array is empty", () => {
      mockAnimals.length = 0;
      const formData: AnimalFormData = {
        companyId: "company-1",
        propertyId: "property-1",
        code: "AN004",
        registrationNumber: "BR-2023-AN004",
        status: "active",
      };

      const result = addAnimal(formData);
      expect(result.id).toBe("bb0e8400-e29b-41d4-a716-446655440009");
    });
  });

  describe("updateAnimal", () => {
    it("should update animal when ID exists", () => {
      const updateData: Partial<AnimalFormData> = {
        code: "AN001-UPDATED",
        status: "inactive",
      };

      const result = updateAnimal("animal-1", updateData);
      expect(result).toBe(true);

      const updated = mockAnimals.find((animal) => animal.id === "animal-1");
      expect(updated?.code).toBe("AN001-UPDATED");
      expect(updated?.status).toBe("inactive");
    });

    it("should preserve existing fields when updating", () => {
      const original = mockAnimals.find((animal) => animal.id === "animal-1");
      const originalCompanyId = original?.companyId;

      const updateData: Partial<AnimalFormData> = {
        code: "AN001-UPDATED",
      };

      updateAnimal("animal-1", updateData);

      const updated = mockAnimals.find((animal) => animal.id === "animal-1");
      expect(updated?.companyId).toBe(originalCompanyId);
      expect(updated?.id).toBe("animal-1");
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<AnimalFormData> = {
        code: "AN-UPDATED",
      };

      const result = updateAnimal("animal-nonexistent", updateData);
      expect(result).toBe(false);
    });
  });

  describe("deleteAnimal", () => {
    it("should delete animal when ID exists", () => {
      const initialLength = mockAnimals.length;
      const result = deleteAnimal("animal-1");

      expect(result).toBe(true);
      expect(mockAnimals).toHaveLength(initialLength - 1);
      expect(mockAnimals.find((animal) => animal.id === "animal-1")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockAnimals.length;
      const result = deleteAnimal("animal-nonexistent");

      expect(result).toBe(false);
      expect(mockAnimals).toHaveLength(initialLength);
    });

    it("should delete the correct animal", () => {
      deleteAnimal("animal-2");
      expect(mockAnimals.find((animal) => animal.id === "animal-2")).toBeUndefined();
      expect(mockAnimals.find((animal) => animal.id === "animal-1")).toBeDefined();
      expect(mockAnimals.find((animal) => animal.id === "animal-3")).toBeDefined();
    });
  });
});
