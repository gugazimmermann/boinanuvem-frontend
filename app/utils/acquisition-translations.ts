/**
 * Helper functions to safely access acquisition translation keys
 * Reduces repetitive type casting and fallback logic
 */

type TranslationRecord = Record<string, unknown>;

export function getAcquisitionTranslation(
  translations: TranslationRecord | undefined,
  key: string,
  fallback: string
): string {
  return (translations?.[key] as string) || fallback;
}

export function getAcquisitionNewTranslation(
  translations: { acquisitions?: { new?: TranslationRecord } },
  key: string,
  fallback: string
): string {
  return getAcquisitionTranslation(translations.acquisitions?.new, key, fallback);
}

export function getAcquisitionErrorTranslation(
  translations: { acquisitions?: { errors?: TranslationRecord } },
  key: string,
  fallback: string
): string {
  return getAcquisitionTranslation(translations.acquisitions?.errors, key, fallback);
}

export function getAcquisitionSuccessTranslation(
  translations: { acquisitions?: { success?: TranslationRecord } },
  key: string,
  fallback: string
): string {
  return getAcquisitionTranslation(translations.acquisitions?.success, key, fallback);
}
