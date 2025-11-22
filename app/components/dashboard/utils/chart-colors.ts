export interface ChartColors {
  income: string;
  expense: string;
  net: string;
  weight: string;
  paid: string;
  unpaid: string;
  overdue: string;
  partial: string;
  grid: string;
  text: string;
  background: string;
  border: string;
}

export const getChartColors = (isDark: boolean): ChartColors => {
  if (isDark) {
    return {
      income: "#10b981",
      expense: "#ef4444",
      net: "#3b82f6",
      weight: "#3b82f6",
      paid: "#10b981",
      unpaid: "#f59e0b",
      overdue: "#ef4444",
      partial: "#6366f1",
      grid: "#374151",
      text: "#9ca3af",
      background: "#1f2937",
      border: "#374151",
    };
  }
  return {
    income: "#059669",
    expense: "#dc2626",
    net: "#2563eb",
    weight: "#2563eb",
    paid: "#059669",
    unpaid: "#d97706",
    overdue: "#dc2626",
    partial: "#4f46e5",
    grid: "#e5e7eb",
    text: "#6b7280",
    background: "#ffffff",
    border: "#e5e7eb",
  };
};

export const getPieChartColors = (colors: ChartColors): string[] => {
  return [colors.paid, colors.unpaid, colors.overdue, colors.partial];
};
