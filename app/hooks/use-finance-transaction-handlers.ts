import { useState, useCallback } from "react";
import type { CashFlow, AccountsPayable, AccountsReceivable } from "~/types";
import type { UnifiedTransaction } from "~/hooks/use-finance-transactions";
import { deleteCashFlow } from "~/services/cash-flow.service";
import { deleteAccountsPayable } from "~/services/accounts-payable.service";
import { deleteAccountsReceivable } from "~/services/accounts-receivable.service";

type FinanceTransactionType = "cashFlow" | "payable" | "receivable";
type StatusVariant = "success" | "danger" | "warning" | "default";
export type FinanceTransaction = CashFlow | AccountsPayable | AccountsReceivable;

export interface UseFinanceTransactionHandlersOptions {
  cashFlowTransactions: CashFlow[];
  payableTransactions?: AccountsPayable[];
  receivableTransactions?: AccountsReceivable[];
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  successMessage?: string;
  errorMessage?: string;
}

export interface FinanceTransactionHandlers {
  handleDeleteClick: (transaction: UnifiedTransaction) => void;
  handleDeleteConfirm: () => Promise<void>;
  getStatusVariant: (status: string, transactionType: string) => StatusVariant;
  getStatusLabel: (
    status: string,
    transactionType: string,
    translations: {
      cashFlow?: { completed: string };
      accountsPayable?: { status: Record<string, string> };
      accountsReceivable?: { status: Record<string, string> };
    }
  ) => string;
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (open: boolean) => void;
  selectedTransaction: FinanceTransaction | null;
  selectedTransactionType: FinanceTransactionType | null;
}

export function useFinanceTransactionHandlers({
  cashFlowTransactions,
  payableTransactions = [],
  receivableTransactions = [],
  onSuccess,
  onError,
  successMessage,
  errorMessage,
}: UseFinanceTransactionHandlersOptions): FinanceTransactionHandlers {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<FinanceTransaction | null>(null);
  const [selectedTransactionType, setSelectedTransactionType] = useState<
    "cashFlow" | "payable" | "receivable" | null
  >(null);

  const handleDeleteClick = useCallback(
    (transaction: UnifiedTransaction) => {
      let originalTransaction: FinanceTransaction | null = null;
      let transactionType: "cashFlow" | "payable" | "receivable" | null = null;

      if (transaction.transactionType === "cashFlow") {
        const found = cashFlowTransactions.find((t) => t.id === transaction.id);
        if (found) {
          originalTransaction = found;
          transactionType = "cashFlow";
        }
      } else if (transaction.transactionType === "payable") {
        const found = payableTransactions.find((t) => t.id === transaction.id);
        if (found) {
          originalTransaction = found;
          transactionType = "payable";
        }
      } else if (transaction.transactionType === "receivable") {
        const found = receivableTransactions.find((t) => t.id === transaction.id);
        if (found) {
          originalTransaction = found;
          transactionType = "receivable";
        }
      }

      if (originalTransaction && transactionType) {
        setSelectedTransaction(originalTransaction);
        setSelectedTransactionType(transactionType);
        setIsDeleteModalOpen(true);
      }
    },
    [cashFlowTransactions, payableTransactions, receivableTransactions]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedTransaction || !selectedTransactionType) return;

    let success = false;
    if (selectedTransactionType === "cashFlow") {
      success = deleteCashFlow(selectedTransaction.id);
    } else if (selectedTransactionType === "payable") {
      success = deleteAccountsPayable(selectedTransaction.id);
    } else if (selectedTransactionType === "receivable") {
      success = deleteAccountsReceivable(selectedTransaction.id);
    }

    if (success) {
      const message = successMessage || "Transaction deleted successfully";
      onSuccess?.(message);
    } else {
      const message = errorMessage || "Failed to delete transaction";
      onError?.(message);
    }

    setSelectedTransaction(null);
    setSelectedTransactionType(null);
    setIsDeleteModalOpen(false);
  }, [
    selectedTransaction,
    selectedTransactionType,
    successMessage,
    errorMessage,
    onSuccess,
    onError,
  ]);

  const getStatusVariant = useCallback(
    (status: string, transactionType: string): "success" | "danger" | "warning" | "default" => {
      if (transactionType === "cashFlow") {
        return "success";
      }
      if (transactionType === "payable" || transactionType === "receivable") {
        switch (status) {
          case "paid":
            return "success";
          case "overdue":
            return "danger";
          case "partial":
            return "warning";
          default:
            return "default";
        }
      }
      return "default";
    },
    []
  );

  const getStatusLabel = useCallback(
    (
      status: string,
      transactionType: string,
      translations: {
        cashFlow?: { completed: string };
        accountsPayable?: { status: Record<string, string> };
        accountsReceivable?: { status: Record<string, string> };
      }
    ): string => {
      if (transactionType === "cashFlow") {
        return translations.cashFlow?.completed || "Completed";
      }
      if (transactionType === "payable") {
        return translations.accountsPayable?.status[status] || status;
      }
      if (transactionType === "receivable") {
        return translations.accountsReceivable?.status[status] || status;
      }
      return status;
    },
    []
  );

  return {
    handleDeleteClick,
    handleDeleteConfirm,
    getStatusVariant,
    getStatusLabel,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    selectedTransaction,
    selectedTransactionType,
  };
}
