import { parseISO, differenceInHours, differenceInDays, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { enUS } from "date-fns/locale/en-US";
import { es } from "date-fns/locale/es";
import type { Language } from "~/types";
import type { Locale } from "date-fns";

export function getDateLocale(language: Language): Locale {
  switch (language) {
    case "en":
      return enUS;
    case "es":
      return es;
    default:
      return ptBR;
  }
}

export interface FormatRelativeTimeOptions {
  minutesAgo: (minutes: number) => string;
  hoursAgo: (hours: number) => string;
  daysAgo: (days: number) => string;
}

export function formatRelativeTime(dateString: string, options: FormatRelativeTimeOptions): string {
  const date = parseISO(dateString);
  const now = new Date();
  const minutes = differenceInMinutes(now, date);
  const hours = differenceInHours(now, date);
  const days = differenceInDays(now, date);

  if (minutes < 60) {
    return options.minutesAgo(minutes);
  } else if (hours < 24) {
    return options.hoursAgo(hours);
  } else {
    return options.daysAgo(days);
  }
}
