import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "../stat-card";
import { MemoryRouter } from "react-router";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("StatCard", () => {
  it("should render title", () => {
    render(
      <TestWrapper>
        <StatCard title="Total Sales" value={1000} />
      </TestWrapper>
    );
    expect(screen.getByText("Total Sales")).toBeInTheDocument();
  });

  it("should render numeric value", () => {
    render(
      <TestWrapper>
        <StatCard title="Total Sales" value={1000} />
      </TestWrapper>
    );
    expect(screen.getByText("1,000")).toBeInTheDocument();
  });

  it("should render string value", () => {
    render(
      <TestWrapper>
        <StatCard title="Status" value="Active" />
      </TestWrapper>
    );
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("should render subtitle when provided", () => {
    render(
      <TestWrapper>
        <StatCard title="Total Sales" value={1000} subtitle="Last month" />
      </TestWrapper>
    );
    expect(screen.getByText("Last month")).toBeInTheDocument();
  });

  it("should not render subtitle when not provided", () => {
    render(
      <TestWrapper>
        <StatCard title="Total Sales" value={1000} />
      </TestWrapper>
    );
    expect(screen.queryByText("Last month")).not.toBeInTheDocument();
  });

  it("should render icon when provided", () => {
    const icon = <span data-testid="icon">📊</span>;
    render(
      <TestWrapper>
        <StatCard title="Total Sales" value={1000} icon={icon} />
      </TestWrapper>
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("should render trend with positive value", () => {
    render(
      <TestWrapper>
        <StatCard title="Total Sales" value={1000} trend={{ value: 10, isPositive: true }} />
      </TestWrapper>
    );
    expect(screen.getByText(/↑/)).toBeInTheDocument();
    expect(screen.getByText(/10\.0%/)).toBeInTheDocument();
  });

  it("should render trend with negative value", () => {
    render(
      <TestWrapper>
        <StatCard title="Total Sales" value={1000} trend={{ value: -5, isPositive: false }} />
      </TestWrapper>
    );
    expect(screen.getByText(/↓/)).toBeInTheDocument();
    expect(screen.getByText(/5\.0%/)).toBeInTheDocument();
  });

  it("should render trend with neutral value", () => {
    render(
      <TestWrapper>
        <StatCard title="Total Sales" value={1000} trend={{ value: 0 }} />
      </TestWrapper>
    );
    expect(screen.getByText(/→/)).toBeInTheDocument();
    expect(screen.getByText(/0\.0%/)).toBeInTheDocument();
  });

  it("should render trend with label", () => {
    render(
      <TestWrapper>
        <StatCard
          title="Total Sales"
          value={1000}
          trend={{ value: 10, isPositive: true, label: "vs last month" }}
        />
      </TestWrapper>
    );
    expect(screen.getByText(/vs last month/)).toBeInTheDocument();
  });

  it("should render link when provided", () => {
    render(
      <TestWrapper>
        <StatCard title="Total Sales" value={1000} link={{ to: "/sales", text: "View details" }} />
      </TestWrapper>
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/sales");
    expect(link).toHaveTextContent("View details");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <TestWrapper>
        <StatCard title="Total Sales" value={1000} className="custom-class" />
      </TestWrapper>
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("custom-class");
  });

  it("should render with default value color", () => {
    const { container } = render(
      <TestWrapper>
        <StatCard title="Total Sales" value={1000} valueColor="default" />
      </TestWrapper>
    );
    const valueElement = container.querySelector(".text-gray-900");
    expect(valueElement).toBeInTheDocument();
  });

  it("should render with green value color", () => {
    const { container } = render(
      <TestWrapper>
        <StatCard title="Total Sales" value={1000} valueColor="green" />
      </TestWrapper>
    );
    const valueElement = container.querySelector(".text-green-600");
    expect(valueElement).toBeInTheDocument();
  });

  it("should render with red value color", () => {
    const { container } = render(
      <TestWrapper>
        <StatCard title="Total Sales" value={1000} valueColor="red" />
      </TestWrapper>
    );
    const valueElement = container.querySelector(".text-red-600");
    expect(valueElement).toBeInTheDocument();
  });

  it("should render with blue value color", () => {
    const { container } = render(
      <TestWrapper>
        <StatCard title="Total Sales" value={1000} valueColor="blue" />
      </TestWrapper>
    );
    const valueElement = container.querySelector(".text-blue-600");
    expect(valueElement).toBeInTheDocument();
  });

  it("should render with orange value color", () => {
    const { container } = render(
      <TestWrapper>
        <StatCard title="Total Sales" value={1000} valueColor="orange" />
      </TestWrapper>
    );
    const valueElement = container.querySelector(".text-orange-600");
    expect(valueElement).toBeInTheDocument();
  });

  it("should render with purple value color", () => {
    const { container } = render(
      <TestWrapper>
        <StatCard title="Total Sales" value={1000} valueColor="purple" />
      </TestWrapper>
    );
    const valueElement = container.querySelector(".text-purple-600");
    expect(valueElement).toBeInTheDocument();
  });

  it("should format large numbers with locale string", () => {
    render(
      <TestWrapper>
        <StatCard title="Total Sales" value={1234567} />
      </TestWrapper>
    );
    expect(screen.getByText("1,234,567")).toBeInTheDocument();
  });

  it("should render trend with absolute value", () => {
    render(
      <TestWrapper>
        <StatCard title="Total Sales" value={1000} trend={{ value: -15.5, isPositive: false }} />
      </TestWrapper>
    );
    expect(screen.getByText(/15\.5%/)).toBeInTheDocument();
  });
});
