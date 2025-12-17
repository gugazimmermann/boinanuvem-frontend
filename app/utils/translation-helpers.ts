/**
 * Helper functions to extract nested ternary operations for translations
 * These functions reduce cognitive complexity and improve maintainability
 */

/**
 * Get translation based on language
 */
export function getTranslation(
  language: string,
  translations: { pt: string; es: string; en: string }
): string {
  if (language === "pt") return translations.pt;
  if (language === "es") return translations.es;
  return translations.en;
}

/**
 * Get translation for a simple three-way choice
 */
export function t(language: string, pt: string, es: string, en: string): string {
  return getTranslation(language, { pt, es, en });
}
