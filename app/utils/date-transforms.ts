/**
 * Safely convert a date value to an ISO string (with time)
 * @param date - Date value that could be string, Date, or undefined
 * @returns ISO string or undefined if invalid/missing
 */
export function safeDateToString(date: unknown): string | undefined {
  if (!date) return undefined;
  if (typeof date === "string") return date;
  try {
    const dateObj = new Date(date as Date | string);
    if (Number.isNaN(dateObj.getTime())) return undefined;
    return dateObj.toISOString();
  } catch {
    return undefined;
  }
}

/**
 * Safely convert a date value to a date-only string (YYYY-MM-DD)
 * @param date - Date value that could be string, Date, or undefined
 * @returns Date string (YYYY-MM-DD) or undefined if invalid/missing
 */
export function safeDateToDateString(date: unknown): string | undefined {
  if (!date) return undefined;
  if (typeof date === "string") return date;
  try {
    const dateObj = new Date(date as Date | string);
    if (Number.isNaN(dateObj.getTime())) return undefined;
    return dateObj.toISOString().split("T")[0];
  } catch {
    return undefined;
  }
}

/**
 * Transform date fields in an object from backend format to frontend format
 * @param obj - Object to transform
 * @param dateStringFields - Fields that should be converted to date strings (YYYY-MM-DD)
 * @param dateTimeFields - Fields that should be converted to ISO strings
 * @returns Transformed object
 */
export function transformDateFields<T extends Record<string, unknown>>(
  obj: T,
  dateStringFields: string[] = [],
  dateTimeFields: string[] = []
): T {
  const result = { ...obj };

  for (const field of dateStringFields) {
    if (field in result) {
      (result as Record<string, unknown>)[field] = safeDateToDateString(
        (result as Record<string, unknown>)[field]
      );
    }
  }

  for (const field of dateTimeFields) {
    if (field in result) {
      const value = (result as Record<string, unknown>)[field];
      if (value !== undefined) {
        (result as Record<string, unknown>)[field] = safeDateToString(value);
      }
    }
  }

  return result;
}
