import { describe, it, expect } from "vitest";
import { mockBuyers } from "../buyers";
import type { Buyer } from "~/types";

describe("buyers mock", () => {
  it("should export mockBuyers array", () => {
    expect(Array.isArray(mockBuyers)).toBe(true);
    expect(mockBuyers.length).toBeGreaterThan(0);
  });

  it("should have valid buyer structure", () => {
    mockBuyers.forEach((buyer: Buyer) => {
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

      expect(typeof buyer.id).toBe("string");
      expect(typeof buyer.code).toBe("string");
      expect(typeof buyer.name).toBe("string");
      expect(typeof buyer.email).toBe("string");
      expect(typeof buyer.phone).toBe("string");
      expect(typeof buyer.status).toBe("string");
      expect(typeof buyer.createdAt).toBe("string");
      expect(typeof buyer.companyId).toBe("string");
      expect(Array.isArray(buyer.propertyIds)).toBe(true);
      expect(typeof buyer.street).toBe("string");
      expect(typeof buyer.number).toBe("string");
      expect(typeof buyer.neighborhood).toBe("string");
      expect(typeof buyer.city).toBe("string");
      expect(typeof buyer.state).toBe("string");
      expect(typeof buyer.zipCode).toBe("string");
    });
  });

  it("should have either CNPJ or CPF", () => {
    mockBuyers.forEach((buyer: Buyer) => {
      const hasCnpj = "cnpj" in buyer && buyer.cnpj !== undefined;
      const hasCpf = "cpf" in buyer && buyer.cpf !== undefined;
      expect(hasCnpj || hasCpf).toBe(true);
    });
  });

  it("should have valid CNPJ format when present", () => {
    mockBuyers.forEach((buyer: Buyer) => {
      if ("cnpj" in buyer && buyer.cnpj) {
        expect(buyer.cnpj).toMatch(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/);
      }
    });
  });

  it("should have valid CPF format when present", () => {
    mockBuyers.forEach((buyer: Buyer) => {
      if ("cpf" in buyer && buyer.cpf) {
        expect(buyer.cpf).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
      }
    });
  });

  it("should have valid email format", () => {
    mockBuyers.forEach((buyer: Buyer) => {
      expect(buyer.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });

  it("should have valid status", () => {
    mockBuyers.forEach((buyer: Buyer) => {
      expect(["active", "inactive", "pending"]).toContain(buyer.status);
    });
  });

  it("should have valid date format", () => {
    mockBuyers.forEach((buyer: Buyer) => {
      expect(buyer.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(() => new Date(buyer.createdAt)).not.toThrow();
    });
  });

  it("should have unique IDs", () => {
    const ids = mockBuyers.map((b) => b.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have unique codes", () => {
    const codes = mockBuyers.map((b) => b.code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });
});
