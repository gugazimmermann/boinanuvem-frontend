/**
 * Build an update DTO object from partial form data
 * Only includes fields that are explicitly defined (not undefined)
 * @param data - Partial form data object
 * @param fields - Array of field names to include in the DTO
 * @returns Record with only defined fields
 */
export function buildUpdateDto<T extends Record<string, unknown>>(
  data: Partial<T>,
  fields: (keyof T)[]
): Record<string, unknown> {
  const updateDto: Record<string, unknown> = {};

  for (const field of fields) {
    if (data[field] !== undefined) {
      updateDto[field as string] = data[field];
    }
  }

  return updateDto;
}

/**
 * Build an update DTO with custom field mappings
 * Useful when DTO field names differ from form data field names
 * @param data - Partial form data object
 * @param fieldMappings - Map of form field names to DTO field names
 * @returns Record with mapped fields
 */
export function buildUpdateDtoWithMappings<T extends Record<string, unknown>>(
  data: Partial<T>,
  fieldMappings: Record<keyof T, string>
): Record<string, unknown> {
  const updateDto: Record<string, unknown> = {};

  for (const [formField, dtoField] of Object.entries(fieldMappings)) {
    const value = data[formField as keyof T];
    if (value !== undefined) {
      updateDto[dtoField] = value;
    }
  }

  return updateDto;
}

/**
 * Build an update DTO with conditional transformations
 * Allows custom logic for each field
 * @param data - Partial form data object
 * @param transformers - Map of field names to transformation functions
 * @returns Record with transformed fields
 */
export function buildUpdateDtoWithTransformers<T extends Record<string, unknown>>(
  data: Partial<T>,
  transformers: Record<keyof T, (value: unknown) => unknown>
): Record<string, unknown> {
  const updateDto: Record<string, unknown> = {};

  for (const [field, transform] of Object.entries(transformers)) {
    const value = data[field as keyof T];
    if (value !== undefined) {
      const transformed = transform(value);
      if (transformed !== undefined) {
        updateDto[field] = transformed;
      }
    }
  }

  return updateDto;
}
