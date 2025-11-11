import { useState, useRef, useEffect } from "react";
import { useLanguage, LANGUAGES, type Language } from "~/contexts/language-context";
import { useTranslation } from "~/i18n";
import { DASHBOARD_COLORS } from "../utils/colors";

export function LanguageSelectorMenuItem() {
  const { language, setLanguage, languageInfo } = useLanguage();
  const t = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-300 capitalize transition-colors duration-300 transform hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <img
            src={languageInfo.flag}
            alt={languageInfo.name}
            className="w-5 h-5 rounded-sm object-cover"
          />
          <span>{t.common.language}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">{languageInfo.name}</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 15.713L18.01 9.70299L16.597 8.28799L12 12.888L7.40399 8.28799L5.98999 9.70199L12 15.713Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-30 mt-1 mb-1 overflow-hidden origin-top bg-white dark:bg-gray-800 rounded-md shadow-xl dark:shadow-2xl border border-gray-200 dark:border-gray-700">
          {Object.values(LANGUAGES).map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-left transition-colors duration-200 cursor-pointer ${
                language === lang.code
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <img
                src={lang.flag}
                alt={lang.name}
                className="w-5 h-5 rounded-sm object-cover flex-shrink-0"
              />
              <span className="flex-1">{lang.name}</span>
              {language === lang.code && (
                <svg
                  className="w-4 h-4 flex-shrink-0 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: DASHBOARD_COLORS.primary }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

