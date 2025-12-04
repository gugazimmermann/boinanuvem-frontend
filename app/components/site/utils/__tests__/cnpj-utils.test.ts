import { describe, it, expect, vi, beforeEach } from "vitest";
import { formatCNPJ, formatPhone, mapCNPJDataToCompanyForm } from "../cnpj-utils";
import { maskPhone, maskCEP, maskCNPJ } from "../masks";
import type { CNPJData, CompanyFormData } from "~/types";

vi.mock("../masks", () => ({
  maskPhone: vi.fn(),
  maskCEP: vi.fn(),
  maskCNPJ: vi.fn(),
}));

describe("cnpj-utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(maskPhone).mockImplementation((value: string) => {
      const numbers = value.replaceAll(/\D/g, "");
      if (numbers.length === 0) return "";
      if (numbers.length <= 2) return `(${numbers}`;
      if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      if (numbers.length <= 10) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
      }
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    });

    vi.mocked(maskCEP).mockImplementation((value: string) => {
      const numbers = value.replaceAll(/\D/g, "");
      if (numbers.length === 0) return "";
      if (numbers.length <= 2) return numbers;
      if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}-${numbers.slice(5, 8)}`;
    });

    vi.mocked(maskCNPJ).mockImplementation((value: string) => {
      const numbers = value.replaceAll(/\D/g, "");
      if (numbers.length <= 2) return numbers;
      if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
      if (numbers.length <= 8)
        return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
      if (numbers.length <= 12)
        return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
    });
  });

  describe("formatCNPJ", () => {
    it("should remove all non-digit characters", () => {
      expect(formatCNPJ("12.345.678/0001-90")).toBe("12345678000190");
    });

    it("should handle already formatted CNPJ", () => {
      expect(formatCNPJ("12345678000190")).toBe("12345678000190");
    });

    it("should handle empty string", () => {
      expect(formatCNPJ("")).toBe("");
    });

    it("should handle string with only non-digits", () => {
      expect(formatCNPJ("abc")).toBe("");
    });
  });

  describe("formatPhone", () => {
    it("should format phone using maskPhone", () => {
      vi.mocked(maskPhone).mockReturnValue("(11) 99999-9999");
      expect(formatPhone("11999999999")).toBe("(11) 99999-9999");
      expect(maskPhone).toHaveBeenCalledWith("11999999999");
    });

    it("should return empty string for empty input", () => {
      vi.mocked(maskPhone).mockReturnValue("");
      expect(formatPhone("")).toBe("");
    });

    it("should handle already formatted phone", () => {
      vi.mocked(maskPhone).mockReturnValue("(11) 99999-9999");
      expect(formatPhone("(11) 99999-9999")).toBe("(11) 99999-9999");
    });
  });

  describe("mapCNPJDataToCompanyForm", () => {
    const mockCNPJData: CNPJData = {
      cnpj: "12345678000190",
      razao_social: "Test Company LTDA",
      email: "test@example.com",
      ddd_telefone_1: "11999999999",
      logradouro: "Rua Test",
      numero: "123",
      complemento: "Apto 45",
      bairro: "Centro",
      municipio: "São Paulo",
      uf: "SP",
      cep: "12345678",
    };

    it("should map CNPJ data to company form", () => {
      vi.mocked(maskCNPJ).mockReturnValue("12.345.678/0001-90");
      vi.mocked(maskPhone).mockReturnValue("(11) 99999-9999");
      vi.mocked(maskCEP).mockReturnValue("12.345-678");

      const result = mapCNPJDataToCompanyForm(mockCNPJData);

      expect(result.cnpj).toBe("12.345.678/0001-90");
      expect(result.companyName).toBe("Test Company LTDA");
      expect(result.email).toBe("test@example.com");
      expect(result.phone).toBe("(11) 99999-9999");
      expect(result.street).toBe("Rua Test");
      expect(result.number).toBe("123");
      expect(result.complement).toBe("Apto 45");
      expect(result.neighborhood).toBe("Centro");
      expect(result.city).toBe("São Paulo");
      expect(result.state).toBe("SP");
      expect(result.zipCode).toBe("12.345-678");
    });

    it("should use existing CNPJ when provided", () => {
      const existingData: Partial<CompanyFormData> = {
        cnpj: "98.765.432/0001-10",
      };

      vi.mocked(maskPhone).mockReturnValue("(11) 99999-9999");
      vi.mocked(maskCEP).mockReturnValue("12.345-678");

      const result = mapCNPJDataToCompanyForm(mockCNPJData, existingData);

      expect(result.cnpj).toBe("98.765.432/0001-10");
      expect(maskCNPJ).not.toHaveBeenCalled();
    });

    it("should use CNPJ data CNPJ when existing CNPJ is not provided", () => {
      vi.mocked(maskCNPJ).mockReturnValue("12.345.678/0001-90");
      vi.mocked(maskPhone).mockReturnValue("(11) 99999-9999");
      vi.mocked(maskCEP).mockReturnValue("12.345-678");

      const result = mapCNPJDataToCompanyForm(mockCNPJData);

      expect(result.cnpj).toBe("12.345.678/0001-90");
      expect(maskCNPJ).toHaveBeenCalledWith("12345678000190");
    });

    it("should use empty string for CNPJ when CNPJ data CNPJ is empty", () => {
      const dataWithoutCNPJ: CNPJData = {
        ...mockCNPJData,
        cnpj: "",
      };

      vi.mocked(maskPhone).mockReturnValue("(11) 99999-9999");
      vi.mocked(maskCEP).mockReturnValue("12.345-678");

      const result = mapCNPJDataToCompanyForm(dataWithoutCNPJ);

      expect(result.cnpj).toBe("");
    });

    it("should format phone using formatPhone", () => {
      vi.mocked(maskCNPJ).mockReturnValue("12.345.678/0001-90");
      vi.mocked(maskPhone).mockReturnValue("(11) 99999-9999");
      vi.mocked(maskCEP).mockReturnValue("12.345-678");

      const result = mapCNPJDataToCompanyForm(mockCNPJData);

      expect(result.phone).toBe("(11) 99999-9999");
      expect(maskPhone).toHaveBeenCalledWith("11999999999");
    });

    it("should handle empty phone", () => {
      const dataWithoutPhone: CNPJData = {
        ...mockCNPJData,
        ddd_telefone_1: "",
      };

      vi.mocked(maskCNPJ).mockReturnValue("12.345.678/0001-90");
      vi.mocked(maskPhone).mockReturnValue("");
      vi.mocked(maskCEP).mockReturnValue("12.345-678");

      const result = mapCNPJDataToCompanyForm(dataWithoutPhone);

      expect(result.phone).toBe("");
    });

    it("should handle empty CEP", () => {
      const dataWithoutCEP: CNPJData = {
        ...mockCNPJData,
        cep: "",
      };

      vi.mocked(maskCNPJ).mockReturnValue("12.345.678/0001-90");
      vi.mocked(maskPhone).mockReturnValue("(11) 99999-9999");
      vi.mocked(maskCEP).mockReturnValue("");

      const result = mapCNPJDataToCompanyForm(dataWithoutCEP);

      expect(result.zipCode).toBe("");
    });

    it("should handle empty existing data", () => {
      vi.mocked(maskCNPJ).mockReturnValue("12.345.678/0001-90");
      vi.mocked(maskPhone).mockReturnValue("(11) 99999-9999");
      vi.mocked(maskCEP).mockReturnValue("12.345-678");

      const result = mapCNPJDataToCompanyForm(mockCNPJData, {});

      expect(result.cnpj).toBe("12.345.678/0001-90");
      expect(result.companyName).toBe("Test Company LTDA");
    });

    it("should handle undefined existing data", () => {
      vi.mocked(maskCNPJ).mockReturnValue("12.345.678/0001-90");
      vi.mocked(maskPhone).mockReturnValue("(11) 99999-9999");
      vi.mocked(maskCEP).mockReturnValue("12.345-678");

      const result = mapCNPJDataToCompanyForm(mockCNPJData, undefined);

      expect(result.cnpj).toBe("12.345.678/0001-90");
      expect(result.companyName).toBe("Test Company LTDA");
    });

    it("should handle partial CNPJ data", () => {
      const partialData: CNPJData = {
        cnpj: "12345678000190",
        razao_social: "",
        email: null,
        ddd_telefone_1: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        municipio: "",
        uf: "",
        cep: "",
      };

      vi.mocked(maskCNPJ).mockReturnValue("12.345.678/0001-90");
      vi.mocked(maskPhone).mockReturnValue("");
      vi.mocked(maskCEP).mockReturnValue("");

      const result = mapCNPJDataToCompanyForm(partialData);

      expect(result.companyName).toBe("");
      expect(result.email).toBe("");
      expect(result.phone).toBe("");
      expect(result.street).toBe("");
      expect(result.number).toBe("");
      expect(result.complement).toBe("");
      expect(result.neighborhood).toBe("");
      expect(result.city).toBe("");
      expect(result.state).toBe("");
      expect(result.zipCode).toBe("");
    });
  });
});
