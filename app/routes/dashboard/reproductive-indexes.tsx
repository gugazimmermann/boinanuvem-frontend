import { useState, useMemo } from "react";
import { useTranslation } from "~/i18n";
import { translations } from "~/i18n/translations";
import { mockCompanies } from "~/mocks/companies";
import { getPropertiesByCompanyId } from "~/services/properties.service";
import { ReproductiveIndexes } from "~/components/dashboard/reproductive-indexes/reproductive-indexes";
import { Tooltip } from "~/components/ui/tooltip";
import {
  getFertilityRate,
  getBirthRate,
  getCalvingInterval,
  getCullingRate,
  getIntrauterineMortalityIndex,
  getBullToCowRatio,
  getExpectedBirthsForecast,
  type FertilityRateResult,
  type BirthRateResult,
  type CalvingIntervalResult,
  type CullingRateResult,
  type IntrauterineMortalityResult,
  type BullToCowRatioResult,
} from "~/services/reproductive-indexes.service";
import { format, subYears } from "date-fns";
import { useDateLocale } from "~/hooks/use-date-locale";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { ChartWrapper, getTooltipStyle, getChartColors } from "~/components/dashboard";
import { useTheme } from "~/contexts/theme-context";

const ALL_PROPERTIES_ID = "all";

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export function meta() {
  const t = translations.pt;
  return [
    { title: t.reproductiveIndexes.meta.title },
    {
      name: "description",
      content: t.reproductiveIndexes.meta.description,
    },
  ];
}

function aggregateIndexes(
  properties: Array<{ id: string }>,
  period?: { startDate?: string; endDate?: string }
) {
  const allFertilityRates: FertilityRateResult[] = [];
  const allBirthRates: BirthRateResult[] = [];
  const allCalvingIntervals: CalvingIntervalResult[] = [];
  const allCullingRates: CullingRateResult[] = [];
  const allIntrauterineMortality: IntrauterineMortalityResult[] = [];
  const allBullToCowRatios: BullToCowRatioResult[] = [];

  for (const property of properties) {
    allFertilityRates.push(getFertilityRate(property.id, period));
    allBirthRates.push(getBirthRate(property.id, period));
    allCalvingIntervals.push(getCalvingInterval(property.id));
    allCullingRates.push(getCullingRate(property.id, period));
    allIntrauterineMortality.push(getIntrauterineMortalityIndex(property.id, period));
    allBullToCowRatios.push(getBullToCowRatio(property.id));
  }

  const totalPregnantCows = allFertilityRates.reduce((sum, r) => sum + r.pregnantCows, 0);
  const totalExposedCows = allFertilityRates.reduce((sum, r) => sum + r.exposedCows, 0);
  const aggregatedFertilityRate: FertilityRateResult = {
    rate: totalExposedCows > 0 ? totalPregnantCows / totalExposedCows : 0,
    pregnantCows: totalPregnantCows,
    exposedCows: totalExposedCows,
  };

  const totalCalvesBorn = allBirthRates.reduce((sum, r) => sum + r.calvesBorn, 0);
  const totalPregnantFemales = allBirthRates.reduce((sum, r) => sum + r.pregnantFemales, 0);
  const aggregatedBirthRate: BirthRateResult = {
    rate: totalPregnantFemales > 0 ? totalCalvesBorn / totalPregnantFemales : 0,
    calvesBorn: totalCalvesBorn,
    pregnantFemales: totalPregnantFemales,
    monthly: aggregateMonthlyBirthRates(allBirthRates),
  };

  const allIntervals: number[] = [];
  for (const ci of allCalvingIntervals) {
    allIntervals.push(...ci.intervals);
  }
  const aggregatedCalvingInterval: CalvingIntervalResult = {
    average:
      allIntervals.length > 0
        ? allIntervals.reduce((sum, i) => sum + i, 0) / allIntervals.length
        : 0,
    min: allIntervals.length > 0 ? Math.min(...allIntervals) : 0,
    max: allIntervals.length > 0 ? Math.max(...allIntervals) : 0,
    intervals: allIntervals,
    animalsWithIntervals: allCalvingIntervals.reduce((sum, ci) => sum + ci.animalsWithIntervals, 0),
  };

  const totalReplacedFemales = allCullingRates.reduce((sum, r) => sum + r.replacedFemales, 0);
  const totalFemales = allCullingRates.reduce((sum, r) => sum + r.totalFemales, 0);
  const aggregatedCullingRate: CullingRateResult = {
    rate: totalFemales > 0 ? totalReplacedFemales / totalFemales : 0,
    replacedFemales: totalReplacedFemales,
    totalFemales: totalFemales,
    annual: aggregateAnnualCullingRates(allCullingRates),
  };

  const totalPregnantCowsForMortality = allIntrauterineMortality.reduce(
    (sum, r) => sum + r.pregnantCows,
    0
  );
  const totalCowsThatCalved = allIntrauterineMortality.reduce(
    (sum, r) => sum + r.cowsThatCalved,
    0
  );
  const totalLosses = allIntrauterineMortality.reduce((sum, r) => sum + r.losses, 0);
  const aggregatedIntrauterineMortality: IntrauterineMortalityResult = {
    rate: totalPregnantCowsForMortality > 0 ? totalLosses / totalPregnantCowsForMortality : 0,
    pregnantCows: totalPregnantCowsForMortality,
    cowsThatCalved: totalCowsThatCalved,
    losses: totalLosses,
  };

  const totalBullsUsed = allBullToCowRatios.reduce((sum, r) => sum + r.bullsUsed, 0);
  const totalExposedCowsForRatio = allBullToCowRatios.reduce((sum, r) => sum + r.exposedCows, 0);
  const aggregatedBullToCowRatio: BullToCowRatioResult = {
    ratio:
      totalBullsUsed > 0 && totalExposedCowsForRatio > 0
        ? `1:${Math.round(totalExposedCowsForRatio / totalBullsUsed)}`
        : "0:0",
    bullsUsed: totalBullsUsed,
    exposedCows: totalExposedCowsForRatio,
  };

  return {
    fertilityRate: aggregatedFertilityRate,
    birthRate: aggregatedBirthRate,
    calvingInterval: aggregatedCalvingInterval,
    cullingRate: aggregatedCullingRate,
    intrauterineMortality: aggregatedIntrauterineMortality,
    bullToCowRatio: aggregatedBullToCowRatio,
  };
}

function aggregateMonthlyBirthRates(birthRates: BirthRateResult[]): Array<{
  month: string;
  rate: number;
  calvesBorn: number;
  pregnantFemales: number;
}> {
  const monthlyMap = new Map<string, { calvesBorn: number; pregnantFemales: number }>();

  for (const br of birthRates) {
    if (br.monthly) {
      for (const month of br.monthly) {
        const existing = monthlyMap.get(month.month) || { calvesBorn: 0, pregnantFemales: 0 };
        monthlyMap.set(month.month, {
          calvesBorn: existing.calvesBorn + month.calvesBorn,
          pregnantFemales: existing.pregnantFemales + month.pregnantFemales,
        });
      }
    }
  }

  return Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month,
      rate: data.pregnantFemales > 0 ? data.calvesBorn / data.pregnantFemales : 0,
      calvesBorn: data.calvesBorn,
      pregnantFemales: data.pregnantFemales,
    }))
    .toSorted((a, b) => a.month.localeCompare(b.month));
}

function aggregateAnnualCullingRates(cullingRates: CullingRateResult[]): Array<{
  year: string;
  rate: number;
  replacedFemales: number;
  totalFemales: number;
}> {
  const annualMap = new Map<string, { replacedFemales: number; totalFemales: number }>();

  for (const cr of cullingRates) {
    if (cr.annual) {
      for (const year of cr.annual) {
        const existing = annualMap.get(year.year) || { replacedFemales: 0, totalFemales: 0 };
        annualMap.set(year.year, {
          replacedFemales: existing.replacedFemales + year.replacedFemales,
          totalFemales: existing.totalFemales + year.totalFemales,
        });
      }
    }
  }

  return Array.from(annualMap.entries())
    .map(([year, data]) => ({
      year,
      rate: data.totalFemales > 0 ? data.replacedFemales / data.totalFemales : 0,
      replacedFemales: data.replacedFemales,
      totalFemales: data.totalFemales,
    }))
    .toSorted((a, b) => a.year.localeCompare(b.year));
}

export default function ReproductiveIndexesPage() {
  const t = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const chartColors = getChartColors(isDark);
  const tooltipStyle = getTooltipStyle(isDark);
  const company = mockCompanies[0];
  const properties = useMemo(
    () => (company ? getPropertiesByCompanyId(company.id) : []),
    [company]
  );
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    properties.length > 0 ? ALL_PROPERTIES_ID : ""
  );

  const getDefaultPeriod = () => {
    const today = new Date();
    const oneYearAgo = subYears(today, 1);
    return {
      startDate: format(oneYearAgo, "yyyy-MM-dd"),
      endDate: format(today, "yyyy-MM-dd"),
    };
  };

  const [selectedPeriod, setSelectedPeriod] = useState<{
    startDate?: string;
    endDate?: string;
  }>(getDefaultPeriod());

  const dateLocale = useDateLocale();

  const aggregatedIndexes = useMemo(() => {
    if (selectedPropertyId !== ALL_PROPERTIES_ID || properties.length === 0) {
      return null;
    }
    return aggregateIndexes(properties, selectedPeriod);
  }, [selectedPropertyId, properties, selectedPeriod]);

  const monthlyBirthRateData = useMemo(() => {
    if (!aggregatedIndexes?.birthRate.monthly) return [];
    return aggregatedIndexes.birthRate.monthly.map((item) => {
      const [year, month] = item.month.split("-");
      const monthDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1);
      const monthName = format(monthDate, "MMM yyyy", { locale: dateLocale });
      return {
        month: monthName,
        rate: Math.round(item.rate * 100) / 100,
        calves: item.calvesBorn,
      };
    });
  }, [aggregatedIndexes, dateLocale]);

  const annualCullingRateData = useMemo(() => {
    if (!aggregatedIndexes?.cullingRate.annual) return [];
    return aggregatedIndexes.cullingRate.annual.map((item) => ({
      year: item.year,
      rate: Math.round(item.rate * 100) / 100,
      replaced: item.replacedFemales,
    }));
  }, [aggregatedIndexes]);

  const expectedBirthsForecast = useMemo(() => {
    if (selectedPropertyId === ALL_PROPERTIES_ID && company) {
      return getExpectedBirthsForecast(company.id, { isPropertyId: false, monthsAhead: 9 });
    } else if (selectedPropertyId && selectedPropertyId !== ALL_PROPERTIES_ID) {
      return getExpectedBirthsForecast(selectedPropertyId, { isPropertyId: true, monthsAhead: 9 });
    }
    return { monthly: [], total: 0 };
  }, [selectedPropertyId, company]);

  const expectedBirthsData = useMemo(() => {
    if (!expectedBirthsForecast.monthly || expectedBirthsForecast.monthly.length === 0) return [];
    return expectedBirthsForecast.monthly.map((item) => {
      const [year, month] = item.month.split("-");
      const monthDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1);
      const monthName = format(monthDate, "MMM yyyy", { locale: dateLocale });
      return {
        month: monthName,
        expectedBirths: item.expectedBirths,
      };
    });
  }, [expectedBirthsForecast.monthly, dateLocale]);

  if (properties.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t.sidebar.reproductiveIndexes}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t.reproductiveIndexes.emptyState.description}
        </p>
      </div>
    );
  }

  const showAggregated = selectedPropertyId === ALL_PROPERTIES_ID;

  return (
    <div className="space-y-8">
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
              {t.reproductiveIndexes.filters.startDate}
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
              {t.reproductiveIndexes.filters.endDate}
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

      {showAggregated && aggregatedIndexes ? (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Índices Reprodutivos
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t.reproductiveIndexes.fertilityRate.title}
                  </h3>
                  <Tooltip content={t.reproductiveIndexes.fertilityRate.description} position="top">
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
                  <span className="text-lg">📊</span>
                </div>
              </div>
              <div className="mb-3">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {(aggregatedIndexes.fertilityRate.rate * 100).toFixed(2)}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">%</span>
                </p>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t.reproductiveIndexes.fertilityRate.pregnantCows}:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {aggregatedIndexes.fertilityRate.pregnantCows}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t.reproductiveIndexes.fertilityRate.exposedCows}:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {aggregatedIndexes.fertilityRate.exposedCows}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t.reproductiveIndexes.birthRate.title}
                  </h3>
                  <Tooltip content={t.reproductiveIndexes.birthRate.description} position="top">
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
                  <span className="text-lg">👶</span>
                </div>
              </div>
              <div className="mb-3">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {(aggregatedIndexes.birthRate.rate * 100).toFixed(2)}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">%</span>
                </p>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t.reproductiveIndexes.birthRate.calvesBorn}:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {aggregatedIndexes.birthRate.calvesBorn}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t.reproductiveIndexes.birthRate.pregnantFemales}:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {aggregatedIndexes.birthRate.pregnantFemales}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t.reproductiveIndexes.calvingInterval.title}
                  </h3>
                  <Tooltip
                    content={t.reproductiveIndexes.calvingInterval.description}
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
                  {aggregatedIndexes.calvingInterval.average > 0 ? (
                    <>
                      {Math.round(aggregatedIndexes.calvingInterval.average / 30)}{" "}
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        {t.reproductiveIndexes.calvingInterval.months}
                      </span>
                    </>
                  ) : (
                    "-"
                  )}
                </p>
              </div>
              {aggregatedIndexes.calvingInterval.average > 0 && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t.reproductiveIndexes.calvingInterval.min}:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {Math.round(aggregatedIndexes.calvingInterval.min / 30)}{" "}
                      {t.reproductiveIndexes.calvingInterval.months}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t.reproductiveIndexes.calvingInterval.max}:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {Math.round(aggregatedIndexes.calvingInterval.max / 30)}{" "}
                      {t.reproductiveIndexes.calvingInterval.months}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t.reproductiveIndexes.calvingInterval.animals}:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {aggregatedIndexes.calvingInterval.animalsWithIntervals}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t.reproductiveIndexes.cullingRate.title}
                  </h3>
                  <Tooltip content={t.reproductiveIndexes.cullingRate.description} position="top">
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
                  <span className="text-lg">🔄</span>
                </div>
              </div>
              <div className="mb-3">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {(aggregatedIndexes.cullingRate.rate * 100).toFixed(2)}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">%</span>
                </p>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t.reproductiveIndexes.cullingRate.replacedFemales}:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {aggregatedIndexes.cullingRate.replacedFemales}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t.reproductiveIndexes.cullingRate.totalFemales}:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {aggregatedIndexes.cullingRate.totalFemales}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t.reproductiveIndexes.intrauterineMortality.title}
                  </h3>
                  <Tooltip
                    content={t.reproductiveIndexes.intrauterineMortality.description}
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
                  <span className="text-lg">⚠️</span>
                </div>
              </div>
              <div className="mb-3">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {(aggregatedIndexes.intrauterineMortality.rate * 100).toFixed(2)}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">%</span>
                </p>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t.reproductiveIndexes.intrauterineMortality.pregnantCows}:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {aggregatedIndexes.intrauterineMortality.pregnantCows}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t.reproductiveIndexes.intrauterineMortality.cowsThatCalved}:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {aggregatedIndexes.intrauterineMortality.cowsThatCalved}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t.reproductiveIndexes.intrauterineMortality.losses}:
                  </span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {aggregatedIndexes.intrauterineMortality.losses}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t.reproductiveIndexes.bullToCowRatio.title}
                  </h3>
                  <Tooltip
                    content={t.reproductiveIndexes.bullToCowRatio.description}
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
                  <span className="text-lg">🐂</span>
                </div>
              </div>
              <div className="mb-3">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {aggregatedIndexes.bullToCowRatio.ratio}
                </p>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t.reproductiveIndexes.bullToCowRatio.bullsUsed}:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {aggregatedIndexes.bullToCowRatio.bullsUsed}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t.reproductiveIndexes.bullToCowRatio.exposedCows}:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {aggregatedIndexes.bullToCowRatio.exposedCows}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-green-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Gráficos</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartWrapper
              title={t.reproductiveIndexes.charts.monthlyBirthRate}
              isEmpty={monthlyBirthRateData.length === 0}
              emptyMessage={t.reproductiveIndexes.charts.noData}
            >
              <LineChart data={monthlyBirthRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
                <XAxis dataKey="month" tick={{ fill: chartColors.text, fontSize: 12 }} />
                <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} />
                <RechartsTooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: "12px", color: chartColors.text }} />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke={chartColors.net}
                  strokeWidth={2}
                  name={t.reproductiveIndexes.charts.birthRate}
                />
              </LineChart>
            </ChartWrapper>

            <ChartWrapper
              title={t.reproductiveIndexes.charts.annualCullingRate}
              isEmpty={annualCullingRateData.length === 0}
              emptyMessage={t.reproductiveIndexes.charts.noData}
            >
              <BarChart data={annualCullingRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
                <XAxis dataKey="year" tick={{ fill: chartColors.text, fontSize: 12 }} />
                <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} />
                <RechartsTooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: "12px", color: chartColors.text }} />
                <Bar
                  dataKey="rate"
                  fill={chartColors.expense}
                  name={t.reproductiveIndexes.charts.cullingRate}
                />
              </BarChart>
            </ChartWrapper>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-purple-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Previsão de Nascimentos
            </h2>
          </div>
          <ChartWrapper
            title={t.reproductiveIndexes.charts.expectedFutureBirths}
            isEmpty={expectedBirthsData.length === 0}
            emptyMessage={t.reproductiveIndexes.charts.noData}
          >
            <BarChart data={expectedBirthsData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
              <XAxis dataKey="month" tick={{ fill: chartColors.text, fontSize: 12 }} />
              <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} />
              <RechartsTooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "12px", color: chartColors.text }} />
              <Bar
                dataKey="expectedBirths"
                fill={chartColors.income}
                name={t.reproductiveIndexes.charts.expectedBirths}
              />
            </BarChart>
          </ChartWrapper>
        </div>
      ) : (
        selectedPropertyId && (
          <ReproductiveIndexes propertyId={selectedPropertyId} period={selectedPeriod} />
        )
      )}
    </div>
  );
}
