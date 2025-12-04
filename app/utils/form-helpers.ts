/**
 * Common form utility functions
 */

/**
 * Clears error for a specific field
 */
export function clearFieldError<T extends Record<string, string>>(errors: T, field: keyof T): T {
  const newErrors = { ...errors };
  delete newErrors[field];
  return newErrors;
}

/**
 * Sets error for a specific field
 */
export function setFieldError<T extends Record<string, string>>(
  errors: T,
  field: keyof T,
  message: string
): T {
  return { ...errors, [field]: message };
}

/**
 * Validates required field
 */
export function validateRequired(
  value: string | undefined | null,
  errorMessage: string
): string | null {
  if (!value?.trim()) {
    return errorMessage;
  }
  return null;
}

/**
 * Validates numeric field
 */
export function validateNumeric(
  value: string | undefined | null,
  errorMessage: string,
  min?: number,
  max?: number
): string | null {
  if (!value) {
    return errorMessage;
  }
  const num = Number.parseFloat(value);
  if (Number.isNaN(num)) {
    return errorMessage;
  }
  if (min !== undefined && num < min) {
    return errorMessage;
  }
  if (max !== undefined && num > max) {
    return errorMessage;
  }
  return null;
}

/**
 * Validates date field
 */
export function validateDate(
  value: string | undefined | null,
  errorMessage: string,
  maxDate?: Date
): string | null {
  if (!value) {
    return errorMessage;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return errorMessage;
  }
  if (maxDate && date > maxDate) {
    return errorMessage;
  }
  return null;
}
