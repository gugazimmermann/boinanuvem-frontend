import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import type { ChartColors } from "../utils/chart-colors";
import { getTooltipStyle } from "./chart-tooltip";

interface LineChartConfigProps {
  readonly data: Array<Record<string, unknown>>;
  readonly dataKeys: Array<{
    readonly key: string;
    readonly name: string;
    readonly color: string;
  }>;
  readonly xAxisKey: string;
  readonly yAxisLabel?: string;
  readonly yAxisFormatter?: (value: number) => string;
  readonly tooltipFormatter?: (value: number) => string | [string, string];
  readonly chartColors: ChartColors;
  readonly isDark: boolean;
  readonly height?: number;
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
