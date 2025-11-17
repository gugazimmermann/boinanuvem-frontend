import { describe, it, expect } from "vitest";
import { mockAccountsPayable } from "../accounts-payable";
import type { AccountsPayable } from "~/types";
import { AccountsPayableStatus } from "~/types";

describe("accounts-payable mock", () => {
  it("should export mockAccountsPayable array", () => {
    expect(Array.isArray(mockAccountsPayable)).toBe(true);
    expect(mockAccountsPayable.length).toBeGreaterThan(0);
  });

  it("should have valid accounts payable structure", () => {
    mockAccountsPayable.forEach((transaction: AccountsPayable) => {
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
    mockAccountsPayable.forEach((transaction: AccountsPayable) => {
      expect([
        AccountsPayableStatus.PAID,
        AccountsPayableStatus.UNPAID,
        AccountsPayableStatus.OVERDUE,
        AccountsPayableStatus.PARTIAL,
      ]).toContain(transaction.status);
    });
  });

  it("should have valid date format", () => {
    mockAccountsPayable.forEach((transaction: AccountsPayable) => {
      expect(transaction.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(() => new Date(transaction.dueDate)).not.toThrow();
      expect(transaction.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(() => new Date(transaction.createdAt)).not.toThrow();
    });
  });

  it("should have unique IDs", () => {
    const ids = mockAccountsPayable.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have positive amounts", () => {
    mockAccountsPayable.forEach((transaction: AccountsPayable) => {
      expect(transaction.amount).toBeGreaterThan(0);
    });
  });

  it("should have paidAmount less than or equal to amount when status is partial", () => {
    mockAccountsPayable.forEach((transaction: AccountsPayable) => {
      if (transaction.status === AccountsPayableStatus.PARTIAL && transaction.paidAmount) {
        expect(transaction.paidAmount).toBeLessThanOrEqual(transaction.amount);
        expect(transaction.paidAmount).toBeGreaterThan(0);
      }
    });
  });

  it("should have paidAmount equal to amount when status is paid", () => {
    mockAccountsPayable.forEach((transaction: AccountsPayable) => {
      if (transaction.status === AccountsPayableStatus.PAID && transaction.paidAmount) {
        expect(transaction.paidAmount).toBe(transaction.amount);
      }
    });
  });
});
