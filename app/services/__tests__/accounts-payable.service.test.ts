import { describe, it, expect, beforeEach } from "vitest";
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
import { mockAccountsPayable } from "~/mocks/accounts-payable";
import type { AccountsPayableFormData } from "~/types";
import { CashFlowCategory, PaymentMethod, AccountsPayableStatus } from "~/types";

describe("accounts-payable.service", () => {
  beforeEach(() => {
    // Reset mock data before each test
    mockAccountsPayable.length = 0;
    mockAccountsPayable.push(
      {
        id: "ap-1",
        companyId: "company-1",
        supplierId: "supplier-1",
        propertyId: "property-1",
        employeeId: "employee-1",
        serviceProviderId: undefined,
        amount: 1000,
        dueDate: "2025-01-01",
        description: "Test payable 1",
        category: CashFlowCategory.ANIMAL_ACQUISITION,
        paymentMethod: PaymentMethod.CASH,
        status: AccountsPayableStatus.UNPAID,
        createdAt: "2025-01-01",
      },
      {
        id: "ap-2",
        companyId: "company-1",
        supplierId: "supplier-2",
        propertyId: "property-2",
        employeeId: undefined,
        serviceProviderId: "service-provider-1",
        amount: 2000,
        dueDate: "2025-01-02",
        description: "Test payable 2",
        category: CashFlowCategory.ANIMAL_ACQUISITION,
        paymentMethod: PaymentMethod.CASH,
        status: AccountsPayableStatus.PAID,
        createdAt: "2025-01-02",
      },
      {
        id: "ap-3",
        companyId: "company-2",
        supplierId: "supplier-1",
        propertyId: "property-1",
        employeeId: undefined,
        serviceProviderId: undefined,
        amount: 3000,
        dueDate: "2025-01-03",
        description: "Test payable 3",
        category: CashFlowCategory.ANIMAL_ACQUISITION,
        paymentMethod: PaymentMethod.CASH,
        status: AccountsPayableStatus.UNPAID,
        createdAt: "2025-01-03",
      }
    );
  });

  describe("getAccountsPayableById", () => {
    it("should return accounts payable when ID exists", () => {
      const result = getAccountsPayableById("ap-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("ap-1");
      expect(result?.amount).toBe(1000);
    });

    it("should return undefined when ID does not exist", () => {
      const result = getAccountsPayableById("ap-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getAccountsPayableById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getAccountsPayableByCompanyId", () => {
    it("should return all accounts payable for a company", () => {
      const result = getAccountsPayableByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("ap-1");
      expect(result[1]?.id).toBe("ap-2");
    });

    it("should return empty array when company has no accounts payable", () => {
      const result = getAccountsPayableByCompanyId("company-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getAccountsPayableBySupplierId", () => {
    it("should return all accounts payable for a supplier", () => {
      const result = getAccountsPayableBySupplierId("supplier-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("ap-1");
      expect(result[1]?.id).toBe("ap-3");
    });

    it("should return empty array when supplier has no accounts payable", () => {
      const result = getAccountsPayableBySupplierId("supplier-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getAccountsPayableByPropertyId", () => {
    it("should return all accounts payable for a property", () => {
      const result = getAccountsPayableByPropertyId("property-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("ap-1");
      expect(result[1]?.id).toBe("ap-3");
    });

    it("should return empty array when property has no accounts payable", () => {
      const result = getAccountsPayableByPropertyId("property-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getAccountsPayableByEmployeeId", () => {
    it("should return all accounts payable for an employee", () => {
      const result = getAccountsPayableByEmployeeId("employee-1");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("ap-1");
    });

    it("should return empty array when employee has no accounts payable", () => {
      const result = getAccountsPayableByEmployeeId("employee-nonexistent");
      expect(result).toHaveLength(0);
    });

    it("should not return accounts payable with undefined employeeId", () => {
      const result = getAccountsPayableByEmployeeId("employee-1");
      expect(result.every((ap) => ap.employeeId === "employee-1")).toBe(true);
    });
  });

  describe("getAccountsPayableByServiceProviderId", () => {
    it("should return all accounts payable for a service provider", () => {
      const result = getAccountsPayableByServiceProviderId("service-provider-1");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("ap-2");
    });

    it("should return empty array when service provider has no accounts payable", () => {
      const result = getAccountsPayableByServiceProviderId("service-provider-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("addAccountsPayable", () => {
    it("should add a new accounts payable with generated ID", () => {
      const formData: AccountsPayableFormData = {
        companyId: "company-1",
        supplierId: "supplier-1",
        amount: 5000,
        dueDate: "2025-01-10",
        description: "New payable",
        category: CashFlowCategory.ANIMAL_ACQUISITION,
        paymentMethod: PaymentMethod.CASH,
        status: AccountsPayableStatus.UNPAID,
        propertyId: "property-1",
      };

      const initialLength = mockAccountsPayable.length;
      const result = addAccountsPayable(formData);

      expect(mockAccountsPayable).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.companyId).toBe("company-1");
      expect(result.amount).toBe(5000);
      expect(result.createdAt).toBeDefined();
    });

    it("should generate ID with correct prefix", () => {
      const formData: AccountsPayableFormData = {
        companyId: "company-1",
        supplierId: "supplier-1",
        amount: 5000,
        dueDate: "2025-01-10",
        description: "New payable",
        category: CashFlowCategory.ANIMAL_ACQUISITION,
        paymentMethod: PaymentMethod.CASH,
        status: AccountsPayableStatus.UNPAID,
        propertyId: "property-1",
      };

      const result = addAccountsPayable(formData);
      expect(result.id).toContain("ap0e8400-e29b-41d4-a716");
    });

    it("should use default ID when array is empty", () => {
      mockAccountsPayable.length = 0;
      const formData: AccountsPayableFormData = {
        companyId: "company-1",
        supplierId: "supplier-1",
        amount: 5000,
        dueDate: "2025-01-10",
        description: "New payable",
        category: CashFlowCategory.ANIMAL_ACQUISITION,
        paymentMethod: PaymentMethod.CASH,
        status: AccountsPayableStatus.UNPAID,
        propertyId: "property-1",
      };

      const result = addAccountsPayable(formData);
      expect(result.id).toBe("ap0e8400-e29b-41d4-a716-446655440009");
    });
  });

  describe("updateAccountsPayable", () => {
    it("should update accounts payable when ID exists", () => {
      const updateData: Partial<AccountsPayableFormData> = {
        amount: 1500,
        description: "Updated description",
      };

      const result = updateAccountsPayable("ap-1", updateData);
      expect(result).toBe(true);

      const updated = mockAccountsPayable.find((ap) => ap.id === "ap-1");
      expect(updated?.amount).toBe(1500);
      expect(updated?.description).toBe("Updated description");
    });

    it("should preserve existing fields when updating", () => {
      const original = mockAccountsPayable.find((ap) => ap.id === "ap-1");
      const originalCompanyId = original?.companyId;

      const updateData: Partial<AccountsPayableFormData> = {
        amount: 1500,
      };

      updateAccountsPayable("ap-1", updateData);

      const updated = mockAccountsPayable.find((ap) => ap.id === "ap-1");
      expect(updated?.companyId).toBe(originalCompanyId);
      expect(updated?.id).toBe("ap-1");
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<AccountsPayableFormData> = {
        amount: 1500,
      };

      const result = updateAccountsPayable("ap-nonexistent", updateData);
      expect(result).toBe(false);
    });
  });

  describe("deleteAccountsPayable", () => {
    it("should delete accounts payable when ID exists", () => {
      const initialLength = mockAccountsPayable.length;
      const result = deleteAccountsPayable("ap-1");

      expect(result).toBe(true);
      expect(mockAccountsPayable).toHaveLength(initialLength - 1);
      expect(mockAccountsPayable.find((ap) => ap.id === "ap-1")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockAccountsPayable.length;
      const result = deleteAccountsPayable("ap-nonexistent");

      expect(result).toBe(false);
      expect(mockAccountsPayable).toHaveLength(initialLength);
    });
  });
});
