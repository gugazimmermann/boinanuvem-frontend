import { describe, it, expect } from "vitest";
import { getLocaleForDateTime, createCurrencyFormatter } from "../locale-helpers";

describe("locale-helpers", () => {
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
  });

  describe("createCurrencyFormatter", () => {
    it("should create formatter that formats currency", () => {
      const formatter = createCurrencyFormatter("pt-BR");
      const result = formatter(1234.56);
      expect(result).toContain("R$");
      expect(result).toContain("1.234,56");
    });

    it("should format currency for different locales", () => {
      const formatterPt = createCurrencyFormatter("pt-BR");
      const formatterEn = createCurrencyFormatter("en-US");

      const resultPt = formatterPt(1234.56);
      const resultEn = formatterEn(1234.56);

      expect(resultPt).toContain("R$");
      expect(resultEn).toContain("R$");
    });

    it("should handle zero", () => {
      const formatter = createCurrencyFormatter("pt-BR");
      const result = formatter(0);
      expect(result).toContain("0");
    });

    it("should handle negative values", () => {
      const formatter = createCurrencyFormatter("pt-BR");
      const result = formatter(-1234.56);
      expect(result).toContain("-");
    });
  });
});
