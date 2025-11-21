import { describe, it, expect } from "vitest";
import { mockBreedings } from "../breedings";
import { mockAnimals } from "../animals";
import { mockBirths } from "../births";
import type { Breeding } from "~/types";

describe("breedings mock", () => {
  it("should export mockBreedings array", () => {
    expect(Array.isArray(mockBreedings)).toBe(true);
    expect(mockBreedings.length).toBeGreaterThan(0);
  });

  it("should have valid breeding structure", () => {
    mockBreedings.forEach((breeding: Breeding) => {
      expect(breeding).toHaveProperty("id");
      expect(breeding).toHaveProperty("animalId");
      expect(breeding).toHaveProperty("date");
      expect(breeding).toHaveProperty("method");
      expect(breeding).toHaveProperty("confirmed");
      expect(breeding).toHaveProperty("createdAt");
      expect(breeding).toHaveProperty("companyId");

      expect(typeof breeding.id).toBe("string");
      expect(typeof breeding.animalId).toBe("string");
      expect(typeof breeding.date).toBe("string");
      expect(typeof breeding.method).toBe("string");
      expect(typeof breeding.confirmed).toBe("boolean");
      expect(typeof breeding.createdAt).toBe("string");
      expect(typeof breeding.companyId).toBe("string");
    });
  });

  it("should have valid date format (2020-2025)", () => {
    mockBreedings.forEach((breeding: Breeding) => {
      expect(breeding.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const date = new Date(breeding.date);
      expect(date.toString()).not.toBe("Invalid Date");

      const year = date.getFullYear();
      expect(year).toBeGreaterThanOrEqual(2020);
      expect(year).toBeLessThanOrEqual(2025);
    });
  });

  it("should have valid method values", () => {
    const validMethods = ["natural", "artificial_insemination"];
    mockBreedings.forEach((breeding: Breeding) => {
      expect(validMethods).toContain(breeding.method);
    });
  });

  it("should have bullId for natural breedings", () => {
    mockBreedings.forEach((breeding: Breeding) => {
      if (breeding.method === "natural") {
        expect(breeding.bullId).toBeDefined();
        expect(typeof breeding.bullId).toBe("string");
      }
    });
  });

  it("should have semenCode for artificial insemination", () => {
    mockBreedings.forEach((breeding: Breeding) => {
      if (breeding.method === "artificial_insemination") {
        expect(breeding.semenCode).toBeDefined();
        expect(typeof breeding.semenCode).toBe("string");
      }
    });
  });

  it("should have unique IDs", () => {
    const ids = mockBreedings.map((breeding) => breeding.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have realistic breeding intervals (12-15 months)", () => {
    const animalIds = new Set(mockBreedings.map((b: Breeding) => b.animalId));

    let checkedAnimals = 0;
    animalIds.forEach((animalId: string) => {
      const animalBreedings = mockBreedings
        .filter((b: Breeding) => b.animalId === animalId)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (animalBreedings.length >= 2) {
        checkedAnimals++;
        for (let i = 1; i < animalBreedings.length; i++) {
          const prevDate = new Date(animalBreedings[i - 1].date);
          const currDate = new Date(animalBreedings[i].date);
          const monthsDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

          expect(monthsDiff).toBeGreaterThanOrEqual(10);
          expect(monthsDiff).toBeLessThanOrEqual(18);
        }
      }
    });

    expect(checkedAnimals).toBeGreaterThan(0);
  });

  it("should only have breedings for female animals", () => {
    mockBreedings.forEach((breeding: Breeding) => {
      const birth = mockBirths.find((b: { animalId: string }) => b.animalId === breeding.animalId);
      if (birth) {
        expect(birth.gender).toBe("female");
      }
    });
  });

  it("should have breedings only for active animals", () => {
    mockBreedings.forEach((breeding: Breeding) => {
      const animal = mockAnimals.find((a: { id: string }) => a.id === breeding.animalId);
      if (animal) {
        expect(animal.status).toBe("active");
      }
    });
  });
});
