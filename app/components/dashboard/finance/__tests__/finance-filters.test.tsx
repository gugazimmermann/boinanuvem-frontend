import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FinanceFilters } from "../finance-filters";
import type { Property } from "~/types";

vi.mock("~/contexts/language-context", () => ({
  useLanguage: vi.fn(() => ({ language: "pt" })),
}));

vi.mock("~/hooks/use-date-filters", () => ({
  useDateFilters: vi.fn(() => ({
    yearOptions: [{ value: "2024", label: "2024" }],
    monthOptions: [{ value: "01", label: "January" }],
  })),
}));

vi.mock("./year-month-filters", () => ({
  YearMonthFilters: ({
    selectedYear,
    selectedMonth,
  }: {
    selectedYear: string;
    selectedMonth: string;
  }) => (
    <div data-testid="year-month-filters">
      {selectedYear} - {selectedMonth}
    </div>
  ),
}));

describe("FinanceFilters", () => {
  const mockProperties: Property[] = [
    { id: "1", name: "Property 1" } as Property,
    { id: "2", name: "Property 2" } as Property,
  ];

  const defaultProps = {
    propertyFilter: "all",
    onPropertyFilterChange: vi.fn(),
    selectedYear: "2024",
    selectedMonth: "01",
    onYearChange: vi.fn(),
    onMonthChange: vi.fn(),
    properties: mockProperties,
    propertyLabel: "Property",
    allPropertiesLabel: "All Properties",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render property label", () => {
    render(<FinanceFilters {...defaultProps} />);
    expect(screen.getByText("Property:")).toBeInTheDocument();
  });

  it("should render property select", () => {
    render(<FinanceFilters {...defaultProps} />);
    const selects = screen.getAllByRole("combobox");
    // First select is the property filter
    expect(selects[0]).toBeInTheDocument();
  });

  it("should render all properties option", () => {
    render(<FinanceFilters {...defaultProps} />);
    expect(screen.getByText("All Properties")).toBeInTheDocument();
  });

  it("should render all properties in select", () => {
    render(<FinanceFilters {...defaultProps} />);
    expect(screen.getByText("Property 1")).toBeInTheDocument();
    expect(screen.getByText("Property 2")).toBeInTheDocument();
  });

  it("should call onPropertyFilterChange when property changes", async () => {
    const user = userEvent.setup();
    const onPropertyFilterChange = vi.fn();
    render(<FinanceFilters {...defaultProps} onPropertyFilterChange={onPropertyFilterChange} />);

    const selects = screen.getAllByRole("combobox");
    // First select is the property filter
    await user.selectOptions(selects[0], "1");

    expect(onPropertyFilterChange).toHaveBeenCalledWith("1");
  });

  it("should call onPageChange when property changes", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<FinanceFilters {...defaultProps} onPageChange={onPageChange} />);

    const selects = screen.getAllByRole("combobox");
    // First select is the property filter
    await user.selectOptions(selects[0], "1");

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("should render YearMonthFilters", () => {
    render(<FinanceFilters {...defaultProps} />);
    expect(screen.getByTestId("year-month-filters")).toBeInTheDocument();
  });
});
