import { describe, it, expect } from "vitest";
import { calculateMonthlyFinanceData } from "../finance-monthly-data";
import type { CashFlow } from "~/types";
import { CashFlowCategory, PaymentMethod } from "~/types";

describe("finance-monthly-data", () => {
  describe("calculateMonthlyFinanceData", () => {
    it("should calculate monthly data for last 12 months", () => {
      const currentDate = new Date("2024-06-15");
      const result = calculateMonthlyFinanceData([], currentDate);
      expect(result).toHaveLength(12);
    });

    it("should include income transactions", () => {
      const currentDate = new Date("2024-06-15");
      const transactions: CashFlow[] = [
        {
          id: "1",
          type: "income",
          amount: 1000,
          date: "2024-06-10",
          companyId: "c1",
          propertyId: "p1",
          description: "Test income",
          category: CashFlowCategory.CATTLE_SALES,
          paymentMethod: PaymentMethod.CASH,
          status: "completed",
          createdAt: "2024-06-10",
        },
      ];
      const result = calculateMonthlyFinanceData(transactions, currentDate);
      const juneData = result.find((d) => d.month === "Jun");
      expect(juneData?.income).toBe(1000);
      expect(juneData?.expenses).toBe(0);
      expect(juneData?.net).toBe(1000);
    });

    it("should include expense transactions", () => {
      const currentDate = new Date("2024-06-15");
      const transactions: CashFlow[] = [
        {
          id: "1",
          type: "expense",
          amount: 500,
          date: "2024-06-10",
          companyId: "c1",
          propertyId: "p1",
          description: "Test expense",
          category: CashFlowCategory.FEED,
          paymentMethod: PaymentMethod.CASH,
          status: "completed",
          createdAt: "2024-06-10",
        },
      ];
      const result = calculateMonthlyFinanceData(transactions, currentDate);
      const juneData = result.find((d) => d.month === "Jun");
      expect(juneData?.income).toBe(0);
      expect(juneData?.expenses).toBe(500);
      expect(juneData?.net).toBe(-500);
    });

    it("should calculate net correctly", () => {
      const currentDate = new Date("2024-06-15");
      const transactions: CashFlow[] = [
        {
          id: "1",
          type: "income",
          amount: 1000,
          date: "2024-06-10",
          companyId: "c1",
          propertyId: "p1",
          description: "Test income",
          category: CashFlowCategory.CATTLE_SALES,
          paymentMethod: PaymentMethod.CASH,
          status: "completed",
          createdAt: "2024-06-10",
        },
        {
          id: "2",
          type: "expense",
          amount: 300,
          date: "2024-06-12",
          companyId: "c1",
          propertyId: "p1",
          description: "Test expense",
          category: CashFlowCategory.FEED,
          paymentMethod: PaymentMethod.CASH,
          status: "completed",
          createdAt: "2024-06-12",
        },
      ];
      const result = calculateMonthlyFinanceData(transactions, currentDate);
      const juneData = result.find((d) => d.month === "Jun");
      expect(juneData?.income).toBe(1000);
      expect(juneData?.expenses).toBe(300);
      expect(juneData?.net).toBe(700);
    });

    it("should group transactions by month", () => {
      const currentDate = new Date("2024-06-15");
      const transactions: CashFlow[] = [
        {
          id: "1",
          type: "income",
          amount: 500,
          date: "2024-05-10",
          companyId: "c1",
          propertyId: "p1",
          description: "Test income",
          category: CashFlowCategory.CATTLE_SALES,
          paymentMethod: PaymentMethod.CASH,
          status: "completed",
          createdAt: "2024-05-10",
        },
        {
          id: "2",
          type: "income",
          amount: 300,
          date: "2024-06-10",
          companyId: "c1",
          propertyId: "p1",
          description: "Test income",
          category: CashFlowCategory.CATTLE_SALES,
          paymentMethod: PaymentMethod.CASH,
          status: "completed",
          createdAt: "2024-06-10",
        },
      ];
      const result = calculateMonthlyFinanceData(transactions, currentDate);
      const mayData = result.find((d) => d.month === "Mai");
      const juneData = result.find((d) => d.month === "Jun");
      expect(mayData?.income).toBe(500);
      expect(juneData?.income).toBe(300);
    });

    it("should exclude transactions outside date range", () => {
      const currentDate = new Date("2024-06-15");
      const transactions: CashFlow[] = [
        {
          id: "1",
          type: "income",
          amount: 1000,
          date: "2023-06-10",
          companyId: "c1",
          propertyId: "p1",
          description: "Test income",
          category: CashFlowCategory.CATTLE_SALES,
          paymentMethod: PaymentMethod.CASH,
          status: "completed",
          createdAt: "2023-06-10",
        },
        {
          id: "2",
          type: "income",
          amount: 500,
          date: "2024-06-10",
          companyId: "c1",
          propertyId: "p1",
          description: "Test income",
          category: CashFlowCategory.CATTLE_SALES,
          paymentMethod: PaymentMethod.CASH,
          status: "completed",
          createdAt: "2024-06-10",
        },
      ];
      const result = calculateMonthlyFinanceData(transactions, currentDate);
      const juneData = result.find((d) => d.month === "Jun");
      expect(juneData?.income).toBe(500);
    });

    it("should handle empty transactions", () => {
      const currentDate = new Date("2024-06-15");
      const result = calculateMonthlyFinanceData([], currentDate);
      expect(result.every((d) => d.income === 0 && d.expenses === 0 && d.net === 0)).toBe(true);
    });

    it("should include all 12 months", () => {
      const currentDate = new Date("2024-06-15");
      const result = calculateMonthlyFinanceData([], currentDate);
      const months = result.map((d) => d.month);
      expect(months).toContain("Jul");
      expect(months).toContain("Ago");
      expect(months).toContain("Set");
      expect(months).toContain("Out");
      expect(months).toContain("Nov");
      expect(months).toContain("Dez");
      expect(months).toContain("Jan");
      expect(months).toContain("Fev");
      expect(months).toContain("Mar");
      expect(months).toContain("Abr");
      expect(months).toContain("Mai");
      expect(months).toContain("Jun");
    });
  });
});
