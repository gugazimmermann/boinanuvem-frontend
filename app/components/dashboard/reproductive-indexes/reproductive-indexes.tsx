import { useMemo, useState } from "react";
import {
  getFertilityRate,
  getBirthRate,
  getCalvingInterval,
  getCullingRate,
  getIntrauterineMortalityIndex,
  getBullToCowRatio,
  getExpectedBirthsForecast,
} from "~/services/reproductive-indexes.service";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
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
  ResponsiveContainer,
} from "recharts";
import { format, subYears } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { enUS } from "date-fns/locale/en-US";
import { es } from "date-fns/locale/es";

interface ReproductiveIndexesProps {
  propertyId: string;
}

export function ReproductiveIndexes({ propertyId }: ReproductiveIndexesProps) {
  const t = useTranslation();
  const { language } = useLanguage();

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

  const fertilityRate = useMemo(
    () => getFertilityRate(propertyId, selectedPeriod),
    [propertyId, selectedPeriod]
  );

  const birthRate = useMemo(
    () => getBirthRate(propertyId, selectedPeriod),
    [propertyId, selectedPeriod]
  );

  const calvingInterval = useMemo(() => getCalvingInterval(propertyId), [propertyId]);

  const cullingRate = useMemo(
    () => getCullingRate(propertyId, selectedPeriod),
    [propertyId, selectedPeriod]
  );

  const intrauterineMortality = useMemo(
    () => getIntrauterineMortalityIndex(propertyId, selectedPeriod),
    [propertyId, selectedPeriod]
  );

  const bullToCowRatio = useMemo(() => getBullToCowRatio(propertyId), [propertyId]);

  const monthlyBirthRateData = useMemo(() => {
    if (!birthRate.monthly) return [];
    return birthRate.monthly.map((item) => {
      const [year, month] = item.month.split("-");
      const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthName = format(monthDate, "MMM yyyy", { locale: dateLocale });
      return {
        month: monthName,
        rate: Math.round(item.rate * 100) / 100,
        calves: item.calvesBorn,
      };
    });
  }, [birthRate.monthly, dateLocale]);

  const annualCullingRateData = useMemo(() => {
    if (!cullingRate.annual) return [];
    return cullingRate.annual.map((item) => ({
      year: item.year,
      rate: Math.round(item.rate * 100) / 100,
      replaced: item.replacedFemales,
    }));
  }, [cullingRate.annual]);

  const expectedBirthsForecast = useMemo(
    () => getExpectedBirthsForecast(propertyId, { isPropertyId: true, monthsAhead: 9 }),
    [propertyId]
  );

  const expectedBirthsData = useMemo(() => {
    if (!expectedBirthsForecast.monthly || expectedBirthsForecast.monthly.length === 0) return [];
    return expectedBirthsForecast.monthly.map((item) => {
      const [year, month] = item.month.split("-");
      const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthName = format(monthDate, "MMM yyyy", { locale: dateLocale });
      return {
        month: monthName,
        expectedBirths: item.expectedBirths,
      };
    });
  }, [expectedBirthsForecast.monthly, dateLocale]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.reproductiveIndexes.fertilityRate.title}
            </h3>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {fertilityRate.rate.toFixed(2)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.reproductiveIndexes.fertilityRate.description}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.fertilityRate.pregnantCows}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {fertilityRate.pregnantCows}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.fertilityRate.exposedCows}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {fertilityRate.exposedCows}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.reproductiveIndexes.birthRate.title}
            </h3>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">👶</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {birthRate.rate.toFixed(2)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.reproductiveIndexes.birthRate.description}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.birthRate.calvesBorn}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {birthRate.calvesBorn}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.birthRate.pregnantFemales}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {birthRate.pregnantFemales}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.reproductiveIndexes.calvingInterval.title}
            </h3>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">⏱️</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {calvingInterval.average > 0
                ? `${Math.round(calvingInterval.average / 30)} ${t.reproductiveIndexes.calvingInterval.months}`
                : "-"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.reproductiveIndexes.calvingInterval.description}
            </p>
          </div>
          {calvingInterval.average > 0 && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {t.reproductiveIndexes.calvingInterval.min}:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {Math.round(calvingInterval.min / 30)}{" "}
                  {t.reproductiveIndexes.calvingInterval.months}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {t.reproductiveIndexes.calvingInterval.max}:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {Math.round(calvingInterval.max / 30)}{" "}
                  {t.reproductiveIndexes.calvingInterval.months}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {t.reproductiveIndexes.calvingInterval.animals}:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {calvingInterval.animalsWithIntervals}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.reproductiveIndexes.cullingRate.title}
            </h3>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">🔄</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {cullingRate.rate.toFixed(2)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.reproductiveIndexes.cullingRate.description}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.cullingRate.replacedFemales}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {cullingRate.replacedFemales}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.cullingRate.totalFemales}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {cullingRate.totalFemales}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.reproductiveIndexes.intrauterineMortality.title}
            </h3>
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">⚠️</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {intrauterineMortality.rate.toFixed(2)}%
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.reproductiveIndexes.intrauterineMortality.description}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.intrauterineMortality.pregnantCows}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {intrauterineMortality.pregnantCows}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.intrauterineMortality.cowsThatCalved}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {intrauterineMortality.cowsThatCalved}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.intrauterineMortality.losses}:
              </span>
              <span className="font-medium text-red-600 dark:text-red-400">
                {intrauterineMortality.losses}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.reproductiveIndexes.bullToCowRatio.title}
            </h3>
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">🐂</span>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {bullToCowRatio.ratio}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.reproductiveIndexes.bullToCowRatio.description}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.bullToCowRatio.bullsUsed}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {bullToCowRatio.bullsUsed}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t.reproductiveIndexes.bullToCowRatio.exposedCows}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {bullToCowRatio.exposedCows}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {monthlyBirthRateData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t.reproductiveIndexes.charts.monthlyBirthRate}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyBirthRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#3b82f6"
                  name={t.reproductiveIndexes.charts.birthRate}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {annualCullingRateData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t.reproductiveIndexes.charts.annualCullingRate}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={annualCullingRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar
                  dataKey="rate"
                  fill="#ef4444"
                  name={t.reproductiveIndexes.charts.cullingRate}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {expectedBirthsData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t.reproductiveIndexes.charts.expectedFutureBirths}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expectedBirthsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar
                dataKey="expectedBirths"
                fill="#10b981"
                name={t.reproductiveIndexes.charts.expectedBirths}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
