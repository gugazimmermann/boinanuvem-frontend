import { YearMonthFilters } from "./year-month-filters";
import type { Property } from "~/types";

interface FinanceFiltersProps {
  readonly propertyFilter: string;
  readonly onPropertyFilterChange: (propertyId: string) => void;
  readonly selectedYear: string;
  readonly selectedMonth: string;
  readonly onYearChange: (year: string) => void;
  readonly onMonthChange: (month: string) => void;
  readonly onPageChange?: (page: number) => void;
  readonly properties: Property[];
  readonly propertyLabel: string;
  readonly allPropertiesLabel: string;
}

export function FinanceFilters({
  propertyFilter,
  onPropertyFilterChange,
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
  onPageChange,
  properties,
  propertyLabel,
  allPropertiesLabel,
}: FinanceFiltersProps) {
  const handlePropertyChange = (propertyId: string) => {
    onPropertyFilterChange(propertyId);
    onPageChange?.(1);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
        {propertyLabel}:
      </label>
      <select
        value={propertyFilter}
        onChange={(e) => handlePropertyChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
      >
        <option value="all">{allPropertiesLabel}</option>
        {properties.map((property) => (
          <option key={property.id} value={property.id}>
            {property.name}
          </option>
        ))}
      </select>
      <YearMonthFilters
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onYearChange={onYearChange}
        onMonthChange={onMonthChange}
        onPageChange={onPageChange}
      />
    </div>
  );
}
