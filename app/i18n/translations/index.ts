import { pt } from "./pt";
import { en } from "./en";
import { es } from "./es";

export const translations = {
  pt,
  en,
  es,
} as const;

export type TranslationKey = typeof pt;
export type Translations = typeof translations;
