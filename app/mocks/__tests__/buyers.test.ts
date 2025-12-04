import { describe, it, expect } from "vitest";
import { mockBuyers } from "../buyers";
import { mockCompanies } from "../companies";
import { mockProperties } from "../properties";

describe("buyers", () => {
  describe("mockBuyers", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockBuyers)).toBe(true);
    });

    it("should not be empty", () => {
      expect(mockBuyers.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockBuyers.forEach((buyer) => {
        expect(buyer).toHaveProperty("id");
        expect(buyer).toHaveProperty("code");
        expect(buyer).toHaveProperty("name");
        expect(buyer).toHaveProperty("email");
        expect(buyer).toHaveProperty("phone");
        expect(buyer).toHaveProperty("status");
        expect(buyer).toHaveProperty("createdAt");
        expect(buyer).toHaveProperty("companyId");
        expect(buyer).toHaveProperty("propertyIds");
        expect(buyer).toHaveProperty("street");
        expect(buyer).toHaveProperty("number");
        expect(buyer).toHaveProperty("neighborhood");
        expect(buyer).toHaveProperty("city");
        expect(buyer).toHaveProperty("state");
        expect(buyer).toHaveProperty("zipCode");
      });
    });

    it("should have unique IDs", () => {
      const ids = mockBuyers.map((buyer) => buyer.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid UUID format for IDs", () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      mockBuyers.forEach((buyer) => {
        expect(buyer.id).toMatch(uuidRegex);
      });
    });

    it("should have valid date format", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      mockBuyers.forEach((buyer) => {
        expect(buyer.createdAt).toMatch(dateRegex);
      });
    });

    it("should have dates within expected range", () => {
      mockBuyers.forEach((buyer) => {
        const date = new Date(buyer.createdAt);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2020);
        expect(date.getFullYear()).toBeLessThanOrEqual(2025);
      });
    });

    it("should have either CNPJ or CPF", () => {
      mockBuyers.forEach((buyer) => {
        const hasCnpj = "cnpj" in buyer && buyer.cnpj !== undefined && buyer.cnpj !== null;
        const hasCpf = "cpf" in buyer && buyer.cpf !== undefined && buyer.cpf !== null;
        expect(hasCnpj || hasCpf).toBe(true);
      });
    });

    it("should have valid CNPJ format when present", () => {
      mockBuyers.forEach((buyer) => {
        if ("cnpj" in buyer && buyer.cnpj) {
          const cnpjDigits = buyer.cnpj.replace(/\D/g, "");
          expect(cnpjDigits.length).toBe(14);
        }
      });
    });

    it("should have valid CPF format when present", () => {
      mockBuyers.forEach((buyer) => {
        if ("cpf" in buyer && buyer.cpf) {
          const cpfDigits = buyer.cpf.replace(/\D/g, "");
          expect(cpfDigits.length).toBe(11);
        }
      });
    });

    it("should have valid email format", () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      mockBuyers.forEach((buyer) => {
        expect(buyer.email).toMatch(emailRegex);
      });
    });

    it("should have valid status", () => {
      const validStatuses = ["active", "inactive"];
      mockBuyers.forEach((buyer) => {
        expect(validStatuses).toContain(buyer.status);
      });
    });

    it("should reference valid company IDs", () => {
      const companyIds = mockCompanies.map((c) => c.id);
      mockBuyers.forEach((buyer) => {
        expect(companyIds).toContain(buyer.companyId);
      });
    });

    it("should reference valid property IDs", () => {
      const propertyIds = mockProperties.map((p) => p.id);
      mockBuyers.forEach((buyer) => {
        expect(Array.isArray(buyer.propertyIds)).toBe(true);
        buyer.propertyIds.forEach((propertyId) => {
          expect(propertyIds).toContain(propertyId);
        });
      });
    });
  });
});
