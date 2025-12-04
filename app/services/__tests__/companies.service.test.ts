import { describe, it, expect, beforeEach } from "vitest";
import { getCompanyById, getCompanyByCNPJ, updateCompany } from "../companies.service";
import { mockCompanies } from "~/mocks/companies";
import type { Company } from "~/types";

describe("companies.service", () => {
  beforeEach(() => {
    mockCompanies.length = 0;
    mockCompanies.push(
      {
        id: "company-1",
        companyName: "Company 1",
        cnpj: "12.345.678/0001-90",
        email: "company1@test.com",
        phone: "1234567890",
        street: "Street 1",
        number: "123",
        complement: "",
        neighborhood: "Neighborhood 1",
        city: "City 1",
        state: "State 1",
        zipCode: "12345-678",
        createdAt: "2025-01-01",
      },
      {
        id: "company-2",
        companyName: "Company 2",
        cnpj: "98.765.432/0001-10",
        email: "company2@test.com",
        phone: "0987654321",
        street: "Street 2",
        number: "456",
        complement: "",
        neighborhood: "Neighborhood 2",
        city: "City 2",
        state: "State 2",
        zipCode: "98765-432",
        createdAt: "2025-01-02",
      }
    );
  });

  describe("getCompanyById", () => {
    it("should return company when ID exists", () => {
      const result = getCompanyById("company-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("company-1");
      expect(result?.companyName).toBe("Company 1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getCompanyById("company-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getCompanyById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getCompanyByCNPJ", () => {
    it("should return company when CNPJ exists (masked)", () => {
      const result = getCompanyByCNPJ("12.345.678/0001-90");
      expect(result).toBeDefined();
      expect(result?.id).toBe("company-1");
    });

    it("should return company when CNPJ exists (unmasked)", () => {
      const result = getCompanyByCNPJ("12345678000190");
      expect(result).toBeDefined();
      expect(result?.id).toBe("company-1");
    });

    it("should return undefined when CNPJ does not exist", () => {
      const result = getCompanyByCNPJ("11.111.111/0001-11");
      expect(result).toBeUndefined();
    });

    it("should handle CNPJ with different formatting", () => {
      const result = getCompanyByCNPJ("12.345.678/0001-90");
      expect(result).toBeDefined();
    });
  });

  describe("updateCompany", () => {
    it("should update company when CNPJ exists (masked)", () => {
      const updateData: Partial<Company> = {
        companyName: "Updated Company 1",
        email: "updated@test.com",
      };

      updateCompany("12.345.678/0001-90", updateData);

      const updated = mockCompanies.find((c) => c.id === "company-1");
      expect(updated?.companyName).toBe("Updated Company 1");
      expect(updated?.email).toBe("updated@test.com");
    });

    it("should update company when CNPJ exists (unmasked)", () => {
      const updateData: Partial<Company> = {
        companyName: "Updated Company 1",
      };

      updateCompany("12345678000190", updateData);

      const updated = mockCompanies.find((c) => c.id === "company-1");
      expect(updated?.companyName).toBe("Updated Company 1");
    });

    it("should not update when CNPJ does not exist", () => {
      const original = mockCompanies.find((c) => c.id === "company-1");
      const originalName = original?.companyName;

      const updateData: Partial<Company> = {
        companyName: "Updated Company",
      };

      updateCompany("11.111.111/0001-11", updateData);

      const unchanged = mockCompanies.find((c) => c.id === "company-1");
      expect(unchanged?.companyName).toBe(originalName);
    });

    it("should preserve existing fields when updating", () => {
      const original = mockCompanies.find((c) => c.id === "company-1");
      const originalCnpj = original?.cnpj;

      const updateData: Partial<Company> = {
        companyName: "Updated Company 1",
      };

      updateCompany("12.345.678/0001-90", updateData);

      const updated = mockCompanies.find((c) => c.id === "company-1");
      expect(updated?.cnpj).toBe(originalCnpj);
    });
  });
});
