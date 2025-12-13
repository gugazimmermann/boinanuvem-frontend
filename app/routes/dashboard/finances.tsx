import { useMemo, useState, useEffect } from "react";
import { parseISO } from "date-fns";
import { formatCurrency, formatDate } from "~/utils/formatting";
import { calculateMonthlyFinanceData } from "~/utils/finance-monthly-data";
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
import { useLanguage } from "~/contexts/language-context";
import {
  StatCard,
  ChartWrapper,
  getTooltipStyle,
  getChartColors,
  getPieChartColors,
} from "~/components/dashboard";
import { getCashFlowByCompanyId } from "~/services/cash-flow.service";
import { useAuth } from "~/contexts/auth-context";
import { getAccountsPayableByCompanyId } from "~/services/accounts-payable.service";
import { getAccountsReceivableByCompanyId } from "~/services/accounts-receivable.service";
import { getSuppliers } from "~/services/suppliers.service";
import { getBuyers } from "~/services/buyers.service";
import type { Supplier, Buyer, AccountsPayable, AccountsReceivable, CashFlow } from "~/types";
import { AccountsPayableStatus, AccountsReceivableStatus } from "~/types";
import { getSalesByCompanyId } from "~/services/sales.service";
import { getSalesMetrics } from "~/services/sales-analytics.service";
import { useFinanceCalculations } from "~/hooks/use-finance-calculations";
import { calculateRemainingAmount } from "~/utils/finance";

export function meta() {
  return [
    { title: "Dashboard Financeiro - Boi na Nuvem" },
    {
      name: "description",
      content: "Visão geral financeira do Boi na Nuvem",
    },
  ];
}

export default function FinancesDashboard() {
  const t = useTranslation();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { currentUser } = useAuth();
  const companyId = currentUser?.companyId || "";
  const [suppliers, setSuppliers] = useState<Map<string, Supplier>>(new Map());
  const [buyers, setBuyers] = useState<Map<string, Buyer>>(new Map());

  useEffect(() => {
    const loadEntities = async () => {
      try {
        const [suppliersData, buyersData] = await Promise.all([getSuppliers(), getBuyers()]);
        setSuppliers(new Map(suppliersData.map((s) => [s.id, s])));
        setBuyers(new Map(buyersData.map((b) => [b.id, b])));
      } catch (error) {
        console.error("Failed to load entities:", error);
      }
    };
    loadEntities();
  }, []);

  const getSupplierName = (id: string) => suppliers.get(id)?.name;
  const getBuyerName = (id: string) => buyers.get(id)?.name;

  const [cashFlowData, setCashFlowData] = useState<CashFlow[]>([]);
  const [accountsPayableData, setAccountsPayableData] = useState<AccountsPayable[]>([]);
  const [accountsReceivableData, setAccountsReceivableData] = useState<AccountsReceivable[]>([]);

  useEffect(() => {
    const loadFinanceData = async () => {
      if (!companyId) return;
      try {
        const [cashFlow, payables, receivables] = await Promise.all([
          getCashFlowByCompanyId(companyId),
          getAccountsPayableByCompanyId(companyId),
          getAccountsReceivableByCompanyId(companyId),
        ]);
        setCashFlowData(cashFlow);
        setAccountsPayableData(payables);
        setAccountsReceivableData(receivables);
      } catch (error) {
        console.error("Failed to load finance data:", error);
        setCashFlowData([]);
        setAccountsPayableData([]);
        setAccountsReceivableData([]);
      }
    };
    loadFinanceData();
  }, [companyId]);
  const [salesData, setSalesData] = useState<Awaited<ReturnType<typeof getSalesByCompanyId>>>([]);

  useEffect(() => {
    const loadSales = async () => {
      try {
        const sales = await getSalesByCompanyId(companyId);
        setSalesData(sales);
      } catch (error) {
        console.error("Failed to load sales:", error);
        setSalesData([]);
      }
    };
    if (companyId) {
      loadSales();
    }
  }, [companyId]);
  const [salesMetrics, setSalesMetrics] = useState<Awaited<
    ReturnType<typeof getSalesMetrics>
  > | null>(null);

  useEffect(() => {
    const loadSalesMetrics = async () => {
      try {
        const metrics = await getSalesMetrics(companyId);
        setSalesMetrics(metrics);
      } catch (error) {
        console.error("Failed to load sales metrics:", error);
        setSalesMetrics(null);
      }
    };
    loadSalesMetrics();
  }, [companyId]);

  const currentDate = useMemo(() => new Date(), []);

  const {
    totalIncome,
    totalExpenses,
    netCashFlow,
    totalAccountsPayable,
    totalAccountsReceivable,
    totalOverdue,
    overduePayable,
    overdueReceivable,
    upcomingPayments,
    upcomingReceivables,
  } = useFinanceCalculations(cashFlowData, accountsPayableData, accountsReceivableData);

  const monthlyData = useMemo(
    () => calculateMonthlyFinanceData(cashFlowData, currentDate),
    [cashFlowData, currentDate]
  );

  const categoryData = useMemo(() => {
    const categories: Record<string, { name: string; income: number; expenses: number }> = {};

    for (const transaction of cashFlowData) {
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
    }

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

    for (const transaction of cashFlowData) {
      if (transaction.type === "expense") {
        const categoryKey = transaction.category;
        const categoryName = t.cashFlow.categories[categoryKey] || categoryKey;

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

  const statusData = useMemo(() => {
    const statusCounts: Record<string, number> = {
      paid: 0,
      unpaid: 0,
      overdue: 0,
      partial: 0,
    };

    for (const ap of accountsPayableData) {
      if (ap.status === AccountsPayableStatus.PAID) {
        statusCounts.paid += 1;
      } else if (ap.status === AccountsPayableStatus.OVERDUE) {
        statusCounts.overdue += 1;
      } else if (ap.status === AccountsPayableStatus.PARTIAL) {
        statusCounts.partial += 1;
      } else {
        statusCounts.unpaid += 1;
      }
    }

    for (const ar of accountsReceivableData) {
      if (ar.status === AccountsReceivableStatus.PAID) {
        statusCounts.paid += 1;
      } else if (ar.status === AccountsReceivableStatus.OVERDUE) {
        statusCounts.overdue += 1;
      } else if (ar.status === AccountsReceivableStatus.PARTIAL) {
        statusCounts.partial += 1;
      } else {
        statusCounts.unpaid += 1;
      }
    }

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

  const overdueItems = useMemo(() => {
    const allOverdue: Array<{
      type: "payable" | "receivable";
      item: AccountsPayable | AccountsReceivable;
    }> = [];

    for (const ap of overduePayable) {
      allOverdue.push({ type: "payable", item: ap });
    }

    for (const ar of overdueReceivable) {
      allOverdue.push({ type: "receivable", item: ar });
    }

    return allOverdue.sort((a, b) => {
      const dateA = parseISO(a.item.dueDate);
      const dateB = parseISO(b.item.dueDate);
      return dateA.getTime() - dateB.getTime();
    });
  }, [overduePayable, overdueReceivable]);

  const sortedUpcomingPayments = useMemo(
    () =>
      [...upcomingPayments]
        .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime())
        .slice(0, 10),
    [upcomingPayments]
  );

  const sortedUpcomingReceivables = useMemo(
    () =>
      [...upcomingReceivables]
        .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime())
        .slice(0, 10),
    [upcomingReceivables]
  );

  const chartColors = getChartColors(isDark);
  const pieColors = getPieChartColors(chartColors);
  const tooltipStyle = getTooltipStyle(isDark);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {t.financesDashboard.title}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          title={t.financesDashboard.cards.totalIncome}
          value={formatCurrency(totalIncome, "pt")}
          valueColor="green"
          icon={<span className="text-lg">📈</span>}
        />

        <StatCard
          title={t.financesDashboard.cards.totalExpenses}
          value={formatCurrency(totalExpenses, language)}
          valueColor="red"
          icon={<span className="text-lg">📉</span>}
        />

        <StatCard
          title={t.financesDashboard.cards.netCashFlow}
          value={formatCurrency(netCashFlow, language)}
          valueColor={netCashFlow >= 0 ? "green" : "red"}
          icon={<span className="text-lg">💰</span>}
        />

        <StatCard
          title={t.financesDashboard.cards.accountsPayable}
          value={formatCurrency(totalAccountsPayable, language)}
          valueColor="orange"
          icon={<span className="text-lg">📤</span>}
        />

        <StatCard
          title={t.financesDashboard.cards.accountsReceivable}
          value={formatCurrency(totalAccountsReceivable, language)}
          valueColor="blue"
          icon={<span className="text-lg">📥</span>}
        />

        <StatCard
          title={t.financesDashboard.cards.overdue}
          value={formatCurrency(totalOverdue, language)}
          valueColor="red"
          icon={<span className="text-lg">⚠️</span>}
        />
      </div>

      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-green-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t.financesDashboard.salesAnalytics.title}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.financesDashboard.salesAnalytics.totalSales}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {salesMetrics?.totalSales ?? 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {salesMetrics?.totalAnimalsSold ?? 0}{" "}
                  {t.financesDashboard.salesAnalytics.animalsSold}
                </p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">💵</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.financesDashboard.salesAnalytics.totalRevenue}
                </p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {formatCurrency(salesMetrics?.totalRevenue ?? 0, language)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t.financesDashboard.salesAnalytics.averagePricePerHead}:{" "}
                  {formatCurrency(salesMetrics?.averagePricePerHead ?? 0, language)}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <span className="text-lg">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.financesDashboard.salesAnalytics.averagePricePerKg}
                </p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {formatCurrency(salesMetrics?.averagePricePerKg ?? 0, language)}
                </p>
                {salesMetrics?.averageCarcassValue && (
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

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.financesDashboard.salesAnalytics.profitability}
                </p>
                <p
                  className={`text-xl font-bold mt-1 ${
                    (salesMetrics?.profitability.totalProfit ?? 0) >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(salesMetrics?.profitability.totalProfit ?? 0, language)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {(salesMetrics?.profitability.averageProfitMargin ?? 0).toFixed(2)}%{" "}
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
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
                      formatter={(value: number) => formatCurrency(value, language)}
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

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t.financesDashboard.salesAnalytics.profitabilityBreakdown}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.financesDashboard.salesAnalytics.totalCost}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {formatCurrency(salesMetrics?.profitability.totalCost ?? 0, language)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.financesDashboard.salesAnalytics.totalSalePrice}
                </p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">
                  {formatCurrency(salesMetrics?.profitability.totalSalePrice ?? 0, language)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.financesDashboard.salesAnalytics.averageRoi}
                </p>
                <p
                  className={`text-lg font-bold mt-1 ${
                    (salesMetrics?.profitability.averageRoi ?? 0) >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {(salesMetrics?.profitability.averageRoi ?? 0).toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.financesDashboard.salesAnalytics.averageCostPerKg}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {formatCurrency(salesMetrics?.profitability.averageCostPerKg ?? 0, language)}
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
                <Cell
                  key={`cell-${entry.name || index}`}
                  fill={pieColors[index % pieColors.length]}
                />
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
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
                        {formatDate(transaction.date, language)}
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
                        {formatCurrency(transaction.amount, language)}
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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
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
                {sortedUpcomingPayments.length > 0 ? (
                  sortedUpcomingPayments.map((payment) => {
                    const supplierName = payment.supplierId
                      ? getSupplierName(payment.supplierId)
                      : undefined;
                    return (
                      <tr
                        key={payment.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">
                          {formatDate(payment.dueDate, language)}
                        </td>
                        <td className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">
                          {payment.description}
                          {supplierName && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              ({supplierName})
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-sm font-medium text-right text-orange-600 dark:text-orange-400">
                          {formatCurrency(
                            calculateRemainingAmount(payment.amount, payment.paidAmount)
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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
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
                {sortedUpcomingReceivables.length > 0 ? (
                  sortedUpcomingReceivables.map((receivable) => {
                    const buyerName = receivable.buyerId
                      ? getBuyerName(receivable.buyerId)
                      : undefined;
                    return (
                      <tr
                        key={receivable.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">
                          {formatDate(receivable.dueDate, language)}
                        </td>
                        <td className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">
                          {receivable.description}
                          {buyerName && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              ({buyerName})
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-sm font-medium text-right text-blue-600 dark:text-blue-400">
                          {formatCurrency(
                            calculateRemainingAmount(receivable.amount, receivable.paidAmount)
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

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
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
                    const supplierId = isPayable
                      ? (item.item as AccountsPayable).supplierId
                      : undefined;
                    const buyerId = isPayable
                      ? undefined
                      : (item.item as AccountsReceivable).buyerId;
                    const supplierName = supplierId ? getSupplierName(supplierId) : undefined;
                    const buyerName = buyerId ? getBuyerName(buyerId) : undefined;
                    const remainingAmount = calculateRemainingAmount(
                      item.item.amount,
                      item.item.paidAmount
                    );

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
                          {formatDate(item.item.dueDate, language)}
                        </td>
                        <td className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">
                          {item.item.description}
                          {supplierName && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              ({supplierName})
                            </span>
                          )}
                          {buyerName && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              ({buyerName})
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-sm font-medium text-right text-red-600 dark:text-red-400">
                          {formatCurrency(remainingAmount, language)}
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
