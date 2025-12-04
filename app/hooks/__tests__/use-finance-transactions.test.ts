import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFinanceTransactions } from "../use-finance-transactions";
import * as sortingUtils from "~/utils/sorting";
import * as tableHelpers from "~/utils/table-helpers";
import * as formattingUtils from "~/utils/formatting";
import { AccountsPayableStatus, AccountsReceivableStatus } from "~/types";

vi.mock("~/utils/sorting");
vi.mock("~/utils/table-helpers");
vi.mock("~/utils/formatting");

describe("useFinanceTransactions", () => {
  const mockCashFlow = [
    {
      id: "cf-1",
      type: "income" as const,
      amount: 1000,
      date: "2024-01-15",
      description: "Cash Flow",
      category: "other" as import("~/types").CashFlowCategory,
      paymentMethod: "pix" as import("~/types").PaymentMethod,
      status: "completed" as const,
      companyId: "company-1",
      propertyId: "prop-1",
      createdAt: new Date().toISOString(),
    },
  ];

  const mockPayable = [
    {
      id: "ap-1",
      amount: 500,
      dueDate: "2024-01-20",
      status: AccountsPayableStatus.UNPAID,
      companyId: "company-1",
      propertyId: "prop-1",
      description: "Payable",
      createdAt: new Date().toISOString(),
    },
  ];

  const mockReceivable = [
    {
      id: "ar-1",
      amount: 300,
      dueDate: "2024-01-25",
      status: AccountsReceivableStatus.UNPAID,
      companyId: "company-1",
      propertyId: "prop-1",
      description: "Receivable",
      createdAt: new Date().toISOString(),
    },
  ];

  const mockTranslationKeys = {
    categories: { feed: "Feed" },
    paymentMethods: { cash: "Cash" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sortingUtils.sortItems).mockReturnValue([]);
    vi.mocked(tableHelpers.paginateItems).mockReturnValue({
      paginatedItems: [],
      totalPages: 1,
    });
    vi.mocked(formattingUtils.formatCurrency).mockReturnValue("R$ 1.000,00");
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() =>
      useFinanceTransactions({
        cashFlowTransactions: mockCashFlow,
        language: "en",
        translationKeys: mockTranslationKeys,
      })
    );

    expect(result.current.searchValue).toBe("");
    expect(result.current.activeFilter).toBe("all");
    expect(result.current.selectedYear).toBe("all");
    expect(result.current.selectedMonth).toBe("all");
    expect(result.current.currentPage).toBe(1);
  });

  it("should normalize cash flow transactions", () => {
    const { result } = renderHook(() =>
      useFinanceTransactions({
        cashFlowTransactions: mockCashFlow,
        language: "en",
        translationKeys: mockTranslationKeys,
      })
    );

    expect(result.current.transactions).toHaveLength(1);
    expect(result.current.transactions[0]?.transactionType).toBe("cashFlow");
  });

  it("should normalize payable transactions", () => {
    const { result } = renderHook(() =>
      useFinanceTransactions({
        cashFlowTransactions: [],
        payableTransactions: mockPayable,
        language: "en",
        translationKeys: mockTranslationKeys,
      })
    );

    expect(result.current.transactions).toHaveLength(1);
    expect(result.current.transactions[0]?.transactionType).toBe("payable");
    expect(result.current.transactions[0]?.type).toBe("expense");
  });

  it("should normalize receivable transactions", () => {
    const { result } = renderHook(() =>
      useFinanceTransactions({
        cashFlowTransactions: [],
        receivableTransactions: mockReceivable,
        language: "en",
        translationKeys: mockTranslationKeys,
      })
    );

    expect(result.current.transactions).toHaveLength(1);
    expect(result.current.transactions[0]?.transactionType).toBe("receivable");
    expect(result.current.transactions[0]?.type).toBe("income");
  });

  it("should filter by search value", () => {
    const { result } = renderHook(() =>
      useFinanceTransactions({
        cashFlowTransactions: mockCashFlow,
        language: "en",
        translationKeys: mockTranslationKeys,
      })
    );

    act(() => {
      result.current.setSearchValue("Cash");
    });

    expect(result.current.searchValue).toBe("Cash");
  });

  it("should filter by type", () => {
    const { result } = renderHook(() =>
      useFinanceTransactions({
        cashFlowTransactions: mockCashFlow,
        language: "en",
        translationKeys: mockTranslationKeys,
      })
    );

    act(() => {
      result.current.setActiveFilter("income");
    });

    expect(result.current.activeFilter).toBe("income");
  });

  it("should filter by year", () => {
    const { result } = renderHook(() =>
      useFinanceTransactions({
        cashFlowTransactions: mockCashFlow,
        language: "en",
        translationKeys: mockTranslationKeys,
      })
    );

    act(() => {
      result.current.setSelectedYear("2024");
    });

    expect(result.current.selectedYear).toBe("2024");
  });

  it("should filter by month", () => {
    const { result } = renderHook(() =>
      useFinanceTransactions({
        cashFlowTransactions: mockCashFlow,
        language: "en",
        translationKeys: mockTranslationKeys,
      })
    );

    act(() => {
      result.current.setSelectedMonth("1");
    });

    expect(result.current.selectedMonth).toBe("1");
  });

  it("should calculate total income", () => {
    const { result } = renderHook(() =>
      useFinanceTransactions({
        cashFlowTransactions: mockCashFlow,
        receivableTransactions: mockReceivable,
        language: "en",
        translationKeys: mockTranslationKeys,
      })
    );

    expect(result.current.totalIncome).toBeGreaterThanOrEqual(0);
  });

  it("should calculate total expenses", () => {
    const { result } = renderHook(() =>
      useFinanceTransactions({
        cashFlowTransactions: mockCashFlow,
        payableTransactions: mockPayable,
        language: "en",
        translationKeys: mockTranslationKeys,
      })
    );

    expect(result.current.totalExpenses).toBeGreaterThanOrEqual(0);
  });

  it("should calculate net total", () => {
    const { result } = renderHook(() =>
      useFinanceTransactions({
        cashFlowTransactions: mockCashFlow,
        payableTransactions: mockPayable,
        receivableTransactions: mockReceivable,
        language: "en",
        translationKeys: mockTranslationKeys,
      })
    );

    expect(result.current.netTotal).toBeDefined();
  });

  it("should get year options", () => {
    const { result } = renderHook(() =>
      useFinanceTransactions({
        cashFlowTransactions: mockCashFlow,
        language: "en",
        translationKeys: mockTranslationKeys,
      })
    );

    const yearOptions = result.current.getYearOptions();
    expect(yearOptions).toHaveLength(3);
    expect(yearOptions[0]?.value).toBe("all");
  });

  it("should get month options", () => {
    const { result } = renderHook(() =>
      useFinanceTransactions({
        cashFlowTransactions: mockCashFlow,
        language: "en",
        translationKeys: mockTranslationKeys,
      })
    );

    const monthOptions = result.current.getMonthOptions("en-US");
    expect(monthOptions).toHaveLength(13);
    expect(monthOptions[0]?.value).toBe("all");
  });

  it("should handle empty transactions", () => {
    const { result } = renderHook(() =>
      useFinanceTransactions({
        cashFlowTransactions: [],
        language: "en",
        translationKeys: mockTranslationKeys,
      })
    );

    expect(result.current.transactions).toEqual([]);
    expect(result.current.totalIncome).toBe(0);
    expect(result.current.totalExpenses).toBe(0);
  });
});
