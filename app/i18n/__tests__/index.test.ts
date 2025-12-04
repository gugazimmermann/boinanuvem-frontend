import { describe, it, expect } from "vitest";
import { useTranslation, translations } from "../index";
import type { TranslationKey, Translations } from "../index";

describe("i18n index", () => {
  it("should export useTranslation hook", () => {
    expect(useTranslation).toBeDefined();
    expect(typeof useTranslation).toBe("function");
  });

  it("should export translations object", () => {
    expect(translations).toBeDefined();
    expect(typeof translations).toBe("object");
    expect(translations.pt).toBeDefined();
    expect(translations.en).toBeDefined();
    expect(translations.es).toBeDefined();
  });

  it("should export TranslationKey type", () => {
    const testKey: TranslationKey = {} as TranslationKey;
    expect(testKey).toBeDefined();
  });

  it("should export Translations type", () => {
    const testTranslations: Translations = {} as Translations;
    expect(testTranslations).toBeDefined();
  });

  it("should have correct type for translations", () => {
    const testTranslations: Translations = translations;
    expect(testTranslations).toBe(translations);
  });
});
