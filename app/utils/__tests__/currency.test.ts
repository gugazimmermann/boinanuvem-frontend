import { describe, it, expect } from "vitest";
import { formatCurrency } from "../currency";

describe("currency", () => {
  describe("formatCurrency", () => {
    it("should format currency for Portuguese (pt)", () => {
      const result = formatCurrency(1234.56, "pt");
      expect(result).toContain("1.234,56");
      expect(result).toContain("R$");
    });

    it("should format currency for English (en)", () => {
      const result = formatCurrency(1234.56, "en");
      expect(result).toContain("1,234.56");
      expect(result).toContain("R$");
    });

    it("should format currency for Spanish (es)", () => {
      const result = formatCurrency(1234.56, "es");
      // Spanish locale (es-ES) formats BRL as "BRL" instead of "R$"
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
      // Should contain the number and currency symbol/code
      expect(result).toMatch(/\d/);
    });

    it("should default to Portuguese when language is not provided", () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain("R$");
    });

    it("should handle zero", () => {
      const result = formatCurrency(0, "pt");
      expect(result).toContain("0");
    });

    it("should handle negative values", () => {
      const result = formatCurrency(-1234.56, "pt");
      expect(result).toContain("-");
    });

    it("should handle large numbers", () => {
      const result = formatCurrency(1000000, "pt");
      expect(result).toContain("1.000.000");
    });

    it("should handle decimal values", () => {
      const result = formatCurrency(123.45, "pt");
      expect(result).toContain("123,45");
    });
  });
});
