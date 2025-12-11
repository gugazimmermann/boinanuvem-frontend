import { useMemo, useCallback, useState, useDeferredValue, lazy, Suspense, useEffect } from "react";
import { format, parseISO, subYears } from "date-fns";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip } from "recharts";
import { useTranslation } from "~/i18n";
import { Tooltip } from "~/components/ui/tooltip";
import { useTheme } from "~/contexts/theme-context";
import { useLanguage } from "~/contexts/language-context";
import { StatCard, ChartWrapper, getChartColors, getTooltipStyle } from "~/components/dashboard";
import { LineChartConfig } from "~/components/dashboard/charts/line-chart-config";
import { AreaChartConfig } from "~/components/dashboard/charts/area-chart-config";
import { ActivityItem } from "~/components/dashboard/activity-item";
import { RecentListItem } from "~/components/dashboard/recent-list-item";

function ProductionIndexesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700 animate-pulse"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
          <div className="mb-3">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

const ProductionIndexes = lazy(() =>
  import("~/components/dashboard/production-indexes/production-indexes").then((module) => ({
    default: module.ProductionIndexes,
  }))
);
import { mockCompanies } from "~/mocks/companies";
import { getProperties } from "~/services/properties.service";
import type { Property } from "~/types";
import { useDashboardData } from "~/components/dashboard/hooks/use-dashboard-data";
import { useMonthlyTrends } from "~/components/dashboard/hooks/use-monthly-trends";
import { useRecentActivities } from "~/components/dashboard/hooks/use-recent-activities";
import { formatCurrency } from "~/utils/currency";
import { formatNumber } from "~/utils/formatting";
import { getDateLocale } from "~/utils/date";
import { ROUTES } from "~/routes.config";
import { translations } from "~/i18n/translations";
import {
  getAverageDailyGain,
  getAverageDailyCarcassGain,
  getDaysOnFeed,
  getCarcassYield,
  getSlaughterAge,
  getArrobaProductionPerHectare,
  getKgNitrogenPerAU,
  getKgMeatPerKgNitrogen,
  type AverageDailyGainResult,
  type AverageDailyCarcassGainResult,
  type DaysOnFeedResult,
  type CarcassYieldResult,
  type SlaughterAgeResult,
  type ArrobaProductionPerHectareResult,
  type KgNitrogenPerAUResult,
  type KgMeatPerKgNitrogenResult,
} from "~/services/production-indexes.service";
import type { Weighing, CashFlow, Sale } from "~/types";

const ALL_PROPERTIES_ID = "all";

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

async function collectPropertyIndexes(
  properties: Array<{ id: string }>,
  period?: { startDate?: string; endDate?: string }
) {
  const allAdgResults: AverageDailyGainResult[] = [];
  const allAdcResults: AverageDailyCarcassGainResult[] = [];
  const allDaysOnFeed: DaysOnFeedResult[] = [];
  const allCarcassYields: CarcassYieldResult[] = [];
  const allSlaughterAges: SlaughterAgeResult[] = [];
  const allArrobaProductions: ArrobaProductionPerHectareResult[] = [];
  const allKgNitrogenPerAU: KgNitrogenPerAUResult[] = [];
  const allKgMeatPerKgNitrogen: KgMeatPerKgNitrogenResult[] = [];

  for (const property of properties) {
    const adgResults = await getAverageDailyGain(property.id, period);
    allAdgResults.push(...adgResults);
    const carcassYield = await getCarcassYield(property.id, period);
    allCarcassYields.push(carcassYield);
    const adcResults = await getAverageDailyCarcassGain(property.id, period, carcassYield.yield);
    allAdcResults.push(...adcResults);
    const daysOnFeed = await getDaysOnFeed(property.id, period);
    allDaysOnFeed.push(...daysOnFeed);
    const slaughterAge = await getSlaughterAge(property.id, period);
    allSlaughterAges.push(slaughterAge);
    const arrobaProduction = await getArrobaProductionPerHectare(property.id, period);
    allArrobaProductions.push(arrobaProduction);
    const kgNitrogenPerAU = await getKgNitrogenPerAU(property.id, period);
    allKgNitrogenPerAU.push(kgNitrogenPerAU);
    const kgMeatPerKgNitrogen = await getKgMeatPerKgNitrogen(property.id, period);
    allKgMeatPerKgNitrogen.push(kgMeatPerKgNitrogen);
  }

  return {
    allAdgResults,
    allAdcResults,
    allDaysOnFeed,
    allCarcassYields,
    allSlaughterAges,
    allArrobaProductions,
    allKgNitrogenPerAU,
    allKgMeatPerKgNitrogen,
  };
}

function calculateAverage(
  results: Array<{ adg?: number; adc?: number; days?: number }>,
  field: "adg" | "adc" | "days"
): number {
  if (results.length === 0) return 0;
  return (
    results.reduce((sum, r) => {
      let value: number | undefined;
      if (field === "adg") {
        value = r.adg;
      } else if (field === "adc") {
        value = r.adc;
      } else {
        value = r.days;
      }
      return sum + (value || 0);
    }, 0) / results.length
  );
}

function calculateAverageFromNumbers(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, age) => sum + age, 0) / numbers.length;
}

function aggregateCarcassYield(allCarcassYields: CarcassYieldResult[]): CarcassYieldResult {
  const totalCarcassWeight = allCarcassYields.reduce((sum, r) => sum + r.carcassWeight, 0);
  const totalLiveWeight = allCarcassYields.reduce((sum, r) => sum + r.liveWeight, 0);
  const totalCount = allCarcassYields.reduce((sum, r) => sum + r.count, 0);
  return {
    yield: totalLiveWeight > 0 ? (totalCarcassWeight / totalLiveWeight) * 100 : 0,
    carcassWeight: totalCarcassWeight,
    liveWeight: totalLiveWeight,
    count: totalCount,
  };
}

function aggregateSlaughterAge(allSlaughterAges: SlaughterAgeResult[]): SlaughterAgeResult {
  const allAges: number[] = [];
  for (const sa of allSlaughterAges) {
    if (sa.count > 0) {
      for (let i = 0; i < sa.count; i++) {
        allAges.push(sa.averageAge);
      }
    }
  }
  return {
    averageAge: allAges.length > 0 ? calculateAverageFromNumbers(allAges) : 0,
    minAge: allAges.length > 0 ? Math.min(...allAges) : 0,
    maxAge: allAges.length > 0 ? Math.max(...allAges) : 0,
    count: allAges.length,
  };
}

async function aggregateIndexes(
  properties: Array<{ id: string }>,
  period?: { startDate?: string; endDate?: string }
) {
  const {
    allAdgResults,
    allAdcResults,
    allDaysOnFeed,
    allCarcassYields,
    allSlaughterAges,
    allArrobaProductions,
    allKgNitrogenPerAU,
    allKgMeatPerKgNitrogen,
  } = await collectPropertyIndexes(properties, period);

  const averageAdg = calculateAverage(allAdgResults, "adg");
  const averageAdc = calculateAverage(allAdcResults, "adc");
  const averageDaysOnFeed = calculateAverage(allDaysOnFeed, "days");

  const aggregatedCarcassYield = aggregateCarcassYield(allCarcassYields);
  const aggregatedSlaughterAge = aggregateSlaughterAge(allSlaughterAges);

  const totalArrobas = allArrobaProductions.reduce((sum, r) => sum + r.totalArrobas, 0);
  const totalArea = allArrobaProductions.reduce((sum, r) => sum + r.areaInHectares, 0);
  const aggregatedArrobaProduction: ArrobaProductionPerHectareResult = {
    arrobasPerHectare: totalArea > 0 ? totalArrobas / totalArea : 0,
    totalArrobas,
    areaInHectares: totalArea,
    period,
  };

  const totalNitrogen = allKgNitrogenPerAU.reduce((sum, r) => sum + r.totalNitrogen, 0);
  const totalAU = allKgNitrogenPerAU.reduce((sum, r) => sum + r.animalUnits, 0);
  const aggregatedKgNitrogenPerAU: KgNitrogenPerAUResult = {
    kgNitrogenPerAU: totalAU > 0 ? totalNitrogen / totalAU : 0,
    totalNitrogen,
    animalUnits: totalAU,
    areaInHectares: allKgNitrogenPerAU.reduce((sum, r) => sum + r.areaInHectares, 0),
  };

  const totalWeightGain = allKgMeatPerKgNitrogen.reduce((sum, r) => sum + r.totalWeightGain, 0);
  const totalNitrogenForMeat = allKgMeatPerKgNitrogen.reduce((sum, r) => sum + r.totalNitrogen, 0);
  const aggregatedKgMeatPerKgNitrogen: KgMeatPerKgNitrogenResult = {
    kgMeatPerKgNitrogen: totalNitrogenForMeat > 0 ? totalWeightGain / totalNitrogenForMeat : 0,
    totalWeightGain,
    totalNitrogen: totalNitrogenForMeat,
  };

  return {
    averageAdg,
    averageAdc,
    averageDaysOnFeed,
    carcassYield: aggregatedCarcassYield,
    slaughterAge: aggregatedSlaughterAge,
    arrobaProduction: aggregatedArrobaProduction,
    kgNitrogenPerAU: aggregatedKgNitrogenPerAU,
    kgMeatPerKgNitrogen: aggregatedKgMeatPerKgNitrogen,
    adgResultsCount: allAdgResults.length,
    daysOnFeedCount: allDaysOnFeed.length,
  };
}

export default function Dashboard() {
  const t = useTranslation();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === "dark";

  const dateLocale = useMemo(() => getDateLocale(language), [language]);

  const company = mockCompanies[0];
  const companyId = company?.id || "";
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    const fetchProperties = async () => {
      if (company) {
        try {
          const propertiesData = await getProperties();
          setProperties(propertiesData.filter((prop) => prop.companyId === company.id));
        } catch (error) {
          console.error("Failed to load properties:", error);
        }
      }
    };
    fetchProperties();
  }, [company]);

  const getDefaultPeriod = () => {
    const today = new Date();
    const oneYearAgo = subYears(today, 1);
    return {
      startDate: format(oneYearAgo, "yyyy-MM-dd"),
      endDate: format(today, "yyyy-MM-dd"),
    };
  };

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    properties.length > 0 ? ALL_PROPERTIES_ID : ""
  );

  const [selectedPeriod, setSelectedPeriod] = useState<{
    startDate?: string;
    endDate?: string;
  }>(getDefaultPeriod());

  const shouldLoadIndexes = selectedPropertyId === ALL_PROPERTIES_ID && properties.length > 0;
  const [aggregatedIndexesRaw, setAggregatedIndexesRaw] = useState<Awaited<
    ReturnType<typeof aggregateIndexes>
  > | null>(null);

  // Load aggregated indexes when conditions are met
  useEffect(() => {
    if (!shouldLoadIndexes) {
      // Use a microtask to avoid synchronous setState
      Promise.resolve().then(() => {
        setAggregatedIndexesRaw(null);
      });
      return;
    }
    const loadIndexes = async () => {
      const result = await aggregateIndexes(properties, selectedPeriod);
      setAggregatedIndexesRaw(result);
    };
    loadIndexes();
  }, [shouldLoadIndexes, properties, selectedPeriod]);

  const aggregatedIndexes = useDeferredValue(aggregatedIndexesRaw);
  const isCalculatingIndexes = aggregatedIndexesRaw !== aggregatedIndexes;

  const showAggregated = selectedPropertyId === ALL_PROPERTIES_ID;

  const dashboardFilters = useMemo(
    () => ({
      propertyId: selectedPropertyId === ALL_PROPERTIES_ID ? undefined : selectedPropertyId,
      startDate: selectedPeriod.startDate,
      endDate: selectedPeriod.endDate,
    }),
    [selectedPropertyId, selectedPeriod.startDate, selectedPeriod.endDate]
  );

  const dashboardData = useDashboardData(companyId, dashboardFilters);
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
    for (const weighing of monthWeighings) {
      totalWeight += weighing.weight;
      count++;
    }
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
    for (const animal of animals) {
      statusCounts[animal.status] = (statusCounts[animal.status] || 0) + 1;
    }

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t.dashboard.title}</h1>
      </div>

      {properties.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
            Filtros
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.reproductiveIndexes.propertyLabel}
              </label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={ALL_PROPERTIES_ID}>{t.reproductiveIndexes.allProperties}</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.productionIndexes.filters.startDate}
              </label>
              <input
                type="date"
                value={selectedPeriod.startDate || ""}
                onChange={(e) =>
                  setSelectedPeriod((prev) => ({
                    ...prev,
                    startDate: e.target.value || undefined,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.productionIndexes.filters.endDate}
              </label>
              <input
                type="date"
                value={selectedPeriod.endDate || ""}
                onChange={(e) =>
                  setSelectedPeriod((prev) => ({
                    ...prev,
                    endDate: e.target.value || undefined,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t.dashboard.sections.livestockOverview}
          </h2>
        </div>
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
            value={formatNumber(totalAnimals, language)}
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
            subtitle={`${salesMetrics?.totalAnimalsSold ?? 0} ${t.dashboard.additionalStats.animalsSold}`}
            icon={<span className="text-lg">💵</span>}
          />
        </div>
      </div>

      {properties.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-green-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {t.productionIndexes.meta.title}
            </h2>
          </div>

          {(() => {
            const isLoading =
              showAggregated &&
              (isCalculatingIndexes ||
                (aggregatedIndexesRaw === null && selectedPropertyId === ALL_PROPERTIES_ID));
            const hasAggregatedData = showAggregated && aggregatedIndexes;

            if (isLoading) {
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 8 }, (_, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700 animate-pulse"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      </div>
                      <div className="mb-3">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      </div>
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            }

            if (hasAggregatedData) {
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t.productionIndexes.averageDailyGain.title}
                        </h3>
                        <Tooltip
                          content={t.productionIndexes.averageDailyGain.description}
                          position="top"
                        >
                          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                        </Tooltip>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-lg">📈</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {aggregatedIndexes.averageAdg.toFixed(2)}{" "}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          kg/dia
                        </span>
                      </p>
                    </div>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t.productionIndexes.averageDailyGain.animals}:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {aggregatedIndexes.adgResultsCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t.productionIndexes.averageDailyCarcassGain.title}
                        </h3>
                        <Tooltip
                          content={t.productionIndexes.averageDailyCarcassGain.description}
                          position="top"
                        >
                          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                        </Tooltip>
                      </div>
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🥩</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {aggregatedIndexes.averageAdc.toFixed(2)}{" "}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          kg/dia
                        </span>
                      </p>
                    </div>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t.productionIndexes.averageDailyCarcassGain.carcassYield}:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {aggregatedIndexes.carcassYield.yield.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t.productionIndexes.daysOnFeed.title}
                        </h3>
                        <Tooltip
                          content={t.productionIndexes.daysOnFeed.description}
                          position="top"
                        >
                          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                        </Tooltip>
                      </div>
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-lg">⏱️</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {Math.round(aggregatedIndexes.averageDaysOnFeed)}{" "}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          dias
                        </span>
                      </p>
                    </div>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t.productionIndexes.daysOnFeed.animals}:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {aggregatedIndexes.daysOnFeedCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t.productionIndexes.carcassYield.title}
                        </h3>
                        <Tooltip
                          content={t.productionIndexes.carcassYield.description}
                          position="top"
                        >
                          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                        </Tooltip>
                      </div>
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-lg">📊</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {aggregatedIndexes.carcassYield.yield.toFixed(2)}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          %
                        </span>
                      </p>
                    </div>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t.productionIndexes.carcassYield.count}:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {aggregatedIndexes.carcassYield.count}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t.productionIndexes.carcassYield.carcassWeight}:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {aggregatedIndexes.carcassYield.carcassWeight.toFixed(2)} kg
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t.productionIndexes.carcassYield.liveWeight}:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {aggregatedIndexes.carcassYield.liveWeight.toFixed(2)} kg
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t.productionIndexes.slaughterAge.title}
                        </h3>
                        <Tooltip
                          content={t.productionIndexes.slaughterAge.description}
                          position="top"
                        >
                          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                        </Tooltip>
                      </div>
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🎯</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {aggregatedIndexes.slaughterAge.averageAge > 0 ? (
                          <>
                            {Math.round(aggregatedIndexes.slaughterAge.averageAge / 30)}{" "}
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                              meses
                            </span>
                          </>
                        ) : (
                          "-"
                        )}
                      </p>
                    </div>
                    {aggregatedIndexes.slaughterAge.averageAge > 0 && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">
                            {t.productionIndexes.slaughterAge.min}:
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {Math.round(aggregatedIndexes.slaughterAge.minAge / 30)} meses
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">
                            {t.productionIndexes.slaughterAge.max}:
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {Math.round(aggregatedIndexes.slaughterAge.maxAge / 30)} meses
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-400">
                            {t.productionIndexes.slaughterAge.count}:
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {aggregatedIndexes.slaughterAge.count}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t.productionIndexes.arrobaProductionPerHectare.title}
                        </h3>
                        <Tooltip
                          content={t.productionIndexes.arrobaProductionPerHectare.description}
                          position="top"
                        >
                          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                        </Tooltip>
                      </div>
                      <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🌾</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {aggregatedIndexes.arrobaProduction.arrobasPerHectare.toFixed(2)}{" "}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          @/ha
                        </span>
                      </p>
                    </div>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t.productionIndexes.arrobaProductionPerHectare.totalArrobas}:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {aggregatedIndexes.arrobaProduction.totalArrobas.toFixed(2)} @
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t.productionIndexes.arrobaProductionPerHectare.areaInHectares}:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {aggregatedIndexes.arrobaProduction.areaInHectares.toFixed(2)} ha
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t.productionIndexes.kgNitrogenPerAU.title}
                        </h3>
                        <Tooltip
                          content={t.productionIndexes.kgNitrogenPerAU.description}
                          position="top"
                        >
                          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                        </Tooltip>
                      </div>
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🌱</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {aggregatedIndexes.kgNitrogenPerAU.kgNitrogenPerAU.toFixed(2)}{" "}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          kg N/AU
                        </span>
                      </p>
                    </div>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t.productionIndexes.kgNitrogenPerAU.totalNitrogen}:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {aggregatedIndexes.kgNitrogenPerAU.totalNitrogen.toFixed(2)} kg
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t.productionIndexes.kgNitrogenPerAU.animalUnits}:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {aggregatedIndexes.kgNitrogenPerAU.animalUnits.toFixed(2)} AU
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {t.productionIndexes.kgMeatPerKgNitrogen.title}
                        </h3>
                        <Tooltip
                          content={t.productionIndexes.kgMeatPerKgNitrogen.description}
                          position="top"
                        >
                          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                        </Tooltip>
                      </div>
                      <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-lg">⚡</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {aggregatedIndexes.kgMeatPerKgNitrogen.kgMeatPerKgNitrogen.toFixed(2)}{" "}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          kg/kg N
                        </span>
                      </p>
                    </div>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t.productionIndexes.kgMeatPerKgNitrogen.totalWeightGain}:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {aggregatedIndexes.kgMeatPerKgNitrogen.totalWeightGain.toFixed(2)} kg
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t.productionIndexes.kgMeatPerKgNitrogen.totalNitrogen}:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {aggregatedIndexes.kgMeatPerKgNitrogen.totalNitrogen.toFixed(2)} kg
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (selectedPropertyId) {
              return (
                <Suspense fallback={<ProductionIndexesSkeleton />}>
                  <ProductionIndexes propertyId={selectedPropertyId} period={selectedPeriod} />
                </Suspense>
              );
            }

            return null;
          })()}
        </div>
      )}

      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-purple-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t.dashboard.sections.financialOverview}
          </h2>
        </div>
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
            value={formatCurrency(salesMetrics?.totalRevenue ?? 0, language)}
            valueColor="green"
            subtitle={`${t.dashboard.financial.averagePricePerKg}: ${formatCurrency(salesMetrics?.averagePricePerKg ?? 0, language)}`}
            icon={<span className="text-lg">💰</span>}
            link={{ to: ROUTES.SALES, text: t.dashboard.financial.viewSales }}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-orange-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t.dashboard.sections.charts}
          </h2>
        </div>
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
                  return <Cell key={entry.name} fill={colors[index % colors.length]} />;
                })}
              </Pie>
              <RechartsTooltip {...getTooltipStyle(isDark)} />
            </PieChart>
          </ChartWrapper>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-teal-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t.dashboard.recentActivities.title}
          </h2>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
          <div className="space-y-3">
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <ActivityItem
                  key={`${activity.type}-${activity.date}-${index}`}
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

      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-pink-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Registros Recentes</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
              {t.dashboard.sections.recentBirths}
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
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
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
              {t.dashboard.sections.recentBreedings}
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
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
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
              {t.dashboard.sections.recentSales}
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
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
    </div>
  );
}
