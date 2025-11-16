import { describe, it, expect } from "vitest";
import { mockSuppliers } from "../suppliers";
import type { Supplier } from "~/types";

describe("suppliers mock", () => {
  it("should export mockSuppliers array", () => {
    expect(Array.isArray(mockSuppliers)).toBe(true);
    expect(mockSuppliers.length).toBeGreaterThan(0);
  });

  it("should have valid supplier structure", () => {
    mockSuppliers.forEach((supplier: Supplier) => {
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

      expect(typeof supplier.id).toBe("string");
      expect(typeof supplier.code).toBe("string");
      expect(typeof supplier.name).toBe("string");
      expect(typeof supplier.email).toBe("string");
      expect(typeof supplier.phone).toBe("string");
      expect(typeof supplier.status).toBe("string");
      expect(typeof supplier.createdAt).toBe("string");
      expect(typeof supplier.companyId).toBe("string");
      expect(Array.isArray(supplier.propertyIds)).toBe(true);
      expect(typeof supplier.street).toBe("string");
      expect(typeof supplier.number).toBe("string");
      expect(typeof supplier.neighborhood).toBe("string");
      expect(typeof supplier.city).toBe("string");
      expect(typeof supplier.state).toBe("string");
      expect(typeof supplier.zipCode).toBe("string");
    });
  });

  it("should have either CNPJ or CPF", () => {
    mockSuppliers.forEach((supplier: Supplier) => {
      const hasCnpj = "cnpj" in supplier && supplier.cnpj !== undefined;
      const hasCpf = "cpf" in supplier && supplier.cpf !== undefined;
      expect(hasCnpj || hasCpf).toBe(true);
    });
  });

  it("should have valid CNPJ format when present", () => {
    mockSuppliers.forEach((supplier: Supplier) => {
      if ("cnpj" in supplier && supplier.cnpj) {
        expect(supplier.cnpj).toMatch(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/);
      }
    });
  });

  it("should have valid CPF format when present", () => {
    mockSuppliers.forEach((supplier: Supplier) => {
      if ("cpf" in supplier && supplier.cpf) {
        expect(supplier.cpf).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
      }
    });
  });

  it("should have valid email format", () => {
    mockSuppliers.forEach((supplier: Supplier) => {
      expect(supplier.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });

  it("should have valid status", () => {
    mockSuppliers.forEach((supplier: Supplier) => {
      expect(["active", "inactive", "pending"]).toContain(supplier.status);
    });
  });

  it("should have valid date format", () => {
    mockSuppliers.forEach((supplier: Supplier) => {
      expect(supplier.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(() => new Date(supplier.createdAt)).not.toThrow();
    });
  });

  it("should have unique IDs", () => {
    const ids = mockSuppliers.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have unique codes", () => {
    const codes = mockSuppliers.map((s) => s.code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });
});

