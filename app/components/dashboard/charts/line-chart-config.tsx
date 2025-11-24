import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import type { ChartColors } from "../utils/chart-colors";
import { getTooltipStyle } from "./chart-tooltip";

interface LineChartConfigProps {
  data: Array<Record<string, unknown>>;
  dataKeys: Array<{
    key: string;
    name: string;
    color: string;
  }>;
  xAxisKey: string;
  yAxisLabel?: string;
  yAxisFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number) => string | [string, string];
  chartColors: ChartColors;
  isDark: boolean;
  height?: number;
}

export function LineChartConfig({
  data,
  dataKeys,
  xAxisKey,
  yAxisLabel,
  yAxisFormatter,
  tooltipFormatter,
  chartColors,
  isDark,
  height = 300,
}: LineChartConfigProps) {
  return (
    <LineChart data={data} height={height}>
      <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} opacity={0.3} />
      <XAxis dataKey={xAxisKey} tick={{ fill: chartColors.text, fontSize: 12 }} />
      <YAxis
        tick={{ fill: chartColors.text, fontSize: 12 }}
        tickFormatter={yAxisFormatter}
        label={
          yAxisLabel
            ? {
                value: yAxisLabel,
                angle: -90,
                position: "insideLeft",
                style: { fill: chartColors.text, fontSize: "12px" },
              }
            : undefined
        }
      />
      <Tooltip {...getTooltipStyle(isDark)} formatter={tooltipFormatter} />
      <Legend wrapperStyle={{ fontSize: "12px", color: chartColors.text }} />
      {dataKeys.map(({ key, name, color }) => (
        <Line
          key={key}
          type="monotone"
          dataKey={key}
          stroke={color}
          strokeWidth={2}
          name={name}
          dot={{ fill: color, r: 4 }}
        />
      ))}
    </LineChart>
  );
}
