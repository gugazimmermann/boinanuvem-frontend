export type Language = "pt" | "en" | "es";

export type Status = "active" | "inactive" | "pending";

export interface LanguageInfo {
  code: Language;
  name: string;
  flag: string;
}
