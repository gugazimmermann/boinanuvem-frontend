import { useTranslation } from "~/i18n";

export interface ObservationFieldProps {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly error?: string;
  readonly disabled?: boolean;
  readonly placeholder?: string;
  readonly rows?: number;
  readonly required?: boolean;
  readonly className?: string;
}

export function ObservationField({
  label,
  value,
  onChange,
  error,
  disabled,
  placeholder,
  rows = 4,
  required = false,
  className = "",
}: ObservationFieldProps) {
  const t = useTranslation();

  const defaultPlaceholder =
    placeholder ||
    t.properties.details.movements.observationPlaceholder ||
    "Adicione observações sobre esta movimentação...";

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={rows}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 resize-none ${
          error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
        }`}
        placeholder={defaultPlaceholder}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
