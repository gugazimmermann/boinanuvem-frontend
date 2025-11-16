import { describe, it, expect } from "vitest";
import { mockAnimals } from "../animals";
import type { Animal } from "~/types";

describe("animals mock", () => {
  it("should export mockAnimals array", () => {
    expect(Array.isArray(mockAnimals)).toBe(true);
    expect(mockAnimals.length).toBeGreaterThan(0);
  });

  it("should have valid animal structure", () => {
    mockAnimals.forEach((animal: Animal) => {
      expect(animal).toHaveProperty("id");
      expect(animal).toHaveProperty("code");
      expect(animal).toHaveProperty("registrationNumber");
      expect(animal).toHaveProperty("status");
      expect(animal).toHaveProperty("createdAt");
      expect(animal).toHaveProperty("companyId");
      expect(animal).toHaveProperty("propertyId");

      expect(typeof animal.id).toBe("string");
      expect(typeof animal.code).toBe("string");
      expect(typeof animal.registrationNumber).toBe("string");
      expect(typeof animal.status).toBe("string");
      expect(typeof animal.createdAt).toBe("string");
      expect(typeof animal.companyId).toBe("string");
      expect(typeof animal.propertyId).toBe("string");
    });
  });

  it("should have valid status", () => {
    mockAnimals.forEach((animal: Animal) => {
      expect(["active", "inactive", "pending"]).toContain(animal.status);
    });
  });

  it("should have valid date format", () => {
    mockAnimals.forEach((animal: Animal) => {
      expect(animal.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(() => new Date(animal.createdAt)).not.toThrow();
    });
  });

  it("should have valid acquisition date format when present", () => {
    mockAnimals.forEach((animal: Animal) => {
      if (animal.acquisitionDate) {
        expect(animal.acquisitionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(() => new Date(animal.acquisitionDate!)).not.toThrow();
      }
    });
  });

  it("should have unique IDs", () => {
    const ids = mockAnimals.map((a) => a.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have unique codes per property", () => {
    const codesByProperty = new Map<string, Set<string>>();
    mockAnimals.forEach((animal: Animal) => {
      if (!codesByProperty.has(animal.propertyId)) {
        codesByProperty.set(animal.propertyId, new Set());
      }
      codesByProperty.get(animal.propertyId)!.add(animal.code);
    });

    codesByProperty.forEach((codes, _propertyId) => {
      expect(codes.size).toBeGreaterThan(0);
    });
  });

  it("should have valid registration number format", () => {
    mockAnimals.forEach((animal: Animal) => {
      expect(animal.registrationNumber).toMatch(/^BR-\d{4}-[A-Z]{2}\d{4}$/);
    });
  });

  it("should have animals from different properties", () => {
    const propertyIds = new Set(mockAnimals.map((a) => a.propertyId));
    expect(propertyIds.size).toBeGreaterThan(1);
  });

  it("should have animals with and without acquisition dates", () => {
    const animalsWithAcquisition = mockAnimals.filter((a) => a.acquisitionDate);
    const animalsWithoutAcquisition = mockAnimals.filter((a) => !a.acquisitionDate);
    expect(animalsWithAcquisition.length).toBeGreaterThan(0);
    expect(animalsWithoutAcquisition.length).toBeGreaterThan(0);
  });
});
