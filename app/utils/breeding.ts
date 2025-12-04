import { format } from "date-fns";
import type { BreedingMethod, Language } from "~/types";
import { getDateLocale } from "./date";
import type { TranslationKey } from "~/i18n/translations";

export function getBreedingMethodLabel(
  method: BreedingMethod,
  t: TranslationKey | ReturnType<typeof import("~/i18n").useTranslation>
): string {
  return method === "natural" ? t.breedings.new.methodNatural : t.breedings.new.methodAI;
}

export function formatBreedingDate(date: string | Date, language: Language = "pt"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const dateLocale = getDateLocale(language);
  const dateFormat = language === "en" ? "MM/dd/yyyy" : "dd/MM/yyyy";
  return format(dateObj, dateFormat, { locale: dateLocale });
}

export function calculateExpectedBirthDate(breedingDate: string | Date): Date {
  const date = typeof breedingDate === "string" ? new Date(breedingDate) : breedingDate;
  const expectedDate = new Date(date);
  expectedDate.setDate(expectedDate.getDate() + 270);
  return expectedDate;
}

export function calculateDaysPregnant(breedingDate: string | Date): number {
  const date = typeof breedingDate === "string" ? new Date(breedingDate) : breedingDate;
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}
