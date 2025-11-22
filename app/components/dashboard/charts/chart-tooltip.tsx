import { getChartColors } from "../utils/chart-colors";

export function getTooltipStyle(isDark: boolean) {
  const colors = getChartColors(isDark);
  return {
    contentStyle: {
      backgroundColor: colors.background,
      border: `1px solid ${colors.border}`,
      borderRadius: "8px",
    },
    labelStyle: {
      color: colors.text,
      fontSize: "12px",
      fontWeight: "bold" as const,
    },
  };
}
