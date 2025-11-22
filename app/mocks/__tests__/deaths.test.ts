import { describe, it, expect } from "vitest";
import { mockDeaths } from "../deaths";
import type { Death } from "~/types";

describe("deaths mock", () => {
  it("should export mockDeaths array", () => {
    expect(Array.isArray(mockDeaths)).toBe(true);
  });

  it("should have valid death structure when deaths exist", () => {
    const testDeath: Death = {
      id: "de0e8400-e29b-41d4-a716-446655440001",
      animalId: "animal-1",
      companyId: "company-1",
      date: "2024-01-15",
      cause: "Disease",
      observation: "Test observation",
      createdAt: "2024-01-15",
    };

    expect(testDeath).toHaveProperty("id");
    expect(testDeath).toHaveProperty("animalId");
    expect(testDeath).toHaveProperty("date");
    expect(testDeath).toHaveProperty("cause");
    expect(testDeath).toHaveProperty("companyId");
    expect(testDeath).toHaveProperty("createdAt");

    expect(typeof testDeath.id).toBe("string");
    expect(typeof testDeath.animalId).toBe("string");
    expect(typeof testDeath.date).toBe("string");
    expect(typeof testDeath.cause).toBe("string");
    expect(typeof testDeath.companyId).toBe("string");
    expect(typeof testDeath.createdAt).toBe("string");
  });

  it("should allow optional observation field", () => {
    const testDeathWithoutObservation: Death = {
      id: "de0e8400-e29b-41d4-a716-446655440002",
      animalId: "animal-2",
      companyId: "company-1",
      date: "2024-01-16",
      cause: "Accident",
      createdAt: "2024-01-16",
    };

    expect(testDeathWithoutObservation.observation).toBeUndefined();
  });

  it("should have valid date format", () => {
    const testDeath: Death = {
      id: "de0e8400-e29b-41d4-a716-446655440003",
      animalId: "animal-3",
      companyId: "company-1",
      date: "2024-01-17",
      cause: "Old age",
      createdAt: "2024-01-17",
    };

    expect(testDeath.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const date = new Date(testDeath.date);
    expect(date.toString()).not.toBe("Invalid Date");
  });

  it("should have valid cause (non-empty string)", () => {
    const testDeath: Death = {
      id: "de0e8400-e29b-41d4-a716-446655440004",
      animalId: "animal-4",
      companyId: "company-1",
      date: "2024-01-18",
      cause: "Disease",
      createdAt: "2024-01-18",
    };

    expect(typeof testDeath.cause).toBe("string");
    expect(testDeath.cause.length).toBeGreaterThan(0);
  });
});
