import { useMemo } from "react";
import { useLanguage } from "~/contexts/language-context";
import { getLocaleForDateTime } from "~/utils/formatting";
import type { SortDirection } from "~/components/ui";
import type { CashFlow, AccountsPayable, AccountsReceivable } from "~/types";

export interface SortState {
  column: string | null;
  direction: SortDirection;
}

export function useFinanceSort<T extends CashFlow | AccountsPayable | AccountsReceivable>(
  data: T[],
  sortState: SortState
) {
  const { language } = useLanguage();
  const localeForDateTime = useMemo(() => getLocaleForDateTime(language), [language]);

  const sortedData = useMemo(() => {
    if (!sortState.column || !sortState.direction) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortState.column!];
      const bValue = b[sortState.column!];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue, localeForDateTime, {
          sensitivity: "base",
        });
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue), localeForDateTime);
      }

      return sortState.direction === "asc" ? comparison : -comparison;
    });
  }, [data, sortState, localeForDateTime]);

  return sortedData;
}
