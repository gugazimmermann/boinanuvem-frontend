import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { LanguageInfo } from "~/types";
import type { Language } from "~/types";

export type { Language };

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

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
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

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const languageInfo = LANGUAGES[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languageInfo }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
