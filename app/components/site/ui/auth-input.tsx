import { forwardRef, useId, useState, type InputHTMLAttributes } from "react";
import { useTranslation } from "~/i18n/use-translation";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  label?: string;
  helperText?: string;
  error?: string;
  className?: string;
  inputClassName?: string;
  showPasswordToggle?: boolean;
}

const baseInputStyles = [
  "block",
  "w-full",
  "px-4",
  "py-2",
  "mt-2",
  "text-gray-700",
  "placeholder-gray-500",
  "bg-white",
  "border",
  "rounded-lg",
  "focus:border-blue-400",
  "focus:ring-opacity-40",
  "focus:outline-none",
  "focus:ring",
  "focus:ring-blue-300",
  "transition-colors",
].join(" ");

const errorInputStyles = ["border-red-400", "focus:border-red-400", "focus:ring-red-300"].join(" ");

export const AuthInput = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      className = "",
      inputClassName = "",
      id,
      type = "text",
      showPasswordToggle = false,
      ...inputProps
    },
    ref
  ) => {
    const t = useTranslation();
    const generatedId = useId();
    const inputId = id || generatedId;
    const hasError = Boolean(error);
    const displayText = error || helperText;
    const helperId = displayText ? `${inputId}-helper` : undefined;
    const isPasswordType = type === "password";
    const shouldShowToggle = isPasswordType && showPasswordToggle;
    const [showPassword, setShowPassword] = useState(false);
    const inputType = shouldShowToggle && showPassword ? "text" : type;

    const inputStyles = [
      baseInputStyles,
      hasError && errorInputStyles,
      shouldShowToggle && "pr-10",
      inputClassName,
    ]
      .filter(Boolean)
      .join(" ");

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <div className={className}>
        {label && (
          <label htmlFor={inputId} className="block text-sm text-gray-500">
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={inputStyles}
            aria-invalid={hasError}
            aria-describedby={helperId}
            {...inputProps}
          />

          {shouldShowToggle && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors cursor-pointer"
              aria-label={showPassword ? t.common.hidePassword : t.common.showPassword}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m13.42 13.42L3 3m16.71 16.71L19.71 21M12 9a3 3 0 00-3 3c0 1.657 1.343 3 3 3s3-1.343 3-3a3 3 0 00-3-3z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          )}
        </div>

        {displayText && (
          <p
            id={helperId}
            className={`mt-3 text-xs ${hasError ? "text-red-500" : "text-gray-400"}`}
          >
            {displayText}
          </p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
