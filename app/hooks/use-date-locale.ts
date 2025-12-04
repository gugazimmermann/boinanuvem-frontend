import { useMemo } from "react";
import { ptBR } from "date-fns/locale/pt-BR";
import { enUS } from "date-fns/locale/en-US";
import { es } from "date-fns/locale/es";
import { useLanguage } from "~/contexts/language-context";

export function useDateLocale() {
  const { language } = useLanguage();

  const dateLocale = useMemo(() => {
    switch (language) {
      case "en":
        return enUS;
      case "es":
        return es;
      default:
        return ptBR;
    }
  }, [language]);

  return dateLocale;
}
