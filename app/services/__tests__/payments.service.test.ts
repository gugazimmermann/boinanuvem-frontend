import { describe, it, expect, beforeEach, vi } from "vitest";
import { getPaymentsByCompanyId, getPaymentById } from "../payments.service";
import { apiClient, ApiError } from "../api-client";
import { mockPayments } from "~/mocks/payments";
import { PaymentStatus } from "~/types/payment";

// Mock the API client
vi.mock("../api-client", () => ({
  apiClient: {
    get: vi.fn(),
  },
  ApiError: class extends Error {
    constructor(
      message: string,
      public status: number
    ) {
      super(message);
      this.name = "ApiError";
    }
  },
}));

describe("payments.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPayments.length = 0;
    mockPayments.push(
      {
        id: "payment-1",
        companyId: "company-1",
        month: "2025-01",
        plan: "Básico",
        amount: 100,
        status: PaymentStatus.PAID,
        invoiceId: "inv-1",
        createdAt: "2025-01-01",
      },
      {
        id: "payment-2",
        companyId: "company-1",
        month: "2025-02",
        plan: "Padrão",
        amount: 200,
        status: PaymentStatus.PENDING,
        invoiceId: "inv-2",
        createdAt: "2025-02-01",
      },
      {
        id: "payment-3",
        companyId: "company-2",
        month: "2025-01",
        plan: "Avançado",
        amount: 300,
        status: PaymentStatus.PAID,
        invoiceId: "inv-3",
        createdAt: "2025-01-01",
      }
    );
  });

  describe("getPaymentsByCompanyId", () => {
    it("should return all payments for a company", async () => {
      const mockBackendPayments = [
        {
          id: "payment-1",
          companyId: "company-1",
          subscriptionId: "sub-1",
          amount: 100,
          currency: "BRL",
          status: "paid",
          paymentMethod: "credit_card",
          paymentDate: "2025-01-15T00:00:00.000Z",
          dueDate: "2025-01-01T00:00:00.000Z",
          description: "Monthly subscription",
          externalId: "ext-1",
          metadata: null,
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-15T00:00:00.000Z",
          subscription: {
            id: "sub-1",
            planId: "plan-1",
            plan: {
              id: "plan-1",
              name: "Básico",
              price: 100,
            },
          },
        },
        {
          id: "payment-2",
          companyId: "company-1",
          subscriptionId: "sub-1",
          amount: 200,
          currency: "BRL",
          status: "pending",
          paymentMethod: null,
          paymentDate: null,
          dueDate: "2025-02-01T00:00:00.000Z",
          description: "Monthly subscription",
          externalId: null,
          metadata: null,
          createdAt: "2025-02-01T00:00:00.000Z",
          updatedAt: "2025-02-01T00:00:00.000Z",
          subscription: {
            id: "sub-1",
            planId: "plan-2",
            plan: {
              id: "plan-2",
              name: "Padrão",
              price: 200,
            },
          },
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue(mockBackendPayments);

      const result = await getPaymentsByCompanyId("company-1");

      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("payment-1");
      expect(result[1]?.id).toBe("payment-2");
      expect(result[0]?.status).toBe(PaymentStatus.PAID);
      expect(result[1]?.status).toBe(PaymentStatus.PENDING);
      expect(apiClient.get).toHaveBeenCalledWith("/payments/company/company-1");
    });

    it("should return empty array when company has no payments", async () => {
      vi.mocked(apiClient.get).mockResolvedValue([]);

      const result = await getPaymentsByCompanyId("company-nonexistent");

      expect(result).toHaveLength(0);
    });

    it("should fallback to mock data on API error", async () => {
      // Suppress expected console.error messages
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(apiClient.get).mockRejectedValue(new Error("Network error"));

      const result = await getPaymentsByCompanyId("company-1");

      // Should fallback to mock data
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("payment-1");

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe("getPaymentById", () => {
    it("should return payment when ID exists", async () => {
      const mockBackendPayment = {
        id: "payment-1",
        companyId: "company-1",
        subscriptionId: "sub-1",
        amount: 100,
        currency: "BRL",
        status: "paid",
        paymentMethod: "credit_card",
        paymentDate: "2025-01-15T00:00:00.000Z",
        dueDate: "2025-01-01T00:00:00.000Z",
        description: "Monthly subscription",
        externalId: "ext-1",
        metadata: null,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-15T00:00:00.000Z",
        subscription: {
          id: "sub-1",
          planId: "plan-1",
          plan: {
            id: "plan-1",
            name: "Básico",
            price: 100,
          },
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockBackendPayment);

      const result = await getPaymentById("payment-1");

      expect(result).toBeDefined();
      expect(result?.id).toBe("payment-1");
      expect(result?.amount).toBe(100);
      expect(result?.status).toBe(PaymentStatus.PAID);
      expect(apiClient.get).toHaveBeenCalledWith("/payments/payment-1");
    });

    it("should return undefined when ID does not exist", async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new ApiError("Not found", 404));

      const result = await getPaymentById("payment-nonexistent");

      expect(result).toBeUndefined();
    });

    it("should return payment with correct month format", async () => {
      const mockBackendPayment = {
        id: "payment-1",
        companyId: "company-1",
        subscriptionId: "sub-1",
        amount: 100,
        currency: "BRL",
        status: "paid",
        paymentMethod: "credit_card",
        paymentDate: "2025-01-15T00:00:00.000Z",
        dueDate: "2025-01-15T12:00:00.000Z", // Use a date in the middle of the day to avoid timezone issues
        description: "Monthly subscription",
        externalId: "ext-1",
        metadata: null,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-15T00:00:00.000Z",
        subscription: {
          id: "sub-1",
          planId: "plan-1",
          plan: {
            id: "plan-1",
            name: "Básico",
            price: 100,
          },
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockBackendPayment);

      const result = await getPaymentById("payment-1");

      expect(result?.month).toMatch(/^\d{4}-\d{2}$/);
      // Month is calculated from dueDate, so it should be "2025-01" for January 15
      expect(result?.month).toBe("2025-01");
    });

    it("should fallback to mock data on API error", async () => {
      // Suppress expected console.error messages
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(apiClient.get).mockRejectedValue(new Error("Network error"));

      const result = await getPaymentById("payment-1");

      // Should fallback to mock data
      expect(result).toBeDefined();
      expect(result?.id).toBe("payment-1");

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });
});
