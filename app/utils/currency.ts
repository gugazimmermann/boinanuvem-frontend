import type { Language } from "~/contexts/language-context";

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
