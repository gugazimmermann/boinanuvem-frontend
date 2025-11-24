import { describe, it, expect, beforeEach, vi } from "vitest";
import { getPaymentsByCompanyId, getPaymentById } from "../payments.service";
import { mockPayments } from "~/mocks/payments";
import { PaymentStatus } from "~/types/payment";

vi.mock("~/mocks/payments", () => ({
  mockPayments: [],
}));

describe("payments.service", () => {
  beforeEach(() => {
    mockPayments.length = 0;
    mockPayments.push(
      {
        id: "payment-001",
        companyId: "company-1",
        month: "2025-11",
        plan: "Padrão",
        amount: 149.9,
        status: PaymentStatus.PAID,
        invoiceId: "invoice-001",
        createdAt: "2025-11-01",
      },
      {
        id: "payment-002",
        companyId: "company-1",
        month: "2025-10",
        plan: "Básico",
        amount: 99.0,
        status: PaymentStatus.PENDING,
        invoiceId: "invoice-002",
        createdAt: "2025-10-01",
      },
      {
        id: "payment-003",
        companyId: "company-2",
        month: "2025-11",
        plan: "Avançado",
        amount: 249.9,
        status: PaymentStatus.PAID,
        invoiceId: "invoice-003",
        createdAt: "2025-11-01",
      }
    );
  });

  describe("getPaymentsByCompanyId", () => {
    it("should return payments for specific company", () => {
      const result = getPaymentsByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result.every((payment) => payment.companyId === "company-1")).toBe(true);
    });

    it("should return empty array when company has no payments", () => {
      const result = getPaymentsByCompanyId("company-3");
      expect(result).toHaveLength(0);
    });

    it("should return payments with correct structure", () => {
      const result = getPaymentsByCompanyId("company-1");
      expect(result[0]).toHaveProperty("id");
      expect(result[0]).toHaveProperty("companyId");
      expect(result[0]).toHaveProperty("month");
      expect(result[0]).toHaveProperty("plan");
      expect(result[0]).toHaveProperty("amount");
      expect(result[0]).toHaveProperty("status");
      expect(result[0]).toHaveProperty("invoiceId");
      expect(result[0]).toHaveProperty("createdAt");
    });
  });

  describe("getPaymentById", () => {
    it("should return payment when ID exists", () => {
      const result = getPaymentById("payment-001");
      expect(result).toBeDefined();
      expect(result?.plan).toBe("Padrão");
      expect(result?.amount).toBe(149.9);
    });

    it("should return undefined when ID does not exist", () => {
      const result = getPaymentById("nonexistent-id");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getPaymentById(undefined as unknown as string);
      expect(result).toBeUndefined();
    });

    it("should return payment with correct status", () => {
      const paidPayment = getPaymentById("payment-001");
      expect(paidPayment?.status).toBe(PaymentStatus.PAID);

      const pendingPayment = getPaymentById("payment-002");
      expect(pendingPayment?.status).toBe(PaymentStatus.PENDING);
    });
  });
});
