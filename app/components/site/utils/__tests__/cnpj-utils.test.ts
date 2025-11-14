import { describe, it, expect } from "vitest";
import { formatCNPJ, formatPhone, mapCNPJDataToCompanyForm } from "../cnpj-utils";
import type { CNPJData, CompanyFormData } from "~/types";

describe("cnpj-utils", () => {
  describe("formatCNPJ", () => {
    it("should remove all non-digit characters", () => {
      expect(formatCNPJ("12.345.678/9012-34")).toBe("12345678901234");
      expect(formatCNPJ("12345678901234")).toBe("12345678901234");
      expect(formatCNPJ("abc123")).toBe("123");
    });
  });

  describe("formatPhone", () => {
    it("should format phone with mask", () => {
      expect(formatPhone("1234567890")).toBe("(12) 3456-7890");
      expect(formatPhone("(12) 3456-7890")).toBe("(12) 3456-7890");
    });

    it("should return empty string for empty input", () => {
      expect(formatPhone("")).toBe("");
    });
  });

  describe("mapCNPJDataToCompanyForm", () => {
    it("should map CNPJ data to company form", () => {
      const cnpjData: CNPJData = {
        cnpj: "12345678901234",
        razao_social: "Test Company",
        email: "test@example.com",
        ddd_telefone_1: "11987654321",
        logradouro: "Rua Test",
        numero: "123",
        complemento: "Apto 45",
        bairro: "Centro",
        municipio: "São Paulo",
        uf: "SP",
        cep: "12345678",
      };

      const result = mapCNPJDataToCompanyForm(cnpjData);

      expect(result).toEqual({
        cnpj: "12.345.678/9012-34",
        companyName: "Test Company",
        email: "test@example.com",
        phone: "(11) 98765-4321",
        street: "Rua Test",
        number: "123",
        complement: "Apto 45",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        zipCode: "12.345-678",
      });
    });

    it("should use existing data when provided", () => {
      const cnpjData: CNPJData = {
        cnpj: "12345678901234",
        razao_social: "Test Company",
        email: "",
        ddd_telefone_1: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        municipio: "",
        uf: "",
        cep: "",
      };

      const existingData: Partial<CompanyFormData> = {
        cnpj: "12.345.678/9012-34",
        email: "existing@example.com",
      };

      const result = mapCNPJDataToCompanyForm(cnpjData, existingData);

      expect(result.cnpj).toBe("12.345.678/9012-34");
      expect(result.email).toBe("");
    });

    it("should handle missing CNPJ data", () => {
      const cnpjData: CNPJData = {
        cnpj: "",
        razao_social: "",
        email: "",
        ddd_telefone_1: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        municipio: "",
        uf: "",
        cep: "",
      };

      const result = mapCNPJDataToCompanyForm(cnpjData);

      expect(result).toEqual({
        cnpj: "",
        companyName: "",
        email: "",
        phone: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
      });
    });
  });
});
