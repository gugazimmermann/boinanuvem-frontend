import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import type { ChartColors } from "../utils/chart-colors";
import { getTooltipStyle } from "./chart-tooltip";

interface AreaChartConfigProps {
  data: Array<Record<string, unknown>>;
  dataKeys: Array<{
    key: string;
    name: string;
    color: string;
    gradientId: string;
  }>;
  xAxisKey: string;
  yAxisFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number) => string | [string, string];
  chartColors: ChartColors;
  isDark: boolean;
  height?: number;
}

export function AreaChartConfig({
  data,
  dataKeys,
  xAxisKey,
  yAxisFormatter,
  tooltipFormatter,
  chartColors,
  isDark,
  height = 300,
}: AreaChartConfigProps) {
  return (
    <AreaChart data={data} height={height}>
      <defs>
        {dataKeys.map(({ gradientId, color }) => (
          <linearGradient key={gradientId} id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.8} />
            <stop offset="95%" stopColor={color} stopOpacity={0.1} />
          </linearGradient>
        ))}
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
      <XAxis dataKey={xAxisKey} tick={{ fill: chartColors.text, fontSize: 12 }} />
      <YAxis tick={{ fill: chartColors.text, fontSize: 12 }} tickFormatter={yAxisFormatter} />
      <Tooltip {...getTooltipStyle(isDark)} formatter={tooltipFormatter} />
      <Legend wrapperStyle={{ fontSize: "12px", color: chartColors.text }} />
      {dataKeys.map(({ key, name, color, gradientId }) => (
        <Area
          key={key}
          type="monotone"
          dataKey={key}
          stroke={color}
          fillOpacity={1}
          fill={`url(#${gradientId})`}
          name={name}
        />
      ))}
    </AreaChart>
  );
}
