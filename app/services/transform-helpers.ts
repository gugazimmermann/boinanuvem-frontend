import { safeDateToString, safeDateToDateString } from "~/utils/date-transforms";

/**
 * Convert a value to a number
 */
function convertToNumber(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }
  const stringValue = typeof value === "string" ? value : JSON.stringify(value);
  return Number.parseFloat(stringValue);
}

/**
 * Transform amount fields from number or string to number
 */
export function transformAmountFields<T extends Record<string, unknown>>(
  obj: T,
  amountFields: string[] = []
): T {
  const result = { ...obj };

  for (const field of amountFields) {
    if (field in result) {
      const value = (result as Record<string, unknown>)[field];
      if (value !== undefined && value !== null) {
        const numericValue = convertToNumber(value);
        (result as Record<string, unknown>)[field] = numericValue;
      }
    }
  }

  return result;
}

/**
 * Transform a single date string field
 */
function transformDateStringField<T extends Record<string, unknown>>(
  result: T,
  field: string
): void {
  if (field in result) {
    const value = (result as Record<string, unknown>)[field];
    (result as Record<string, unknown>)[field] = safeDateToDateString(value) || value;
  }
}

/**
 * Transform a single date time field
 */
function transformDateTimeField<T extends Record<string, unknown>>(result: T, field: string): void {
  if (field in result) {
    const value = (result as Record<string, unknown>)[field];
    if (value !== undefined) {
      (result as Record<string, unknown>)[field] = safeDateToString(value) || value;
    }
  }
}

/**
 * Transform date fields in an object
 * @param obj - Object to transform
 * @param dateStringFields - Fields that should be converted to date strings (YYYY-MM-DD)
 * @param dateTimeFields - Fields that should be converted to ISO strings
 * @param amountFields - Fields that should be converted to numbers
 * @returns Transformed object
 */
export function transformEntityFields<T extends Record<string, unknown>>(
  obj: T,
  options: {
    dateStringFields?: string[];
    dateTimeFields?: string[];
    amountFields?: string[];
  } = {}
): T {
  let result = { ...obj };

  // Transform date string fields
  if (options.dateStringFields) {
    for (const field of options.dateStringFields) {
      transformDateStringField(result, field);
    }
  }

  // Transform date time fields
  if (options.dateTimeFields) {
    for (const field of options.dateTimeFields) {
      transformDateTimeField(result, field);
    }
  }

  // Transform amount fields
  if (options.amountFields) {
    result = transformAmountFields(result, options.amountFields);
  }

  return result;
}

/**
 * Create a transform function for entities with common date/amount fields
 */
export function createEntityTransform<T extends Record<string, unknown>>(
  options: {
    dateStringFields?: string[];
    dateTimeFields?: string[];
    amountFields?: string[];
    customTransform?: (obj: T) => T;
  } = {}
) {
  return function (obj: T): T {
    let result = obj;

    // Apply custom transform first if provided
    if (options.customTransform) {
      result = options.customTransform(result);
    }

    // Apply standard field transformations
    result = transformEntityFields(result, {
      dateStringFields: options.dateStringFields,
      dateTimeFields: options.dateTimeFields,
      amountFields: options.amountFields,
    });

    return result;
  };
}
