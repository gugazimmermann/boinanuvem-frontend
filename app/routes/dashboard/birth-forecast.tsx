import { useState, useMemo } from "react";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { translations } from "~/i18n/translations";
import { mockCompanies } from "~/mocks/companies";
import { getPropertiesByCompanyId } from "~/services/properties.service";
import { getExpectedBirthsForecast } from "~/services/reproductive-indexes.service";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { enUS } from "date-fns/locale/en-US";
import { es } from "date-fns/locale/es";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ALL_PROPERTIES_ID = "all";

export function meta() {
  const t = translations.pt;
  return [
    { title: t.birthForecast.meta.title },
    {
      name: "description",
      content: t.birthForecast.meta.description,
    },
  ];
}

export default function BirthForecastPage() {
  const t = useTranslation();
  const { language } = useLanguage();
  const company = mockCompanies[0];
  const properties = company ? getPropertiesByCompanyId(company.id) : [];
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    properties.length > 0 ? ALL_PROPERTIES_ID : ""
  );

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
      const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthName = format(monthDate, "MMM yyyy", { locale: dateLocale });
      return {
        month: monthName,
        monthKey: item.month,
        expectedBirths: item.expectedBirths,
      };
    });
  }, [expectedBirthsForecast.monthly, dateLocale]);

  const summaryStats = useMemo(() => {
    if (expectedBirthsData.length === 0) {
      return {
        total: 0,
        average: 0,
        peakMonth: null as { month: string; count: number } | null,
        nextMonth: 0,
      };
    }

    const total = expectedBirthsForecast.total;
    const average = total / expectedBirthsData.length;
    const peakMonth = expectedBirthsData.reduce(
      (max, item) => (item.expectedBirths > max.expectedBirths ? item : max),
      expectedBirthsData[0]
    );

    const today = new Date();
    const nextMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 2).padStart(2, "0")}`;
    const nextMonth = expectedBirthsData.find((item) => item.monthKey === nextMonthKey);

    return {
      total,
      average: Math.round(average * 10) / 10,
      peakMonth: {
        month: peakMonth.month,
        count: peakMonth.expectedBirths,
      },
      nextMonth: nextMonth?.expectedBirths || 0,
    };
  }, [expectedBirthsData, expectedBirthsForecast.total]);

  if (properties.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t.birthForecast.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t.birthForecast.emptyState.description}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.birthForecast.propertyLabel}
            </label>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={ALL_PROPERTIES_ID}>{t.birthForecast.allProperties}</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.birthForecast.summary.total}
            </h3>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {summaryStats.total}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t.birthForecast.summary.totalDescription}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.birthForecast.summary.nextMonth}
            </h3>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">📅</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {summaryStats.nextMonth}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t.birthForecast.summary.nextMonthDescription}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.birthForecast.summary.average}
            </h3>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">📈</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {summaryStats.average}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t.birthForecast.summary.averageDescription}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.birthForecast.summary.peakMonth}
            </h3>
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <span className="text-lg">🔺</span>
            </div>
          </div>
          {summaryStats.peakMonth ? (
            <>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {summaryStats.peakMonth.count}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">
                {summaryStats.peakMonth.month}
              </p>
            </>
          ) : (
            <p className="text-lg text-gray-500 dark:text-gray-400">-</p>
          )}
        </div>
      </div>

      {expectedBirthsData.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t.birthForecast.chart.title}
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={expectedBirthsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar
                dataKey="expectedBirths"
                fill="#10b981"
                name={t.birthForecast.chart.expectedBirths}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            {t.birthForecast.emptyState.noData}
          </p>
        </div>
      )}
    </div>
  );
}
