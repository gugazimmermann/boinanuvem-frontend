import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAccountsReceivableById,
  getAccountsReceivableByCompanyId,
  getAccountsReceivableByBuyerId,
  getAccountsReceivableByPropertyId,
  addAccountsReceivable,
  updateAccountsReceivable,
  deleteAccountsReceivable,
} from "../accounts-receivable.service";
import { CashFlowCategory, PaymentMethod, AccountsReceivableStatus } from "~/types";

vi.mock("~/mocks/accounts-receivable", () => ({
  mockAccountsReceivable: [
    {
      id: "ar-1",
      companyId: "company-1",
      buyerId: "buyer-1",
      propertyId: "property-1",
      amount: 1000,
    },
    {
      id: "ar-2",
      companyId: "company-1",
      propertyId: "property-2",
      amount: 500,
    },
  ],
}));

import { mockAccountsReceivable } from "~/mocks/accounts-receivable";

describe("accounts-receivable.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAccountsReceivableById", () => {
    it("should find account receivable by id", () => {
      const result = getAccountsReceivableById("ar-1");
      expect(result).toEqual(mockAccountsReceivable[0]);
    });

    it("should return undefined when not found", () => {
      const result = getAccountsReceivableById("nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("getAccountsReceivableByCompanyId", () => {
    it("should find accounts receivable by company id", () => {
      const result = getAccountsReceivableByCompanyId("company-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("getAccountsReceivableByBuyerId", () => {
    it("should find accounts receivable by buyer id", () => {
      const result = getAccountsReceivableByBuyerId("buyer-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getAccountsReceivableByPropertyId", () => {
    it("should find accounts receivable by property id", () => {
      const result = getAccountsReceivableByPropertyId("property-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("addAccountsReceivable", () => {
    it("should create new account receivable", () => {
      const formData = {
        companyId: "company-1",
        buyerId: "buyer-1",
        amount: 2000,
        dueDate: "2024-01-01",
        description: "Test",
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.CASH,
        status: AccountsReceivableStatus.UNPAID,
        propertyId: "property-1",
      };

      const result = addAccountsReceivable(formData);

      expect(result.id).toBeDefined();
      expect(result.amount).toBe(2000);
      expect(mockAccountsReceivable).toContain(result);
    });
  });

  describe("updateAccountsReceivable", () => {
    it("should update account receivable", () => {
      const updateData = { amount: 1500 };
      const result = updateAccountsReceivable("ar-1", updateData);

      expect(result).toBe(true);
      expect(mockAccountsReceivable[0].amount).toBe(1500);
    });
  });

  describe("deleteAccountsReceivable", () => {
    it("should delete account receivable", () => {
      const initialLength = mockAccountsReceivable.length;
      const result = deleteAccountsReceivable("ar-1");

      expect(result).toBe(true);
      expect(mockAccountsReceivable).toHaveLength(initialLength - 1);
    });
  });
});
