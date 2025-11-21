import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { enUS } from "date-fns/locale/en-US";
import { es } from "date-fns/locale/es";
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
  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "dueDate", direction: "asc" });

  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<AccountsReceivable | null>(null);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);
  const itemsPerPage = 10;

  const dateLocale = useMemo(() => {
    switch (language) {
      case "en":
        return enUS;
      case "es":
        return es;
      default:
        return ptBR;
    }
  }, [language]);

  const localeForCurrency = language === "en" ? "en-US" : language === "es" ? "es-ES" : "pt-BR";
  const localeForDateTime = language === "en" ? "en-US" : language === "es" ? "es-ES" : "pt-BR";
  const properties = useMemo(
    () => (company ? getPropertiesByCompanyId(company.id) : []),
    [company]
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dateFormat =
      language === "en" ? "MM/dd/yyyy" : language === "es" ? "dd/MM/yyyy" : "dd/MM/yyyy";
    return format(date, dateFormat, { locale: dateLocale });
  };

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

  const filteredData = transactions.filter((transaction) => {
    let matchesSearch: boolean;
    if (!searchValue) {
      matchesSearch = true;
    } else {
      const searchLower = searchValue.toLowerCase();
      const property = getPropertyById(transaction.propertyId);
      const propertyName = property?.name?.toLowerCase() || "";
      const category = transaction.category
        ? t.cashFlow.categories[transaction.category]?.toLowerCase() || ""
        : "";
      const paymentMethod = transaction.paymentMethod
        ? t.cashFlow.paymentMethods[transaction.paymentMethod]?.toLowerCase() || ""
        : "";
      const amount = formatCurrency(transaction.amount).toLowerCase();

      let buyerName = "";
      if (transaction.buyerId) {
        const buyer = getBuyerById(transaction.buyerId);
        buyerName = buyer?.name?.toLowerCase() || "";
      }

      matchesSearch =
        transaction.description.toLowerCase().includes(searchLower) ||
        transaction.referenceNumber?.toLowerCase().includes(searchLower) ||
        propertyName.includes(searchLower) ||
        category.includes(searchLower) ||
        paymentMethod.includes(searchLower) ||
        amount.includes(searchLower) ||
        buyerName.includes(searchLower);
    }

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "paid" && transaction.status === "paid") ||
      (activeFilter === "unpaid" && transaction.status === "unpaid") ||
      (activeFilter === "overdue" && transaction.status === "overdue") ||
      (activeFilter === "partial" && transaction.status === "partial");

    const matchesYear = selectedYear === "all" || transaction.dueDate.startsWith(selectedYear);
    const monthStr = selectedMonth === "all" ? null : selectedMonth.padStart(2, "0");
    const matchesMonth =
      selectedMonth === "all" || (monthStr && transaction.dueDate.substring(5, 7) === monthStr);

    const matchesProperty = propertyFilter === "all" || transaction.propertyId === propertyFilter;

    return matchesSearch && matchesFilter && matchesYear && matchesMonth && matchesProperty;
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
      comparison = aValue.localeCompare(bValue, localeForDateTime, {
        sensitivity: "base",
      });
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      comparison = aValue - bValue;
    } else {
      comparison = String(aValue).localeCompare(String(bValue), localeForDateTime);
    }

    return sortState.direction === "asc" ? comparison : -comparison;
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const totalAmount = filteredData.reduce((sum, t) => sum + t.amount, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(localeForCurrency, {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "overdue":
        return "danger";
      case "partial":
        return "warning";
      default:
        return "default";
    }
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
        <span className="text-gray-700 dark:text-gray-300">{formatDate(row.dueDate)}</span>
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

  const handleSort = (column: string, direction: SortDirection) => {
    setSortState({ column, direction });
    setCurrentPage(1);
  };

  const getYearOptions = () => {
    const options: Array<{ value: string; label: string }> = [
      { value: "all", label: t.cashFlow.filters.allYears },
    ];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    options.push({ value: String(currentYear - 1), label: String(currentYear - 1) });
    options.push({ value: String(currentYear), label: String(currentYear) });

    return options;
  };

  const getMonthOptions = () => {
    const localeMap: Record<string, string> = {
      pt: "pt-BR",
      en: "en-US",
      es: "es-ES",
    };
    const locale = localeMap[language] || "pt-BR";
    const options: Array<{ value: string; label: string }> = [
      { value: "all", label: t.cashFlow.filters.allMonths },
    ];

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
