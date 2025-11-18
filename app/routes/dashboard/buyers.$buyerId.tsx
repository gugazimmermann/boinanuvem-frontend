import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  Button,
  StatusBadge,
  Table,
  TableActionButtons,
  ConfirmationModal,
  Select,
  type TableColumn,
  type TableAction,
  type TableFilter,
  type SortDirection,
  FileUpload,
  Alert,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import {
  ROUTES,
  getBuyerEditRoute,
  getPropertyViewRoute,
  getObservationViewRoute,
} from "~/routes.config";
import { getBuyerById } from "~/services/buyers.service";
import { getPropertyById } from "~/services/properties.service";
import { getCashFlowByBuyerId, deleteCashFlow } from "~/services/cash-flow.service";
import {
  getAccountsReceivableByBuyerId,
  deleteAccountsReceivable,
} from "~/services/accounts-receivable.service";
import { getEmployeeById } from "~/services/employees.service";
import { getServiceProviderById } from "~/services/service-providers.service";
import { getSupplierById } from "~/services/suppliers.service";
import {
  getCashFlowViewRoute,
  getCashFlowEditRoute,
  getAccountsReceivableViewRoute,
  getAccountsReceivableEditRoute,
} from "~/routes.config";
import { DASHBOARD_COLORS } from "~/components/dashboard/utils/colors";
import {
  getBuyerObservationsByBuyerId,
  addBuyerObservation,
} from "~/services/buyer-observations.service";
import type { BuyerObservation } from "~/types/buyer-observation";
import type { CashFlow, AccountsReceivable } from "~/types";
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
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "~/contexts/theme-context";
import { AccountsReceivableStatus } from "~/types";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

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

interface BuyerFinanceDashboardProps {
  buyerId: string;
}

function BuyerFinanceDashboard({ buyerId }: BuyerFinanceDashboardProps) {
  const t = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const cashFlowData = useMemo(() => getCashFlowByBuyerId(buyerId), [buyerId]);
  const accountsReceivableData = useMemo(() => getAccountsReceivableByBuyerId(buyerId), [buyerId]);

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

  const unpaidReceivable = accountsReceivableData.filter(
    (ar) =>
      ar.status === AccountsReceivableStatus.UNPAID ||
      ar.status === AccountsReceivableStatus.OVERDUE
  );
  const totalAccountsReceivable = unpaidReceivable.reduce((sum, ar) => {
    const remainingAmount = ar.paidAmount ? ar.amount - ar.paidAmount : ar.amount;
    return sum + remainingAmount;
  }, 0);

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const overdueReceivable = useMemo(
    () =>
      accountsReceivableData.filter((ar) => {
        const dueDate = parseISO(ar.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return (
          (ar.status === AccountsReceivableStatus.UNPAID ||
            ar.status === AccountsReceivableStatus.OVERDUE) &&
          dueDate < today
        );
      }),
    [accountsReceivableData, today]
  );

  const totalOverdue = useMemo(() => {
    return overdueReceivable.reduce((sum, ar) => {
      const remainingAmount = ar.paidAmount ? ar.amount - ar.paidAmount : ar.amount;
      return sum + remainingAmount;
    }, 0);
  }, [overdueReceivable]);

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
                {formatCurrency(totalIncome)}
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
                {t.financesDashboard.cards.accountsReceivable}
              </p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {formatCurrency(totalAccountsReceivable)}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">📥</span>
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
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  border: `1px solid ${gridColor}`,
                  borderRadius: "8px",
                }}
                formatter={(value: number) => formatCurrency(value)}
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
                <linearGradient id="colorNetBuyer" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.net} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={chartColors.net} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.3} />
              <XAxis dataKey="month" tick={{ fill: textColor, fontSize: 12 }} />
              <YAxis
                tick={{ fill: textColor, fontSize: 12 }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  border: `1px solid ${gridColor}`,
                  borderRadius: "8px",
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Area
                type="monotone"
                dataKey="net"
                stroke={chartColors.net}
                fillOpacity={1}
                fill="url(#colorNetBuyer)"
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
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: textColor, fontSize: 11 }}
                  width={150}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#1f2937" : "#ffffff",
                    border: `1px solid ${gridColor}`,
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => formatCurrency(value)}
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
    { title: "Detalhes do Comprador - Boi na Nuvem" },
    {
      name: "description",
      content: "Visualização detalhada do comprador",
    },
  ];
}

export default function BuyerDetails() {
  const { buyerId } = useParams<{ buyerId: string }>();
  const navigate = useNavigate();
  const t = useTranslation();
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const buyer = getBuyerById(buyerId);

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"info" | "activities" | "observations" | "finance">(
    (tabParam === "activities" || tabParam === "observations" || tabParam === "finance"
      ? tabParam
      : "info") as "info" | "activities" | "observations" | "finance"
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
    CashFlow | AccountsReceivable | null
  >(null);
  const [selectedFinanceTransactionType, setSelectedFinanceTransactionType] = useState<
    "cashFlow" | "receivable" | null
  >(null);
  const financeItemsPerPage = 10;

  const subTabParam = searchParams.get("subTab");
  const [financeSubTab, setFinanceSubTab] = useState<"dashboard" | "transactions">(
    (subTabParam === "transactions" ? "transactions" : "dashboard") as "dashboard" | "transactions"
  );

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "activities" || tab === "observations" || tab === "finance") {
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
  }, [searchParams, activeTab]);

  const [showObservationForm, setShowObservationForm] = useState(false);
  const [observationText, setObservationText] = useState("");
  const [observationFiles, setObservationFiles] = useState<File[]>([]);
  const [isSubmittingObservation, setIsSubmittingObservation] = useState(false);
  const [observationAlert, setObservationAlert] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);
  const [observations, setObservations] = useState<BuyerObservation[]>([]);

  useEffect(() => {
    if (buyer) {
      setObservations(getBuyerObservationsByBuyerId(buyer.id));
    }
  }, [buyer]);

  if (!buyer) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.buyers.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.BUYERS)}>
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleSubmitObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyer) return;

    if (!observationText.trim()) {
      setObservationAlert({
        title: t.buyers.details.observationRequired,
        variant: "error",
      });
      setTimeout(() => setObservationAlert(null), 3000);
      return;
    }

    setIsSubmittingObservation(true);
    try {
      const fileIds = observationFiles.map((_, index) => `file-buy-obs-${Date.now()}-${index}`);

      addBuyerObservation({
        buyerId: buyer.id,
        observation: observationText.trim(),
        fileIds: fileIds.length > 0 ? fileIds : undefined,
      });

      setObservations(getBuyerObservationsByBuyerId(buyer.id));

      setObservationAlert({
        title: t.buyers.details.observationAdded,
        variant: "success",
      });
      setTimeout(() => setObservationAlert(null), 3000);

      setObservationText("");
      setObservationFiles([]);
      setShowObservationForm(false);
    } catch (error) {
      console.error("Error adding observation:", error);
      setObservationAlert({
        title: t.buyers.details.observationError,
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{buyer.name}</h1>
            <StatusBadge
              label={buyer.status === "active" ? t.buyers.table.active : t.buyers.table.inactive}
              variant={buyer.status === "active" ? "success" : "default"}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.buyers.table.code}: {buyer.code}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(getBuyerEditRoute(buyer.id))}
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
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.BUYERS)}
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
        <nav className="flex space-x-8" aria-label="Tabs">
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
            {t.buyers.details.tabs.info}
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
            {t.buyers.details.tabs.observations || "Observações"}
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
            {t.buyers.details.tabs.finance}
          </button>
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
            {t.buyers.details.tabs.activities}
          </button>
        </nav>
      </div>

      {activeTab === "info" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t.buyers.details.buyerInfo}
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.buyers.table.code}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{buyer.code}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.buyers.table.name}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{buyer.name}</p>
                </div>
                {buyer.cpf && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.buyers.table.cpf}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{buyer.cpf}</p>
                  </div>
                )}
                {buyer.cnpj && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.buyers.table.cnpj}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{buyer.cnpj}</p>
                  </div>
                )}
                {buyer.email && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.buyers.table.email}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{buyer.email}</p>
                  </div>
                )}
                {buyer.phone && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {t.buyers.table.phone}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{buyer.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {t.buyers.details.properties}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {buyer.propertyIds && buyer.propertyIds.length > 0 ? (
                      buyer.propertyIds.map((propertyId: string) => {
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
                    {t.buyers.details.createdAt}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                    {formatDate(buyer.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {(buyer.street || buyer.city) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {t.buyers.details.address}
                </h2>
                <div className="space-y-4">
                  {buyer.street && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.profile.company.fields.street}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {buyer.street}
                        {buyer.number ? `, ${buyer.number}` : ""}
                      </p>
                    </div>
                  )}
                  {buyer.complement && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.profile.company.fields.complement}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {buyer.complement}
                      </p>
                    </div>
                  )}
                  {buyer.neighborhood && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.profile.company.fields.neighborhood}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {buyer.neighborhood}
                      </p>
                    </div>
                  )}
                  {(buyer.city || buyer.state) && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.buyers.details.cityState}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {buyer.city || ""}
                        {buyer.city && buyer.state ? ", " : ""}
                        {buyer.state || ""}
                      </p>
                    </div>
                  )}
                  {buyer.zipCode && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t.profile.company.fields.zipCode}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                        {buyer.zipCode}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "activities" && (
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
                  {t.buyers.details.activityCreated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(buyer.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm">✅</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                  {buyer.status === "active"
                    ? t.buyers.details.activityActivated
                    : t.buyers.details.activityDeactivated}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.buyers.details.statusLabel}:{" "}
                  {buyer.status === "active" ? t.buyers.table.active : t.buyers.table.inactive}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "observations" &&
        buyer &&
        (() => {
          const filteredObservations = observations.filter((observation) => {
            if (!searchValue) return true;

            const searchLower = searchValue.toLowerCase();

            if (observation.observation.toLowerCase().includes(searchLower)) return true;

            const dateText = formatDateTime(observation.createdAt);
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
              aValue = a[sortState.column as keyof BuyerObservation] as string | number | undefined;
              bValue = b[sortState.column as keyof BuyerObservation] as string | number | undefined;
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

          const columns: TableColumn<BuyerObservation>[] = [
            {
              key: "date",
              label: t.buyers.details.observationDate || "Data",
              sortable: true,
              render: (_, row) => (
                <span className="text-gray-700 dark:text-gray-300">
                  {formatDateTime(row.createdAt)}
                </span>
              ),
            },
            {
              key: "observation",
              label: t.buyers.details.observation || "Observação",
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
              label: t.buyers.details.files || "Anexos",
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
              label: t.buyers.details.addObservation || "Adicionar Observação",
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
                      {t.buyers.details.newObservation || "Nova Observação"}
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
                        {t.buyers.details.observation || "Observação"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={observationText}
                        onChange={(e) => setObservationText(e.target.value)}
                        disabled={isSubmittingObservation}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 resize-none"
                        placeholder={
                          t.buyers.details.observationPlaceholder ||
                          "Digite sua observação sobre este comprador..."
                        }
                        required
                      />
                    </div>

                    <FileUpload
                      label={t.buyers.details.files || "Anexos"}
                      files={observationFiles}
                      onChange={setObservationFiles}
                      disabled={isSubmittingObservation}
                      multiple={true}
                      helperText={
                        t.buyers.details.filesHelper ||
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
                <Table<BuyerObservation & Record<string, unknown>>
                  columns={columns}
                  data={paginatedObservations as (BuyerObservation & Record<string, unknown>)[]}
                  header={{
                    title: t.buyers.details.tabs.observations || "Observações",
                    badge: {
                      label: `${filteredObservations.length} ${filteredObservations.length !== 1 ? t.buyers.details.tabs.observations : t.buyers.details.observation}`,
                      variant: "primary",
                    },
                    description:
                      t.buyers.details.observationsDescription ||
                      "Gerencie as observações deste comprador",
                    actions: headerActions,
                  }}
                  search={{
                    placeholder: t.buyers.details.searchObservations || "Buscar observações...",
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
                    title: t.buyers.details.noObservations || "Nenhuma observação registrada",
                    description: searchValue
                      ? typeof t.buyers.details.noObservationsWithSearch === "function"
                        ? t.buyers.details.noObservationsWithSearch(searchValue)
                        : t.buyers.details.noObservationsWithSearch ||
                          `Nenhuma observação encontrada para "${searchValue}"`
                      : t.buyers.details.noObservationsDescription ||
                        "Adicione sua primeira observação sobre este comprador.",
                    onClearSearch: searchValue
                      ? () => {
                          setSearchValue("");
                          setCurrentPage(1);
                        }
                      : undefined,
                    clearSearchLabel: searchValue ? t.common.clearSearch : undefined,
                    onAddNew: () => setShowObservationForm(true),
                    addNewLabel: t.buyers.details.addObservation || "Adicionar Observação",
                  }}
                  onRowClick={(row) =>
                    navigate(`${getObservationViewRoute(row.id)}?fromBuyer=${buyer.id}`)
                  }
                />
              )}
            </div>
          );
        })()}

      {activeTab === "finance" &&
        buyer &&
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
                    {t.buyers.details.finance.subTabs.dashboard}
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
                    {t.buyers.details.finance.subTabs.transactions}
                  </button>
                </nav>
              </div>

              {financeSubTab === "dashboard" && <BuyerFinanceDashboard buyerId={buyer.id} />}

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
                    transactionType: "cashFlow" | "receivable";
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
                    serviceProviderId: cf.serviceProviderId,
                  });

                  const normalizeReceivable = (ar: AccountsReceivable): UnifiedTransaction => ({
                    id: ar.id,
                    type: "income",
                    amount: ar.amount,
                    date: ar.dueDate,
                    description: ar.description,
                    category: ar.category,
                    paymentMethod: ar.paymentMethod,
                    referenceNumber: ar.referenceNumber,
                    status: ar.status,
                    transactionType: "receivable",
                    propertyId: ar.propertyId,
                  });

                  const cashFlowTransactions = getCashFlowByBuyerId(buyer.id);
                  const receivableTransactions = getAccountsReceivableByBuyerId(buyer.id);

                  const allTransactions: UnifiedTransaction[] = [
                    ...cashFlowTransactions.map(normalizeCashFlow),
                    ...receivableTransactions.map(normalizeReceivable),
                  ];

                  const formatDate = (dateString: string) => {
                    const date = new Date(dateString);
                    return format(date, "dd/MM/yyyy", { locale: ptBR });
                  };

                  const formatCurrency = (value: number) => {
                    return new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(value);
                  };

                  const handleDeleteFinanceClick = (transaction: UnifiedTransaction) => {
                    let originalTransaction: CashFlow | AccountsReceivable | null = null;
                    let transactionType: "cashFlow" | "receivable" | null = null;

                    if (transaction.transactionType === "cashFlow") {
                      const found = cashFlowTransactions.find((t) => t.id === transaction.id);
                      if (found) {
                        originalTransaction = found;
                        transactionType = "cashFlow";
                      }
                    } else if (transaction.transactionType === "receivable") {
                      const found = receivableTransactions.find((t) => t.id === transaction.id);
                      if (found) {
                        originalTransaction = found;
                        transactionType = "receivable";
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
                    } else if (selectedFinanceTransactionType === "receivable") {
                      success = deleteAccountsReceivable(selectedFinanceTransaction.id);
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
                      const amount = formatCurrency(transaction.amount).toLowerCase();

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
                    if (transactionType === "receivable") {
                      return (
                        t.accountsReceivable.status[
                          status as keyof typeof t.accountsReceivable.status
                        ] || status
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
                          {row.type === "income" ? "+" : "-"} {formatCurrency(row.amount)}
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
                        if (row.type === "expense" && row.supplierId) {
                          const supplier = getSupplierById(row.supplierId);
                          return (
                            <span className="text-gray-700 dark:text-gray-300">
                              {supplier?.name || "-"}
                            </span>
                          );
                        }
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
                            return getAccountsReceivableEditRoute(row.id);
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
                          title: t.buyers.details.finance.title,
                          badge: {
                            label: t.cashFlow.badge.transactions(filteredFinanceData.length),
                            variant: "primary",
                          },
                          description: t.buyers.details.finance.description,
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
                              <span className="text-gray-500 dark:text-gray-400 text-xs">
                                {t.common.total || "Total"}
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
                            navigate(getAccountsReceivableViewRoute(row.id));
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
                          (selectedFinanceTransaction as CashFlow | AccountsReceivable)
                            ?.description || ""
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
    </div>
  );
}
