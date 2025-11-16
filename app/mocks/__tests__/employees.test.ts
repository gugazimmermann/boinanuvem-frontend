import { describe, it, expect } from "vitest";
import { mockEmployees } from "../employees";
import type { Employee } from "~/types";

describe("employees mock", () => {
  it("should export mockEmployees array", () => {
    expect(Array.isArray(mockEmployees)).toBe(true);
    expect(mockEmployees.length).toBeGreaterThan(0);
  });

  it("should have valid employee structure", () => {
    mockEmployees.forEach((employee: Employee) => {
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

      expect(typeof employee.id).toBe("string");
      expect(typeof employee.code).toBe("string");
      expect(typeof employee.name).toBe("string");
      expect(typeof employee.cpf).toBe("string");
      expect(typeof employee.email).toBe("string");
      expect(typeof employee.phone).toBe("string");
      expect(typeof employee.status).toBe("string");
      expect(typeof employee.createdAt).toBe("string");
      expect(typeof employee.companyId).toBe("string");
      expect(Array.isArray(employee.propertyIds)).toBe(true);
      expect(typeof employee.street).toBe("string");
      expect(typeof employee.number).toBe("string");
      expect(typeof employee.neighborhood).toBe("string");
      expect(typeof employee.city).toBe("string");
      expect(typeof employee.state).toBe("string");
      expect(typeof employee.zipCode).toBe("string");
    });
  });

  it("should have valid CPF format", () => {
    mockEmployees.forEach((employee: Employee) => {
      expect(employee.cpf).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
    });
  });

  it("should have valid email format", () => {
    mockEmployees.forEach((employee: Employee) => {
      expect(employee.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });

  it("should have valid status", () => {
    mockEmployees.forEach((employee: Employee) => {
      expect(["active", "inactive", "pending"]).toContain(employee.status);
    });
  });

  it("should have valid date format", () => {
    mockEmployees.forEach((employee: Employee) => {
      expect(employee.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(() => new Date(employee.createdAt)).not.toThrow();
    });
  });

  it("should have unique IDs", () => {
    const ids = mockEmployees.map((e) => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have unique codes", () => {
    const codes = mockEmployees.map((e) => e.code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });
});

