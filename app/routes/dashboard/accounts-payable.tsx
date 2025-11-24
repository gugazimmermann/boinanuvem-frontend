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
import { mockAccountsPayable } from "~/mocks/accounts-payable";
import {
  deleteAccountsPayable,
  getAccountsPayableByCompanyId,
} from "~/services/accounts-payable.service";
import { getSupplierById } from "~/services/suppliers.service";
import { getEmployeeById } from "~/services/employees.service";
import { getServiceProviderById } from "~/services/service-providers.service";
import { getPropertyById, getPropertiesByCompanyId } from "~/services/properties.service";
import type { AccountsPayable } from "~/types";
import { ROUTES, getAccountsPayableEditRoute, getAccountsPayableViewRoute } from "~/routes.config";
import { mockCompanies } from "~/mocks/companies";
import { usePermissions } from "~/utils/permissions";
import { useFinanceList } from "~/hooks/use-finance-list";
import { useDateFilters } from "~/hooks/use-date-filters";
import { getStatusVariant } from "~/utils/finance";

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<AccountsPayable | null>(null);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);

  const properties = useMemo(
    () => (company ? getPropertiesByCompanyId(company.id) : []),
    [company]
  );

  const { yearOptions, monthOptions } = useDateFilters();

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

  const showAlert = (
    title: string,
    variant: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setAlertMessage({ title, variant });
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  const handleDeleteClick = (transaction: AccountsPayable) => {
    setSelectedTransaction(transaction);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;
    const success = deleteAccountsPayable(selectedTransaction.id);
    if (success) {
      setTransactions(transactions.filter((t) => t.id !== selectedTransaction.id));
      showAlert(t.accountsPayable.success.deleted, "success");
    } else {
      showAlert(t.accountsPayable.errors.deleteFailed, "error");
    }
    setSelectedTransaction(null);
  };

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
    {
      key: "dueDate",
      label: t.accountsPayable.table.dueDate,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">
          {formatDate(row.dueDate, language)}
        </span>
      ),
    },
    {
      key: "property",
      label: t.accountsPayable.table.property,
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
      label: t.accountsPayable.table.description,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.description}</span>
      ),
    },
    {
      key: "supplier",
      label: "",
      sortable: false,
      render: (_, row) => {
        if (row.supplierId) {
          const supplier = getSupplierById(row.supplierId);
          return <span className="text-gray-700 dark:text-gray-300">{supplier?.name || "-"}</span>;
        }
        if (row.employeeId) {
          const employee = getEmployeeById(row.employeeId);
          return <span className="text-gray-700 dark:text-gray-300">{employee?.name || "-"}</span>;
        }
        if (row.serviceProviderId) {
          const serviceProvider = getServiceProviderById(row.serviceProviderId);
          return (
            <span className="text-gray-700 dark:text-gray-300">{serviceProvider?.name || "-"}</span>
          );
        }
        return <span className="text-gray-400 dark:text-gray-500">-</span>;
      },
    },
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
    {
      key: "actions",
      label: "",
      headerClassName: "relative",
      render: (_, row) => (
        <TableActionButtons
          onEdit={() => navigate(getAccountsPayableEditRoute(row.id))}
          onDelete={() => handleDeleteClick(row)}
          canEdit={canEdit("finances", "accountsPayable")}
          canDelete={canRemove("finances", "accountsPayable")}
        />
      ),
    },
  ];

  const headerActions: TableAction[] = canAdd("finances", "accountsPayable")
    ? [
        {
          label: t.accountsPayable.addTransaction,
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
          onClick: () => navigate(ROUTES.ACCOUNTS_PAYABLE_NEW),
        },
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
    <div>
      <Table<AccountsPayable>
        columns={columns}
        data={paginatedData}
        header={{
          title: t.accountsPayable.title,
          badge: {
            label: t.accountsPayable.badge.transactions(filteredData.length),
            variant: "primary",
          },
          description: t.accountsPayable.description,
          actions: headerActions,
        }}
        filters={filters}
        search={{
          placeholder: t.accountsPayable.searchPlaceholder,
          value: searchValue,
          onChange: setSearchValue,
        }}
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
        pagination={{
          currentPage,
          totalPages: totalPages || 1,
          onPageChange: setCurrentPage,
          showInfo: false,
        }}
        sortState={sortState}
        onSort={handleSort}
        onRowClick={(row) => navigate(getAccountsPayableViewRoute(row.id))}
        emptyState={{
          title: t.accountsPayable.emptyState.title,
          description: searchValue
            ? t.accountsPayable.emptyState.descriptionWithSearch(searchValue)
            : t.accountsPayable.emptyState.descriptionWithoutSearch,
          onClearSearch: () => {
            setSearchValue("");
            setActiveFilter("all");
            setPropertyFilter("all");
            setSelectedYear("all");
            setSelectedMonth("all");
            setCurrentPage(1);
          },
          clearSearchLabel: t.common.clearSearch,
          onAddNew: () => navigate(ROUTES.ACCOUNTS_PAYABLE_NEW),
          addNewLabel: t.accountsPayable.addTransaction,
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
        title={t.accountsPayable.deleteModal.title}
        message={t.accountsPayable.deleteModal.message(selectedTransaction?.description || "")}
        confirmLabel={t.accountsPayable.deleteModal.confirm}
        cancelLabel={t.accountsPayable.deleteModal.cancel}
        variant="danger"
      />
    </div>
  );
}
