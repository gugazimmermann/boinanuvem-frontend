import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { usePermissions } from "~/utils/permissions";
import type { CashFlow, AccountsPayable, AccountsReceivable } from "~/types";
import type { UnifiedTransaction } from "~/hooks/use-finance-transactions";
import { useFinanceTransactions } from "~/hooks/use-finance-transactions";
import {
  useFinanceTransactionHandlers,
  type FinanceTransactionHandlers,
} from "~/hooks/use-finance-transaction-handlers";
import {
  getCashFlowEditRoute,
  getCashFlowViewRoute,
  getAccountsPayableEditRoute,
  getAccountsPayableViewRoute,
  getAccountsReceivableEditRoute,
  getAccountsReceivableViewRoute,
} from "~/routes.config";

export type EntityFinanceTransactionType = "employee" | "serviceProvider" | "supplier" | "buyer";

export interface UseEntityFinanceTransactionsOptions {
  entityType: EntityFinanceTransactionType;
  cashFlowTransactions: CashFlow[];
  payableTransactions?: AccountsPayable[];
  receivableTransactions?: AccountsReceivable[];
  getPropertyById?: (id: string) => { name: string } | null;
  getSupplierById?: (id: string) => { name: string } | null;
  getBuyerById?: (id: string) => { name: string } | null;
  getEmployeeById?: (id: string) => { name: string } | null;
  getServiceProviderById?: (id: string) => { name: string } | null;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export interface EntityFinanceTransactionsResult {
  financeTransactions: ReturnType<typeof useFinanceTransactions>;
  financeHandlers: FinanceTransactionHandlers;
  getStatusLabel: (status: string, transactionType: string) => string;
  getEditRoute: (transaction: UnifiedTransaction) => string;
  getViewRoute: (transaction: UnifiedTransaction) => string;
  canEdit: (transaction: UnifiedTransaction) => boolean;
  canDelete: (transaction: UnifiedTransaction) => boolean;
  translationKeys: {
    categories: Record<string, string>;
    paymentMethods: Record<string, string>;
    searchPlaceholder: string;
    filters: {
      all: string;
      income: string;
      expense: string;
      allYears: string;
      allMonths: string;
    };
    table: {
      type: string;
      amount: string;
      date: string;
      property: string;
      category: string;
      description: string;
      paymentMethod: string;
      referenceNumber: string;
      status: string;
      income: string;
      expense: string;
      completed: string;
    };
    emptyState: {
      title: string;
      descriptionWithSearch: string;
      descriptionWithoutSearch: string;
    };
    deleteModal: {
      title: string;
      message: string;
      confirm: string;
      cancel: string;
    };
    badge: {
      transactions: (count: number) => string;
    };
    status: Record<string, string>;
  };
  title: string;
  description: string;
}

export function useEntityFinanceTransactions({
  entityType,
  cashFlowTransactions,
  payableTransactions,
  receivableTransactions,
  getPropertyById,
  getSupplierById,
  getBuyerById,
  getEmployeeById,
  getServiceProviderById,
  onSuccess,
  onError,
}: UseEntityFinanceTransactionsOptions): EntityFinanceTransactionsResult {
  const t = useTranslation();
  const { language } = useLanguage();
  const { canEdit: canEditPermission, canRemove } = usePermissions();

  const financeTransactions = useFinanceTransactions({
    cashFlowTransactions,
    payableTransactions,
    receivableTransactions,
    language,
    translationKeys: {
      categories: t.cashFlow.categories as Record<string, string>,
      paymentMethods: t.cashFlow.paymentMethods as Record<string, string>,
    },
    getPropertyById,
    getSupplierById,
    getBuyerById,
    getEmployeeById,
    getServiceProviderById,
  });

  const financeHandlers = useFinanceTransactionHandlers({
    cashFlowTransactions,
    payableTransactions,
    receivableTransactions,
    onSuccess,
    onError,
    successMessage: t.cashFlow.success.deleted,
    errorMessage: t.cashFlow.errors.deleteFailed,
  });

  const getStatusLabel = (status: string, transactionType: string) => {
    return financeHandlers.getStatusLabel(status, transactionType, {
      cashFlow: { completed: t.cashFlow.table.completed },
      accountsPayable: { status: t.accountsPayable.status },
      accountsReceivable: { status: t.accountsReceivable.status },
    });
  };

  const getEditRoute = (transaction: UnifiedTransaction) => {
    if (transaction.transactionType === "cashFlow") {
      return getCashFlowEditRoute(transaction.id);
    } else if (transaction.transactionType === "payable") {
      return getAccountsPayableEditRoute(transaction.id);
    } else {
      return getAccountsReceivableEditRoute(transaction.id);
    }
  };

  const getViewRoute = (transaction: UnifiedTransaction) => {
    if (transaction.transactionType === "cashFlow") {
      return getCashFlowViewRoute(transaction.id);
    } else if (transaction.transactionType === "payable") {
      return getAccountsPayableViewRoute(transaction.id);
    } else {
      return getAccountsReceivableViewRoute(transaction.id);
    }
  };

  const canEdit = (transaction: UnifiedTransaction) => {
    if (transaction.transactionType === "cashFlow") {
      return canEditPermission("finances", "cashFlow");
    } else if (transaction.transactionType === "payable") {
      return canEditPermission("finances", "accountsPayable");
    } else {
      return canEditPermission("finances", "accountsReceivable");
    }
  };

  const canDelete = (transaction: UnifiedTransaction) => {
    if (transaction.transactionType === "cashFlow") {
      return canRemove("finances", "cashFlow");
    } else if (transaction.transactionType === "payable") {
      return canRemove("finances", "accountsPayable");
    } else {
      return canRemove("finances", "accountsReceivable");
    }
  };

  // Get entity-specific translation keys
  const getEntityTranslationKeys = () => {
    const baseKeys = {
      categories: t.cashFlow.categories as Record<string, string>,
      paymentMethods: t.cashFlow.paymentMethods as Record<string, string>,
      searchPlaceholder: t.cashFlow.searchPlaceholder as string,
      filters: {
        all: t.cashFlow.filters.all as string,
        income: t.cashFlow.filters.income as string,
        expense: t.cashFlow.filters.expense as string,
        allYears: t.cashFlow.filters.allYears as string,
        allMonths: t.cashFlow.filters.allMonths as string,
      },
      table: {
        type: t.cashFlow.table.type as string,
        amount: t.cashFlow.table.amount as string,
        date: t.cashFlow.table.date as string,
        property: t.cashFlow.table.property as string,
        category: t.cashFlow.table.category as string,
        description: t.cashFlow.table.description as string,
        paymentMethod: t.cashFlow.table.paymentMethod as string,
        referenceNumber: t.cashFlow.table.referenceNumber as string,
        status: t.cashFlow.table.status as string,
        income: t.cashFlow.table.income as string,
        expense: t.cashFlow.table.expense as string,
        completed: t.cashFlow.table.completed as string,
      },
      emptyState: {
        title: t.cashFlow.emptyState.title,
        descriptionWithSearch: t.cashFlow.emptyState.descriptionWithSearch,
        descriptionWithoutSearch: t.cashFlow.emptyState.descriptionWithoutSearch,
      },
      deleteModal: {
        title: t.cashFlow.deleteModal.title,
        message: t.cashFlow.deleteModal.message,
        confirm: t.cashFlow.deleteModal.confirm,
        cancel: t.cashFlow.deleteModal.cancel,
      },
      badge: {
        transactions: t.cashFlow.badge.transactions,
      },
      status: {
        unpaid: t.accountsPayable?.status?.unpaid || "",
        paid: t.accountsPayable?.status?.paid || "",
        overdue: t.accountsPayable?.status?.overdue || "",
        partial: t.accountsPayable?.status?.partial || "",
      } as Record<string, string>,
    };

    return baseKeys;
  };

  const getEntityTitleAndDescription = () => {
    switch (entityType) {
      case "employee":
        return {
          title: t.employees.details.finance.title,
          description: t.employees.details.finance.description,
        };
      case "serviceProvider":
        return {
          title: t.serviceProviders.details.finance.title,
          description: t.serviceProviders.details.finance.description,
        };
      case "supplier":
        return {
          title: t.suppliers.details.finance.title,
          description: t.suppliers.details.finance.description,
        };
      case "buyer":
        return {
          title: t.buyers.details.finance.title,
          description: t.buyers.details.finance.description,
        };
    }
  };

  const { title, description } = getEntityTitleAndDescription();

  const translationKeysResult = getEntityTranslationKeys();
  return {
    financeTransactions,
    financeHandlers,
    getStatusLabel,
    getEditRoute,
    getViewRoute,
    canEdit,
    canDelete,
    translationKeys: {
      ...translationKeysResult,
      status: translationKeysResult.status,
    } as unknown as EntityFinanceTransactionsResult["translationKeys"],
    title,
    description,
  };
}
