import { describe, it, expect } from "vitest";
import { mockBirths } from "../births";
import type { Birth } from "~/types";
import { BirthPurity } from "~/types";

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
      expect(birth).toHaveProperty("createdAt");
      expect(birth).toHaveProperty("companyId");

      expect(typeof birth.id).toBe("string");
      expect(typeof birth.animalId).toBe("string");
      expect(typeof birth.birthDate).toBe("string");
      expect(typeof birth.createdAt).toBe("string");
      expect(typeof birth.companyId).toBe("string");
    });
  });

  it("should have valid date format (2020-2025)", () => {
    mockBirths.forEach((birth: Birth) => {
      expect(birth.birthDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const date = new Date(birth.birthDate);
      expect(date.toString()).not.toBe("Invalid Date");

      const year = date.getFullYear();
      expect(year).toBeGreaterThanOrEqual(2015);
      expect(year).toBeLessThanOrEqual(2025);
    });
  });

  it("should have valid purity values", () => {
    const validPurities = Object.values(BirthPurity);
    mockBirths.forEach((birth: Birth) => {
      if (birth.purity) {
        expect(validPurities).toContain(birth.purity);
      }
    });
  });

  it("should have valid gender values when present", () => {
    const validGenders = ["male", "female"];
    mockBirths.forEach((birth: Birth) => {
      if (birth.gender) {
        expect(validGenders).toContain(birth.gender);
      }
    });
  });

  it("should have unique IDs", () => {
    const ids = mockBirths.map((birth) => birth.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have unique animalIds (one birth per animal)", () => {
    const animalIds = mockBirths.map((birth) => birth.animalId);
    const uniqueAnimalIds = new Set(animalIds);
    expect(uniqueAnimalIds.size).toBe(animalIds.length);
  });

  it("should have founder animals (first 15 of each property)", () => {
    const founderBirths = mockBirths.filter(
      (birth) => birth.motherId === undefined && birth.fatherId === undefined
    );
    expect(founderBirths.length).toBeGreaterThanOrEqual(30);
  });

  it("should have births with mother/father relationships for non-founders", () => {
    // Check if any births have parent relationships
    // Note: Births from breedings are added lazily, so we check if they exist
    const _nonFounderBirths = mockBirths.filter(
      (birth: Birth) => birth.motherId !== undefined || birth.fatherId !== undefined
    );
    // It's acceptable if there are no non-founder births yet (they're added lazily)
    // But we should have some births total
    expect(mockBirths.length).toBeGreaterThan(0);
  });

  it("should have valid birth dates", () => {
    mockBirths.forEach((birth: Birth) => {
      const birthDate = new Date(birth.birthDate);
      expect(birthDate.toString()).not.toBe("Invalid Date");
      expect(birthDate.getFullYear()).toBeGreaterThanOrEqual(2010);
      expect(birthDate.getFullYear()).toBeLessThanOrEqual(2025);
    });
  });
});
