import { forwardRef, useId, type SelectHTMLAttributes } from "react";

interface AuthSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  label?: string;
  helperText?: string;
  error?: string;
  className?: string;
  selectClassName?: string;
  options: Array<{ value: string; label: string }>;
}

const baseSelectStyles = [
  "block",
  "w-full",
  "px-4",
  "py-2",
  "mt-2",
  "text-gray-700",
  "bg-white",
  "border",
  "rounded-lg",
  "focus:border-blue-400",
  "focus:ring-opacity-40",
  "focus:outline-none",
  "focus:ring",
  "focus:ring-blue-300",
  "transition-colors",
  "appearance-none",
  "pr-10",
].join(" ");

const errorSelectStyles = ["border-red-400", "focus:border-red-400", "focus:ring-red-300"].join(
  " "
);

export const AuthSelect = forwardRef<HTMLSelectElement, AuthSelectProps>(
  (
    { label, helperText, error, className = "", selectClassName = "", id, options, ...selectProps },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const hasError = Boolean(error);
    const displayText = error || helperText;

    const selectStyles = [baseSelectStyles, hasError && errorSelectStyles, selectClassName]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={className}>
        {label && (
          <label htmlFor={selectId} className="block text-sm text-gray-500">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={selectStyles}
            aria-invalid={hasError}
            {...selectProps}
          >
            <option value="">Selecione...</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 pr-3">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {displayText && (
          <p className={`mt-3 text-xs ${hasError ? "text-red-500" : "text-gray-400"}`}>
            {displayText}
          </p>
        )}
      </div>
    );
  }
);

AuthSelect.displayName = "AuthSelect";
