import { describe, it, expect, beforeEach } from "vitest";
import {
  getAccountsReceivableById,
  getAccountsReceivableByCompanyId,
  getAccountsReceivableByBuyerId,
  getAccountsReceivableByPropertyId,
  addAccountsReceivable,
  updateAccountsReceivable,
  deleteAccountsReceivable,
} from "../accounts-receivable.service";
import { mockAccountsReceivable } from "~/mocks/accounts-receivable";
import type { AccountsReceivableFormData } from "~/types";
import { CashFlowCategory, PaymentMethod, AccountsReceivableStatus } from "~/types";

describe("accounts-receivable.service", () => {
  beforeEach(() => {
    // Reset mock data before each test
    mockAccountsReceivable.length = 0;
    mockAccountsReceivable.push(
      {
        id: "ar-1",
        companyId: "company-1",
        buyerId: "buyer-1",
        propertyId: "property-1",
        amount: 1000,
        dueDate: "2025-01-01",
        description: "Test receivable 1",
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.CASH,
        status: AccountsReceivableStatus.UNPAID,
        createdAt: "2025-01-01",
      },
      {
        id: "ar-2",
        companyId: "company-1",
        buyerId: "buyer-2",
        propertyId: "property-2",
        amount: 2000,
        dueDate: "2025-01-02",
        description: "Test receivable 2",
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.CASH,
        status: AccountsReceivableStatus.PAID,
        createdAt: "2025-01-02",
      },
      {
        id: "ar-3",
        companyId: "company-2",
        buyerId: "buyer-1",
        propertyId: "property-1",
        amount: 3000,
        dueDate: "2025-01-03",
        description: "Test receivable 3",
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.CASH,
        status: AccountsReceivableStatus.UNPAID,
        createdAt: "2025-01-03",
      }
    );
  });

  describe("getAccountsReceivableById", () => {
    it("should return accounts receivable when ID exists", () => {
      const result = getAccountsReceivableById("ar-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("ar-1");
      expect(result?.amount).toBe(1000);
    });

    it("should return undefined when ID does not exist", () => {
      const result = getAccountsReceivableById("ar-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getAccountsReceivableById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getAccountsReceivableByCompanyId", () => {
    it("should return all accounts receivable for a company", () => {
      const result = getAccountsReceivableByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("ar-1");
      expect(result[1]?.id).toBe("ar-2");
    });

    it("should return empty array when company has no accounts receivable", () => {
      const result = getAccountsReceivableByCompanyId("company-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getAccountsReceivableByBuyerId", () => {
    it("should return all accounts receivable for a buyer", () => {
      const result = getAccountsReceivableByBuyerId("buyer-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("ar-1");
      expect(result[1]?.id).toBe("ar-3");
    });

    it("should return empty array when buyer has no accounts receivable", () => {
      const result = getAccountsReceivableByBuyerId("buyer-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getAccountsReceivableByPropertyId", () => {
    it("should return all accounts receivable for a property", () => {
      const result = getAccountsReceivableByPropertyId("property-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("ar-1");
      expect(result[1]?.id).toBe("ar-3");
    });

    it("should return empty array when property has no accounts receivable", () => {
      const result = getAccountsReceivableByPropertyId("property-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("addAccountsReceivable", () => {
    it("should add a new accounts receivable with generated ID", () => {
      const formData: AccountsReceivableFormData = {
        companyId: "company-1",
        buyerId: "buyer-1",
        amount: 5000,
        dueDate: "2025-01-10",
        description: "New receivable",
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.CASH,
        status: AccountsReceivableStatus.UNPAID,
        propertyId: "property-1",
      };

      const initialLength = mockAccountsReceivable.length;
      const result = addAccountsReceivable(formData);

      expect(mockAccountsReceivable).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.companyId).toBe("company-1");
      expect(result.amount).toBe(5000);
      expect(result.createdAt).toBeDefined();
    });

    it("should generate ID with correct prefix", () => {
      const formData: AccountsReceivableFormData = {
        companyId: "company-1",
        buyerId: "buyer-1",
        amount: 5000,
        dueDate: "2025-01-10",
        description: "New receivable",
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.CASH,
        status: AccountsReceivableStatus.UNPAID,
        propertyId: "property-1",
      };

      const result = addAccountsReceivable(formData);
      expect(result.id).toContain("ar0e8400-e29b-41d4-a716");
    });

    it("should use default ID when array is empty", () => {
      mockAccountsReceivable.length = 0;
      const formData: AccountsReceivableFormData = {
        companyId: "company-1",
        buyerId: "buyer-1",
        amount: 5000,
        dueDate: "2025-01-10",
        description: "New receivable",
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.CASH,
        status: AccountsReceivableStatus.UNPAID,
        propertyId: "property-1",
      };

      const result = addAccountsReceivable(formData);
      expect(result.id).toBe("ar0e8400-e29b-41d4-a716-446655440009");
    });
  });

  describe("updateAccountsReceivable", () => {
    it("should update accounts receivable when ID exists", () => {
      const updateData: Partial<AccountsReceivableFormData> = {
        amount: 1500,
        description: "Updated description",
      };

      const result = updateAccountsReceivable("ar-1", updateData);
      expect(result).toBe(true);

      const updated = mockAccountsReceivable.find((ar) => ar.id === "ar-1");
      expect(updated?.amount).toBe(1500);
      expect(updated?.description).toBe("Updated description");
    });

    it("should preserve existing fields when updating", () => {
      const original = mockAccountsReceivable.find((ar) => ar.id === "ar-1");
      const originalCompanyId = original?.companyId;

      const updateData: Partial<AccountsReceivableFormData> = {
        amount: 1500,
      };

      updateAccountsReceivable("ar-1", updateData);

      const updated = mockAccountsReceivable.find((ar) => ar.id === "ar-1");
      expect(updated?.companyId).toBe(originalCompanyId);
      expect(updated?.id).toBe("ar-1");
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<AccountsReceivableFormData> = {
        amount: 1500,
      };

      const result = updateAccountsReceivable("ar-nonexistent", updateData);
      expect(result).toBe(false);
    });
  });

  describe("deleteAccountsReceivable", () => {
    it("should delete accounts receivable when ID exists", () => {
      const initialLength = mockAccountsReceivable.length;
      const result = deleteAccountsReceivable("ar-1");

      expect(result).toBe(true);
      expect(mockAccountsReceivable).toHaveLength(initialLength - 1);
      expect(mockAccountsReceivable.find((ar) => ar.id === "ar-1")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockAccountsReceivable.length;
      const result = deleteAccountsReceivable("ar-nonexistent");

      expect(result).toBe(false);
      expect(mockAccountsReceivable).toHaveLength(initialLength);
    });
  });
});
