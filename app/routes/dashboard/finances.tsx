import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from "date-fns";
import { formatCurrency, formatDate } from "~/utils/formatting";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "~/i18n";
import { useTheme } from "~/contexts/theme-context";
import {
  StatCard,
  ChartWrapper,
  getTooltipStyle,
  getChartColors,
  getPieChartColors,
} from "~/components/dashboard";
import { mockCompanies } from "~/mocks/companies";
import { getCashFlowByCompanyId } from "~/services/cash-flow.service";
import { getAccountsPayableByCompanyId } from "~/services/accounts-payable.service";
import { getAccountsReceivableByCompanyId } from "~/services/accounts-receivable.service";
import { getSupplierById } from "~/services/suppliers.service";
import { getBuyerById } from "~/services/buyers.service";
import { getSalesByCompanyId } from "~/services/sales.service";
import { getSalesMetrics } from "~/services/sales-analytics.service";
import type { AccountsPayable, AccountsReceivable } from "~/types";
import { AccountsPayableStatus, AccountsReceivableStatus } from "~/types";

export function meta() {
  return [
    { title: "Dashboard Financeiro - Boi na Nuvem" },
    {
      name: "description",
      content: "Visão geral financeira do Boi na Nuvem",
    },
  ];
}

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

export default function FinancesDashboard() {
  const t = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const company = useMemo(() => mockCompanies[0], []);
  const companyId = useMemo(() => company?.id || "", [company]);

  const cashFlowData = useMemo(() => getCashFlowByCompanyId(companyId), [companyId]);
  const accountsPayableData = useMemo(() => getAccountsPayableByCompanyId(companyId), [companyId]);
  const accountsReceivableData = useMemo(
    () => getAccountsReceivableByCompanyId(companyId),
    [companyId]
  );
  const salesData = useMemo(() => getSalesByCompanyId(companyId), [companyId]);
  const salesMetrics = useMemo(() => getSalesMetrics(companyId), [companyId]);

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

  const totalOverduePayable = useMemo(() => {
    const overdue = accountsPayableData.filter((ap) => {
      const dueDate = parseISO(ap.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return (
        (ap.status === AccountsPayableStatus.UNPAID ||
          ap.status === AccountsPayableStatus.OVERDUE) &&
        dueDate < today
      );
    });
    return overdue.reduce((sum, ap) => {
      const remainingAmount = ap.paidAmount ? ap.amount - ap.paidAmount : ap.amount;
      return sum + remainingAmount;
    }, 0);
  }, [accountsPayableData, today]);

  const totalOverdueReceivable = useMemo(() => {
    const overdue = accountsReceivableData.filter((ar) => {
      const dueDate = parseISO(ar.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return (
        (ar.status === AccountsReceivableStatus.UNPAID ||
          ar.status === AccountsReceivableStatus.OVERDUE) &&
        dueDate < today
      );
    });
    return overdue.reduce((sum, ar) => {
      const remainingAmount = ar.paidAmount ? ar.amount - ar.paidAmount : ar.amount;
      return sum + remainingAmount;
    }, 0);
  }, [accountsReceivableData, today]);

  const totalOverdue = totalOverduePayable + totalOverdueReceivable;

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

  const categoryData = useMemo(() => {
    const categories: Record<string, { name: string; income: number; expenses: number }> = {};

    cashFlowData.forEach((transaction) => {
      const categoryKey = transaction.category;
      if (!categories[categoryKey]) {
        categories[categoryKey] = {
          name: t.cashFlow.categories[categoryKey] || categoryKey,
          income: 0,
          expenses: 0,
        };
      }

      if (transaction.type === "income") {
        categories[categoryKey].income += transaction.amount;
      } else {
        categories[categoryKey].expenses += transaction.amount;
      }
    });

    return Object.values(categories)
      .map((cat) => ({
        name: cat.name,
        income: cat.income,
        expenses: cat.expenses,
        total: cat.income + cat.expenses,
      }))
      .filter((cat) => cat.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [cashFlowData, t]);

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

  const statusData = useMemo(() => {
    const statusCounts: Record<string, number> = {
      paid: 0,
      unpaid: 0,
      overdue: 0,
      partial: 0,
    };

    accountsPayableData.forEach((ap) => {
      if (ap.status === AccountsPayableStatus.PAID) {
        statusCounts.paid += 1;
      } else if (ap.status === AccountsPayableStatus.OVERDUE) {
        statusCounts.overdue += 1;
      } else if (ap.status === AccountsPayableStatus.PARTIAL) {
        statusCounts.partial += 1;
      } else {
        statusCounts.unpaid += 1;
      }
    });

    accountsReceivableData.forEach((ar) => {
      if (ar.status === AccountsReceivableStatus.PAID) {
        statusCounts.paid += 1;
      } else if (ar.status === AccountsReceivableStatus.OVERDUE) {
        statusCounts.overdue += 1;
      } else if (ar.status === AccountsReceivableStatus.PARTIAL) {
        statusCounts.partial += 1;
      } else {
        statusCounts.unpaid += 1;
      }
    });

    return [
      { name: t.financesDashboard.status.paid, value: statusCounts.paid },
      { name: t.financesDashboard.status.unpaid, value: statusCounts.unpaid },
      { name: t.financesDashboard.status.overdue, value: statusCounts.overdue },
      { name: t.financesDashboard.status.partial, value: statusCounts.partial },
    ].filter((item) => item.value > 0);
  }, [accountsPayableData, accountsReceivableData, t]);

  const recentTransactions = useMemo(() => {
    return [...cashFlowData]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [cashFlowData]);

  const upcomingPayments = useMemo(() => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return accountsPayableData
      .filter((ap) => {
        const dueDate = parseISO(ap.dueDate);
        return (
          (ap.status === AccountsPayableStatus.UNPAID ||
            ap.status === AccountsPayableStatus.PARTIAL) &&
          dueDate >= today &&
          dueDate <= thirtyDaysFromNow
        );
      })
      .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime())
      .slice(0, 10);
  }, [accountsPayableData, today]);

  const upcomingReceivables = useMemo(() => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return accountsReceivableData
      .filter((ar) => {
        const dueDate = parseISO(ar.dueDate);
        return (
          (ar.status === AccountsReceivableStatus.UNPAID ||
            ar.status === AccountsReceivableStatus.PARTIAL) &&
          dueDate >= today &&
          dueDate <= thirtyDaysFromNow
        );
      })
      .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime())
      .slice(0, 10);
  }, [accountsReceivableData, today]);

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

  const overdueItems = useMemo(() => {
    const allOverdue: Array<{
      type: "payable" | "receivable";
      item: AccountsPayable | AccountsReceivable;
    }> = [];

    overduePayable.forEach((ap) => {
      allOverdue.push({ type: "payable", item: ap });
    });

    overdueReceivable.forEach((ar) => {
      allOverdue.push({ type: "receivable", item: ar });
    });

    return allOverdue.sort((a, b) => {
      const dateA = parseISO(a.item.dueDate);
      const dateB = parseISO(b.item.dueDate);
      return dateA.getTime() - dateB.getTime();
    });
  }, [overduePayable, overdueReceivable]);

  const chartColors = getChartColors(isDark);
  const pieColors = getPieChartColors(chartColors);
  const tooltipStyle = getTooltipStyle(isDark);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {t.financesDashboard.title}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          title={t.financesDashboard.cards.totalIncome}
          value={formatCurrency(totalIncome, "pt")}
          valueColor="green"
          icon={<span className="text-lg">📈</span>}
        />

        <StatCard
          title={t.financesDashboard.cards.totalExpenses}
          value={formatCurrency(totalExpenses)}
          valueColor="red"
          icon={<span className="text-lg">📉</span>}
        />

        <StatCard
          title={t.financesDashboard.cards.netCashFlow}
          value={formatCurrency(netCashFlow)}
          valueColor={netCashFlow >= 0 ? "green" : "red"}
          icon={<span className="text-lg">💰</span>}
        />

        <StatCard
          title={t.financesDashboard.cards.accountsPayable}
          value={formatCurrency(totalAccountsPayable)}
          valueColor="orange"
          icon={<span className="text-lg">📤</span>}
        />

        <StatCard
          title={t.financesDashboard.cards.accountsReceivable}
          value={formatCurrency(totalAccountsReceivable)}
          valueColor="blue"
          icon={<span className="text-lg">📥</span>}
        />

        <StatCard
          title={t.financesDashboard.cards.overdue}
          value={formatCurrency(totalOverdue)}
          valueColor="red"
          icon={<span className="text-lg">⚠️</span>}
        />
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t.financesDashboard.salesAnalytics.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.financesDashboard.salesAnalytics.totalSales}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {salesMetrics.totalSales}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {salesMetrics.totalAnimalsSold} {t.financesDashboard.salesAnalytics.animalsSold}
                </p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">💵</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.financesDashboard.salesAnalytics.totalRevenue}
                </p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {formatCurrency(salesMetrics.totalRevenue)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t.financesDashboard.salesAnalytics.averagePricePerHead}:{" "}
                  {formatCurrency(salesMetrics.averagePricePerHead)}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.financesDashboard.salesAnalytics.averagePricePerKg}
                </p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {formatCurrency(salesMetrics.averagePricePerKg)}
                </p>
                {salesMetrics.averageCarcassValue && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t.financesDashboard.salesAnalytics.averageCarcassValue}:{" "}
                    {salesMetrics.averageCarcassValue.toFixed(1)} kg
                  </p>
                )}
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">⚖️</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.financesDashboard.salesAnalytics.profitability}
                </p>
                <p
                  className={`text-xl font-bold mt-1 ${
                    salesMetrics.profitability.totalProfit >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(salesMetrics.profitability.totalProfit)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {salesMetrics.profitability.averageProfitMargin.toFixed(2)}%{" "}
                  {t.financesDashboard.salesAnalytics.profitMargin}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t.financesDashboard.salesAnalytics.salesByType}
            </h3>
            {(() => {
              const salesByType = salesData.reduce(
                (acc, sale) => {
                  if (!acc[sale.saleType]) {
                    acc[sale.saleType] = { count: 0, revenue: 0 };
                  }
                  acc[sale.saleType].count += 1;
                  acc[sale.saleType].revenue +=
                    sale.totalPrice + (sale.transportationFee || 0) + (sale.additionalFees || 0);
                  return acc;
                },
                {} as Record<string, { count: number; revenue: number }>
              );

              const chartData = Object.entries(salesByType).map(([type, data]) => ({
                name: t.sales.saleTypes[type as keyof typeof t.sales.saleTypes] || type,
                count: data.count,
                revenue: data.revenue,
              }));

              return chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fill: chartColors.text, fontSize: 12 }} />
                    <YAxis
                      tick={{ fill: chartColors.text, fontSize: 12 }}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                      {...tooltipStyle}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", color: chartColors.text }} />
                    <Bar
                      dataKey="revenue"
                      fill={chartColors.income}
                      name={t.financesDashboard.salesAnalytics.revenue}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  {t.financesDashboard.tables.noData}
                </p>
              );
            })()}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t.financesDashboard.salesAnalytics.profitabilityBreakdown}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.financesDashboard.salesAnalytics.totalCost}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {formatCurrency(salesMetrics.profitability.totalCost)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.financesDashboard.salesAnalytics.totalSalePrice}
                </p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">
                  {formatCurrency(salesMetrics.profitability.totalSalePrice)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.financesDashboard.salesAnalytics.averageRoi}
                </p>
                <p
                  className={`text-lg font-bold mt-1 ${
                    salesMetrics.profitability.averageRoi >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {salesMetrics.profitability.averageRoi.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.financesDashboard.salesAnalytics.averageCostPerKg}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {formatCurrency(salesMetrics.profitability.averageCostPerKg)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartWrapper
          title={t.financesDashboard.charts.incomeVsExpenses}
          isEmpty={monthlyData.length === 0}
          emptyMessage={t.financesDashboard.tables.noData}
        >
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
            <XAxis dataKey="month" tick={{ fill: chartColors.text, fontSize: 12 }} />
            <YAxis
              tick={{ fill: chartColors.text, fontSize: 12 }}
              tickFormatter={(value) => t.common.currency.formatShort(value)}
            />
            <Tooltip {...tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
            <Legend wrapperStyle={{ fontSize: "12px", color: chartColors.text }} />
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
        </ChartWrapper>

        <ChartWrapper
          title={t.financesDashboard.charts.monthlyCashFlow}
          isEmpty={monthlyData.length === 0}
          emptyMessage={t.financesDashboard.tables.noData}
        >
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors.net} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartColors.net} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
            <XAxis dataKey="month" tick={{ fill: chartColors.text, fontSize: 12 }} />
            <YAxis
              tick={{ fill: chartColors.text, fontSize: 12 }}
              tickFormatter={(value) => t.common.currency.formatShort(value)}
            />
            <Tooltip {...tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
            <Legend wrapperStyle={{ fontSize: "12px", color: chartColors.text }} />
            <Area
              type="monotone"
              dataKey="net"
              stroke={chartColors.net}
              fillOpacity={1}
              fill="url(#colorNet)"
              name={t.financesDashboard.charts.netCashFlow}
            />
          </AreaChart>
        </ChartWrapper>

        <ChartWrapper
          title={t.financesDashboard.charts.cashFlowByCategory}
          isEmpty={categoryData.length === 0}
          emptyMessage={t.financesDashboard.tables.noData}
        >
          <BarChart data={categoryData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
            <XAxis
              type="number"
              tick={{ fill: chartColors.text, fontSize: 12 }}
              tickFormatter={(value) => t.common.currency.formatShort(value)}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: chartColors.text, fontSize: 11 }}
              width={120}
            />
            <Tooltip {...tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
            <Legend wrapperStyle={{ fontSize: "12px", color: chartColors.text }} />
            <Bar
              dataKey="income"
              fill={chartColors.income}
              name={t.financesDashboard.charts.income}
            />
            <Bar
              dataKey="expenses"
              fill={chartColors.expense}
              name={t.financesDashboard.charts.expenses}
            />
          </BarChart>
        </ChartWrapper>

        <ChartWrapper
          title={t.financesDashboard.charts.paymentStatus}
          isEmpty={statusData.length === 0}
          emptyMessage={t.financesDashboard.tables.noData}
        >
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip {...tooltipStyle} />
          </PieChart>
        </ChartWrapper>

        <ChartWrapper
          title={t.financesDashboard.charts.expenseCategories}
          isEmpty={expenseCategoriesData.length === 0}
          emptyMessage={t.financesDashboard.tables.noData}
          height={400}
        >
          <BarChart data={expenseCategoriesData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
            <XAxis
              type="number"
              tick={{ fill: chartColors.text, fontSize: 12 }}
              tickFormatter={(value) => t.common.currency.formatShort(value)}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: chartColors.text, fontSize: 11 }}
              width={150}
            />
            <Tooltip {...tooltipStyle} formatter={(value: number) => formatCurrency(value)} />
            <Legend wrapperStyle={{ fontSize: "12px", color: chartColors.text }} />
            <Bar
              dataKey="value"
              fill={chartColors.expense}
              name={t.financesDashboard.charts.expenses}
            />
          </BarChart>
        </ChartWrapper>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t.financesDashboard.tables.recentTransactions}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.financesDashboard.tables.date}
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.financesDashboard.tables.description}
                  </th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.financesDashboard.tables.amount}
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">
                        {transaction.description}
                      </td>
                      <td
                        className={`py-2 px-3 text-sm font-medium text-right ${
                          transaction.type === "income"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}{" "}
                        {formatCurrency(transaction.amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      {t.financesDashboard.tables.noData}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t.financesDashboard.tables.upcomingPayments}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.financesDashboard.tables.dueDate}
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.financesDashboard.tables.description}
                  </th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.financesDashboard.tables.amount}
                  </th>
                </tr>
              </thead>
              <tbody>
                {upcomingPayments.length > 0 ? (
                  upcomingPayments.map((payment) => {
                    const supplier = payment.supplierId
                      ? getSupplierById(payment.supplierId)
                      : null;
                    return (
                      <tr
                        key={payment.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">
                          {formatDate(payment.dueDate)}
                        </td>
                        <td className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">
                          {payment.description}
                          {supplier && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              ({supplier.name})
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-sm font-medium text-right text-orange-600 dark:text-orange-400">
                          {formatCurrency(
                            payment.paidAmount
                              ? payment.amount - payment.paidAmount
                              : payment.amount
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      {t.financesDashboard.tables.noData}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t.financesDashboard.tables.upcomingReceivables}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.financesDashboard.tables.dueDate}
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.financesDashboard.tables.description}
                  </th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.financesDashboard.tables.amount}
                  </th>
                </tr>
              </thead>
              <tbody>
                {upcomingReceivables.length > 0 ? (
                  upcomingReceivables.map((receivable) => {
                    const buyer = receivable.buyerId ? getBuyerById(receivable.buyerId) : null;
                    return (
                      <tr
                        key={receivable.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">
                          {formatDate(receivable.dueDate)}
                        </td>
                        <td className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">
                          {receivable.description}
                          {buyer && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              ({buyer.name})
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-sm font-medium text-right text-blue-600 dark:text-blue-400">
                          {formatCurrency(
                            receivable.paidAmount
                              ? receivable.amount - receivable.paidAmount
                              : receivable.amount
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      {t.financesDashboard.tables.noData}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t.financesDashboard.tables.overdue}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.financesDashboard.tables.type}
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.financesDashboard.tables.dueDate}
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.financesDashboard.tables.description}
                  </th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t.financesDashboard.tables.amount}
                  </th>
                </tr>
              </thead>
              <tbody>
                {overdueItems.length > 0 ? (
                  overdueItems.map((item) => {
                    const isPayable = item.type === "payable";
                    const supplier =
                      isPayable && (item.item as AccountsPayable).supplierId
                        ? getSupplierById((item.item as AccountsPayable).supplierId!)
                        : null;
                    const buyer =
                      !isPayable && (item.item as AccountsReceivable).buyerId
                        ? getBuyerById((item.item as AccountsReceivable).buyerId!)
                        : null;
                    const remainingAmount = item.item.paidAmount
                      ? item.item.amount - item.item.paidAmount
                      : item.item.amount;

                    return (
                      <tr
                        key={`${item.type}-${item.item.id}`}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-2 px-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              isPayable
                                ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            }`}
                          >
                            {isPayable
                              ? t.financesDashboard.tables.payable
                              : t.financesDashboard.tables.receivable}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-sm text-red-600 dark:text-red-400 font-medium">
                          {formatDate(item.item.dueDate)}
                        </td>
                        <td className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">
                          {item.item.description}
                          {supplier && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              ({supplier.name})
                            </span>
                          )}
                          {buyer && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              ({buyer.name})
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-sm font-medium text-right text-red-600 dark:text-red-400">
                          {formatCurrency(remainingAmount)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      {t.financesDashboard.tables.noOverdue}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
