import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { StatusBadge, type TableColumn, type TableAction, type TableFilter } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { mockAccountsPayable } from "~/mocks/accounts-payable";
import { getAccountsPayableByCompanyId } from "~/services/accounts-payable.service";
import { getPropertiesByCompanyId } from "~/services/properties.service";
import type { AccountsPayable } from "~/types";
import { ROUTES, getAccountsPayableEditRoute, getAccountsPayableViewRoute } from "~/routes.config";
import { mockCompanies } from "~/mocks/companies";
import { usePermissions } from "~/utils/permissions";
import { useFinanceList } from "~/hooks/use-finance-list";
import { getStatusVariant } from "~/utils/finance";
import { useAlert } from "~/hooks/use-alert";
import { formatCurrency } from "~/utils/formatting";
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
    { title: "Contas a Pagar - Boi na Nuvem" },
    {
      name: "description",
      content: "Gerenciamento de contas a pagar do Boi na Nuvem",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function AccountsPayable() {
  const t = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { canAdd, canEdit, canRemove } = usePermissions();
  const company = mockCompanies[0];
  const initialTransactions = useMemo(() => {
    if (company) {
      return getAccountsPayableByCompanyId(company.id);
    }
    return [...mockAccountsPayable];
  }, [company]);
  const [transactions, setTransactions] = useState<AccountsPayable[]>(initialTransactions);
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
  } = useFinanceList<AccountsPayable>({
    data: transactions,
    initialSort: { column: "dueDate", direction: "asc" },
  });

  const deleteHandler = useFinanceTransactionDelete({
    transactionType: "accounts-payable",
    onSuccess: (message) => showAlert(message, "success"),
    onError: (message) => showAlert(message, "error"),
    successMessage: t.accountsPayable.success.deleted,
    errorMessage: t.accountsPayable.errors.deleteFailed,
    onDeleteSuccess: (transaction) => {
      setTransactions(transactions.filter((t) => t.id !== transaction.id));
    },
  });

  const columns: TableColumn<AccountsPayable>[] = [
    {
      key: "amount",
      label: t.accountsPayable.table.amount,
      sortable: true,
      render: (_, row) => (
        <span className="font-medium text-red-600 dark:text-red-400">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    createDateColumn<AccountsPayable>({
      label: t.accountsPayable.table.dueDate,
      language,
      dateField: "dueDate",
    }),
    createPropertyColumn<AccountsPayable>({
      label: t.accountsPayable.table.property,
      language,
    }),
    createCategoryColumn<AccountsPayable>({
      label: t.cashFlow.table.category,
      categories: t.cashFlow.categories,
    }),
    createDescriptionColumn<AccountsPayable>({
      label: t.accountsPayable.table.description,
    }),
    createEntityColumn<AccountsPayable>({
      key: "supplier",
    }),
    {
      key: "status",
      label: t.accountsPayable.table.status,
      sortable: true,
      render: (_, row) => (
        <StatusBadge
          label={t.accountsPayable.status[row.status] || row.status}
          variant={getStatusVariant(row.status)}
        />
      ),
    },
    {
      key: "paidAmount",
      label: t.accountsPayable.table.paidAmount,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.paidAmount ? formatCurrency(row.paidAmount) : "-"}
        </span>
      ),
    },
    createActionColumn<AccountsPayable>({
      onEdit: (row) => {
        navigate(getAccountsPayableEditRoute(row.id));
      },
      onDelete: (row) => {
        deleteHandler.handleDeleteClick(row);
      },
      canEdit: canEdit("finances", "accountsPayable"),
      canDelete: canRemove("finances", "accountsPayable"),
    }),
  ];

  const headerActions: TableAction[] = canAdd("finances", "accountsPayable")
    ? [
        createAddButtonAction({
          label: t.accountsPayable.addTransaction,
          onClick: () => {
            navigate(ROUTES.ACCOUNTS_PAYABLE_NEW);
          },
        }),
      ]
    : [];

  const filters: TableFilter[] = [
    {
      label: t.accountsPayable.filters.all,
      value: "all",
      active: activeFilter === "all",
      onClick: () => setActiveFilter("all"),
    },
    {
      label: t.accountsPayable.filters.paid,
      value: "paid",
      active: activeFilter === "paid",
      onClick: () => setActiveFilter("paid"),
    },
    {
      label: t.accountsPayable.filters.unpaid,
      value: "unpaid",
      active: activeFilter === "unpaid",
      onClick: () => setActiveFilter("unpaid"),
    },
    {
      label: t.accountsPayable.filters.overdue,
      value: "overdue",
      active: activeFilter === "overdue",
      onClick: () => setActiveFilter("overdue"),
    },
    {
      label: t.accountsPayable.filters.partial,
      value: "partial",
      active: activeFilter === "partial",
      onClick: () => setActiveFilter("partial"),
    },
  ];

  return (
    <FinanceTransactionListPage<AccountsPayable>
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
      title={t.accountsPayable.title}
      description={t.accountsPayable.description}
      badgeLabel={(count) => t.accountsPayable.badge.transactions(count)}
      searchPlaceholder={t.accountsPayable.searchPlaceholder}
      emptyStateTitle={t.accountsPayable.emptyState.title}
      emptyStateDescriptionWithSearch={(search) =>
        t.accountsPayable.emptyState.descriptionWithSearch(search)
      }
      emptyStateDescriptionWithoutSearch={t.accountsPayable.emptyState.descriptionWithoutSearch}
      addNewRoute={ROUTES.ACCOUNTS_PAYABLE_NEW}
      addNewLabel={t.accountsPayable.addTransaction}
      viewRoute={getAccountsPayableViewRoute}
      properties={properties}
      deleteHandler={deleteHandler}
      deleteModalTitle={t.accountsPayable.deleteModal.title}
      deleteModalMessage={(description) => t.accountsPayable.deleteModal.message(description)}
      deleteModalConfirm={t.accountsPayable.deleteModal.confirm}
      deleteModalCancel={t.accountsPayable.deleteModal.cancel}
      alertMessage={alertMessage}
      totalAmount={totalAmount}
    />
  );
}
