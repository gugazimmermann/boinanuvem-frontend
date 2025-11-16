import { describe, it, expect } from "vitest";
import { mockCompanies } from "../companies";
import type { Company } from "~/types";

describe("companies mock", () => {
  it("should export mockCompanies array", () => {
    expect(Array.isArray(mockCompanies)).toBe(true);
    expect(mockCompanies.length).toBeGreaterThan(0);
  });

  it("should have valid company structure", () => {
    mockCompanies.forEach((company: Company) => {
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

      expect(typeof company.id).toBe("string");
      expect(typeof company.cnpj).toBe("string");
      expect(typeof company.companyName).toBe("string");
      expect(typeof company.email).toBe("string");
      expect(typeof company.phone).toBe("string");
      expect(typeof company.street).toBe("string");
      expect(typeof company.number).toBe("string");
      expect(typeof company.neighborhood).toBe("string");
      expect(typeof company.city).toBe("string");
      expect(typeof company.state).toBe("string");
      expect(typeof company.zipCode).toBe("string");
      expect(typeof company.createdAt).toBe("string");
      expect(typeof company.latitude).toBe("number");
      expect(typeof company.longitude).toBe("number");
    });
  });

  it("should have valid CNPJ format", () => {
    mockCompanies.forEach((company: Company) => {
      expect(company.cnpj).toMatch(/^(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14})$/);
    });
  });

  it("should have valid email format", () => {
    mockCompanies.forEach((company: Company) => {
      expect(company.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });

  it("should have valid coordinates", () => {
    mockCompanies.forEach((company: Company) => {
      expect(company.latitude).toBeGreaterThanOrEqual(-90);
      expect(company.latitude).toBeLessThanOrEqual(90);
      expect(company.longitude).toBeGreaterThanOrEqual(-180);
      expect(company.longitude).toBeLessThanOrEqual(180);
    });
  });

  it("should have valid date format", () => {
    mockCompanies.forEach((company: Company) => {
      expect(company.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(() => new Date(company.createdAt)).not.toThrow();
    });
  });

  it("should have unique IDs", () => {
    const ids = mockCompanies.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

