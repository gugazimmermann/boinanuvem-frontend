import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YearMonthFilters } from "../year-month-filters";
import { LanguageProvider } from "~/contexts/language-context";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

vi.mock("~/components/ui", () => ({
  Select: vi.fn(
    ({
      value,
      onChange,
      options,
    }: {
      value: string;
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
      options: Array<{ value: string; label: string }>;
    }) => (
      <select value={value} onChange={onChange} data-testid="select">
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  ),
}));

vi.mock("~/hooks/use-date-filters", () => ({
  useDateFilters: vi.fn(() => ({
    yearOptions: [
      { value: "2024", label: "2024" },
      { value: "2025", label: "2025" },
    ],
    monthOptions: [
      { value: "01", label: "January" },
      { value: "02", label: "February" },
    ],
  })),
}));

describe("YearMonthFilters", () => {
  const defaultProps = {
    selectedYear: "2025",
    selectedMonth: "01",
    onYearChange: vi.fn(),
    onMonthChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render year and month selects", () => {
    render(
      <TestWrapper>
        <YearMonthFilters {...defaultProps} />
      </TestWrapper>
    );
    const selects = screen.getAllByTestId("select");
    expect(selects).toHaveLength(2);
  });

  it("should display selected year", () => {
    render(
      <TestWrapper>
        <YearMonthFilters {...defaultProps} selectedYear="2024" />
      </TestWrapper>
    );
    const selects = screen.getAllByTestId("select");
    expect(selects[0]).toHaveValue("2024");
  });

  it("should display selected month", () => {
    render(
      <TestWrapper>
        <YearMonthFilters {...defaultProps} selectedMonth="02" />
      </TestWrapper>
    );
    const selects = screen.getAllByTestId("select");
    expect(selects[1]).toHaveValue("02");
  });

  it("should call onYearChange when year changes", async () => {
    const onYearChange = vi.fn();
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <YearMonthFilters
          {...defaultProps}
          onYearChange={onYearChange}
          onPageChange={onPageChange}
        />
      </TestWrapper>
    );
    const selects = screen.getAllByTestId("select");
    await user.selectOptions(selects[0], "2024");
    expect(onYearChange).toHaveBeenCalledWith("2024");
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("should call onMonthChange when month changes", async () => {
    const onMonthChange = vi.fn();
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <YearMonthFilters
          {...defaultProps}
          onMonthChange={onMonthChange}
          onPageChange={onPageChange}
        />
      </TestWrapper>
    );
    const selects = screen.getAllByTestId("select");
    await user.selectOptions(selects[1], "02");
    expect(onMonthChange).toHaveBeenCalledWith("02");
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("should not call onPageChange when not provided", async () => {
    const onYearChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <YearMonthFilters {...defaultProps} onYearChange={onYearChange} />
      </TestWrapper>
    );
    const selects = screen.getAllByTestId("select");
    await user.selectOptions(selects[0], "2024");
    expect(onYearChange).toHaveBeenCalled();
  });
});
