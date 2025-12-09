import { describe, it, expect, beforeEach, vi } from "vitest";
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
import { CashFlowCategory, PaymentMethod } from "~/types";

vi.mock("~/mocks/cash-flow", () => ({
  mockCashFlow: [
    {
      id: "cf-1",
      companyId: "company-1",
      bankAccountId: "bank-1",
      propertyId: "property-1",
      employeeId: "employee-1",
      serviceProviderId: "provider-1",
      supplierId: "supplier-1",
      buyerId: "buyer-1",
      type: "income",
      amount: 1000,
    },
    {
      id: "cf-2",
      companyId: "company-1",
      propertyId: "property-2",
      type: "expense",
      amount: 500,
    },
  ],
}));

import { mockCashFlow } from "~/mocks/cash-flow";

describe("cash-flow.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCashFlowById", () => {
    it("should find cash flow by id", () => {
      const result = getCashFlowById("cf-1");
      expect(result).toEqual(mockCashFlow[0]);
    });

    it("should return undefined when not found", () => {
      const result = getCashFlowById("nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("getCashFlowByCompanyId", () => {
    it("should find cash flows by company id", () => {
      const result = getCashFlowByCompanyId("company-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("getCashFlowByBankAccountId", () => {
    it("should find cash flows by bank account id", () => {
      const result = getCashFlowByBankAccountId("bank-1");
      expect(result).toHaveLength(1);
      expect(result[0].bankAccountId).toBe("bank-1");
    });
  });

  describe("getCashFlowByPropertyId", () => {
    it("should find cash flows by property id", () => {
      const result = getCashFlowByPropertyId("property-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getCashFlowByEmployeeId", () => {
    it("should find cash flows by employee id", () => {
      const result = getCashFlowByEmployeeId("employee-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getCashFlowByServiceProviderId", () => {
    it("should find cash flows by service provider id", () => {
      const result = getCashFlowByServiceProviderId("provider-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getCashFlowBySupplierId", () => {
    it("should find cash flows by supplier id", () => {
      const result = getCashFlowBySupplierId("supplier-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("getCashFlowByBuyerId", () => {
    it("should find cash flows by buyer id", () => {
      const result = getCashFlowByBuyerId("buyer-1");
      expect(result).toHaveLength(1);
    });
  });

  describe("addCashFlow", () => {
    it("should create new cash flow", () => {
      const formData = {
        companyId: "company-1",
        type: "income" as const,
        amount: 2000,
        date: "2024-01-01",
        description: "Test",
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.CASH,
        status: "completed" as const,
        propertyIds: [],
        propertyId: "prop-1",
      };

      const result = addCashFlow(formData);

      expect(result.id).toBeDefined();
      expect(result.amount).toBe(2000);
      expect(mockCashFlow).toContain(result);
    });
  });

  describe("updateCashFlow", () => {
    it("should update cash flow", () => {
      const updateData = { amount: 1500 };
      const result = updateCashFlow("cf-1", updateData);

      expect(result).toBe(true);
      expect(mockCashFlow[0].amount).toBe(1500);
    });
  });

  describe("deleteCashFlow", () => {
    it("should delete cash flow", () => {
      const initialLength = mockCashFlow.length;
      const result = deleteCashFlow("cf-1");

      expect(result).toBe(true);
      expect(mockCashFlow).toHaveLength(initialLength - 1);
    });
  });
});
