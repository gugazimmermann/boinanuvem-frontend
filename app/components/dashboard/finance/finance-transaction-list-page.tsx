import { useNavigate } from "react-router";
import { formatCurrency } from "~/utils/formatting";
import {
  Table,
  ConfirmationModal,
  FixedAlert,
  type TableColumn,
  type TableAction,
  type TableFilter,
  type SortDirection,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { FinanceFilters } from "~/components/dashboard/finance/finance-filters";
import type { AccountsPayable, AccountsReceivable, CashFlow, Property } from "~/types";
import type { UseFinanceTransactionDeleteReturn } from "~/hooks/use-finance-transaction-delete";
import type { AlertMessage } from "~/hooks/use-alert";

type FinanceTransaction = AccountsPayable | AccountsReceivable | CashFlow;

export interface FinanceTransactionListPageProps<T extends FinanceTransaction> {
  readonly columns: TableColumn<T>[];
  readonly data: T[];
  readonly filteredData: T[];
  readonly paginatedData: T[];
  readonly totalPages: number;
  readonly currentPage: number;
  readonly onPageChange: (page: number) => void;
  readonly searchValue: string;
  readonly onSearchChange: (value: string) => void;
  readonly activeFilter: string;
  readonly onFilterChange: (filter: string) => void;
  readonly propertyFilter: string;
  readonly onPropertyFilterChange: (filter: string) => void;
  readonly selectedYear: string;
  readonly onYearChange: (year: string) => void;
  readonly selectedMonth: string;
  readonly onMonthChange: (month: string) => void;
  readonly sortState: { column: string | null; direction: "asc" | "desc" };
  readonly onSort: (column: string, direction: SortDirection) => void;
  readonly filters: TableFilter[];
  readonly headerActions?: TableAction[];
  readonly title: string;
  readonly description?: string;
  readonly badgeLabel: (count: number) => string;
  readonly searchPlaceholder: string;
  readonly emptyStateTitle: string;
  readonly emptyStateDescriptionWithSearch: (search: string) => string;
  readonly emptyStateDescriptionWithoutSearch: string;
  readonly addNewRoute: string;
  readonly addNewLabel: string;
  readonly viewRoute: (id: string) => string;
  readonly properties: Array<{ id: string; name: string }>;
  readonly deleteHandler: UseFinanceTransactionDeleteReturn;
  readonly deleteModalTitle: string;
  readonly deleteModalMessage: (description: string) => string;
  readonly deleteModalConfirm: string;
  readonly deleteModalCancel: string;
  readonly alertMessage?: AlertMessage | null;
  readonly belowContent?: React.ReactNode;
  readonly additionalContent?: React.ReactNode;
  readonly totalAmount?: number;
}

export function FinanceTransactionListPage<T extends FinanceTransaction>({
  columns,
  data: _data,
  filteredData,
  paginatedData,
  totalPages,
  currentPage,
  onPageChange,
  searchValue,
  onSearchChange,
  activeFilter: _activeFilter,
  onFilterChange,
  propertyFilter,
  onPropertyFilterChange,
  selectedYear,
  onYearChange,
  selectedMonth,
  onMonthChange,
  sortState,
  onSort,
  filters,
  headerActions = [],
  title,
  description,
  badgeLabel,
  searchPlaceholder,
  emptyStateTitle,
  emptyStateDescriptionWithSearch,
  emptyStateDescriptionWithoutSearch,
  addNewRoute,
  addNewLabel,
  viewRoute,
  properties,
  deleteHandler,
  deleteModalTitle,
  deleteModalMessage,
  deleteModalConfirm,
  deleteModalCancel,
  alertMessage,
  belowContent,
  additionalContent,
  totalAmount,
}: FinanceTransactionListPageProps<T>) {
  const t = useTranslation();
  const navigate = useNavigate();

  const handleClearSearch = () => {
    onSearchChange("");
    onFilterChange("all");
    onPropertyFilterChange("all");
    onYearChange("all");
    onMonthChange("all");
    onPageChange(1);
  };

  const defaultBelowContent =
    totalAmount === undefined ? undefined : (
      <div className="flex items-center gap-6 text-sm">
        <div className="flex flex-col">
          <span className="text-gray-500 dark:text-gray-400 text-xs">Total</span>
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>
    );

  return (
    <div>
      <Table<T>
        columns={columns}
        data={paginatedData}
        header={{
          title,
          badge: {
            label: badgeLabel(filteredData.length),
            variant: "primary",
          },
          description,
          actions: headerActions,
        }}
        filters={filters}
        search={{
          placeholder: searchPlaceholder,
          value: searchValue,
          onChange: onSearchChange,
        }}
        additionalContent={additionalContent}
        belowContent={belowContent || defaultBelowContent}
        rightContent={
          <FinanceFilters
            propertyFilter={propertyFilter}
            onPropertyFilterChange={onPropertyFilterChange}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={onYearChange}
            onMonthChange={onMonthChange}
            onPageChange={onPageChange}
            properties={properties as unknown as Property[]}
            propertyLabel={t.reproductiveIndexes?.propertyLabel || "Property"}
            allPropertiesLabel={t.reproductiveIndexes?.allProperties || "All Properties"}
          />
        }
        pagination={{
          currentPage,
          totalPages: totalPages || 1,
          onPageChange,
          showInfo: false,
        }}
        sortState={sortState}
        onSort={onSort}
        onRowClick={(row) => navigate(viewRoute(row.id))}
        emptyState={{
          title: emptyStateTitle,
          description: searchValue
            ? emptyStateDescriptionWithSearch(searchValue)
            : emptyStateDescriptionWithoutSearch,
          onClearSearch: handleClearSearch,
          clearSearchLabel: t.common.clearSearch,
          onAddNew: () => {
            navigate(addNewRoute);
          },
          addNewLabel: addNewLabel,
        }}
      />

      <FixedAlert alertMessage={alertMessage ?? null} />

      <ConfirmationModal
        isOpen={deleteHandler.isDeleteModalOpen}
        onClose={deleteHandler.handleCloseModal}
        onConfirm={deleteHandler.handleDeleteTransaction}
        title={deleteModalTitle}
        message={deleteModalMessage(deleteHandler.selectedTransaction?.description || "")}
        confirmLabel={deleteModalConfirm}
        cancelLabel={deleteModalCancel}
        variant="danger"
      />
    </div>
  );
}
