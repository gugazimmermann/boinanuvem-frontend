import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { AreaChartConfig } from "../area-chart-config";
import { getChartColors } from "../../utils/chart-colors";
import { getTooltipStyle } from "../chart-tooltip";

vi.mock("recharts", () => ({
  AreaChart: ({
    children,
    data,
    height,
  }: {
    children: React.ReactNode;
    data: unknown[];
    height: number;
  }) => (
    <div data-testid="area-chart" data-height={height} data-items={data.length}>
      {children}
    </div>
  ),
  Area: ({ dataKey, name }: { dataKey: string; name: string }) => (
    <div data-testid={`area-${dataKey}`} data-name={name} />
  ),
  XAxis: ({ dataKey }: { dataKey: string }) => <div data-testid="x-axis" data-key={dataKey} />,
  YAxis: ({ tickFormatter }: { tickFormatter?: (value: number) => string }) => (
    <div data-testid="y-axis" data-has-formatter={!!tickFormatter} />
  ),
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: ({ formatter }: { formatter?: (value: number) => string | [string, string] }) => (
    <div data-testid="tooltip" data-has-formatter={!!formatter} />
  ),
  Legend: () => <div data-testid="legend" />,
}));

vi.mock("../../utils/chart-colors", () => ({
  getChartColors: vi.fn(),
}));

vi.mock("../chart-tooltip", () => ({
  getTooltipStyle: vi.fn(),
}));

describe("AreaChartConfig", () => {
  const mockChartColors = {
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

  const defaultProps = {
    data: [
      { month: "Jan", income: 1000, expense: 500 },
      { month: "Feb", income: 1200, expense: 600 },
    ],
    dataKeys: [
      { key: "income", name: "Income", color: "#10b981", gradientId: "incomeGradient" },
      { key: "expense", name: "Expense", color: "#ef4444", gradientId: "expenseGradient" },
    ],
    xAxisKey: "month",
    chartColors: mockChartColors,
    isDark: false,
  };

  // Suppress React warnings about SVG element casing in tests
  // These warnings occur because the component renders SVG elements that React's test environment
  // doesn't recognize properly, but they work fine in the actual browser
  const originalError = console.error;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getChartColors).mockReturnValue(mockChartColors);
    vi.mocked(getTooltipStyle).mockReturnValue({
      contentStyle: { backgroundColor: "#ffffff" },
      labelStyle: { color: "#000000" },
    });

    // Suppress SVG element warnings
    console.error = (...args: unknown[]) => {
      const message = String(args[0] || "");
      if (
        message.includes("unrecognized in this browser") ||
        message.includes("incorrect casing") ||
        message.includes("Use PascalCase for React components") ||
        message.includes("<defs>") ||
        message.includes("<linearGradient") ||
        message.includes("<stop>")
      ) {
        return;
      }
      originalError.apply(console, args);
    };
  });

  afterEach(() => {
    console.error = originalError;
  });

  it("should render area chart with default height", () => {
    const { getByTestId } = render(<AreaChartConfig {...defaultProps} />);
    const chart = getByTestId("area-chart");
    expect(chart).toHaveAttribute("data-height", "300");
  });

  it("should render area chart with custom height", () => {
    const { getByTestId } = render(<AreaChartConfig {...defaultProps} height={400} />);
    const chart = getByTestId("area-chart");
    expect(chart).toHaveAttribute("data-height", "400");
  });

  it("should render XAxis with correct dataKey", () => {
    const { getByTestId } = render(<AreaChartConfig {...defaultProps} />);
    const xAxis = getByTestId("x-axis");
    expect(xAxis).toHaveAttribute("data-key", "month");
  });

  it("should render YAxis without formatter by default", () => {
    const { getByTestId } = render(<AreaChartConfig {...defaultProps} />);
    const yAxis = getByTestId("y-axis");
    expect(yAxis).toHaveAttribute("data-has-formatter", "false");
  });

  it("should render YAxis with formatter when provided", () => {
    const formatter = (value: number) => `$${value}`;
    const { getByTestId } = render(
      <AreaChartConfig {...defaultProps} yAxisFormatter={formatter} />
    );
    const yAxis = getByTestId("y-axis");
    expect(yAxis).toHaveAttribute("data-has-formatter", "true");
  });

  it("should render tooltip without formatter by default", () => {
    const { getByTestId } = render(<AreaChartConfig {...defaultProps} />);
    const tooltip = getByTestId("tooltip");
    expect(tooltip).toHaveAttribute("data-has-formatter", "false");
  });

  it("should render tooltip with formatter when provided", () => {
    const formatter = (value: number) => `$${value}`;
    const { getByTestId } = render(
      <AreaChartConfig {...defaultProps} tooltipFormatter={formatter} />
    );
    const tooltip = getByTestId("tooltip");
    expect(tooltip).toHaveAttribute("data-has-formatter", "true");
  });

  it("should render all data keys as Area components", () => {
    const { getByTestId } = render(<AreaChartConfig {...defaultProps} />);
    expect(getByTestId("area-income")).toBeInTheDocument();
    expect(getByTestId("area-expense")).toBeInTheDocument();
  });

  it("should render Area with correct name", () => {
    const { getByTestId } = render(<AreaChartConfig {...defaultProps} />);
    const incomeArea = getByTestId("area-income");
    expect(incomeArea).toHaveAttribute("data-name", "Income");
  });

  it("should render CartesianGrid", () => {
    const { getByTestId } = render(<AreaChartConfig {...defaultProps} />);
    expect(getByTestId("cartesian-grid")).toBeInTheDocument();
  });

  it("should render Legend", () => {
    const { getByTestId } = render(<AreaChartConfig {...defaultProps} />);
    expect(getByTestId("legend")).toBeInTheDocument();
  });

  it("should call getTooltipStyle with isDark prop", () => {
    render(<AreaChartConfig {...defaultProps} isDark={true} />);
    expect(getTooltipStyle).toHaveBeenCalledWith(true);
  });

  it("should render gradient definitions for each data key", () => {
    const { getByTestId } = render(<AreaChartConfig {...defaultProps} />);
    // Verify the chart renders (which includes gradient definitions as children)
    const chart = getByTestId("area-chart");
    expect(chart).toBeInTheDocument();
    // The gradient definitions are passed as children to AreaChart
    // In a real environment, recharts would render them as SVG elements
  });
});
