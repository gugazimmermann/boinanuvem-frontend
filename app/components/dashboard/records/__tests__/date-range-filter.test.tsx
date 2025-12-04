import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DateRangeFilter } from "../date-range-filter";
import { LanguageProvider } from "~/contexts/language-context";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    sales: {
      filters: {
        startDate: "Start Date",
        endDate: "End Date",
      },
    },
  })),
}));

describe("DateRangeFilter", () => {
  const defaultProps = {
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    onStartDateChange: vi.fn(),
    onEndDateChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render date range filter", () => {
    render(
      <TestWrapper>
        <DateRangeFilter {...defaultProps} />
      </TestWrapper>
    );
    expect(screen.getByText("Start Date:")).toBeInTheDocument();
    expect(screen.getByText("End Date:")).toBeInTheDocument();
  });

  it("should handle start date change", () => {
    const onStartDateChange = vi.fn();
    const { container } = render(
      <TestWrapper>
        <DateRangeFilter {...defaultProps} onStartDateChange={onStartDateChange} />
      </TestWrapper>
    );
    const dateInputs = container.querySelectorAll('input[type="date"]');
    const startDateInput = dateInputs[0] as HTMLInputElement;
    fireEvent.change(startDateInput, { target: { value: "2025-02-01" } });
    expect(onStartDateChange).toHaveBeenCalledWith("2025-02-01");
  });

  it("should handle end date change", () => {
    const onEndDateChange = vi.fn();
    const { container } = render(
      <TestWrapper>
        <DateRangeFilter {...defaultProps} onEndDateChange={onEndDateChange} />
      </TestWrapper>
    );
    const dateInputs = container.querySelectorAll('input[type="date"]');
    const endDateInput = dateInputs[1] as HTMLInputElement;
    fireEvent.change(endDateInput, { target: { value: "2025-11-30" } });
    expect(onEndDateChange).toHaveBeenCalledWith("2025-11-30");
  });

  it("should use custom labels when provided", () => {
    render(
      <TestWrapper>
        <DateRangeFilter
          {...defaultProps}
          startDateLabel="Custom Start"
          endDateLabel="Custom End"
        />
      </TestWrapper>
    );
    expect(screen.getByText("Custom Start:")).toBeInTheDocument();
    expect(screen.getByText("Custom End:")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <TestWrapper>
        <DateRangeFilter {...defaultProps} className="custom-class" />
      </TestWrapper>
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
