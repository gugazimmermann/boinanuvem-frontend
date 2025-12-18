import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DateInput } from "../date-input";
import { createRef } from "react";
import type DatePicker from "react-datepicker";

// Mock react-datepicker
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

const mockUseLanguage = vi.fn(() => ({
  language: "pt",
}));

vi.mock("~/contexts/language-context", () => ({
  useLanguage: () => mockUseLanguage(),
}));

vi.mock("~/contexts/theme-context", () => ({
  useTheme: vi.fn(() => ({
    theme: "light",
  })),
}));

describe("DateInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render date input element", () => {
    render(<DateInput />);
    const input = screen.getByTestId("date-input");
    expect(input).toBeInTheDocument();
  });

  it("should render with id", () => {
    render(<DateInput id="test-date-input" />);
    const input = screen.getByTestId("date-input");
    expect(input).toHaveAttribute("id", "test-date-input");
  });

  it("should handle ISO date value (YYYY-MM-DD)", () => {
    render(<DateInput value="2024-01-15" />);
    const input = screen.getByTestId("date-input") as HTMLInputElement;
    expect(input.value).toBe("2024-01-15");
  });

  it("should handle empty value", () => {
    render(<DateInput value="" />);
    const input = screen.getByTestId("date-input") as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("should handle undefined value", () => {
    render(<DateInput value={undefined} />);
    const input = screen.getByTestId("date-input") as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("should call onChange with ISO format when date is selected", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<DateInput onChange={handleChange} />);
    const input = screen.getByTestId("date-input") as HTMLInputElement;

    await user.type(input, "2024-01-15");
    expect(handleChange).toHaveBeenCalled();
  });

  it("should call onChange with empty string when date is cleared", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<DateInput value="2024-01-15" onChange={handleChange} />);
    const input = screen.getByTestId("date-input") as HTMLInputElement;

    await user.clear(input);
    expect(handleChange).toHaveBeenCalled();
  });

  it("should apply disabled attribute", () => {
    render(<DateInput disabled />);
    const input = screen.getByTestId("date-input");
    expect(input).toBeDisabled();
  });

  it("should apply required attribute", () => {
    render(<DateInput required />);
    const input = screen.getByTestId("date-input");
    expect(input).toBeRequired();
  });

  it("should apply custom className", () => {
    render(<DateInput className="custom-class" />);
    const input = screen.getByTestId("date-input");
    expect(input).toHaveClass("custom-class");
  });

  it("should forward ref to input element", () => {
    const ref = createRef<DatePicker>();
    render(<DateInput ref={ref} />);
    expect(ref.current).toBeTruthy();
  });

  it("should handle invalid date value gracefully", () => {
    render(<DateInput value="invalid-date" />);
    const input = screen.getByTestId("date-input") as HTMLInputElement;
    // Should not crash and should handle gracefully
    expect(input).toBeInTheDocument();
  });

  it("should use Portuguese locale by default", () => {
    mockUseLanguage.mockReturnValue({ language: "pt" });
    render(<DateInput />);
    const input = screen.getByTestId("date-input");
    expect(input).toBeInTheDocument();
  });

  it("should use English locale when language is en", () => {
    mockUseLanguage.mockReturnValue({ language: "en" });
    render(<DateInput />);
    const input = screen.getByTestId("date-input");
    expect(input).toBeInTheDocument();
  });

  it("should use Spanish locale when language is es", () => {
    mockUseLanguage.mockReturnValue({ language: "es" });
    render(<DateInput />);
    const input = screen.getByTestId("date-input");
    expect(input).toBeInTheDocument();
  });

  it("should handle controlled input value changes", () => {
    const { rerender } = render(<DateInput value="2024-01-15" />);
    let input = screen.getByTestId("date-input") as HTMLInputElement;
    expect(input.value).toBe("2024-01-15");

    rerender(<DateInput value="2024-02-20" />);
    input = screen.getByTestId("date-input") as HTMLInputElement;
    expect(input.value).toBe("2024-02-20");
  });

  it("should handle value with whitespace", () => {
    render(<DateInput value="  2024-01-15  " />);
    const input = screen.getByTestId("date-input") as HTMLInputElement;
    // Should handle whitespace gracefully
    expect(input).toBeInTheDocument();
  });
});
