import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFinanceTransactionDelete } from "../use-finance-transaction-delete";
import * as cashFlowService from "~/services/cash-flow.service";
import * as accountsPayableService from "~/services/accounts-payable.service";
import * as accountsReceivableService from "~/services/accounts-receivable.service";

vi.mock("~/services/cash-flow.service");
vi.mock("~/services/accounts-payable.service");
vi.mock("~/services/accounts-receivable.service");

describe("useFinanceTransactionDelete", () => {
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();
  const mockOnDeleteSuccess = vi.fn();

  const defaultOptions = {
    transactionType: "cash-flow" as const,
    onSuccess: mockOnSuccess,
    onError: mockOnError,
    successMessage: "Success",
    errorMessage: "Error",
  };

  const mockTransaction = {
    id: "transaction-1",
    amount: 1000,
    description: "Test",
    companyId: "company-1",
    propertyId: "prop-1",
    dueDate: "2024-01-15",
    status: "unpaid" as const,
    createdAt: new Date().toISOString(),
  } as import("~/types").AccountsPayable;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with closed modal", () => {
    const { result } = renderHook(() => useFinanceTransactionDelete(defaultOptions));

    expect(result.current.isDeleteModalOpen).toBe(false);
    expect(result.current.selectedTransaction).toBeNull();
  });

  it("should open modal and set selected transaction", () => {
    const { result } = renderHook(() => useFinanceTransactionDelete(defaultOptions));

    act(() => {
      result.current.handleDeleteClick(mockTransaction);
    });

    expect(result.current.isDeleteModalOpen).toBe(true);
    expect(result.current.selectedTransaction).toEqual(mockTransaction);
  });

  it("should delete cash flow transaction successfully", async () => {
    vi.mocked(cashFlowService.deleteCashFlow).mockReturnValue(true);

    const { result } = renderHook(() => useFinanceTransactionDelete(defaultOptions));

    act(() => {
      result.current.handleDeleteClick(mockTransaction);
    });

    await act(async () => {
      await result.current.handleDeleteTransaction();
    });

    expect(cashFlowService.deleteCashFlow).toHaveBeenCalledWith("transaction-1");
    expect(mockOnSuccess).toHaveBeenCalledWith("Success");
    expect(mockOnDeleteSuccess).not.toHaveBeenCalled();
    expect(result.current.isDeleteModalOpen).toBe(false);
    expect(result.current.selectedTransaction).toBeNull();
  });

  it("should delete accounts payable transaction successfully", async () => {
    vi.mocked(accountsPayableService.deleteAccountsPayable).mockReturnValue(true);

    const { result } = renderHook(() =>
      useFinanceTransactionDelete({
        ...defaultOptions,
        transactionType: "accounts-payable",
        onDeleteSuccess: mockOnDeleteSuccess,
      })
    );

    act(() => {
      result.current.handleDeleteClick(mockTransaction);
    });

    await act(async () => {
      await result.current.handleDeleteTransaction();
    });

    expect(accountsPayableService.deleteAccountsPayable).toHaveBeenCalledWith("transaction-1");
    expect(mockOnSuccess).toHaveBeenCalledWith("Success");
    expect(mockOnDeleteSuccess).toHaveBeenCalledWith(mockTransaction);
  });

  it("should delete accounts receivable transaction successfully", async () => {
    vi.mocked(accountsReceivableService.deleteAccountsReceivable).mockReturnValue(true);

    const { result } = renderHook(() =>
      useFinanceTransactionDelete({
        ...defaultOptions,
        transactionType: "accounts-receivable",
      })
    );

    act(() => {
      result.current.handleDeleteClick(mockTransaction);
    });

    await act(async () => {
      await result.current.handleDeleteTransaction();
    });

    expect(accountsReceivableService.deleteAccountsReceivable).toHaveBeenCalledWith(
      "transaction-1"
    );
    expect(mockOnSuccess).toHaveBeenCalledWith("Success");
  });

  it("should handle failed deletion", async () => {
    vi.mocked(cashFlowService.deleteCashFlow).mockReturnValue(false);

    const { result } = renderHook(() => useFinanceTransactionDelete(defaultOptions));

    act(() => {
      result.current.handleDeleteClick(mockTransaction);
    });

    await act(async () => {
      await result.current.handleDeleteTransaction();
    });

    expect(mockOnError).toHaveBeenCalledWith("Error");
    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(result.current.isDeleteModalOpen).toBe(false);
  });

  it("should not delete when no transaction is selected", async () => {
    const { result } = renderHook(() => useFinanceTransactionDelete(defaultOptions));

    await act(async () => {
      await result.current.handleDeleteTransaction();
    });

    expect(cashFlowService.deleteCashFlow).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnError).not.toHaveBeenCalled();
  });

  it("should close modal when handleCloseModal is called", () => {
    const { result } = renderHook(() => useFinanceTransactionDelete(defaultOptions));

    act(() => {
      result.current.handleDeleteClick(mockTransaction);
    });

    expect(result.current.isDeleteModalOpen).toBe(true);

    act(() => {
      result.current.handleCloseModal();
    });

    expect(result.current.isDeleteModalOpen).toBe(false);
    expect(result.current.selectedTransaction).toBeNull();
  });

  it("should call onDeleteSuccess when provided and deletion succeeds", async () => {
    vi.mocked(cashFlowService.deleteCashFlow).mockReturnValue(true);

    const { result } = renderHook(() =>
      useFinanceTransactionDelete({
        ...defaultOptions,
        onDeleteSuccess: mockOnDeleteSuccess,
      })
    );

    act(() => {
      result.current.handleDeleteClick(mockTransaction);
    });

    await act(async () => {
      await result.current.handleDeleteTransaction();
    });

    expect(mockOnDeleteSuccess).toHaveBeenCalledWith(mockTransaction);
  });
});
