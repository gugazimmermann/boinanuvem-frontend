import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "../input";
import { createRef } from "react";
import { renderWithProviders } from "~/utils/test-utils";

vi.mock("~/i18n/use-translation", () => ({
  useTranslation: vi.fn(() => ({
    common: {
      showPassword: "Show password",
      hidePassword: "Hide password",
    },
  })),
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

describe("Input", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderInput = (props?: React.ComponentProps<typeof Input>) => {
    return renderWithProviders(<Input {...props} />);
  };

  it("should render input element", () => {
    renderWithProviders(<Input />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("should render with label", () => {
    renderInput({ label: "Test Label" });
    expect(screen.getByText("Test Label")).toBeInTheDocument();
    const input = screen.getByLabelText("Test Label");
    expect(input).toBeInTheDocument();
  });

  it("should render helper text", () => {
    renderInput({ helperText: "Helper text" });
    expect(screen.getByText("Helper text")).toBeInTheDocument();
    expect(screen.getByText("Helper text")).toHaveClass("text-gray-400");
  });

  it("should render error message", () => {
    renderInput({ error: "Error message" });
    expect(screen.getByText("Error message")).toBeInTheDocument();
    expect(screen.getByText("Error message")).toHaveClass("text-red-500");
  });

  it("should prioritize error over helper text", () => {
    renderInput({ error: "Error", helperText: "Helper" });
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.queryByText("Helper")).not.toBeInTheDocument();
  });

  it("should apply error styles when error is present", () => {
    renderInput({ error: "Error" });
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("border-red-400");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("should have aria-describedby when helper text or error is present", () => {
    const { rerender } = renderWithProviders(<Input helperText="Helper" />);
    let input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-describedby");
    expect(input.getAttribute("aria-describedby")).toContain("-helper");

    rerender(<Input error="Error" />);
    input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-describedby");
  });

  it("should not have aria-describedby when no helper text or error", () => {
    renderInput();
    const input = screen.getByRole("textbox");
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("should use provided id", () => {
    renderInput({ id: "custom-id", label: "Label" });
    const input = screen.getByLabelText("Label");
    expect(input).toHaveAttribute("id", "custom-id");
  });

  it("should generate id when not provided", () => {
    renderInput({ label: "Label" });
    const input = screen.getByLabelText("Label");
    expect(input).toHaveAttribute("id");
    expect(input.getAttribute("id")).toBeTruthy();
  });

  it("should apply custom className", () => {
    const { container } = renderInput({ className: "custom-class" });
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });

  it("should apply custom inputClassName", () => {
    renderInput({ inputClassName: "custom-input-class" });
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("custom-input-class");
  });

  it("should handle text input", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    renderInput({ onChange: handleChange });
    const input = screen.getByRole("textbox");
    await user.type(input, "test");
    expect(handleChange).toHaveBeenCalled();
  });

  it("should handle number input", () => {
    renderInput({ type: "number" });
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveAttribute("type", "number");
  });

  it("should handle email input", () => {
    renderInput({ type: "email" });
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "email");
  });

  it("should show password toggle when showPasswordToggle is true and type is password", () => {
    renderInput({ type: "password", showPasswordToggle: true });
    const toggleButton = screen.getByRole("button");
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute("aria-label", "Show password");
  });

  it("should not show password toggle when showPasswordToggle is false", () => {
    renderInput({ type: "password" });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should not show password toggle for non-password types", () => {
    renderInput({ type: "text", showPasswordToggle: true });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should toggle password visibility", async () => {
    const user = userEvent.setup();
    const { container } = renderInput({
      type: "password",
      showPasswordToggle: true,
      label: "Password",
    });
    const input = container.querySelector(
      'input[type="password"], input[type="text"]'
    ) as HTMLInputElement;
    const toggleButton = screen.getByRole("button");

    expect(input).toHaveAttribute("type", "password");
    await user.click(toggleButton);
    expect(input).toHaveAttribute("type", "text");
    expect(toggleButton).toHaveAttribute("aria-label", "Hide password");

    await user.click(toggleButton);
    expect(input).toHaveAttribute("type", "password");
    expect(toggleButton).toHaveAttribute("aria-label", "Show password");
  });

  it("should handle date input with ISO format", async () => {
    const handleChange = vi.fn();
    const _user = userEvent.setup();
    renderInput({ type: "date", onChange: handleChange });
    // DateInput component is rendered for date type
    const dateInput = screen.getByTestId("date-input");
    expect(dateInput).toBeInTheDocument();
    // The DateInput component handles the change internally
    expect(handleChange).toHaveBeenCalledTimes(0); // Not called until user interacts
  });

  it("should display ISO date as-is", () => {
    renderInput({ type: "date", value: "2024-01-15", onChange: vi.fn() });
    // DateInput component is rendered for date type
    const dateInput = screen.getByTestId("date-input");
    expect(dateInput).toBeInTheDocument();
    expect(dateInput).toHaveValue("2024-01-15");
  });

  it("should convert DD/MM/YYYY to ISO for date input value", () => {
    renderInput({ type: "date", value: "15/01/2024", onChange: vi.fn() });
    // DateInput component is rendered for date type
    const dateInput = screen.getByTestId("date-input");
    expect(dateInput).toBeInTheDocument();
    expect(dateInput).toHaveValue("2024-01-15");
  });

  it("should forward ref to input element", () => {
    const ref = createRef<HTMLInputElement>();
    renderWithProviders(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("should pass through input props", () => {
    renderInput({ placeholder: "Enter text", required: true });
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("placeholder", "Enter text");
    expect(input).toBeRequired();
  });

  it("should have pr-10 class when password toggle is shown", () => {
    const { container } = renderInput({
      type: "password",
      showPasswordToggle: true,
      label: "Password",
    });
    const input = container.querySelector('input[type="password"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input).toHaveClass("pr-10");
  });

  it("should handle controlled input value", () => {
    const { rerender } = renderWithProviders(<Input value="initial" onChange={vi.fn()} />);
    let input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("initial");

    rerender(<Input value="updated" onChange={vi.fn()} />);
    input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("updated");
  });

  it("should handle empty value", () => {
    renderInput({ value: "", onChange: vi.fn() });
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("");
  });

  it("should handle null value for date input", () => {
    renderInput({ type: "date", value: undefined, onChange: vi.fn() });
    // DateInput component is rendered for date type
    const dateInput = screen.getByTestId("date-input");
    expect(dateInput).toBeInTheDocument();
    expect(dateInput).toHaveValue("");
  });

  it("should handle non-string value for date input", () => {
    renderInput({
      type: "date",
      value: 123 as unknown as string,
      onChange: vi.fn(),
    });
    // DateInput component is rendered for date type
    const dateInput = screen.getByTestId("date-input");
    expect(dateInput).toBeInTheDocument();
    expect(dateInput).toHaveValue("");
  });
});
