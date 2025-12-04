import { describe, it, expect, beforeEach } from "vitest";
import {
  getCashFlowById,
  getCashFlowByCompanyId,
  getCashFlowByBankAccountId,
  getCashFlowByPropertyId,
  getCashFlowByEmployeeId,
  getCashFlowByServiceProviderId,
  getCashFlowBySupplierId,
  getCashFlowByBuyerId,
  addCashFlow,
  updateCashFlow,
  deleteCashFlow,
} from "../cash-flow.service";
import { mockCashFlow } from "~/mocks/cash-flow";
import type { CashFlowFormData } from "~/types";
import { CashFlowCategory, PaymentMethod } from "~/types";

describe("cash-flow.service", () => {
  beforeEach(() => {
    mockCashFlow.length = 0;
    mockCashFlow.push(
      {
        id: "cf-1",
        companyId: "company-1",
        type: "expense",
        amount: 1000,
        date: "2025-01-01",
        description: "Test expense 1",
        category: CashFlowCategory.FEED,
        paymentMethod: PaymentMethod.CASH,
        status: "completed",
        propertyId: "property-1",
        supplierId: "supplier-1",
        createdAt: "2025-01-01",
      },
      {
        id: "cf-2",
        companyId: "company-1",
        type: "income",
        amount: 2000,
        date: "2025-01-02",
        description: "Test income 1",
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        status: "completed",
        propertyId: "property-2",
        buyerId: "buyer-1",
        createdAt: "2025-01-02",
      },
      {
        id: "cf-3",
        companyId: "company-2",
        type: "expense",
        amount: 3000,
        date: "2025-01-03",
        description: "Test expense 2",
        category: CashFlowCategory.MEDICINES,
        paymentMethod: PaymentMethod.PIX,
        status: "completed",
        propertyId: "property-1",
        employeeId: "employee-1",
        createdAt: "2025-01-03",
      },
      {
        id: "cf-4",
        companyId: "company-1",
        type: "expense",
        amount: 1500,
        date: "2025-01-04",
        description: "Test expense 3",
        category: CashFlowCategory.VETERINARY,
        paymentMethod: PaymentMethod.CASH,
        status: "completed",
        propertyId: "property-1",
        serviceProviderId: "service-provider-1",
        bankAccountId: "bank-1",
        createdAt: "2025-01-04",
      }
    );
  });

  describe("getCashFlowById", () => {
    it("should return cash flow when ID exists", () => {
      const result = getCashFlowById("cf-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("cf-1");
      expect(result?.amount).toBe(1000);
    });

    it("should return undefined when ID does not exist", () => {
      const result = getCashFlowById("cf-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getCashFlowById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getCashFlowByCompanyId", () => {
    it("should return all cash flows for a company", () => {
      const result = getCashFlowByCompanyId("company-1");
      expect(result).toHaveLength(3);
      expect(result[0]?.id).toBe("cf-1");
      expect(result[1]?.id).toBe("cf-2");
      expect(result[2]?.id).toBe("cf-4");
    });

    it("should return empty array when company has no cash flows", () => {
      const result = getCashFlowByCompanyId("company-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getCashFlowByBankAccountId", () => {
    it("should return all cash flows for a bank account", () => {
      const result = getCashFlowByBankAccountId("bank-1");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("cf-4");
    });

    it("should return empty array when bank account has no cash flows", () => {
      const result = getCashFlowByBankAccountId("bank-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getCashFlowByPropertyId", () => {
    it("should return all cash flows for a property", () => {
      const result = getCashFlowByPropertyId("property-1");
      expect(result).toHaveLength(3);
      expect(result.some((cf) => cf.id === "cf-1")).toBe(true);
      expect(result.some((cf) => cf.id === "cf-3")).toBe(true);
      expect(result.some((cf) => cf.id === "cf-4")).toBe(true);
    });

    it("should return empty array when property has no cash flows", () => {
      const result = getCashFlowByPropertyId("property-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getCashFlowByEmployeeId", () => {
    it("should return all cash flows for an employee", () => {
      const result = getCashFlowByEmployeeId("employee-1");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("cf-3");
    });

    it("should return empty array when employee has no cash flows", () => {
      const result = getCashFlowByEmployeeId("employee-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getCashFlowByServiceProviderId", () => {
    it("should return all cash flows for a service provider", () => {
      const result = getCashFlowByServiceProviderId("service-provider-1");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("cf-4");
    });

    it("should return empty array when service provider has no cash flows", () => {
      const result = getCashFlowByServiceProviderId("service-provider-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getCashFlowBySupplierId", () => {
    it("should return all cash flows for a supplier", () => {
      const result = getCashFlowBySupplierId("supplier-1");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("cf-1");
    });

    it("should return empty array when supplier has no cash flows", () => {
      const result = getCashFlowBySupplierId("supplier-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getCashFlowByBuyerId", () => {
    it("should return all cash flows for a buyer", () => {
      const result = getCashFlowByBuyerId("buyer-1");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("cf-2");
    });

    it("should return empty array when buyer has no cash flows", () => {
      const result = getCashFlowByBuyerId("buyer-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("addCashFlow", () => {
    it("should add a new cash flow with generated ID", () => {
      const formData: CashFlowFormData = {
        companyId: "company-1",
        type: "expense",
        amount: 5000,
        date: "2025-01-10",
        description: "New expense",
        category: CashFlowCategory.FUEL,
        paymentMethod: PaymentMethod.CASH,
        status: "completed",
        propertyId: "property-1",
      };

      const initialLength = mockCashFlow.length;
      const result = addCashFlow(formData);

      expect(mockCashFlow).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.companyId).toBe("company-1");
      expect(result.amount).toBe(5000);
      expect(result.createdAt).toBeDefined();
    });

    it("should generate ID with correct prefix", () => {
      const formData: CashFlowFormData = {
        companyId: "company-1",
        type: "expense",
        amount: 5000,
        date: "2025-01-10",
        description: "New expense",
        category: CashFlowCategory.FUEL,
        paymentMethod: PaymentMethod.CASH,
        status: "completed",
        propertyId: "property-1",
      };

      const result = addCashFlow(formData);
      expect(result.id).toContain("cc0e8400-e29b-41d4-a716");
    });
  });

  describe("updateCashFlow", () => {
    it("should update cash flow when ID exists", () => {
      const updateData: Partial<CashFlowFormData> = {
        amount: 1500,
        description: "Updated description",
      };

      const result = updateCashFlow("cf-1", updateData);
      expect(result).toBe(true);

      const updated = mockCashFlow.find((cf) => cf.id === "cf-1");
      expect(updated?.amount).toBe(1500);
      expect(updated?.description).toBe("Updated description");
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<CashFlowFormData> = {
        amount: 1500,
      };

      const result = updateCashFlow("cf-nonexistent", updateData);
      expect(result).toBe(false);
    });
  });

  describe("deleteCashFlow", () => {
    it("should delete cash flow when ID exists", () => {
      const initialLength = mockCashFlow.length;
      const result = deleteCashFlow("cf-1");

      expect(result).toBe(true);
      expect(mockCashFlow).toHaveLength(initialLength - 1);
      expect(mockCashFlow.find((cf) => cf.id === "cf-1")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockCashFlow.length;
      const result = deleteCashFlow("cf-nonexistent");

      expect(result).toBe(false);
      expect(mockCashFlow).toHaveLength(initialLength);
    });
  });
});
