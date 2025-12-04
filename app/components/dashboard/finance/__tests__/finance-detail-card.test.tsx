import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FinanceDetailCard, type DetailField } from "../finance-detail-card";

vi.mock("~/components/ui", () => ({
  StatusBadge: vi.fn(({ label, variant }: { label: string; variant: string }) => (
    <span data-testid="status-badge" data-variant={variant}>
      {label}
    </span>
  )),
}));

vi.mock("~/utils/formatting", () => ({
  formatCurrency: vi.fn((value: number, _language: string) => `R$ ${value.toFixed(2)}`),
  formatDate: vi.fn((value: string, _language: string) => value),
}));

describe("FinanceDetailCard", () => {
  it("should render fields", () => {
    const fields: DetailField[] = [
      { label: "Name", value: "John Doe" },
      { label: "Amount", value: 1000, type: "currency" },
    ];
    render(<FinanceDetailCard fields={fields} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("R$ 1000.00")).toBeInTheDocument();
  });

  it("should render text field", () => {
    const fields: DetailField[] = [{ label: "Name", value: "John Doe" }];
    render(<FinanceDetailCard fields={fields} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("should render currency field", () => {
    const fields: DetailField[] = [{ label: "Amount", value: 1000, type: "currency" }];
    render(<FinanceDetailCard fields={fields} />);
    expect(screen.getByText("R$ 1000.00")).toBeInTheDocument();
  });

  it("should render currency field with income type", () => {
    const fields: DetailField[] = [
      { label: "Income", value: 1000, type: "currency", currencyType: "income" },
    ];
    const { container } = render(<FinanceDetailCard fields={fields} />);
    const valueElement = container.querySelector(".text-green-600");
    expect(valueElement).toBeInTheDocument();
  });

  it("should render currency field with expense type", () => {
    const fields: DetailField[] = [
      { label: "Expense", value: 1000, type: "currency", currencyType: "expense" },
    ];
    const { container } = render(<FinanceDetailCard fields={fields} />);
    const valueElement = container.querySelector(".text-red-600");
    expect(valueElement).toBeInTheDocument();
  });

  it("should render date field", () => {
    const fields: DetailField[] = [{ label: "Date", value: "2025-01-15", type: "date" }];
    render(<FinanceDetailCard fields={fields} />);
    expect(screen.getByText("2025-01-15")).toBeInTheDocument();
  });

  it("should render status field", () => {
    const fields: DetailField[] = [
      { label: "Status", value: "Active", type: "status", statusVariant: "success" },
    ];
    render(<FinanceDetailCard fields={fields} />);
    expect(screen.getByTestId("status-badge")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("should render badge field", () => {
    const fields: DetailField[] = [
      { label: "Badge", value: "New", type: "badge", statusVariant: "default" },
    ];
    render(<FinanceDetailCard fields={fields} />);
    expect(screen.getByTestId("status-badge")).toBeInTheDocument();
  });

  it("should render ReactNode value", () => {
    const nodeValue = <span data-testid="node-value">Custom Node</span>;
    const fields: DetailField[] = [{ label: "Custom", value: nodeValue }];
    render(<FinanceDetailCard fields={fields} />);
    expect(screen.getByTestId("node-value")).toBeInTheDocument();
  });

  it("should not render field when condition is false", () => {
    const fields: DetailField[] = [
      { label: "Hidden", value: "Hidden Value", condition: false },
      { label: "Visible", value: "Visible Value" },
    ];
    render(<FinanceDetailCard fields={fields} />);
    expect(screen.queryByText("Hidden Value")).not.toBeInTheDocument();
    expect(screen.getByText("Visible Value")).toBeInTheDocument();
  });

  it("should render field labels", () => {
    const fields: DetailField[] = [
      { label: "Name", value: "John Doe" },
      { label: "Email", value: "john@example.com" },
    ];
    render(<FinanceDetailCard fields={fields} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("should render with correct styling classes", () => {
    const fields: DetailField[] = [{ label: "Test", value: "Value" }];
    const { container } = render(<FinanceDetailCard fields={fields} />);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("bg-white");
    expect(card).toHaveClass("dark:bg-gray-800");
    expect(card).toHaveClass("rounded-lg");
  });
});
