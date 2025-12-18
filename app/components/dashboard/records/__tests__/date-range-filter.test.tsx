import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DateRangeFilter } from "../date-range-filter";
import { useTranslation } from "~/i18n";
import { renderWithProviders } from "~/utils/test-utils";

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(),
}));

// Mock react-datepicker for DateInput component
vi.mock("react-datepicker", async () => {
  const React = await import("react");
  interface MockDatePickerProps {
    selected?: Date | null;
    onChange?: (date: Date | null) => void;
    dateFormat?: string;
    locale?: unknown;
    className?: string;
    id?: string;
    disabled?: boolean;
    required?: boolean;
    wrapperClassName?: string;
    calendarClassName?: string;
    showPopperArrow?: boolean;
    showMonthDropdown?: boolean;
    showYearDropdown?: boolean;
    dropdownMode?: string;
    inputProps?: Record<string, unknown>;
    [key: string]: unknown;
  }
  const MockedDatePicker = React.forwardRef<HTMLInputElement, MockDatePickerProps>(
    (
      {
        selected,
        onChange,
        dateFormat: _dateFormat,
        locale: _locale,
        className,
        id,
        disabled,
        required,
        wrapperClassName: _wrapperClassName,
        calendarClassName: _calendarClassName,
        showPopperArrow: _showPopperArrow,
        showMonthDropdown: _showMonthDropdown,
        showYearDropdown: _showYearDropdown,
        dropdownMode: _dropdownMode,
        inputProps,
        ...props
      },
      ref
    ) => {
      // Filter out DatePicker-specific props that shouldn't be passed to DOM elements
      // Extract props from inputProps if provided, otherwise use direct props
      const inputPropsObj = (inputProps as Record<string, unknown>) || {};
      const typedId = (inputPropsObj.id as string | undefined) || (id as string | undefined);
      const typedClassName =
        (inputPropsObj.className as string | undefined) || (className as string | undefined);
      const typedDisabled =
        (inputPropsObj.disabled as boolean | undefined) ?? (disabled as boolean | undefined);
      const typedRequired =
        (inputPropsObj.required as boolean | undefined) ?? (required as boolean | undefined);
      const typedOnChange = onChange as ((date: Date | null) => void) | undefined;
      const typedSelected = selected as Date | null | undefined;

      // Filter out DatePicker-specific props from props before merging
      const {
        dateFormat: __dateFormat,
        locale: __locale,
        wrapperClassName: __wrapperClassName,
        calendarClassName: __calendarClassName,
        showPopperArrow: __showPopperArrow,
        showMonthDropdown: __showMonthDropdown,
        showYearDropdown: __showYearDropdown,
        dropdownMode: __dropdownMode,
        ...safeProps
      } = props as Record<string, unknown>;

      // Merge inputProps with safe props, giving precedence to inputProps
      const mergedProps = { ...safeProps, ...inputPropsObj };

      return (
        <input
          ref={ref}
          id={typedId}
          type="text"
          value={typedSelected ? new Date(typedSelected).toISOString().split("T")[0] : ""}
          onChange={(e) => {
            if (typedOnChange && e.target.value) {
              const date = new Date(e.target.value);
              typedOnChange(date);
            } else if (typedOnChange) {
              typedOnChange(null);
            }
          }}
          className={typedClassName}
          disabled={typedDisabled}
          required={typedRequired}
          data-testid="date-input"
          {...mergedProps}
        />
      );
    }
  );
  MockedDatePicker.displayName = "MockedDatePicker";
  return {
    default: MockedDatePicker,
  };
});

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
    renderWithProviders(<DateRangeFilter {...defaultProps} />);
    const inputs = screen.getAllByTestId("date-input");
    expect(inputs.length).toBe(2);
  });

  it("should display start date value", () => {
    renderWithProviders(<DateRangeFilter {...defaultProps} startDate="2024-06-01" />);
    const inputs = screen.getAllByTestId("date-input");
    expect(inputs[0]).toHaveValue("2024-06-01");
  });

  it("should display end date value", () => {
    renderWithProviders(<DateRangeFilter {...defaultProps} endDate="2024-06-30" />);
    const inputs = screen.getAllByTestId("date-input");
    expect(inputs[1]).toHaveValue("2024-06-30");
  });

  it("should call onStartDateChange when start date changes", async () => {
    const user = userEvent.setup();
    const onStartDateChange = vi.fn();
    renderWithProviders(
      <DateRangeFilter {...defaultProps} onStartDateChange={onStartDateChange} />
    );

    const inputs = screen.getAllByTestId("date-input");
    // DateInput onChange is called with a Date object, not a string
    await user.clear(inputs[0]);
    await user.type(inputs[0], "2024-06-15");

    // The mock DateInput calls onChange with a Date object when value changes
    expect(onStartDateChange).toHaveBeenCalled();
  });

  it("should call onEndDateChange when end date changes", async () => {
    const user = userEvent.setup();
    const onEndDateChange = vi.fn();
    renderWithProviders(<DateRangeFilter {...defaultProps} onEndDateChange={onEndDateChange} />);

    const inputs = screen.getAllByTestId("date-input");
    await user.clear(inputs[1]);
    await user.type(inputs[1], "2024-06-30");

    expect(onEndDateChange).toHaveBeenCalled();
  });

  it("should use default labels from translation", () => {
    renderWithProviders(<DateRangeFilter {...defaultProps} />);
    expect(screen.getByText("Start Date:")).toBeInTheDocument();
    expect(screen.getByText("End Date:")).toBeInTheDocument();
  });

  it("should use custom labels when provided", () => {
    renderWithProviders(
      <DateRangeFilter {...defaultProps} startDateLabel="Custom Start" endDateLabel="Custom End" />
    );
    expect(screen.getByText("Custom Start:")).toBeInTheDocument();
    expect(screen.getByText("Custom End:")).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = renderWithProviders(
      <DateRangeFilter {...defaultProps} className="custom-class" />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });
});
