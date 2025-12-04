import { useTranslation } from "~/i18n";
import type { Property } from "~/types";

export interface PropertyFilterProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly properties: Property[];
  readonly label?: string;
  readonly allPropertiesLabel?: string;
  readonly className?: string;
}

export function PropertyFilter({
  value,
  onChange,
  properties,
  label,
  allPropertiesLabel,
  className = "",
}: PropertyFilterProps) {
  const t = useTranslation();

  const defaultLabel = label || t.reproductiveIndexes?.propertyLabel || "Propriedade";
  const defaultAllLabel =
    allPropertiesLabel || t.reproductiveIndexes?.allProperties || "Todas as Propriedades";

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
        {defaultLabel}:
      </label>
      <select
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
      >
        <option value="all">{defaultAllLabel}</option>
        {properties.map((property) => (
          <option key={property.id} value={property.id}>
            {property.name}
          </option>
        ))}
      </select>
    </div>
  );
}
