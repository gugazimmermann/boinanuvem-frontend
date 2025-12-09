import { describe, it, expect } from "vitest";
import { calculateMonthlyFinanceData } from "../finance-monthly-data";
import type { CashFlow } from "~/types";
import { CashFlowCategory, PaymentMethod } from "~/types";

describe("calculateMonthlyFinanceData", () => {
  const mockCashFlowData: CashFlow[] = [
    {
      id: "1",
      type: "income",
      amount: 1000,
      date: "2024-01-15",
      companyId: "company-1",
      description: "Test income",
      category: CashFlowCategory.CATTLE_SALES,
      paymentMethod: PaymentMethod.CASH,
      status: "completed",
      propertyId: "property-1",
      createdAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "2",
      type: "expense",
      amount: 300,
      date: "2024-01-20",
      companyId: "company-1",
      description: "Test expense",
      category: CashFlowCategory.FEED,
      paymentMethod: PaymentMethod.CASH,
      status: "completed",
      propertyId: "property-1",
      createdAt: "2024-01-20T00:00:00Z",
    },
    {
      id: "3",
      type: "income",
      amount: 500,
      date: "2024-02-10",
      companyId: "company-1",
      description: "Test income",
      category: CashFlowCategory.CATTLE_SALES,
      paymentMethod: PaymentMethod.CASH,
      status: "completed",
      propertyId: "property-1",
      createdAt: "2024-02-10T00:00:00Z",
    },
    {
      id: "4",
      type: "expense",
      amount: 200,
      date: "2024-02-15",
      companyId: "company-1",
      description: "Test expense",
      category: CashFlowCategory.FEED,
      paymentMethod: PaymentMethod.CASH,
      status: "completed",
      propertyId: "property-1",
      createdAt: "2024-02-15T00:00:00Z",
    },
  ];

  it("should calculate monthly data for last 12 months", () => {
    const currentDate = new Date("2024-03-01");
    const result = calculateMonthlyFinanceData(mockCashFlowData, currentDate);
    expect(result).toHaveLength(12);
  });

  it("should aggregate income and expenses by month", () => {
    const currentDate = new Date("2024-02-01");
    const result = calculateMonthlyFinanceData(mockCashFlowData, currentDate);

    const january = result.find((m) => m.month === "Jan");
    expect(january).toBeDefined();
    expect(january?.income).toBe(1000);
    expect(january?.expenses).toBe(300);
    expect(january?.net).toBe(700);
  });

  it("should calculate net correctly", () => {
    const currentDate = new Date("2024-02-01");
    const result = calculateMonthlyFinanceData(mockCashFlowData, currentDate);

    const january = result.find((m) => m.month === "Jan");
    expect(january?.net).toBe(january!.income - january!.expenses);
  });

  it("should handle empty cash flow data", () => {
    const currentDate = new Date("2024-03-01");
    const result = calculateMonthlyFinanceData([], currentDate);
    expect(result).toHaveLength(12);
    expect(result.every((m) => m.income === 0 && m.expenses === 0 && m.net === 0)).toBe(true);
  });

  it("should include all 12 months even with no data", () => {
    const currentDate = new Date("2024-03-01");
    const result = calculateMonthlyFinanceData([], currentDate);
    const monthNames = result.map((m) => m.month);
    expect(monthNames).toHaveLength(12);
  });

  it("should handle transactions at month boundaries", () => {
    const boundaryData: CashFlow[] = [
      {
        id: "1",
        type: "income",
        amount: 1000,
        date: "2024-01-31T23:59:59Z",
        companyId: "company-1",
        description: "Test income",
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.CASH,
        status: "completed",
        propertyId: "property-1",
        createdAt: "2024-01-31T23:59:59Z",
      },
      {
        id: "2",
        type: "income",
        amount: 500,
        date: "2024-02-01T00:00:00Z",
        companyId: "company-1",
        description: "Test income",
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.CASH,
        status: "completed",
        propertyId: "property-1",
        createdAt: "2024-02-01T00:00:00Z",
      },
    ];
    const currentDate = new Date("2024-02-15");
    const result = calculateMonthlyFinanceData(boundaryData, currentDate);
    expect(result).toBeDefined();
  });
});
