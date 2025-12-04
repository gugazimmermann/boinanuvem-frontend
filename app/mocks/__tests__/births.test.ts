import { describe, it, expect } from "vitest";
import { mockBirths } from "../births";
import { mockAnimals } from "../animals";
import { mockCompanies } from "../companies";
import { AnimalBreed, BirthPurity } from "~/types";

describe("births", () => {
  describe("mockBirths", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockBirths)).toBe(true);
    });

    it("should not be empty", () => {
      expect(mockBirths.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockBirths.forEach((birth) => {
        expect(birth).toHaveProperty("id");
        expect(birth).toHaveProperty("animalId");
        expect(birth).toHaveProperty("birthDate");
        expect(birth).toHaveProperty("breed");
        expect(birth).toHaveProperty("gender");
        expect(birth).toHaveProperty("purity");
        expect(birth).toHaveProperty("createdAt");
        expect(birth).toHaveProperty("companyId");
      });
    });

    it("should have unique IDs", () => {
      const ids = mockBirths.map((birth) => birth.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid ID format", () => {
      const idRegex = /^bi0e8400-e29b-41d4-a716-\d{12}$/;
      mockBirths.forEach((birth) => {
        expect(birth.id).toMatch(idRegex);
      });
    });

    it("should have valid date format", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      mockBirths.forEach((birth) => {
        expect(birth.birthDate).toMatch(dateRegex);
        expect(birth.createdAt).toMatch(dateRegex);
      });
    });

    it("should have dates within expected range", () => {
      mockBirths.forEach((birth) => {
        const birthDate = new Date(birth.birthDate);
        const createdAt = new Date(birth.createdAt);
        expect(birthDate.getFullYear()).toBeGreaterThanOrEqual(2015);
        expect(createdAt.getFullYear()).toBeGreaterThanOrEqual(2020);
      });
    });

    it("should have valid breeds", () => {
      const validBreeds = Object.values(AnimalBreed);
      mockBirths.forEach((birth) => {
        expect(validBreeds).toContain(birth.breed);
      });
    });

    it("should have valid genders", () => {
      const validGenders = ["male", "female"];
      mockBirths.forEach((birth) => {
        expect(validGenders).toContain(birth.gender);
      });
    });

    it("should have valid purity values", () => {
      const validPurities = Object.values(BirthPurity);
      mockBirths.forEach((birth) => {
        expect(validPurities).toContain(birth.purity);
      });
    });

    it("should reference valid animal IDs", () => {
      const animalIds = mockAnimals.map((a) => a.id);
      mockBirths.forEach((birth) => {
        expect(animalIds).toContain(birth.animalId);
      });
    });

    it("should reference valid company IDs", () => {
      const companyIds = mockCompanies.map((c) => c.id);
      mockBirths.forEach((birth) => {
        expect(companyIds).toContain(birth.companyId);
      });
    });

    it("should have valid birth dates", () => {
      mockBirths.forEach((birth) => {
        const birthDate = new Date(birth.birthDate);
        expect(birthDate.getTime()).not.toBeNaN();
        expect(birthDate.getFullYear()).toBeGreaterThanOrEqual(2015);
      });
    });

    it("should have unique animal IDs", () => {
      const animalIds = mockBirths.map((birth) => birth.animalId);
      const uniqueAnimalIds = new Set(animalIds);
      expect(uniqueAnimalIds.size).toBe(animalIds.length);
    });
  });
});
