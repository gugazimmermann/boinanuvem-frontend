import { useState, useCallback } from "react";
import type { AccountsPayable, AccountsReceivable, CashFlow } from "~/types";
import { deleteAccountsPayable } from "~/services/accounts-payable.service";
import { deleteAccountsReceivable } from "~/services/accounts-receivable.service";
import { deleteCashFlow } from "~/services/cash-flow.service";

export type FinanceTransaction = AccountsPayable | AccountsReceivable | CashFlow;
export type FinanceTransactionType = "accounts-payable" | "accounts-receivable" | "cash-flow";

export interface UseFinanceTransactionDeleteOptions {
  transactionType: FinanceTransactionType;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  successMessage: string;
  errorMessage: string;
  onDeleteSuccess?: (transaction: FinanceTransaction) => void;
}

export interface UseFinanceTransactionDeleteReturn {
  isDeleteModalOpen: boolean;
  selectedTransaction: FinanceTransaction | null;
  handleDeleteClick: (transaction: FinanceTransaction) => void;
  handleDeleteTransaction: () => Promise<void>;
  handleCloseModal: () => void;
}

export function useFinanceTransactionDelete({
  transactionType,
  onSuccess,
  onError,
  successMessage,
  errorMessage,
  onDeleteSuccess,
}: UseFinanceTransactionDeleteOptions): UseFinanceTransactionDeleteReturn {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<FinanceTransaction | null>(null);

  const handleDeleteClick = useCallback((transaction: FinanceTransaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteTransaction = useCallback(async () => {
    if (!selectedTransaction) return;

    try {
      if (transactionType === "accounts-payable") {
        await deleteAccountsPayable(selectedTransaction.id);
      } else if (transactionType === "accounts-receivable") {
        await deleteAccountsReceivable(selectedTransaction.id);
      } else if (transactionType === "cash-flow") {
        await deleteCashFlow(selectedTransaction.id);
      }
      onSuccess(successMessage);
      onDeleteSuccess?.(selectedTransaction);
    } catch {
      onError(errorMessage);
    }

    setSelectedTransaction(null);
    setIsDeleteModalOpen(false);
  }, [
    selectedTransaction,
    transactionType,
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    onDeleteSuccess,
  ]);

  const handleCloseModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setSelectedTransaction(null);
  }, []);

  return {
    isDeleteModalOpen,
    selectedTransaction,
    handleDeleteClick,
    handleDeleteTransaction,
    handleCloseModal,
  };
}
