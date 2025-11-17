import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getCashFlowById,
  getCashFlowByCompanyId,
  getCashFlowByBankAccountId,
  addCashFlow,
  updateCashFlow,
  deleteCashFlow,
} from "../cash-flow.service";
import { mockCashFlow } from "~/mocks/cash-flow";
import type { CashFlowFormData } from "~/types";
import { PaymentMethod, CashFlowCategory } from "~/types";

vi.mock("~/mocks/cash-flow", () => ({
  mockCashFlow: [],
}));

describe("cash-flow.service", () => {
  beforeEach(() => {
    mockCashFlow.length = 0;
    mockCashFlow.push(
      {
        id: "cc0e8400-e29b-41d4-a716-446655440010",
        companyId: "company-1",
        type: "income",
        amount: 50000.0,
        date: "2025-11-05",
        description: "Test income 1",
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        status: "completed",
        buyerId: "buyer-1",
        paymentDate: "2025-11-05",
        referenceNumber: "VEN-001",
        bankAccountId: "bank-1",
        propertyId: "property-1",
        createdAt: "2025-11-05",
      },
      {
        id: "cc0e8400-e29b-41d4-a716-446655440011",
        companyId: "company-1",
        type: "expense",
        amount: 3500.0,
        date: "2025-11-10",
        description: "Test expense 1",
        category: CashFlowCategory.FEED,
        paymentMethod: PaymentMethod.PIX,
        status: "completed",
        supplierId: "supplier-1",
        paymentDate: "2025-11-10",
        referenceNumber: "DESP-001",
        bankAccountId: "bank-1",
        propertyId: "property-1",
        createdAt: "2025-11-10",
      },
      {
        id: "cc0e8400-e29b-41d4-a716-446655440012",
        companyId: "company-2",
        type: "income",
        amount: 32000.0,
        date: "2025-11-18",
        description: "Test income 2",
        category: CashFlowCategory.MILK_SALES,
        paymentMethod: PaymentMethod.PIX,
        status: "completed",
        buyerId: "buyer-2",
        paymentDate: "2025-11-18",
        bankAccountId: "bank-2",
        propertyId: "property-2",
        createdAt: "2025-11-18",
      }
    );
  });

  describe("getCashFlowById", () => {
    it("should return transaction when ID exists", () => {
      const result = getCashFlowById("cc0e8400-e29b-41d4-a716-446655440010");
      expect(result).toBeDefined();
      expect(result?.description).toBe("Test income 1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getCashFlowById("nonexistent-id");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getCashFlowById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getCashFlowByCompanyId", () => {
    it("should return transactions for specific company", () => {
      const result = getCashFlowByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result.every((transaction) => transaction.companyId === "company-1")).toBe(true);
    });

    it("should return empty array when company has no transactions", () => {
      const result = getCashFlowByCompanyId("company-3");
      expect(result).toHaveLength(0);
    });
  });

  describe("getCashFlowByBankAccountId", () => {
    it("should return transactions for specific bank account", () => {
      const result = getCashFlowByBankAccountId("bank-1");
      expect(result).toHaveLength(2);
      expect(result.every((transaction) => transaction.bankAccountId === "bank-1")).toBe(true);
    });

    it("should return empty array when bank account has no transactions", () => {
      const result = getCashFlowByBankAccountId("bank-3");
      expect(result).toHaveLength(0);
    });
  });

  describe("addCashFlow", () => {
    it("should add new transaction", () => {
      const formData: CashFlowFormData = {
        companyId: "company-1",
        type: "income",
        amount: 15000.0,
        date: "2025-12-01",
        description: "New cash flow",
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        status: "completed",
        buyerId: "buyer-1",
        bankAccountId: "bank-1",
        propertyId: "property-1",
      };

      const initialLength = mockCashFlow.length;
      const result = addCashFlow(formData);

      expect(mockCashFlow).toHaveLength(initialLength + 1);
      expect(result.description).toBe("New cash flow");
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });
  });

  describe("updateCashFlow", () => {
    it("should update existing transaction", () => {
      const result = updateCashFlow("cc0e8400-e29b-41d4-a716-446655440010", {
        description: "Updated cash flow",
      });

      expect(result).toBe(true);
      const updated = mockCashFlow.find((t) => t.id === "cc0e8400-e29b-41d4-a716-446655440010");
      expect(updated?.description).toBe("Updated cash flow");
    });

    it("should return false when transaction does not exist", () => {
      const result = updateCashFlow("nonexistent-id", {
        description: "Updated cash flow",
      });

      expect(result).toBe(false);
    });
  });

  describe("deleteCashFlow", () => {
    it("should delete existing transaction", () => {
      const initialLength = mockCashFlow.length;
      const result = deleteCashFlow("cc0e8400-e29b-41d4-a716-446655440010");

      expect(result).toBe(true);
      expect(mockCashFlow).toHaveLength(initialLength - 1);
    });

    it("should return false when transaction does not exist", () => {
      const initialLength = mockCashFlow.length;
      const result = deleteCashFlow("nonexistent-id");

      expect(result).toBe(false);
      expect(mockCashFlow).toHaveLength(initialLength);
    });
  });
});
