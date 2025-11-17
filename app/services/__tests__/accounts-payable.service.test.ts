import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAccountsPayableById,
  getAccountsPayableByCompanyId,
  getAccountsPayableBySupplierId,
  addAccountsPayable,
  updateAccountsPayable,
  deleteAccountsPayable,
} from "../accounts-payable.service";
import { mockAccountsPayable } from "~/mocks/accounts-payable";
import type { AccountsPayableFormData } from "~/types";
import { AccountsPayableStatus, PaymentMethod, CashFlowCategory } from "~/types";

vi.mock("~/mocks/accounts-payable", () => ({
  mockAccountsPayable: [],
}));

describe("accounts-payable.service", () => {
  beforeEach(() => {
    mockAccountsPayable.length = 0;
    mockAccountsPayable.push(
      {
        id: "ap0e8400-e29b-41d4-a716-446655440010",
        companyId: "company-1",
        supplierId: "supplier-1",
        amount: 5000.0,
        dueDate: "2025-11-20",
        description: "Test transaction 1",
        category: CashFlowCategory.FEED,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        status: AccountsPayableStatus.UNPAID,
        referenceNumber: "REF-001",
        propertyId: "property-1",
        createdAt: "2025-11-05",
      },
      {
        id: "ap0e8400-e29b-41d4-a716-446655440011",
        companyId: "company-1",
        supplierId: "supplier-1",
        amount: 3200.0,
        dueDate: "2025-11-10",
        description: "Test transaction 2",
        category: CashFlowCategory.MEDICINES,
        paymentMethod: PaymentMethod.PIX,
        status: AccountsPayableStatus.PAID,
        paidDate: "2025-11-08",
        paidAmount: 3200.0,
        propertyId: "property-1",
        createdAt: "2025-11-01",
      },
      {
        id: "ap0e8400-e29b-41d4-a716-446655440012",
        companyId: "company-2",
        supplierId: "supplier-2",
        amount: 2800.0,
        dueDate: "2025-11-25",
        description: "Test transaction 3",
        category: CashFlowCategory.LABOR,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        status: AccountsPayableStatus.UNPAID,
        propertyId: "property-2",
        createdAt: "2025-11-08",
      }
    );
  });

  describe("getAccountsPayableById", () => {
    it("should return transaction when ID exists", () => {
      const result = getAccountsPayableById("ap0e8400-e29b-41d4-a716-446655440010");
      expect(result).toBeDefined();
      expect(result?.description).toBe("Test transaction 1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getAccountsPayableById("nonexistent-id");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getAccountsPayableById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getAccountsPayableByCompanyId", () => {
    it("should return transactions for specific company", () => {
      const result = getAccountsPayableByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result.every((transaction) => transaction.companyId === "company-1")).toBe(true);
    });

    it("should return empty array when company has no transactions", () => {
      const result = getAccountsPayableByCompanyId("company-3");
      expect(result).toHaveLength(0);
    });
  });

  describe("getAccountsPayableBySupplierId", () => {
    it("should return transactions for specific supplier", () => {
      const result = getAccountsPayableBySupplierId("supplier-1");
      expect(result).toHaveLength(2);
      expect(result.every((transaction) => transaction.supplierId === "supplier-1")).toBe(true);
    });

    it("should return empty array when supplier has no transactions", () => {
      const result = getAccountsPayableBySupplierId("supplier-3");
      expect(result).toHaveLength(0);
    });
  });

  describe("addAccountsPayable", () => {
    it("should add new transaction", () => {
      const formData: AccountsPayableFormData = {
        companyId: "company-1",
        supplierId: "supplier-1",
        amount: 1000.0,
        dueDate: "2025-12-01",
        description: "New transaction",
        category: CashFlowCategory.FEED,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        status: AccountsPayableStatus.UNPAID,
        propertyId: "property-1",
      };

      const initialLength = mockAccountsPayable.length;
      const result = addAccountsPayable(formData);

      expect(mockAccountsPayable).toHaveLength(initialLength + 1);
      expect(result.description).toBe("New transaction");
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });
  });

  describe("updateAccountsPayable", () => {
    it("should update existing transaction", () => {
      const result = updateAccountsPayable("ap0e8400-e29b-41d4-a716-446655440010", {
        description: "Updated transaction",
      });

      expect(result).toBe(true);
      const updated = mockAccountsPayable.find(
        (t) => t.id === "ap0e8400-e29b-41d4-a716-446655440010"
      );
      expect(updated?.description).toBe("Updated transaction");
    });

    it("should return false when transaction does not exist", () => {
      const result = updateAccountsPayable("nonexistent-id", {
        description: "Updated transaction",
      });

      expect(result).toBe(false);
    });
  });

  describe("deleteAccountsPayable", () => {
    it("should delete existing transaction", () => {
      const initialLength = mockAccountsPayable.length;
      const result = deleteAccountsPayable("ap0e8400-e29b-41d4-a716-446655440010");

      expect(result).toBe(true);
      expect(mockAccountsPayable).toHaveLength(initialLength - 1);
    });

    it("should return false when transaction does not exist", () => {
      const initialLength = mockAccountsPayable.length;
      const result = deleteAccountsPayable("nonexistent-id");

      expect(result).toBe(false);
      expect(mockAccountsPayable).toHaveLength(initialLength);
    });
  });
});
