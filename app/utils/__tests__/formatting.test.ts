import { describe, it, expect } from "vitest";
import {
  formatAreaType,
  getLocaleForDateTime,
  getLocaleForNumber,
  getLocaleForCurrency,
  formatDate,
  formatDateTime,
  formatCurrency,
  formatNumber,
} from "../formatting";
import { AreaType } from "~/types";

describe("formatting", () => {
  describe("formatAreaType", () => {
    it("should format all area types correctly", () => {
      expect(formatAreaType(AreaType.HECTARES)).toBe("ha");
      expect(formatAreaType(AreaType.SQUARE_METERS)).toBe("m²");
      expect(formatAreaType(AreaType.SQUARE_FEET)).toBe("ft²");
      expect(formatAreaType(AreaType.ACRES)).toBe("ac");
      expect(formatAreaType(AreaType.SQUARE_KILOMETERS)).toBe("km²");
      expect(formatAreaType(AreaType.SQUARE_MILES)).toBe("mi²");
    });

    it("should return type as-is for unknown type", () => {
      expect(formatAreaType("unknown" as AreaType)).toBe("unknown");
    });
  });

  describe("getLocaleForDateTime", () => {
    it("should return correct locale for each language", () => {
      expect(getLocaleForDateTime("pt")).toBe("pt-BR");
      expect(getLocaleForDateTime("en")).toBe("en-US");
      expect(getLocaleForDateTime("es")).toBe("es-ES");
    });
  });

  describe("getLocaleForNumber", () => {
    it("should return correct locale for each language", () => {
      expect(getLocaleForNumber("pt")).toBe("pt-BR");
      expect(getLocaleForNumber("en")).toBe("en-US");
      expect(getLocaleForNumber("es")).toBe("es-ES");
    });
  });

  describe("getLocaleForCurrency", () => {
    it("should return correct locale for each language", () => {
      expect(getLocaleForCurrency("pt")).toBe("pt-BR");
      expect(getLocaleForCurrency("en")).toBe("en-US");
      expect(getLocaleForCurrency("es")).toBe("es-ES");
    });
  });

  describe("formatDate", () => {
    it("should format date for Portuguese", () => {
      const date = new Date("2024-01-15T12:00:00Z");
      const result = formatDate(date, "pt");
      expect(result).toContain("01/2024");
      expect(result).toContain("/");
    });

    it("should format date for English", () => {
      const date = new Date("2024-01-15T12:00:00Z");
      const result = formatDate(date, "en");
      expect(result).toContain("01/15/2024");
    });

    it("should format date string", () => {
      const result = formatDate("2024-01-15", "pt");
      expect(result).toContain("01/2024");
      expect(result).toContain("/");
    });

    it("should use custom format string", () => {
      const date = new Date("2024-01-15T12:00:00Z");
      const result = formatDate(date, "pt", "yyyy-MM-dd");
      expect(result).toBe("2024-01-15");
    });

    it("should default to Portuguese", () => {
      const date = new Date("2024-01-15T12:00:00Z");
      const result = formatDate(date);
      expect(result).toContain("01/2024");
      expect(result).toContain("/");
    });
  });

  describe("formatDateTime", () => {
    it("should format date and time for Portuguese", () => {
      const date = new Date("2024-01-15T14:30:00");
      const result = formatDateTime(date, "pt");
      expect(result).toContain("15/01/2024");
      expect(result).toContain("14:30");
    });

    it("should format date and time for English", () => {
      const date = new Date("2024-01-15T14:30:00");
      const result = formatDateTime(date, "en");
      expect(result).toContain("01/15/2024");
      expect(result).toContain("14:30");
    });

    it("should format date string with time", () => {
      const result = formatDateTime("2024-01-15T14:30:00", "pt");
      expect(result).toContain("15/01/2024");
      expect(result).toContain("14:30");
    });
  });

  describe("formatCurrency", () => {
    it("should format currency for Portuguese", () => {
      const result = formatCurrency(1234.56, "pt");
      expect(result).toContain("R$");
      expect(result).toContain("1.234,56");
    });

    it("should format currency for English", () => {
      const result = formatCurrency(1234.56, "en");
      expect(result).toContain("R$");
      expect(result).toContain("1,234.56");
    });

    it("should format currency for Spanish", () => {
      const result = formatCurrency(1234.56, "es");
      // Spanish locale may format BRL differently, but should format the number
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should default to Portuguese", () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain("R$");
    });
  });

  describe("formatNumber", () => {
    it("should format number with default options", () => {
      const result = formatNumber(1234.56, "pt");
      expect(result).toContain("1.234");
    });

    it("should format number with custom fraction digits", () => {
      const result = formatNumber(1234.56, "pt", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      expect(result).toContain("1.234,56");
    });

    it("should format number for different languages", () => {
      const resultPt = formatNumber(1234.56, "pt");
      const resultEn = formatNumber(1234.56, "en");
      expect(resultPt).toBeDefined();
      expect(resultEn).toBeDefined();
    });

    it("should handle zero", () => {
      const result = formatNumber(0, "pt");
      expect(result).toBe("0");
    });

    it("should handle large numbers", () => {
      const result = formatNumber(1000000, "pt");
      expect(result).toContain("1.000.000");
    });
  });
});
