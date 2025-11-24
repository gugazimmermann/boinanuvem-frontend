import { format } from "date-fns";
import type { BreedingMethod } from "~/types";
import type { Language } from "~/types";
import { getDateLocale } from "./date";
import type { TranslationKey } from "~/i18n/translations";

/**
 * Get the translated label for a breeding method
 */
export function getBreedingMethodLabel(
  method: BreedingMethod,
  t: TranslationKey | ReturnType<typeof import("~/i18n").useTranslation>
): string {
  return method === "natural" ? t.breedings.new.methodNatural : t.breedings.new.methodAI;
}

/**
 * Format a breeding date using the appropriate locale
 */
export function formatBreedingDate(date: string | Date, language: Language = "pt"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const dateLocale = getDateLocale(language);
  const dateFormat = language === "en" ? "MM/dd/yyyy" : "dd/MM/yyyy";
  return format(dateObj, dateFormat, { locale: dateLocale });
}

/**
 * Calculate the expected birth date based on breeding date
 * Assumes 270 days gestation period
 */
export function calculateExpectedBirthDate(breedingDate: string | Date): Date {
  const date = typeof breedingDate === "string" ? new Date(breedingDate) : breedingDate;
  const expectedDate = new Date(date);
  expectedDate.setDate(expectedDate.getDate() + 270);
  return expectedDate;
}

/**
 * Calculate the number of days pregnant based on breeding date
 */
export function calculateDaysPregnant(breedingDate: string | Date): number {
  const date = typeof breedingDate === "string" ? new Date(breedingDate) : breedingDate;
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
