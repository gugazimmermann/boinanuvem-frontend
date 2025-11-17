import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
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
  type SortDirection,
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
import { getPropertyById } from "~/services/properties.service";
import type { CashFlow } from "~/types";
import { ROUTES, getCashFlowEditRoute, getCashFlowViewRoute } from "~/routes.config";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, "dd/MM/yyyy", { locale: ptBR });
};

export function meta() {
  return [
    { title: "Fluxo de Caixa - Boi na Nuvem" },
    {
      name: "description",
      content: "Gerenciamento de fluxo de caixa do Boi na Nuvem",
    },
  ];
}

export default function CashFlow() {
  const t = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<CashFlow[]>([...mockCashFlow]);
  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "date", direction: "desc" });

  useEffect(() => {
    setTransactions([...mockCashFlow]);
  }, []);

  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all");
  const [selectedBuyer, setSelectedBuyer] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<CashFlow | null>(null);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);
  const itemsPerPage = 10;

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

  const filteredData = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchValue.toLowerCase()) ||
      transaction.referenceNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
      false;

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "income" && transaction.type === "income") ||
      (activeFilter === "expense" && transaction.type === "expense");

    const matchesYear = selectedYear === "all" || transaction.date.startsWith(selectedYear);
    const monthStr = selectedMonth === "all" ? null : selectedMonth.padStart(2, "0");
    const matchesMonth =
      selectedMonth === "all" || (monthStr && transaction.date.substring(5, 7) === monthStr);

    const matchesSupplier =
      selectedSupplier === "all" ||
      (transaction.type === "expense" && transaction.supplierId === selectedSupplier);

    const matchesBuyer =
      selectedBuyer === "all" ||
      (transaction.type === "income" && transaction.buyerId === selectedBuyer);

    return (
      matchesSearch &&
      matchesFilter &&
      matchesYear &&
      matchesMonth &&
      matchesSupplier &&
      matchesBuyer
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortState.column || !sortState.direction) {
      return 0;
    }

    const aValue = a[sortState.column];
    const bValue = b[sortState.column];

    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    let comparison = 0;
    if (typeof aValue === "string" && typeof bValue === "string") {
      comparison = aValue.localeCompare(bValue, "pt-BR", {
        sensitivity: "base",
      });
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      comparison = aValue - bValue;
    } else {
      comparison = String(aValue).localeCompare(String(bValue), "pt-BR");
    }

    return sortState.direction === "asc" ? comparison : -comparison;
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Calculate totals from filtered data
  const totalIncome = filteredData
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredData
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const netTotal = totalIncome - totalExpenses;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
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
          {row.type === "income" ? "+" : "-"} {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      key: "date",
      label: t.cashFlow.table.date,
      sortable: true,
      render: (_, row) => (
        <span className="text-gray-700 dark:text-gray-300">{formatDate(row.date)}</span>
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
        />
      ),
    },
  ];

  const headerActions: TableAction[] = [
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
  ];

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

  const handleSort = (column: string, direction: SortDirection) => {
    setSortState({ column, direction });
    setCurrentPage(1);
  };

  // Generate year options
  const getYearOptions = () => {
    const allYearsLabel =
      language === "pt" ? "Todos os anos" : language === "en" ? "All years" : "Todos los años";
    const options = [{ value: "all", label: allYearsLabel }];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Add previous year and current year
    options.push({ value: String(currentYear - 1), label: String(currentYear - 1) });
    options.push({ value: String(currentYear), label: String(currentYear) });

    return options;
  };

  // Generate month options
  const getMonthOptions = () => {
    const localeMap: Record<string, string> = {
      pt: "pt-BR",
      en: "en-US",
      es: "es-ES",
    };
    const locale = localeMap[language] || "pt-BR";
    const allMonthsLabel =
      language === "pt" ? "Todos os meses" : language === "en" ? "All months" : "Todos los meses";
    const options = [{ value: "all", label: allMonthsLabel }];

    // Add all 12 months
    for (let month = 1; month <= 12; month++) {
      const monthName = new Date(2000, month - 1).toLocaleDateString(locale, {
        month: "long",
      });
      options.push({ value: String(month), label: monthName });
    }

    return options;
  };

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
        middleContent={
          <div className="flex items-center gap-4 text-sm">
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-gray-400 text-xs">Receitas</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(totalIncome)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-gray-400 text-xs">Despesas</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                {formatCurrency(totalExpenses)}
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
                {formatCurrency(netTotal)}
              </span>
            </div>
          </div>
        }
        rightContent={
          <div className="flex items-center gap-2">
            <div className="w-32">
              <Select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setCurrentPage(1);
                }}
                options={getYearOptions()}
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
                options={getMonthOptions()}
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
            setSelectedSupplier("all");
            setSelectedBuyer("all");
            setSelectedYear("all");
            setSelectedMonth("all");
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
