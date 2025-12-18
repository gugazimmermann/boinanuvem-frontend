import { forwardRef, useMemo } from "react";
import DatePicker, { type DatePickerProps } from "react-datepicker";
import { ptBR, enUS, es } from "date-fns/locale";
import { format, parse, isValid } from "date-fns";
import { useLanguage } from "~/contexts/language-context";
import { useTheme } from "~/contexts/theme-context";
import "react-datepicker/dist/react-datepicker.css";

interface DateInputProps
  extends Omit<
    DatePickerProps,
    "selected" | "onChange" | "locale" | "dateFormat" | "selectsMultiple" | "selectsRange"
  > {
  value?: string; // ISO format (YYYY-MM-DD) or empty string
  onChange?: (event: { target: { value: string } }) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
}

// Helper functions
const parseISODate = (dateValue: string): Date | null => {
  const parsed = parse(dateValue, "yyyy-MM-dd", new Date());
  return isValid(parsed) ? parsed : null;
};

const parseGenericDate = (dateValue: string): Date | null => {
  const date = new Date(dateValue);
  return isValid(date) ? date : null;
};

const extractSingleDate = (date: Date | null | Date[]): Date | null => {
  if (Array.isArray(date)) {
    return date.length > 0 ? date[0] : null;
  }
  return date;
};

const createChangeEvent = (value: string): React.ChangeEvent<HTMLInputElement> => {
  return {
    target: { value },
  } as React.ChangeEvent<HTMLInputElement>;
};

interface FilteredProps {
  placeholder?: unknown;
  autoFocus?: unknown;
  readOnly?: unknown;
  tabIndex?: unknown;
  title?: unknown;
  otherProps: Record<string, unknown>;
}

const filterDatePickerProps = (props: Record<string, unknown>): FilteredProps => {
  const {
    // HTML input attributes that should go to inputProps
    type: _type,
    name: _name,
    placeholder,
    autoComplete: _autoComplete,
    autoFocus,
    readOnly,
    min: _min,
    max: _max,
    step: _step,
    pattern: _pattern,
    inputMode: _inputMode,
    tabIndex,
    title,
    // DatePicker props we explicitly set (filter to prevent duplication)
    dateFormat: _dateFormat,
    wrapperClassName: _wrapperClassName,
    calendarClassName: _calendarClassName,
    showPopperArrow: _showPopperArrow,
    showMonthDropdown: _showMonthDropdown,
    showYearDropdown: _showYearDropdown,
    dropdownMode: _dropdownMode,
    // Filter out other props that might cause issues
    ...otherProps
  } = props;

  return {
    placeholder,
    autoFocus,
    readOnly,
    tabIndex,
    title,
    otherProps,
  };
};

export const DateInput = forwardRef<DatePicker, DateInputProps>(
  (
    { value, onChange, className = "", disabled = false, required = false, id, ...datePickerProps },
    ref
  ) => {
    const { language } = useLanguage();
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // Get locale and date format based on language
    const locale = useMemo(() => {
      switch (language) {
        case "en":
          return enUS;
        case "es":
          return es;
        default:
          return ptBR;
      }
    }, [language]);

    const dateFormat = useMemo(() => {
      return language === "en" ? "MM/dd/yyyy" : "dd/MM/yyyy";
    }, [language]);

    // Parse the ISO date string (YYYY-MM-DD) to Date object
    const selectedDate = useMemo(() => {
      if (!value || typeof value !== "string" || value.trim() === "") {
        return null;
      }

      // If it's already in ISO format (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return parseISODate(value);
      }

      // Try to parse as Date
      return parseGenericDate(value);
    }, [value]);

    const handleChange = (date: Date | null, _event?: React.SyntheticEvent) => {
      if (!onChange) {
        return;
      }

      // DatePicker can pass either Date | null or Date[] | null
      // Since we're not using selectsRange, we expect a single date
      const singleDate = extractSingleDate(date);
      if (singleDate && isValid(singleDate)) {
        // Convert to ISO format (YYYY-MM-DD) for backend compatibility
        const isoDate = format(singleDate, "yyyy-MM-dd");
        onChange(createChangeEvent(isoDate));
      } else {
        onChange(createChangeEvent(""));
      }
    };

    // Base styles matching the Input component
    const baseStyles = [
      "mt-2",
      "block",
      "w-full",
      "rounded-lg",
      "border",
      "border-gray-200",
      "dark:border-gray-600",
      "bg-white",
      "dark:bg-gray-700",
      "px-5",
      "py-2.5",
      "text-gray-700",
      "dark:text-gray-200",
      "focus:border-blue-400",
      "dark:focus:border-blue-500",
      "focus:outline-none",
      "focus:ring",
      "focus:ring-blue-300",
      "dark:focus:ring-blue-600",
      "focus:ring-opacity-40",
      "transition-colors",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // Filter out all props that shouldn't be passed to DatePicker
    // react-datepicker v9 may forward some props to DOM elements, so we need to be explicit
    const { placeholder, autoFocus, readOnly, tabIndex, title, otherProps } = filterDatePickerProps(
      datePickerProps as Record<string, unknown>
    );

    // Build inputProps object for input-specific attributes
    // These props should be passed to the input element via inputProps, not directly to DatePicker
    const inputProps: Record<string, unknown> = {
      id,
      disabled,
      required,
      className: baseStyles,
    };

    // Add safe props from otherProps and destructured props to inputProps
    const getSafePropValue = (key: string): unknown => {
      switch (key) {
        case "placeholder":
          return placeholder;
        case "tabIndex":
          return tabIndex;
        case "title":
          return title;
        case "autoFocus":
          return autoFocus;
        case "readOnly":
          return readOnly;
        default:
          return otherProps[key];
      }
    };

    const safePropKeys = ["placeholder", "tabIndex", "title", "autoFocus", "readOnly"];
    for (const key of safePropKeys) {
      const value = getSafePropValue(key);
      if (value !== undefined) {
        inputProps[key] = value;
      }
    }

    // Build DatePicker config with only DatePicker-specific props
    // Input-specific props are passed via inputProps to prevent DOM warnings
    const calendarClassName = isDark ? "dark-datepicker" : "";
    const datePickerConfig = {
      // Core DatePicker props
      selected: selectedDate,
      onChange: handleChange,
      dateFormat,
      locale,
      // DatePicker wrapper/calendar props (these should NOT be forwarded to input)
      wrapperClassName: "w-full",
      calendarClassName,
      showPopperArrow: false,
      showMonthDropdown: true,
      showYearDropdown: true,
      dropdownMode: "select" as const,
      // Input-specific props via inputProps to prevent DOM warnings
      inputProps,
    };

    return <DatePicker ref={ref} {...datePickerConfig} {...otherProps} />;
  }
);

DateInput.displayName = "DateInput";
