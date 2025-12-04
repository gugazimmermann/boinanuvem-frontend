import { describe, it, expect } from "vitest";
import { mockAccountsPayable } from "../accounts-payable";
import { mockCompanies } from "../companies";
import { mockProperties } from "../properties";
import { mockBankAccounts } from "../bank-accounts";
import { AccountsPayableStatus, PaymentMethod, CashFlowCategory } from "~/types";

describe("accounts-payable", () => {
  describe("mockAccountsPayable", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockAccountsPayable)).toBe(true);
    });

    it("should not be empty", () => {
      expect(mockAccountsPayable.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockAccountsPayable.forEach((transaction) => {
        expect(transaction).toHaveProperty("id");
        expect(transaction).toHaveProperty("companyId");
        expect(transaction).toHaveProperty("amount");
        expect(transaction).toHaveProperty("dueDate");
        expect(transaction).toHaveProperty("description");
        expect(transaction).toHaveProperty("category");
        expect(transaction).toHaveProperty("paymentMethod");
        expect(transaction).toHaveProperty("status");
        expect(transaction).toHaveProperty("propertyId");
        expect(transaction).toHaveProperty("createdAt");
      });
    });

    it("should have unique IDs", () => {
      const ids = mockAccountsPayable.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid ID format", () => {
      const idRegex = /^ap0e8400-e29b-41d4-a716-[0-9a-f]{12}$/i;
      mockAccountsPayable.forEach((transaction) => {
        expect(transaction.id).toMatch(idRegex);
      });
    });

    it("should have valid date format", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      mockAccountsPayable.forEach((transaction) => {
        expect(transaction.dueDate).toMatch(dateRegex);
        expect(transaction.createdAt).toMatch(dateRegex);
        if (transaction.paidDate) {
          expect(transaction.paidDate).toMatch(dateRegex);
        }
      });
    });

    it("should have dates within expected range", () => {
      mockAccountsPayable.forEach((transaction) => {
        const dueDate = new Date(transaction.dueDate);
        const createdAt = new Date(transaction.createdAt);
        expect(dueDate.getFullYear()).toBeGreaterThanOrEqual(2020);
        expect(createdAt.getFullYear()).toBeGreaterThanOrEqual(2020);
        if (transaction.paidDate) {
          const paidDate = new Date(transaction.paidDate);
          expect(paidDate.getFullYear()).toBeGreaterThanOrEqual(2020);
        }
      });
    });

    it("should have valid amounts", () => {
      mockAccountsPayable.forEach((transaction) => {
        expect(typeof transaction.amount).toBe("number");
        expect(transaction.amount).toBeGreaterThan(0);
      });
    });

    it("should have valid status", () => {
      const validStatuses = Object.values(AccountsPayableStatus);
      mockAccountsPayable.forEach((transaction) => {
        expect(validStatuses).toContain(transaction.status);
      });
    });

    it("should have valid payment methods", () => {
      const validMethods = Object.values(PaymentMethod);
      mockAccountsPayable.forEach((transaction) => {
        expect(validMethods).toContain(transaction.paymentMethod);
      });
    });

    it("should have valid categories", () => {
      const validCategories = Object.values(CashFlowCategory);
      mockAccountsPayable.forEach((transaction) => {
        expect(validCategories).toContain(transaction.category);
      });
    });

    it("should reference valid company IDs", () => {
      const companyIds = mockCompanies.map((c) => c.id);
      mockAccountsPayable.forEach((transaction) => {
        expect(companyIds).toContain(transaction.companyId);
      });
    });

    it("should reference valid property IDs", () => {
      const propertyIds = mockProperties.map((p) => p.id);
      mockAccountsPayable.forEach((transaction) => {
        expect(propertyIds).toContain(transaction.propertyId);
      });
    });

    it("should have paidDate when status is PAID", () => {
      mockAccountsPayable
        .filter((t) => t.status === AccountsPayableStatus.PAID)
        .forEach((transaction) => {
          expect(transaction.paidDate).toBeDefined();
        });
    });

    it("should have paidAmount when status is PAID or PARTIAL", () => {
      mockAccountsPayable
        .filter(
          (t) =>
            t.status === AccountsPayableStatus.PAID || t.status === AccountsPayableStatus.PARTIAL
        )
        .forEach((transaction) => {
          expect(transaction.paidAmount).toBeDefined();
          expect(transaction.paidAmount).toBeGreaterThan(0);
          expect(transaction.paidAmount).toBeLessThanOrEqual(transaction.amount);
        });
    });

    it("should reference valid bank account IDs when present", () => {
      const bankAccountIds = mockBankAccounts.map((b) => b.id);
      mockAccountsPayable.forEach((transaction) => {
        if (transaction.bankAccountId) {
          expect(bankAccountIds).toContain(transaction.bankAccountId);
        }
      });
    });

    it("should be sorted by due date (descending)", () => {
      for (let i = 1; i < mockAccountsPayable.length; i++) {
        const prev = new Date(mockAccountsPayable[i - 1].dueDate);
        const curr = new Date(mockAccountsPayable[i].dueDate);
        expect(curr.getTime()).toBeLessThanOrEqual(prev.getTime());
      }
    });
  });
});
