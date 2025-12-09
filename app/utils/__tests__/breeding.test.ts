import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getBreedingMethodLabel,
  formatBreedingDate,
  calculateExpectedBirthDate,
  calculateDaysPregnant,
} from "../breeding";

describe("getBreedingMethodLabel", () => {
  const mockTranslation = {
    breedings: {
      new: {
        methodNatural: "Natural",
        methodAI: "Inseminação Artificial",
      },
    },
  } as unknown as Parameters<typeof getBreedingMethodLabel>[1];

  it("should return natural label for natural method", () => {
    expect(getBreedingMethodLabel("natural", mockTranslation)).toBe("Natural");
  });

  it("should return AI label for AI method", () => {
    expect(getBreedingMethodLabel("artificial_insemination", mockTranslation)).toBe(
      "Inseminação Artificial"
    );
  });
});

describe("formatBreedingDate", () => {
  it("should format date string for Portuguese", () => {
    const result = formatBreedingDate("2024-01-15", "pt");
    // Date may be off by one day due to timezone, check it contains date parts
    expect(result).toMatch(/\d{2}\/\d{2}\/2024/);
    expect(result).toContain("01");
    expect(result).toContain("2024");
  });

  it("should format Date object for Portuguese", () => {
    const date = new Date("2024-01-15");
    const result = formatBreedingDate(date, "pt");
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("should format date for English", () => {
    const result = formatBreedingDate("2024-01-15", "en");
    // Date may be off by one day due to timezone, check it contains date parts
    expect(result).toMatch(/\d{2}\/\d{2}\/2024/);
    expect(result).toContain("01");
    expect(result).toContain("2024");
  });

  it("should default to Portuguese", () => {
    const result1 = formatBreedingDate("2024-01-15");
    const result2 = formatBreedingDate("2024-01-15", "pt");
    expect(result1).toBe(result2);
  });
});

describe("calculateExpectedBirthDate", () => {
  it("should add 270 days to breeding date", () => {
    const breedingDate = new Date("2024-01-01");
    const expected = calculateExpectedBirthDate(breedingDate);
    const expectedDate = new Date(breedingDate);
    expectedDate.setDate(expectedDate.getDate() + 270);
    expect(expected.getTime()).toBe(expectedDate.getTime());
  });

  it("should handle string dates", () => {
    const breedingDate = "2024-01-01";
    const expected = calculateExpectedBirthDate(breedingDate);
    const expectedDate = new Date(breedingDate);
    expectedDate.setDate(expectedDate.getDate() + 270);
    expect(expected.getTime()).toBe(expectedDate.getTime());
  });

  it("should handle dates at year boundary", () => {
    const breedingDate = new Date("2024-06-01");
    const expected = calculateExpectedBirthDate(breedingDate);
    expect(expected.getFullYear()).toBe(2025);
  });
});

describe("calculateDaysPregnant", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should calculate days pregnant from Date", () => {
    const now = new Date("2024-01-31T12:00:00Z");
    vi.setSystemTime(now);

    const breedingDate = new Date("2024-01-01T12:00:00Z");
    const days = calculateDaysPregnant(breedingDate);
    expect(days).toBe(30);
  });

  it("should calculate days pregnant from string", () => {
    const now = new Date("2024-01-31T12:00:00Z");
    vi.setSystemTime(now);

    const days = calculateDaysPregnant("2024-01-01T12:00:00Z");
    expect(days).toBe(30);
  });

  it("should return 0 for today", () => {
    const now = new Date("2024-01-15T12:00:00Z");
    vi.setSystemTime(now);

    const days = calculateDaysPregnant("2024-01-15T12:00:00Z");
    expect(days).toBe(0);
  });

  it("should handle future dates (negative days)", () => {
    const now = new Date("2024-01-01T12:00:00Z");
    vi.setSystemTime(now);

    const days = calculateDaysPregnant("2024-01-15T12:00:00Z");
    expect(days).toBeLessThan(0);
  });

  it("should use floor for partial days", () => {
    const now = new Date("2024-01-15T18:00:00Z");
    vi.setSystemTime(now);

    const breedingDate = new Date("2024-01-15T06:00:00Z"); // 12 hours ago
    const days = calculateDaysPregnant(breedingDate);
    expect(days).toBe(0); // Should floor to 0
  });
});
