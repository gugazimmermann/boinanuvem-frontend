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
import { mockCashFlow } from "~/mocks/cash-flow";
import { mockSuppliers } from "~/mocks/suppliers";
import { mockBuyers } from "~/mocks/buyers";
import { deleteCashFlow } from "~/services/cash-flow.service";
import { getSupplierById } from "~/services/suppliers.service";
import { getBuyerById } from "~/services/buyers.service";
import { getEmployeeById } from "~/services/employees.service";
import { getServiceProviderById } from "~/services/service-providers.service";
import { getPropertyById, getPropertiesByCompanyId } from "~/services/properties.service";
import type { CashFlow } from "~/types";
import { mockCompanies } from "~/mocks/companies";
import { ROUTES, getCashFlowEditRoute, getCashFlowViewRoute } from "~/routes.config";
import { usePermissions } from "~/utils/permissions";
import { useFinanceList } from "~/hooks/use-finance-list";
import { useDateFilters } from "~/hooks/use-date-filters";
import { formatFinanceAmount } from "~/utils/finance";

export function meta() {
  return [
    { title: "Fluxo de Caixa - Boi na Nuvem" },
    {
      name: "description",
      content: "Gerenciamento de fluxo de caixa do Boi na Nuvem",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function CashFlow() {
  const t = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { canAdd, canEdit, canRemove } = usePermissions();
  const company = mockCompanies[0];
  const [transactions, setTransactions] = useState<CashFlow[]>([...mockCashFlow]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<CashFlow | null>(null);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);

  const properties = useMemo(
    () => (company ? getPropertiesByCompanyId(company.id) : []),
    [company]
  );

  const localeForCurrency = language === "en" ? "en-US" : language === "es" ? "es-ES" : "pt-BR";
  const { yearOptions, monthOptions } = useDateFilters();

  // Use finance list hook
  const {
    searchValue,
    setSearchValue,
    activeFilter,
    setActiveFilter,
    propertyFilter,
    setPropertyFilter,
    selectedSupplier,
    setSelectedSupplier,
    selectedBuyer,
    setSelectedBuyer,
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
  } = useFinanceList<CashFlow>({
    data: transactions,
    initialSort: { column: "date", direction: "desc" },
    filterConfig: {
      enableTypeFilter: true,
      enableSupplierFilter: true,
      enableBuyerFilter: true,
    },
  });

  // Calculate totals from filtered data
  const totalIncome = useMemo(
    () => filteredData.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0),
    [filteredData]
  );
  const totalExpenses = useMemo(
    () => filteredData.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
    [filteredData]
  );
  const netTotal = totalIncome - totalExpenses;

  const showAlert = (
    title: string,
    variant: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setAlertMessage({ title, variant });
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  const handleDeleteClick = (transaction: CashFlow) => {
    setSelectedTransaction(transaction);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;
    const success = deleteCashFlow(selectedTransaction.id);
    if (success) {
      setTransactions(transactions.filter((t) => t.id !== selectedTransaction.id));
      showAlert(t.cashFlow.success.deleted, "success");
    } else {
      showAlert(t.cashFlow.errors.deleteFailed, "error");
    }
    setSelectedTransaction(null);
  };

  const columns: TableColumn<CashFlow>[] = [
    {
      key: "type",
      label: t.cashFlow.table.type,
      sortable: true,
      render: (_, row) => (
        <StatusBadge
          label={row.type === "income" ? t.cashFlow.table.income : t.cashFlow.table.expense}
          variant={row.type === "income" ? "success" : "default"}
        />
      ),
    },
    {
      key: "amount",
      label: t.cashFlow.table.amount,
      sortable: true,
      render: (_, row) => (
        <span
          className={`font-medium ${
            row.type === "income"
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {formatFinanceAmount(row.amount, row.type, localeForCurrency)}
        </span>
      ),
    },
    {
      key: "date",
      label: t.cashFlow.table.date,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{formatDate(row.date, language)}</span>
      ),
    },
    {
      key: "property",
      label: t.cashFlow.table.property,
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
          {t.cashFlow.categories[row.category] || row.category}
        </span>
      ),
    },
    {
      key: "description",
      label: t.cashFlow.table.description,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.description}</span>
      ),
    },
    {
      key: "supplierBuyer",
      label: "",
      sortable: false,
      render: (_, row) => {
        if (row.type === "expense" && row.supplierId) {
          const supplier = getSupplierById(row.supplierId);
          return <span className="text-gray-700 dark:text-gray-300">{supplier?.name || "-"}</span>;
        }
        if (row.type === "expense" && row.employeeId) {
          const employee = getEmployeeById(row.employeeId);
          return <span className="text-gray-700 dark:text-gray-300">{employee?.name || "-"}</span>;
        }
        if (row.type === "expense" && row.serviceProviderId) {
          const serviceProvider = getServiceProviderById(row.serviceProviderId);
          return (
            <span className="text-gray-700 dark:text-gray-300">{serviceProvider?.name || "-"}</span>
          );
        }
        if (row.type === "income" && row.buyerId) {
          const buyer = getBuyerById(row.buyerId);
          return <span className="text-gray-700 dark:text-gray-300">{buyer?.name || "-"}</span>;
        }
        if (row.type === "income" && row.serviceProviderId) {
          const serviceProvider = getServiceProviderById(row.serviceProviderId);
          return (
            <span className="text-gray-700 dark:text-gray-300">{serviceProvider?.name || "-"}</span>
          );
        }
        return <span className="text-gray-400 dark:text-gray-500">-</span>;
      },
    },
    {
      key: "paymentMethod",
      label: t.cashFlow.table.paymentMethod,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">
          {t.cashFlow.paymentMethods[row.paymentMethod] || row.paymentMethod}
        </span>
      ),
    },
    {
      key: "referenceNumber",
      label: t.cashFlow.table.referenceNumber,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{row.referenceNumber || "-"}</span>
      ),
    },
    {
      key: "status",
      label: t.cashFlow.table.status,
      sortable: true,
      render: (_, _row) => <StatusBadge label={t.cashFlow.table.completed} variant="success" />,
    },
    {
      key: "actions",
      label: "",
      headerClassName: "relative",
      render: (_, row) => (
        <TableActionButtons
          onEdit={() => navigate(getCashFlowEditRoute(row.id))}
          onDelete={() => handleDeleteClick(row)}
          canEdit={canEdit("finances", "cashFlow")}
          canDelete={canRemove("finances", "cashFlow")}
        />
      ),
    },
  ];

  const headerActions: TableAction[] = canAdd("finances", "cashFlow")
    ? [
        {
          label: t.cashFlow.addTransaction,
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
          onClick: () => navigate(ROUTES.CASH_FLOW_NEW),
        },
      ]
    : [];

  const filters: TableFilter[] = [
    {
      label: t.cashFlow.filters.all,
      value: "all",
      active: activeFilter === "all",
      onClick: () => {
        setActiveFilter("all");
        setSelectedSupplier("all");
        setSelectedBuyer("all");
      },
    },
    {
      label: t.cashFlow.filters.income,
      value: "income",
      active: activeFilter === "income",
      onClick: () => {
        setActiveFilter("income");
        setSelectedSupplier("all");
      },
    },
    {
      label: t.cashFlow.filters.expense,
      value: "expense",
      active: activeFilter === "expense",
      onClick: () => {
        setActiveFilter("expense");
        setSelectedBuyer("all");
      },
    },
  ];

  return (
    <div>
      <Table<CashFlow>
        columns={columns}
        data={paginatedData}
        header={{
          title: t.cashFlow.title,
          badge: {
            label: t.cashFlow.badge.transactions(filteredData.length),
            variant: "primary",
          },
          description: t.cashFlow.description,
          actions: headerActions,
        }}
        filters={filters}
        search={{
          placeholder: t.cashFlow.searchPlaceholder,
          value: searchValue,
          onChange: setSearchValue,
        }}
        additionalContent={
          <div className="flex items-center gap-2">
            {activeFilter === "expense" && (
              <div className="w-48">
                <Select
                  value={selectedSupplier}
                  onChange={(e) => {
                    setSelectedSupplier(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[
                    {
                      value: "all",
                      label: t.cashFlow.filters.allSuppliers || "Todos os fornecedores",
                    },
                    ...mockSuppliers.map((supplier) => ({
                      value: supplier.id,
                      label: supplier.name,
                    })),
                  ]}
                  selectClassName="text-xs sm:text-sm py-2"
                />
              </div>
            )}
            {activeFilter === "income" && (
              <div className="w-48">
                <Select
                  value={selectedBuyer}
                  onChange={(e) => {
                    setSelectedBuyer(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[
                    { value: "all", label: t.cashFlow.filters.allBuyers || "Todos os compradores" },
                    ...mockBuyers.map((buyer) => ({
                      value: buyer.id,
                      label: buyer.name,
                    })),
                  ]}
                  selectClassName="text-xs sm:text-sm py-2"
                />
              </div>
            )}
          </div>
        }
        belowContent={
          <div className="flex items-center gap-6 text-sm">
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                {t.cashFlow.filters.income}
              </span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(totalIncome)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                {t.cashFlow.filters.expense}
              </span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                {formatCurrency(totalExpenses)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-gray-400 text-xs">{t.common.total}</span>
              <span
                className={`font-semibold ${
                  netTotal >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(netTotal)}
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
        onRowClick={(row) => navigate(getCashFlowViewRoute(row.id))}
        emptyState={{
          title: t.cashFlow.emptyState.title,
          description: searchValue
            ? t.cashFlow.emptyState.descriptionWithSearch(searchValue)
            : t.cashFlow.emptyState.descriptionWithoutSearch,
          onClearSearch: () => {
            setSearchValue("");
            setActiveFilter("all");
            setPropertyFilter("all");
            setSelectedSupplier("all");
            setSelectedBuyer("all");
            setSelectedYear("all");
            setSelectedMonth("all");
            setCurrentPage(1);
          },
          clearSearchLabel: t.common.clearSearch,
          onAddNew: () => navigate(ROUTES.CASH_FLOW_NEW),
          addNewLabel: t.cashFlow.addTransaction,
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
        title={t.cashFlow.deleteModal.title}
        message={t.cashFlow.deleteModal.message(selectedTransaction?.description || "")}
        confirmLabel={t.cashFlow.deleteModal.confirm}
        cancelLabel={t.cashFlow.deleteModal.cancel}
        variant="danger"
      />
    </div>
  );
}
