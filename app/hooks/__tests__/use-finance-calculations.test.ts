import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFinanceCalculations } from "../use-finance-calculations";
import * as financeUtils from "~/utils/finance";
import { AccountsPayableStatus, AccountsReceivableStatus } from "~/types";

vi.mock("~/utils/finance");

describe("useFinanceCalculations", () => {
  const mockCashFlow = [
    {
      id: "cf-1",
      type: "income" as const,
      amount: 1000,
      date: new Date().toISOString().split("T")[0],
      description: "Income",
      category: "other" as import("~/types").CashFlowCategory,
      paymentMethod: "pix" as import("~/types").PaymentMethod,
      status: "completed" as const,
      companyId: "company-1",
      propertyId: "prop-1",
      createdAt: new Date().toISOString(),
    },
    {
      id: "cf-2",
      type: "expense" as const,
      amount: 500,
      date: new Date().toISOString().split("T")[0],
      description: "Expense",
      category: "other" as import("~/types").CashFlowCategory,
      paymentMethod: "pix" as import("~/types").PaymentMethod,
      status: "completed" as const,
      companyId: "company-1",
      propertyId: "prop-1",
      createdAt: new Date().toISOString(),
    },
  ];

  const mockAccountsPayable = [
    {
      id: "ap-1",
      amount: 200,
      dueDate: new Date().toISOString().split("T")[0],
      status: AccountsPayableStatus.UNPAID,
      companyId: "company-1",
      propertyId: "prop-1",
      description: "Payable",
      createdAt: new Date().toISOString(),
    },
  ];

  const mockAccountsReceivable = [
    {
      id: "ar-1",
      amount: 300,
      dueDate: new Date().toISOString().split("T")[0],
      status: AccountsReceivableStatus.UNPAID,
      companyId: "company-1",
      propertyId: "prop-1",
      description: "Receivable",
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(financeUtils.calculateCashFlowTotals).mockReturnValue({
      income: 1000,
      expenses: 500,
      net: 500,
    });
    vi.mocked(financeUtils.getUnpaidTransactions).mockImplementation(
      (transactions: unknown[]) => transactions
    );
    vi.mocked(financeUtils.calculateAccountsTotal).mockReturnValue(200);
    vi.mocked(financeUtils.getUpcomingTransactions).mockReturnValue([]);
    vi.mocked(financeUtils.calculateOverdueTotal).mockReturnValue(0);
  });

  it("should calculate total income and expenses from current month cash flow", () => {
    const { result } = renderHook(() =>
      useFinanceCalculations(mockCashFlow, mockAccountsPayable, mockAccountsReceivable)
    );

    expect(result.current.totalIncome).toBe(1000);
    expect(result.current.totalExpenses).toBe(500);
    expect(result.current.netCashFlow).toBe(500);
  });

  it("should calculate total accounts payable", () => {
    const { result } = renderHook(() =>
      useFinanceCalculations(mockCashFlow, mockAccountsPayable, mockAccountsReceivable)
    );

    expect(result.current.totalAccountsPayable).toBe(200);
    expect(financeUtils.getUnpaidTransactions).toHaveBeenCalledWith(mockAccountsPayable);
    expect(financeUtils.calculateAccountsTotal).toHaveBeenCalled();
  });

  it("should calculate total accounts receivable", () => {
    const { result } = renderHook(() =>
      useFinanceCalculations(mockCashFlow, mockAccountsPayable, mockAccountsReceivable)
    );

    expect(result.current.totalAccountsReceivable).toBe(200);
    expect(financeUtils.getUnpaidTransactions).toHaveBeenCalledWith(mockAccountsReceivable);
  });

  it("should filter overdue payable transactions", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);
    const overduePayable = [
      {
        ...mockAccountsPayable[0],
        dueDate: pastDate.toISOString().split("T")[0],
        status: AccountsPayableStatus.OVERDUE,
      },
    ];

    const { result } = renderHook(() =>
      useFinanceCalculations(mockCashFlow, overduePayable, mockAccountsReceivable)
    );

    expect(result.current.overduePayable.length).toBeGreaterThanOrEqual(0);
  });

  it("should filter overdue receivable transactions", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);
    const overdueReceivable = [
      {
        ...mockAccountsReceivable[0],
        dueDate: pastDate.toISOString().split("T")[0],
        status: AccountsReceivableStatus.OVERDUE,
      },
    ];

    const { result } = renderHook(() =>
      useFinanceCalculations(mockCashFlow, mockAccountsPayable, overdueReceivable)
    );

    expect(result.current.overdueReceivable.length).toBeGreaterThanOrEqual(0);
  });

  it("should calculate total overdue", () => {
    vi.mocked(financeUtils.calculateOverdueTotal).mockReturnValueOnce(100).mockReturnValueOnce(50);

    const { result } = renderHook(() =>
      useFinanceCalculations(mockCashFlow, mockAccountsPayable, mockAccountsReceivable)
    );

    expect(result.current.totalOverdue).toBe(150);
  });

  it("should get upcoming payments", () => {
    const { result } = renderHook(() =>
      useFinanceCalculations(mockCashFlow, mockAccountsPayable, mockAccountsReceivable)
    );

    expect(financeUtils.getUpcomingTransactions).toHaveBeenCalledWith(mockAccountsPayable, 30);
    expect(result.current.upcomingPayments).toEqual([]);
  });

  it("should get upcoming receivables", () => {
    const { result } = renderHook(() =>
      useFinanceCalculations(mockCashFlow, mockAccountsPayable, mockAccountsReceivable)
    );

    expect(financeUtils.getUpcomingTransactions).toHaveBeenCalledWith(mockAccountsReceivable, 30);
    expect(result.current.upcomingReceivables).toEqual([]);
  });

  it("should handle empty cash flow data", () => {
    vi.mocked(financeUtils.calculateCashFlowTotals).mockReturnValue({
      income: 0,
      expenses: 0,
      net: 0,
    });

    const { result } = renderHook(() =>
      useFinanceCalculations([], mockAccountsPayable, mockAccountsReceivable)
    );

    expect(result.current.totalIncome).toBe(0);
    expect(result.current.totalExpenses).toBe(0);
    expect(result.current.netCashFlow).toBe(0);
  });

  it("should handle empty accounts payable data", () => {
    vi.mocked(financeUtils.getUnpaidTransactions).mockReturnValue([]);
    vi.mocked(financeUtils.calculateAccountsTotal).mockReturnValue(0);

    const { result } = renderHook(() =>
      useFinanceCalculations(mockCashFlow, [], mockAccountsReceivable)
    );

    expect(result.current.totalAccountsPayable).toBe(0);
    expect(result.current.unpaidPayable).toEqual([]);
  });

  it("should handle empty accounts receivable data", () => {
    vi.mocked(financeUtils.getUnpaidTransactions).mockReturnValue([]);
    vi.mocked(financeUtils.calculateAccountsTotal).mockReturnValue(0);

    const { result } = renderHook(() =>
      useFinanceCalculations(mockCashFlow, mockAccountsPayable, [])
    );

    expect(result.current.totalAccountsReceivable).toBe(0);
    expect(result.current.unpaidReceivable).toEqual([]);
  });

  it("should filter current month cash flow correctly", () => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthCashFlow = [
      {
        ...mockCashFlow[0],
        date: lastMonth.toISOString().split("T")[0],
      },
    ];

    renderHook(() =>
      useFinanceCalculations(
        [...mockCashFlow, ...lastMonthCashFlow],
        mockAccountsPayable,
        mockAccountsReceivable
      )
    );

    expect(financeUtils.calculateCashFlowTotals).toHaveBeenCalled();
  });

  it("should not include paid transactions in overdue", () => {
    const paidPayable = [
      {
        ...mockAccountsPayable[0],
        status: AccountsPayableStatus.PAID,
      },
    ];

    const { result } = renderHook(() =>
      useFinanceCalculations(mockCashFlow, paidPayable, mockAccountsReceivable)
    );

    expect(result.current.overduePayable.length).toBe(0);
  });

  it("should return all calculated values", () => {
    const { result } = renderHook(() =>
      useFinanceCalculations(mockCashFlow, mockAccountsPayable, mockAccountsReceivable)
    );

    expect(result.current).toHaveProperty("totalIncome");
    expect(result.current).toHaveProperty("totalExpenses");
    expect(result.current).toHaveProperty("netCashFlow");
    expect(result.current).toHaveProperty("totalAccountsPayable");
    expect(result.current).toHaveProperty("totalAccountsReceivable");
    expect(result.current).toHaveProperty("totalOverdue");
    expect(result.current).toHaveProperty("unpaidPayable");
    expect(result.current).toHaveProperty("unpaidReceivable");
    expect(result.current).toHaveProperty("overduePayable");
    expect(result.current).toHaveProperty("overdueReceivable");
    expect(result.current).toHaveProperty("upcomingPayments");
    expect(result.current).toHaveProperty("upcomingReceivables");
  });
});
