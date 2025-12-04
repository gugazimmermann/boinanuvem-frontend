import { getLocaleForDateTime as getLocaleForDateTimeFromFormatting } from "./formatting";

export function getLocaleForDateTime(language: string): string {
  return getLocaleForDateTimeFromFormatting(language as "pt" | "en" | "es");
}

export function createCurrencyFormatter(locale: string) {
  return (value: number) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };
}
