import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getBankAccountById,
  getBankAccountsByCompanyId,
  addBankAccount,
  updateBankAccount,
  deleteBankAccount,
} from "../bank-account.service";
import { mockBankAccounts } from "~/mocks/bank-accounts";
import type { BankAccountFormData } from "~/types";

vi.mock("~/mocks/bank-accounts", () => ({
  mockBankAccounts: [],
}));

describe("bank-account.service", () => {
  beforeEach(() => {
    mockBankAccounts.length = 0;
    mockBankAccounts.push(
      {
        id: "ba0e8400-e29b-41d4-a716-446655440010",
        companyId: "company-1",
        bankName: "Banco do Brasil",
        bankCode: "001",
        branch: "1234",
        accountNumber: "12345-6",
        accountType: "checking",
        accountHolderName: "Test Company",
        status: "active",
        createdAt: "2025-01-01",
      },
      {
        id: "ba0e8400-e29b-41d4-a716-446655440011",
        companyId: "company-1",
        bankName: "Banco Bradesco",
        bankCode: "237",
        branch: "5678",
        accountNumber: "98765-4",
        accountType: "savings",
        accountHolderName: "Test Company",
        status: "active",
        createdAt: "2025-01-15",
      },
      {
        id: "ba0e8400-e29b-41d4-a716-446655440012",
        companyId: "company-2",
        bankName: "Caixa Econômica Federal",
        bankCode: "104",
        branch: "9012",
        accountNumber: "54321-0",
        accountType: "checking",
        accountHolderName: "Another Company",
        status: "inactive",
        createdAt: "2025-02-01",
      }
    );
  });

  describe("getBankAccountById", () => {
    it("should return bank account when ID exists", () => {
      const result = getBankAccountById("ba0e8400-e29b-41d4-a716-446655440010");
      expect(result).toBeDefined();
      expect(result?.bankName).toBe("Banco do Brasil");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getBankAccountById("nonexistent-id");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getBankAccountById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getBankAccountsByCompanyId", () => {
    it("should return bank accounts for specific company", () => {
      const result = getBankAccountsByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result.every((account) => account.companyId === "company-1")).toBe(true);
    });

    it("should return empty array when company has no bank accounts", () => {
      const result = getBankAccountsByCompanyId("company-3");
      expect(result).toHaveLength(0);
    });
  });

  describe("addBankAccount", () => {
    it("should add new bank account", () => {
      const formData: BankAccountFormData = {
        companyId: "company-1",
        bankName: "Itaú",
        bankCode: "341",
        branch: "1111",
        accountNumber: "11111-1",
        accountType: "checking",
        accountHolderName: "Test Company",
        status: "active",
      };

      const initialLength = mockBankAccounts.length;
      const result = addBankAccount(formData);

      expect(mockBankAccounts).toHaveLength(initialLength + 1);
      expect(result.bankName).toBe("Itaú");
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });
  });

  describe("updateBankAccount", () => {
    it("should update existing bank account", () => {
      const result = updateBankAccount("ba0e8400-e29b-41d4-a716-446655440010", {
        bankName: "Updated Bank",
      });

      expect(result).toBe(true);
      const updated = mockBankAccounts.find(
        (ba) => ba.id === "ba0e8400-e29b-41d4-a716-446655440010"
      );
      expect(updated?.bankName).toBe("Updated Bank");
    });

    it("should return false when bank account does not exist", () => {
      const result = updateBankAccount("nonexistent-id", {
        bankName: "Updated Bank",
      });

      expect(result).toBe(false);
    });
  });

  describe("deleteBankAccount", () => {
    it("should delete existing bank account", () => {
      const initialLength = mockBankAccounts.length;
      const result = deleteBankAccount("ba0e8400-e29b-41d4-a716-446655440010");

      expect(result).toBe(true);
      expect(mockBankAccounts).toHaveLength(initialLength - 1);
    });

    it("should return false when bank account does not exist", () => {
      const initialLength = mockBankAccounts.length;
      const result = deleteBankAccount("nonexistent-id");

      expect(result).toBe(false);
      expect(mockBankAccounts).toHaveLength(initialLength);
    });
  });
});
