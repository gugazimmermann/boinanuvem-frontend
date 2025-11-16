import { describe, it, expect } from "vitest";
import { mockCompanies, updateCompany } from "../companies";
import type { Company } from "~/types";

describe("Companies Mock Functions", () => {
  describe("mockCompanies", () => {
    it("should have at least one company", () => {
      expect(mockCompanies.length).toBeGreaterThan(0);
    });

    it("should have valid company structure", () => {
      mockCompanies.forEach((company) => {
        expect(company).toHaveProperty("id");
        expect(company).toHaveProperty("cnpj");
        expect(company).toHaveProperty("companyName");
        expect(company).toHaveProperty("email");
        expect(company).toHaveProperty("phone");
        expect(company).toHaveProperty("createdAt");
      });
    });
  });

  describe("updateCompany", () => {
    it("should update a company by cnpj", () => {
      if (mockCompanies.length > 0) {
        const company = mockCompanies[0];
        const updateData: Partial<Company> = {
          companyName: "Updated Company Name",
          email: "updated@example.com",
        };

        updateCompany(company.cnpj, updateData);
        const updated = mockCompanies.find((c) => c.id === company.id);
        expect(updated?.companyName).toBe(updateData.companyName);
        expect(updated?.email).toBe(updateData.email);
      }
    });

    it("should update company with unmasked cnpj", () => {
      if (mockCompanies.length > 0) {
        const company = mockCompanies[0];
        const maskedCNPJ = company.cnpj.replace(/\D/g, "");
        const updateData: Partial<Company> = {
          companyName: "Updated Name 2",
        };

        updateCompany(maskedCNPJ, updateData);
        const updated = mockCompanies.find((c) => c.id === company.id);
        expect(updated?.companyName).toBe(updateData.companyName);
      }
    });

    it("should not update non-existent company", () => {
      const initialCompanies = [...mockCompanies];
      updateCompany("00.000.000/0000-00", { companyName: "Test" });
      expect(mockCompanies).toEqual(initialCompanies);
    });
  });
});

