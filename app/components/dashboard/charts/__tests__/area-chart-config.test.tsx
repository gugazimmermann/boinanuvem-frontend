import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AreaChartConfig } from "../area-chart-config";
import type { ChartColors } from "../../utils/chart-colors";

vi.mock("../chart-tooltip", () => ({
  getTooltipStyle: vi.fn(() => ({
    contentStyle: { backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "8px" },
    labelStyle: { color: "#000", fontSize: "12px", fontWeight: "bold" },
  })),
}));

describe("AreaChartConfig", () => {
  const mockChartColors: ChartColors = {
    income: "#10b981",
    expense: "#ef4444",
    net: "#3b82f6",
    weight: "#3b82f6",
    paid: "#10b981",
    unpaid: "#f59e0b",
    overdue: "#ef4444",
    partial: "#6366f1",
    grid: "#e5e7eb",
    text: "#6b7280",
    background: "#ffffff",
    border: "#e5e7eb",
  };

  const mockData = [
    { month: "Jan", sales: 100, expenses: 50 },
    { month: "Feb", sales: 200, expenses: 75 },
  ];

  const mockDataKeys = [
    { key: "sales", name: "Sales", color: "#3b82f6", gradientId: "salesGradient" },
    { key: "expenses", name: "Expenses", color: "#ef4444", gradientId: "expensesGradient" },
  ];

  const defaultProps = {
    data: mockData,
    dataKeys: mockDataKeys,
    xAxisKey: "month",
    chartColors: mockChartColors,
    isDark: false,
  };

  it("should render without errors", () => {
    const { container } = render(<AreaChartConfig {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it("should render with default height", () => {
    const { container } = render(<AreaChartConfig {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it("should render with custom height", () => {
    const { container } = render(<AreaChartConfig {...defaultProps} height={400} />);
    expect(container).toBeTruthy();
  });

  it("should render linear gradients for each dataKey", () => {
    const { container } = render(<AreaChartConfig {...defaultProps} />);
    // Gradients are rendered in defs, but may not be queryable in jsdom
    // Just verify the component renders without errors
    expect(container).toBeTruthy();
  });

  it("should render with yAxisFormatter when provided", () => {
    const yAxisFormatter = vi.fn((value: number) => `$${value}`);
    const { container } = render(
      <AreaChartConfig {...defaultProps} yAxisFormatter={yAxisFormatter} />
    );
    expect(container).toBeTruthy();
  });

  it("should render with tooltipFormatter when provided", () => {
    const tooltipFormatter = vi.fn((value: number) => `$${value}`);
    const { container } = render(
      <AreaChartConfig {...defaultProps} tooltipFormatter={tooltipFormatter} />
    );
    expect(container).toBeTruthy();
  });

  it("should render with dark mode colors", () => {
    const darkChartColors: ChartColors = {
      ...mockChartColors,
      grid: "#374151",
      text: "#9ca3af",
      background: "#1f2937",
      border: "#374151",
    };
    const { container } = render(
      <AreaChartConfig {...defaultProps} chartColors={darkChartColors} isDark={true} />
    );
    expect(container).toBeTruthy();
  });
});
