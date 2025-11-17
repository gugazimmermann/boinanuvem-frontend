import { describe, it, expect } from "vitest";
import { mockBankAccounts } from "../bank-accounts";
import type { BankAccount } from "~/types";

describe("bank-accounts mock", () => {
  it("should export mockBankAccounts array", () => {
    expect(Array.isArray(mockBankAccounts)).toBe(true);
    expect(mockBankAccounts.length).toBeGreaterThan(0);
  });

  it("should have valid bank account structure", () => {
    mockBankAccounts.forEach((account: BankAccount) => {
      expect(account).toHaveProperty("id");
      expect(account).toHaveProperty("companyId");
      expect(account).toHaveProperty("bankName");
      expect(account).toHaveProperty("bankCode");
      expect(account).toHaveProperty("branch");
      expect(account).toHaveProperty("accountNumber");
      expect(account).toHaveProperty("accountType");
      expect(account).toHaveProperty("accountHolderName");
      expect(account).toHaveProperty("status");
      expect(account).toHaveProperty("createdAt");

      expect(typeof account.id).toBe("string");
      expect(typeof account.companyId).toBe("string");
      expect(typeof account.bankName).toBe("string");
      expect(typeof account.bankCode).toBe("string");
      expect(typeof account.branch).toBe("string");
      expect(typeof account.accountNumber).toBe("string");
      expect(typeof account.accountType).toBe("string");
      expect(typeof account.accountHolderName).toBe("string");
      expect(typeof account.status).toBe("string");
      expect(typeof account.createdAt).toBe("string");
    });
  });

  it("should have valid account type", () => {
    mockBankAccounts.forEach((account: BankAccount) => {
      expect(["checking", "savings"]).toContain(account.accountType);
    });
  });

  it("should have valid status", () => {
    mockBankAccounts.forEach((account: BankAccount) => {
      expect(["active", "inactive"]).toContain(account.status);
    });
  });

  it("should have valid date format", () => {
    mockBankAccounts.forEach((account: BankAccount) => {
      expect(account.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(() => new Date(account.createdAt)).not.toThrow();
    });
  });

  it("should have unique IDs", () => {
    const ids = mockBankAccounts.map((a) => a.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have non-empty bank name", () => {
    mockBankAccounts.forEach((account: BankAccount) => {
      expect(account.bankName.trim().length).toBeGreaterThan(0);
    });
  });

  it("should have non-empty account holder name", () => {
    mockBankAccounts.forEach((account: BankAccount) => {
      expect(account.accountHolderName.trim().length).toBeGreaterThan(0);
    });
  });
});
