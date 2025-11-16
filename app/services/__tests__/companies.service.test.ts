import { describe, it, expect, beforeEach, vi } from "vitest";
import { getCompanyById, getCompanyByCNPJ, updateCompany } from "../companies.service";
import { mockCompanies } from "~/mocks/companies";
import type { Company } from "~/types";

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [],
}));

describe("companies.service", () => {
  beforeEach(() => {
    mockCompanies.length = 0;
    mockCompanies.push(
      {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Company One",
        cnpj: "12.345.678/0001-90",
        email: "company1@example.com",
        phone: "47999999999",
        street: "Main St",
        number: "100",
        complement: "",
        neighborhood: "Downtown",
        city: "City",
        state: "SC",
        zipCode: "88000000",
        createdAt: "2020-01-01",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "Company Two",
        cnpj: "98.765.432/0001-10",
        email: "company2@example.com",
        phone: "47988888888",
        street: "Second St",
        number: "200",
        complement: "",
        neighborhood: "Uptown",
        city: "City",
        state: "SC",
        zipCode: "88000001",
        createdAt: "2020-01-02",
      }
    );
  });

  describe("getCompanyById", () => {
    it("should return company when ID exists", () => {
      const result = getCompanyById("550e8400-e29b-41d4-a716-446655440000");
      expect(result).toBeDefined();
      expect(result?.name).toBe("Company One");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getCompanyById("nonexistent-id");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getCompanyById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getCompanyByCNPJ", () => {
    it("should return company when CNPJ exists with formatting", () => {
      const result = getCompanyByCNPJ("12.345.678/0001-90");
      expect(result).toBeDefined();
      expect(result?.name).toBe("Company One");
    });

    it("should return company when CNPJ exists without formatting", () => {
      const result = getCompanyByCNPJ("12345678000190");
      expect(result).toBeDefined();
      expect(result?.name).toBe("Company One");
    });

    it("should return undefined when CNPJ does not exist", () => {
      const result = getCompanyByCNPJ("11.111.111/0001-11");
      expect(result).toBeUndefined();
    });

    it("should handle CNPJ with different formatting", () => {
      const result = getCompanyByCNPJ("98.765.432/0001-10");
      expect(result).toBeDefined();
      expect(result?.name).toBe("Company Two");
    });
  });

  describe("updateCompany", () => {
    it("should update existing company by CNPJ", () => {
      updateCompany("12.345.678/0001-90", { name: "Updated Company" });

      const updated = mockCompanies.find(
        (c) => c.cnpj.replace(/\D/g, "") === "12345678000190"
      );
      expect(updated?.name).toBe("Updated Company");
    });

    it("should update company with unformatted CNPJ", () => {
      updateCompany("12345678000190", { email: "updated@example.com" });

      const updated = mockCompanies.find(
        (c) => c.cnpj.replace(/\D/g, "") === "12345678000190"
      );
      expect(updated?.email).toBe("updated@example.com");
    });

    it("should not update non-existent company", () => {
      const initialCompanies = [...mockCompanies];
      updateCompany("11.111.111/0001-11", { name: "New Company" });
      expect(mockCompanies).toEqual(initialCompanies);
    });
  });
});

