import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAccountsReceivableById,
  getAccountsReceivableByCompanyId,
  getAccountsReceivableByBuyerId,
  addAccountsReceivable,
  updateAccountsReceivable,
  deleteAccountsReceivable,
} from "../accounts-receivable.service";
import { mockAccountsReceivable } from "~/mocks/accounts-receivable";
import type { AccountsReceivableFormData } from "~/types";
import { AccountsReceivableStatus, PaymentMethod, CashFlowCategory } from "~/types";

vi.mock("~/mocks/accounts-receivable", () => ({
  mockAccountsReceivable: [],
}));

describe("accounts-receivable.service", () => {
  beforeEach(() => {
    mockAccountsReceivable.length = 0;
    mockAccountsReceivable.push(
      {
        id: "ar0e8400-e29b-41d4-a716-446655440010",
        companyId: "company-1",
        buyerId: "buyer-1",
        amount: 45000.0,
        dueDate: "2025-11-25",
        description: "Test receivable 1",
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        status: AccountsReceivableStatus.UNPAID,
        referenceNumber: "NF-001",
        propertyId: "property-1",
        createdAt: "2025-11-05",
      },
      {
        id: "ar0e8400-e29b-41d4-a716-446655440011",
        companyId: "company-1",
        buyerId: "buyer-1",
        amount: 28000.0,
        dueDate: "2025-11-12",
        description: "Test receivable 2",
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.PIX,
        status: AccountsReceivableStatus.PAID,
        paidDate: "2025-11-10",
        paidAmount: 28000.0,
        propertyId: "property-2",
        createdAt: "2025-11-01",
      },
      {
        id: "ar0e8400-e29b-41d4-a716-446655440012",
        companyId: "company-2",
        buyerId: "buyer-2",
        amount: 22000.0,
        dueDate: "2025-11-30",
        description: "Test receivable 3",
        category: CashFlowCategory.MILK_SALES,
        paymentMethod: PaymentMethod.CHECK,
        status: AccountsReceivableStatus.UNPAID,
        propertyId: "property-1",
        createdAt: "2025-11-08",
      }
    );
  });

  describe("getAccountsReceivableById", () => {
    it("should return transaction when ID exists", () => {
      const result = getAccountsReceivableById("ar0e8400-e29b-41d4-a716-446655440010");
      expect(result).toBeDefined();
      expect(result?.description).toBe("Test receivable 1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getAccountsReceivableById("nonexistent-id");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getAccountsReceivableById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getAccountsReceivableByCompanyId", () => {
    it("should return transactions for specific company", () => {
      const result = getAccountsReceivableByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result.every((transaction) => transaction.companyId === "company-1")).toBe(true);
    });

    it("should return empty array when company has no transactions", () => {
      const result = getAccountsReceivableByCompanyId("company-3");
      expect(result).toHaveLength(0);
    });
  });

  describe("getAccountsReceivableByBuyerId", () => {
    it("should return transactions for specific buyer", () => {
      const result = getAccountsReceivableByBuyerId("buyer-1");
      expect(result).toHaveLength(2);
      expect(result.every((transaction) => transaction.buyerId === "buyer-1")).toBe(true);
    });

    it("should return empty array when buyer has no transactions", () => {
      const result = getAccountsReceivableByBuyerId("buyer-3");
      expect(result).toHaveLength(0);
    });
  });

  describe("addAccountsReceivable", () => {
    it("should add new transaction", () => {
      const formData: AccountsReceivableFormData = {
        companyId: "company-1",
        buyerId: "buyer-1",
        amount: 15000.0,
        dueDate: "2025-12-01",
        description: "New receivable",
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        status: AccountsReceivableStatus.UNPAID,
        propertyId: "property-1",
      };

      const initialLength = mockAccountsReceivable.length;
      const result = addAccountsReceivable(formData);

      expect(mockAccountsReceivable).toHaveLength(initialLength + 1);
      expect(result.description).toBe("New receivable");
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });
  });

  describe("updateAccountsReceivable", () => {
    it("should update existing transaction", () => {
      const result = updateAccountsReceivable("ar0e8400-e29b-41d4-a716-446655440010", {
        description: "Updated receivable",
      });

      expect(result).toBe(true);
      const updated = mockAccountsReceivable.find(
        (t) => t.id === "ar0e8400-e29b-41d4-a716-446655440010"
      );
      expect(updated?.description).toBe("Updated receivable");
    });

    it("should return false when transaction does not exist", () => {
      const result = updateAccountsReceivable("nonexistent-id", {
        description: "Updated receivable",
      });

      expect(result).toBe(false);
    });
  });

  describe("deleteAccountsReceivable", () => {
    it("should delete existing transaction", () => {
      const initialLength = mockAccountsReceivable.length;
      const result = deleteAccountsReceivable("ar0e8400-e29b-41d4-a716-446655440010");

      expect(result).toBe(true);
      expect(mockAccountsReceivable).toHaveLength(initialLength - 1);
    });

    it("should return false when transaction does not exist", () => {
      const initialLength = mockAccountsReceivable.length;
      const result = deleteAccountsReceivable("nonexistent-id");

      expect(result).toBe(false);
      expect(mockAccountsReceivable).toHaveLength(initialLength);
    });
  });
});
