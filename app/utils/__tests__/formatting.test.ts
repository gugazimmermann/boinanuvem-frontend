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
import type { Language } from "~/types";

describe("formatAreaType", () => {
  it("should format all AreaType values correctly", () => {
    expect(formatAreaType(AreaType.HECTARES)).toBe("ha");
    expect(formatAreaType(AreaType.SQUARE_METERS)).toBe("m²");
    expect(formatAreaType(AreaType.SQUARE_FEET)).toBe("ft²");
    expect(formatAreaType(AreaType.ACRES)).toBe("ac");
    expect(formatAreaType(AreaType.SQUARE_KILOMETERS)).toBe("km²");
    expect(formatAreaType(AreaType.SQUARE_MILES)).toBe("mi²");
  });

  it("should return the type string for unknown types", () => {
    const unknownType = "unknown" as AreaType;
    expect(formatAreaType(unknownType)).toBe("unknown");
  });
});

describe("getLocaleForDateTime", () => {
  it("should return correct locale for Portuguese", () => {
    expect(getLocaleForDateTime("pt")).toBe("pt-BR");
  });

  it("should return correct locale for English", () => {
    expect(getLocaleForDateTime("en")).toBe("en-US");
  });

  it("should return correct locale for Spanish", () => {
    expect(getLocaleForDateTime("es")).toBe("es-ES");
  });

  it("should default to pt-BR for unknown language", () => {
    expect(getLocaleForDateTime("unknown" as Language)).toBe("pt-BR");
  });
});

describe("getLocaleForNumber", () => {
  it("should return correct locale for Portuguese", () => {
    expect(getLocaleForNumber("pt")).toBe("pt-BR");
  });

  it("should return correct locale for English", () => {
    expect(getLocaleForNumber("en")).toBe("en-US");
  });

  it("should return correct locale for Spanish", () => {
    expect(getLocaleForNumber("es")).toBe("es-ES");
  });

  it("should default to pt-BR for unknown language", () => {
    expect(getLocaleForNumber("unknown" as Language)).toBe("pt-BR");
  });
});

describe("getLocaleForCurrency", () => {
  it("should return correct locale for Portuguese", () => {
    expect(getLocaleForCurrency("pt")).toBe("pt-BR");
  });

  it("should return correct locale for English", () => {
    expect(getLocaleForCurrency("en")).toBe("en-US");
  });

  it("should return correct locale for Spanish", () => {
    expect(getLocaleForCurrency("es")).toBe("es-ES");
  });

  it("should default to pt-BR for unknown language", () => {
    expect(getLocaleForCurrency("unknown" as Language)).toBe("pt-BR");
  });
});

describe("formatDate", () => {
  const testDate = new Date("2024-01-15T10:30:00Z");

  it("should format date with default format for Portuguese", () => {
    const result = formatDate(testDate, "pt");
    expect(result).toContain("15");
    expect(result).toContain("01");
    expect(result).toContain("2024");
  });

  it("should format date with default format for English", () => {
    const result = formatDate(testDate, "en");
    expect(result).toContain("01");
    expect(result).toContain("15");
    expect(result).toContain("2024");
  });

  it("should format date with custom format string", () => {
    const result = formatDate(testDate, "pt", "yyyy-MM-dd");
    expect(result).toBe("2024-01-15");
  });

  it("should handle string dates", () => {
    const result = formatDate("2024-01-15T10:30:00Z", "pt");
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("should default to Portuguese when no language provided", () => {
    const result1 = formatDate(testDate);
    const result2 = formatDate(testDate, "pt");
    expect(result1).toBe(result2);
  });
});

describe("formatDateTime", () => {
  const testDate = new Date("2024-01-15T10:30:00Z");

  it("should format date and time for Portuguese", () => {
    const result = formatDateTime(testDate, "pt");
    expect(result).toContain("15");
    expect(result).toContain("01");
    expect(result).toContain("2024");
    // Time may vary due to timezone, just check format exists
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it("should format date and time for English", () => {
    const result = formatDateTime(testDate, "en");
    expect(result).toContain("01");
    expect(result).toContain("15");
    expect(result).toContain("2024");
    // Time may vary due to timezone, just check format exists
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it("should handle string dates", () => {
    const result = formatDateTime("2024-01-15T10:30:00Z", "pt");
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("should default to Portuguese when no language provided", () => {
    const result1 = formatDateTime(testDate);
    const result2 = formatDateTime(testDate, "pt");
    expect(result1).toBe(result2);
  });
});

describe("formatCurrency", () => {
  it("should format currency for Portuguese", () => {
    const result = formatCurrency(1000, "pt");
    expect(result).toContain("R$");
    expect(result).toContain("1.000");
  });

  it("should format currency for English", () => {
    const result = formatCurrency(1000, "en");
    expect(result).toContain("R$");
    expect(result).toContain("1,000");
  });

  it("should format currency for Spanish", () => {
    const result = formatCurrency(1000, "es");
    expect(result).toContain("BRL");
  });

  it("should handle zero", () => {
    const result = formatCurrency(0, "pt");
    expect(result).toContain("R$");
    expect(result).toContain("0");
  });

  it("should handle negative numbers", () => {
    const result = formatCurrency(-1000, "pt");
    expect(result).toContain("-");
    expect(result).toContain("R$");
  });

  it("should default to Portuguese when no language provided", () => {
    const result1 = formatCurrency(1000);
    const result2 = formatCurrency(1000, "pt");
    expect(result1).toBe(result2);
  });
});

describe("formatNumber", () => {
  it("should format number for Portuguese", () => {
    const result = formatNumber(1234.56, "pt");
    expect(result).toContain("1.234");
    expect(result).toContain("56");
  });

  it("should format number for English", () => {
    const result = formatNumber(1234.56, "en");
    expect(result).toContain("1,234");
    expect(result).toContain("56");
  });

  it("should format number with minimum fraction digits", () => {
    const result = formatNumber(100, "pt", { minimumFractionDigits: 2 });
    expect(result).toContain("100");
    expect(result).toContain("00");
  });

  it("should format number with maximum fraction digits", () => {
    const result = formatNumber(1234.56789, "pt", { maximumFractionDigits: 2 });
    expect(result).toContain("1.234");
    expect(result).not.toContain("56789");
  });

  it("should format number with both options", () => {
    const result = formatNumber(100, "pt", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("should default to Portuguese when no language provided", () => {
    const result1 = formatNumber(1000);
    const result2 = formatNumber(1000, "pt");
    expect(result1).toBe(result2);
  });

  it("should handle zero", () => {
    const result = formatNumber(0, "pt");
    expect(result).toContain("0");
  });

  it("should handle large numbers", () => {
    const result = formatNumber(1000000, "pt");
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });
});
