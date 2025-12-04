import { describe, it, expect } from "vitest";
import { mockBankAccounts } from "../bank-accounts";
import { mockCompanies } from "../companies";

describe("bank-accounts", () => {
  describe("mockBankAccounts", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockBankAccounts)).toBe(true);
    });

    it("should not be empty", () => {
      expect(mockBankAccounts.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockBankAccounts.forEach((account) => {
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
      });
    });

    it("should have unique IDs", () => {
      const ids = mockBankAccounts.map((account) => account.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid UUID format for IDs", () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      mockBankAccounts.forEach((account) => {
        expect(account.id).toMatch(uuidRegex);
      });
    });

    it("should have valid date format", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      mockBankAccounts.forEach((account) => {
        expect(account.createdAt).toMatch(dateRegex);
      });
    });

    it("should have dates within expected range", () => {
      mockBankAccounts.forEach((account) => {
        const date = new Date(account.createdAt);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2020);
        expect(date.getFullYear()).toBeLessThanOrEqual(2025);
      });
    });

    it("should have valid account types", () => {
      const validTypes = ["checking", "savings"];
      mockBankAccounts.forEach((account) => {
        expect(validTypes).toContain(account.accountType);
      });
    });

    it("should have valid status", () => {
      const validStatuses = ["active", "inactive"];
      mockBankAccounts.forEach((account) => {
        expect(validStatuses).toContain(account.status);
      });
    });

    it("should reference valid company IDs", () => {
      const companyIds = mockCompanies.map((c) => c.id);
      mockBankAccounts.forEach((account) => {
        expect(companyIds).toContain(account.companyId);
      });
    });

    it("should have valid bank codes", () => {
      mockBankAccounts.forEach((account) => {
        expect(typeof account.bankCode).toBe("string");
        expect(account.bankCode.length).toBeGreaterThan(0);
      });
    });

    it("should have valid branch numbers", () => {
      mockBankAccounts.forEach((account) => {
        expect(typeof account.branch).toBe("string");
        expect(account.branch.length).toBeGreaterThan(0);
      });
    });

    it("should have valid account numbers", () => {
      mockBankAccounts.forEach((account) => {
        expect(typeof account.accountNumber).toBe("string");
        expect(account.accountNumber.length).toBeGreaterThan(0);
      });
    });
  });
});
