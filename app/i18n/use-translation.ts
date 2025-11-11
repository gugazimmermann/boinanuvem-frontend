import { useLanguage } from "~/contexts/language-context";
import { translations } from "./translations";

/**
 * Hook to access translations based on the current language
 * @returns Translation object for the current language
 */
export function useTranslation() {
  const { language } = useLanguage();
  return translations[language];
}

