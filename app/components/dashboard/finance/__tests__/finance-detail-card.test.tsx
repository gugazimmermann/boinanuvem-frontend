import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { FinanceDetailCard } from "../finance-detail-card";
import { formatCurrency, formatDate } from "~/utils/formatting";

vi.mock("~/utils/formatting");
vi.mock("~/components/ui", () => ({
  StatusBadge: ({ label, variant }: { label: string; variant: string }) => (
    <span data-testid="status-badge" data-variant={variant}>
      {label}
    </span>
  ),
}));

describe("FinanceDetailCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(formatCurrency).mockImplementation((value: number) => `$${value}`);
    vi.mocked(formatDate).mockImplementation((date: string) => date);
  });

  it("should render all fields", () => {
    const fields = [
      { label: "Field 1", value: "Value 1" },
      { label: "Field 2", value: "Value 2" },
    ];
    render(<FinanceDetailCard fields={fields} />);
    expect(screen.getByText("Field 1")).toBeInTheDocument();
    expect(screen.getByText("Value 1")).toBeInTheDocument();
    expect(screen.getByText("Field 2")).toBeInTheDocument();
    expect(screen.getByText("Value 2")).toBeInTheDocument();
  });

  it("should format currency values", () => {
    const fields = [{ label: "Amount", value: 1000, type: "currency" as const }];
    render(<FinanceDetailCard fields={fields} />);
    expect(formatCurrency).toHaveBeenCalledWith(1000, "pt");
  });

  it("should apply income color for income currency", () => {
    const fields = [
      { label: "Income", value: 1000, type: "currency" as const, currencyType: "income" as const },
    ];
    const { container } = render(<FinanceDetailCard fields={fields} />);
    const valueElement = container.querySelector(".text-green-600");
    expect(valueElement).toBeInTheDocument();
  });

  it("should apply expense color for expense currency", () => {
    const fields = [
      { label: "Expense", value: 500, type: "currency" as const, currencyType: "expense" as const },
    ];
    const { container } = render(<FinanceDetailCard fields={fields} />);
    const valueElement = container.querySelector(".text-red-600");
    expect(valueElement).toBeInTheDocument();
  });

  it("should format date values", () => {
    const fields = [{ label: "Date", value: "2024-01-01", type: "date" as const }];
    render(<FinanceDetailCard fields={fields} />);
    expect(formatDate).toHaveBeenCalledWith("2024-01-01", "pt");
  });

  it("should render status badge for status type", () => {
    const fields = [
      {
        label: "Status",
        value: "Active",
        type: "status" as const,
        statusVariant: "success" as const,
      },
    ];
    render(<FinanceDetailCard fields={fields} />);
    expect(screen.getByTestId("status-badge")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("should not render field when condition is false", () => {
    const fields = [
      { label: "Hidden", value: "Value", condition: false },
      { label: "Visible", value: "Value", condition: true },
    ];
    render(<FinanceDetailCard fields={fields} />);
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
    expect(screen.getByText("Visible")).toBeInTheDocument();
  });

  it("should render ReactNode values", () => {
    const fields = [{ label: "Custom", value: <span data-testid="custom">Custom Value</span> }];
    render(<FinanceDetailCard fields={fields} />);
    expect(screen.getByTestId("custom")).toBeInTheDocument();
  });
});
