import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiError } from "../api-client";
import {
  getBankAccountById,
  getBankAccountsByCompanyId,
  addBankAccount,
  updateBankAccount,
  deleteBankAccount,
} from "../bank-account.service";

vi.mock("../api-client", async () => {
  const actual = await vi.importActual("../api-client");
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

import { apiClient } from "../api-client";

const mockBankAccounts = [
  {
    id: "bank-1",
    code: "001",
    name: "Bank Account 1",
    companyId: "company-1",
    status: "active",
    bankName: "Test Bank",
    bankCode: "001",
    branch: "0001",
    accountNumber: "12345-6",
    accountHolderName: "Test Account Holder",
    accountType: "checking" as const,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "bank-2",
    code: "002",
    name: "Bank Account 2",
    companyId: "company-1",
    status: "active",
    bankName: "Test Bank 2",
    bankCode: "002",
    branch: "0002",
    accountNumber: "67890-1",
    accountHolderName: "Test Account Holder 2",
    accountType: "savings" as const,
    createdAt: "2024-01-01T00:00:00Z",
  },
];

describe("bank-account.service", () => {
  const mockGet = apiClient.get as ReturnType<typeof vi.fn>;
  const mockPost = apiClient.post as ReturnType<typeof vi.fn>;
  const mockPut = apiClient.put as ReturnType<typeof vi.fn>;
  const mockDelete = apiClient.delete as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBankAccountById", () => {
    it("should find bank account by id", async () => {
      mockGet.mockResolvedValue(mockBankAccounts[0]);

      const result = await getBankAccountById("bank-1");

      expect(mockGet).toHaveBeenCalledWith("/bank-accounts/bank-1");
      expect(result).toEqual(mockBankAccounts[0]);
    });

    it("should return undefined when not found", async () => {
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));

      const result = await getBankAccountById("nonexistent");

      expect(result).toBeUndefined();
    });

    it("should return undefined when id is undefined", async () => {
      const result = await getBankAccountById(undefined);
      expect(result).toBeUndefined();
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should handle 403 error", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      const result = await getBankAccountById("bank-1");

      expect(result).toBeUndefined();
    });
  });

  describe("getBankAccountsByCompanyId", () => {
    it("should find bank accounts by company id", async () => {
      mockGet.mockResolvedValue(mockBankAccounts);

      const result = await getBankAccountsByCompanyId("company-1");

      expect(mockGet).toHaveBeenCalledWith("/bank-accounts");
      expect(result).toHaveLength(2);
      expect(result).toEqual(mockBankAccounts);
    });

    it("should return empty array when no matches", async () => {
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));

      const result = await getBankAccountsByCompanyId("nonexistent");

      expect(result).toEqual([]);
    });
  });

  describe("addBankAccount", () => {
    it("should create new bank account", async () => {
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

      const createdAccount = {
        id: "bank-3",
        ...formData,
        createdAt: "2024-01-01T00:00:00Z",
      };

      mockPost.mockResolvedValue(createdAccount);

      const result = await addBankAccount(formData);

      expect(mockPost).toHaveBeenCalledWith("/bank-accounts", {
        bankName: formData.bankName,
        bankCode: formData.bankCode,
        branch: formData.branch,
        accountNumber: formData.accountNumber,
        accountType: formData.accountType,
        accountHolderName: formData.accountHolderName,
        status: formData.status,
      });
      expect(result.id).toBeDefined();
      expect(result.code).toBe("003");
      expect(result.name).toBe("New Bank Account");
    });
  });

  describe("updateBankAccount", () => {
    it("should update bank account", async () => {
      const updateData = { bankName: "Updated Bank Name" };
      const updatedAccount = {
        ...mockBankAccounts[0],
        bankName: "Updated Bank Name",
      };

      mockPut.mockResolvedValue(updatedAccount);

      const result = await updateBankAccount("bank-1", updateData);

      expect(mockPut).toHaveBeenCalledWith("/bank-accounts/bank-1", updateData);
      expect(result).toEqual(updatedAccount);
      expect(result.bankName).toBe("Updated Bank Name");
    });
  });

  describe("deleteBankAccount", () => {
    it("should delete bank account", async () => {
      mockDelete.mockResolvedValue(undefined);

      await deleteBankAccount("bank-1");

      expect(mockDelete).toHaveBeenCalledWith("/bank-accounts/bank-1");
    });
  });
});
