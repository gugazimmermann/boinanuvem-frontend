import { useNavigate } from "react-router";
import { useMemo } from "react";
import type { PasturePlanningMonth } from "~/types/property";
import { useTranslation } from "~/i18n";
import { useTheme } from "~/contexts/theme-context";
import { Button } from "./button";
import { getPropertyPasturePlanningEditRoute } from "~/routes.config";
import {
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

interface PasturePlanningGraphProps {
  readonly data: PasturePlanningMonth[];
  readonly propertyId: string;
  readonly isModifiedByUser?: boolean;
}

const CLASSIFICATION_COLORS = {
  Poor: "oklch(60% 0.2 25)",
  Medium: "oklch(70% 0.2 80)",
  Good: "oklch(65% 0.2 150)",
  Excellent: "oklch(60% 0.25 180)",
} as const;

const CLASSIFICATION_COLORS_DARK = {
  Poor: "oklch(50% 0.2 25)",
  Medium: "oklch(60% 0.2 80)",
  Good: "oklch(55% 0.2 150)",
  Excellent: "oklch(50% 0.25 180)",
} as const;

const monthMap: Record<string, string> = {
  January: "Jan",
  February: "Fev",
  March: "Mar",
  April: "Abr",
  May: "Mai",
  June: "Jun",
  July: "Jul",
  August: "Ago",
  September: "Set",
  October: "Out",
  November: "Nov",
  December: "Dez",
};

function getLegendFormatter(textColor: string) {
  const LegendFormatter = (value: string) => (
    <span style={{ color: textColor, fontSize: "12px" }}>{value}</span>
  );
  LegendFormatter.displayName = "LegendFormatter";
  return LegendFormatter;
}

// Helper function to get chart colors based on theme
function getChartColors(isDark: boolean) {
  return {
    precip: {
      fill: isDark ? "oklch(60% 0.2 240)" : "oklch(70% 0.2 240)",
      stroke: isDark ? "oklch(60% 0.2 240)" : "oklch(70% 0.2 240)",
    },
    minTemp: {
      stroke: isDark ? "oklch(50% 0.2 250)" : "oklch(60% 0.2 250)",
      dot: isDark ? "oklch(50% 0.2 250)" : "oklch(60% 0.2 250)",
    },
    maxTemp: {
      stroke: isDark ? "oklch(50% 0.2 30)" : "oklch(60% 0.2 30)",
      dot: isDark ? "oklch(50% 0.2 30)" : "oklch(60% 0.2 30)",
    },
    text: isDark ? "#ffffff" : "#000000",
  };
}

// Helper function to get axis configuration
function getAxisConfig(textColor: string, t: ReturnType<typeof useTranslation>) {
  return {
    xAxis: {
      tick: { fill: textColor, fontSize: 12 },
      label: {
        value: t.properties.details.pasturePlanning.month,
        position: "insideBottom" as const,
        offset: -10,
        style: { textAnchor: "middle", fill: textColor, fontSize: 12 },
      },
    },
    yAxisTemp: {
      tick: { fill: textColor, fontSize: 12 },
      label: {
        value: t.properties.details.pasturePlanning.temperature,
        angle: -90,
        position: "insideLeft" as const,
        style: { textAnchor: "middle", fill: textColor, fontSize: 12 },
      },
    },
    yAxisPrecip: {
      tick: { fill: textColor, fontSize: 12 },
      label: {
        value: t.properties.details.pasturePlanning.precipitation,
        angle: 90,
        position: "insideRight" as const,
        style: { textAnchor: "middle", fill: textColor, fontSize: 12 },
      },
    },
  };
}

// Helper function to get tooltip formatter
function createTooltipFormatter(
  t: ReturnType<typeof useTranslation>
): (
  value: number | string,
  name: string,
  props: { payload?: { classification?: string } }
) => [string | number, string] {
  return (
    value: number | string,
    name: string,
    props: { payload?: { classification?: string } }
  ) => {
    if (name === t.properties.details.pasturePlanning.forage || name === "classificationHeight") {
      const classification = props.payload?.classification;
      return [
        t.properties.details.pasturePlanning.classification[
          classification as keyof typeof t.properties.details.pasturePlanning.classification
        ] || classification,
        t.properties.details.pasturePlanning.forage,
      ];
    }
    return [value, name];
  };
}

// Helper function to get bar cell color for light theme
function getBarCellColorLight(classification: string): string {
  return (
    CLASSIFICATION_COLORS[classification as keyof typeof CLASSIFICATION_COLORS] ||
    CLASSIFICATION_COLORS.Poor
  );
}

// Helper function to get bar cell color for dark theme
function getBarCellColorDark(classification: string): string {
  return (
    CLASSIFICATION_COLORS_DARK[classification as keyof typeof CLASSIFICATION_COLORS_DARK] ||
    CLASSIFICATION_COLORS_DARK.Poor
  );
}

// Helper function to create label list formatter
function createLabelListFormatter(
  t: ReturnType<typeof useTranslation>,
  _isDark: boolean
): (value: string | number | boolean | null | undefined) => string {
  return (value: string | number | boolean | null | undefined) => {
    if (value === undefined || value === null || value === false) return "";
    // If value is a number, return empty string
    if (typeof value === "number") return "";
    const stringValue = String(value);
    if (!stringValue) return "";
    // Check if it's a valid classification key before translating
    const validClassifications = ["Poor", "Medium", "Good", "Excellent"];
    if (!validClassifications.includes(stringValue)) return "";
    const translated =
      t.properties.details.pasturePlanning.classification[
        stringValue as keyof typeof t.properties.details.pasturePlanning.classification
      ] || stringValue;
    return translated.length > 6 ? translated.substring(0, 4) : translated;
  };
}

// Helper function to transform chart data
function transformChartData(
  data: PasturePlanningMonth[],
  classificationHeightMap: Record<string, number>
): Array<{
  month: string;
  min: number;
  max: number;
  precipitation: number;
  classification: string;
  classificationHeight: number;
}> {
  return (data ?? []).map((d) => ({
    month: monthMap[d.month] || d.month.substring(0, 3),
    min: d.min,
    max: d.max,
    precipitation: d.precipitation,
    classification: d.classification,
    classificationHeight: classificationHeightMap[d.classification] || 1,
  }));
}

export function PasturePlanningGraph({
  data,
  propertyId,
  isModifiedByUser = false,
}: PasturePlanningGraphProps) {
  const t = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const isEmpty = !data || data.length === 0;

  const chartData = useMemo(() => {
    const classificationHeightMap: Record<string, number> = {
      Excellent: 4,
      Good: 3,
      Medium: 2,
      Poor: 1,
    };
    return transformChartData(data, classificationHeightMap);
  }, [data]);

  const textColor = isDark ? "#e5e7eb" : "#374151";
  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const chartColors = useMemo(() => getChartColors(isDark), [isDark]);
  const axisConfig = useMemo(() => getAxisConfig(textColor, t), [textColor, t]);
  const tooltipFormatter = useMemo(() => createTooltipFormatter(t), [t]);
  const labelListFormatter = useMemo(() => createLabelListFormatter(t, isDark), [t, isDark]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {t.properties.details.pasturePlanning.title}
          </h2>
          {!isModifiedByUser && !isEmpty && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {t.properties.details.pasturePlanning.aiGeneratedNote}
              </p>
            </div>
          )}
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate(getPropertyPasturePlanningEditRoute(propertyId))}
          className="ml-4"
        >
          {t.properties.edit.title.split(" ")[0]}
        </Button>
      </div>

      {isEmpty ? (
        <p className="text-gray-600 dark:text-gray-400">
          {t.properties.details.pasturePlanning.noData}
        </p>
      ) : (
        <div className="w-full">
          <ResponsiveContainer width="100%" height={450}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.3} />
              <XAxis dataKey="month" tick={axisConfig.xAxis.tick} label={axisConfig.xAxis.label} />
              <YAxis
                yAxisId="temp"
                orientation="left"
                tick={axisConfig.yAxisTemp.tick}
                label={axisConfig.yAxisTemp.label}
              />
              <YAxis
                yAxisId="precip"
                orientation="right"
                tick={axisConfig.yAxisPrecip.tick}
                label={axisConfig.yAxisPrecip.label}
              />
              <YAxis yAxisId="classification" orientation="right" hide={true} domain={[0, 5]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                  borderRadius: "8px",
                  color: textColor,
                }}
                labelStyle={{ color: textColor, fontWeight: "bold" }}
                formatter={tooltipFormatter}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="line"
                formatter={getLegendFormatter(textColor)}
              />
              <Area
                yAxisId="precip"
                type="monotone"
                dataKey="precipitation"
                fill={chartColors.precip.fill}
                fillOpacity={0.4}
                stroke={chartColors.precip.stroke}
                strokeWidth={2}
                name={t.properties.details.pasturePlanning.precip}
              />
              <Line
                yAxisId="temp"
                type="monotone"
                dataKey="min"
                stroke={chartColors.minTemp.stroke}
                strokeWidth={2}
                dot={{ fill: chartColors.minTemp.dot, r: 4 }}
                name={t.properties.details.pasturePlanning.minTemp}
              />
              <Line
                yAxisId="temp"
                type="monotone"
                dataKey="max"
                stroke={chartColors.maxTemp.stroke}
                strokeWidth={2}
                dot={{ fill: chartColors.maxTemp.dot, r: 4 }}
                name={t.properties.details.pasturePlanning.maxTemp}
              />
              <Bar
                yAxisId="classification"
                dataKey="classificationHeight"
                barSize={30}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
                name={t.properties.details.pasturePlanning.forage}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.month}`}
                    fill={
                      isDark
                        ? getBarCellColorDark(entry.classification)
                        : getBarCellColorLight(entry.classification)
                    }
                  />
                ))}
                <LabelList
                  dataKey="classification"
                  position="insideBottom"
                  formatter={labelListFormatter}
                  style={{ fill: chartColors.text, fontSize: 9, fontWeight: "bold" }}
                />
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
