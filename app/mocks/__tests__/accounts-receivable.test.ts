import { describe, it, expect } from "vitest";
import { mockAccountsReceivable } from "../accounts-receivable";
import type { AccountsReceivable } from "~/types";
import { AccountsReceivableStatus } from "~/types";

describe("accounts-receivable mock", () => {
  it("should export mockAccountsReceivable array", () => {
    expect(Array.isArray(mockAccountsReceivable)).toBe(true);
    expect(mockAccountsReceivable.length).toBeGreaterThan(0);
  });

  it("should have valid accounts receivable structure", () => {
    mockAccountsReceivable.forEach((transaction: AccountsReceivable) => {
      expect(transaction).toHaveProperty("id");
      expect(transaction).toHaveProperty("companyId");
      expect(transaction).toHaveProperty("amount");
      expect(transaction).toHaveProperty("dueDate");
      expect(transaction).toHaveProperty("description");
      expect(transaction).toHaveProperty("status");
      expect(transaction).toHaveProperty("propertyId");
      expect(transaction).toHaveProperty("createdAt");

      expect(typeof transaction.id).toBe("string");
      expect(typeof transaction.companyId).toBe("string");
      expect(typeof transaction.amount).toBe("number");
      expect(typeof transaction.dueDate).toBe("string");
      expect(typeof transaction.description).toBe("string");
      expect(typeof transaction.status).toBe("string");
      expect(typeof transaction.propertyId).toBe("string");
      expect(typeof transaction.createdAt).toBe("string");
    });
  });

  it("should have valid status", () => {
    mockAccountsReceivable.forEach((transaction: AccountsReceivable) => {
      expect([
        AccountsReceivableStatus.PAID,
        AccountsReceivableStatus.UNPAID,
        AccountsReceivableStatus.OVERDUE,
        AccountsReceivableStatus.PARTIAL,
      ]).toContain(transaction.status);
    });
  });

  it("should have valid date format", () => {
    mockAccountsReceivable.forEach((transaction: AccountsReceivable) => {
      expect(transaction.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(() => new Date(transaction.dueDate)).not.toThrow();
      expect(transaction.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(() => new Date(transaction.createdAt)).not.toThrow();
    });
  });

  it("should have unique IDs", () => {
    const ids = mockAccountsReceivable.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have positive amounts", () => {
    mockAccountsReceivable.forEach((transaction: AccountsReceivable) => {
      expect(transaction.amount).toBeGreaterThan(0);
    });
  });

  it("should have paidAmount less than or equal to amount when status is partial", () => {
    mockAccountsReceivable.forEach((transaction: AccountsReceivable) => {
      if (transaction.status === AccountsReceivableStatus.PARTIAL && transaction.paidAmount) {
        expect(transaction.paidAmount).toBeLessThanOrEqual(transaction.amount);
        expect(transaction.paidAmount).toBeGreaterThan(0);
      }
    });
  });

  it("should have paidAmount equal to amount when status is paid", () => {
    mockAccountsReceivable.forEach((transaction: AccountsReceivable) => {
      if (transaction.status === AccountsReceivableStatus.PAID && transaction.paidAmount) {
        expect(transaction.paidAmount).toBe(transaction.amount);
      }
    });
  });
});
