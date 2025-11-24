import { useTranslation } from "~/i18n";

export interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  startDateLabel?: string;
  endDateLabel?: string;
  className?: string;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startDateLabel,
  endDateLabel,
  className = "",
}: DateRangeFilterProps) {
  const t = useTranslation();

  const defaultStartLabel = startDateLabel || t.sales?.filters?.startDate || "Data Inicial";
  const defaultEndLabel = endDateLabel || t.sales?.filters?.endDate || "Data Final";

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
        {defaultStartLabel}:
      </label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => {
          onStartDateChange(e.target.value);
        }}
        className="px-3 py-2 bg-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 text-sm"
      />
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
        {defaultEndLabel}:
      </label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => {
          onEndDateChange(e.target.value);
        }}
        className="px-3 py-2 bg-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 text-sm"
      />
    </div>
  );
}
