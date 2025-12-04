import { describe, it, expect, vi } from "vitest";
import {
  maskCNPJ,
  unmaskCNPJ,
  maskPhone,
  unmaskPhone,
  maskCEP,
  unmaskCEP,
  maskCPF,
  unmaskCPF,
  createMaskHandler,
  maskDate,
  unmaskDate,
  dateToISO,
  isoToDate,
} from "../masks";

describe("masks", () => {
  describe("maskCNPJ", () => {
    it("should mask CNPJ correctly", () => {
      expect(maskCNPJ("12345678000190")).toBe("12.345.678/0001-90");
    });

    it("should handle partial CNPJ", () => {
      expect(maskCNPJ("12")).toBe("12");
      expect(maskCNPJ("123")).toBe("12.3");
      expect(maskCNPJ("12345")).toBe("12.345");
      expect(maskCNPJ("12345678")).toBe("12.345.678");
      expect(maskCNPJ("123456780001")).toBe("12.345.678/0001");
    });

    it("should remove non-digits before masking", () => {
      expect(maskCNPJ("12.345.678/0001-90")).toBe("12.345.678/0001-90");
      expect(maskCNPJ("abc12345678000190def")).toBe("12.345.678/0001-90");
    });

    it("should handle empty string", () => {
      expect(maskCNPJ("")).toBe("");
    });

    it("should handle string with only non-digits", () => {
      expect(maskCNPJ("abc")).toBe("");
    });
  });

  describe("unmaskCNPJ", () => {
    it("should remove all non-digits", () => {
      expect(unmaskCNPJ("12.345.678/0001-90")).toBe("12345678000190");
    });

    it("should handle already unmasked CNPJ", () => {
      expect(unmaskCNPJ("12345678000190")).toBe("12345678000190");
    });

    it("should handle empty string", () => {
      expect(unmaskCNPJ("")).toBe("");
    });
  });

  describe("maskPhone", () => {
    it("should mask phone correctly for 10 digits", () => {
      expect(maskPhone("1199999999")).toBe("(11) 9999-9999");
    });

    it("should mask phone correctly for 11 digits", () => {
      expect(maskPhone("11999999999")).toBe("(11) 99999-9999");
    });

    it("should handle partial phone", () => {
      expect(maskPhone("1")).toBe("(1");
      expect(maskPhone("11")).toBe("(11");
      expect(maskPhone("119")).toBe("(11) 9");
      expect(maskPhone("11999")).toBe("(11) 999");
      expect(maskPhone("1199999")).toBe("(11) 9999-9");
    });

    it("should remove non-digits before masking", () => {
      expect(maskPhone("(11) 99999-9999")).toBe("(11) 99999-9999");
      expect(maskPhone("abc11999999999def")).toBe("(11) 99999-9999");
    });

    it("should handle empty string", () => {
      expect(maskPhone("")).toBe("");
    });
  });

  describe("unmaskPhone", () => {
    it("should remove all non-digits", () => {
      expect(unmaskPhone("(11) 99999-9999")).toBe("11999999999");
    });

    it("should handle already unmasked phone", () => {
      expect(unmaskPhone("11999999999")).toBe("11999999999");
    });

    it("should handle empty string", () => {
      expect(unmaskPhone("")).toBe("");
    });
  });

  describe("maskCEP", () => {
    it("should mask CEP correctly", () => {
      expect(maskCEP("12345678")).toBe("12.345-678");
    });

    it("should handle partial CEP", () => {
      expect(maskCEP("12")).toBe("12");
      expect(maskCEP("123")).toBe("12.3");
      expect(maskCEP("12345")).toBe("12.345");
      expect(maskCEP("123456")).toBe("12.345-6");
    });

    it("should remove non-digits before masking", () => {
      expect(maskCEP("12.345-678")).toBe("12.345-678");
      expect(maskCEP("abc12345678def")).toBe("12.345-678");
    });

    it("should handle empty string", () => {
      expect(maskCEP("")).toBe("");
    });
  });

  describe("unmaskCEP", () => {
    it("should remove all non-digits", () => {
      expect(unmaskCEP("12.345-678")).toBe("12345678");
    });

    it("should handle already unmasked CEP", () => {
      expect(unmaskCEP("12345678")).toBe("12345678");
    });

    it("should handle empty string", () => {
      expect(unmaskCEP("")).toBe("");
    });
  });

  describe("maskCPF", () => {
    it("should mask CPF correctly", () => {
      expect(maskCPF("12345678901")).toBe("123.456.789-01");
    });

    it("should handle partial CPF", () => {
      expect(maskCPF("123")).toBe("123");
      expect(maskCPF("123456")).toBe("123.456");
      expect(maskCPF("123456789")).toBe("123.456.789");
    });

    it("should remove non-digits before masking", () => {
      expect(maskCPF("123.456.789-01")).toBe("123.456.789-01");
      expect(maskCPF("abc12345678901def")).toBe("123.456.789-01");
    });

    it("should handle empty string", () => {
      expect(maskCPF("")).toBe("");
    });
  });

  describe("unmaskCPF", () => {
    it("should remove all non-digits", () => {
      expect(unmaskCPF("123.456.789-01")).toBe("12345678901");
    });

    it("should handle already unmasked CPF", () => {
      expect(unmaskCPF("12345678901")).toBe("12345678901");
    });

    it("should handle empty string", () => {
      expect(unmaskCPF("")).toBe("");
    });
  });

  describe("createMaskHandler", () => {
    it("should create handler that applies mask and calls onChange", () => {
      const onChange = vi.fn();
      const maskFunction = (value: string) => value.toUpperCase();
      const handler = createMaskHandler(maskFunction, onChange);

      const event = {
        target: { value: "test" },
      } as React.ChangeEvent<HTMLInputElement>;

      handler(event);

      expect(onChange).toHaveBeenCalledWith("TEST");
    });

    it("should handle empty value", () => {
      const onChange = vi.fn();
      const maskFunction = (value: string) => value;
      const handler = createMaskHandler(maskFunction, onChange);

      const event = {
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>;

      handler(event);

      expect(onChange).toHaveBeenCalledWith("");
    });
  });

  describe("maskDate", () => {
    it("should mask date correctly", () => {
      expect(maskDate("01012024")).toBe("01/01/2024");
    });

    it("should handle partial date", () => {
      expect(maskDate("01")).toBe("01");
      expect(maskDate("0101")).toBe("01/01");
      expect(maskDate("01012")).toBe("01/01/2");
    });

    it("should remove non-digits before masking", () => {
      expect(maskDate("01/01/2024")).toBe("01/01/2024");
      expect(maskDate("abc01012024def")).toBe("01/01/2024");
    });

    it("should handle empty string", () => {
      expect(maskDate("")).toBe("");
    });
  });

  describe("unmaskDate", () => {
    it("should remove all non-digits", () => {
      expect(unmaskDate("01/01/2024")).toBe("01012024");
    });

    it("should handle already unmasked date", () => {
      expect(unmaskDate("01012024")).toBe("01012024");
    });

    it("should handle empty string", () => {
      expect(unmaskDate("")).toBe("");
    });
  });

  describe("dateToISO", () => {
    it("should convert date to ISO format", () => {
      expect(dateToISO("01/01/2024")).toBe("2024-01-01");
    });

    it("should return empty string for invalid length", () => {
      expect(dateToISO("0101202")).toBe("");
      expect(dateToISO("010120245")).toBe("");
    });

    it("should return empty string for invalid day", () => {
      expect(dateToISO("32/01/2024")).toBe("");
    });

    it("should return empty string for invalid month", () => {
      expect(dateToISO("01/13/2024")).toBe("");
    });

    it("should handle empty string", () => {
      expect(dateToISO("")).toBe("");
    });

    it("should remove non-digits before conversion", () => {
      expect(dateToISO("01/01/2024")).toBe("2024-01-01");
    });
  });

  describe("isoToDate", () => {
    it("should convert ISO date to date format", () => {
      expect(isoToDate("2024-01-01")).toBe("01/01/2024");
    });

    it("should return empty string for invalid format", () => {
      expect(isoToDate("")).toBe("");
      expect(isoToDate("2024")).toBe("");
      expect(isoToDate("2024-01")).toBe("");
      expect(isoToDate("2024-01-01-01")).toBe("");
    });

    it("should return empty string for non-string input", () => {
      expect(isoToDate(null as unknown as string)).toBe("");
      expect(isoToDate(undefined as unknown as string)).toBe("");
    });

    it("should return empty string when string length is not 10", () => {
      // isoToDate returns empty string if length is not 10
      expect(isoToDate("20240101")).toBe("");
    });

    it("should handle missing parts", () => {
      expect(isoToDate("2024--01")).toBe("");
      expect(isoToDate("-01-01")).toBe("");
    });

    it("should handle valid ISO date", () => {
      expect(isoToDate("2024-12-31")).toBe("31/12/2024");
      expect(isoToDate("2024-01-15")).toBe("15/01/2024");
    });
  });
});
