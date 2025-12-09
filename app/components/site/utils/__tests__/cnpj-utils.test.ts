import { describe, it, expect } from "vitest";
import { formatCNPJ, formatPhone, mapCNPJDataToCompanyForm } from "../cnpj-utils";
import type { CNPJData, CompanyFormData } from "~/types";

describe("formatCNPJ", () => {
  it("should remove all non-digits", () => {
    expect(formatCNPJ("12.345.678/0001-90")).toBe("12345678000190");
  });

  it("should handle already formatted CNPJ", () => {
    expect(formatCNPJ("12345678000190")).toBe("12345678000190");
  });

  it("should handle empty string", () => {
    expect(formatCNPJ("")).toBe("");
  });
});

describe("formatPhone", () => {
  it("should format phone number", () => {
    expect(formatPhone("11987654321")).toBe("(11) 98765-4321");
  });

  it("should handle empty string", () => {
    expect(formatPhone("")).toBe("");
  });

  it("should handle already formatted phone", () => {
    expect(formatPhone("(11) 98765-4321")).toBe("(11) 98765-4321");
  });
});

describe("mapCNPJDataToCompanyForm", () => {
  const mockCNPJData: CNPJData = {
    cnpj: "12345678000190",
    razao_social: "Test Company LTDA",
    email: "test@example.com",
    ddd_telefone_1: "11987654321",
    logradouro: "Test Street",
    numero: "123",
    complemento: "Apt 101",
    bairro: "Test Neighborhood",
    municipio: "Test City",
    uf: "SP",
    cep: "12345678",
  };

  it("should map CNPJ data to company form", () => {
    const result = mapCNPJDataToCompanyForm(mockCNPJData);

    expect(result.cnpj).toBe("12.345.678/0001-90");
    expect(result.companyName).toBe("Test Company LTDA");
    expect(result.email).toBe("test@example.com");
    expect(result.phone).toBe("(11) 98765-4321");
    expect(result.street).toBe("Test Street");
    expect(result.number).toBe("123");
    expect(result.complement).toBe("Apt 101");
    expect(result.neighborhood).toBe("Test Neighborhood");
    expect(result.city).toBe("Test City");
    expect(result.state).toBe("SP");
    expect(result.zipCode).toBe("12.345-678");
  });

  it("should preserve existing CNPJ when provided", () => {
    const existingData: Partial<CompanyFormData> = {
      cnpj: "98.765.432/0001-10",
    };

    const result = mapCNPJDataToCompanyForm(mockCNPJData, existingData);

    expect(result.cnpj).toBe("98.765.432/0001-10");
  });

  it("should use CNPJ data CNPJ when existing data has no CNPJ", () => {
    const result = mapCNPJDataToCompanyForm(mockCNPJData);

    expect(result.cnpj).toBe("12.345.678/0001-90");
  });

  it("should handle missing CNPJ in data", () => {
    const cnpjDataWithoutCNPJ: CNPJData = {
      cnpj: "",
      razao_social: "Test Company",
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

    const existingData: Partial<CompanyFormData> = {
      cnpj: "12.345.678/0001-90",
    };

    const result = mapCNPJDataToCompanyForm(cnpjDataWithoutCNPJ, existingData);

    expect(result.cnpj).toBe("12.345.678/0001-90");
  });

  it("should handle empty phone", () => {
    const cnpjDataWithoutPhone: CNPJData = {
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

    const result = mapCNPJDataToCompanyForm(cnpjDataWithoutPhone);

    expect(result.phone).toBe("");
  });

  it("should handle missing CEP", () => {
    const cnpjDataWithoutCEP: CNPJData = {
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

    const result = mapCNPJDataToCompanyForm(cnpjDataWithoutCEP);

    expect(result.zipCode).toBe("");
  });

  it("should return empty strings for missing fields", () => {
    const minimalCNPJData: CNPJData = {
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

    const result = mapCNPJDataToCompanyForm(minimalCNPJData);

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

  it("should handle empty CNPJ data", () => {
    const emptyCNPJData: CNPJData = {
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

    const result = mapCNPJDataToCompanyForm(emptyCNPJData);

    expect(result.cnpj).toBe("");
    expect(result.companyName).toBe("");
    expect(result.email).toBe("");
    expect(result.phone).toBe("");
  });
});
