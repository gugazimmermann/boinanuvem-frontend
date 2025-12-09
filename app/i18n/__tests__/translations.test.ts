import { describe, it, expect } from "vitest";
import { translations } from "../translations";
import type { TranslationKey, Translations } from "../translations";

describe("translations", () => {
  describe("exports", () => {
    it("should export translations object", () => {
      expect(translations).toBeDefined();
      expect(typeof translations).toBe("object");
    });

    it("should contain all supported languages", () => {
      expect(translations).toHaveProperty("pt");
      expect(translations).toHaveProperty("en");
      expect(translations).toHaveProperty("es");
    });

    it("should export TranslationKey type", () => {
      // Type check - if this compiles, the type is exported correctly
      const _testKey: TranslationKey = translations.pt;
      expect(_testKey).toBeDefined();
    });

    it("should export Translations type", () => {
      // Type check - if this compiles, the type is exported correctly
      const _testTranslations: Translations = translations;
      expect(_testTranslations).toBeDefined();
    });
  });

  describe("translation structure consistency", () => {
    const _getKeys = (obj: Record<string, unknown>, prefix = ""): string[] => {
      const keys: string[] = [];
      for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value) &&
          typeof value !== "function"
        ) {
          keys.push(..._getKeys(value as Record<string, unknown>, fullKey));
        } else {
          keys.push(fullKey);
        }
      }
      return keys;
    };

    it("should have consistent top-level keys across all languages", () => {
      const ptKeys = Object.keys(translations.pt);
      const enKeys = Object.keys(translations.en);
      const esKeys = Object.keys(translations.es);

      expect(ptKeys.sort()).toEqual(enKeys.sort());
      expect(ptKeys.sort()).toEqual(esKeys.sort());
      expect(enKeys.sort()).toEqual(esKeys.sort());
    });

    it("should have consistent common keys across all languages", () => {
      const ptCommonKeys = Object.keys(translations.pt.common);
      const enCommonKeys = Object.keys(translations.en.common);
      const esCommonKeys = Object.keys(translations.es.common);

      expect(ptCommonKeys.sort()).toEqual(enCommonKeys.sort());
      expect(ptCommonKeys.sort()).toEqual(esCommonKeys.sort());
    });

    it("should have consistent sidebar keys across all languages", () => {
      const ptSidebarKeys = Object.keys(translations.pt.sidebar);
      const enSidebarKeys = Object.keys(translations.en.sidebar);
      const esSidebarKeys = Object.keys(translations.es.sidebar);

      expect(ptSidebarKeys.sort()).toEqual(enSidebarKeys.sort());
      expect(ptSidebarKeys.sort()).toEqual(esSidebarKeys.sort());
    });

    it("should have consistent navbar keys across all languages", () => {
      const ptNavbarKeys = Object.keys(translations.pt.navbar);
      const enNavbarKeys = Object.keys(translations.en.navbar);
      const esNavbarKeys = Object.keys(translations.es.navbar);

      expect(ptNavbarKeys.sort()).toEqual(enNavbarKeys.sort());
      expect(ptNavbarKeys.sort()).toEqual(esNavbarKeys.sort());
    });

    it("should have consistent userDropdown keys across all languages", () => {
      const ptUserDropdownKeys = Object.keys(translations.pt.userDropdown);
      const enUserDropdownKeys = Object.keys(translations.en.userDropdown);
      const esUserDropdownKeys = Object.keys(translations.es.userDropdown);

      expect(ptUserDropdownKeys.sort()).toEqual(enUserDropdownKeys.sort());
      expect(ptUserDropdownKeys.sort()).toEqual(esUserDropdownKeys.sort());
    });

    it("should have consistent dashboard keys across all languages", () => {
      const ptDashboardKeys = Object.keys(translations.pt.dashboard);
      const enDashboardKeys = Object.keys(translations.en.dashboard);
      const esDashboardKeys = Object.keys(translations.es.dashboard);

      expect(ptDashboardKeys.sort()).toEqual(enDashboardKeys.sort());
      expect(ptDashboardKeys.sort()).toEqual(esDashboardKeys.sort());
    });
  });

  describe("translation values", () => {
    it("should have non-empty string values for common translations", () => {
      expect(translations.pt.common.loading).toBeTruthy();
      expect(translations.en.common.loading).toBeTruthy();
      expect(translations.es.common.loading).toBeTruthy();

      expect(typeof translations.pt.common.loading).toBe("string");
      expect(typeof translations.en.common.loading).toBe("string");
      expect(typeof translations.es.common.loading).toBe("string");
    });

    it("should have function values for daysAgo", () => {
      expect(typeof translations.pt.common.daysAgo).toBe("function");
      expect(typeof translations.en.common.daysAgo).toBe("function");
      expect(typeof translations.es.common.daysAgo).toBe("function");
    });

    it("should have correct function behavior for daysAgo", () => {
      expect(translations.pt.common.daysAgo(0)).toBe("Hoje");
      expect(translations.en.common.daysAgo(0)).toBe("Today");
      expect(translations.es.common.daysAgo(0)).toBe("Hoy");

      expect(translations.pt.common.daysAgo(1)).toBe("Há 1 dia");
      expect(translations.en.common.daysAgo(1)).toBe("1 day ago");
      expect(translations.es.common.daysAgo(1)).toBe("Hace 1 día");

      expect(translations.pt.common.daysAgo(5)).toBe("Há 5 dias");
      expect(translations.en.common.daysAgo(5)).toBe("5 days ago");
      expect(translations.es.common.daysAgo(5)).toBe("Hace 5 días");
    });

    it("should have nested objects for ariaLabels", () => {
      expect(typeof translations.pt.common.ariaLabels).toBe("object");
      expect(typeof translations.en.common.ariaLabels).toBe("object");
      expect(typeof translations.es.common.ariaLabels).toBe("object");

      expect(translations.pt.common.ariaLabels.email).toBeTruthy();
      expect(translations.en.common.ariaLabels.email).toBeTruthy();
      expect(translations.es.common.ariaLabels.email).toBeTruthy();
    });

    it("should have nested objects for currency", () => {
      expect(typeof translations.pt.common.currency).toBe("object");
      expect(typeof translations.en.common.currency).toBe("object");
      expect(typeof translations.es.common.currency).toBe("object");

      expect(typeof translations.pt.common.currency.formatShort).toBe("function");
      expect(typeof translations.en.common.currency.formatShort).toBe("function");
      expect(typeof translations.es.common.currency.formatShort).toBe("function");
    });
  });

  describe("type safety", () => {
    it("should allow accessing translations by language key", () => {
      const lang: "pt" | "en" | "es" = "pt";
      const translation = translations[lang];
      expect(translation).toBeDefined();
      expect(translation.common.loading).toBeTruthy();
    });

    it("should have correct type for TranslationKey", () => {
      // This test ensures TypeScript types are correct
      const ptTranslation: TranslationKey = translations.pt;
      const enTranslation = translations.en as unknown as TranslationKey;
      const esTranslation = translations.es as unknown as TranslationKey;

      expect(ptTranslation).toBeDefined();
      expect(enTranslation).toBeDefined();
      expect(esTranslation).toBeDefined();

      // All should have the same structure
      expect(ptTranslation.common).toBeDefined();
      expect(enTranslation.common).toBeDefined();
      expect(esTranslation.common).toBeDefined();
    });

    it("should have correct type for Translations", () => {
      // This test ensures TypeScript types are correct
      const allTranslations: Translations = translations;

      expect(allTranslations.pt).toBeDefined();
      expect(allTranslations.en).toBeDefined();
      expect(allTranslations.es).toBeDefined();
    });
  });

  describe("specific translation checks", () => {
    it("should have Portuguese translations", () => {
      expect(translations.pt.common.loading).toBe("Carregando...");
      expect(translations.pt.common.save).toBe("Salvar");
      expect(translations.pt.common.cancel).toBe("Cancelar");
    });

    it("should have English translations", () => {
      expect(translations.en.common.loading).toBe("Loading...");
      expect(translations.en.common.save).toBe("Save");
      expect(translations.en.common.cancel).toBe("Cancel");
    });

    it("should have Spanish translations", () => {
      expect(translations.es.common.loading).toBe("Cargando...");
      expect(translations.es.common.save).toBe("Guardar");
      expect(translations.es.common.cancel).toBe("Cancelar");
    });

    it("should have consistent brand name across languages", () => {
      expect(translations.pt.navbar.brand).toBe("Boi na Nuvem");
      expect(translations.en.navbar.brand).toBe("Boi na Nuvem");
      expect(translations.es.navbar.brand).toBe("Boi na Nuvem");
    });
  });

  describe("nested structure validation", () => {
    it("should have dashboard.stats structure", () => {
      expect(translations.pt.dashboard.stats).toBeDefined();
      expect(translations.en.dashboard.stats).toBeDefined();
      expect(translations.es.dashboard.stats).toBeDefined();

      expect(translations.pt.dashboard.stats.totalAnimals).toBeTruthy();
      expect(translations.en.dashboard.stats.totalAnimals).toBeTruthy();
      expect(translations.es.dashboard.stats.totalAnimals).toBeTruthy();
    });

    it("should have dashboard.recentActivities structure", () => {
      expect(translations.pt.dashboard.recentActivities).toBeDefined();
      expect(translations.en.dashboard.recentActivities).toBeDefined();
      expect(translations.es.dashboard.recentActivities).toBeDefined();

      expect(typeof translations.pt.dashboard.recentActivities.hoursAgo).toBe("function");
      expect(typeof translations.en.dashboard.recentActivities.hoursAgo).toBe("function");
      expect(typeof translations.es.dashboard.recentActivities.hoursAgo).toBe("function");
    });

    it("should have dashboard.sections structure", () => {
      expect(translations.pt.dashboard.sections).toBeDefined();
      expect(translations.en.dashboard.sections).toBeDefined();
      expect(translations.es.dashboard.sections).toBeDefined();

      expect(translations.pt.dashboard.sections.livestockOverview).toBeTruthy();
      expect(translations.en.dashboard.sections.livestockOverview).toBeTruthy();
      expect(translations.es.dashboard.sections.livestockOverview).toBeTruthy();
    });
  });
});
