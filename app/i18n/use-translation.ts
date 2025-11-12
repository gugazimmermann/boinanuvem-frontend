import { useLanguage } from "~/contexts/language-context";
import { translations } from "./translations";

export function useTranslation() {
  const { language } = useLanguage();
  return translations[language];
}
