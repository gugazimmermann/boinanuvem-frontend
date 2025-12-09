import { useNavigate } from "react-router";
import { formatDate, formatCurrency } from "~/utils/formatting";
import { useLanguage } from "~/contexts/language-context";
import { useTranslation } from "~/i18n";
import {
  Table,
  StatusBadge,
  TableActionButtons,
  ConfirmationModal,
  type TableColumn,
  type TableFilter,
  type SortDirection,
} from "~/components/ui";
import { renderEntityName } from "~/utils/entity-name-renderer";
import type { UnifiedTransaction } from "~/hooks/use-finance-transactions";
import type { CashFlow, AccountsPayable, AccountsReceivable } from "~/types";
import type { EntityFinanceTransactionsResult } from "~/hooks/use-entity-finance-transactions";
import { createTableFilter, handleSortChange } from "~/utils/table-helpers";
import { YearMonthFilters } from "./year-month-filters";

interface FinanceTransactionsTableProps {
  readonly transactions: UnifiedTransaction[];
  readonly filteredTransactions: UnifiedTransaction[];
  readonly paginatedTransactions: UnifiedTransaction[];
  readonly totalPages: number;
  readonly totalIncome: number;
  readonly totalExpenses: number;
  readonly netTotal: number;
  readonly searchValue: string;
  readonly onSearchChange: (value: string) => void;
  readonly activeFilter: string;
  readonly onFilterChange: (filter: string) => void;
  readonly selectedYear: string;
  readonly onYearChange: (year: string) => void;
  readonly selectedMonth: string;
  readonly onMonthChange: (month: string) => void;
  readonly currentPage: number;
  readonly onPageChange: (page: number) => void;
  readonly sortState: { column: string | null; direction: SortDirection };
  readonly onSort: (column: string, direction: SortDirection) => void;
  readonly title: string;
  readonly description?: string;
  readonly translationKeys: {
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
    status: {
      [key: string]: string;
    };
  };
  readonly onDeleteClick: (transaction: UnifiedTransaction) => void;
  readonly isDeleteModalOpen: boolean;
  readonly onDeleteModalClose: () => void;
  readonly onDeleteConfirm: () => void;
  readonly selectedTransaction: CashFlow | AccountsPayable | AccountsReceivable | null;
  readonly getStatusVariant: (
    status: string,
    transactionType: string
  ) => "success" | "danger" | "warning" | "default";
  readonly getStatusLabel: (status: string, transactionType: string) => string;
  readonly getEditRoute: (transaction: UnifiedTransaction) => string;
  readonly getViewRoute: (transaction: UnifiedTransaction) => string;
  readonly canEdit?: (transaction: UnifiedTransaction) => boolean;
  readonly canDelete?: (transaction: UnifiedTransaction) => boolean;
  readonly getPropertyName?: (propertyId: string) => string | undefined;
}

export interface GetFinanceTransactionsTablePropsParams {
  financeTransactions: EntityFinanceTransactionsResult["financeTransactions"];
  financeHandlers: EntityFinanceTransactionsResult["financeHandlers"];
  getStatusLabel: EntityFinanceTransactionsResult["getStatusLabel"];
  getEditRoute: EntityFinanceTransactionsResult["getEditRoute"];
  getViewRoute: EntityFinanceTransactionsResult["getViewRoute"];
  canEdit: EntityFinanceTransactionsResult["canEdit"];
  canDelete: EntityFinanceTransactionsResult["canDelete"];
  title: EntityFinanceTransactionsResult["title"];
  description?: EntityFinanceTransactionsResult["description"];
  translationKeys: EntityFinanceTransactionsResult["translationKeys"];
}

export function getFinanceTransactionsTableProps({
  financeTransactions,
  financeHandlers,
  getStatusLabel,
  getEditRoute,
  getViewRoute,
  canEdit,
  canDelete,
  title,
  description,
  translationKeys,
}: GetFinanceTransactionsTablePropsParams): Omit<
  FinanceTransactionsTableProps,
  "filteredTransactions"
> {
  return {
    transactions: financeTransactions.transactions,
    paginatedTransactions: financeTransactions.paginatedTransactions,
    totalPages: financeTransactions.totalPages,
    totalIncome: financeTransactions.totalIncome,
    totalExpenses: financeTransactions.totalExpenses,
    netTotal: financeTransactions.netTotal,
    searchValue: financeTransactions.searchValue,
    onSearchChange: financeTransactions.setSearchValue,
    activeFilter: financeTransactions.activeFilter,
    onFilterChange: financeTransactions.setActiveFilter,
    selectedYear: financeTransactions.selectedYear,
    onYearChange: financeTransactions.setSelectedYear,
    selectedMonth: financeTransactions.selectedMonth,
    onMonthChange: financeTransactions.setSelectedMonth,
    currentPage: financeTransactions.currentPage,
    onPageChange: financeTransactions.setCurrentPage,
    sortState: financeTransactions.sortState,
    onSort: (column: string, direction: SortDirection) => {
      financeTransactions.setSortState({ column, direction });
    },
    title,
    description,
    translationKeys: translationKeys as unknown as {
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
      status: {
        [key: string]: string;
      };
    },
    onDeleteClick: financeHandlers.handleDeleteClick,
    isDeleteModalOpen: financeHandlers.isDeleteModalOpen,
    onDeleteModalClose: () => {
      financeHandlers.setIsDeleteModalOpen(false);
    },
    onDeleteConfirm: () => {
      void financeHandlers.handleDeleteConfirm();
    },
    selectedTransaction: financeHandlers.selectedTransaction,
    getStatusVariant: financeHandlers.getStatusVariant,
    getStatusLabel,
    getEditRoute,
    getViewRoute,
    canEdit,
    canDelete,
  };
}

export function FinanceTransactionsTable({
  filteredTransactions,
  paginatedTransactions,
  totalPages,
  totalIncome,
  totalExpenses,
  netTotal,
  searchValue,
  onSearchChange,
  activeFilter,
  onFilterChange,
  selectedYear,
  onYearChange,
  selectedMonth,
  onMonthChange,
  currentPage,
  onPageChange,
  sortState,
  onSort,
  title,
  description,
  translationKeys,
  onDeleteClick,
  isDeleteModalOpen,
  onDeleteModalClose,
  onDeleteConfirm,
  selectedTransaction,
  getStatusVariant,
  getStatusLabel,
  getEditRoute,
  getViewRoute,
  canEdit,
  canDelete,
  getPropertyName,
}: FinanceTransactionsTableProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = useTranslation();

  const financeFilters: TableFilter[] = [
    createTableFilter(
      translationKeys.filters.all,
      "all",
      activeFilter,
      onFilterChange,
      onPageChange
    ),
    createTableFilter(
      translationKeys.filters.income,
      "income",
      activeFilter,
      onFilterChange,
      onPageChange
    ),
    createTableFilter(
      translationKeys.filters.expense,
      "expense",
      activeFilter,
      onFilterChange,
      onPageChange
    ),
  ];

  const columns: TableColumn<UnifiedTransaction>[] = [
    {
      key: "type",
      label: translationKeys.table.type,
      sortable: true,
      render: (_, row) => (
        <StatusBadge
          label={
            row.type === "income" ? translationKeys.table.income : translationKeys.table.expense
          }
          variant={row.type === "income" ? "success" : "default"}
        />
      ),
    },
    {
      key: "amount",
      label: translationKeys.table.amount,
      sortable: true,
      render: (_, row) => (
        <span
          className={`font-medium ${
            row.type === "income"
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {row.type === "income" ? "+" : "-"} {formatCurrency(row.amount, language)}
        </span>
      ),
    },
    {
      key: "date",
      label: translationKeys.table.date,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{formatDate(row.date, language)}</span>
      ),
    },
    {
      key: "property",
      label: translationKeys.table.property,
      sortable: true,
      render: (_, row) => {
        const propertyName =
          row.propertyId && getPropertyName ? getPropertyName(row.propertyId) : undefined;
        return <span className="text-gray-700 dark:text-gray-300">{propertyName || "-"}</span>;
      },
    },
    {
      key: "category",
      label: translationKeys.table.category,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.category ? translationKeys.categories[row.category] || row.category : "-"}
        </span>
      ),
    },
    {
      key: "description",
      label: translationKeys.table.description,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.description}</span>
      ),
    },
    {
      key: "supplierBuyer",
      label: "",
      sortable: false,
      render: (_, row) =>
        renderEntityName({
          supplierId: row.supplierId,
          employeeId: row.employeeId,
          serviceProviderId: row.serviceProviderId,
          buyerId: row.buyerId,
          type: row.type,
        }),
    },
    {
      key: "paymentMethod",
      label: translationKeys.table.paymentMethod,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.paymentMethod
            ? translationKeys.paymentMethods[row.paymentMethod] || row.paymentMethod
            : "-"}
        </span>
      ),
    },
    {
      key: "referenceNumber",
      label: translationKeys.table.referenceNumber,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.referenceNumber || "-"}</span>
      ),
    },
    {
      key: "status",
      label: translationKeys.table.status,
      sortable: true,
      render: (_, row) => (
        <StatusBadge
          label={getStatusLabel(row.status, row.transactionType)}
          variant={getStatusVariant(row.status, row.transactionType)}
        />
      ),
    },
    {
      key: "actions",
      label: "",
      headerClassName: "relative",
      render: (_, row) => {
        const editAllowed = canEdit ? canEdit(row) : true;
        const deleteAllowed = canDelete ? canDelete(row) : true;

        return (
          <TableActionButtons
            onEdit={() => navigate(getEditRoute(row))}
            onDelete={() => onDeleteClick(row)}
            canEdit={editAllowed}
            canDelete={deleteAllowed}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-8">
      <Table<UnifiedTransaction>
        columns={columns}
        data={paginatedTransactions}
        header={{
          title,
          badge: {
            label: translationKeys.badge.transactions(filteredTransactions.length),
            variant: "primary",
          },
          description,
        }}
        filters={financeFilters}
        search={{
          placeholder: translationKeys.searchPlaceholder,
          value: searchValue,
          onChange: (value) => {
            onSearchChange(value);
            onPageChange(1);
          },
        }}
        rightContent={
          <YearMonthFilters
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={onYearChange}
            onMonthChange={onMonthChange}
            onPageChange={onPageChange}
          />
        }
        middleContent={
          <div className="flex items-center gap-4 text-sm">
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                {translationKeys.filters.income}
              </span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(totalIncome, language)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                {translationKeys.filters.expense}
              </span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                {formatCurrency(totalExpenses, language)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-gray-400 text-xs">Total</span>
              <span
                className={`font-semibold ${
                  netTotal >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(netTotal, language)}
              </span>
            </div>
          </div>
        }
        pagination={{
          currentPage,
          totalPages: totalPages || 1,
          onPageChange,
          showInfo: false,
        }}
        sortState={sortState}
        onSort={(column, direction) => {
          handleSortChange(column, direction, onSort, onPageChange);
        }}
        onRowClick={(row) => navigate(getViewRoute(row))}
        emptyState={{
          title: translationKeys.emptyState?.title || "",
          description: searchValue
            ? translationKeys.emptyState?.descriptionWithSearch?.(searchValue) || ""
            : translationKeys.emptyState?.descriptionWithoutSearch || "",
          onClearSearch: () => {
            onSearchChange("");
            onFilterChange("all");
            onYearChange("all");
            onMonthChange("all");
          },
          clearSearchLabel: t.common.clearSearch,
        }}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={onDeleteModalClose}
        onConfirm={onDeleteConfirm}
        title={translationKeys.deleteModal.title}
        message={translationKeys.deleteModal.message(selectedTransaction?.description || "")}
        confirmLabel={translationKeys.deleteModal.confirm}
        cancelLabel={translationKeys.deleteModal.cancel}
        variant="danger"
      />
    </div>
  );
}
