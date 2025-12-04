import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFinanceList } from "../use-finance-list";
import * as useFinanceFiltersHook from "../use-finance-filters";
import * as useFinanceSortHook from "../use-finance-sort";
import * as tableHelpers from "~/utils/table-helpers";

vi.mock("../use-finance-filters");
vi.mock("../use-finance-sort");
vi.mock("~/utils/table-helpers");

describe("useFinanceList", () => {
  const mockTransactions = [
    {
      id: "cf-1",
      type: "income" as const,
      amount: 1000,
      date: "2024-01-15",
      description: "Transaction 1",
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
      date: "2024-01-20",
      description: "Transaction 2",
      category: "other" as import("~/types").CashFlowCategory,
      paymentMethod: "pix" as import("~/types").PaymentMethod,
      status: "completed" as const,
      companyId: "company-1",
      propertyId: "prop-1",
      createdAt: new Date().toISOString(),
    },
  ] as import("~/types").CashFlow[];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFinanceFiltersHook.useFinanceFilters).mockReturnValue(mockTransactions);
    vi.mocked(useFinanceSortHook.useFinanceSort).mockReturnValue(mockTransactions);
    vi.mocked(tableHelpers.paginateItems).mockReturnValue({
      paginatedItems: mockTransactions,
      totalPages: 1,
    });
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() =>
      useFinanceList({
        data: mockTransactions,
      })
    );

    expect(result.current.searchValue).toBe("");
    expect(result.current.activeFilter).toBe("all");
    expect(result.current.propertyFilter).toBe("all");
    expect(result.current.selectedYear).toBe("all");
    expect(result.current.selectedMonth).toBe("all");
    expect(result.current.currentPage).toBe(1);
  });

  it("should initialize with custom initialSort", () => {
    const { result } = renderHook(() =>
      useFinanceList({
        data: mockTransactions,
        initialSort: { column: "amount", direction: "desc" },
      })
    );

    expect(result.current.sortState.column).toBe("amount");
    expect(result.current.sortState.direction).toBe("desc");
  });

  it("should update search value", () => {
    const { result } = renderHook(() =>
      useFinanceList({
        data: mockTransactions,
      })
    );

    act(() => {
      result.current.setSearchValue("test");
    });

    expect(result.current.searchValue).toBe("test");
  });

  it("should update active filter", () => {
    const { result } = renderHook(() =>
      useFinanceList({
        data: mockTransactions,
      })
    );

    act(() => {
      result.current.setActiveFilter("income");
    });

    expect(result.current.activeFilter).toBe("income");
  });

  it("should calculate total amount", () => {
    const { result } = renderHook(() =>
      useFinanceList({
        data: mockTransactions,
      })
    );

    expect(result.current.totalAmount).toBe(1500);
  });

  it("should handle sort", () => {
    const { result } = renderHook(() =>
      useFinanceList({
        data: mockTransactions,
      })
    );

    act(() => {
      result.current.handleSort("amount", "desc");
    });

    expect(result.current.sortState.column).toBe("amount");
    expect(result.current.sortState.direction).toBe("desc");
    expect(result.current.currentPage).toBe(1);
  });

  it("should reset to page 1 when sorting", () => {
    const { result } = renderHook(() =>
      useFinanceList({
        data: mockTransactions,
      })
    );

    act(() => {
      result.current.setCurrentPage(2);
    });

    act(() => {
      result.current.handleSort("amount", "asc");
    });

    expect(result.current.currentPage).toBe(1);
  });

  it("should use custom itemsPerPage", () => {
    renderHook(() =>
      useFinanceList({
        data: mockTransactions,
        itemsPerPage: 5,
      })
    );

    expect(tableHelpers.paginateItems).toHaveBeenCalledWith(expect.any(Array), 1, 5);
  });

  it("should include supplier filter when enabled", () => {
    renderHook(() =>
      useFinanceList({
        data: mockTransactions,
        filterConfig: { enableSupplierFilter: true },
      })
    );

    expect(useFinanceFiltersHook.useFinanceFilters).toHaveBeenCalled();
  });

  it("should include buyer filter when enabled", () => {
    renderHook(() =>
      useFinanceList({
        data: mockTransactions,
        filterConfig: { enableBuyerFilter: true },
      })
    );

    expect(useFinanceFiltersHook.useFinanceFilters).toHaveBeenCalled();
  });

  it("should expose resetFilters function", () => {
    const { result } = renderHook(() =>
      useFinanceList({
        data: mockTransactions,
      })
    );

    act(() => {
      result.current.setSearchValue("test");
      result.current.setActiveFilter("income");
    });

    act(() => {
      (result.current as unknown as { resetFilters: () => void }).resetFilters();
    });

    expect(result.current.searchValue).toBe("");
    expect(result.current.activeFilter).toBe("all");
    expect(result.current.currentPage).toBe(1);
  });
});
