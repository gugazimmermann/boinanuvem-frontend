import { describe, it, expect } from "vitest";
import { mockCashFlow } from "../cash-flow";
import { mockCompanies } from "../companies";
import { mockProperties } from "../properties";
import { mockBankAccounts } from "../bank-accounts";
import { CashFlowCategory, PaymentMethod } from "~/types";

describe("cash-flow", () => {
  describe("mockCashFlow", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockCashFlow)).toBe(true);
    });

    it("should not be empty", () => {
      expect(mockCashFlow.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockCashFlow.forEach((transaction) => {
        expect(transaction).toHaveProperty("id");
        expect(transaction).toHaveProperty("companyId");
        expect(transaction).toHaveProperty("type");
        expect(transaction).toHaveProperty("amount");
        expect(transaction).toHaveProperty("date");
        expect(transaction).toHaveProperty("description");
        expect(transaction).toHaveProperty("category");
        expect(transaction).toHaveProperty("paymentMethod");
        expect(transaction).toHaveProperty("status");
        expect(transaction).toHaveProperty("propertyId");
        expect(transaction).toHaveProperty("createdAt");
      });
    });

    it("should have unique IDs", () => {
      const ids = mockCashFlow.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid UUID format for IDs", () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      mockCashFlow.forEach((transaction) => {
        expect(transaction.id).toMatch(uuidRegex);
      });
    });

    it("should have valid date format", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      mockCashFlow.forEach((transaction) => {
        expect(transaction.date).toMatch(dateRegex);
        expect(transaction.createdAt).toMatch(dateRegex);
        if (transaction.paymentDate) {
          expect(transaction.paymentDate).toMatch(dateRegex);
        }
      });
    });

    it("should have dates within expected range", () => {
      mockCashFlow.forEach((transaction) => {
        const date = new Date(transaction.date);
        const createdAt = new Date(transaction.createdAt);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2020);
        expect(createdAt.getFullYear()).toBeGreaterThanOrEqual(2020);
        if (transaction.paymentDate) {
          const paymentDate = new Date(transaction.paymentDate);
          expect(paymentDate.getFullYear()).toBeGreaterThanOrEqual(2020);
        }
      });
    });

    it("should have valid transaction types", () => {
      const validTypes = ["income", "expense"];
      mockCashFlow.forEach((transaction) => {
        expect(validTypes).toContain(transaction.type);
      });
    });

    it("should have valid amounts", () => {
      mockCashFlow.forEach((transaction) => {
        expect(typeof transaction.amount).toBe("number");
        expect(transaction.amount).toBeGreaterThan(0);
      });
    });

    it("should have valid status", () => {
      const validStatuses = ["completed", "pending", "cancelled"];
      mockCashFlow.forEach((transaction) => {
        expect(validStatuses).toContain(transaction.status);
      });
    });

    it("should have valid payment methods", () => {
      const validMethods = Object.values(PaymentMethod);
      mockCashFlow.forEach((transaction) => {
        expect(validMethods).toContain(transaction.paymentMethod);
      });
    });

    it("should have valid categories", () => {
      const validCategories = Object.values(CashFlowCategory);
      mockCashFlow.forEach((transaction) => {
        expect(validCategories).toContain(transaction.category);
      });
    });

    it("should reference valid company IDs", () => {
      const companyIds = mockCompanies.map((c) => c.id);
      mockCashFlow.forEach((transaction) => {
        expect(companyIds).toContain(transaction.companyId);
      });
    });

    it("should reference valid property IDs", () => {
      const propertyIds = mockProperties.map((p) => p.id);
      mockCashFlow.forEach((transaction) => {
        expect(propertyIds).toContain(transaction.propertyId);
      });
    });

    it("should reference valid bank account IDs when present", () => {
      const bankAccountIds = mockBankAccounts.map((b) => b.id);
      mockCashFlow.forEach((transaction) => {
        if (transaction.bankAccountId) {
          expect(bankAccountIds).toContain(transaction.bankAccountId);
        }
      });
    });

    it("should have buyerId for income transactions", () => {
      mockCashFlow
        .filter((t) => t.type === "income")
        .forEach((transaction) => {
          if (
            transaction.category === CashFlowCategory.CATTLE_SALES ||
            transaction.category === CashFlowCategory.MILK_SALES
          ) {
            expect(transaction.buyerId).toBeDefined();
          }
        });
    });

    it("should be sorted by date (descending)", () => {
      for (let i = 1; i < mockCashFlow.length; i++) {
        const prev = new Date(mockCashFlow[i - 1].date);
        const curr = new Date(mockCashFlow[i].date);
        expect(curr.getTime()).toBeLessThanOrEqual(prev.getTime());
      }
    });
  });
});
