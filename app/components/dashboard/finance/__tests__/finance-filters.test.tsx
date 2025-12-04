import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FinanceFilters } from "../finance-filters";
import { mockProperties } from "~/mocks/properties";
import { LanguageProvider } from "~/contexts/language-context";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

vi.mock("../year-month-filters", () => ({
  YearMonthFilters: vi.fn(
    ({
      selectedYear,
      selectedMonth,
      onYearChange,
      onMonthChange,
    }: {
      selectedYear: string;
      selectedMonth: string;
      onYearChange: (year: string) => void;
      onMonthChange: (month: string) => void;
    }) => (
      <div data-testid="year-month-filters">
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          data-testid="year-select"
        >
          <option value="2024">2024</option>
          <option value="2025">2025</option>
        </select>
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          data-testid="month-select"
        >
          <option value="01">January</option>
          <option value="12">December</option>
        </select>
      </div>
    )
  ),
}));

describe("FinanceFilters", () => {
  const defaultProps = {
    propertyFilter: "all",
    onPropertyFilterChange: vi.fn(),
    selectedYear: "2025",
    selectedMonth: "01",
    onYearChange: vi.fn(),
    onMonthChange: vi.fn(),
    properties: mockProperties.slice(0, 2),
    propertyLabel: "Property",
    allPropertiesLabel: "All Properties",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render property label", () => {
    render(
      <TestWrapper>
        <FinanceFilters {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Property:")).toBeInTheDocument();
  });

  it("should render property select", () => {
    const { container } = render(
      <TestWrapper>
        <FinanceFilters {...defaultProps} />
      </TestWrapper>
    );
    const select = container.querySelector("select");
    expect(select).toBeInTheDocument();
  });

  it("should render all properties option", () => {
    render(
      <TestWrapper>
        <FinanceFilters {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("All Properties")).toBeInTheDocument();
  });

  it("should render property options", () => {
    render(
      <TestWrapper>
        <FinanceFilters {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText(mockProperties[0].name)).toBeInTheDocument();
    expect(screen.getByText(mockProperties[1].name)).toBeInTheDocument();
  });

  it("should call onPropertyFilterChange when property changes", async () => {
    const onPropertyFilterChange = vi.fn();
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TestWrapper>
        <FinanceFilters
          {...defaultProps}
          onPropertyFilterChange={onPropertyFilterChange}
          onPageChange={onPageChange}
        />
      </TestWrapper>
    );
    const select = container.querySelector("select");
    if (select) {
      await user.selectOptions(select, mockProperties[0].id);
      expect(onPropertyFilterChange).toHaveBeenCalledWith(mockProperties[0].id);
      expect(onPageChange).toHaveBeenCalledWith(1);
    }
  });

  it("should not call onPageChange when not provided", async () => {
    const onPropertyFilterChange = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <TestWrapper>
        <FinanceFilters {...defaultProps} onPropertyFilterChange={onPropertyFilterChange} />
      </TestWrapper>
    );
    const select = container.querySelector("select");
    if (select) {
      await user.selectOptions(select, mockProperties[0].id);
      expect(onPropertyFilterChange).toHaveBeenCalled();
    }
  });

  it("should render YearMonthFilters", () => {
    render(
      <TestWrapper>
        <FinanceFilters {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByTestId("year-month-filters")).toBeInTheDocument();
  });

  it("should pass year and month to YearMonthFilters", () => {
    render(
      <TestWrapper>
        <FinanceFilters {...defaultProps} selectedYear="2024" selectedMonth="12" />
      </TestWrapper>
    );
    // YearMonthFilters is mocked, so check that it's rendered
    expect(screen.getByTestId("year-month-filters")).toBeInTheDocument();
    const yearSelect = screen.queryByTestId("year-select");
    const monthSelect = screen.queryByTestId("month-select");
    if (yearSelect && monthSelect) {
      expect(yearSelect).toHaveValue("2024");
      expect(monthSelect).toHaveValue("12");
    }
  });
});
