import { describe, it, expect } from "vitest";
import { mockAccountsReceivable } from "../accounts-receivable";
import { mockCompanies } from "../companies";
import { mockProperties } from "../properties";
import { mockBankAccounts } from "../bank-accounts";
import { AccountsReceivableStatus, PaymentMethod, CashFlowCategory } from "~/types";

describe("accounts-receivable", () => {
  describe("mockAccountsReceivable", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockAccountsReceivable)).toBe(true);
    });

    it("should not be empty", () => {
      expect(mockAccountsReceivable.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockAccountsReceivable.forEach((transaction) => {
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
      const ids = mockAccountsReceivable.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid ID format", () => {
      const idRegex = /^ar0e8400-e29b-41d4-a716-[0-9a-f]{12}$/i;
      mockAccountsReceivable.forEach((transaction) => {
        expect(transaction.id).toMatch(idRegex);
      });
    });

    it("should have valid date format", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      mockAccountsReceivable.forEach((transaction) => {
        expect(transaction.dueDate).toMatch(dateRegex);
        expect(transaction.createdAt).toMatch(dateRegex);
        if (transaction.paidDate) {
          expect(transaction.paidDate).toMatch(dateRegex);
        }
      });
    });

    it("should have dates within expected range", () => {
      mockAccountsReceivable.forEach((transaction) => {
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
      mockAccountsReceivable.forEach((transaction) => {
        expect(typeof transaction.amount).toBe("number");
        expect(transaction.amount).toBeGreaterThan(0);
      });
    });

    it("should have valid status", () => {
      const validStatuses = Object.values(AccountsReceivableStatus);
      mockAccountsReceivable.forEach((transaction) => {
        expect(validStatuses).toContain(transaction.status);
      });
    });

    it("should have valid payment methods", () => {
      const validMethods = Object.values(PaymentMethod);
      mockAccountsReceivable.forEach((transaction) => {
        expect(validMethods).toContain(transaction.paymentMethod);
      });
    });

    it("should have valid categories", () => {
      const validCategories = Object.values(CashFlowCategory);
      mockAccountsReceivable.forEach((transaction) => {
        expect(validCategories).toContain(transaction.category);
      });
    });

    it("should reference valid company IDs", () => {
      const companyIds = mockCompanies.map((c) => c.id);
      mockAccountsReceivable.forEach((transaction) => {
        expect(companyIds).toContain(transaction.companyId);
      });
    });

    it("should reference valid property IDs", () => {
      const propertyIds = mockProperties.map((p) => p.id);
      mockAccountsReceivable.forEach((transaction) => {
        expect(propertyIds).toContain(transaction.propertyId);
      });
    });

    it("should have paidDate when status is PAID", () => {
      mockAccountsReceivable
        .filter((t) => t.status === AccountsReceivableStatus.PAID)
        .forEach((transaction) => {
          expect(transaction.paidDate).toBeDefined();
        });
    });

    it("should have paidAmount when status is PAID or PARTIAL", () => {
      mockAccountsReceivable
        .filter(
          (t) =>
            t.status === AccountsReceivableStatus.PAID ||
            t.status === AccountsReceivableStatus.PARTIAL
        )
        .forEach((transaction) => {
          expect(transaction.paidAmount).toBeDefined();
          expect(transaction.paidAmount).toBeGreaterThan(0);
          expect(transaction.paidAmount).toBeLessThanOrEqual(transaction.amount);
        });
    });

    it("should reference valid bank account IDs when present", () => {
      const bankAccountIds = mockBankAccounts.map((b) => b.id);
      mockAccountsReceivable.forEach((transaction) => {
        if (transaction.bankAccountId) {
          expect(bankAccountIds).toContain(transaction.bankAccountId);
        }
      });
    });

    it("should have buyerId when present", () => {
      mockAccountsReceivable.forEach((transaction) => {
        if (transaction.buyerId) {
          expect(typeof transaction.buyerId).toBe("string");
          expect(transaction.buyerId.length).toBeGreaterThan(0);
        }
      });
    });

    it("should be sorted by due date (descending)", () => {
      for (let i = 1; i < mockAccountsReceivable.length; i++) {
        const prev = new Date(mockAccountsReceivable[i - 1].dueDate);
        const curr = new Date(mockAccountsReceivable[i].dueDate);
        expect(curr.getTime()).toBeLessThanOrEqual(prev.getTime());
      }
    });
  });
});
