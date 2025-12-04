import { describe, it, expect } from "vitest";
import { mockCompanies } from "../companies";

describe("companies", () => {
  describe("mockCompanies", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockCompanies)).toBe(true);
    });

    it("should not be empty", () => {
      expect(mockCompanies.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockCompanies.forEach((company) => {
        expect(company).toHaveProperty("id");
        expect(company).toHaveProperty("cnpj");
        expect(company).toHaveProperty("companyName");
        expect(company).toHaveProperty("email");
        expect(company).toHaveProperty("phone");
        expect(company).toHaveProperty("street");
        expect(company).toHaveProperty("number");
        expect(company).toHaveProperty("neighborhood");
        expect(company).toHaveProperty("city");
        expect(company).toHaveProperty("state");
        expect(company).toHaveProperty("zipCode");
        expect(company).toHaveProperty("createdAt");
        expect(company).toHaveProperty("latitude");
        expect(company).toHaveProperty("longitude");
      });
    });

    it("should have unique IDs", () => {
      const ids = mockCompanies.map((company) => company.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid UUID format for IDs", () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      mockCompanies.forEach((company) => {
        expect(company.id).toMatch(uuidRegex);
      });
    });

    it("should have valid date format", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      mockCompanies.forEach((company) => {
        expect(company.createdAt).toMatch(dateRegex);
      });
    });

    it("should have dates within expected range", () => {
      mockCompanies.forEach((company) => {
        const date = new Date(company.createdAt);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2020);
        expect(date.getFullYear()).toBeLessThanOrEqual(2025);
      });
    });

    it("should have valid CNPJ format", () => {
      const cnpjRegex = /^\d{14}$/;
      mockCompanies.forEach((company) => {
        const cnpjDigits = company.cnpj.replace(/\D/g, "");
        expect(cnpjDigits).toMatch(cnpjRegex);
      });
    });

    it("should have valid email format", () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      mockCompanies.forEach((company) => {
        expect(company.email).toMatch(emailRegex);
      });
    });

    it("should have valid state codes", () => {
      const validStates = [
        "AC",
        "AL",
        "AP",
        "AM",
        "BA",
        "CE",
        "DF",
        "ES",
        "GO",
        "MA",
        "MT",
        "MS",
        "MG",
        "PA",
        "PB",
        "PR",
        "PE",
        "PI",
        "RJ",
        "RN",
        "RS",
        "RO",
        "RR",
        "SC",
        "SP",
        "SE",
        "TO",
      ];
      mockCompanies.forEach((company) => {
        expect(validStates).toContain(company.state);
      });
    });

    it("should have valid coordinates", () => {
      mockCompanies.forEach((company) => {
        expect(typeof company.latitude).toBe("number");
        expect(typeof company.longitude).toBe("number");
        expect(company.latitude).toBeGreaterThanOrEqual(-90);
        expect(company.latitude).toBeLessThanOrEqual(90);
        expect(company.longitude).toBeGreaterThanOrEqual(-180);
        expect(company.longitude).toBeLessThanOrEqual(180);
      });
    });
  });
});
