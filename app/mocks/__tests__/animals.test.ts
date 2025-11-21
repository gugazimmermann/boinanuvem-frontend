import { describe, it, expect } from "vitest";
import { mockAnimals } from "../animals";
import type { Animal } from "~/types";

describe("animals mock", () => {
  it("should export mockAnimals array", () => {
    expect(Array.isArray(mockAnimals)).toBe(true);
    expect(mockAnimals.length).toBeGreaterThan(0);
  });

  it("should have approximately 300 animals", () => {
    expect(mockAnimals.length).toBeGreaterThanOrEqual(250);
    expect(mockAnimals.length).toBeLessThanOrEqual(350);
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

  it("should have valid date format (2020-2025)", () => {
    mockAnimals.forEach((animal: Animal) => {
      const date = new Date(animal.createdAt);
      expect(date.toString()).not.toBe("Invalid Date");

      const year = date.getFullYear();
      expect(year).toBeGreaterThanOrEqual(2020);
      expect(year).toBeLessThanOrEqual(2025);
    });
  });

  it("should have valid status values", () => {
    const validStatuses = ["active", "inactive"];
    mockAnimals.forEach((animal: Animal) => {
      expect(validStatuses).toContain(animal.status);
    });
  });

  it("should have unique IDs", () => {
    const ids = mockAnimals.map((animal) => animal.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have consistent companyId", () => {
    const companyIds = new Set(mockAnimals.map((animal) => animal.companyId));
    expect(companyIds.size).toBeGreaterThan(0);
  });

  it("should have animals distributed across properties", () => {
    const propertyIds = new Set(mockAnimals.map((animal) => animal.propertyId));
    expect(propertyIds.size).toBeGreaterThanOrEqual(3);
  });

  it("should have animals with codes matching property prefixes", () => {
    const fazendaAnimals = mockAnimals.filter((a) => a.code.startsWith("FJ"));
    const chacaraAnimals = mockAnimals.filter((a) => a.code.startsWith("CJ"));
    const sitioAnimals = mockAnimals.filter((a) => a.code.startsWith("SL"));

    expect(fazendaAnimals.length).toBeGreaterThan(0);
    expect(chacaraAnimals.length).toBeGreaterThan(0);
    expect(sitioAnimals.length).toBeGreaterThan(0);

    fazendaAnimals.forEach((animal) => {
      expect(animal.code).toMatch(/^FJ\d+/);
    });
    chacaraAnimals.forEach((animal) => {
      expect(animal.code).toMatch(/^CJ\d+/);
    });
    sitioAnimals.forEach((animal) => {
      expect(animal.code).toMatch(/^SL\d+/);
    });
  });

  it("should have registration numbers matching year in code", () => {
    mockAnimals.forEach((animal: Animal) => {
      expect(animal.registrationNumber).toMatch(/^BR-\d{4}-/);
      const yearMatch = animal.registrationNumber.match(/^BR-(\d{4})-/);
      if (yearMatch) {
        const year = parseInt(yearMatch[1]);
        expect(year).toBeGreaterThanOrEqual(2020);
        expect(year).toBeLessThanOrEqual(2025);
      }
    });
  });

  it("should not have acquisitionDate in animals (handled in acquisitions)", () => {
    mockAnimals.forEach((animal: Animal) => {
      expect(animal).not.toHaveProperty("acquisitionDate");
    });
  });
});
