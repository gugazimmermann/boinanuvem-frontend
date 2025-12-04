import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFinanceTransactionHandlers } from "../use-finance-transaction-handlers";
import * as cashFlowService from "~/services/cash-flow.service";
import { AccountsPayableStatus, AccountsReceivableStatus } from "~/types";

vi.mock("~/services/cash-flow.service");
vi.mock("~/services/accounts-payable.service");
vi.mock("~/services/accounts-receivable.service");

describe("useFinanceTransactionHandlers", () => {
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();

  const mockCashFlowTransactions = [
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

  const mockPayableTransactions = [
    {
      id: "ap-1",
      amount: 500,
      dueDate: "2024-01-15",
      status: AccountsPayableStatus.UNPAID,
      companyId: "company-1",
      propertyId: "prop-1",
      description: "Payable",
      createdAt: new Date().toISOString(),
    },
  ];

  const mockReceivableTransactions = [
    {
      id: "ar-1",
      amount: 300,
      dueDate: "2024-01-15",
      status: AccountsReceivableStatus.UNPAID,
      companyId: "company-1",
      propertyId: "prop-1",
      description: "Receivable",
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with closed modal", () => {
    const { result } = renderHook(() =>
      useFinanceTransactionHandlers({
        cashFlowTransactions: mockCashFlowTransactions,
        payableTransactions: mockPayableTransactions,
        receivableTransactions: mockReceivableTransactions,
      })
    );

    expect(result.current.isDeleteModalOpen).toBe(false);
    expect(result.current.selectedTransaction).toBeNull();
    expect(result.current.selectedTransactionType).toBeNull();
  });

  it("should handle delete click for cash flow transaction", () => {
    const { result } = renderHook(() =>
      useFinanceTransactionHandlers({
        cashFlowTransactions: mockCashFlowTransactions,
      })
    );

    act(() => {
      result.current.handleDeleteClick({
        id: "cf-1",
        transactionType: "cashFlow",
        type: "income",
        amount: 1000,
        date: "2024-01-15",
        description: "Cash Flow",
        status: "completed",
      });
    });

    expect(result.current.isDeleteModalOpen).toBe(true);
    expect(result.current.selectedTransaction).toEqual(mockCashFlowTransactions[0]);
    expect(result.current.selectedTransactionType).toBe("cashFlow");
  });

  it("should handle delete click for payable transaction", () => {
    const { result } = renderHook(() =>
      useFinanceTransactionHandlers({
        cashFlowTransactions: [],
        payableTransactions: mockPayableTransactions,
      })
    );

    act(() => {
      result.current.handleDeleteClick({
        id: "ap-1",
        transactionType: "payable",
        type: "expense",
        amount: 500,
        date: "2024-01-15",
        description: "Payable",
        status: "unpaid",
      });
    });

    expect(result.current.selectedTransaction).toEqual(mockPayableTransactions[0]);
    expect(result.current.selectedTransactionType).toBe("payable");
  });

  it("should handle delete click for receivable transaction", () => {
    const { result } = renderHook(() =>
      useFinanceTransactionHandlers({
        cashFlowTransactions: [],
        receivableTransactions: mockReceivableTransactions,
      })
    );

    act(() => {
      result.current.handleDeleteClick({
        id: "ar-1",
        transactionType: "receivable",
        type: "income",
        amount: 300,
        date: "2024-01-15",
        description: "Receivable",
        status: "unpaid",
      });
    });

    expect(result.current.selectedTransaction).toEqual(mockReceivableTransactions[0]);
    expect(result.current.selectedTransactionType).toBe("receivable");
  });

  it("should delete cash flow transaction successfully", async () => {
    vi.mocked(cashFlowService.deleteCashFlow).mockReturnValue(true);

    const { result } = renderHook(() =>
      useFinanceTransactionHandlers({
        cashFlowTransactions: mockCashFlowTransactions,
        onSuccess: mockOnSuccess,
        successMessage: "Deleted",
      })
    );

    act(() => {
      result.current.handleDeleteClick({
        id: "cf-1",
        transactionType: "cashFlow",
        type: "income",
        amount: 1000,
        date: "2024-01-15",
        description: "Cash Flow",
        status: "completed",
      });
    });

    await act(async () => {
      await result.current.handleDeleteConfirm();
    });

    expect(cashFlowService.deleteCashFlow).toHaveBeenCalledWith("cf-1");
    expect(mockOnSuccess).toHaveBeenCalledWith("Deleted");
    expect(result.current.isDeleteModalOpen).toBe(false);
  });

  it("should handle delete failure", async () => {
    vi.mocked(cashFlowService.deleteCashFlow).mockReturnValue(false);

    const { result } = renderHook(() =>
      useFinanceTransactionHandlers({
        cashFlowTransactions: mockCashFlowTransactions,
        onError: mockOnError,
        errorMessage: "Failed",
      })
    );

    act(() => {
      result.current.handleDeleteClick({
        id: "cf-1",
        transactionType: "cashFlow",
        type: "income",
        amount: 1000,
        date: "2024-01-15",
        description: "Cash Flow",
        status: "completed",
      });
    });

    await act(async () => {
      await result.current.handleDeleteConfirm();
    });

    expect(mockOnError).toHaveBeenCalledWith("Failed");
  });

  it("should get status variant for cash flow", () => {
    const { result } = renderHook(() =>
      useFinanceTransactionHandlers({
        cashFlowTransactions: mockCashFlowTransactions,
      })
    );

    const variant = result.current.getStatusVariant("completed", "cashFlow");
    expect(variant).toBe("success");
  });

  it("should get status variant for payable", () => {
    const { result } = renderHook(() =>
      useFinanceTransactionHandlers({
        cashFlowTransactions: mockCashFlowTransactions,
      })
    );

    expect(result.current.getStatusVariant("paid", "payable")).toBe("success");
    expect(result.current.getStatusVariant("overdue", "payable")).toBe("danger");
    expect(result.current.getStatusVariant("partial", "payable")).toBe("warning");
    expect(result.current.getStatusVariant("unpaid", "payable")).toBe("default");
  });

  it("should get status label for cash flow", () => {
    const { result } = renderHook(() =>
      useFinanceTransactionHandlers({
        cashFlowTransactions: mockCashFlowTransactions,
      })
    );

    const label = result.current.getStatusLabel("completed", "cashFlow", {
      cashFlow: { completed: "Completed" },
    });
    expect(label).toBe("Completed");
  });

  it("should get status label for payable", () => {
    const { result } = renderHook(() =>
      useFinanceTransactionHandlers({
        cashFlowTransactions: mockCashFlowTransactions,
      })
    );

    const label = result.current.getStatusLabel("paid", "payable", {
      accountsPayable: { status: { paid: "Paid" } },
    });
    expect(label).toBe("Paid");
  });

  it("should not open modal if transaction not found", () => {
    const { result } = renderHook(() =>
      useFinanceTransactionHandlers({
        cashFlowTransactions: mockCashFlowTransactions,
      })
    );

    act(() => {
      result.current.handleDeleteClick({
        id: "non-existent",
        transactionType: "cashFlow",
        type: "income",
        amount: 1000,
        date: "2024-01-15",
        description: "Not Found",
        status: "completed",
      });
    });

    expect(result.current.isDeleteModalOpen).toBe(false);
  });

  it("should not delete when no transaction selected", async () => {
    const { result } = renderHook(() =>
      useFinanceTransactionHandlers({
        cashFlowTransactions: mockCashFlowTransactions,
      })
    );

    await act(async () => {
      await result.current.handleDeleteConfirm();
    });

    expect(cashFlowService.deleteCashFlow).not.toHaveBeenCalled();
  });

  it("should use default messages when not provided", async () => {
    vi.mocked(cashFlowService.deleteCashFlow).mockReturnValue(true);

    const { result } = renderHook(() =>
      useFinanceTransactionHandlers({
        cashFlowTransactions: mockCashFlowTransactions,
        onSuccess: mockOnSuccess,
      })
    );

    act(() => {
      result.current.handleDeleteClick({
        id: "cf-1",
        transactionType: "cashFlow",
        type: "income",
        amount: 1000,
        date: "2024-01-15",
        description: "Cash Flow",
        status: "completed",
      });
    });

    await act(async () => {
      await result.current.handleDeleteConfirm();
    });

    expect(mockOnSuccess).toHaveBeenCalledWith("Transaction deleted successfully");
  });
});
