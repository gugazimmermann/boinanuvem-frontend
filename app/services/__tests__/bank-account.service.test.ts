import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getBankAccountById,
  getBankAccountsByCompanyId,
  addBankAccount,
  updateBankAccount,
  deleteBankAccount,
} from "../bank-account.service";

vi.mock("~/mocks/bank-accounts", () => ({
  mockBankAccounts: [
    {
      id: "bank-1",
      code: "001",
      name: "Bank Account 1",
      companyId: "company-1",
      status: "active",
    },
    {
      id: "bank-2",
      code: "002",
      name: "Bank Account 2",
      companyId: "company-1",
      status: "active",
    },
  ],
}));

import { mockBankAccounts } from "~/mocks/bank-accounts";

describe("bank-account.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBankAccountById", () => {
    it("should find bank account by id", () => {
      const result = getBankAccountById("bank-1");
      expect(result).toEqual(mockBankAccounts[0]);
    });

    it("should return undefined when not found", () => {
      const result = getBankAccountById("nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("getBankAccountsByCompanyId", () => {
    it("should find bank accounts by company id", () => {
      const result = getBankAccountsByCompanyId("company-1");
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no matches", () => {
      const result = getBankAccountsByCompanyId("nonexistent");
      expect(result).toEqual([]);
    });
  });

  describe("addBankAccount", () => {
    it("should create new bank account", () => {
      const formData = {
        code: "003",
        name: "New Bank Account",
        companyId: "company-1",
        bankName: "Test Bank",
        bankCode: "001",
        branch: "0001",
        accountNumber: "12345-6",
        accountHolderName: "Test Account Holder",
        accountType: "checking" as const,
        status: "active" as const,
      };

      const result = addBankAccount(formData);

      expect(result.id).toBeDefined();
      expect(result.code).toBe("003");
      expect(result.name).toBe("New Bank Account");
      expect(mockBankAccounts).toContain(result);
    });
  });

  describe("updateBankAccount", () => {
    it("should update bank account", () => {
      const updateData = { bankName: "Updated Bank Name" };
      const result = updateBankAccount("bank-1", updateData);

      expect(result).toBe(true);
      expect(mockBankAccounts[0].bankName).toBe("Updated Bank Name");
    });

    it("should return false when bank account not found", () => {
      const result = updateBankAccount("nonexistent", { bankName: "Updated" });
      expect(result).toBe(false);
    });
  });

  describe("deleteBankAccount", () => {
    it("should delete bank account", () => {
      const initialLength = mockBankAccounts.length;
      const result = deleteBankAccount("bank-1");

      expect(result).toBe(true);
      expect(mockBankAccounts).toHaveLength(initialLength - 1);
      expect(mockBankAccounts.find((b) => b.id === "bank-1")).toBeUndefined();
    });

    it("should return false when bank account not found", () => {
      const result = deleteBankAccount("nonexistent");
      expect(result).toBe(false);
    });
  });
});
