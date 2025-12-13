import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiError } from "../api-client";
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
import type { CashFlowFormData } from "~/types";

vi.mock("../api-client", async () => {
  const actual = await vi.importActual("../api-client");
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

import { apiClient } from "../api-client";

const mockCashFlow = [
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
    date: "2024-01-01",
    description: "Test CF 1",
    category: CashFlowCategory.CATTLE_SALES,
    paymentMethod: PaymentMethod.CASH,
    status: "completed",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "cf-2",
    companyId: "company-1",
    propertyId: "property-2",
    type: "expense",
    amount: 500,
    date: "2024-01-02",
    description: "Test CF 2",
    category: CashFlowCategory.ANIMAL_ACQUISITION,
    paymentMethod: PaymentMethod.CASH,
    status: "completed",
    createdAt: "2024-01-01T00:00:00Z",
  },
];

describe("cash-flow.service", () => {
  const mockGet = apiClient.get as ReturnType<typeof vi.fn>;
  const mockPost = apiClient.post as ReturnType<typeof vi.fn>;
  const mockPut = apiClient.put as ReturnType<typeof vi.fn>;
  const mockDelete = apiClient.delete as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCashFlowById", () => {
    it("should find cash flow by id", async () => {
      mockGet.mockResolvedValue(mockCashFlow[0]);

      const result = await getCashFlowById("cf-1");

      expect(mockGet).toHaveBeenCalledWith("/cash-flow/cf-1");
      expect(result).toEqual(mockCashFlow[0]);
    });

    it("should return undefined when not found", async () => {
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));

      const result = await getCashFlowById("nonexistent");

      expect(result).toBeUndefined();
    });

    it("should return undefined when id is undefined", async () => {
      const result = await getCashFlowById(undefined);
      expect(result).toBeUndefined();
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should handle 403 error", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      const result = await getCashFlowById("cf-1");

      expect(result).toBeUndefined();
    });
  });

  describe("getCashFlowByCompanyId", () => {
    it("should find cash flows by company id", async () => {
      mockGet.mockResolvedValue(mockCashFlow);

      const result = await getCashFlowByCompanyId("company-1");

      expect(mockGet).toHaveBeenCalledWith("/cash-flow");
      expect(result).toHaveLength(2);
      expect(result).toEqual(mockCashFlow);
    });
  });

  describe("getCashFlowByBankAccountId", () => {
    it("should find cash flows by bank account id", async () => {
      mockGet.mockResolvedValue(mockCashFlow);

      const result = await getCashFlowByBankAccountId("bank-1");

      expect(mockGet).toHaveBeenCalledWith("/cash-flow");
      expect(result).toHaveLength(1);
      expect(result[0].bankAccountId).toBe("bank-1");
    });
  });

  describe("getCashFlowByPropertyId", () => {
    it("should find cash flows by property id", async () => {
      mockGet.mockResolvedValue(mockCashFlow);

      const result = await getCashFlowByPropertyId("property-1");

      expect(mockGet).toHaveBeenCalledWith("/cash-flow");
      expect(result).toHaveLength(1);
      expect(result[0].propertyId).toBe("property-1");
    });
  });

  describe("getCashFlowByEmployeeId", () => {
    it("should find cash flows by employee id", async () => {
      mockGet.mockResolvedValue(mockCashFlow);

      const result = await getCashFlowByEmployeeId("employee-1");

      expect(mockGet).toHaveBeenCalledWith("/cash-flow");
      expect(result).toHaveLength(1);
      expect(result[0].employeeId).toBe("employee-1");
    });
  });

  describe("getCashFlowByServiceProviderId", () => {
    it("should find cash flows by service provider id", async () => {
      mockGet.mockResolvedValue(mockCashFlow);

      const result = await getCashFlowByServiceProviderId("provider-1");

      expect(mockGet).toHaveBeenCalledWith("/cash-flow");
      expect(result).toHaveLength(1);
      expect(result[0].serviceProviderId).toBe("provider-1");
    });
  });

  describe("getCashFlowBySupplierId", () => {
    it("should find cash flows by supplier id", async () => {
      mockGet.mockResolvedValue(mockCashFlow);

      const result = await getCashFlowBySupplierId("supplier-1");

      expect(mockGet).toHaveBeenCalledWith("/cash-flow");
      expect(result).toHaveLength(1);
      expect(result[0].supplierId).toBe("supplier-1");
    });
  });

  describe("getCashFlowByBuyerId", () => {
    it("should find cash flows by buyer id", async () => {
      mockGet.mockResolvedValue(mockCashFlow);

      const result = await getCashFlowByBuyerId("buyer-1");

      expect(mockGet).toHaveBeenCalledWith("/cash-flow");
      expect(result).toHaveLength(1);
      expect(result[0].buyerId).toBe("buyer-1");
    });
  });

  describe("addCashFlow", () => {
    it("should create new cash flow", async () => {
      const formData: CashFlowFormData = {
        companyId: "company-1",
        type: "income" as const,
        amount: 2000,
        date: "2024-01-01",
        description: "Test",
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.CASH,
        status: "completed" as const,
        propertyId: "prop-1",
      };

      const createdCashFlow = {
        id: "cf-3",
        ...formData,
        createdAt: "2024-01-01T00:00:00Z",
      };

      mockPost.mockResolvedValue(createdCashFlow);

      const result = await addCashFlow(formData);

      expect(mockPost).toHaveBeenCalledWith("/cash-flow", {
        type: formData.type,
        amount: formData.amount,
        date: formData.date,
        description: formData.description,
        category: formData.category,
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        bankAccountId: formData.bankAccountId,
        propertyId: formData.propertyId,
        employeeId: formData.employeeId,
        serviceProviderId: formData.serviceProviderId,
        supplierId: formData.supplierId,
        buyerId: formData.buyerId,
        paymentDate: formData.paymentDate,
        referenceNumber: formData.referenceNumber,
      });
      expect(result.id).toBeDefined();
      expect(result.amount).toBe(2000);
    });
  });

  describe("updateCashFlow", () => {
    it("should update cash flow", async () => {
      const updateData = { amount: 1500 };
      const updatedCashFlow = {
        ...mockCashFlow[0],
        amount: 1500,
      };

      mockPut.mockResolvedValue(updatedCashFlow);

      const result = await updateCashFlow("cf-1", updateData);

      expect(mockPut).toHaveBeenCalledWith("/cash-flow/cf-1", updateData);
      expect(result).toEqual(updatedCashFlow);
      expect(result.amount).toBe(1500);
    });
  });

  describe("deleteCashFlow", () => {
    it("should delete cash flow", async () => {
      mockDelete.mockResolvedValue(undefined);

      await deleteCashFlow("cf-1");

      expect(mockDelete).toHaveBeenCalledWith("/cash-flow/cf-1");
    });
  });
});
