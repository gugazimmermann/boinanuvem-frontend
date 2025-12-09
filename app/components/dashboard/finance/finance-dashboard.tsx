import { useMemo } from "react";
import { startOfMonth, endOfMonth, parseISO } from "date-fns";
import { formatCurrency } from "~/utils/formatting";
import { calculateMonthlyFinanceData } from "~/utils/finance-monthly-data";
import { useTranslation } from "~/i18n";
import { useTheme } from "~/contexts/theme-context";
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
import type { CashFlow, AccountsPayable, AccountsReceivable } from "~/types";
import { AccountsPayableStatus, AccountsReceivableStatus } from "~/types";

interface FinanceDashboardProps {
  readonly cashFlowData: CashFlow[];
  readonly accountsPayableData?: AccountsPayable[];
  readonly accountsReceivableData?: AccountsReceivable[];
  readonly language: "pt" | "en" | "es";
  readonly gradientId?: string;
}

export function FinanceDashboard({
  cashFlowData,
  accountsPayableData = [],
  accountsReceivableData = [],
  language,
  gradientId = "colorNet",
}: FinanceDashboardProps) {
  const t = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
    // eslint-disable-next-line react-hooks/preserve-manual-memoization -- accountsPayableData is from props and stable
    [accountsPayableData, today]
  );

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
    // eslint-disable-next-line react-hooks/preserve-manual-memoization -- accountsReceivableData is from props and stable
    [accountsReceivableData, today]
  );

  const totalOverduePayable = useMemo(() => {
    return overduePayable.reduce((sum, ap) => {
      const remainingAmount = ap.paidAmount ? ap.amount - ap.paidAmount : ap.amount;
      return sum + remainingAmount;
    }, 0);
  }, [overduePayable]);

  const totalOverdueReceivable = useMemo(() => {
    return overdueReceivable.reduce((sum, ar) => {
      const remainingAmount = ar.paidAmount ? ar.amount - ar.paidAmount : ar.amount;
      return sum + remainingAmount;
    }, 0);
  }, [overdueReceivable]);

  const monthlyData = useMemo(
    () => calculateMonthlyFinanceData(cashFlowData, currentDate),
    [cashFlowData, currentDate]
  );

  const expenseCategoriesData = useMemo(() => {
    const categories: Record<string, number> = {};

    for (const transaction of cashFlowData) {
      if (transaction.type === "expense") {
        const categoryKey = transaction.category;
        const categoryName = t.cashFlow?.categories?.[categoryKey] || categoryKey;

        if (!categories[categoryName]) {
          categories[categoryName] = 0;
        }

        categories[categoryName] += transaction.amount;
      }
    }

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
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.financesDashboard.cards.totalExpenses}
              </p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
                {formatCurrency(totalExpenses, language)}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">📉</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
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
                {formatCurrency(netCashFlow, language)}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">💰</span>
            </div>
          </div>
        </div>

        {accountsPayableData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.financesDashboard.cards.accountsPayable}
                </p>
                <p className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                  {formatCurrency(totalAccountsPayable, language)}
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">📤</span>
              </div>
            </div>
          </div>
        )}

        {accountsReceivableData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.financesDashboard.cards.accountsReceivable}
                </p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {formatCurrency(totalAccountsReceivable, language)}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">📥</span>
              </div>
            </div>
          </div>
        )}

        {(totalOverduePayable > 0 || totalOverdueReceivable > 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.financesDashboard.cards.overdue}
                </p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {formatCurrency(totalOverduePayable + totalOverdueReceivable, language)}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">⚠️</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {t.financesDashboard.charts.incomeVsExpenses}
            </h2>
          </div>
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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-green-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {t.financesDashboard.charts.monthlyCashFlow}
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
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
                fill={`url(#${gradientId})`}
                name={t.financesDashboard.charts.netCashFlow}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {expenseCategoriesData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-1 w-12 bg-orange-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {t.financesDashboard.charts.expenseCategories}
              </h2>
            </div>
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
