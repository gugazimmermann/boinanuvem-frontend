import { describe, it, expect } from "vitest";
import { getTranslation, t } from "../translation-helpers";

describe("translation-helpers", () => {
  describe("getTranslation", () => {
    it("should return Portuguese translation when language is 'pt'", () => {
      const translations = { pt: "Português", es: "Español", en: "English" };
      expect(getTranslation("pt", translations)).toBe("Português");
    });

    it("should return Spanish translation when language is 'es'", () => {
      const translations = { pt: "Português", es: "Español", en: "English" };
      expect(getTranslation("es", translations)).toBe("Español");
    });

    it("should return English translation when language is 'en'", () => {
      const translations = { pt: "Português", es: "Español", en: "English" };
      expect(getTranslation("en", translations)).toBe("English");
    });

    it("should return English translation for unknown language", () => {
      const translations = { pt: "Português", es: "Español", en: "English" };
      expect(getTranslation("fr", translations)).toBe("English");
    });
  });

  describe("t", () => {
    it("should return Portuguese translation when language is 'pt'", () => {
      expect(t("pt", "Português", "Español", "English")).toBe("Português");
    });

    it("should return Spanish translation when language is 'es'", () => {
      expect(t("es", "Português", "Español", "English")).toBe("Español");
    });

    it("should return English translation when language is 'en'", () => {
      expect(t("en", "Português", "Español", "English")).toBe("English");
    });

    it("should return English translation for unknown language", () => {
      expect(t("fr", "Português", "Español", "English")).toBe("English");
    });
  });
});
