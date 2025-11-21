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
      expect(transaction).toHaveProperty("type");
      expect(transaction).toHaveProperty("amount");
      expect(transaction).toHaveProperty("date");
      expect(transaction).toHaveProperty("companyId");
      expect(transaction).toHaveProperty("createdAt");

      expect(typeof transaction.id).toBe("string");
      expect(typeof transaction.type).toBe("string");
      expect(typeof transaction.amount).toBe("number");
      expect(typeof transaction.date).toBe("string");
      expect(typeof transaction.companyId).toBe("string");
      expect(typeof transaction.createdAt).toBe("string");
    });
  });

  it("should have valid date format (2020-2025)", () => {
    mockCashFlow.forEach((transaction: CashFlow) => {
      expect(transaction.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const date = new Date(transaction.date);
      expect(date.toString()).not.toBe("Invalid Date");

      const year = date.getFullYear();
      expect(year).toBeGreaterThanOrEqual(2020);
      expect(year).toBeLessThanOrEqual(2025);
    });
  });

  it("should have valid type values", () => {
    const validTypes = ["income", "expense"];
    mockCashFlow.forEach((transaction: CashFlow) => {
      expect(validTypes).toContain(transaction.type);
    });
  });

  it("should have valid category values", () => {
    const validCategories = Object.values(CashFlowCategory);
    mockCashFlow.forEach((transaction: CashFlow) => {
      if (transaction.category) {
        expect(validCategories).toContain(transaction.category);
      }
    });
  });

  it("should have valid payment method values", () => {
    const validMethods = Object.values(PaymentMethod);
    mockCashFlow.forEach((transaction: CashFlow) => {
      if (transaction.paymentMethod) {
        expect(validMethods).toContain(transaction.paymentMethod);
      }
    });
  });

  it("should have positive amounts", () => {
    mockCashFlow.forEach((transaction: CashFlow) => {
      expect(transaction.amount).toBeGreaterThan(0);
      expect(Number.isFinite(transaction.amount)).toBe(true);
    });
  });

  it("should have unique IDs", () => {
    const ids = mockCashFlow.map((transaction) => transaction.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have transactions sorted by date (most recent first)", () => {
    const sortedTransactions = [...mockCashFlow].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    expect(sortedTransactions).toEqual(mockCashFlow);
  });

  it("should have income transactions with buyerId", () => {
    let incomeCount = 0;
    let validIncomes = 0;
    mockCashFlow.forEach((transaction: CashFlow) => {
      if (transaction.type === "income") {
        incomeCount++;
        if (transaction.buyerId !== undefined && typeof transaction.buyerId === "string") {
          validIncomes++;
        }
      }
    });
    if (incomeCount > 0) {
      expect(validIncomes / incomeCount).toBeGreaterThan(0.7);
    }
  });

  it("should have both income and expense transactions", () => {
    const incomeCount = mockCashFlow.filter((t: CashFlow) => t.type === "income").length;
    const expenseCount = mockCashFlow.filter((t: CashFlow) => t.type === "expense").length;
    expect(incomeCount).toBeGreaterThan(0);
    expect(expenseCount).toBeGreaterThan(0);
  });

  it("should have paymentDate aligned with transaction date", () => {
    mockCashFlow.forEach((transaction: CashFlow) => {
      if (transaction.paymentDate) {
        const transactionDate = new Date(transaction.date);
        const paymentDate = new Date(transaction.paymentDate);
        expect(paymentDate.getTime()).toBeGreaterThanOrEqual(
          transactionDate.getTime() - 5 * 24 * 60 * 60 * 1000
        );
        expect(paymentDate.getTime()).toBeLessThanOrEqual(
          transactionDate.getTime() + 35 * 24 * 60 * 60 * 1000
        );
      }
    });
  });
});
