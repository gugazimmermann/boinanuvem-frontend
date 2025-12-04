import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { LineChartConfig } from "../line-chart-config";
import type { ChartColors } from "../../utils/chart-colors";

vi.mock("../chart-tooltip", () => ({
  getTooltipStyle: vi.fn(() => ({
    contentStyle: { backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "8px" },
    labelStyle: { color: "#000", fontSize: "12px", fontWeight: "bold" },
  })),
}));

describe("LineChartConfig", () => {
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
    { key: "sales", name: "Sales", color: "#3b82f6" },
    { key: "expenses", name: "Expenses", color: "#ef4444" },
  ];

  const defaultProps = {
    data: mockData,
    dataKeys: mockDataKeys,
    xAxisKey: "month",
    chartColors: mockChartColors,
    isDark: false,
  };

  it("should render without errors", () => {
    const { container } = render(<LineChartConfig {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it("should render with default height", () => {
    const { container } = render(<LineChartConfig {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it("should render with custom height", () => {
    const { container } = render(<LineChartConfig {...defaultProps} height={400} />);
    expect(container).toBeTruthy();
  });

  it("should render with yAxisLabel when provided", () => {
    const { container } = render(<LineChartConfig {...defaultProps} yAxisLabel="Amount ($)" />);
    expect(container).toBeTruthy();
  });

  it("should render without yAxisLabel when not provided", () => {
    const { container } = render(<LineChartConfig {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it("should render with yAxisFormatter when provided", () => {
    const yAxisFormatter = vi.fn((value: number) => `$${value}`);
    const { container } = render(
      <LineChartConfig {...defaultProps} yAxisFormatter={yAxisFormatter} />
    );
    expect(container).toBeTruthy();
  });

  it("should render with tooltipFormatter when provided", () => {
    const tooltipFormatter = vi.fn((value: number) => `$${value}`);
    const { container } = render(
      <LineChartConfig {...defaultProps} tooltipFormatter={tooltipFormatter} />
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
      <LineChartConfig {...defaultProps} chartColors={darkChartColors} isDark={true} />
    );
    expect(container).toBeTruthy();
  });
});
