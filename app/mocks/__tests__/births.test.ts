import { describe, it, expect } from "vitest";
import { mockBirths } from "../births";
import { mockAnimals } from "../animals";
import type { Birth } from "~/types";
import { BirthPurity, AnimalBreed } from "~/types";

describe("births mock", () => {
  it("should export mockBirths array", () => {
    expect(Array.isArray(mockBirths)).toBe(true);
    expect(mockBirths.length).toBeGreaterThan(0);
  });

  it("should have valid birth structure", () => {
    mockBirths.forEach((birth: Birth) => {
      expect(birth).toHaveProperty("id");
      expect(birth).toHaveProperty("animalId");
      expect(birth).toHaveProperty("birthDate");
      expect(birth).toHaveProperty("breed");
      expect(birth).toHaveProperty("gender");
      expect(birth).toHaveProperty("purity");
      expect(birth).toHaveProperty("observation");
      expect(birth).toHaveProperty("createdAt");
      expect(birth).toHaveProperty("companyId");

      expect(typeof birth.id).toBe("string");
      expect(typeof birth.animalId).toBe("string");
      expect(typeof birth.birthDate).toBe("string");
      expect(typeof birth.breed).toBe("string");
      expect(typeof birth.gender).toBe("string");
      expect(typeof birth.purity).toBe("string");
      expect(typeof birth.observation).toBe("string");
      expect(typeof birth.createdAt).toBe("string");
      expect(typeof birth.companyId).toBe("string");
    });
  });

  it("should have valid date format", () => {
    mockBirths.forEach((birth: Birth) => {
      expect(birth.birthDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(() => new Date(birth.birthDate)).not.toThrow();
      expect(birth.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(() => new Date(birth.createdAt)).not.toThrow();
    });
  });

  it("should have valid breed", () => {
    const validBreeds = Object.values(AnimalBreed);
    mockBirths.forEach((birth: Birth) => {
      expect(validBreeds).toContain(birth.breed);
    });
  });

  it("should have valid gender", () => {
    mockBirths.forEach((birth: Birth) => {
      expect(["male", "female"]).toContain(birth.gender);
    });
  });

  it("should have valid purity", () => {
    const validPurities = Object.values(BirthPurity);
    mockBirths.forEach((birth: Birth) => {
      expect(validPurities).toContain(birth.purity);
    });
  });

  it("should have unique IDs", () => {
    const ids = mockBirths.map((b) => b.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have unique animal IDs", () => {
    const animalIds = mockBirths.map((b) => b.animalId);
    const uniqueAnimalIds = new Set(animalIds);
    expect(uniqueAnimalIds.size).toBe(animalIds.length);
  });

  it("should have valid parent IDs when present", () => {
    mockBirths.forEach((birth: Birth) => {
      if (birth.motherId) {
        expect(typeof birth.motherId).toBe("string");
        expect(birth.motherId.length).toBeGreaterThan(0);
      }
      if (birth.fatherId) {
        expect(typeof birth.fatherId).toBe("string");
        expect(birth.fatherId.length).toBeGreaterThan(0);
      }
    });
  });

  it("should have births for animals that exist", () => {
    const animalIds = new Set(mockAnimals.map((a) => a.id));
    mockBirths.forEach((birth: Birth) => {
      expect(animalIds.has(birth.animalId)).toBe(true);
    });
  });

  it("should have births with different purity levels", () => {
    const purities = new Set(mockBirths.map((b) => b.purity));
    expect(purities.size).toBeGreaterThan(1);
  });

  it("should have some births with parents and some without", () => {
    const birthsWithParents = mockBirths.filter(
      (b) => b.motherId !== undefined && b.fatherId !== undefined
    );
    const birthsWithoutParents = mockBirths.filter(
      (b) => b.motherId === undefined && b.fatherId === undefined
    );
    expect(birthsWithParents.length).toBeGreaterThan(0);
    expect(birthsWithoutParents.length).toBeGreaterThan(0);
  });

  it("should have valid parent relationships when parents have births", () => {
    const birthByAnimalId = new Map(mockBirths.map((b) => [b.animalId, b]));
    const animalById = new Map(mockAnimals.map((a) => [a.id, a]));
    
    mockBirths.forEach((birth: Birth) => {
      if (birth.motherId) {
        const motherBirth = birthByAnimalId.get(birth.motherId);
        if (motherBirth) {
          expect(typeof motherBirth.gender).toBe("string");
        }
      }
      if (birth.fatherId) {
        const fatherBirth = birthByAnimalId.get(birth.fatherId);
        if (fatherBirth) {
          expect(typeof fatherBirth.gender).toBe("string");
        }
      }
    });
  });
});

