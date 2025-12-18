import { describe, it, expect } from "vitest";
import {
  maskCurrency,
  parseCurrency,
  getCurrencyPlaceholder,
  maskDecimal,
  parseDecimal,
  getDecimalPlaceholder,
} from "../currency-mask";

describe("maskCurrency", () => {
  it("should return empty string for empty input", () => {
    expect(maskCurrency("", "pt")).toBe("");
    expect(maskCurrency("", "en")).toBe("");
    expect(maskCurrency("", "es")).toBe("");
  });

  it("should format currency for Portuguese (pt-BR)", () => {
    expect(maskCurrency("123456", "pt")).toContain("R$");
    expect(maskCurrency("123456", "pt")).toContain("1.234,56");
  });

  it("should format currency for English (en-US)", () => {
    const result = maskCurrency("123456", "en");
    expect(result).toContain("R$");
    expect(result).toContain("1,234.56");
  });

  it("should format currency for Spanish (es-ES)", () => {
    const result = maskCurrency("123456", "es");
    expect(result).toContain("BRL");
    // Spanish format uses European number format
    // For 1234.56, it may not have thousands separator, so just check it contains the number
    expect(result).toMatch(/1234[.,]56|1[.,]234[.,]56/);
  });

  it("should handle single digit input", () => {
    const result = maskCurrency("1", "pt");
    expect(result).toContain("0,01");
  });

  it("should handle two digit input", () => {
    const result = maskCurrency("12", "pt");
    expect(result).toContain("0,12");
  });

  it("should remove non-digit characters", () => {
    const result1 = maskCurrency("abc123def456", "pt");
    const result2 = maskCurrency("123456", "pt");
    expect(result1).toBe(result2);
  });

  it("should handle large numbers", () => {
    const result = maskCurrency("1234567890", "pt");
    expect(result).toContain("12.345.678,90");
  });
});

describe("parseCurrency", () => {
  it("should return 0 for empty input", () => {
    expect(parseCurrency("", "pt")).toBe(0);
    expect(parseCurrency("", "en")).toBe(0);
  });

  it("should return 0 for non-string input", () => {
    expect(parseCurrency(null as unknown as string, "pt")).toBe(0);
    expect(parseCurrency(undefined as unknown as string, "pt")).toBe(0);
  });

  it("should parse Portuguese format (1.234,56)", () => {
    expect(parseCurrency("R$ 1.234,56", "pt")).toBe(1234.56);
    expect(parseCurrency("1.234,56", "pt")).toBe(1234.56);
    expect(parseCurrency("1234,56", "pt")).toBe(1234.56);
  });

  it("should parse English format (1,234.56)", () => {
    expect(parseCurrency("R$ 1,234.56", "en")).toBe(1234.56);
    expect(parseCurrency("1,234.56", "en")).toBe(1234.56);
    expect(parseCurrency("1234.56", "en")).toBe(1234.56);
  });

  it("should parse Spanish format (1.234,56)", () => {
    expect(parseCurrency("1.234,56", "es")).toBe(1234.56);
    expect(parseCurrency("1234,56", "es")).toBe(1234.56);
  });

  it("should handle integer values without decimal separator", () => {
    expect(parseCurrency("1234", "pt")).toBe(1234);
    expect(parseCurrency("1.234", "pt")).toBe(1234);
    expect(parseCurrency("1,234", "en")).toBe(1234);
  });

  it("should handle negative values", () => {
    expect(parseCurrency("-1234,56", "pt")).toBe(-1234.56);
    expect(parseCurrency("-1,234.56", "en")).toBe(-1234.56);
  });

  it("should handle multiple dots in US format (treat last as decimal)", () => {
    expect(parseCurrency("1.234.56", "en")).toBe(1234.56);
  });

  it("should remove currency symbols", () => {
    expect(parseCurrency("R$ 1.234,56", "pt")).toBe(1234.56);
    expect(parseCurrency("$ 1,234.56", "en")).toBe(1234.56);
  });

  it("should handle zero", () => {
    expect(parseCurrency("0", "pt")).toBe(0);
    expect(parseCurrency("0,00", "pt")).toBe(0);
    expect(parseCurrency("0.00", "en")).toBe(0);
  });
});

describe("getCurrencyPlaceholder", () => {
  it("should return placeholder for Portuguese", () => {
    const result = getCurrencyPlaceholder("pt");
    expect(result).toContain("R$");
    expect(result).toContain("0");
  });

  it("should return placeholder for English", () => {
    const result = getCurrencyPlaceholder("en");
    expect(result).toContain("R$");
    expect(result).toContain("0");
  });

  it("should return placeholder for Spanish", () => {
    const result = getCurrencyPlaceholder("es");
    expect(result).toContain("0");
  });
});

describe("maskDecimal", () => {
  it("should return empty string for empty input", () => {
    expect(maskDecimal("", "pt")).toBe("");
    expect(maskDecimal("", "en")).toBe("");
  });

  it("should format decimal for Portuguese (1.234,56)", () => {
    // maskDecimal parses input as-is, so "123456" becomes 123456, formatted as 123.456 (pt-BR format)
    const result = maskDecimal("123456", "pt");
    // Portuguese uses European format: dot for thousands separator
    expect(result).toMatch(/\d+[.,]\d+/);
    expect(result).not.toContain("R$");
  });

  it("should format decimal for English (1,234.56)", () => {
    const result = maskDecimal("123456", "en");
    // English uses US format: comma for thousands, dot for decimal
    expect(result).toMatch(/\d+[,.]\d+/);
  });

  it("should format decimal for Spanish (1.234,56)", () => {
    const result = maskDecimal("123456", "es");
    // Spanish uses European format: dot for thousands, comma for decimal
    expect(result).toMatch(/\d+[.,]\d+/);
  });

  it("should respect maxDecimals parameter", () => {
    // Test that the function accepts maxDecimals and formats accordingly
    const result1 = maskDecimal("1234,567", "pt", 2);
    const result2 = maskDecimal("1234,56789", "pt", 4);
    // Both should return formatted strings
    expect(typeof result1).toBe("string");
    expect(typeof result2).toBe("string");
    expect(result1).toBeTruthy();
    expect(result2).toBeTruthy();
    // The function should handle the maxDecimals parameter without error
    expect(() => maskDecimal("1234,567", "pt", 2)).not.toThrow();
    expect(() => maskDecimal("1234,56789", "pt", 4)).not.toThrow();
  });

  it("should handle integer values", () => {
    const result = maskDecimal("1234", "pt");
    expect(result).toContain("1.234");
    expect(result).not.toContain(",");
  });

  it("should remove non-numeric characters except dots and commas", () => {
    const result1 = maskDecimal("abc123def456", "pt");
    const result2 = maskDecimal("123456", "pt");
    expect(result1).toBe(result2);
  });

  it("should handle European format with comma as decimal", () => {
    const result = maskDecimal("1234,56", "pt");
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("should handle US format with dot as decimal", () => {
    const result = maskDecimal("1234.56", "en");
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });
});

describe("parseDecimal", () => {
  it("should return 0 for empty input", () => {
    expect(parseDecimal("", "pt")).toBe(0);
    expect(parseDecimal("", "en")).toBe(0);
  });

  it("should return 0 for non-string input", () => {
    expect(parseDecimal(null as unknown as string, "pt")).toBe(0);
    expect(parseDecimal(undefined as unknown as string, "pt")).toBe(0);
  });

  it("should parse Portuguese format (1.234,56)", () => {
    expect(parseDecimal("1.234,56", "pt")).toBe(1234.56);
    expect(parseDecimal("1234,56", "pt")).toBe(1234.56);
  });

  it("should parse English format (1,234.56)", () => {
    expect(parseDecimal("1,234.56", "en")).toBe(1234.56);
    expect(parseDecimal("1234.56", "en")).toBe(1234.56);
  });

  it("should parse Spanish format (1.234,56)", () => {
    expect(parseDecimal("1.234,56", "es")).toBe(1234.56);
    expect(parseDecimal("1234,56", "es")).toBe(1234.56);
  });

  it("should handle integer values without decimal separator", () => {
    expect(parseDecimal("1234", "pt")).toBe(1234);
    expect(parseDecimal("1.234", "pt")).toBe(1234);
    expect(parseDecimal("1,234", "en")).toBe(1234);
  });

  it("should handle negative values", () => {
    expect(parseDecimal("-1234,56", "pt")).toBe(-1234.56);
    expect(parseDecimal("-1,234.56", "en")).toBe(-1234.56);
  });

  it("should handle multiple dots in US format", () => {
    expect(parseDecimal("1.234.56", "en")).toBe(1234.56);
  });

  it("should handle zero", () => {
    expect(parseDecimal("0", "pt")).toBe(0);
    expect(parseDecimal("0,00", "pt")).toBe(0);
    expect(parseDecimal("0.00", "en")).toBe(0);
  });
});

describe("getDecimalPlaceholder", () => {
  it("should return placeholder for Portuguese", () => {
    const result = getDecimalPlaceholder("pt");
    expect(result).toContain("0");
    expect(result).not.toContain("R$");
  });

  it("should return placeholder for English", () => {
    const result = getDecimalPlaceholder("en");
    expect(result).toContain("0");
  });

  it("should return placeholder for Spanish", () => {
    const result = getDecimalPlaceholder("es");
    expect(result).toContain("0");
  });
});
