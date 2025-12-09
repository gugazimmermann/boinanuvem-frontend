import { Select } from "~/components/ui";
import { useDateFilters } from "~/hooks/use-date-filters";

interface YearMonthFiltersProps {
  readonly selectedYear: string;
  readonly selectedMonth: string;
  readonly onYearChange: (year: string) => void;
  readonly onMonthChange: (month: string) => void;
  readonly onPageChange?: (page: number) => void;
}

export function YearMonthFilters({
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
  onPageChange,
}: YearMonthFiltersProps) {
  const { yearOptions, monthOptions } = useDateFilters();

  const handleYearChange = (year: string) => {
    onYearChange(year);
    onPageChange?.(1);
  };

  const handleMonthChange = (month: string) => {
    onMonthChange(month);
    onPageChange?.(1);
  };

  return (
    <div data-testid="year-month-filters" className="flex items-center gap-2">
      <div className="w-32">
        <Select
          value={selectedYear}
          onChange={(e) => handleYearChange(e.target.value)}
          options={yearOptions}
          selectClassName="text-xs sm:text-sm py-2"
        />
      </div>
      <div className="w-36">
        <Select
          value={selectedMonth}
          onChange={(e) => handleMonthChange(e.target.value)}
          options={monthOptions}
          selectClassName="text-xs sm:text-sm py-2"
        />
      </div>
    </div>
  );
}
