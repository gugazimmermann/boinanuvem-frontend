import { describe, it, expect } from "vitest";
import { getLocaleForDateTime, createCurrencyFormatter } from "../locale-helpers";

describe("getLocaleForDateTime", () => {
  it("should return locale for Portuguese", () => {
    expect(getLocaleForDateTime("pt")).toBe("pt-BR");
  });

  it("should return locale for English", () => {
    expect(getLocaleForDateTime("en")).toBe("en-US");
  });

  it("should return locale for Spanish", () => {
    expect(getLocaleForDateTime("es")).toBe("es-ES");
  });

  it("should handle unknown language", () => {
    const result = getLocaleForDateTime("unknown");
    expect(result).toBeDefined();
  });
});

describe("createCurrencyFormatter", () => {
  it("should create a currency formatter function", () => {
    const formatter = createCurrencyFormatter("pt-BR");
    expect(typeof formatter).toBe("function");
  });

  it("should format currency correctly", () => {
    const formatter = createCurrencyFormatter("pt-BR");
    const result = formatter(1000);
    expect(result).toContain("R$");
    expect(result).toContain("1.000");
  });

  it("should handle different locales", () => {
    const formatterPT = createCurrencyFormatter("pt-BR");
    const formatterEN = createCurrencyFormatter("en-US");

    const resultPT = formatterPT(1000);
    const resultEN = formatterEN(1000);

    expect(resultPT).toBeDefined();
    expect(resultEN).toBeDefined();
    expect(resultPT).toContain("R$");
    expect(resultEN).toContain("R$");
  });

  it("should handle zero", () => {
    const formatter = createCurrencyFormatter("pt-BR");
    const result = formatter(0);
    expect(result).toContain("R$");
    expect(result).toContain("0");
  });

  it("should handle negative values", () => {
    const formatter = createCurrencyFormatter("pt-BR");
    const result = formatter(-1000);
    expect(result).toContain("-");
  });
});
