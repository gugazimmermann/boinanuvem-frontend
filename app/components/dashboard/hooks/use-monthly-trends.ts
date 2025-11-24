import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from "date-fns";
import type { Locale } from "date-fns";

export interface MonthlyTrendDataPoint {
  month: string;
  [key: string]: string | number;
}

export interface MonthlyTrendOptions<T> {
  data: T[];
  dateField: keyof T;
  monthsBack?: number;
  dateLocale: Locale;
  currentDate: Date;
  aggregator: (items: T[], monthStart: Date, monthEnd: Date) => Record<string, number>;
}

export function useMonthlyTrends<T extends Record<string, unknown>>(
  options: MonthlyTrendOptions<T>
): MonthlyTrendDataPoint[] {
  const { data, dateField, monthsBack = 5, dateLocale, currentDate, aggregator } = options;

  return useMemo(() => {
    const months: MonthlyTrendDataPoint[] = [];
    for (let i = monthsBack; i >= 0; i--) {
      const monthDate = subMonths(currentDate, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthItems = data.filter((item) => {
        const itemDate = parseISO(String(item[dateField]));
        return itemDate >= monthStart && itemDate <= monthEnd;
      });

      const aggregated = aggregator(monthItems, monthStart, monthEnd);

      months.push({
        month: format(monthDate, "MMM", { locale: dateLocale }),
        ...aggregated,
      });
    }
    return months;
  }, [data, dateField, monthsBack, dateLocale, currentDate, aggregator]);
}
