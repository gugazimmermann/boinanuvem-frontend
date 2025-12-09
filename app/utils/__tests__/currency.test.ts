import { describe, it, expect } from "vitest";
import { formatCurrency } from "../currency";

describe("formatCurrency", () => {
  describe("Portuguese (pt) formatting", () => {
    it("should format positive numbers", () => {
      const result = formatCurrency(1000, "pt");
      expect(result).toContain("1.000");
      expect(result).toContain("R$");
    });

    it("should format zero", () => {
      const result = formatCurrency(0, "pt");
      expect(result).toContain("0");
      expect(result).toContain("R$");
    });

    it("should format negative numbers", () => {
      const result = formatCurrency(-1000, "pt");
      expect(result).toContain("-");
      expect(result).toContain("R$");
    });

    it("should format decimal numbers", () => {
      const result = formatCurrency(1234.56, "pt");
      expect(result).toContain("1.234");
      expect(result).toContain("56");
    });

    it("should format large numbers", () => {
      const result = formatCurrency(1000000, "pt");
      expect(result).toContain("1.000.000");
    });
  });

  describe("English (en) formatting", () => {
    it("should format positive numbers", () => {
      const result = formatCurrency(1000, "en");
      expect(result).toContain("1,000");
      expect(result).toContain("R$");
    });

    it("should format zero", () => {
      const result = formatCurrency(0, "en");
      expect(result).toContain("0");
      expect(result).toContain("R$");
    });

    it("should format negative numbers", () => {
      const result = formatCurrency(-1000, "en");
      expect(result).toContain("-");
      expect(result).toContain("R$");
    });

    it("should format decimal numbers", () => {
      const result = formatCurrency(1234.56, "en");
      expect(result).toContain("1,234");
      expect(result).toContain("56");
    });
  });

  describe("Spanish (es) formatting", () => {
    it("should format positive numbers", () => {
      const result = formatCurrency(1000, "es");
      // Spanish locale uses comma as decimal separator
      expect(result).toContain("1000");
      expect(result).toContain("BRL");
    });

    it("should format zero", () => {
      const result = formatCurrency(0, "es");
      expect(result).toContain("0");
      expect(result).toContain("BRL");
    });

    it("should format negative numbers", () => {
      const result = formatCurrency(-1000, "es");
      expect(result).toContain("-");
      expect(result).toContain("BRL");
    });
  });

  describe("default language", () => {
    it("should default to Portuguese when no language is provided", () => {
      const result1 = formatCurrency(1000);
      const result2 = formatCurrency(1000, "pt");
      expect(result1).toBe(result2);
    });
  });

  describe("edge cases", () => {
    it("should handle very small numbers", () => {
      const result = formatCurrency(0.01);
      expect(result).toBeTruthy();
      expect(result).toContain("R$");
    });

    it("should handle very large numbers", () => {
      const result = formatCurrency(999999999.99);
      expect(result).toBeTruthy();
      expect(result).toContain("R$");
    });

    it("should always include currency symbol", () => {
      expect(formatCurrency(100, "pt")).toContain("R$");
      expect(formatCurrency(100, "en")).toContain("R$");
      expect(formatCurrency(100, "es")).toContain("BRL");
    });
  });
});
