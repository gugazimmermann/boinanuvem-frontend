import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { LineChartConfig } from "../line-chart-config";
import { getChartColors } from "../../utils/chart-colors";
import { getTooltipStyle } from "../chart-tooltip";

vi.mock("recharts", () => ({
  LineChart: ({
    children,
    data,
    height,
  }: {
    children: React.ReactNode;
    data: unknown[];
    height: number;
  }) => (
    <div data-testid="line-chart" data-height={height} data-items={data.length}>
      {children}
    </div>
  ),
  Line: ({ dataKey, name }: { dataKey: string; name: string }) => (
    <div data-testid={`line-${dataKey}`} data-name={name} />
  ),
  XAxis: ({ dataKey }: { dataKey: string }) => <div data-testid="x-axis" data-key={dataKey} />,
  YAxis: ({
    tickFormatter,
    label,
  }: {
    tickFormatter?: (value: number) => string;
    label?: unknown;
  }) => <div data-testid="y-axis" data-has-formatter={!!tickFormatter} data-has-label={!!label} />,
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

describe("LineChartConfig", () => {
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
      { month: "Jan", sales: 1000, revenue: 2000 },
      { month: "Feb", sales: 1200, revenue: 2400 },
    ],
    dataKeys: [
      { key: "sales", name: "Sales", color: "#10b981" },
      { key: "revenue", name: "Revenue", color: "#3b82f6" },
    ],
    xAxisKey: "month",
    chartColors: mockChartColors,
    isDark: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getChartColors).mockReturnValue(mockChartColors);
    vi.mocked(getTooltipStyle).mockReturnValue({
      contentStyle: { backgroundColor: "#ffffff" },
      labelStyle: { color: "#000000" },
    });
  });

  it("should render line chart with default height", () => {
    const { getByTestId } = render(<LineChartConfig {...defaultProps} />);
    const chart = getByTestId("line-chart");
    expect(chart).toHaveAttribute("data-height", "300");
  });

  it("should render line chart with custom height", () => {
    const { getByTestId } = render(<LineChartConfig {...defaultProps} height={400} />);
    const chart = getByTestId("line-chart");
    expect(chart).toHaveAttribute("data-height", "400");
  });

  it("should render XAxis with correct dataKey", () => {
    const { getByTestId } = render(<LineChartConfig {...defaultProps} />);
    const xAxis = getByTestId("x-axis");
    expect(xAxis).toHaveAttribute("data-key", "month");
  });

  it("should render YAxis without formatter by default", () => {
    const { getByTestId } = render(<LineChartConfig {...defaultProps} />);
    const yAxis = getByTestId("y-axis");
    expect(yAxis).toHaveAttribute("data-has-formatter", "false");
  });

  it("should render YAxis with formatter when provided", () => {
    const formatter = (value: number) => `$${value}`;
    const { getByTestId } = render(
      <LineChartConfig {...defaultProps} yAxisFormatter={formatter} />
    );
    const yAxis = getByTestId("y-axis");
    expect(yAxis).toHaveAttribute("data-has-formatter", "true");
  });

  it("should render YAxis without label by default", () => {
    const { getByTestId } = render(<LineChartConfig {...defaultProps} />);
    const yAxis = getByTestId("y-axis");
    expect(yAxis).toHaveAttribute("data-has-label", "false");
  });

  it("should render YAxis with label when provided", () => {
    const { getByTestId } = render(<LineChartConfig {...defaultProps} yAxisLabel="Amount" />);
    const yAxis = getByTestId("y-axis");
    expect(yAxis).toHaveAttribute("data-has-label", "true");
  });

  it("should render tooltip without formatter by default", () => {
    const { getByTestId } = render(<LineChartConfig {...defaultProps} />);
    const tooltip = getByTestId("tooltip");
    expect(tooltip).toHaveAttribute("data-has-formatter", "false");
  });

  it("should render tooltip with formatter when provided", () => {
    const formatter = (value: number) => `$${value}`;
    const { getByTestId } = render(
      <LineChartConfig {...defaultProps} tooltipFormatter={formatter} />
    );
    const tooltip = getByTestId("tooltip");
    expect(tooltip).toHaveAttribute("data-has-formatter", "true");
  });

  it("should render all data keys as Line components", () => {
    const { getByTestId } = render(<LineChartConfig {...defaultProps} />);
    expect(getByTestId("line-sales")).toBeInTheDocument();
    expect(getByTestId("line-revenue")).toBeInTheDocument();
  });

  it("should render Line with correct name", () => {
    const { getByTestId } = render(<LineChartConfig {...defaultProps} />);
    const salesLine = getByTestId("line-sales");
    expect(salesLine).toHaveAttribute("data-name", "Sales");
  });

  it("should render CartesianGrid", () => {
    const { getByTestId } = render(<LineChartConfig {...defaultProps} />);
    expect(getByTestId("cartesian-grid")).toBeInTheDocument();
  });

  it("should render Legend", () => {
    const { getByTestId } = render(<LineChartConfig {...defaultProps} />);
    expect(getByTestId("legend")).toBeInTheDocument();
  });

  it("should call getTooltipStyle with isDark prop", () => {
    render(<LineChartConfig {...defaultProps} isDark={true} />);
    expect(getTooltipStyle).toHaveBeenCalledWith(true);
  });
});
