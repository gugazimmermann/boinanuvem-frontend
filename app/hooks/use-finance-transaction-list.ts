import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { type TableColumn, type TableAction } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { useAuth } from "~/contexts/auth-context";
import { getProperties } from "~/services/properties.service";
import type { Property, CashFlow, AccountsPayable, AccountsReceivable } from "~/types";
import { usePermissions } from "~/utils/permissions";
import { useFinanceList } from "~/hooks/use-finance-list";
import { useAlert } from "~/hooks/use-alert";
import { useFinanceTransactionDelete } from "~/hooks/use-finance-transaction-delete";
import {
  createPropertyColumn,
  createCategoryColumn,
  createDescriptionColumn,
  createEntityColumn,
  createDateColumn,
  createAmountColumn,
  createStatusColumn,
  createPaidAmountColumn,
  createFinanceFilters,
} from "~/utils/finance-column-helpers";
import { createActionColumn } from "~/utils/table-action-column";
import { createAddButtonAction } from "~/utils/header-action-helpers";

export type FinanceTransactionType = "accounts-payable" | "accounts-receivable";

export type FinanceTransaction = CashFlow | AccountsPayable | AccountsReceivable;

export interface UseFinanceTransactionListOptions<TTransaction extends FinanceTransaction> {
  /** Initial transactions */
  initialTransactions: TTransaction[];
  /** Transaction type */
  transactionType: FinanceTransactionType;
  /** Entity column key (e.g., "supplier" for accounts payable, "buyer" for accounts receivable) */
  entityColumnKey: string;
  /** Amount color class */
  amountColorClass: "red" | "green";
  /** Translation namespace */
  translations: {
    title: string;
    description: string;
    table: {
      amount: string;
      dueDate: string;
      property: string;
      description: string;
      status: string;
      paidAmount: string;
    };
    filters: {
      all: string;
      paid: string;
      unpaid: string;
      overdue: string;
      partial: string;
    };
    success: {
      deleted: string;
    };
    errors: {
      deleteFailed: string;
    };
    addTransaction: string;
    searchPlaceholder: string;
    emptyState: {
      title: string;
      descriptionWithSearch: (search: string) => string;
      descriptionWithoutSearch: string;
    };
    deleteModal: {
      title: string;
      message: (description: string) => string;
      confirm: string;
      cancel: string;
    };
    badge: {
      transactions: (count: number) => string;
    };
    status: Record<string, string>;
  };
  /** Route configuration */
  routes: {
    list: string;
    new: string;
    edit: (id: string) => string;
    view: (id: string) => string;
  };
  /** Permission resource name */
  permissionResource: "accountsPayable" | "accountsReceivable";
}

export interface UseFinanceTransactionListReturn<TTransaction extends FinanceTransaction> {
  /** Properties filtered by company */
  properties: Property[];
  /** Finance list hook return values */
  financeList: ReturnType<typeof useFinanceList<TTransaction>>;
  /** Delete handler */
  deleteHandler: ReturnType<typeof useFinanceTransactionDelete>;
  /** Table columns */
  columns: TableColumn<TTransaction>[];
  /** Header actions */
  headerActions: TableAction[];
  /** Finance filters */
  filters: ReturnType<typeof createFinanceFilters>;
  /** Alert message */
  alertMessage: ReturnType<typeof useAlert>["alertMessage"];
  /** Transactions state */
  transactions: TTransaction[];
  /** Set transactions */
  setTransactions: React.Dispatch<React.SetStateAction<TTransaction[]>>;
}

/**
 * Hook to manage finance transaction list page logic
 */
export function useFinanceTransactionList<TTransaction extends FinanceTransaction>({
  initialTransactions,
  transactionType,
  entityColumnKey,
  amountColorClass,
  translations,
  routes,
  permissionResource,
}: UseFinanceTransactionListOptions<TTransaction>): UseFinanceTransactionListReturn<TTransaction> {
  const t = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { canAdd, canEdit, canRemove } = usePermissions();
  const { currentUser } = useAuth();
  const companyId = currentUser?.companyId;
  const [transactions, setTransactions] = useState<TTransaction[]>(initialTransactions);
  const [properties, setProperties] = useState<Property[]>([]);
  const { alertMessage, showAlert } = useAlert();

  useEffect(() => {
    const fetchProperties = async () => {
      if (companyId) {
        try {
          const propertiesData = await getProperties();
          setProperties(propertiesData.filter((prop) => prop.companyId === companyId));
        } catch (error) {
          console.error("Failed to load properties:", error);
        }
      }
    };
    fetchProperties();
  }, [companyId]);

  const financeList = useFinanceList<TTransaction>({
    data: transactions,
    initialSort: { column: "dueDate", direction: "asc" },
  });

  const deleteHandler = useFinanceTransactionDelete({
    transactionType,
    onSuccess: (message) => showAlert(message, "success"),
    onError: (message) => showAlert(message, "error"),
    successMessage: translations.success.deleted,
    errorMessage: translations.errors.deleteFailed,
    onDeleteSuccess: (transaction) => {
      setTransactions(transactions.filter((t) => t.id !== transaction.id));
    },
  });

  const columns: TableColumn<TTransaction>[] = [
    createAmountColumn<TTransaction>({
      label: translations.table.amount,
      colorClass: amountColorClass,
    }),
    createDateColumn<TTransaction>({
      label: translations.table.dueDate,
      language,
      dateField: "dueDate",
    }),
    createPropertyColumn<TTransaction>({
      label: translations.table.property,
      language,
    }),
    createCategoryColumn<TTransaction>({
      label: t.cashFlow.table.category,
      categories: t.cashFlow.categories,
    }),
    createDescriptionColumn<TTransaction>({
      label: translations.table.description,
    }),
    createEntityColumn<TTransaction>({
      key: entityColumnKey,
    }),
    createStatusColumn<TTransaction>({
      label: translations.table.status,
      statusMap: translations.status,
    }),
    ...(transactionType === "accounts-payable" || transactionType === "accounts-receivable"
      ? [
          createPaidAmountColumn<TTransaction & { paidAmount?: number }>({
            label: translations.table.paidAmount,
          }),
        ]
      : []),
    createActionColumn<TTransaction>({
      onEdit: (row) => {
        navigate(routes.edit(row.id));
      },
      onDelete: (row) => {
        deleteHandler.handleDeleteClick(row);
      },
      canEdit: canEdit("finances", permissionResource),
      canDelete: canRemove("finances", permissionResource),
    }),
  ];

  const headerActions: TableAction[] = canAdd("finances", permissionResource)
    ? [
        createAddButtonAction({
          label: translations.addTransaction,
          onClick: () => {
            navigate(routes.new);
          },
        }),
      ]
    : [];

  const filters = createFinanceFilters({
    allLabel: translations.filters.all,
    paidLabel: translations.filters.paid,
    unpaidLabel: translations.filters.unpaid,
    overdueLabel: translations.filters.overdue,
    partialLabel: translations.filters.partial,
    activeFilter: financeList.activeFilter,
    onFilterChange: financeList.setActiveFilter,
  });

  return {
    properties,
    financeList,
    deleteHandler,
    columns,
    headerActions,
    filters,
    alertMessage,
    transactions,
    setTransactions,
  };
}
