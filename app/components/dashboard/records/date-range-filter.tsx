import { useTranslation } from "~/i18n";
import { DateInput } from "~/components/ui/date-input";

export interface DateRangeFilterProps {
  readonly startDate: string;
  readonly endDate: string;
  readonly onStartDateChange: (value: string) => void;
  readonly onEndDateChange: (value: string) => void;
  readonly startDateLabel?: string;
  readonly endDateLabel?: string;
  readonly className?: string;
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
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
          {defaultStartLabel}:
        </label>
        <div className="w-[150px]">
          <DateInput
            value={startDate}
            onChange={(e) => {
              onStartDateChange(e.target.value);
            }}
            className="mt-0! px-3! py-2! text-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
          {defaultEndLabel}:
        </label>
        <div className="w-[150px]">
          <DateInput
            value={endDate}
            onChange={(e) => {
              onEndDateChange(e.target.value);
            }}
            className="mt-0! px-3! py-2! text-sm"
          />
        </div>
      </div>
    </div>
  );
}
