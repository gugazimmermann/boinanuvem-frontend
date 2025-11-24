import { useMemo, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { useTranslation } from "~/i18n";
import { useTheme } from "~/contexts/theme-context";
import { useLanguage } from "~/contexts/language-context";
import { StatCard, ChartWrapper, getChartColors, getTooltipStyle } from "~/components/dashboard";
import { LineChartConfig } from "~/components/dashboard/charts/line-chart-config";
import { AreaChartConfig } from "~/components/dashboard/charts/area-chart-config";
import { ActivityItem } from "~/components/dashboard/activity-item";
import { RecentListItem } from "~/components/dashboard/recent-list-item";
import { mockCompanies } from "~/mocks/companies";
import { useDashboardData } from "~/components/dashboard/hooks/use-dashboard-data";
import { useMonthlyTrends } from "~/components/dashboard/hooks/use-monthly-trends";
import { useRecentActivities } from "~/components/dashboard/hooks/use-recent-activities";
import { formatCurrency } from "~/utils/currency";
import { getDateLocale } from "~/utils/date";
import { ROUTES } from "~/routes.config";
import { translations } from "~/i18n/translations";
import type { Weighing, CashFlow, Sale } from "~/types";

export function meta() {
  const t = translations.pt;
  return [
    { title: t.dashboard.meta.title },
    {
      name: "description",
      content: t.dashboard.meta.description,
    },
  ];
}

export default function Dashboard() {
  const t = useTranslation();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === "dark";

  const dateLocale = useMemo(() => getDateLocale(language), [language]);

  const company = mockCompanies[0];
  const companyId = company?.id || "";

  const dashboardData = useDashboardData(companyId);
  const {
    animals,
    totalAnimals,
    totalProperties,
    totalLocations,
    totalWeight,
    animalUnits,
    totalAreaInHectares,
    stockingRate,
    nextMonthExpected,
    nextThreeMonthsTotal,
    totalIncome,
    totalExpenses,
    netCashFlow,
    totalAccountsPayable,
    totalAccountsReceivable,
    employees,
    suppliers,
    buyers,
    birthsThisMonth,
    breedingsThisMonth,
    salesThisMonth,
    salesMetrics,
    recentSales,
    recentBirths,
    recentBreedings,
    allWeighings,
    cashFlowData,
    sales,
    births,
    breedings,
    currentDate,
  } = dashboardData;

  const activities = useRecentActivities({
    animals,
    births,
    weighings: allWeighings,
    breedings,
    cashFlowData,
    sales,
    t,
  });

  const formatRelativeTimeOptions = useMemo(
    () => ({
      minutesAgo: t.dashboard.recentActivities.minutesAgo,
      hoursAgo: t.dashboard.recentActivities.hoursAgo,
      daysAgo: t.dashboard.recentActivities.daysAgo,
    }),
    [t]
  );

  const weightAggregator = useCallback((monthWeighings: Weighing[]) => {
    let totalWeight = 0;
    let count = 0;
    monthWeighings.forEach((weighing) => {
      totalWeight += weighing.weight;
      count++;
    });
    const avgWeight = count > 0 ? totalWeight / count : 0;
    return { averageWeight: Math.round(avgWeight) };
  }, []);

  const financialAggregator = useCallback((monthTransactions: CashFlow[]) => {
    const income = monthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      income: Math.round(income),
      expenses: Math.round(expenses),
    };
  }, []);

  const salesAggregator = useCallback((monthSales: Sale[]) => {
    const revenue = monthSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    return {
      revenue: Math.round(revenue),
      count: monthSales.length,
    };
  }, []);

  const weightTrendData = useMonthlyTrends<Weighing>({
    data: allWeighings,
    dateField: "date",
    monthsBack: 5,
    dateLocale,
    currentDate,
    aggregator: weightAggregator,
  });

  const financialTrendData = useMonthlyTrends<CashFlow>({
    data: cashFlowData,
    dateField: "date",
    monthsBack: 5,
    dateLocale,
    currentDate,
    aggregator: financialAggregator,
  });

  const salesTrendData = useMonthlyTrends<Sale>({
    data: sales,
    dateField: "saleDate",
    monthsBack: 5,
    dateLocale,
    currentDate,
    aggregator: salesAggregator,
  });

  const chartColors = getChartColors(isDark);

  const animalDistributionByStatus = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    animals.forEach((animal) => {
      statusCounts[animal.status] = (statusCounts[animal.status] || 0) + 1;
    });

    const statusTranslations: Record<string, string> = {
      active: t.animals.table.active,
      inactive: t.animals.table.inactive,
      sold: t.animals.table.sold,
    };

    return Object.entries(statusCounts).map(([status, value]) => ({
      name: statusTranslations[status] || status,
      value,
    }));
  }, [animals, t]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        {t.dashboard.title}
      </h1>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t.dashboard.sections.livestockOverview}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t.dashboard.stats.properties}
            value={totalProperties}
            subtitle={`${totalAreaInHectares.toFixed(1)} ${t.dashboard.stats.hectares}`}
            icon={<span className="text-lg">🏡</span>}
          />

          <StatCard
            title={t.dashboard.stats.locations}
            value={totalLocations}
            icon={<span className="text-lg">📍</span>}
          />

          <StatCard
            title={t.dashboard.stats.totalAnimals}
            value={totalAnimals.toLocaleString()}
            icon={<span className="text-lg">🐄</span>}
          />

          <StatCard
            title={t.properties.table.uas}
            value={animalUnits.toFixed(2)}
            icon={<span className="text-lg">📊</span>}
          />

          <StatCard
            title={t.properties.table.stockingRate}
            value={stockingRate.toFixed(2)}
            subtitle={t.dashboard.stats.uaPerHa}
            icon={<span className="text-lg">🌱</span>}
          />

          <StatCard
            title={t.dashboard.stats.density}
            value={totalAreaInHectares > 0 ? (totalAnimals / totalAreaInHectares).toFixed(2) : 0}
            subtitle={t.dashboard.stats.animalsPerHa}
            icon={<span className="text-lg">📈</span>}
          />

          <StatCard
            title={t.dashboard.stats.averageWeight}
            value={totalAnimals > 0 ? (totalWeight / totalAnimals).toFixed(0) : 0}
            subtitle={t.dashboard.stats.kgPerAnimal}
            icon={<span className="text-lg">⚖️</span>}
          />

          <StatCard
            title={t.dashboard.stats.expectedBirths}
            value={nextMonthExpected}
            subtitle={`${t.dashboard.stats.nextMonth} • ${nextThreeMonthsTotal} ${t.dashboard.stats.nextThreeMonths}`}
            icon={<span className="text-lg">📅</span>}
            link={{ to: ROUTES.BIRTH_FORECAST, text: t.dashboard.stats.viewForecast }}
          />

          <StatCard
            title={t.dashboard.additionalStats.employees}
            value={employees.length}
            icon={<span className="text-lg">👥</span>}
          />

          <StatCard
            title={t.dashboard.additionalStats.suppliers}
            value={suppliers.length}
            icon={<span className="text-lg">🏭</span>}
          />

          <StatCard
            title={t.dashboard.additionalStats.buyers}
            value={buyers.length}
            icon={<span className="text-lg">🛒</span>}
          />

          <StatCard
            title={t.dashboard.additionalStats.birthsThisMonth}
            value={birthsThisMonth}
            icon={<span className="text-lg">👶</span>}
          />

          <StatCard
            title={t.dashboard.additionalStats.breedingsThisMonth}
            value={breedingsThisMonth}
            icon={<span className="text-lg">💑</span>}
          />

          <StatCard
            title={t.dashboard.additionalStats.salesThisMonth}
            value={salesThisMonth}
            subtitle={`${salesMetrics.totalAnimalsSold} ${t.dashboard.additionalStats.animalsSold}`}
            icon={<span className="text-lg">💵</span>}
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t.dashboard.sections.financialOverview}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title={t.dashboard.financial.monthlyIncome}
            value={formatCurrency(totalIncome, language)}
            valueColor="green"
            icon={<span className="text-lg">📈</span>}
          />

          <StatCard
            title={t.dashboard.financial.monthlyExpenses}
            value={formatCurrency(totalExpenses, language)}
            valueColor="red"
            icon={<span className="text-lg">📉</span>}
          />

          <StatCard
            title={t.dashboard.financial.netCashFlow}
            value={formatCurrency(netCashFlow, language)}
            valueColor={netCashFlow >= 0 ? "green" : "red"}
            icon={<span className="text-lg">💰</span>}
          />

          <StatCard
            title={t.dashboard.financial.accountsPayable}
            value={formatCurrency(totalAccountsPayable, language)}
            valueColor="orange"
            icon={<span className="text-lg">📤</span>}
          />

          <StatCard
            title={t.dashboard.financial.accountsReceivable}
            value={formatCurrency(totalAccountsReceivable, language)}
            valueColor="blue"
            icon={<span className="text-lg">📥</span>}
            link={{ to: ROUTES.FINANCES_DASHBOARD, text: t.dashboard.financial.viewFinances }}
          />

          <StatCard
            title={t.dashboard.financial.totalSalesRevenue}
            value={formatCurrency(salesMetrics.totalRevenue, language)}
            valueColor="green"
            subtitle={`${t.dashboard.financial.averagePricePerKg}: ${formatCurrency(salesMetrics.averagePricePerKg, language)}`}
            icon={<span className="text-lg">💰</span>}
            link={{ to: ROUTES.SALES, text: t.dashboard.financial.viewSales }}
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t.dashboard.sections.charts}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartWrapper
            title={t.dashboard.charts.weightTrends}
            isEmpty={weightTrendData.length === 0}
            emptyMessage={t.dashboard.charts.noData}
          >
            <LineChartConfig
              data={weightTrendData}
              dataKeys={[
                {
                  key: "averageWeight",
                  name: t.dashboard.charts.averageWeight,
                  color: chartColors.weight,
                },
              ]}
              xAxisKey="month"
              yAxisLabel={t.dashboard.charts.averageWeight}
              tooltipFormatter={(value: number) => [
                `${value} kg`,
                t.dashboard.charts.averageWeight,
              ]}
              chartColors={chartColors}
              isDark={isDark}
            />
          </ChartWrapper>

          <ChartWrapper
            title={t.dashboard.charts.financialTrends}
            isEmpty={financialTrendData.length === 0}
            emptyMessage={t.dashboard.charts.noData}
          >
            <LineChartConfig
              data={financialTrendData}
              dataKeys={[
                {
                  key: "income",
                  name: t.dashboard.charts.income,
                  color: chartColors.income,
                },
                {
                  key: "expenses",
                  name: t.dashboard.charts.expenses,
                  color: chartColors.expense,
                },
              ]}
              xAxisKey="month"
              yAxisFormatter={(value) => t.common.currency.formatShort(value)}
              tooltipFormatter={(value: number) => formatCurrency(value, language)}
              chartColors={chartColors}
              isDark={isDark}
            />
          </ChartWrapper>

          <ChartWrapper
            title={t.dashboard.charts.salesTrends}
            isEmpty={salesTrendData.length === 0}
            emptyMessage={t.dashboard.charts.noSalesData}
          >
            <AreaChartConfig
              data={salesTrendData}
              dataKeys={[
                {
                  key: "revenue",
                  name: t.dashboard.charts.revenue,
                  color: chartColors.income,
                  gradientId: "colorRevenue",
                },
              ]}
              xAxisKey="month"
              yAxisFormatter={(value) => t.common.currency.formatShort(value)}
              tooltipFormatter={(value: number) => formatCurrency(value, language)}
              chartColors={chartColors}
              isDark={isDark}
            />
          </ChartWrapper>

          <ChartWrapper
            title={t.dashboard.charts.animalDistributionByStatus}
            isEmpty={animalDistributionByStatus.length === 0}
            emptyMessage={t.dashboard.charts.noAnimalData}
          >
            <PieChart>
              <Pie
                data={animalDistributionByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {animalDistributionByStatus.map((entry, index) => {
                  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Pie>
              <Tooltip {...getTooltipStyle(isDark)} />
            </PieChart>
          </ChartWrapper>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t.dashboard.recentActivities.title}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
          <div className="space-y-3">
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <ActivityItem
                  key={index}
                  icon={activity.icon}
                  title={activity.title}
                  date={activity.date}
                  color={activity.color as "blue" | "purple" | "teal" | "pink" | "green" | "red"}
                  formatRelativeTimeOptions={formatRelativeTimeOptions}
                  isLast={index === activities.length - 1}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                {t.dashboard.recentActivities.noActivities}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t.dashboard.sections.recentBirths}
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              {recentBirths.length > 0 ? (
                recentBirths.map((birth, index) => (
                  <div
                    key={birth.id}
                    className={
                      index < recentBirths.length - 1
                        ? "pb-3 border-b border-gray-200 dark:border-gray-700"
                        : ""
                    }
                  >
                    <RecentListItem
                      icon="👶"
                      date={birth.birthDate}
                      title={format(parseISO(birth.birthDate), "dd/MM/yyyy")}
                      color="purple"
                      formatRelativeTimeOptions={formatRelativeTimeOptions}
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  {t.dashboard.sections.noRecentBirths}
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t.dashboard.sections.recentBreedings}
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              {recentBreedings.length > 0 ? (
                recentBreedings.map((breeding, index) => (
                  <div
                    key={breeding.id}
                    className={
                      index < recentBreedings.length - 1
                        ? "pb-3 border-b border-gray-200 dark:border-gray-700"
                        : ""
                    }
                  >
                    <RecentListItem
                      icon="💑"
                      date={breeding.date}
                      title={format(parseISO(breeding.date), "dd/MM/yyyy")}
                      color="pink"
                      formatRelativeTimeOptions={formatRelativeTimeOptions}
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  {t.dashboard.sections.noRecentBreedings}
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t.dashboard.sections.recentSales}
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              {recentSales.length > 0 ? (
                recentSales.map((sale, index) => (
                  <div
                    key={sale.id}
                    className={
                      index < recentSales.length - 1
                        ? "pb-3 border-b border-gray-200 dark:border-gray-700"
                        : ""
                    }
                  >
                    <RecentListItem
                      icon="💵"
                      date={sale.saleDate}
                      title={`${format(parseISO(sale.saleDate), "dd/MM/yyyy")} • ${formatCurrency(sale.totalPrice, language)}`}
                      subtitle={`${sale.saleItems.length} ${t.dashboard.additionalStats.animal(sale.saleItems.length)}`}
                      color="emerald"
                      formatRelativeTimeOptions={formatRelativeTimeOptions}
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  {t.dashboard.sections.noRecentSales}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
