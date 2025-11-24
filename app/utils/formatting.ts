import { format } from "date-fns";
import type { Language } from "~/types";
import { AreaType } from "~/types";
import { getDateLocale } from "./date";

export function formatAreaType(type: AreaType): string {
  const typeMap: Record<AreaType, string> = {
    [AreaType.HECTARES]: "ha",
    [AreaType.SQUARE_METERS]: "m²",
    [AreaType.SQUARE_FEET]: "ft²",
    [AreaType.ACRES]: "ac",
    [AreaType.SQUARE_KILOMETERS]: "km²",
    [AreaType.SQUARE_MILES]: "mi²",
  };
  return typeMap[type] || type;
}

export function getLocaleForDateTime(language: Language): string {
  const localeMap: Record<Language, string> = {
    pt: "pt-BR",
    en: "en-US",
    es: "es-ES",
  };
  return localeMap[language] || "pt-BR";
}

export function getLocaleForNumber(language: Language): string {
  const localeMap: Record<Language, string> = {
    pt: "pt-BR",
    en: "en-US",
    es: "es-ES",
  };
  return localeMap[language] || "pt-BR";
}

export function formatDate(
  dateString: string | Date,
  language: Language = "pt",
  formatString?: string
): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  const dateLocale = getDateLocale(language);
  const dateFormat = formatString || (language === "en" ? "MM/dd/yyyy" : "dd/MM/yyyy");
  return format(date, dateFormat, { locale: dateLocale });
}

export function formatDateTime(dateString: string | Date, language: Language = "pt"): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  const dateLocale = getDateLocale(language);
  return format(date, "dd/MM/yyyy HH:mm", { locale: dateLocale });
}

export function formatCurrency(value: number, language: Language = "pt"): string {
  const locale = getLocaleForNumber(language);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatNumber(
  value: number,
  language: Language = "pt",
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const locale = getLocaleForNumber(language);
  return value.toLocaleString(locale, {
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  });
}
