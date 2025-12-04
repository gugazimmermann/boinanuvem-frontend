import { describe, it, expect, beforeEach } from "vitest";
import {
  getBankAccountById,
  getBankAccountsByCompanyId,
  addBankAccount,
  updateBankAccount,
  deleteBankAccount,
} from "../bank-account.service";
import { mockBankAccounts } from "~/mocks/bank-accounts";
import type { BankAccountFormData } from "~/types";

describe("bank-account.service", () => {
  beforeEach(() => {
    // Reset mock data before each test
    mockBankAccounts.length = 0;
    mockBankAccounts.push(
      {
        id: "bank-1",
        companyId: "company-1",
        bankName: "Banco do Brasil",
        bankCode: "001",
        branch: "1234",
        accountNumber: "12345-6",
        accountType: "checking",
        accountHolderName: "Company 1",
        status: "active",
        createdAt: "2025-01-01",
      },
      {
        id: "bank-2",
        companyId: "company-1",
        bankName: "Bradesco",
        bankCode: "237",
        branch: "5678",
        accountNumber: "78901-2",
        accountType: "savings",
        accountHolderName: "Company 1",
        status: "active",
        createdAt: "2025-01-02",
      },
      {
        id: "bank-3",
        companyId: "company-2",
        bankName: "Caixa Econômica",
        bankCode: "104",
        branch: "9012",
        accountNumber: "34567-8",
        accountType: "checking",
        accountHolderName: "Company 2",
        status: "active",
        createdAt: "2025-01-03",
      }
    );
  });

  describe("getBankAccountById", () => {
    it("should return bank account when ID exists", () => {
      const result = getBankAccountById("bank-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("bank-1");
      expect(result?.bankName).toBe("Banco do Brasil");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getBankAccountById("bank-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getBankAccountById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getBankAccountsByCompanyId", () => {
    it("should return all bank accounts for a company", () => {
      const result = getBankAccountsByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("bank-1");
      expect(result[1]?.id).toBe("bank-2");
    });

    it("should return empty array when company has no bank accounts", () => {
      const result = getBankAccountsByCompanyId("company-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("addBankAccount", () => {
    it("should add a new bank account with generated ID", () => {
      const formData: BankAccountFormData = {
        companyId: "company-1",
        bankName: "Itaú",
        bankCode: "341",
        branch: "2222",
        accountNumber: "11111-1",
        accountType: "checking",
        accountHolderName: "Company 1",
        status: "active",
      };

      const initialLength = mockBankAccounts.length;
      const result = addBankAccount(formData);

      expect(mockBankAccounts).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.companyId).toBe("company-1");
      expect(result.bankName).toBe("Itaú");
      expect(result.createdAt).toBeDefined();
    });

    it("should generate ID with correct prefix", () => {
      const formData: BankAccountFormData = {
        companyId: "company-1",
        bankName: "Itaú",
        bankCode: "341",
        branch: "2222",
        accountNumber: "11111-1",
        accountType: "checking",
        accountHolderName: "Company 1",
        status: "active",
      };

      const result = addBankAccount(formData);
      expect(result.id).toContain("ba0e8400-e29b-41d4-a716");
    });

    it("should use default ID when array is empty", () => {
      mockBankAccounts.length = 0;
      const formData: BankAccountFormData = {
        companyId: "company-1",
        bankName: "Itaú",
        bankCode: "341",
        branch: "2222",
        accountNumber: "11111-1",
        accountType: "checking",
        accountHolderName: "Company 1",
        status: "active",
      };

      const result = addBankAccount(formData);
      expect(result.id).toBe("ba0e8400-e29b-41d4-a716-446655440009");
    });
  });

  describe("updateBankAccount", () => {
    it("should update bank account when ID exists", () => {
      const updateData: Partial<BankAccountFormData> = {
        accountType: "savings",
        status: "inactive",
      };

      const result = updateBankAccount("bank-1", updateData);
      expect(result).toBe(true);

      const updated = mockBankAccounts.find((bank) => bank.id === "bank-1");
      expect(updated?.accountType).toBe("savings");
      expect(updated?.status).toBe("inactive");
    });

    it("should preserve existing fields when updating", () => {
      const original = mockBankAccounts.find((bank) => bank.id === "bank-1");
      const originalCompanyId = original?.companyId;

      const updateData: Partial<BankAccountFormData> = {
        accountType: "savings",
      };

      updateBankAccount("bank-1", updateData);

      const updated = mockBankAccounts.find((bank) => bank.id === "bank-1");
      expect(updated?.companyId).toBe(originalCompanyId);
      expect(updated?.id).toBe("bank-1");
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<BankAccountFormData> = {
        accountType: "savings",
      };

      const result = updateBankAccount("bank-nonexistent", updateData);
      expect(result).toBe(false);
    });
  });

  describe("deleteBankAccount", () => {
    it("should delete bank account when ID exists", () => {
      const initialLength = mockBankAccounts.length;
      const result = deleteBankAccount("bank-1");

      expect(result).toBe(true);
      expect(mockBankAccounts).toHaveLength(initialLength - 1);
      expect(mockBankAccounts.find((bank) => bank.id === "bank-1")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockBankAccounts.length;
      const result = deleteBankAccount("bank-nonexistent");

      expect(result).toBe(false);
      expect(mockBankAccounts).toHaveLength(initialLength);
    });

    it("should delete the correct bank account", () => {
      deleteBankAccount("bank-2");
      expect(mockBankAccounts.find((bank) => bank.id === "bank-2")).toBeUndefined();
      expect(mockBankAccounts.find((bank) => bank.id === "bank-1")).toBeDefined();
      expect(mockBankAccounts.find((bank) => bank.id === "bank-3")).toBeDefined();
    });
  });
});
