import { describe, it, expect } from "vitest";
import { mockSuppliers } from "../suppliers";
import { mockCompanies } from "../companies";
import { mockProperties } from "../properties";

describe("suppliers", () => {
  describe("mockSuppliers", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockSuppliers)).toBe(true);
    });

    it("should not be empty", () => {
      expect(mockSuppliers.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockSuppliers.forEach((supplier) => {
        expect(supplier).toHaveProperty("id");
        expect(supplier).toHaveProperty("code");
        expect(supplier).toHaveProperty("name");
        expect(supplier).toHaveProperty("email");
        expect(supplier).toHaveProperty("phone");
        expect(supplier).toHaveProperty("status");
        expect(supplier).toHaveProperty("createdAt");
        expect(supplier).toHaveProperty("companyId");
        expect(supplier).toHaveProperty("propertyIds");
        expect(supplier).toHaveProperty("street");
        expect(supplier).toHaveProperty("number");
        expect(supplier).toHaveProperty("neighborhood");
        expect(supplier).toHaveProperty("city");
        expect(supplier).toHaveProperty("state");
        expect(supplier).toHaveProperty("zipCode");
      });
    });

    it("should have unique IDs", () => {
      const ids = mockSuppliers.map((supplier) => supplier.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid UUID format for IDs", () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      mockSuppliers.forEach((supplier) => {
        expect(supplier.id).toMatch(uuidRegex);
      });
    });

    it("should have valid date format", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      mockSuppliers.forEach((supplier) => {
        expect(supplier.createdAt).toMatch(dateRegex);
      });
    });

    it("should have dates within expected range", () => {
      mockSuppliers.forEach((supplier) => {
        const date = new Date(supplier.createdAt);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2020);
        expect(date.getFullYear()).toBeLessThanOrEqual(2025);
      });
    });

    it("should have either CNPJ or CPF", () => {
      mockSuppliers.forEach((supplier) => {
        const hasCnpj = "cnpj" in supplier && supplier.cnpj !== undefined && supplier.cnpj !== null;
        const hasCpf = "cpf" in supplier && supplier.cpf !== undefined && supplier.cpf !== null;
        expect(hasCnpj || hasCpf).toBe(true);
      });
    });

    it("should have valid CNPJ format when present", () => {
      mockSuppliers.forEach((supplier) => {
        if ("cnpj" in supplier && supplier.cnpj) {
          const cnpjDigits = supplier.cnpj.replace(/\D/g, "");
          expect(cnpjDigits.length).toBe(14);
        }
      });
    });

    it("should have valid CPF format when present", () => {
      mockSuppliers.forEach((supplier) => {
        if ("cpf" in supplier && supplier.cpf) {
          const cpfDigits = supplier.cpf.replace(/\D/g, "");
          expect(cpfDigits.length).toBe(11);
        }
      });
    });

    it("should have valid email format", () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      mockSuppliers.forEach((supplier) => {
        expect(supplier.email).toMatch(emailRegex);
      });
    });

    it("should have valid status", () => {
      const validStatuses = ["active", "inactive"];
      mockSuppliers.forEach((supplier) => {
        expect(validStatuses).toContain(supplier.status);
      });
    });

    it("should reference valid company IDs", () => {
      const companyIds = mockCompanies.map((c) => c.id);
      mockSuppliers.forEach((supplier) => {
        expect(companyIds).toContain(supplier.companyId);
      });
    });

    it("should reference valid property IDs", () => {
      const propertyIds = mockProperties.map((p) => p.id);
      mockSuppliers.forEach((supplier) => {
        expect(Array.isArray(supplier.propertyIds)).toBe(true);
        supplier.propertyIds.forEach((propertyId) => {
          expect(propertyIds).toContain(propertyId);
        });
      });
    });
  });
});
