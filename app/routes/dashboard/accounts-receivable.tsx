import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { formatCurrency } from "~/utils/formatting";
import { StatusBadge, type TableColumn, type TableAction, type TableFilter } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { mockAccountsReceivable } from "~/mocks/accounts-receivable";
import { getAccountsReceivableByCompanyId } from "~/services/accounts-receivable.service";
import { getPropertiesByCompanyId } from "~/services/properties.service";
import type { AccountsReceivable } from "~/types";
import {
  ROUTES,
  getAccountsReceivableEditRoute,
  getAccountsReceivableViewRoute,
} from "~/routes.config";
import { mockCompanies } from "~/mocks/companies";
import { usePermissions } from "~/utils/permissions";
import { useFinanceList } from "~/hooks/use-finance-list";
import { getStatusVariant } from "~/utils/finance";
import { useAlert } from "~/hooks/use-alert";
import { useFinanceTransactionDelete } from "~/hooks/use-finance-transaction-delete";
import {
  createPropertyColumn,
  createCategoryColumn,
  createDescriptionColumn,
  createEntityColumn,
  createDateColumn,
} from "~/utils/finance-column-helpers";
import { FinanceTransactionListPage } from "~/components/dashboard/finance/finance-transaction-list-page";
import { createActionColumn } from "~/utils/table-action-column";
import { createAddButtonAction } from "~/utils/header-action-helpers";

export function meta() {
  return [
    { title: "Contas a Receber - Boi na Nuvem" },
    {
      name: "description",
      content: "Gerenciamento de contas a receber do Boi na Nuvem",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function AccountsReceivable() {
  const t = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { canAdd, canEdit, canRemove } = usePermissions();
  const company = mockCompanies[0];
  const initialTransactions = useMemo(() => {
    if (company) {
      return getAccountsReceivableByCompanyId(company.id);
    }
    return [...mockAccountsReceivable];
  }, [company]);
  const [transactions, setTransactions] = useState<AccountsReceivable[]>(initialTransactions);
  const { alertMessage, showAlert } = useAlert();

  const properties = useMemo(
    () => (company ? getPropertiesByCompanyId(company.id) : []),
    [company]
  );

  const {
    searchValue,
    setSearchValue,
    activeFilter,
    setActiveFilter,
    propertyFilter,
    setPropertyFilter,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    sortState,
    handleSort,
    currentPage,
    setCurrentPage,
    filteredData,
    paginatedData,
    totalPages,
    totalAmount,
  } = useFinanceList<AccountsReceivable>({
    data: transactions,
    initialSort: { column: "dueDate", direction: "asc" },
  });

  const deleteHandler = useFinanceTransactionDelete({
    transactionType: "accounts-receivable",
    onSuccess: (message) => showAlert(message, "success"),
    onError: (message) => showAlert(message, "error"),
    successMessage: t.accountsReceivable.success.deleted,
    errorMessage: t.accountsReceivable.errors.deleteFailed,
    onDeleteSuccess: (transaction) => {
      setTransactions(transactions.filter((t) => t.id !== transaction.id));
    },
  });

  const columns: TableColumn<AccountsReceivable>[] = [
    {
      key: "amount",
      label: t.accountsReceivable.table.amount,
      sortable: true,
      render: (_, row) => (
        <span className="font-medium text-green-600 dark:text-green-400">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    createDateColumn<AccountsReceivable>({
      label: t.accountsReceivable.table.dueDate,
      language,
      dateField: "dueDate",
    }),
    createPropertyColumn<AccountsReceivable>({
      label: t.accountsReceivable.table.property,
      language,
    }),
    createCategoryColumn<AccountsReceivable>({
      label: t.cashFlow.table.category,
      categories: t.cashFlow.categories,
    }),
    createDescriptionColumn<AccountsReceivable>({
      label: t.accountsReceivable.table.description,
    }),
    createEntityColumn<AccountsReceivable>({
      key: "buyer",
    }),
    {
      key: "status",
      label: t.accountsReceivable.table.status,
      sortable: true,
      render: (_, row) => (
        <StatusBadge
          label={t.accountsReceivable.status[row.status] || row.status}
          variant={getStatusVariant(row.status)}
        />
      ),
    },
    {
      key: "paidAmount",
      label: t.accountsReceivable.table.paidAmount,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.paidAmount ? formatCurrency(row.paidAmount) : "-"}
        </span>
      ),
    },
    createActionColumn<AccountsReceivable>({
      onEdit: (row) => {
        navigate(getAccountsReceivableEditRoute(row.id));
      },
      onDelete: (row) => {
        deleteHandler.handleDeleteClick(row);
      },
      canEdit: canEdit("finances", "accountsReceivable"),
      canDelete: canRemove("finances", "accountsReceivable"),
    }),
  ];

  const headerActions: TableAction[] = canAdd("finances", "accountsReceivable")
    ? [
        createAddButtonAction({
          label: t.accountsReceivable.addTransaction,
          onClick: () => {
            navigate(ROUTES.ACCOUNTS_RECEIVABLE_NEW);
          },
        }),
      ]
    : [];

  const filters: TableFilter[] = [
    {
      label: t.accountsReceivable.filters.all,
      value: "all",
      active: activeFilter === "all",
      onClick: () => setActiveFilter("all"),
    },
    {
      label: t.accountsReceivable.filters.paid,
      value: "paid",
      active: activeFilter === "paid",
      onClick: () => setActiveFilter("paid"),
    },
    {
      label: t.accountsReceivable.filters.unpaid,
      value: "unpaid",
      active: activeFilter === "unpaid",
      onClick: () => setActiveFilter("unpaid"),
    },
    {
      label: t.accountsReceivable.filters.overdue,
      value: "overdue",
      active: activeFilter === "overdue",
      onClick: () => setActiveFilter("overdue"),
    },
    {
      label: t.accountsReceivable.filters.partial,
      value: "partial",
      active: activeFilter === "partial",
      onClick: () => setActiveFilter("partial"),
    },
  ];

  return (
    <FinanceTransactionListPage<AccountsReceivable>
      columns={columns}
      data={transactions}
      filteredData={filteredData}
      paginatedData={paginatedData}
      totalPages={totalPages}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      propertyFilter={propertyFilter}
      onPropertyFilterChange={setPropertyFilter}
      selectedYear={selectedYear}
      onYearChange={setSelectedYear}
      selectedMonth={selectedMonth}
      onMonthChange={setSelectedMonth}
      sortState={{ column: sortState.column, direction: sortState.direction || "asc" }}
      onSort={handleSort}
      filters={filters}
      headerActions={headerActions}
      title={t.accountsReceivable.title}
      description={t.accountsReceivable.description}
      badgeLabel={(count) => t.accountsReceivable.badge.transactions(count)}
      searchPlaceholder={t.accountsReceivable.searchPlaceholder}
      emptyStateTitle={t.accountsReceivable.emptyState.title}
      emptyStateDescriptionWithSearch={(search) =>
        t.accountsReceivable.emptyState.descriptionWithSearch(search)
      }
      emptyStateDescriptionWithoutSearch={t.accountsReceivable.emptyState.descriptionWithoutSearch}
      addNewRoute={ROUTES.ACCOUNTS_RECEIVABLE_NEW}
      addNewLabel={t.accountsReceivable.addTransaction}
      viewRoute={getAccountsReceivableViewRoute}
      properties={properties}
      deleteHandler={deleteHandler}
      deleteModalTitle={t.accountsReceivable.deleteModal.title}
      deleteModalMessage={(description) => t.accountsReceivable.deleteModal.message(description)}
      deleteModalConfirm={t.accountsReceivable.deleteModal.confirm}
      deleteModalCancel={t.accountsReceivable.deleteModal.cancel}
      alertMessage={alertMessage}
      totalAmount={totalAmount}
    />
  );
}
