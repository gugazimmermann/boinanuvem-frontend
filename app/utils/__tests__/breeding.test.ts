import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getBreedingMethodLabel,
  formatBreedingDate,
  calculateExpectedBirthDate,
  calculateDaysPregnant,
} from "../breeding";
import type { Language } from "~/types";
import { ptBR } from "date-fns/locale/pt-BR";
import { enUS } from "date-fns/locale/en-US";
import { es } from "date-fns/locale/es";

// Mock date locale to return actual date-fns locales
vi.mock("../date", () => ({
  getDateLocale: (language: Language) => {
    const locales: Record<Language, unknown> = {
      pt: ptBR,
      en: enUS,
      es: es,
    };
    return locales[language] || locales.pt;
  },
}));

describe("breeding", () => {
  describe("getBreedingMethodLabel", () => {
    it("should return natural method label", () => {
      const t = {
        breedings: {
          new: {
            methodNatural: "Natural",
            methodAI: "Artificial Insemination",
          },
        },
      };
      const result = getBreedingMethodLabel("natural", t as never);
      expect(result).toBe("Natural");
    });

    it("should return AI method label", () => {
      const t = {
        breedings: {
          new: {
            methodNatural: "Natural",
            methodAI: "Artificial Insemination",
          },
        },
      };
      const result = getBreedingMethodLabel("artificial_insemination", t as never);
      expect(result).toBe("Artificial Insemination");
    });
  });

  describe("formatBreedingDate", () => {
    it("should format date for Portuguese", () => {
      // Use date with time to avoid timezone issues
      const result = formatBreedingDate("2024-01-15T12:00:00Z", "pt");
      expect(result).toContain("01/2024");
      expect(result).toContain("/");
      // Should be in DD/MM/YYYY format
      expect(result.split("/").length).toBe(3);
    });

    it("should format date for English", () => {
      // Use date with time to avoid timezone issues
      const result = formatBreedingDate("2024-01-15T12:00:00Z", "en");
      expect(result).toContain("01/15/2024");
    });

    it("should format Date object", () => {
      // Use date with explicit time to avoid timezone issues
      const date = new Date("2024-01-15T12:00:00Z");
      const result = formatBreedingDate(date, "pt");
      expect(result).toContain("01/2024");
      expect(result).toContain("/");
      // Should be in DD/MM/YYYY format
      expect(result.split("/").length).toBe(3);
    });

    it("should default to Portuguese", () => {
      // Use date with time to avoid timezone issues
      const result = formatBreedingDate("2024-01-15T12:00:00Z");
      expect(result).toContain("01/2024");
      expect(result).toContain("/");
      // Should be in DD/MM/YYYY format
      expect(result.split("/").length).toBe(3);
    });
  });

  describe("calculateExpectedBirthDate", () => {
    it("should add 270 days to breeding date", () => {
      const breedingDate = new Date("2024-01-15");
      const expected = calculateExpectedBirthDate(breedingDate);
      const expectedDate = new Date(breedingDate);
      expectedDate.setDate(expectedDate.getDate() + 270);
      expect(expected.getTime()).toBe(expectedDate.getTime());
    });

    it("should handle date string", () => {
      const expected = calculateExpectedBirthDate("2024-01-15");
      const breedingDate = new Date("2024-01-15");
      const expectedDate = new Date(breedingDate);
      expectedDate.setDate(expectedDate.getDate() + 270);
      expect(expected.getTime()).toBe(expectedDate.getTime());
    });

    it("should calculate correct expected date", () => {
      const breedingDate = new Date("2024-01-01");
      const expected = calculateExpectedBirthDate(breedingDate);
      // January 1 + 270 days = approximately September 27 (270 days from Jan 1)
      // Let's check it's in the right month range (September or October)
      const month = expected.getMonth();
      expect(month).toBeGreaterThanOrEqual(8); // September (0-indexed)
      expect(month).toBeLessThanOrEqual(9); // October (0-indexed)
    });
  });

  describe("calculateDaysPregnant", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-20"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should calculate days pregnant from date string", () => {
      const days = calculateDaysPregnant("2024-01-15");
      expect(days).toBe(5);
    });

    it("should calculate days pregnant from Date object", () => {
      const breedingDate = new Date("2024-01-15");
      const days = calculateDaysPregnant(breedingDate);
      expect(days).toBe(5);
    });

    it("should return 0 for today", () => {
      const days = calculateDaysPregnant("2024-01-20");
      expect(days).toBe(0);
    });

    it("should handle past dates", () => {
      const days = calculateDaysPregnant("2024-01-10");
      expect(days).toBe(10);
    });
  });
});
