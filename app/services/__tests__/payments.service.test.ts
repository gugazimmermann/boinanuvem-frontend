import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiError } from "../api-client";
import { PaymentStatus } from "~/types/payment";
import { getPaymentsByCompanyId, getPaymentById } from "../payments.service";

vi.mock("../api-client", async () => {
  const actual = await vi.importActual("../api-client");
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
    },
  };
});

import { apiClient } from "../api-client";

describe("payments.service", () => {
  const mockGet = apiClient.get as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPaymentsByCompanyId", () => {
    it("should fetch payments from API successfully", async () => {
      const mockBackendPayments = [
        {
          id: "payment-1",
          companyId: "company-1",
          subscriptionId: "sub-1",
          amount: "100.00",
          currency: "BRL",
          status: "paid",
          paymentMethod: "credit_card",
          paymentDate: "2024-01-15",
          dueDate: "2024-01-01",
          description: "Monthly subscription",
          externalId: null,
          metadata: null,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-15",
          subscription: {
            id: "sub-1",
            planId: "plan-1",
            plan: {
              id: "plan-1",
              name: "Basic Plan",
              price: "100.00",
            },
          },
        },
      ];
      mockGet.mockResolvedValue(mockBackendPayments);

      const result = await getPaymentsByCompanyId("company-1");

      expect(mockGet).toHaveBeenCalledWith("/payments/company/company-1");
      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(100);
      expect(result[0].status).toBe(PaymentStatus.PAID);
      expect(result[0].plan).toBe("Basic Plan");
    });

    it("should map backend status to frontend status", async () => {
      const mockBackendPayments = [
        {
          id: "payment-1",
          companyId: "company-1",
          amount: 100,
          status: "pending",
          dueDate: "2024-01-01",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ];
      mockGet.mockResolvedValue(mockBackendPayments);

      const result = await getPaymentsByCompanyId("company-1");
      expect(result[0].status).toBe(PaymentStatus.PENDING);
    });

    it("should handle 403 error", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(getPaymentsByCompanyId("company-1")).rejects.toThrow(
        "Access denied to this company"
      );
    });

    it("should return empty array on 404", async () => {
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));

      const result = await getPaymentsByCompanyId("company-1");
      expect(result).toEqual([]);
    });

    it("should throw error on network failure", async () => {
      const networkError = new Error("Network error");
      mockGet.mockRejectedValue(networkError);

      await expect(getPaymentsByCompanyId("company-1")).rejects.toThrow("Network error");
    });
  });

  describe("getPaymentById", () => {
    it("should fetch payment by id from API", async () => {
      const mockBackendPayment = {
        id: "payment-1",
        companyId: "company-1",
        amount: 100,
        status: "paid",
        dueDate: "2024-01-01",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };
      mockGet.mockResolvedValue(mockBackendPayment);

      const result = await getPaymentById("payment-1");

      expect(mockGet).toHaveBeenCalledWith("/payments/payment-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("payment-1");
    });

    it("should return undefined on 404", async () => {
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));

      const result = await getPaymentById("nonexistent");
      expect(result).toBeUndefined();
    });

    it("should handle 403 error", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(getPaymentById("payment-1")).rejects.toThrow("Access denied to this payment");
    });

    it("should throw error on network failure", async () => {
      const networkError = new Error("Network error");
      mockGet.mockRejectedValue(networkError);

      await expect(getPaymentById("payment-1")).rejects.toThrow("Network error");
    });
  });
});
