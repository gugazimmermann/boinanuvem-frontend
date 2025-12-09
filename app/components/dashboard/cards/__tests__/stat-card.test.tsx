import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "../stat-card";

vi.mock("react-router", () => ({
  Link: ({
    to,
    children,
    className,
  }: {
    to: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

describe("StatCard", () => {
  const defaultProps = {
    title: "Test Title",
    value: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render correctly with minimal props", () => {
    render(<StatCard {...defaultProps} />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("should render string value", () => {
    render(<StatCard title="Test" value="Custom Value" />);
    expect(screen.getByText("Custom Value")).toBeInTheDocument();
  });

  it("should format number value with locale string", () => {
    const numberValue = 1234567;
    render(<StatCard title="Test" value={numberValue} />);
    expect(screen.getByText("1,234,567")).toBeInTheDocument();
  });

  it("should render subtitle when provided", () => {
    render(<StatCard {...defaultProps} subtitle="Subtitle text" />);
    expect(screen.getByText("Subtitle text")).toBeInTheDocument();
  });

  it("should not render subtitle when not provided", () => {
    const { container } = render(<StatCard {...defaultProps} />);
    expect(container.textContent).not.toContain("Subtitle");
  });

  it("should render icon when provided", () => {
    const icon = <span data-testid="icon">📊</span>;
    render(<StatCard {...defaultProps} icon={icon} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("should not render icon container when icon is not provided", () => {
    const { container } = render(<StatCard {...defaultProps} />);
    const iconContainer = container.querySelector(".w-10.h-10");
    expect(iconContainer).not.toBeInTheDocument();
  });

  it("should render link when provided", () => {
    render(<StatCard {...defaultProps} link={{ to: "/test", text: "View Details" }} />);
    const link = screen.getByText("View Details");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });

  it("should not render link when not provided", () => {
    const { container } = render(<StatCard {...defaultProps} />);
    const link = container.querySelector("a");
    expect(link).not.toBeInTheDocument();
  });

  it("should render trend with positive indicator", () => {
    render(<StatCard {...defaultProps} trend={{ value: 10.5, isPositive: true }} />);
    expect(screen.getByText("↑")).toBeInTheDocument();
    expect(screen.getByText("10.5%")).toBeInTheDocument();
  });

  it("should render trend with negative indicator", () => {
    render(<StatCard {...defaultProps} trend={{ value: -5.2, isPositive: false }} />);
    expect(screen.getByText("↓")).toBeInTheDocument();
    expect(screen.getByText("5.2%")).toBeInTheDocument();
  });

  it("should render trend with neutral indicator", () => {
    render(<StatCard {...defaultProps} trend={{ value: 0 }} />);
    expect(screen.getByText("→")).toBeInTheDocument();
    expect(screen.getByText("0.0%")).toBeInTheDocument();
  });

  it("should render trend with label", () => {
    render(
      <StatCard
        {...defaultProps}
        trend={{ value: 15.3, isPositive: true, label: "vs last month" }}
      />
    );
    expect(screen.getByText("15.3% vs last month")).toBeInTheDocument();
  });

  it("should apply default value color class", () => {
    render(<StatCard {...defaultProps} />);
    const valueElement = screen.getByText("100");
    expect(valueElement).toHaveClass("text-gray-900", "dark:text-gray-100");
  });

  it("should apply green value color class", () => {
    render(<StatCard {...defaultProps} valueColor="green" />);
    const valueElement = screen.getByText("100");
    expect(valueElement).toHaveClass("text-green-600", "dark:text-green-400");
  });

  it("should apply red value color class", () => {
    render(<StatCard {...defaultProps} valueColor="red" />);
    const valueElement = screen.getByText("100");
    expect(valueElement).toHaveClass("text-red-600", "dark:text-red-400");
  });

  it("should apply blue value color class", () => {
    render(<StatCard {...defaultProps} valueColor="blue" />);
    const valueElement = screen.getByText("100");
    expect(valueElement).toHaveClass("text-blue-600", "dark:text-blue-400");
  });

  it("should apply orange value color class", () => {
    render(<StatCard {...defaultProps} valueColor="orange" />);
    const valueElement = screen.getByText("100");
    expect(valueElement).toHaveClass("text-orange-600", "dark:text-orange-400");
  });

  it("should apply purple value color class", () => {
    render(<StatCard {...defaultProps} valueColor="purple" />);
    const valueElement = screen.getByText("100");
    expect(valueElement).toHaveClass("text-purple-600", "dark:text-purple-400");
  });

  it("should apply custom className", () => {
    const { container } = render(<StatCard {...defaultProps} className="custom-class" />);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("custom-class");
  });

  it("should render all props together", () => {
    const icon = <span data-testid="icon">📊</span>;
    render(
      <StatCard
        title="Total Sales"
        value={50000}
        subtitle="This month"
        icon={icon}
        trend={{ value: 12.5, isPositive: true, label: "vs last month" }}
        link={{ to: "/sales", text: "View All" }}
        valueColor="green"
        className="custom-class"
      />
    );

    expect(screen.getByText("Total Sales")).toBeInTheDocument();
    expect(screen.getByText("50,000")).toBeInTheDocument();
    expect(screen.getByText("This month")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("↑")).toBeInTheDocument();
    expect(screen.getByText("12.5% vs last month")).toBeInTheDocument();
    expect(screen.getByText("View All")).toBeInTheDocument();
  });
});
