import { describe, it, expect, beforeEach } from "vitest";
import { getPaymentsByCompanyId, getPaymentById } from "../payments.service";
import { mockPayments } from "~/mocks/payments";
import { PaymentStatus } from "~/types/payment";

describe("payments.service", () => {
  beforeEach(() => {
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
    it("should return all payments for a company", () => {
      const result = getPaymentsByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("payment-1");
      expect(result[1]?.id).toBe("payment-2");
    });

    it("should return empty array when company has no payments", () => {
      const result = getPaymentsByCompanyId("company-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getPaymentById", () => {
    it("should return payment when ID exists", () => {
      const result = getPaymentById("payment-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("payment-1");
      expect(result?.amount).toBe(100);
      expect(result?.status).toBe(PaymentStatus.PAID);
    });

    it("should return undefined when ID does not exist", () => {
      const result = getPaymentById("payment-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return payment with correct month format", () => {
      const result = getPaymentById("payment-1");
      expect(result?.month).toMatch(/^\d{4}-\d{2}$/);
    });
  });
});
