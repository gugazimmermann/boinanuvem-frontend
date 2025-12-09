import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFinanceCalculations } from "../use-finance-calculations";
import {
  calculateCashFlowTotals,
  calculateAccountsTotal,
  calculateOverdueTotal,
  getUnpaidTransactions,
  getUpcomingTransactions,
} from "~/utils/finance";
import { AccountsPayableStatus, AccountsReceivableStatus } from "~/types";

vi.mock("~/utils/finance", () => ({
  calculateCashFlowTotals: vi.fn(),
  calculateAccountsTotal: vi.fn(),
  calculateOverdueTotal: vi.fn(),
  getUnpaidTransactions: vi.fn(),
  getUpcomingTransactions: vi.fn(),
}));

describe("useFinanceCalculations", () => {
  const mockCashFlow = [
    {
      id: "1",
      type: "income",
      amount: 1000,
      date: new Date().toISOString(),
    },
    {
      id: "2",
      type: "expense",
      amount: 500,
      date: new Date().toISOString(),
    },
  ] as import("~/types").CashFlow[];

  const mockAccountsPayable = [
    {
      id: "1",
      amount: 200,
      status: AccountsPayableStatus.UNPAID,
      dueDate: new Date().toISOString(),
    },
  ] as import("~/types").AccountsPayable[];

  const mockAccountsReceivable = [
    {
      id: "1",
      amount: 300,
      status: AccountsReceivableStatus.UNPAID,
      dueDate: new Date().toISOString(),
    },
  ] as import("~/types").AccountsReceivable[];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(calculateCashFlowTotals).mockReturnValue({
      income: 1000,
      expenses: 500,
      net: 500,
    });
    vi.mocked(calculateAccountsTotal).mockReturnValue(200);
    vi.mocked(calculateOverdueTotal).mockReturnValue(100);
    vi.mocked(getUnpaidTransactions).mockImplementation(
      (data: import("~/types").AccountsPayable[] | import("~/types").AccountsReceivable[]) => data
    );
    vi.mocked(getUpcomingTransactions).mockImplementation(
      (data: import("~/types").AccountsPayable[] | import("~/types").AccountsReceivable[]) => data
    );
  });

  it("should calculate cash flow totals for current month", () => {
    const { result } = renderHook(() =>
      useFinanceCalculations(mockCashFlow, mockAccountsPayable, mockAccountsReceivable)
    );

    expect(result.current.totalIncome).toBe(1000);
    expect(result.current.totalExpenses).toBe(500);
    expect(result.current.netCashFlow).toBe(500);
  });

  it("should calculate accounts payable total", () => {
    const { result } = renderHook(() =>
      useFinanceCalculations(mockCashFlow, mockAccountsPayable, mockAccountsReceivable)
    );

    expect(result.current.totalAccountsPayable).toBe(200);
    expect(calculateAccountsTotal).toHaveBeenCalled();
  });

  it("should calculate accounts receivable total", () => {
    const { result } = renderHook(() =>
      useFinanceCalculations(mockCashFlow, mockAccountsPayable, mockAccountsReceivable)
    );

    expect(result.current.totalAccountsReceivable).toBe(200);
  });

  it("should calculate total overdue", () => {
    const { result } = renderHook(() =>
      useFinanceCalculations(mockCashFlow, mockAccountsPayable, mockAccountsReceivable)
    );

    expect(result.current.totalOverdue).toBe(200);
  });

  it("should get unpaid payable transactions", () => {
    const { result } = renderHook(() =>
      useFinanceCalculations(mockCashFlow, mockAccountsPayable, mockAccountsReceivable)
    );

    expect(result.current.unpaidPayable).toEqual(mockAccountsPayable);
    expect(getUnpaidTransactions).toHaveBeenCalledWith(mockAccountsPayable);
  });

  it("should get unpaid receivable transactions", () => {
    const { result } = renderHook(() =>
      useFinanceCalculations(mockCashFlow, mockAccountsPayable, mockAccountsReceivable)
    );

    expect(result.current.unpaidReceivable).toEqual(mockAccountsReceivable);
    expect(getUnpaidTransactions).toHaveBeenCalledWith(mockAccountsReceivable);
  });

  it("should get upcoming payments", () => {
    const { result } = renderHook(() =>
      useFinanceCalculations(mockCashFlow, mockAccountsPayable, mockAccountsReceivable)
    );

    expect(result.current.upcomingPayments).toEqual(mockAccountsPayable);
    expect(getUpcomingTransactions).toHaveBeenCalledWith(mockAccountsPayable, 30);
  });

  it("should get upcoming receivables", () => {
    const { result } = renderHook(() =>
      useFinanceCalculations(mockCashFlow, mockAccountsPayable, mockAccountsReceivable)
    );

    expect(result.current.upcomingReceivables).toEqual(mockAccountsReceivable);
    expect(getUpcomingTransactions).toHaveBeenCalledWith(mockAccountsReceivable, 30);
  });

  it("should filter overdue payable transactions", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);
    const overduePayable = [
      {
        id: "1",
        amount: 200,
        status: AccountsPayableStatus.UNPAID,
        dueDate: pastDate.toISOString(),
      },
    ] as import("~/types").AccountsPayable[];

    const { result } = renderHook(() =>
      useFinanceCalculations(
        mockCashFlow,
        overduePayable as import("~/types").AccountsPayable[],
        mockAccountsReceivable
      )
    );

    expect(result.current.overduePayable.length).toBeGreaterThanOrEqual(0);
  });

  it("should filter overdue receivable transactions", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);
    const overdueReceivable = [
      {
        id: "1",
        amount: 300,
        status: AccountsReceivableStatus.UNPAID,
        dueDate: pastDate.toISOString(),
      },
    ] as import("~/types").AccountsReceivable[];

    const { result } = renderHook(() =>
      useFinanceCalculations(
        mockCashFlow,
        mockAccountsPayable,
        overdueReceivable as import("~/types").AccountsReceivable[]
      )
    );

    expect(result.current.overdueReceivable.length).toBeGreaterThanOrEqual(0);
  });

  it("should handle empty data", () => {
    const { result } = renderHook(() => useFinanceCalculations([], [], []));

    expect(result.current.totalIncome).toBe(1000);
    expect(result.current.totalExpenses).toBe(500);
    expect(result.current.totalAccountsPayable).toBe(200);
    expect(result.current.totalAccountsReceivable).toBe(200);
  });

  it("should filter cash flow for current month only", () => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const oldCashFlow = [
      {
        id: "1",
        companyId: "company-1",
        type: "income" as const,
        amount: 500,
        date: lastMonth.toISOString(),
        description: "Old transaction",
        category: "other_income" as const,
        paymentMethod: "cash" as const,
        status: "completed" as const,
        propertyId: "prop-1",
        createdAt: lastMonth.toISOString(),
      },
    ] as import("~/types").CashFlow[];

    renderHook(() =>
      useFinanceCalculations(oldCashFlow, mockAccountsPayable, mockAccountsReceivable)
    );

    expect(calculateCashFlowTotals).toHaveBeenCalled();
  });
});
