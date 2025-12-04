import { describe, it, expect } from "vitest";
import { translations, type TranslationKey, type Translations } from "../translations";
import { pt } from "../translations/pt";
import { en } from "../translations/en";
import { es } from "../translations/es";

describe("translations", () => {
  it("should export translations object with all languages", () => {
    expect(translations).toBeDefined();
    expect(translations.pt).toBeDefined();
    expect(translations.en).toBeDefined();
    expect(translations.es).toBeDefined();
  });

  it("should have pt translation matching pt export", () => {
    expect(translations.pt).toBe(pt);
  });

  it("should have en translation matching en export", () => {
    expect(translations.en).toBe(en);
  });

  it("should have es translation matching es export", () => {
    expect(translations.es).toBe(es);
  });

  it("should have all required top-level keys in each translation", () => {
    const requiredKeys = ["common"];
    const ptKeys = Object.keys(translations.pt);
    const enKeys = Object.keys(translations.en);
    const esKeys = Object.keys(translations.es);

    requiredKeys.forEach((key) => {
      expect(ptKeys).toContain(key);
      expect(enKeys).toContain(key);
      expect(esKeys).toContain(key);
    });
  });

  it("should have common section in all translations", () => {
    expect(translations.pt.common).toBeDefined();
    expect(translations.en.common).toBeDefined();
    expect(translations.es.common).toBeDefined();
  });

  it("should have common.language in all translations", () => {
    expect(translations.pt.common.language).toBeDefined();
    expect(translations.en.common.language).toBeDefined();
    expect(translations.es.common.language).toBeDefined();
  });

  it("should have common.loading in all translations", () => {
    expect(translations.pt.common.loading).toBeDefined();
    expect(translations.en.common.loading).toBeDefined();
    expect(translations.es.common.loading).toBeDefined();
  });

  it("should have common.daysAgo as a function in all translations", () => {
    expect(typeof translations.pt.common.daysAgo).toBe("function");
    expect(typeof translations.en.common.daysAgo).toBe("function");
    expect(typeof translations.es.common.daysAgo).toBe("function");
  });

  it("should export TranslationKey type", () => {
    const testKey: TranslationKey = {} as TranslationKey;
    expect(testKey).toBeDefined();
  });

  it("should export Translations type", () => {
    const testTranslations: Translations = translations;
    expect(testTranslations).toBe(translations);
    expect(testTranslations.pt).toBeDefined();
    expect(testTranslations.en).toBeDefined();
    expect(testTranslations.es).toBeDefined();
  });

  it("should have translations object with correct structure", () => {
    expect(Object.keys(translations)).toEqual(["pt", "en", "es"]);
    expect(translations.pt).toBe(pt);
    expect(translations.en).toBe(en);
    expect(translations.es).toBe(es);
  });
});
