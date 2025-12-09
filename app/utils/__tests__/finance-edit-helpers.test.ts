import { describe, it, expect } from "vitest";
import {
  mapAccountsReceivableToFormData,
  mapAccountsPayableToFormData,
} from "../finance-edit-helpers";
import type { AccountsReceivable, AccountsPayable } from "~/types";
import { CashFlowCategory, PaymentMethod } from "~/types";
import { AccountsPayableStatus, AccountsReceivableStatus } from "~/types";

describe("mapAccountsReceivableToFormData", () => {
  it("should return undefined for undefined transaction", () => {
    expect(mapAccountsReceivableToFormData(undefined)).toBeUndefined();
  });

  it("should map transaction to form data", () => {
    const transaction: AccountsReceivable = {
      id: "ar-1",
      companyId: "company-1",
      buyerId: "buyer-1",
      amount: 1000,
      dueDate: "2024-01-15",
      description: "Test description",
      category: CashFlowCategory.CATTLE_SALES,
      paymentMethod: PaymentMethod.CASH,
      status: AccountsReceivableStatus.UNPAID,
      propertyId: "property-1",
      createdAt: "2024-01-01T00:00:00Z",
    };

    const result = mapAccountsReceivableToFormData(transaction);
    expect(result?.buyerId).toBe("buyer-1");
    expect(result?.amount).toBe(1000);
    expect(result?.dueDate).toBe("2024-01-15");
    expect(result?.description).toBe("Test description");
    expect(result?.category).toBe(CashFlowCategory.CATTLE_SALES);
    expect(result?.paymentMethod).toBe(PaymentMethod.CASH);
    expect(result?.status).toBe(AccountsReceivableStatus.UNPAID);
  });

  it("should use default values for optional fields", () => {
    const transaction: AccountsReceivable = {
      id: "ar-1",
      companyId: "company-1",
      amount: 1000,
      dueDate: "2024-01-15",
      status: AccountsReceivableStatus.UNPAID,
      propertyId: "property-1",
      description: "Test",
      createdAt: "2024-01-01T00:00:00Z",
    };

    const result = mapAccountsReceivableToFormData(transaction);
    expect(result?.buyerId).toBe("");
    expect(result?.category).toBe(CashFlowCategory.CATTLE_SALES);
    expect(result?.paymentMethod).toBe(PaymentMethod.CASH);
    expect(result?.paidDate).toBe("");
    expect(result?.referenceNumber).toBe("");
    expect(result?.bankAccountId).toBe("");
  });

  it("should handle paid amount", () => {
    const transaction: AccountsReceivable = {
      id: "ar-1",
      companyId: "company-1",
      amount: 1000,
      dueDate: "2024-01-15",
      status: AccountsReceivableStatus.PARTIAL,
      paidAmount: 500,
      propertyId: "property-1",
      description: "Test",
      createdAt: "2024-01-01T00:00:00Z",
    };

    const result = mapAccountsReceivableToFormData(transaction);
    expect(result?.paidAmount).toBe(500);
  });
});

describe("mapAccountsPayableToFormData", () => {
  it("should return undefined for undefined transaction", () => {
    expect(mapAccountsPayableToFormData(undefined)).toBeUndefined();
  });

  it("should map transaction to form data", () => {
    const transaction: AccountsPayable = {
      id: "ap-1",
      companyId: "company-1",
      supplierId: "supplier-1",
      amount: 1000,
      dueDate: "2024-01-15",
      description: "Test description",
      category: CashFlowCategory.FEED,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      status: AccountsPayableStatus.UNPAID,
      propertyId: "property-1",
      createdAt: "2024-01-01T00:00:00Z",
    };

    const result = mapAccountsPayableToFormData(transaction);
    expect(result?.supplierId).toBe("supplier-1");
    expect(result?.amount).toBe(1000);
    expect(result?.dueDate).toBe("2024-01-15");
    expect(result?.description).toBe("Test description");
    expect(result?.category).toBe(CashFlowCategory.FEED);
    expect(result?.paymentMethod).toBe(PaymentMethod.BANK_TRANSFER);
    expect(result?.status).toBe(AccountsPayableStatus.UNPAID);
  });

  it("should use default values for optional fields", () => {
    const transaction: AccountsPayable = {
      id: "ap-1",
      companyId: "company-1",
      amount: 1000,
      dueDate: "2024-01-15",
      status: AccountsPayableStatus.UNPAID,
      propertyId: "property-1",
      description: "Test",
      createdAt: "2024-01-01T00:00:00Z",
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

  it("should handle paid amount", () => {
    const transaction: AccountsPayable = {
      id: "ap-1",
      companyId: "company-1",
      amount: 1000,
      dueDate: "2024-01-15",
      status: AccountsPayableStatus.PARTIAL,
      paidAmount: 300,
      propertyId: "property-1",
      description: "Test",
      createdAt: "2024-01-01T00:00:00Z",
    };

    const result = mapAccountsPayableToFormData(transaction);
    expect(result?.paidAmount).toBe(300);
  });
});
