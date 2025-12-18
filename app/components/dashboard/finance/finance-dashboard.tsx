import { useMemo, useCallback } from "react";
import { startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO, format } from "date-fns";
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
  readonly selectedYear?: string; // "all" or "YYYY"
  readonly selectedMonth?: string; // "all" or "1".."12"
}

export function FinanceDashboard({
  cashFlowData,
  accountsPayableData = [],
  accountsReceivableData = [],
  language,
  gradientId = "colorNet",
  selectedYear = "all",
  selectedMonth = "all",
}: FinanceDashboardProps) {
  const t = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const now = useMemo(() => new Date(), []);
  const _referenceDate = useMemo(() => {
    if (selectedYear === "all") {
      return now;
    }
    const y = Number(selectedYear);
    const m = selectedMonth === "all" ? 1 : Math.max(1, Math.min(12, Number(selectedMonth)));
    return new Date(y, m - 1, 1);
  }, [now, selectedYear, selectedMonth]);

  const period = useMemo(() => {
    if (selectedYear === "all" && selectedMonth === "all") {
      // Show all data when both are "all"
      return { start: null as Date | null, end: null as Date | null };
    }
    if (selectedYear !== "all" && selectedMonth !== "all") {
      const y = Number(selectedYear);
      const m = Math.max(1, Math.min(12, Number(selectedMonth)));
      const d = new Date(y, m - 1, 1);
      return { start: startOfMonth(d), end: endOfMonth(d) };
    }
    if (selectedYear !== "all" && selectedMonth === "all") {
      const y = Number(selectedYear);
      const d = new Date(y, 0, 1);
      return { start: startOfYear(d), end: endOfYear(d) };
    }
    // Year=all + Month=specific -> that month across all years (no single contiguous range)
    return { start: null as Date | null, end: null as Date | null };
  }, [selectedYear, selectedMonth]);

  const parseTransactionDate = useCallback((value: string): Date => {
    // Be tolerant: backend/services may return ISO, YYYY-MM-DD, or other Date-compatible strings.
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
    // Fallback to strict ISO parsing
    return parseISO(value);
  }, []);

  const currentMonthCashFlow = cashFlowData.filter((transaction) => {
    const transactionDate = parseTransactionDate(transaction.date);
    if (period.start && period.end) {
      return transactionDate >= period.start && transactionDate <= period.end;
    }
    if (selectedYear === "all" && selectedMonth !== "all") {
      const m = Math.max(1, Math.min(12, Number(selectedMonth)));
      return transactionDate.getMonth() + 1 === m;
    }
    return true;
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

  // Helper function to build month key
  const buildMonthKey = useCallback((date: Date): string => {
    return format(date, "yyyy-MM");
  }, []);

  // Helper function to find date range from transactions
  const findDateRange = useCallback(
    (transactions: CashFlow[]): { min: Date | null; max: Date | null } => {
      let minDate: Date | null = null;
      let maxDate: Date | null = null;

      for (const transaction of transactions) {
        const transactionDate = parseTransactionDate(transaction.date);
        if (Number.isNaN(transactionDate.getTime())) continue;

        if (!minDate || transactionDate < minDate) {
          minDate = transactionDate;
        }
        if (!maxDate || transactionDate > maxDate) {
          maxDate = transactionDate;
        }
      }

      return { min: minDate, max: maxDate };
    },
    [parseTransactionDate]
  );

  // Helper function to aggregate transactions by month
  const aggregateTransactionByMonth = useCallback(
    (
      transactions: CashFlow[],
      months: Record<
        string,
        {
          month: string;
          year: number;
          monthNum: number;
          income: number;
          expenses: number;
          net: number;
        }
      >,
      monthNames: string[]
    ): void => {
      for (const transaction of transactions) {
        const transactionDate = parseTransactionDate(transaction.date);
        if (Number.isNaN(transactionDate.getTime())) continue;

        const monthKey = buildMonthKey(transactionDate);
        const year = transactionDate.getFullYear();
        const monthNum = transactionDate.getMonth();

        if (!months[monthKey]) {
          months[monthKey] = {
            month: `${monthNames[monthNum]} ${year}`,
            year,
            monthNum,
            income: 0,
            expenses: 0,
            net: 0,
          };
        }

        if (transaction.type === "income") {
          months[monthKey].income += transaction.amount;
        } else {
          months[monthKey].expenses += transaction.amount;
        }
      }
    },
    [parseTransactionDate, buildMonthKey]
  );

  // Helper function to fill missing months in date range
  const fillMissingMonths = useCallback(
    (
      months: Record<
        string,
        {
          month: string;
          year: number;
          monthNum: number;
          income: number;
          expenses: number;
          net: number;
        }
      >,
      minDate: Date,
      maxDate: Date,
      monthNames: string[]
    ): void => {
      const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

      while (current <= end) {
        const monthKey = buildMonthKey(current);
        const year = current.getFullYear();
        const monthNum = current.getMonth();

        if (!months[monthKey]) {
          months[monthKey] = {
            month: `${monthNames[monthNum]} ${year}`,
            year,
            monthNum,
            income: 0,
            expenses: 0,
            net: 0,
          };
        }

        current.setMonth(current.getMonth() + 1);
      }
    },
    [buildMonthKey]
  );

  // Helper function to calculate all months data
  const calculateAllMonthsData = useCallback((): Array<{
    month: string;
    income: number;
    expenses: number;
    net: number;
  }> => {
    const months: Record<
      string,
      {
        month: string;
        year: number;
        monthNum: number;
        income: number;
        expenses: number;
        net: number;
      }
    > = {};

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

    aggregateTransactionByMonth(cashFlowData, months, monthNames);

    const { min: minDate, max: maxDate } = findDateRange(cashFlowData);
    if (minDate && maxDate) {
      fillMissingMonths(months, minDate, maxDate, monthNames);
    }

    return Object.values(months)
      .map((m) => ({
        month: m.month,
        income: m.income,
        expenses: m.expenses,
        net: m.income - m.expenses,
        sortKey: m.year * 12 + m.monthNum,
      }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .map(({ month, income, expenses, net }) => ({ month, income, expenses, net }));
  }, [cashFlowData, aggregateTransactionByMonth, findDateRange, fillMissingMonths]);

  // Helper function to filter transactions by period
  const filterTransactionsByPeriod = useCallback((): CashFlow[] => {
    return cashFlowData.filter((transaction) => {
      const transactionDate = parseTransactionDate(transaction.date);
      if (period.start && period.end) {
        return transactionDate >= period.start && transactionDate <= period.end;
      }
      if (selectedYear === "all" && selectedMonth !== "all") {
        const m = Math.max(1, Math.min(12, Number(selectedMonth)));
        return transactionDate.getMonth() + 1 === m;
      }
      return true;
    });
  }, [cashFlowData, period, selectedYear, selectedMonth, parseTransactionDate]);

  // Helper function to calculate chart base date
  const calculateChartBase = useCallback((): Date => {
    if (selectedYear === "all") {
      return now;
    }
    const y = Number(selectedYear);
    if (selectedMonth === "all") {
      return new Date(y, 11, 1);
    }
    const m = Math.max(1, Math.min(12, Number(selectedMonth)));
    return new Date(y, m - 1, 1);
  }, [selectedYear, selectedMonth, now]);

  const monthlyData = useMemo(() => {
    // Charts should follow the chosen period:
    // - When both year and month are "all", show all months with data
    // - When a year is selected (and month=all), show Jan..Dec of that year.
    // - When year+month are selected, show last 12 months ending at that month.
    // - Otherwise, keep default behavior (last 12 months up to now).

    if (selectedYear === "all" && selectedMonth === "all") {
      return calculateAllMonthsData();
    }

    const filteredData = filterTransactionsByPeriod();
    const chartBase = calculateChartBase();
    return calculateMonthlyFinanceData(filteredData, chartBase);
  }, [
    selectedYear,
    selectedMonth,
    calculateAllMonthsData,
    filterTransactionsByPeriod,
    calculateChartBase,
  ]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization -- currentMonthCashFlow is derived from filtered data
  const expenseCategoriesData = useMemo(() => {
    const categories: Record<string, number> = {};

    // Categories should respect the selected period (same as cards).
    for (const transaction of currentMonthCashFlow) {
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
    // eslint-disable-next-line react-hooks/preserve-manual-memoization -- t.cashFlow?.categories is stable from translation context
  }, [currentMonthCashFlow, t.cashFlow?.categories]);

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
