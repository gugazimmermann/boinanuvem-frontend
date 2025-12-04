import { describe, it, expect } from "vitest";
import { mockServiceProviders } from "../service-providers";
import { mockCompanies } from "../companies";
import { mockProperties } from "../properties";

describe("service-providers", () => {
  describe("mockServiceProviders", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockServiceProviders)).toBe(true);
    });

    it("should not be empty", () => {
      expect(mockServiceProviders.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockServiceProviders.forEach((provider) => {
        expect(provider).toHaveProperty("id");
        expect(provider).toHaveProperty("code");
        expect(provider).toHaveProperty("name");
        expect(provider).toHaveProperty("email");
        expect(provider).toHaveProperty("phone");
        expect(provider).toHaveProperty("status");
        expect(provider).toHaveProperty("createdAt");
        expect(provider).toHaveProperty("companyId");
        expect(provider).toHaveProperty("propertyIds");
        expect(provider).toHaveProperty("street");
        expect(provider).toHaveProperty("number");
        expect(provider).toHaveProperty("neighborhood");
        expect(provider).toHaveProperty("city");
        expect(provider).toHaveProperty("state");
        expect(provider).toHaveProperty("zipCode");
      });
    });

    it("should have unique IDs", () => {
      const ids = mockServiceProviders.map((provider) => provider.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid UUID format for IDs", () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      mockServiceProviders.forEach((provider) => {
        expect(provider.id).toMatch(uuidRegex);
      });
    });

    it("should have valid date format", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      mockServiceProviders.forEach((provider) => {
        expect(provider.createdAt).toMatch(dateRegex);
      });
    });

    it("should have dates within expected range", () => {
      mockServiceProviders.forEach((provider) => {
        const date = new Date(provider.createdAt);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2020);
        expect(date.getFullYear()).toBeLessThanOrEqual(2025);
      });
    });

    it("should have either CNPJ or CPF", () => {
      mockServiceProviders.forEach((provider) => {
        const hasCnpj = "cnpj" in provider && provider.cnpj !== undefined && provider.cnpj !== null;
        const hasCpf = "cpf" in provider && provider.cpf !== undefined && provider.cpf !== null;
        expect(hasCnpj || hasCpf).toBe(true);
      });
    });

    it("should have valid CNPJ format when present", () => {
      mockServiceProviders.forEach((provider) => {
        if ("cnpj" in provider && provider.cnpj) {
          const cnpjDigits = provider.cnpj.replace(/\D/g, "");
          expect(cnpjDigits.length).toBe(14);
        }
      });
    });

    it("should have valid CPF format when present", () => {
      mockServiceProviders.forEach((provider) => {
        if ("cpf" in provider && provider.cpf) {
          const cpfDigits = provider.cpf.replace(/\D/g, "");
          expect(cpfDigits.length).toBe(11);
        }
      });
    });

    it("should have valid email format", () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      mockServiceProviders.forEach((provider) => {
        expect(provider.email).toMatch(emailRegex);
      });
    });

    it("should have valid status", () => {
      const validStatuses = ["active", "inactive"];
      mockServiceProviders.forEach((provider) => {
        expect(validStatuses).toContain(provider.status);
      });
    });

    it("should reference valid company IDs", () => {
      const companyIds = mockCompanies.map((c) => c.id);
      mockServiceProviders.forEach((provider) => {
        expect(companyIds).toContain(provider.companyId);
      });
    });

    it("should reference valid property IDs", () => {
      const propertyIds = mockProperties.map((p) => p.id);
      mockServiceProviders.forEach((provider) => {
        expect(Array.isArray(provider.propertyIds)).toBe(true);
        provider.propertyIds.forEach((propertyId) => {
          expect(propertyIds).toContain(propertyId);
        });
      });
    });
  });
});
