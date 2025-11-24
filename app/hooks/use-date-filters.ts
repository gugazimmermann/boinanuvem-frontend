import { useMemo } from "react";
import { useLanguage } from "~/contexts/language-context";
import { useTranslation } from "~/i18n";

export interface DateFilterOptions {
  value: string;
  label: string;
}

export function useDateFilters() {
  const { language } = useLanguage();
  const t = useTranslation();

  const yearOptions = useMemo<DateFilterOptions[]>(() => {
    const options: DateFilterOptions[] = [{ value: "all", label: t.cashFlow.filters.allYears }];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    options.push({ value: String(currentYear - 1), label: String(currentYear - 1) });
    options.push({ value: String(currentYear), label: String(currentYear) });

    return options;
  }, [t]);

  const monthOptions = useMemo<DateFilterOptions[]>(() => {
    const localeMap: Record<string, string> = {
      pt: "pt-BR",
      en: "en-US",
      es: "es-ES",
    };
    const locale = localeMap[language] || "pt-BR";
    const options: DateFilterOptions[] = [{ value: "all", label: t.cashFlow.filters.allMonths }];

    for (let month = 1; month <= 12; month++) {
      const monthName = new Date(2000, month - 1).toLocaleDateString(locale, {
        month: "long",
      });
      options.push({ value: String(month), label: monthName });
    }

    return options;
  }, [language, t]);

  return {
    yearOptions,
    monthOptions,
  };
}
