import type { PasturePlanningMonth } from "~/types/property";
import { useTranslation } from "~/i18n";
import { useTheme } from "~/contexts/theme-context";
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
  data: PasturePlanningMonth[];
}

const CLASSIFICATION_COLORS = {
  Poor: "oklch(60% 0.2 25)", // Red
  Medium: "oklch(70% 0.2 80)", // Yellow/Orange
  Good: "oklch(65% 0.2 150)", // Green
  Excellent: "oklch(60% 0.25 180)", // Blue
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

export function PasturePlanningGraph({ data }: PasturePlanningGraphProps) {
  const t = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">{t.properties.details.pasturePlanning.noData}</p>
      </div>
    );
  }

  // Height mapping for classification bars: Excellent (largest) -> Poor (smallest)
  const classificationHeightMap: Record<string, number> = {
    Excellent: 4,
    Good: 3,
    Medium: 2,
    Poor: 1,
  };

  // Transform data for the chart
  const chartData = data.map((d) => ({
    month: monthMap[d.month] || d.month.substring(0, 3),
    min: d.min,
    max: d.max,
    precipitation: d.precipitation,
    classification: d.classification,
    classificationHeight: classificationHeightMap[d.classification] || 1,
  }));

  const textColor = isDark ? "#e5e7eb" : "#374151";
  const gridColor = isDark ? "#374151" : "#e5e7eb";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">
        {t.properties.details.pasturePlanning.title}
      </h2>
      
      <div className="w-full">
        <ResponsiveContainer width="100%" height={450}>
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.3} />
            <XAxis
              dataKey="month"
              tick={{ fill: textColor, fontSize: 12 }}
              label={{
                value: t.properties.details.pasturePlanning.month,
                position: "insideBottom",
                offset: -10,
                style: { textAnchor: "middle", fill: textColor, fontSize: 12 },
              }}
            />
            <YAxis
              yAxisId="temp"
              orientation="left"
              tick={{ fill: textColor, fontSize: 12 }}
              label={{
                value: t.properties.details.pasturePlanning.temperature,
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle", fill: textColor, fontSize: 12 },
              }}
            />
            <YAxis
              yAxisId="precip"
              orientation="right"
              tick={{ fill: textColor, fontSize: 12 }}
              label={{
                value: t.properties.details.pasturePlanning.precipitation,
                angle: 90,
                position: "insideRight",
                style: { textAnchor: "middle", fill: textColor, fontSize: 12 },
              }}
            />
            <YAxis
              yAxisId="classification"
              orientation="right"
              hide={true}
              domain={[0, 5]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1f2937" : "#ffffff",
                border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                borderRadius: "8px",
                color: textColor,
              }}
              labelStyle={{ color: textColor, fontWeight: "bold" }}
              formatter={(value: number | string, name: string, props: any) => {
                if (name === t.properties.details.pasturePlanning.forage || name === "classificationHeight") {
                  const classification = props.payload.classification;
                  return [
                    t.properties.details.pasturePlanning.classification[classification as keyof typeof t.properties.details.pasturePlanning.classification] || classification,
                    t.properties.details.pasturePlanning.forage,
                  ];
                }
                return [value, name];
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="line"
              formatter={(value) => (
                <span style={{ color: textColor, fontSize: "12px" }}>{value}</span>
              )}
            />
            <Area
              yAxisId="precip"
              type="monotone"
              dataKey="precipitation"
              fill={isDark ? "oklch(60% 0.2 240)" : "oklch(70% 0.2 240)"}
              fillOpacity={0.4}
              stroke={isDark ? "oklch(60% 0.2 240)" : "oklch(70% 0.2 240)"}
              strokeWidth={2}
              name={t.properties.details.pasturePlanning.precip}
            />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="min"
              stroke={isDark ? "oklch(50% 0.2 250)" : "oklch(60% 0.2 250)"}
              strokeWidth={2}
              dot={{ fill: isDark ? "oklch(50% 0.2 250)" : "oklch(60% 0.2 250)", r: 4 }}
              name={t.properties.details.pasturePlanning.minTemp}
            />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="max"
              stroke={isDark ? "oklch(50% 0.2 30)" : "oklch(60% 0.2 30)"}
              strokeWidth={2}
              dot={{ fill: isDark ? "oklch(50% 0.2 30)" : "oklch(60% 0.2 30)", r: 4 }}
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
              {chartData.map((entry, index) => {
                const color = isDark
                  ? CLASSIFICATION_COLORS_DARK[entry.classification as keyof typeof CLASSIFICATION_COLORS_DARK]
                  : CLASSIFICATION_COLORS[entry.classification as keyof typeof CLASSIFICATION_COLORS];
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
              <LabelList
                dataKey="classification"
                position="insideBottom"
                formatter={(value: string) => {
                  const translated = t.properties.details.pasturePlanning.classification[value as keyof typeof t.properties.details.pasturePlanning.classification] || value;
                  // Show abbreviated version for better fit
                  return translated.length > 6 ? translated.substring(0, 4) : translated;
                }}
                style={{ fill: isDark ? "#ffffff" : "#000000", fontSize: 9, fontWeight: "bold" }}
              />
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
