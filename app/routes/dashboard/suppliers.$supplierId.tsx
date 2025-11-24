import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from "date-fns";
import { formatDate, formatDateTime, formatCurrency } from "~/utils/formatting";
import {
  Button,
  StatusBadge,
  Table,
  TableActionButtons,
  ConfirmationModal,
  Select,
  Tooltip,
  type TableColumn,
  type TableAction,
  type TableFilter,
  type SortDirection,
  FileUpload,
  Alert,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { usePermissions } from "~/utils/permissions";
import {
  ROUTES,
  getSupplierEditRoute,
  getPropertyViewRoute,
  getObservationViewRoute,
} from "~/routes.config";
import { getSupplierById } from "~/services/suppliers.service";
import { getPropertyById } from "~/services/properties.service";
import { getCashFlowBySupplierId, deleteCashFlow } from "~/services/cash-flow.service";
import {
  getAccountsPayableBySupplierId,
  deleteAccountsPayable,
} from "~/services/accounts-payable.service";
import { getEmployeeById } from "~/services/employees.service";
import { getServiceProviderById } from "~/services/service-providers.service";
import { getBuyerById } from "~/services/buyers.service";
import {
  getCashFlowViewRoute,
  getCashFlowEditRoute,
  getAccountsPayableViewRoute,
  getAccountsPayableEditRoute,
} from "~/routes.config";
import { DASHBOARD_COLORS } from "~/components/dashboard/utils/colors";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "~/contexts/theme-context";
import { AccountsPayableStatus } from "~/types";
import {
  getSupplierObservationsBySupplierId,
  addSupplierObservation,
} from "~/services/supplier-observations.service";
import type { SupplierObservation } from "~/types/supplier-observation";
import type { CashFlow, AccountsPayable, InventoryItem } from "~/types";
import { InventoryItemCategory } from "~/types";
import { getInventoryItemsBySupplierId, getCurrentStock } from "~/services/inventory.service";
import { getInventoryViewRoute } from "~/routes.config";

const monthNames = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

interface SupplierFinanceDashboardProps {
  supplierId: string;
  language: "pt" | "en" | "es";
}

function SupplierFinanceDashboard({ supplierId, language }: SupplierFinanceDashboardProps) {
  const t = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const cashFlowData = useMemo(() => getCashFlowBySupplierId(supplierId), [supplierId]);
  const accountsPayableData = useMemo(
    () => getAccountsPayableBySupplierId(supplierId),
    [supplierId]
  );

  const currentDate = useMemo(() => new Date(), []);
  const currentMonthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const currentMonthEnd = useMemo(() => endOfMonth(currentDate), [currentDate]);

  const currentMonthCashFlow = cashFlowData.filter((transaction) => {
    const transactionDate = parseISO(transaction.date);
    return transactionDate >= currentMonthStart && transactionDate <= currentMonthEnd;
  });

  const totalIncome = currentMonthCashFlow
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = currentMonthCashFlow
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashFlow = totalIncome - totalExpenses;

  const unpaidPayable = accountsPayableData.filter(
    (ap) =>
      ap.status === AccountsPayableStatus.UNPAID || ap.status === AccountsPayableStatus.OVERDUE
  );
  const totalAccountsPayable = unpaidPayable.reduce((sum, ap) => {
    const remainingAmount = ap.paidAmount ? ap.amount - ap.paidAmount : ap.amount;
    return sum + remainingAmount;
  }, 0);

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const overduePayable = useMemo(
    () =>
      accountsPayableData.filter((ap) => {
        const dueDate = parseISO(ap.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return (
          (ap.status === AccountsPayableStatus.UNPAID ||
            ap.status === AccountsPayableStatus.OVERDUE) &&
          dueDate < today
        );
      }),
    [accountsPayableData, today]
  );

  const totalOverdue = useMemo(() => {
    return overduePayable.reduce((sum, ap) => {
      const remainingAmount = ap.paidAmount ? ap.amount - ap.paidAmount : ap.amount;
      return sum + remainingAmount;
    }, 0);
  }, [overduePayable]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; income: number; expenses: number; net: number }> =
      {};

    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(currentDate, i);
      const monthKey = format(monthDate, "yyyy-MM");
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      months[monthKey] = {
        month: monthNames[monthDate.getMonth()],
        income: 0,
        expenses: 0,
        net: 0,
      };

      cashFlowData.forEach((transaction) => {
        const transactionDate = parseISO(transaction.date);
        if (transactionDate >= monthStart && transactionDate <= monthEnd) {
          if (transaction.type === "income") {
            months[monthKey].income += transaction.amount;
          } else {
            months[monthKey].expenses += transaction.amount;
          }
        }
      });

      months[monthKey].net = months[monthKey].income - months[monthKey].expenses;
    }

    return Object.values(months);
  }, [cashFlowData, currentDate]);

  const expenseCategoriesData = useMemo(() => {
    const categories: Record<string, number> = {};

    cashFlowData.forEach((transaction) => {
      if (transaction.type === "expense") {
        const categoryKey = transaction.category;
        const categoryName = t.cashFlow.categories[categoryKey] || categoryKey;

        if (!categories[categoryName]) {
          categories[categoryName] = 0;
        }

        categories[categoryName] += transaction.amount;
      }
    });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [cashFlowData, t]);

  const textColor = isDark ? "#e5e7eb" : "#374151";
  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const chartColors = isDark
    ? {
        income: "#10b981",
        expense: "#ef4444",
        net: "#3b82f6",
      }
    : {
        income: "#059669",
        expense: "#dc2626",
        net: "#2563eb",
      };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.financesDashboard.cards.totalIncome}
              </p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                {formatCurrency(totalIncome, language)}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">📈</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.financesDashboard.cards.totalExpenses}
              </p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">📉</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.financesDashboard.cards.netCashFlow}
              </p>
              <p
                className={`text-xl font-bold mt-1 ${
                  netCashFlow >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(netCashFlow)}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.financesDashboard.cards.accountsPayable}
              </p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                {formatCurrency(totalAccountsPayable)}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">📤</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.financesDashboard.cards.overdue}
              </p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
                {formatCurrency(totalOverdue)}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">⚠️</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t.financesDashboard.charts.incomeVsExpenses}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.3} />
              <XAxis dataKey="month" tick={{ fill: textColor, fontSize: 12 }} />
              <YAxis
                tick={{ fill: textColor, fontSize: 12 }}
                tickFormatter={(value) => t.common.currency.formatShort(value)}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  border: `1px solid ${gridColor}`,
                  borderRadius: "8px",
                }}
                formatter={(value: number) => formatCurrency(value, language)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke={chartColors.income}
                strokeWidth={2}
                name={t.financesDashboard.charts.income}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke={chartColors.expense}
                strokeWidth={2}
                name={t.financesDashboard.charts.expenses}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t.financesDashboard.charts.monthlyCashFlow}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorNetSupplier" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.net} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={chartColors.net} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.3} />
              <XAxis dataKey="month" tick={{ fill: textColor, fontSize: 12 }} />
              <YAxis
                tick={{ fill: textColor, fontSize: 12 }}
                tickFormatter={(value) => t.common.currency.formatShort(value)}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  border: `1px solid ${gridColor}`,
                  borderRadius: "8px",
                }}
                formatter={(value: number) => formatCurrency(value, language)}
              />
              <Area
                type="monotone"
                dataKey="net"
                stroke={chartColors.net}
                fillOpacity={1}
                fill="url(#colorNetSupplier)"
                name={t.financesDashboard.charts.netCashFlow}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {expenseCategoriesData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t.financesDashboard.charts.expenseCategories}
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={expenseCategoriesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.3} />
                <XAxis
                  type="number"
                  tick={{ fill: textColor, fontSize: 12 }}
                  tickFormatter={(value) => t.common.currency.formatShort(value)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: textColor, fontSize: 11 }}
                  width={150}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#1f2937" : "#ffffff",
                    border: `1px solid ${gridColor}`,
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => formatCurrency(value, language)}
                />
                <Bar
                  dataKey="value"
                  fill={chartColors.expense}
                  name={t.financesDashboard.charts.expenses}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export function meta() {
  return [
    { title: "Detalhes do Fornecedor - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada do fornecedor",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function SupplierDetails() {
  const { supplierId } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const { language } = useLanguage();
  const { canEdit, isMainUser } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const supplier = getSupplierById(supplierId);

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<
    "info" | "activities" | "observations" | "finance" | "inventory"
  >(
    (tabParam === "activities" ||
    tabParam === "observations" ||
    tabParam === "finance" ||
    tabParam === "inventory"
      ? tabParam
      : "info") as "info" | "activities" | "observations" | "finance" | "inventory"
  );

  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "date", direction: "desc" });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchValue, setSearchValue] = useState("");

  const [financeSearchValue, setFinanceSearchValue] = useState("");
  const [financeActiveFilter, setFinanceActiveFilter] = useState<string>("all");
  const [financeSelectedYear, setFinanceSelectedYear] = useState<string>("all");
  const [financeSelectedMonth, setFinanceSelectedMonth] = useState<string>("all");
  const [financeCurrentPage, setFinanceCurrentPage] = useState(1);
  const [financeSortState, setFinanceSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: "date", direction: "desc" });
  const [isDeleteFinanceModalOpen, setIsDeleteFinanceModalOpen] = useState(false);
  const [selectedFinanceTransaction, setSelectedFinanceTransaction] = useState<
    CashFlow | AccountsPayable | null
  >(null);
  const [selectedFinanceTransactionType, setSelectedFinanceTransactionType] = useState<
    "cashFlow" | "payable" | null
  >(null);
  const financeItemsPerPage = 10;

  const subTabParam = searchParams.get("subTab");
  const [financeSubTab, setFinanceSubTab] = useState<"dashboard" | "transactions">(
    (subTabParam === "transactions" ? "transactions" : "dashboard") as "dashboard" | "transactions"
  );

  useEffect(() => {
    const tab = searchParams.get("tab");

    if (tab === "activities" && !isMainUser()) {
      setActiveTab("info");
      setSearchParams({ tab: "info" });
      return;
    }
    if (
      tab === "activities" ||
      tab === "observations" ||
      tab === "finance" ||
      tab === "inventory"
    ) {
      setActiveTab(tab);
    } else if (!tab) {
      setActiveTab("info");
    }

    const subTab = searchParams.get("subTab");
    if (subTab === "dashboard" || subTab === "transactions") {
      setFinanceSubTab(subTab);
    } else if (activeTab === "finance" && !subTab) {
      setFinanceSubTab("dashboard");
    }
  }, [searchParams, activeTab, isMainUser, setSearchParams]);

  const [showObservationForm, setShowObservationForm] = useState(false);
  const [observationText, setObservationText] = useState("");
  const [observationFiles, setObservationFiles] = useState<File[]>([]);
  const [isSubmittingObservation, setIsSubmittingObservation] = useState(false);
  const [observationAlert, setObservationAlert] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);
  const [observations, setObservations] = useState<SupplierObservation[]>([]);
  const [inventorySearchValue, setInventorySearchValue] = useState("");
  const [inventoryCurrentPage, setInventoryCurrentPage] = useState(1);
  const inventoryItemsPerPage = 10;

  useEffect(() => {
    if (supplier) {
      setObservations(getSupplierObservationsBySupplierId(supplier.id));
    }
  }, [supplier]);

  if (!supplier) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.suppliers.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.SUPPLIERS)}>
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmitObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier) return;

    if (!observationText.trim()) {
      setObservationAlert({
        title: t.suppliers.details.observationRequired,
        variant: "error",
      });
      setTimeout(() => setObservationAlert(null), 3000);
      return;
    }

    setIsSubmittingObservation(true);
    try {
      const fileIds = observationFiles.map((_, index) => `file-sup-obs-${Date.now()}-${index}`);

      addSupplierObservation({
        supplierId: supplier.id,
        observation: observationText.trim(),
        fileIds: fileIds.length > 0 ? fileIds : undefined,
      });

      setObservations(getSupplierObservationsBySupplierId(supplier.id));

      setObservationAlert({
        title: t.suppliers.details.observationAdded,
        variant: "success",
      });
      setTimeout(() => setObservationAlert(null), 3000);

      setObservationText("");
      setObservationFiles([]);
      setShowObservationForm(false);
    } catch (error) {
      console.error("Error adding observation:", error);
      setObservationAlert({
        title: t.suppliers.details.observationError,
        variant: "error",
      });
      setTimeout(() => setObservationAlert(null), 3000);
    } finally {
      setIsSubmittingObservation(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{supplier.name}</h1>
            <StatusBadge
              label={
                supplier.status === "active" ? t.suppliers.table.active : t.suppliers.table.inactive
              }
              variant={supplier.status === "active" ? "success" : "default"}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{supplier.code}</p>
        </div>
        <div className="flex items-center gap-3">
          {canEdit("registration", "supplier") && (
            <Button
              variant="outline"
              onClick={() => navigate(getSupplierEditRoute(supplier.id))}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              }
            >
              {t.profile.company.edit}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.SUPPLIERS)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            }
          >
            {t.team.new.back}
          </Button>
        </div>
      </div>

      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8" aria-label={t.common.ariaLabels.tabs}>
          <button
            onClick={() => {
              setActiveTab("info");
              setSearchParams({ tab: "info" });
            }}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "info"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "info"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.suppliers.details.tabs.info}
          </button>
          <button
            onClick={() => {
              setActiveTab("observations");
              setSearchParams({ tab: "observations" });
            }}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "observations"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "observations"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.suppliers.details.tabs.observations}
          </button>
          <button
            onClick={() => {
              setActiveTab("finance");
              setFinanceSubTab("dashboard");
              setSearchParams({ tab: "finance", subTab: "dashboard" });
            }}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "finance"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "finance"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.suppliers.details.tabs.finance}
          </button>
          <button
            onClick={() => {
              setActiveTab("inventory");
              setSearchParams({ tab: "inventory" });
            }}
            className={`
              py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === "inventory"
                  ? "dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }
            `}
            style={
              activeTab === "inventory"
                ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                : undefined
            }
          >
            {t.suppliers.details.tabs.inventory}
          </button>
          {isMainUser() && (
            <button
              onClick={() => {
                setActiveTab("activities");
                setSearchParams({ tab: "activities" });
              }}
              className={`
                py-3 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
                ${
                  activeTab === "activities"
                    ? "dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }
              `}
              style={
                activeTab === "activities"
                  ? { borderColor: DASHBOARD_COLORS.primary, color: DASHBOARD_COLORS.primary }
                  : undefined
              }
            >
              {t.suppliers.details.tabs.activities}
            </button>
          )}
        </nav>
      </div>

      {activeTab === "info" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t.suppliers.details.supplierInfo}
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.suppliers.table.code}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{supplier.code}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.suppliers.table.name}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{supplier.name}</p>
                </div>
                {supplier.cpf && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.suppliers.table.cpf}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{supplier.cpf}</p>
                  </div>
                )}
                {supplier.cnpj && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.suppliers.table.cnpj}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{supplier.cnpj}</p>
                  </div>
                )}
                {supplier.email && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.suppliers.table.email}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {supplier.email}
                    </p>
                  </div>
                )}
                {supplier.phone && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.suppliers.table.phone}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                      {supplier.phone}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.suppliers.details.properties}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {supplier.propertyIds && supplier.propertyIds.length > 0 ? (
                      supplier.propertyIds.map((propertyId: string) => {
                        const property = getPropertyById(propertyId);
                        return property ? (
                          <span
                            key={propertyId}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50"
                            onClick={() => navigate(getPropertyViewRoute(propertyId))}
                          >
                            {property.name}
                          </span>
                        ) : null;
                      })
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.suppliers.details.createdAt}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {formatDate(supplier.createdAt, language)}
                  </p>
                </div>
              </div>
            </div>

            {(supplier.street || supplier.city) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {t.suppliers.details.address}
                </h2>
                <div className="space-y-4">
                  {supplier.street && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.profile.company.fields.street}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {supplier.street}
                        {supplier.number ? `, ${supplier.number}` : ""}
                      </p>
                    </div>
                  )}
                  {supplier.complement && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.profile.company.fields.complement}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {supplier.complement}
                      </p>
                    </div>
                  )}
                  {supplier.neighborhood && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.profile.company.fields.neighborhood}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {supplier.neighborhood}
                      </p>
                    </div>
                  )}
                  {(supplier.city || supplier.state) && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.suppliers.details.cityState}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {supplier.city || ""}
                        {supplier.city && supplier.state ? ", " : ""}
                        {supplier.state || ""}
                      </p>
                    </div>
                  )}
                  {supplier.zipCode && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.profile.company.fields.zipCode}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {supplier.zipCode}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "activities" && isMainUser() && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t.dashboard.recentActivities.title}
          </h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div
                className="w-8 h-8 dark:bg-blue-900/30 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${DASHBOARD_COLORS.primaryLight}40` }}
              >
                <span className="text-sm">📝</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {t.suppliers.details.activityCreated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(supplier.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm">✅</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {supplier.status === "active"
                    ? t.suppliers.details.activityActivated
                    : t.suppliers.details.activityDeactivated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.suppliers.details.statusLabel}:{" "}
                  {supplier.status === "active"
                    ? t.suppliers.table.active
                    : t.suppliers.table.inactive}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "observations" &&
        supplier &&
        (() => {
          const filteredObservations = observations.filter((observation) => {
            if (!searchValue) return true;

            const searchLower = searchValue.toLowerCase();

            if (observation.observation.toLowerCase().includes(searchLower)) return true;

            const dateText = formatDateTime(observation.createdAt, language);
            if (dateText.toLowerCase().includes(searchLower)) return true;

            return false;
          });

          const sortedObservations = [...filteredObservations].sort((a, b) => {
            if (!sortState.column || !sortState.direction) {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }

            let aValue: string | number | undefined;
            let bValue: string | number | undefined;

            if (sortState.column === "date") {
              aValue = new Date(a.createdAt).getTime();
              bValue = new Date(b.createdAt).getTime();
            } else if (sortState.column === "observation") {
              aValue = a.observation;
              bValue = b.observation;
            } else {
              aValue = a[sortState.column as keyof SupplierObservation] as
                | string
                | number
                | undefined;
              bValue = b[sortState.column as keyof SupplierObservation] as
                | string
                | number
                | undefined;
            }

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

          const totalPages = Math.ceil(sortedObservations.length / itemsPerPage);
          const paginatedObservations = sortedObservations.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
          );

          const columns: TableColumn<SupplierObservation>[] = [
            {
              key: "date",
              label: t.suppliers.details.observationDate,
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">
                  {formatDateTime(row.createdAt, language)}
                </span>
              ),
            },
            {
              key: "observation",
              label: t.suppliers.details.observation,
              sortable: true,
              render: (_, row) => {
                const truncated =
                  row.observation.length > 100
                    ? `${row.observation.substring(0, 100)}...`
                    : row.observation;
                return (
                  <span className="text-gray-700 dark:text-gray-300" title={row.observation}>
                    {truncated}
                  </span>
                );
              },
            },
            {
              key: "files",
              label: t.suppliers.details.files,
              sortable: false,
              render: (_, row) => {
                if (!row.fileIds || row.fileIds.length === 0) {
                  return <span className="text-gray-400 dark:text-gray-500">-</span>;
                }
                return (
                  <div className="flex items-center space-x-1">
                    <svg
                      className="h-4 w-4 text-gray-500 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {row.fileIds.length}
                    </span>
                  </div>
                );
              },
            },
          ];

          const headerActions: TableAction[] = [
            {
              label: t.suppliers.details.addObservation,
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
              onClick: () => setShowObservationForm(true),
            },
          ];

          return (
            <div className="space-y-6">
              {observationAlert && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
                  <Alert title={observationAlert.title} variant={observationAlert.variant} />
                </div>
              )}

              {showObservationForm && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                      {t.suppliers.details.newObservation}
                    </h3>
                    <button
                      onClick={() => {
                        setShowObservationForm(false);
                        setObservationText("");
                        setObservationFiles([]);
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleSubmitObservation} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t.suppliers.details.observation} <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={observationText}
                        onChange={(e) => setObservationText(e.target.value)}
                        disabled={isSubmittingObservation}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 resize-none"
                        placeholder={
                          t.suppliers.details.observationPlaceholder ||
                          "Digite sua observação sobre este fornecedor..."
                        }
                        required
                      />
                    </div>

                    <FileUpload
                      label={t.suppliers.details.files}
                      files={observationFiles}
                      onChange={setObservationFiles}
                      disabled={isSubmittingObservation}
                      multiple={true}
                      helperText={
                        t.suppliers.details.filesHelper ||
                        "Você pode fazer upload de múltiplos arquivos"
                      }
                    />

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowObservationForm(false);
                          setObservationText("");
                          setObservationFiles([]);
                        }}
                        disabled={isSubmittingObservation}
                      >
                        {t.common.cancel}
                      </Button>
                      <Button type="submit" disabled={isSubmittingObservation}>
                        {t.common.save}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {!showObservationForm && (
                <Table<SupplierObservation & Record<string, unknown>>
                  columns={columns}
                  data={paginatedObservations as (SupplierObservation & Record<string, unknown>)[]}
                  header={{
                    title: t.suppliers.details.tabs.observations,
                    badge: {
                      label: `${filteredObservations.length} ${filteredObservations.length !== 1 ? t.suppliers.details.tabs.observations : t.suppliers.details.observation}`,
                      variant: "primary",
                    },
                    description:
                      t.suppliers.details.observationsDescription ||
                      "Gerencie as observações deste fornecedor",
                    actions: headerActions,
                  }}
                  search={{
                    placeholder: t.suppliers.details.searchObservations,
                    value: searchValue,
                    onChange: (value) => {
                      setSearchValue(value);
                      setCurrentPage(1);
                    },
                  }}
                  pagination={{
                    currentPage,
                    totalPages: totalPages || 1,
                    onPageChange: (page) => {
                      setCurrentPage(page);
                    },
                    showInfo: false,
                  }}
                  sortState={sortState}
                  onSort={(column, direction) => {
                    setSortState({ column, direction });
                    setCurrentPage(1);
                  }}
                  emptyState={{
                    title: t.suppliers.details.noObservations,
                    description: searchValue
                      ? typeof t.suppliers.details.noObservationsWithSearch === "function"
                        ? t.suppliers.details.noObservationsWithSearch(searchValue)
                        : t.suppliers.details.noObservationsWithSearch ||
                          `Nenhuma observação encontrada para "${searchValue}"`
                      : t.suppliers.details.noObservationsDescription ||
                        "Adicione sua primeira observação sobre este fornecedor.",
                    onClearSearch: searchValue
                      ? () => {
                          setSearchValue("");
                          setCurrentPage(1);
                        }
                      : undefined,
                    clearSearchLabel: searchValue ? t.common.clearSearch : undefined,
                    onAddNew: () => setShowObservationForm(true),
                    addNewLabel: t.suppliers.details.addObservation,
                  }}
                  onRowClick={(row) =>
                    navigate(`${getObservationViewRoute(row.id)}?fromSupplier=${supplier.id}`)
                  }
                />
              )}
            </div>
          );
        })()}

      {activeTab === "finance" &&
        supplier &&
        (() => {
          return (
            <div className="space-y-6">
              <div className="mb-4">
                <nav className="flex space-x-3" aria-label="Sub Tabs">
                  <button
                    onClick={() => {
                      setFinanceSubTab("dashboard");
                      setSearchParams({ tab: "finance", subTab: "dashboard" });
                    }}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer
                      ${
                        financeSubTab === "dashboard"
                          ? "shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                      }
                    `}
                    style={
                      financeSubTab === "dashboard"
                        ? {
                            backgroundColor: `${DASHBOARD_COLORS.primaryLight}40`,
                            color: DASHBOARD_COLORS.primaryDark,
                          }
                        : undefined
                    }
                  >
                    {t.suppliers.details.finance.subTabs.dashboard}
                  </button>
                  <button
                    onClick={() => {
                      setFinanceSubTab("transactions");
                      setSearchParams({ tab: "finance", subTab: "transactions" });
                    }}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer
                      ${
                        financeSubTab === "transactions"
                          ? "shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                      }
                    `}
                    style={
                      financeSubTab === "transactions"
                        ? {
                            backgroundColor: `${DASHBOARD_COLORS.primaryLight}40`,
                            color: DASHBOARD_COLORS.primaryDark,
                          }
                        : undefined
                    }
                  >
                    {t.suppliers.details.finance.subTabs.transactions}
                  </button>
                </nav>
              </div>

              {financeSubTab === "dashboard" && (
                <SupplierFinanceDashboard supplierId={supplier.id} language={language} />
              )}

              {financeSubTab === "transactions" &&
                (() => {
                  type UnifiedTransaction = {
                    id: string;
                    type: "income" | "expense";
                    amount: number;
                    date: string;
                    description: string;
                    category?: string;
                    paymentMethod?: string;
                    referenceNumber?: string;
                    status: string;
                    transactionType: "cashFlow" | "payable";
                    propertyId?: string;
                    supplierId?: string;
                    buyerId?: string;
                    employeeId?: string;
                    serviceProviderId?: string;
                    [key: string]: unknown;
                  };

                  const normalizeCashFlow = (cf: CashFlow): UnifiedTransaction => ({
                    id: cf.id,
                    type: cf.type,
                    amount: cf.amount,
                    date: cf.date,
                    description: cf.description,
                    category: cf.category,
                    paymentMethod: cf.paymentMethod,
                    referenceNumber: cf.referenceNumber,
                    status: cf.status,
                    transactionType: "cashFlow",
                    propertyId: cf.propertyId,
                    employeeId: cf.employeeId,
                    serviceProviderId: cf.serviceProviderId,
                  });

                  const normalizePayable = (ap: AccountsPayable): UnifiedTransaction => ({
                    id: ap.id,
                    type: "expense",
                    amount: ap.amount,
                    date: ap.dueDate,
                    description: ap.description,
                    category: ap.category,
                    paymentMethod: ap.paymentMethod,
                    referenceNumber: ap.referenceNumber,
                    status: ap.status,
                    transactionType: "payable",
                    propertyId: ap.propertyId,
                    employeeId: ap.employeeId,
                    serviceProviderId: ap.serviceProviderId,
                  });

                  const cashFlowTransactions = getCashFlowBySupplierId(supplier.id);
                  const payableTransactions = getAccountsPayableBySupplierId(supplier.id);

                  const allTransactions: UnifiedTransaction[] = [
                    ...cashFlowTransactions.map(normalizeCashFlow),
                    ...payableTransactions.map(normalizePayable),
                  ];

                  const handleDeleteFinanceClick = (transaction: UnifiedTransaction) => {
                    let originalTransaction: CashFlow | AccountsPayable | null = null;
                    let transactionType: "cashFlow" | "payable" | null = null;

                    if (transaction.transactionType === "cashFlow") {
                      const found = cashFlowTransactions.find((t) => t.id === transaction.id);
                      if (found) {
                        originalTransaction = found;
                        transactionType = "cashFlow";
                      }
                    } else if (transaction.transactionType === "payable") {
                      const found = payableTransactions.find((t) => t.id === transaction.id);
                      if (found) {
                        originalTransaction = found;
                        transactionType = "payable";
                      }
                    }

                    if (originalTransaction && transactionType) {
                      setSelectedFinanceTransaction(originalTransaction);
                      setSelectedFinanceTransactionType(transactionType);
                      setIsDeleteFinanceModalOpen(true);
                    }
                  };

                  const handleDeleteFinanceTransaction = async () => {
                    if (!selectedFinanceTransaction || !selectedFinanceTransactionType) return;

                    let success = false;
                    if (selectedFinanceTransactionType === "cashFlow") {
                      success = deleteCashFlow(selectedFinanceTransaction.id);
                    } else if (selectedFinanceTransactionType === "payable") {
                      success = deleteAccountsPayable(selectedFinanceTransaction.id);
                    }

                    if (success) {
                      setObservationAlert({
                        title: t.cashFlow.success.deleted,
                        variant: "success",
                      });
                      setTimeout(() => setObservationAlert(null), 3000);
                    } else {
                      setObservationAlert({
                        title: t.cashFlow.errors.deleteFailed,
                        variant: "error",
                      });
                      setTimeout(() => setObservationAlert(null), 3000);
                    }
                    setSelectedFinanceTransaction(null);
                    setSelectedFinanceTransactionType(null);
                  };

                  const filteredFinanceData = allTransactions.filter((transaction) => {
                    let matchesSearch: boolean;
                    if (!financeSearchValue) {
                      matchesSearch = true;
                    } else {
                      const searchLower = financeSearchValue.toLowerCase();
                      const property = transaction.propertyId
                        ? getPropertyById(transaction.propertyId)
                        : null;
                      const propertyName = property?.name?.toLowerCase() || "";
                      const category = transaction.category
                        ? (t.cashFlow.categories as Record<string, string>)[
                            transaction.category
                          ]?.toLowerCase() || ""
                        : "";
                      const paymentMethod = transaction.paymentMethod
                        ? (t.cashFlow.paymentMethods as Record<string, string>)[
                            transaction.paymentMethod
                          ]?.toLowerCase() || ""
                        : "";
                      const amount = formatCurrency(transaction.amount, language).toLowerCase();

                      let employeeName = "";
                      if (transaction.employeeId) {
                        const employee = getEmployeeById(transaction.employeeId);
                        employeeName = employee?.name?.toLowerCase() || "";
                      }

                      let serviceProviderName = "";
                      if (transaction.serviceProviderId) {
                        const serviceProvider = getServiceProviderById(
                          transaction.serviceProviderId
                        );
                        serviceProviderName = serviceProvider?.name?.toLowerCase() || "";
                      }

                      matchesSearch =
                        transaction.description.toLowerCase().includes(searchLower) ||
                        transaction.referenceNumber?.toLowerCase().includes(searchLower) ||
                        propertyName.includes(searchLower) ||
                        category.includes(searchLower) ||
                        paymentMethod.includes(searchLower) ||
                        amount.includes(searchLower) ||
                        employeeName.includes(searchLower) ||
                        serviceProviderName.includes(searchLower);
                    }

                    const matchesFilter =
                      financeActiveFilter === "all" ||
                      (financeActiveFilter === "income" && transaction.type === "income") ||
                      (financeActiveFilter === "expense" && transaction.type === "expense");

                    const matchesYear =
                      financeSelectedYear === "all" ||
                      transaction.date.startsWith(financeSelectedYear);
                    const monthStr =
                      financeSelectedMonth === "all" ? null : financeSelectedMonth.padStart(2, "0");
                    const matchesMonth =
                      financeSelectedMonth === "all" ||
                      (monthStr && transaction.date.substring(5, 7) === monthStr);

                    return matchesSearch && matchesFilter && matchesYear && matchesMonth;
                  });

                  const sortedFinanceData = [...filteredFinanceData].sort((a, b) => {
                    if (!financeSortState.column || !financeSortState.direction) {
                      return 0;
                    }

                    const aValue = a[financeSortState.column];
                    const bValue = b[financeSortState.column];

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

                    return financeSortState.direction === "asc" ? comparison : -comparison;
                  });

                  const paginatedFinanceData = sortedFinanceData.slice(
                    (financeCurrentPage - 1) * financeItemsPerPage,
                    financeCurrentPage * financeItemsPerPage
                  );

                  const totalFinancePages = Math.ceil(
                    filteredFinanceData.length / financeItemsPerPage
                  );

                  const totalIncome = filteredFinanceData
                    .filter((t) => t.type === "income")
                    .reduce((sum, t) => sum + t.amount, 0);
                  const totalExpenses = filteredFinanceData
                    .filter((t) => t.type === "expense")
                    .reduce((sum, t) => sum + t.amount, 0);
                  const netTotal = totalIncome - totalExpenses;

                  const getStatusVariant = (status: string, transactionType: string) => {
                    if (transactionType === "cashFlow") {
                      return "success";
                    }
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

                  const getStatusLabel = (status: string, transactionType: string) => {
                    if (transactionType === "cashFlow") {
                      return t.cashFlow.table.completed;
                    }
                    if (transactionType === "payable") {
                      return (
                        t.accountsPayable.status[status as keyof typeof t.accountsPayable.status] ||
                        status
                      );
                    }
                    return status;
                  };

                  const financeColumns: TableColumn<UnifiedTransaction>[] = [
                    {
                      key: "type",
                      label: t.cashFlow.table.type,
                      sortable: true,
                      render: (_, row) => (
                        <StatusBadge
                          label={
                            row.type === "income"
                              ? t.cashFlow.table.income
                              : t.cashFlow.table.expense
                          }
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
                          {row.type === "income" ? "+" : "-"} {formatCurrency(row.amount, language)}
                        </span>
                      ),
                    },
                    {
                      key: "date",
                      label: t.cashFlow.table.date,
                      sortable: true,
                      render: (_, row) => (
                        <span className="text-gray-700 dark:text-gray-300">
                          {formatDate(row.date)}
                        </span>
                      ),
                    },
                    {
                      key: "property",
                      label: t.cashFlow.table.property,
                      sortable: true,
                      render: (_, row) => {
                        const property = getPropertyById(row.propertyId);
                        return (
                          <span className="text-gray-700 dark:text-gray-300">
                            {property?.name || "-"}
                          </span>
                        );
                      },
                    },
                    {
                      key: "category",
                      label: t.cashFlow.table.category,
                      sortable: true,
                      render: (_, row) => (
                        <span className="text-gray-700 dark:text-gray-300">
                          {row.category
                            ? (t.cashFlow.categories as Record<string, string>)[row.category] ||
                              row.category
                            : row.category}
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
                        if (row.type === "expense" && row.employeeId) {
                          const employee = getEmployeeById(row.employeeId);
                          return (
                            <span className="text-gray-700 dark:text-gray-300">
                              {employee?.name || "-"}
                            </span>
                          );
                        }
                        if (row.type === "expense" && row.serviceProviderId) {
                          const serviceProvider = getServiceProviderById(row.serviceProviderId);
                          return (
                            <span className="text-gray-700 dark:text-gray-300">
                              {serviceProvider?.name || "-"}
                            </span>
                          );
                        }
                        if (row.type === "income" && row.buyerId) {
                          const buyer = getBuyerById(row.buyerId);
                          return (
                            <span className="text-gray-700 dark:text-gray-300">
                              {buyer?.name || "-"}
                            </span>
                          );
                        }
                        if (row.type === "income" && row.serviceProviderId) {
                          const serviceProvider = getServiceProviderById(row.serviceProviderId);
                          return (
                            <span className="text-gray-700 dark:text-gray-300">
                              {serviceProvider?.name || "-"}
                            </span>
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
                          {row.paymentMethod
                            ? (t.cashFlow.paymentMethods as Record<string, string>)[
                                row.paymentMethod
                              ] || row.paymentMethod
                            : row.paymentMethod}
                        </span>
                      ),
                    },
                    {
                      key: "referenceNumber",
                      label: t.cashFlow.table.referenceNumber,
                      sortable: true,
                      render: (_, row) => (
                        <span className="text-gray-700 dark:text-gray-300">
                          {row.referenceNumber || "-"}
                        </span>
                      ),
                    },
                    {
                      key: "status",
                      label: t.cashFlow.table.status,
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
                        const getEditRoute = () => {
                          if (row.transactionType === "cashFlow") {
                            return getCashFlowEditRoute(row.id);
                          } else {
                            return getAccountsPayableEditRoute(row.id);
                          }
                        };

                        return (
                          <TableActionButtons
                            onEdit={() => navigate(getEditRoute())}
                            onDelete={() => handleDeleteFinanceClick(row)}
                          />
                        );
                      },
                    },
                  ];

                  const financeFilters: TableFilter[] = [
                    {
                      label: t.cashFlow.filters.all,
                      value: "all",
                      active: financeActiveFilter === "all",
                      onClick: () => {
                        setFinanceActiveFilter("all");
                        setFinanceCurrentPage(1);
                      },
                    },
                    {
                      label: t.cashFlow.filters.income,
                      value: "income",
                      active: financeActiveFilter === "income",
                      onClick: () => {
                        setFinanceActiveFilter("income");
                        setFinanceCurrentPage(1);
                      },
                    },
                    {
                      label: t.cashFlow.filters.expense,
                      value: "expense",
                      active: financeActiveFilter === "expense",
                      onClick: () => {
                        setFinanceActiveFilter("expense");
                        setFinanceCurrentPage(1);
                      },
                    },
                  ];

                  const getYearOptions = () => {
                    const options: Array<{ value: string; label: string }> = [
                      { value: "all", label: t.cashFlow.filters.allYears },
                    ];
                    const currentDate = new Date();
                    const currentYear = currentDate.getFullYear();

                    options.push({
                      value: String(currentYear - 1),
                      label: String(currentYear - 1),
                    });
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
                    <div className="space-y-6">
                      <Table<UnifiedTransaction>
                        columns={financeColumns}
                        data={paginatedFinanceData}
                        header={{
                          title: t.suppliers.details.finance.title,
                          badge: {
                            label: t.cashFlow.badge.transactions(filteredFinanceData.length),
                            variant: "primary",
                          },
                          description: t.suppliers.details.finance.description,
                        }}
                        filters={financeFilters}
                        search={{
                          placeholder: t.cashFlow.searchPlaceholder,
                          value: financeSearchValue,
                          onChange: setFinanceSearchValue,
                        }}
                        rightContent={
                          <div className="flex items-center gap-2">
                            <div className="w-32">
                              <Select
                                value={financeSelectedYear}
                                onChange={(e) => {
                                  setFinanceSelectedYear(e.target.value);
                                  setFinanceCurrentPage(1);
                                }}
                                options={getYearOptions()}
                                selectClassName="text-xs sm:text-sm py-2"
                              />
                            </div>
                            <div className="w-36">
                              <Select
                                value={financeSelectedMonth}
                                onChange={(e) => {
                                  setFinanceSelectedMonth(e.target.value);
                                  setFinanceCurrentPage(1);
                                }}
                                options={getMonthOptions()}
                                selectClassName="text-xs sm:text-sm py-2"
                              />
                            </div>
                          </div>
                        }
                        middleContent={
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex flex-col">
                              <span className="text-gray-500 dark:text-gray-400 text-xs">
                                {t.cashFlow.filters.income}
                              </span>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                {formatCurrency(totalIncome, language)}
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
                              <span className="text-gray-500 dark:text-gray-400 text-xs">
                                {t.common.total}
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
                        pagination={{
                          currentPage: financeCurrentPage,
                          totalPages: totalFinancePages || 1,
                          onPageChange: setFinanceCurrentPage,
                          showInfo: false,
                        }}
                        sortState={financeSortState}
                        onSort={(column, direction) => {
                          setFinanceSortState({ column, direction });
                          setFinanceCurrentPage(1);
                        }}
                        onRowClick={(row) => {
                          if (row.transactionType === "cashFlow") {
                            navigate(getCashFlowViewRoute(row.id));
                          } else {
                            navigate(getAccountsPayableViewRoute(row.id));
                          }
                        }}
                        emptyState={{
                          title: t.cashFlow.emptyState.title,
                          description: financeSearchValue
                            ? t.cashFlow.emptyState.descriptionWithSearch(financeSearchValue)
                            : t.cashFlow.emptyState.descriptionWithoutSearch,
                          onClearSearch: () => {
                            setFinanceSearchValue("");
                            setFinanceActiveFilter("all");
                            setFinanceSelectedYear("all");
                            setFinanceSelectedMonth("all");
                          },
                          clearSearchLabel: t.common.clearSearch,
                        }}
                      />

                      <ConfirmationModal
                        isOpen={isDeleteFinanceModalOpen}
                        onClose={() => {
                          setIsDeleteFinanceModalOpen(false);
                          setSelectedFinanceTransaction(null);
                        }}
                        onConfirm={handleDeleteFinanceTransaction}
                        title={t.cashFlow.deleteModal.title}
                        message={t.cashFlow.deleteModal.message(
                          (selectedFinanceTransaction as CashFlow | AccountsPayable)?.description ||
                            ""
                        )}
                        confirmLabel={t.cashFlow.deleteModal.confirm}
                        cancelLabel={t.cashFlow.deleteModal.cancel}
                        variant="danger"
                      />
                    </div>
                  );
                })()}
            </div>
          );
        })()}

      {activeTab === "inventory" &&
        supplier &&
        (() => {
          const inventoryItems = getInventoryItemsBySupplierId(supplier.id);

          const filteredInventoryItems = inventoryItems.filter((item) => {
            if (!inventorySearchValue) return true;
            const searchLower = inventorySearchValue.toLowerCase();
            return (
              item.name.toLowerCase().includes(searchLower) ||
              item.code.toLowerCase().includes(searchLower) ||
              (item.description?.toLowerCase().includes(searchLower) ?? false)
            );
          });

          const paginatedInventoryItems = filteredInventoryItems.slice(
            (inventoryCurrentPage - 1) * inventoryItemsPerPage,
            inventoryCurrentPage * inventoryItemsPerPage
          );

          const totalInventoryPages = Math.ceil(
            filteredInventoryItems.length / inventoryItemsPerPage
          );

          const inventoryColumns: TableColumn<InventoryItem>[] = [
            {
              key: "name",
              label: t.inventory.table.name,
              sortable: true,
              render: (_, row) => (
                <div>
                  <h2 className="font-medium text-gray-800 dark:text-gray-200">{row.name}</h2>
                  <p className="text-sm font-normal text-gray-600 dark:text-gray-400">{row.code}</p>
                </div>
              ),
            },
            {
              key: "category",
              label: t.inventory.table.category,
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">
                  {row.category === InventoryItemCategory.CUSTOM
                    ? row.customCategory || t.inventory.categories.custom
                    : t.inventory.categories[row.category as keyof typeof t.inventory.categories] ||
                      row.category}
                </span>
              ),
            },
            {
              key: "currentStock",
              label: t.inventory.table.currentStock,
              sortable: false,
              render: (_, row) => {
                const currentStock = getCurrentStock(row.id);
                const isLowStock = currentStock < row.minimumStock;
                const getUnitLabel = (unit: string, quantity: number = 1): string => {
                  const unitMap: Record<
                    string,
                    {
                      singular: keyof typeof t.inventory.units;
                      plural?: keyof typeof t.inventory.units;
                    }
                  > = {
                    unidade: { singular: "unit", plural: "unitPlural" },
                    g: { singular: "gram" },
                    kg: { singular: "kg" },
                    tonelada: { singular: "ton", plural: "tonPlural" },

                    ml: { singular: "milliliter" },
                    L: { singular: "liter" },

                    cm: { singular: "centimeter", plural: "centimeterPlural" },
                    m: { singular: "meter", plural: "meterPlural" },

                    m2: { singular: "squareMeter", plural: "squareMeterPlural" },
                    ha: { singular: "hectare", plural: "hectarePlural" },

                    saco: { singular: "bag", plural: "bagPlural" },
                    frasco: { singular: "bottle", plural: "bottlePlural" },
                    dose: { singular: "dose", plural: "dosePlural" },
                    caixa: { singular: "box", plural: "boxPlural" },
                    comprimido: { singular: "tablet", plural: "tabletPlural" },
                    pilula: { singular: "pill", plural: "pillPlural" },
                    ampola: { singular: "ampoule", plural: "ampoulePlural" },
                    seringa: { singular: "syringe", plural: "syringePlural" },
                    cartucho: { singular: "cartridge", plural: "cartridgePlural" },
                    rolo: { singular: "roll", plural: "rollPlural" },
                    pacote: { singular: "package", plural: "packagePlural" },
                    lata: { singular: "can", plural: "canPlural" },
                  };
                  const unitInfo = unitMap[unit];
                  if (!unitInfo) return unit;

                  const isPlural = Math.abs(quantity) !== 1;
                  const key = isPlural && unitInfo.plural ? unitInfo.plural : unitInfo.singular;
                  return t.inventory.units[key] || unit;
                };
                return (
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium ${isLowStock ? "text-red-600 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}
                    >
                      {currentStock} {getUnitLabel(row.unit, currentStock)}
                    </span>
                    {isLowStock && (
                      <Tooltip content={t.inventory.table.lowStock} position="top">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-5 h-5 text-red-600 dark:text-red-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                          />
                        </svg>
                      </Tooltip>
                    )}
                  </div>
                );
              },
            },
            {
              key: "actions",
              label: "",
              headerClassName: "relative",
              render: (_, row) => (
                <TableActionButtons
                  onEdit={() => navigate(getInventoryViewRoute(row.id))}
                  canEdit={canEdit("registration", "inventory")}
                  canDelete={false}
                />
              ),
            },
          ];

          return (
            <div className="space-y-6">
              <Table<InventoryItem>
                columns={inventoryColumns}
                data={paginatedInventoryItems}
                header={{
                  title: t.suppliers.details.tabs.inventory,
                  badge: {
                    label: `${filteredInventoryItems.length} ${filteredInventoryItems.length !== 1 ? "itens" : "item"}`,
                    variant: "primary",
                  },
                  description:
                    t.suppliers.details.inventoryDescription ||
                    "Itens de estoque fornecidos por este fornecedor",
                }}
                search={{
                  placeholder: t.inventory.searchPlaceholder,
                  value: inventorySearchValue,
                  onChange: setInventorySearchValue,
                }}
                pagination={{
                  currentPage: inventoryCurrentPage,
                  totalPages: totalInventoryPages || 1,
                  onPageChange: setInventoryCurrentPage,
                  showInfo: false,
                }}
                onRowClick={(row) => navigate(getInventoryViewRoute(row.id))}
                emptyState={{
                  title: t.inventory.emptyState.title,
                  description: inventorySearchValue
                    ? t.inventory.emptyState.descriptionWithSearch(inventorySearchValue)
                    : t.suppliers.details.noInventoryItems ||
                      "Este fornecedor não possui itens de estoque associados.",
                  onClearSearch: () => {
                    setInventorySearchValue("");
                  },
                  clearSearchLabel: t.common.clearSearch,
                }}
              />
            </div>
          );
        })()}
    </div>
  );
}
