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
    it("should mask CNPJ correctly for different lengths", () => {
      expect(maskCNPJ("12")).toBe("12");
      expect(maskCNPJ("12345")).toBe("12.345");
      expect(maskCNPJ("12345678")).toBe("12.345.678");
      expect(maskCNPJ("123456789012")).toBe("12.345.678/9012");
      expect(maskCNPJ("12345678901234")).toBe("12.345.678/9012-34");
    });

    it("should handle CNPJ with special characters", () => {
      expect(maskCNPJ("12.345.678/9012-34")).toBe("12.345.678/9012-34");
      expect(maskCNPJ("12345678901234abc")).toBe("12.345.678/9012-34");
    });

    it("should handle empty string", () => {
      expect(maskCNPJ("")).toBe("");
    });
  });

  describe("unmaskCNPJ", () => {
    it("should remove all non-digit characters", () => {
      expect(unmaskCNPJ("12.345.678/9012-34")).toBe("12345678901234");
      expect(unmaskCNPJ("12345678901234")).toBe("12345678901234");
      expect(unmaskCNPJ("abc123")).toBe("123");
    });
  });

  describe("maskPhone", () => {
    it("should mask phone correctly for different lengths", () => {
      expect(maskPhone("")).toBe("");
      expect(maskPhone("12")).toBe("(12");
      expect(maskPhone("123456")).toBe("(12) 3456");
      expect(maskPhone("1234567890")).toBe("(12) 3456-7890");
      expect(maskPhone("12345678901")).toBe("(12) 34567-8901");
    });

    it("should handle phone with special characters", () => {
      expect(maskPhone("(12) 3456-7890")).toBe("(12) 3456-7890");
      expect(maskPhone("1234567890abc")).toBe("(12) 3456-7890");
    });
  });

  describe("unmaskPhone", () => {
    it("should remove all non-digit characters", () => {
      expect(unmaskPhone("(12) 3456-7890")).toBe("1234567890");
      expect(unmaskPhone("1234567890")).toBe("1234567890");
      expect(unmaskPhone("abc123")).toBe("123");
    });
  });

  describe("maskCEP", () => {
    it("should mask CEP correctly for different lengths", () => {
      expect(maskCEP("")).toBe("");
      expect(maskCEP("12")).toBe("12");
      expect(maskCEP("12345")).toBe("12.345");
      expect(maskCEP("12345678")).toBe("12.345-678");
    });

    it("should handle CEP with special characters", () => {
      expect(maskCEP("12.345-678")).toBe("12.345-678");
      expect(maskCEP("12345678abc")).toBe("12.345-678");
    });
  });

  describe("unmaskCEP", () => {
    it("should remove all non-digit characters", () => {
      expect(unmaskCEP("12.345-678")).toBe("12345678");
      expect(unmaskCEP("12345678")).toBe("12345678");
      expect(unmaskCEP("abc123")).toBe("123");
    });
  });

  describe("maskCPF", () => {
    it("should mask CPF correctly for different lengths", () => {
      expect(maskCPF("")).toBe("");
      expect(maskCPF("123")).toBe("123");
      expect(maskCPF("123456")).toBe("123.456");
      expect(maskCPF("123456789")).toBe("123.456.789");
      expect(maskCPF("12345678901")).toBe("123.456.789-01");
    });

    it("should handle CPF with special characters", () => {
      expect(maskCPF("123.456.789-01")).toBe("123.456.789-01");
      expect(maskCPF("12345678901abc")).toBe("123.456.789-01");
    });
  });

  describe("unmaskCPF", () => {
    it("should remove all non-digit characters", () => {
      expect(unmaskCPF("123.456.789-01")).toBe("12345678901");
      expect(unmaskCPF("12345678901")).toBe("12345678901");
      expect(unmaskCPF("abc123")).toBe("123");
    });
  });

  describe("createMaskHandler", () => {
    it("should create a handler that applies mask and calls onChange", () => {
      const onChange = vi.fn();
      const handler = createMaskHandler(maskCNPJ, onChange);
      const event = {
        target: { value: "12345678901234" },
      } as React.ChangeEvent<HTMLInputElement>;

      handler(event);

      expect(onChange).toHaveBeenCalledWith("12.345.678/9012-34");
    });
  });

  describe("maskDate", () => {
    it("should mask date correctly for different lengths", () => {
      expect(maskDate("")).toBe("");
      expect(maskDate("12")).toBe("12");
      expect(maskDate("1234")).toBe("12/34");
      expect(maskDate("12345678")).toBe("12/34/5678");
    });

    it("should handle date with special characters", () => {
      expect(maskDate("12/34/5678")).toBe("12/34/5678");
      expect(maskDate("12345678abc")).toBe("12/34/5678");
    });
  });

  describe("unmaskDate", () => {
    it("should remove all non-digit characters", () => {
      expect(unmaskDate("12/34/5678")).toBe("12345678");
      expect(unmaskDate("12345678")).toBe("12345678");
      expect(unmaskDate("abc123")).toBe("123");
    });
  });

  describe("dateToISO", () => {
    it("should convert date string to ISO format", () => {
      expect(dateToISO("01/01/2024")).toBe("2024-01-01");
      expect(dateToISO("31/12/2023")).toBe("2023-12-31");
      expect(dateToISO("15/06/2024")).toBe("2024-06-15");
    });

    it("should return empty string for invalid dates", () => {
      expect(dateToISO("32/01/2024")).toBe("");
      expect(dateToISO("01/13/2024")).toBe("");
      expect(dateToISO("123")).toBe("");
      expect(dateToISO("12345")).toBe("");
    });
  });

  describe("isoToDate", () => {
    it("should convert ISO string to date format", () => {
      expect(isoToDate("2024-01-01")).toBe("01/01/2024");
      expect(isoToDate("2023-12-31")).toBe("31/12/2023");
    });

    it("should return empty string for invalid ISO strings", () => {
      expect(isoToDate("")).toBe("");
      expect(isoToDate("2024-01")).toBe("");
      expect(isoToDate("20240101")).toBe("");
      expect(isoToDate("invalid")).toBe("");
      expect(isoToDate("2024-01-01-01")).toBe("");
    });
  });
});
