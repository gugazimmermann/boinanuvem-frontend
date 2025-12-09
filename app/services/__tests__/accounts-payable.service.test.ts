import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getAccountsPayableById,
  getAccountsPayableByCompanyId,
  getAccountsPayableBySupplierId,
  getAccountsPayableByPropertyId,
  getAccountsPayableByEmployeeId,
  getAccountsPayableByServiceProviderId,
  addAccountsPayable,
  updateAccountsPayable,
  deleteAccountsPayable,
} from "../accounts-payable.service";
import { CashFlowCategory, PaymentMethod, AccountsPayableStatus } from "~/types";

vi.mock("~/mocks/accounts-payable", () => ({
  mockAccountsPayable: [
    {
      id: "ap-1",
      companyId: "company-1",
      supplierId: "supplier-1",
      propertyId: "property-1",
      employeeId: "employee-1",
      serviceProviderId: "provider-1",
      amount: 1000,
    },
    {
      id: "ap-2",
      companyId: "company-1",
      propertyId: "property-2",
      amount: 500,
    },
  ],
}));

import { mockAccountsPayable } from "~/mocks/accounts-payable";

describe("accounts-payable.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAccountsPayableById", () => {
    it("should find account payable by id", () => {
      const result = getAccountsPayableById("ap-1");
      expect(result).toEqual(mockAccountsPayable[0]);
    });

    it("should return undefined when not found", () => {
      const result = getAccountsPayableById("nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("getAccountsPayableByCompanyId", () => {
    it("should find accounts payable by company id", () => {
      const result = getAccountsPayableByCompanyId("company-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("getAccountsPayableBySupplierId", () => {
    it("should find accounts payable by supplier id", () => {
      const result = getAccountsPayableBySupplierId("supplier-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getAccountsPayableByPropertyId", () => {
    it("should find accounts payable by property id", () => {
      const result = getAccountsPayableByPropertyId("property-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getAccountsPayableByEmployeeId", () => {
    it("should find accounts payable by employee id", () => {
      const result = getAccountsPayableByEmployeeId("employee-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getAccountsPayableByServiceProviderId", () => {
    it("should find accounts payable by service provider id", () => {
      const result = getAccountsPayableByServiceProviderId("provider-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("addAccountsPayable", () => {
    it("should create new account payable", () => {
      const formData = {
        companyId: "company-1",
        amount: 2000,
        dueDate: "2024-01-01",
        description: "Test",
        category: CashFlowCategory.ANIMAL_ACQUISITION,
        paymentMethod: PaymentMethod.CASH,
        status: AccountsPayableStatus.UNPAID,
        propertyIds: [],
        propertyId: "prop-1",
      };

      const result = addAccountsPayable(formData);

      expect(result.id).toBeDefined();
      expect(result.amount).toBe(2000);
      expect(mockAccountsPayable).toContain(result);
    });
  });

  describe("updateAccountsPayable", () => {
    it("should update account payable", () => {
      const updateData = { amount: 1500 };
      const result = updateAccountsPayable("ap-1", updateData);

      expect(result).toBe(true);
      expect(mockAccountsPayable[0].amount).toBe(1500);
    });
  });

  describe("deleteAccountsPayable", () => {
    it("should delete account payable", () => {
      const initialLength = mockAccountsPayable.length;
      const result = deleteAccountsPayable("ap-1");

      expect(result).toBe(true);
      expect(mockAccountsPayable).toHaveLength(initialLength - 1);
    });
  });
});
