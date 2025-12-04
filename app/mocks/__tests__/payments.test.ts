import { describe, it, expect } from "vitest";
import { mockPayments } from "../payments";
import { mockCompanies } from "../companies";
import { PaymentStatus } from "~/types/payment";

describe("payments", () => {
  describe("mockPayments", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockPayments)).toBe(true);
    });

    it("should not be empty", () => {
      expect(mockPayments.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockPayments.forEach((payment) => {
        expect(payment).toHaveProperty("id");
        expect(payment).toHaveProperty("companyId");
        expect(payment).toHaveProperty("month");
        expect(payment).toHaveProperty("plan");
        expect(payment).toHaveProperty("amount");
        expect(payment).toHaveProperty("status");
        expect(payment).toHaveProperty("invoiceId");
        expect(payment).toHaveProperty("createdAt");
      });
    });

    it("should have unique IDs", () => {
      const ids = mockPayments.map((payment) => payment.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid date format for createdAt", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      mockPayments.forEach((payment) => {
        expect(payment.createdAt).toMatch(dateRegex);
      });
    });

    it("should have valid month format", () => {
      const monthRegex = /^\d{4}-\d{2}$/;
      mockPayments.forEach((payment) => {
        expect(payment.month).toMatch(monthRegex);
      });
    });

    it("should have valid plan names", () => {
      const validPlans = ["Mínimo", "Básico", "Padrão", "Avançado"];
      mockPayments.forEach((payment) => {
        expect(validPlans).toContain(payment.plan);
      });
    });

    it("should have valid amounts", () => {
      mockPayments.forEach((payment) => {
        expect(typeof payment.amount).toBe("number");
        expect(payment.amount).toBeGreaterThan(0);
      });
    });

    it("should have valid status", () => {
      const validStatuses = Object.values(PaymentStatus);
      mockPayments.forEach((payment) => {
        expect(validStatuses).toContain(payment.status);
      });
    });

    it("should reference valid company IDs", () => {
      const companyIds = mockCompanies.map((c) => c.id);
      mockPayments.forEach((payment) => {
        expect(companyIds).toContain(payment.companyId);
      });
    });

    it("should have valid invoice IDs", () => {
      mockPayments.forEach((payment) => {
        expect(typeof payment.invoiceId).toBe("string");
        expect(payment.invoiceId.length).toBeGreaterThan(0);
      });
    });

    it("should have amounts matching plan", () => {
      const planAmounts: Record<string, number> = {
        Mínimo: 49.9,
        Básico: 99.0,
        Padrão: 149.9,
        Avançado: 249.9,
      };
      mockPayments.forEach((payment) => {
        expect(payment.amount).toBe(planAmounts[payment.plan]);
      });
    });
  });
});
