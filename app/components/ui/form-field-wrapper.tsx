import type { ReactNode } from "react";

interface FormFieldWrapperProps {
  readonly label: string;
  readonly required?: boolean;
  readonly error?: string;
  readonly children: ReactNode;
  readonly className?: string;
}

export function FormFieldWrapper({
  label,
  required = false,
  error,
  children,
  className = "",
}: FormFieldWrapperProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
