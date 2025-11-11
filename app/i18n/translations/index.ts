import { pt } from "./pt";
import { en } from "./en";
import { es } from "./es";
import type { Language } from "~/contexts/language-context";

export const translations = {
  pt,
  en,
  es,
} as const;

export type TranslationKey = typeof pt;
export type Translations = typeof translations;

