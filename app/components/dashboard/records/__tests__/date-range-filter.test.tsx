import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DateRangeFilter } from "../date-range-filter";
import { useTranslation } from "~/i18n";

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(),
}));

describe("DateRangeFilter", () => {
  const mockUseTranslation = vi.mocked(useTranslation);
  const defaultProps = {
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    onStartDateChange: vi.fn(),
    onEndDateChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      sales: {
        filters: {
          startDate: "Start Date",
          endDate: "End Date",
        },
      },
    } as unknown as ReturnType<typeof useTranslation>);
  });

  it("should render start and end date inputs", () => {
    render(<DateRangeFilter {...defaultProps} />);
    const inputs = screen.getAllByDisplayValue(/2024/);
    expect(inputs.length).toBe(2);
  });

  it("should display start date value", () => {
    render(<DateRangeFilter {...defaultProps} startDate="2024-06-01" />);
    const input = screen.getByDisplayValue("2024-06-01");
    expect(input).toBeInTheDocument();
  });

  it("should display end date value", () => {
    render(<DateRangeFilter {...defaultProps} endDate="2024-06-30" />);
    const input = screen.getByDisplayValue("2024-06-30");
    expect(input).toBeInTheDocument();
  });

  it("should call onStartDateChange when start date changes", async () => {
    const user = userEvent.setup();
    const onStartDateChange = vi.fn();
    render(<DateRangeFilter {...defaultProps} onStartDateChange={onStartDateChange} />);

    const inputs = screen.getAllByDisplayValue(/2024/);
    await user.clear(inputs[0]);
    await user.type(inputs[0], "2024-06-15");

    expect(onStartDateChange).toHaveBeenCalled();
  });

  it("should call onEndDateChange when end date changes", async () => {
    const user = userEvent.setup();
    const onEndDateChange = vi.fn();
    render(<DateRangeFilter {...defaultProps} onEndDateChange={onEndDateChange} />);

    const inputs = screen.getAllByDisplayValue(/2024/);
    await user.clear(inputs[1]);
    await user.type(inputs[1], "2024-06-30");

    expect(onEndDateChange).toHaveBeenCalled();
  });

  it("should use default labels from translation", () => {
    render(<DateRangeFilter {...defaultProps} />);
    expect(screen.getByText("Start Date:")).toBeInTheDocument();
    expect(screen.getByText("End Date:")).toBeInTheDocument();
  });

  it("should use custom labels when provided", () => {
    render(
      <DateRangeFilter {...defaultProps} startDateLabel="Custom Start" endDateLabel="Custom End" />
    );
    expect(screen.getByText("Custom Start:")).toBeInTheDocument();
    expect(screen.getByText("Custom End:")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(<DateRangeFilter {...defaultProps} className="custom-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });
});
