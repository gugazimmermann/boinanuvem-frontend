import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChartWrapper } from "../chart-wrapper";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children, height }: { children: React.ReactNode; height: number }) => (
    <div data-testid="responsive-container" data-height={height}>
      {children}
    </div>
  ),
}));

describe("ChartWrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render children when not empty", () => {
    render(
      <ChartWrapper>
        <div data-testid="chart-content">Chart Content</div>
      </ChartWrapper>
    );

    expect(screen.getByTestId("chart-content")).toBeInTheDocument();
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("should render with default height", () => {
    render(
      <ChartWrapper>
        <div>Content</div>
      </ChartWrapper>
    );

    const container = screen.getByTestId("responsive-container");
    expect(container).toHaveAttribute("data-height", "300");
  });

  it("should render with custom height", () => {
    render(
      <ChartWrapper height={400}>
        <div>Content</div>
      </ChartWrapper>
    );

    const container = screen.getByTestId("responsive-container");
    expect(container).toHaveAttribute("data-height", "400");
  });

  it("should render title when provided", () => {
    render(
      <ChartWrapper title="Chart Title">
        <div>Content</div>
      </ChartWrapper>
    );

    expect(screen.getByText("Chart Title")).toBeInTheDocument();
  });

  it("should not render title when not provided", () => {
    const { container } = render(
      <ChartWrapper>
        <div>Content</div>
      </ChartWrapper>
    );

    expect(container.querySelector("h3")).not.toBeInTheDocument();
  });

  it("should render empty message when isEmpty is true", () => {
    render(
      <ChartWrapper isEmpty={true} emptyMessage="No data available">
        <div>Content</div>
      </ChartWrapper>
    );

    expect(screen.getByText("No data available")).toBeInTheDocument();
    expect(screen.queryByTestId("responsive-container")).not.toBeInTheDocument();
  });

  it("should not render empty message when isEmpty is false", () => {
    render(
      <ChartWrapper isEmpty={false} emptyMessage="No data available">
        <div>Content</div>
      </ChartWrapper>
    );

    expect(screen.queryByText("No data available")).not.toBeInTheDocument();
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <ChartWrapper className="custom-class">
        <div>Content</div>
      </ChartWrapper>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });

  it("should render empty message with correct height style", () => {
    render(
      <ChartWrapper isEmpty={true} emptyMessage="No data" height={400}>
        <div>Content</div>
      </ChartWrapper>
    );

    const emptyDiv = screen.getByText("No data").parentElement;
    expect(emptyDiv).toHaveStyle({ height: "400px" });
  });

  it("should render all props together", () => {
    render(
      <ChartWrapper
        title="Sales Chart"
        height={500}
        className="custom-class"
        isEmpty={false}
        emptyMessage="No data"
      >
        <div data-testid="chart">Chart</div>
      </ChartWrapper>
    );

    expect(screen.getByText("Sales Chart")).toBeInTheDocument();
    expect(screen.getByTestId("chart")).toBeInTheDocument();
    expect(screen.getByTestId("responsive-container")).toHaveAttribute("data-height", "500");
  });
});
