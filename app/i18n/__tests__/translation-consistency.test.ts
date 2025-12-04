import { describe, it, expect } from "vitest";
import { translations } from "../translations";

type KeySet = Set<string>;

function getAllKeys(obj: unknown, prefix = ""): KeySet {
  const keys = new Set<string>();

  if (obj === null || obj === undefined) {
    return keys;
  }

  if (typeof obj === "object" && !Array.isArray(obj)) {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      keys.add(fullKey);

      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const nestedKeys = getAllKeys(value, fullKey);
        nestedKeys.forEach((nestedKey) => keys.add(nestedKey));
      }
    }
  }

  return keys;
}

function getFunctionKeys(obj: unknown, prefix = ""): KeySet {
  const keys = new Set<string>();

  if (obj === null || obj === undefined) {
    return keys;
  }

  if (typeof obj === "object" && !Array.isArray(obj)) {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === "function") {
        keys.add(fullKey);
      } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        const nestedKeys = getFunctionKeys(value, fullKey);
        nestedKeys.forEach((nestedKey) => keys.add(nestedKey));
      }
    }
  }

  return keys;
}

describe("translation consistency", () => {
  it("should document translation key consistency across all languages", () => {
    const ptKeys = getAllKeys(translations.pt);
    const enKeys = getAllKeys(translations.en);
    const esKeys = getAllKeys(translations.es);

    const missingInEn = Array.from(ptKeys).filter((key) => !enKeys.has(key));
    const missingInEs = Array.from(ptKeys).filter((key) => !esKeys.has(key));
    const extraInEn = Array.from(enKeys).filter((key) => !ptKeys.has(key));
    const extraInEs = Array.from(esKeys).filter((key) => !ptKeys.has(key));

    const criticalSections = ["common"];
    const criticalKeysMissingInEn = missingInEn.filter((key) =>
      criticalSections.some((section) => key.startsWith(`${section}.`))
    );
    const criticalKeysMissingInEs = missingInEs.filter((key) =>
      criticalSections.some((section) => key.startsWith(`${section}.`))
    );
    const criticalKeysExtraInEn = extraInEn.filter((key) =>
      criticalSections.some((section) => key.startsWith(`${section}.`))
    );
    const criticalKeysExtraInEs = extraInEs.filter((key) =>
      criticalSections.some((section) => key.startsWith(`${section}.`))
    );

    expect(
      criticalKeysMissingInEn,
      `Critical keys missing in EN: ${criticalKeysMissingInEn.join(", ")}`
    ).toEqual([]);
    expect(
      criticalKeysMissingInEs,
      `Critical keys missing in ES: ${criticalKeysMissingInEs.join(", ")}`
    ).toEqual([]);
    expect(
      criticalKeysExtraInEn,
      `Critical keys extra in EN: ${criticalKeysExtraInEn.join(", ")}`
    ).toEqual([]);
    expect(
      criticalKeysExtraInEs,
      `Critical keys extra in ES: ${criticalKeysExtraInEs.join(", ")}`
    ).toEqual([]);

    if (
      missingInEn.length > 0 ||
      missingInEs.length > 0 ||
      extraInEn.length > 0 ||
      extraInEs.length > 0
    ) {
      console.warn(
        `Translation key inconsistencies detected: ${missingInEn.length} missing in EN, ${missingInEs.length} missing in ES, ${extraInEn.length} extra in EN, ${extraInEs.length} extra in ES`
      );
    }
  });

  it("should have the same function keys across all languages", () => {
    const ptFunctionKeys = getFunctionKeys(translations.pt);
    const enFunctionKeys = getFunctionKeys(translations.en);
    const esFunctionKeys = getFunctionKeys(translations.es);

    expect(ptFunctionKeys.size).toBe(enFunctionKeys.size);
    expect(ptFunctionKeys.size).toBe(esFunctionKeys.size);

    const allFunctionKeys = new Set([
      ...Array.from(ptFunctionKeys),
      ...Array.from(enFunctionKeys),
      ...Array.from(esFunctionKeys),
    ]);

    allFunctionKeys.forEach((key) => {
      expect(ptFunctionKeys.has(key) || enFunctionKeys.has(key) || esFunctionKeys.has(key)).toBe(
        true
      );
    });
  });

  it("should have common.daysAgo as a function in all languages", () => {
    expect(typeof translations.pt.common.daysAgo).toBe("function");
    expect(typeof translations.en.common.daysAgo).toBe("function");
    expect(typeof translations.es.common.daysAgo).toBe("function");
  });

  it("should have common section with same keys in all languages", () => {
    const ptCommonKeys = Object.keys(translations.pt.common);
    const enCommonKeys = Object.keys(translations.en.common);
    const esCommonKeys = Object.keys(translations.es.common);

    expect(ptCommonKeys.sort()).toEqual(enCommonKeys.sort());
    expect(ptCommonKeys.sort()).toEqual(esCommonKeys.sort());
  });

  it("should have all required common keys in all languages", () => {
    const requiredCommonKeys = [
      "language",
      "loading",
      "clearSearch",
      "cancel",
      "back",
      "save",
      "select",
      "month",
      "months",
      "today",
      "daysAgo",
      "dailyAverageGain",
      "uploadFiles",
      "uploadFile",
      "dragAndDrop",
      "accepted",
      "remove",
      "showPassword",
      "hidePassword",
      "toggleMenu",
      "incompleteAddress",
      "unknownError",
      "addressNotFound",
      "requestError",
      "total",
      "invalidEmail",
      "defaultUser",
      "defaultEmail",
      "notAvailable",
      "view",
      "edit",
      "delete",
      "saving",
      "emailRequired",
      "passwordRequired",
      "codeRequired",
      "passwordMismatch",
      "passwordMinLength",
      "sendCodeError",
      "resetPasswordError",
      "loginError",
      "invalidCredentials",
      "searchingAddress",
      "ariaLabels",
    ];

    requiredCommonKeys.forEach((key) => {
      expect(translations.pt.common).toHaveProperty(key);
      expect(translations.en.common).toHaveProperty(key);
      expect(translations.es.common).toHaveProperty(key);
    });
  });

  it("should have ariaLabels with same structure in all languages", () => {
    const ptAriaKeys = Object.keys(translations.pt.common.ariaLabels);
    const enAriaKeys = Object.keys(translations.en.common.ariaLabels);
    const esAriaKeys = Object.keys(translations.es.common.ariaLabels);

    expect(ptAriaKeys.sort()).toEqual(enAriaKeys.sort());
    expect(ptAriaKeys.sort()).toEqual(esAriaKeys.sort());
  });
});
