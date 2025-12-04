import { describe, it, expect } from "vitest";
import { mockEmployees } from "../employees";
import { mockCompanies } from "../companies";
import { mockProperties } from "../properties";

describe("employees", () => {
  describe("mockEmployees", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockEmployees)).toBe(true);
    });

    it("should not be empty", () => {
      expect(mockEmployees.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockEmployees.forEach((employee) => {
        expect(employee).toHaveProperty("id");
        expect(employee).toHaveProperty("code");
        expect(employee).toHaveProperty("name");
        expect(employee).toHaveProperty("cpf");
        expect(employee).toHaveProperty("email");
        expect(employee).toHaveProperty("phone");
        expect(employee).toHaveProperty("status");
        expect(employee).toHaveProperty("createdAt");
        expect(employee).toHaveProperty("companyId");
        expect(employee).toHaveProperty("propertyIds");
        expect(employee).toHaveProperty("street");
        expect(employee).toHaveProperty("number");
        expect(employee).toHaveProperty("neighborhood");
        expect(employee).toHaveProperty("city");
        expect(employee).toHaveProperty("state");
        expect(employee).toHaveProperty("zipCode");
      });
    });

    it("should have unique IDs", () => {
      const ids = mockEmployees.map((employee) => employee.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid UUID format for IDs", () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      mockEmployees.forEach((employee) => {
        expect(employee.id).toMatch(uuidRegex);
      });
    });

    it("should have valid date format", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      mockEmployees.forEach((employee) => {
        expect(employee.createdAt).toMatch(dateRegex);
      });
    });

    it("should have dates within expected range", () => {
      mockEmployees.forEach((employee) => {
        const date = new Date(employee.createdAt);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2020);
        expect(date.getFullYear()).toBeLessThanOrEqual(2025);
      });
    });

    it("should have valid CPF format", () => {
      mockEmployees.forEach((employee) => {
        if (employee.cpf) {
          const cpfDigits = employee.cpf.replace(/\D/g, "");
          expect(cpfDigits.length).toBe(11);
        }
      });
    });

    it("should have valid email format", () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      mockEmployees.forEach((employee) => {
        expect(employee.email).toMatch(emailRegex);
      });
    });

    it("should have valid status", () => {
      const validStatuses = ["active", "inactive"];
      mockEmployees.forEach((employee) => {
        expect(validStatuses).toContain(employee.status);
      });
    });

    it("should reference valid company IDs", () => {
      const companyIds = mockCompanies.map((c) => c.id);
      mockEmployees.forEach((employee) => {
        expect(companyIds).toContain(employee.companyId);
      });
    });

    it("should reference valid property IDs", () => {
      const propertyIds = mockProperties.map((p) => p.id);
      mockEmployees.forEach((employee) => {
        expect(Array.isArray(employee.propertyIds)).toBe(true);
        employee.propertyIds.forEach((propertyId) => {
          expect(propertyIds).toContain(propertyId);
        });
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
      mockEmployees.forEach((employee) => {
        expect(validStates).toContain(employee.state);
      });
    });
  });
});
