import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Language, LanguageInfo } from "~/types";

export type { Language } from "~/types";

export const LANGUAGES: Record<Language, LanguageInfo> = {
  pt: {
    code: "pt",
    name: "Português",
    flag: "/flags/br.svg",
  },
  en: {
    code: "en",
    name: "English",
    flag: "/flags/us.svg",
  },
  es: {
    code: "es",
    name: "Español",
    flag: "/flags/es.svg",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  languageInfo: LanguageInfo;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { readonly children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (globalThis.window !== undefined) {
      const stored = localStorage.getItem("language") as Language | null;
      if (stored && LANGUAGES[stored]) return stored;

      const browserLang = navigator.language.split("-")[0] as Language;
      if (browserLang && LANGUAGES[browserLang]) {
        return browserLang;
      }
    }
    return "pt";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

  const languageInfo = LANGUAGES[language];

  const contextValue = useMemo(
    () => ({ language, setLanguage, languageInfo }),
    [language, setLanguage, languageInfo]
  );

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
