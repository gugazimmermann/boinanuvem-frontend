import type { Language } from "~/types";
import { getLocaleForCurrency } from "./formatting";

/**
 * Masks a currency value as the user types, formatting it according to the selected language
 * @param value - The raw input value (digits only or partially formatted)
 * @param language - The current language (pt, en, es)
 * @returns Formatted currency string (e.g., "R$ 1.234,56" for pt-BR, "$1,234.56" for en-US)
 */
export function maskCurrency(value: string, language: Language): string {
  // Remove all non-digit characters
  const digits = value.replaceAll(/\D/g, "");
  if (!digits) return "";

  // Convert to number (treating as cents)
  const numberValue = Number(digits) / 100;

  // Format according to locale
  const locale = getLocaleForCurrency(language);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BRL",
  }).format(numberValue);
}

/**
 * Internal helper function to parse European format (pt-BR, es-ES): 1.234,56 or 1234,56
 * @param sanitized - The sanitized string containing only digits, dots, commas, and minus
 * @returns The parsed numeric value
 */
function parseEuropeanFormat(sanitized: string): number {
  if (sanitized.includes(",")) {
    // Has decimal separator (comma)
    const withoutThousands = sanitized.replaceAll(".", "");
    const normalized = withoutThousands.replace(",", ".");
    return Number.parseFloat(normalized) || 0;
  }
  // No decimal separator, treat as integer
  const withoutThousands = sanitized.replaceAll(".", "");
  return Number.parseFloat(withoutThousands) || 0;
}

/**
 * Internal helper function to parse US format: 1,234.56 or 1234.56
 * @param sanitized - The sanitized string containing only digits, dots, commas, and minus
 * @returns The parsed numeric value
 */
function parseUSFormat(sanitized: string): number {
  if (sanitized.includes(".")) {
    // Has decimal separator (dot)
    // Remove thousands separators (commas)
    const withoutThousands = sanitized.replaceAll(",", "");

    // If multiple dots exist, treat the last one as decimal separator
    const dotParts = withoutThousands.split(".");
    if (dotParts.length > 2) {
      const decimal = dotParts.pop();
      const joined = `${dotParts.join("")}.${decimal}`;
      return Number.parseFloat(joined) || 0;
    }

    return Number.parseFloat(withoutThousands) || 0;
  }
  // No decimal separator, treat as integer (remove commas)
  const withoutThousands = sanitized.replaceAll(",", "");
  return Number.parseFloat(withoutThousands) || 0;
}

/**
 * Parses a formatted currency string to a number, respecting the locale format
 * Handles formats: pt-BR (1.234,56), en-US (1,234.56), es-ES (1.234,56)
 * @param value - The formatted currency string
 * @param language - The current language to determine the format
 * @returns The numeric value (always a number, never a string)
 */
export function parseCurrency(value: string, language: Language): number {
  if (!value || typeof value !== "string") return 0;

  // Remove currency symbols and other non-numeric characters except digits, dots, commas, and minus
  const sanitized = value.replaceAll(/[^\d.,-]/g, "");
  if (!sanitized) return 0;

  // Determine locale-specific separators
  const locale = getLocaleForCurrency(language);
  const isEuropeanFormat = locale === "pt-BR" || locale === "es-ES";

  return isEuropeanFormat ? parseEuropeanFormat(sanitized) : parseUSFormat(sanitized);
}

/**
 * Gets a currency placeholder string based on the selected language
 * @param language - The current language (pt, en, es)
 * @returns A placeholder string (e.g., "R$ 0,00" for pt-BR, "$0.00" for en-US)
 */
export function getCurrencyPlaceholder(language: Language): string {
  const locale = getLocaleForCurrency(language);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BRL",
  }).format(0);
}

/**
 * Masks a decimal number value as the user types, formatting it according to the selected language
 * @param value - The raw input value (digits only or partially formatted)
 * @param language - The current language (pt, en, es)
 * @param maxDecimals - Maximum number of decimal places (default: 2)
 * @returns Formatted decimal string (e.g., "1.234,56" for pt-BR, "1,234.56" for en-US)
 */
export function maskDecimal(value: string, language: Language, maxDecimals: number = 2): string {
  // Remove all non-digit characters except dots and commas
  const sanitized = value.replaceAll(/[^\d.,]/g, "");
  if (!sanitized) return "";

  // Parse the value using parseDecimal
  const numericValue = parseDecimal(sanitized, language);

  if (Number.isNaN(numericValue)) return "";

  // Format according to locale
  const locale = getLocaleForCurrency(language);
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  }).format(numericValue);
}

/**
 * Parses a formatted decimal string to a number, respecting the locale format
 * @param value - The formatted decimal string
 * @param language - The current language to determine the format
 * @returns The numeric value (always a number, never a string)
 */
export function parseDecimal(value: string, language: Language): number {
  // Reuse parseCurrency logic since they have identical implementation
  // parseCurrency handles currency symbols, but they're removed by the regex anyway
  return parseCurrency(value, language);
}

/**
 * Gets a decimal placeholder string based on the selected language
 * @param language - The current language (pt, en, es)
 * @returns A placeholder string (e.g., "0,00" for pt-BR, "0.00" for en-US)
 */
export function getDecimalPlaceholder(language: Language): string {
  const locale = getLocaleForCurrency(language);
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(0);
}
