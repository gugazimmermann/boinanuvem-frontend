import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChartWrapper } from "../chart-wrapper";

describe("ChartWrapper", () => {
  it("should render children", () => {
    const { container } = render(
      <ChartWrapper>
        <div data-testid="chart-content">Chart Content</div>
      </ChartWrapper>
    );
    // ResponsiveContainer wraps children, so check for the container
    const responsiveContainer = container.querySelector(".recharts-responsive-container");
    expect(responsiveContainer).toBeInTheDocument();
  });

  it("should render title when provided", () => {
    render(
      <ChartWrapper title="Sales Chart">
        <div data-testid="chart-content">Chart Content</div>
      </ChartWrapper>
    );
    expect(screen.getByText("Sales Chart")).toBeInTheDocument();
  });

  it("should not render title when not provided", () => {
    render(
      <ChartWrapper>
        <div data-testid="chart-content">Chart Content</div>
      </ChartWrapper>
    );
    expect(screen.queryByText("Sales Chart")).not.toBeInTheDocument();
  });

  it("should render with default height", () => {
    const { container } = render(
      <ChartWrapper>
        <div data-testid="chart-content">Chart Content</div>
      </ChartWrapper>
    );
    const responsiveContainer = container.querySelector(".recharts-responsive-container");
    expect(responsiveContainer).toBeInTheDocument();
  });

  it("should render with custom height", () => {
    const { container } = render(
      <ChartWrapper height={400}>
        <div data-testid="chart-content">Chart Content</div>
      </ChartWrapper>
    );
    const responsiveContainer = container.querySelector(".recharts-responsive-container");
    expect(responsiveContainer).toBeInTheDocument();
  });

  it("should render empty message when isEmpty is true", () => {
    render(
      <ChartWrapper isEmpty={true} emptyMessage="No data available">
        <div data-testid="chart-content">Chart Content</div>
      </ChartWrapper>
    );
    expect(screen.getByText("No data available")).toBeInTheDocument();
    expect(screen.queryByTestId("chart-content")).not.toBeInTheDocument();
  });

  it("should not render empty message when isEmpty is false", () => {
    const { container } = render(
      <ChartWrapper isEmpty={false} emptyMessage="No data available">
        <div data-testid="chart-content">Chart Content</div>
      </ChartWrapper>
    );
    expect(screen.queryByText("No data available")).not.toBeInTheDocument();
    // ResponsiveContainer wraps children, so check for the container
    const responsiveContainer = container.querySelector(".recharts-responsive-container");
    expect(responsiveContainer).toBeInTheDocument();
  });

  it("should render empty message with default height when isEmpty is true", () => {
    const { container } = render(
      <ChartWrapper isEmpty={true} emptyMessage="No data available">
        <div data-testid="chart-content">Chart Content</div>
      </ChartWrapper>
    );
    const emptyDiv = container.querySelector(".flex.items-center.justify-center");
    expect(emptyDiv).toHaveStyle({ height: "300px" });
  });

  it("should render empty message with custom height when isEmpty is true", () => {
    const { container } = render(
      <ChartWrapper isEmpty={true} emptyMessage="No data available" height={400}>
        <div data-testid="chart-content">Chart Content</div>
      </ChartWrapper>
    );
    const emptyDiv = container.querySelector(".flex.items-center.justify-center");
    expect(emptyDiv).toHaveStyle({ height: "400px" });
  });

  it("should apply custom className", () => {
    const { container } = render(
      <ChartWrapper className="custom-class">
        <div data-testid="chart-content">Chart Content</div>
      </ChartWrapper>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });

  it("should render with correct styling classes", () => {
    const { container } = render(
      <ChartWrapper>
        <div data-testid="chart-content">Chart Content</div>
      </ChartWrapper>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("bg-white");
    expect(wrapper).toHaveClass("dark:bg-gray-800");
    expect(wrapper).toHaveClass("rounded-lg");
    expect(wrapper).toHaveClass("shadow");
  });

  it("should render title with correct styling", () => {
    const { container } = render(
      <ChartWrapper title="Sales Chart">
        <div data-testid="chart-content">Chart Content</div>
      </ChartWrapper>
    );
    const title = container.querySelector("h3");
    expect(title).toHaveClass("text-sm");
    expect(title).toHaveClass("font-semibold");
    expect(title).toHaveClass("text-gray-900");
    expect(title).toHaveClass("dark:text-gray-100");
  });
});
