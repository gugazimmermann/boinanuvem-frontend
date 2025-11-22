import type { Language } from "~/contexts/language-context";

/**
 * Formats a number as currency based on the current language
 * @param value - The numeric value to format
 * @param language - The current language code (pt, en, es)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, language: Language = "pt"): string {
  const localeMap: Record<Language, string> = {
    pt: "pt-BR",
    en: "en-US",
    es: "es-ES",
  };

  return new Intl.NumberFormat(localeMap[language], {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
