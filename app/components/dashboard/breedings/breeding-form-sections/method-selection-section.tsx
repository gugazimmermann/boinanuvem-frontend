import { useTranslation } from "~/i18n";
import type { BreedingMethod } from "~/types";

export interface MethodSelectionSectionProps {
  readonly selectedMethod: BreedingMethod | "";
  readonly onMethodChange: (method: BreedingMethod) => void;
  readonly error?: string;
  readonly disabled?: boolean;
}

export function MethodSelectionSection({
  selectedMethod,
  onMethodChange,
  error,
  disabled,
}: MethodSelectionSectionProps) {
  const t = useTranslation();

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {t.breedings.new.methodTitle}
      </h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t.breedings.new.methodLabel} <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded">
            <input
              type="radio"
              name="method"
              value="natural"
              checked={selectedMethod === "natural"}
              onChange={() => onMethodChange("natural")}
              disabled={disabled}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm text-gray-900 dark:text-gray-100">
              {t.breedings.new.methodNatural}
            </span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded">
            <input
              type="radio"
              name="method"
              value="artificial_insemination"
              checked={selectedMethod === "artificial_insemination"}
              onChange={() => onMethodChange("artificial_insemination")}
              disabled={disabled}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm text-gray-900 dark:text-gray-100">
              {t.breedings.new.methodAI}
            </span>
          </label>
        </div>
        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    </div>
  );
}
