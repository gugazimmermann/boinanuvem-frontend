import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "~/i18n";
import { translations } from "~/i18n/translations";
import { mockCompanies } from "~/mocks/companies";
import { getProperties } from "~/services/properties.service";
import type { Property } from "~/types";
import { getExpectedBirthsForecast } from "~/services/reproductive-indexes.service";
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ChartWrapper, getTooltipStyle, getChartColors, StatCard } from "~/components/dashboard";
import { useTheme } from "~/contexts/theme-context";
import { useDateLocale } from "~/hooks/use-date-locale";

const ALL_PROPERTIES_ID = "all";

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

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
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const chartColors = getChartColors(isDark);
  const tooltipStyle = getTooltipStyle(isDark);
  const company = mockCompanies[0];
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(ALL_PROPERTIES_ID);

  useEffect(() => {
    const fetchProperties = async () => {
      if (company) {
        try {
          const propertiesData = await getProperties();
          const filteredProperties = propertiesData.filter((prop) => prop.companyId === company.id);
          setProperties(filteredProperties);
          if (filteredProperties.length > 0 && selectedPropertyId === ALL_PROPERTIES_ID) {
            setSelectedPropertyId(ALL_PROPERTIES_ID);
          }
        } catch (error) {
          console.error("Failed to load properties:", error);
        }
      }
    };
    fetchProperties();
  }, [company, selectedPropertyId]);

  const dateLocale = useDateLocale();
  const [expectedBirthsForecast, setExpectedBirthsForecast] = useState<Awaited<
    ReturnType<typeof getExpectedBirthsForecast>
  > | null>(null);

  useEffect(() => {
    const loadExpectedBirthsForecast = async () => {
      try {
        let forecast: Awaited<ReturnType<typeof getExpectedBirthsForecast>>;
        if (selectedPropertyId === ALL_PROPERTIES_ID && company) {
          forecast = await getExpectedBirthsForecast(company.id, {
            isPropertyId: false,
            monthsAhead: 9,
          });
        } else if (selectedPropertyId && selectedPropertyId !== ALL_PROPERTIES_ID) {
          forecast = await getExpectedBirthsForecast(selectedPropertyId, {
            isPropertyId: true,
            monthsAhead: 9,
          });
        } else {
          forecast = { monthly: [], total: 0 };
        }
        setExpectedBirthsForecast(forecast);
      } catch (error) {
        console.error("Failed to load expected births forecast:", error);
        setExpectedBirthsForecast({ monthly: [], total: 0 });
      }
    };
    loadExpectedBirthsForecast();
  }, [selectedPropertyId, company]);

  const expectedBirthsData = useMemo(() => {
    if (!expectedBirthsForecast?.monthly || expectedBirthsForecast.monthly.length === 0) return [];
    return expectedBirthsForecast.monthly.map((item) => {
      const [year, month] = item.month.split("-");
      const monthDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1);
      const monthName = format(monthDate, "MMM yyyy", { locale: dateLocale });
      return {
        month: monthName,
        monthKey: item.month,
        expectedBirths: item.expectedBirths,
      };
    });
  }, [expectedBirthsForecast, dateLocale]);

  const summaryStats = useMemo(() => {
    if (expectedBirthsData.length === 0) {
      return {
        total: 0,
        average: 0,
        peakMonth: null as { month: string; count: number } | null,
        nextMonth: 0,
      };
    }

    const total = expectedBirthsForecast?.total || 0;
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
  }, [expectedBirthsData, expectedBirthsForecast]);

  if (properties.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t.birthForecast.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t.birthForecast.emptyState.description}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {t.birthForecast.title}
        </h1>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
          Filtros
        </h3>
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

      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Resumo</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t.birthForecast.summary.total}
            value={summaryStats.total}
            subtitle={t.birthForecast.summary.totalDescription}
            icon={<span className="text-lg">📊</span>}
          />

          <StatCard
            title={t.birthForecast.summary.nextMonth}
            value={summaryStats.nextMonth}
            subtitle={t.birthForecast.summary.nextMonthDescription}
            icon={<span className="text-lg">📅</span>}
          />

          <StatCard
            title={t.birthForecast.summary.average}
            value={summaryStats.average}
            subtitle={t.birthForecast.summary.averageDescription}
            icon={<span className="text-lg">📈</span>}
          />

          <StatCard
            title={t.birthForecast.summary.peakMonth}
            value={summaryStats.peakMonth ? summaryStats.peakMonth.count : "-"}
            subtitle={summaryStats.peakMonth ? summaryStats.peakMonth.month : ""}
            icon={<span className="text-lg">🔺</span>}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-green-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t.birthForecast.chart.title}
          </h2>
        </div>
        <ChartWrapper
          title=""
          isEmpty={expectedBirthsData.length === 0}
          emptyMessage={t.birthForecast.emptyState.noData}
          height={400}
        >
          <BarChart data={expectedBirthsData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
            <XAxis dataKey="month" tick={{ fill: chartColors.text, fontSize: 12 }} />
            <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: "12px", color: chartColors.text }} />
            <Bar
              dataKey="expectedBirths"
              fill={chartColors.income}
              name={t.birthForecast.chart.expectedBirths}
            />
          </BarChart>
        </ChartWrapper>
      </div>
    </div>
  );
}
