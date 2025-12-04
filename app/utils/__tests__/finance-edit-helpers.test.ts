import { describe, it, expect } from "vitest";
import {
  mapAccountsReceivableToFormData,
  mapAccountsPayableToFormData,
} from "../finance-edit-helpers";
import { CashFlowCategory, PaymentMethod } from "~/types";
import { AccountsReceivableStatus, AccountsPayableStatus } from "~/types";
import type { AccountsReceivable, AccountsPayable } from "~/types";

describe("finance-edit-helpers", () => {
  describe("mapAccountsReceivableToFormData", () => {
    it("should map AccountsReceivable to form data with all fields", () => {
      const transaction: AccountsReceivable = {
        id: "ar-1",
        companyId: "company-1",
        buyerId: "buyer-1",
        amount: 1000,
        dueDate: "2024-12-31",
        description: "Sale payment",
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        status: AccountsReceivableStatus.UNPAID,
        paidDate: "2024-12-01",
        paidAmount: 500,
        referenceNumber: "REF123",
        bankAccountId: "bank-1",
        propertyId: "prop-1",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };

      const result = mapAccountsReceivableToFormData(transaction);

      expect(result).toEqual({
        buyerId: "buyer-1",
        amount: 1000,
        dueDate: "2024-12-31",
        description: "Sale payment",
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        status: AccountsReceivableStatus.UNPAID,
        paidDate: "2024-12-01",
        paidAmount: 500,
        referenceNumber: "REF123",
        bankAccountId: "bank-1",
        propertyId: "prop-1",
      });
    });

    it("should map AccountsReceivable with optional fields as empty strings", () => {
      const transaction: AccountsReceivable = {
        id: "ar-1",
        companyId: "company-1",
        buyerId: undefined,
        amount: 1000,
        dueDate: "2024-12-31",
        description: "Sale payment",
        status: AccountsReceivableStatus.UNPAID,
        paidAmount: 0,
        propertyId: "prop-1",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };

      const result = mapAccountsReceivableToFormData(transaction);

      expect(result?.buyerId).toBe("");
      expect(result?.category).toBe(CashFlowCategory.CATTLE_SALES);
      expect(result?.paymentMethod).toBe(PaymentMethod.CASH);
      expect(result?.paidDate).toBe("");
      expect(result?.referenceNumber).toBe("");
      expect(result?.bankAccountId).toBe("");
    });

    it("should return undefined when transaction is undefined", () => {
      const result = mapAccountsReceivableToFormData(undefined);
      expect(result).toBeUndefined();
    });

    it("should use default category when category is missing", () => {
      const transaction: AccountsReceivable = {
        id: "ar-1",
        companyId: "company-1",
        amount: 1000,
        dueDate: "2024-12-31",
        description: "Sale",
        status: AccountsReceivableStatus.UNPAID,
        propertyId: "prop-1",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };

      const result = mapAccountsReceivableToFormData(transaction);
      expect(result?.category).toBe(CashFlowCategory.CATTLE_SALES);
    });

    it("should use default payment method when paymentMethod is missing", () => {
      const transaction: AccountsReceivable = {
        id: "ar-1",
        companyId: "company-1",
        amount: 1000,
        dueDate: "2024-12-31",
        description: "Sale",
        status: AccountsReceivableStatus.UNPAID,
        propertyId: "prop-1",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };

      const result = mapAccountsReceivableToFormData(transaction);
      expect(result?.paymentMethod).toBe(PaymentMethod.CASH);
    });
  });

  describe("mapAccountsPayableToFormData", () => {
    it("should map AccountsPayable to form data with all fields", () => {
      const transaction: AccountsPayable = {
        id: "ap-1",
        companyId: "company-1",
        supplierId: "supplier-1",
        employeeId: "employee-1",
        serviceProviderId: "sp-1",
        amount: 2000,
        dueDate: "2024-12-31",
        description: "Purchase payment",
        category: CashFlowCategory.FEED,
        paymentMethod: PaymentMethod.CHECK,
        status: AccountsPayableStatus.PAID,
        paidDate: "2024-12-01",
        paidAmount: 2000,
        referenceNumber: "REF456",
        bankAccountId: "bank-2",
        propertyId: "prop-2",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };

      const result = mapAccountsPayableToFormData(transaction);

      expect(result).toEqual({
        supplierId: "supplier-1",
        employeeId: "employee-1",
        serviceProviderId: "sp-1",
        amount: 2000,
        dueDate: "2024-12-31",
        description: "Purchase payment",
        category: CashFlowCategory.FEED,
        paymentMethod: PaymentMethod.CHECK,
        status: AccountsPayableStatus.PAID,
        paidDate: "2024-12-01",
        paidAmount: 2000,
        referenceNumber: "REF456",
        bankAccountId: "bank-2",
        propertyId: "prop-2",
      });
    });

    it("should map AccountsPayable with optional fields as empty strings", () => {
      const transaction: AccountsPayable = {
        id: "ap-1",
        companyId: "company-1",
        amount: 2000,
        dueDate: "2024-12-31",
        description: "Purchase",
        status: AccountsPayableStatus.UNPAID,
        paidAmount: 0,
        propertyId: "prop-2",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };

      const result = mapAccountsPayableToFormData(transaction);

      expect(result?.supplierId).toBe("");
      expect(result?.employeeId).toBe("");
      expect(result?.serviceProviderId).toBe("");
      expect(result?.category).toBe(CashFlowCategory.FEED);
      expect(result?.paymentMethod).toBe(PaymentMethod.CASH);
      expect(result?.paidDate).toBe("");
      expect(result?.referenceNumber).toBe("");
      expect(result?.bankAccountId).toBe("");
    });

    it("should return undefined when transaction is undefined", () => {
      const result = mapAccountsPayableToFormData(undefined);
      expect(result).toBeUndefined();
    });

    it("should use default category when category is missing", () => {
      const transaction: AccountsPayable = {
        id: "ap-1",
        companyId: "company-1",
        amount: 2000,
        dueDate: "2024-12-31",
        description: "Purchase",
        status: AccountsPayableStatus.UNPAID,
        propertyId: "prop-2",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };

      const result = mapAccountsPayableToFormData(transaction);
      expect(result?.category).toBe(CashFlowCategory.FEED);
    });

    it("should use default payment method when paymentMethod is missing", () => {
      const transaction: AccountsPayable = {
        id: "ap-1",
        companyId: "company-1",
        amount: 2000,
        dueDate: "2024-12-31",
        description: "Purchase",
        status: AccountsPayableStatus.UNPAID,
        propertyId: "prop-2",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };

      const result = mapAccountsPayableToFormData(transaction);
      expect(result?.paymentMethod).toBe(PaymentMethod.CASH);
    });
  });
});
