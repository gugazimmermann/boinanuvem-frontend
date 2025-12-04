import { useMemo } from "react";
import { useLanguage } from "~/contexts/language-context";
import { getLocaleForDateTime } from "~/utils/formatting";
import { getStringValue } from "~/utils/string-helpers";
import type { CashFlow, AccountsPayable, AccountsReceivable } from "~/types";

export interface SortState {
  column: string | null;
  direction: "asc" | "desc";
}

function compareFinanceValues(aValue: unknown, bValue: unknown, locale: string): number {
  if (aValue == null && bValue == null) return 0;
  if (aValue == null) return 1;
  if (bValue == null) return -1;

  if (typeof aValue === "string" && typeof bValue === "string") {
    return aValue.localeCompare(bValue, locale, {
      sensitivity: "base",
    });
  }

  if (typeof aValue === "number" && typeof bValue === "number") {
    return aValue - bValue;
  }

  const aStr = getStringValue(aValue);
  const bStr = getStringValue(bValue);
  return aStr.localeCompare(bStr, locale);
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
      const comparison = compareFinanceValues(aValue, bValue, localeForDateTime);
      return sortState.direction === "asc" ? comparison : -comparison;
    });
  }, [data, sortState, localeForDateTime]);

  return sortedData;
}
