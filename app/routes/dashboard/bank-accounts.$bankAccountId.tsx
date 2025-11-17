import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  Button,
  StatusBadge,
  Table,
  TableActionButtons,
  ConfirmationModal,
  Select,
  type TableColumn,
  type TableFilter,
  type SortDirection,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import {
  ROUTES,
  getBankAccountEditRoute,
  getCashFlowViewRoute,
  getCashFlowEditRoute,
} from "~/routes.config";
import { getBankAccountById } from "~/services/bank-account.service";
import { getCashFlowByBankAccountId, deleteCashFlow } from "~/services/cash-flow.service";
import { getSupplierById } from "~/services/suppliers.service";
import { getBuyerById } from "~/services/buyers.service";
import { getEmployeeById } from "~/services/employees.service";
import { getServiceProviderById } from "~/services/service-providers.service";
import { getPropertyById } from "~/services/properties.service";
import { mockSuppliers } from "~/mocks/suppliers";
import { mockBuyers } from "~/mocks/buyers";
import type { CashFlow } from "~/types";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, "dd/MM/yyyy", { locale: ptBR });
};

export function meta() {
  return [
    { title: "Detalhes da Conta Bancária - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada da conta bancária",
    },
  ];
}

export default function BankAccountDetails() {
  const { bankAccountId } = useParams<{ bankAccountId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const { language } = useLanguage();
  const bankAccount = getBankAccountById(bankAccountId);
  const [allTransactions, setAllTransactions] = useState<CashFlow[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all");
  const [selectedBuyer, setSelectedBuyer] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "date", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<CashFlow | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    if (bankAccountId) {
      setAllTransactions(getCashFlowByBankAccountId(bankAccountId));
    }
  }, [bankAccountId]);

  const handleDeleteClick = (transaction: CashFlow) => {
    setSelectedTransaction(transaction);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;
    const success = deleteCashFlow(selectedTransaction.id);
    if (success) {
      setAllTransactions(allTransactions.filter((t) => t.id !== selectedTransaction.id));
    }
    setSelectedTransaction(null);
    setIsDeleteModalOpen(false);
  };

  if (!bankAccount) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.bankAccounts.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.BANK_ACCOUNTS)}>
            {t.common.back}
          </Button>
        </div>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "default";
      default:
        return "default";
    }
  };

  const filteredTransactions = allTransactions.filter((transaction) => {
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

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
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

  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const netTotal = totalIncome - totalExpenses;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleSort = (column: string, direction: SortDirection) => {
    setSortState({ column, direction });
    setCurrentPage(1);
  };

  const filters: TableFilter[] = [
    {
      label: t.cashFlow.filters.all,
      value: "all",
      active: activeFilter === "all",
      onClick: () => {
        setActiveFilter("all");
        setSelectedSupplier("all");
        setSelectedBuyer("all");
        setCurrentPage(1);
      },
    },
    {
      label: t.cashFlow.filters.income,
      value: "income",
      active: activeFilter === "income",
      onClick: () => {
        setActiveFilter("income");
        setSelectedSupplier("all");
        setCurrentPage(1);
      },
    },
    {
      label: t.cashFlow.filters.expense,
      value: "expense",
      active: activeFilter === "expense",
      onClick: () => {
        setActiveFilter("expense");
        setSelectedBuyer("all");
        setCurrentPage(1);
      },
    },
  ];

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.bankAccounts.details.accountInfo}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {bankAccount.bankName} - {bankAccount.accountNumber}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(ROUTES.BANK_ACCOUNTS)}>
            {t.common.back}
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(getBankAccountEditRoute(bankAccount.id))}
          >
            {t.bankAccounts.edit.title}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.bankAccounts.details.bankName}
            </label>
            <p className="text-gray-900 dark:text-gray-100">{bankAccount.bankName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.bankAccounts.details.bankCode}
            </label>
            <p className="text-gray-900 dark:text-gray-100">{bankAccount.bankCode}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.bankAccounts.details.branch}
            </label>
            <p className="text-gray-900 dark:text-gray-100">{bankAccount.branch}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.bankAccounts.details.accountNumber}
            </label>
            <p className="text-gray-900 dark:text-gray-100">{bankAccount.accountNumber}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.bankAccounts.details.accountType}
            </label>
            <p className="text-gray-900 dark:text-gray-100">
              {bankAccount.accountType === "checking"
                ? t.bankAccounts.accountTypes.checking
                : t.bankAccounts.accountTypes.savings}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.bankAccounts.details.status}
            </label>
            <StatusBadge
              label={t.bankAccounts.status[bankAccount.status] || bankAccount.status}
              variant={getStatusVariant(bankAccount.status)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.bankAccounts.details.accountHolderName}
            </label>
            <p className="text-gray-900 dark:text-gray-100">{bankAccount.accountHolderName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {t.bankAccounts.details.createdAt}
            </label>
            <p className="text-gray-900 dark:text-gray-100">{formatDate(bankAccount.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <Table<CashFlow>
          columns={columns}
          data={paginatedTransactions}
          header={{
            title: t.bankAccounts.details.cashFlowTransactions,
            badge: {
              label: t.cashFlow.badge.transactions(filteredTransactions.length),
              variant: "primary",
            },
            description: t.bankAccounts.details.cashFlowDescription,
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
                      {
                        value: "all",
                        label: t.cashFlow.filters.allBuyers || "Todos os compradores",
                      },
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
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  {t.cashFlow.table.income}
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(totalIncome)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  {t.cashFlow.table.expense}
                </span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(totalExpenses)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  {t.bankAccounts.details.netTotal}
                </span>
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
              : t.bankAccounts.details.noTransactions,
            onClearSearch: () => {
              setSearchValue("");
              setActiveFilter("all");
              setSelectedSupplier("all");
              setSelectedBuyer("all");
              setSelectedYear("all");
              setSelectedMonth("all");
            },
            clearSearchLabel: t.common.clearSearch,
          }}
        />

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
    </div>
  );
}
