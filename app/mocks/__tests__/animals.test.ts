import { describe, it, expect, beforeEach } from "vitest";
import {
  mockAnimals,
  getAnimalById,
  getAnimalsByCompanyId,
  getAnimalsByPropertyId,
  addAnimal,
  deleteAnimal,
  updateAnimal,
} from "../animals";
import type { AnimalFormData } from "~/types";

describe("Animals Mock Functions", () => {
  const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";
  const PROPERTY_ID = "550e8400-e29b-41d4-a716-446655440010";

  describe("getAnimalById", () => {
    it("should return animal by id", () => {
      if (mockAnimals.length > 0) {
        const animal = getAnimalById(mockAnimals[0].id);
        expect(animal).toBeDefined();
        expect(animal?.id).toBe(mockAnimals[0].id);
      }
    });

    it("should return undefined for non-existent id", () => {
      const animal = getAnimalById("non-existent-id");
      expect(animal).toBeUndefined();
    });

    it("should return undefined for undefined id", () => {
      const animal = getAnimalById(undefined);
      expect(animal).toBeUndefined();
    });
  });

  describe("getAnimalsByCompanyId", () => {
    it("should return animals for a company", () => {
      const animals = getAnimalsByCompanyId(COMPANY_ID);
      expect(Array.isArray(animals)).toBe(true);
      animals.forEach((animal) => {
        expect(animal.companyId).toBe(COMPANY_ID);
      });
    });

    it("should return empty array for non-existent company", () => {
      const animals = getAnimalsByCompanyId("non-existent-company");
      expect(animals).toEqual([]);
    });
  });

  describe("getAnimalsByPropertyId", () => {
    it("should return animals for a property", () => {
      const animals = getAnimalsByPropertyId(PROPERTY_ID);
      expect(Array.isArray(animals)).toBe(true);
      animals.forEach((animal) => {
        expect(animal.propertyId).toBe(PROPERTY_ID);
      });
    });

    it("should return empty array for non-existent property", () => {
      const animals = getAnimalsByPropertyId("non-existent-property");
      expect(animals).toEqual([]);
    });
  });

  describe("addAnimal", () => {
    it("should add a new animal", () => {
      const initialCount = mockAnimals.length;
      const newAnimalData: AnimalFormData = {
        code: "TEST001",
        registrationNumber: "BR-2024-TEST001",
        status: "active",
        companyId: COMPANY_ID,
        propertyId: PROPERTY_ID,
      };

      const added = addAnimal(newAnimalData);
      expect(added).toBeDefined();
      expect(added.id).toBeDefined();
      expect(added.createdAt).toBeDefined();
      expect(added.code).toBe(newAnimalData.code);
      expect(added.registrationNumber).toBe(newAnimalData.registrationNumber);
      expect(added.status).toBe(newAnimalData.status);
      expect(added.companyId).toBe(newAnimalData.companyId);
      expect(added.propertyId).toBe(newAnimalData.propertyId);
      expect(mockAnimals.length).toBe(initialCount + 1);
    });

    it("should generate unique id for new animal", () => {
      const newAnimalData: AnimalFormData = {
        code: "TEST002",
        registrationNumber: "BR-2024-TEST002",
        status: "active",
        companyId: COMPANY_ID,
        propertyId: PROPERTY_ID,
      };

      const added1 = addAnimal(newAnimalData);
      const added2 = addAnimal({ ...newAnimalData, code: "TEST003" });
      expect(added1.id).not.toBe(added2.id);
    });
  });

  describe("deleteAnimal", () => {
    it("should delete an animal by id", () => {
      const newAnimalData: AnimalFormData = {
        code: "DELETE001",
        registrationNumber: "BR-2024-DELETE001",
        status: "active",
        companyId: COMPANY_ID,
        propertyId: PROPERTY_ID,
      };

      const added = addAnimal(newAnimalData);
      const initialCount = mockAnimals.length;
      const deleted = deleteAnimal(added.id);

      expect(deleted).toBe(true);
      expect(mockAnimals.length).toBe(initialCount - 1);
      expect(getAnimalById(added.id)).toBeUndefined();
    });

    it("should return false for non-existent id", () => {
      const deleted = deleteAnimal("non-existent-id");
      expect(deleted).toBe(false);
    });
  });

  describe("updateAnimal", () => {
    it("should update an animal", () => {
      const newAnimalData: AnimalFormData = {
        code: "UPDATE001",
        registrationNumber: "BR-2024-UPDATE001",
        status: "active",
        companyId: COMPANY_ID,
        propertyId: PROPERTY_ID,
      };

      const added = addAnimal(newAnimalData);
      const updated = updateAnimal(added.id, { code: "UPDATED001", status: "inactive" });

      expect(updated).toBe(true);
      const animal = getAnimalById(added.id);
      expect(animal?.code).toBe("UPDATED001");
      expect(animal?.status).toBe("inactive");
      expect(animal?.registrationNumber).toBe(newAnimalData.registrationNumber);
    });

    it("should return false for non-existent id", () => {
      const updated = updateAnimal("non-existent-id", { code: "TEST" });
      expect(updated).toBe(false);
    });
  });
});

