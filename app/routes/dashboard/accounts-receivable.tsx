import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { formatDate, formatCurrency } from "~/utils/formatting";
import {
  Table,
  StatusBadge,
  TableActionButtons,
  ConfirmationModal,
  Alert,
  Select,
  type TableColumn,
  type TableAction,
  type TableFilter,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { mockAccountsReceivable } from "~/mocks/accounts-receivable";
import {
  deleteAccountsReceivable,
  getAccountsReceivableByCompanyId,
} from "~/services/accounts-receivable.service";
import { getBuyerById } from "~/services/buyers.service";
import { getPropertyById, getPropertiesByCompanyId } from "~/services/properties.service";
import type { AccountsReceivable } from "~/types";
import {
  ROUTES,
  getAccountsReceivableEditRoute,
  getAccountsReceivableViewRoute,
} from "~/routes.config";
import { mockCompanies } from "~/mocks/companies";
import { usePermissions } from "~/utils/permissions";
import { useFinanceList } from "~/hooks/use-finance-list";
import { useDateFilters } from "~/hooks/use-date-filters";
import { getStatusVariant } from "~/utils/finance";

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<AccountsReceivable | null>(null);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);

  const properties = useMemo(
    () => (company ? getPropertiesByCompanyId(company.id) : []),
    [company]
  );

  const { yearOptions, monthOptions } = useDateFilters();

  // Use finance list hook
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

  const showAlert = (
    title: string,
    variant: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setAlertMessage({ title, variant });
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  const handleDeleteClick = (transaction: AccountsReceivable) => {
    setSelectedTransaction(transaction);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;
    const success = deleteAccountsReceivable(selectedTransaction.id);
    if (success) {
      setTransactions(transactions.filter((t) => t.id !== selectedTransaction.id));
      showAlert(t.accountsReceivable.success.deleted, "success");
    } else {
      showAlert(t.accountsReceivable.errors.deleteFailed, "error");
    }
    setSelectedTransaction(null);
  };

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
    {
      key: "dueDate",
      label: t.accountsReceivable.table.dueDate,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">
          {formatDate(row.dueDate, language)}
        </span>
      ),
    },
    {
      key: "property",
      label: t.accountsReceivable.table.property,
      sortable: true,
      render: (_, row) => {
        const property = getPropertyById(row.propertyId);
        return <span className="text-gray-700 dark:text-gray-300">{property?.name || "-"}</span>;
      },
    },
    {
      key: "category",
      label: t.cashFlow.table.category,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.category ? t.cashFlow.categories[row.category] || row.category : "-"}
        </span>
      ),
    },
    {
      key: "description",
      label: t.accountsReceivable.table.description,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.description}</span>
      ),
    },
    {
      key: "buyer",
      label: "",
      sortable: false,
      render: (_, row) => {
        if (!row.buyerId) {
          return <span className="text-gray-400 dark:text-gray-500">-</span>;
        }
        const buyer = getBuyerById(row.buyerId);
        return <span className="text-gray-700 dark:text-gray-300">{buyer?.name || "-"}</span>;
      },
    },
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
    {
      key: "actions",
      label: "",
      headerClassName: "relative",
      render: (_, row) => (
        <TableActionButtons
          onEdit={() => navigate(getAccountsReceivableEditRoute(row.id))}
          onDelete={() => handleDeleteClick(row)}
          canEdit={canEdit("finances", "accountsReceivable")}
          canDelete={canRemove("finances", "accountsReceivable")}
        />
      ),
    },
  ];

  const headerActions: TableAction[] = canAdd("finances", "accountsReceivable")
    ? [
        {
          label: t.accountsReceivable.addTransaction,
          variant: "primary",
          leftIcon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          onClick: () => navigate(ROUTES.ACCOUNTS_RECEIVABLE_NEW),
        },
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
    <div>
      <Table<AccountsReceivable>
        columns={columns}
        data={paginatedData}
        header={{
          title: t.accountsReceivable.title,
          badge: {
            label: t.accountsReceivable.badge.transactions(filteredData.length),
            variant: "primary",
          },
          description: t.accountsReceivable.description,
          actions: headerActions,
        }}
        filters={filters}
        search={{
          placeholder: t.accountsReceivable.searchPlaceholder,
          value: searchValue,
          onChange: setSearchValue,
        }}
        rightContent={
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {t.reproductiveIndexes.propertyLabel}:
            </label>
            <select
              value={propertyFilter}
              onChange={(e) => {
                setPropertyFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">{t.reproductiveIndexes.allProperties}</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
            <div className="w-32">
              <Select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setCurrentPage(1);
                }}
                options={yearOptions}
                selectClassName="text-xs sm:text-sm py-2"
              />
            </div>
            <div className="w-36">
              <Select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setCurrentPage(1);
                }}
                options={monthOptions}
                selectClassName="text-xs sm:text-sm py-2"
              />
            </div>
          </div>
        }
        belowContent={
          <div className="flex items-center gap-6 text-sm">
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-gray-400 text-xs">Total</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        }
        pagination={{
          currentPage,
          totalPages: totalPages || 1,
          onPageChange: setCurrentPage,
          showInfo: false,
        }}
        sortState={sortState}
        onSort={handleSort}
        onRowClick={(row) => navigate(getAccountsReceivableViewRoute(row.id))}
        emptyState={{
          title: t.accountsReceivable.emptyState.title,
          description: searchValue
            ? t.accountsReceivable.emptyState.descriptionWithSearch(searchValue)
            : t.accountsReceivable.emptyState.descriptionWithoutSearch,
          onClearSearch: () => {
            setSearchValue("");
            setActiveFilter("all");
            setPropertyFilter("all");
            setSelectedYear("all");
            setSelectedMonth("all");
            setCurrentPage(1);
          },
          clearSearchLabel: t.common.clearSearch,
          onAddNew: () => navigate(ROUTES.ACCOUNTS_RECEIVABLE_NEW),
          addNewLabel: t.accountsReceivable.addTransaction,
        }}
      />

      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
          <Alert title={alertMessage.title} variant={alertMessage.variant} />
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedTransaction(null);
        }}
        onConfirm={handleDeleteTransaction}
        title={t.accountsReceivable.deleteModal.title}
        message={t.accountsReceivable.deleteModal.message(selectedTransaction?.description || "")}
        confirmLabel={t.accountsReceivable.deleteModal.confirm}
        cancelLabel={t.accountsReceivable.deleteModal.cancel}
        variant="danger"
      />
    </div>
  );
}
