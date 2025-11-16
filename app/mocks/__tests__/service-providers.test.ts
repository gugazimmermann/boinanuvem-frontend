import { describe, it, expect } from "vitest";
import { mockServiceProviders } from "../service-providers";
import type { ServiceProvider } from "~/types";

describe("service-providers mock", () => {
  it("should export mockServiceProviders array", () => {
    expect(Array.isArray(mockServiceProviders)).toBe(true);
    expect(mockServiceProviders.length).toBeGreaterThan(0);
  });

  it("should have valid service provider structure", () => {
    mockServiceProviders.forEach((serviceProvider: ServiceProvider) => {
      expect(serviceProvider).toHaveProperty("id");
      expect(serviceProvider).toHaveProperty("code");
      expect(serviceProvider).toHaveProperty("name");
      expect(serviceProvider).toHaveProperty("email");
      expect(serviceProvider).toHaveProperty("phone");
      expect(serviceProvider).toHaveProperty("status");
      expect(serviceProvider).toHaveProperty("createdAt");
      expect(serviceProvider).toHaveProperty("companyId");
      expect(serviceProvider).toHaveProperty("propertyIds");
      expect(serviceProvider).toHaveProperty("street");
      expect(serviceProvider).toHaveProperty("number");
      expect(serviceProvider).toHaveProperty("neighborhood");
      expect(serviceProvider).toHaveProperty("city");
      expect(serviceProvider).toHaveProperty("state");
      expect(serviceProvider).toHaveProperty("zipCode");

      expect(typeof serviceProvider.id).toBe("string");
      expect(typeof serviceProvider.code).toBe("string");
      expect(typeof serviceProvider.name).toBe("string");
      expect(typeof serviceProvider.email).toBe("string");
      expect(typeof serviceProvider.phone).toBe("string");
      expect(typeof serviceProvider.status).toBe("string");
      expect(typeof serviceProvider.createdAt).toBe("string");
      expect(typeof serviceProvider.companyId).toBe("string");
      expect(Array.isArray(serviceProvider.propertyIds)).toBe(true);
      expect(typeof serviceProvider.street).toBe("string");
      expect(typeof serviceProvider.number).toBe("string");
      expect(typeof serviceProvider.neighborhood).toBe("string");
      expect(typeof serviceProvider.city).toBe("string");
      expect(typeof serviceProvider.state).toBe("string");
      expect(typeof serviceProvider.zipCode).toBe("string");
    });
  });

  it("should have either CNPJ or CPF", () => {
    mockServiceProviders.forEach((serviceProvider: ServiceProvider) => {
      const hasCnpj = "cnpj" in serviceProvider && serviceProvider.cnpj !== undefined;
      const hasCpf = "cpf" in serviceProvider && serviceProvider.cpf !== undefined;
      expect(hasCnpj || hasCpf).toBe(true);
    });
  });

  it("should have valid CNPJ format when present", () => {
    mockServiceProviders.forEach((serviceProvider: ServiceProvider) => {
      if ("cnpj" in serviceProvider && serviceProvider.cnpj) {
        expect(serviceProvider.cnpj).toMatch(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/);
      }
    });
  });

  it("should have valid CPF format when present", () => {
    mockServiceProviders.forEach((serviceProvider: ServiceProvider) => {
      if ("cpf" in serviceProvider && serviceProvider.cpf) {
        expect(serviceProvider.cpf).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
      }
    });
  });

  it("should have valid email format", () => {
    mockServiceProviders.forEach((serviceProvider: ServiceProvider) => {
      expect(serviceProvider.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });

  it("should have valid status", () => {
    mockServiceProviders.forEach((serviceProvider: ServiceProvider) => {
      expect(["active", "inactive", "pending"]).toContain(serviceProvider.status);
    });
  });

  it("should have valid date format", () => {
    mockServiceProviders.forEach((serviceProvider: ServiceProvider) => {
      expect(serviceProvider.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(() => new Date(serviceProvider.createdAt)).not.toThrow();
    });
  });

  it("should have unique IDs", () => {
    const ids = mockServiceProviders.map((sp) => sp.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have unique codes", () => {
    const codes = mockServiceProviders.map((sp) => sp.code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });
});
