import { describe, it, expect } from "vitest";
import { mockCashFlow } from "../cash-flow";
import type { CashFlow } from "~/types";
import { CashFlowCategory, PaymentMethod } from "~/types";

describe("cash-flow mock", () => {
  it("should export mockCashFlow array", () => {
    expect(Array.isArray(mockCashFlow)).toBe(true);
    expect(mockCashFlow.length).toBeGreaterThan(0);
  });

  it("should have valid cash flow structure", () => {
    mockCashFlow.forEach((transaction: CashFlow) => {
      expect(transaction).toHaveProperty("id");
      expect(transaction).toHaveProperty("companyId");
      expect(transaction).toHaveProperty("type");
      expect(transaction).toHaveProperty("amount");
      expect(transaction).toHaveProperty("date");
      expect(transaction).toHaveProperty("description");
      expect(transaction).toHaveProperty("category");
      expect(transaction).toHaveProperty("paymentMethod");
      expect(transaction).toHaveProperty("status");
      expect(transaction).toHaveProperty("propertyId");
      expect(transaction).toHaveProperty("createdAt");

      expect(typeof transaction.id).toBe("string");
      expect(typeof transaction.companyId).toBe("string");
      expect(typeof transaction.type).toBe("string");
      expect(typeof transaction.amount).toBe("number");
      expect(typeof transaction.date).toBe("string");
      expect(typeof transaction.description).toBe("string");
      expect(typeof transaction.category).toBe("string");
      expect(typeof transaction.paymentMethod).toBe("string");
      expect(typeof transaction.status).toBe("string");
      expect(typeof transaction.propertyId).toBe("string");
      expect(typeof transaction.createdAt).toBe("string");
    });
  });

  it("should have valid type", () => {
    mockCashFlow.forEach((transaction: CashFlow) => {
      expect(["income", "expense"]).toContain(transaction.type);
    });
  });

  it("should have valid category", () => {
    mockCashFlow.forEach((transaction: CashFlow) => {
      expect(Object.values(CashFlowCategory)).toContain(transaction.category);
    });
  });

  it("should have valid payment method", () => {
    mockCashFlow.forEach((transaction: CashFlow) => {
      expect(Object.values(PaymentMethod)).toContain(transaction.paymentMethod);
    });
  });

  it("should have valid status", () => {
    mockCashFlow.forEach((transaction: CashFlow) => {
      expect(transaction.status).toBe("completed");
    });
  });

  it("should have valid date format", () => {
    mockCashFlow.forEach((transaction: CashFlow) => {
      expect(transaction.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(() => new Date(transaction.date)).not.toThrow();
      expect(transaction.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(() => new Date(transaction.createdAt)).not.toThrow();
    });
  });

  it("should have unique IDs", () => {
    const ids = mockCashFlow.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have positive amounts", () => {
    mockCashFlow.forEach((transaction: CashFlow) => {
      expect(transaction.amount).toBeGreaterThan(0);
    });
  });
});
