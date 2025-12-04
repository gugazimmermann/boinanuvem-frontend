import { unmaskCPF, unmaskCNPJ, unmaskCEP, unmaskPhone } from "~/components/site/utils/masks";
import { isValidEmail } from "~/utils/email-validation";

/**
 * Validates that a required field is not empty.
 * @param value - The value to validate
 * @param fieldLabel - The label of the field for error messages
 * @param getRequiredError - Function that returns the required error message
 * @returns Error message if invalid, null if valid
 */
export function validateRequired(
  value: string | undefined | null,
  fieldLabel: string,
  getRequiredError: (field: string) => string
): string | null {
  if (!value?.trim()) {
    return getRequiredError(fieldLabel);
  }
  return null;
}

/**
 * Validates an email address.
 * @param value - The email value to validate
 * @param fieldLabel - The label of the field for error messages
 * @param getRequiredError - Function that returns the required error message
 * @param getInvalidError - Function that returns the invalid error message
 * @returns Error message if invalid, null if valid
 */
export function validateEmail(
  value: string | undefined | null,
  fieldLabel: string,
  getRequiredError: (field: string) => string,
  getInvalidError: (field: string) => string
): string | null {
  if (!value?.trim()) {
    return getRequiredError(fieldLabel);
  }
  if (!isValidEmail(value)) {
    return getInvalidError(fieldLabel);
  }
  return null;
}

/**
 * Validates a CPF (Brazilian tax ID) - must have exactly 11 digits when unmasked.
 * @param value - The CPF value to validate (may be masked)
 * @param fieldLabel - The label of the field for error messages
 * @param getRequiredError - Function that returns the required error message
 * @param getInvalidError - Function that returns the invalid error message
 * @returns Error message if invalid, null if valid
 */
export function validateCPF(
  value: string | undefined | null,
  fieldLabel: string,
  getRequiredError: (field: string) => string,
  getInvalidError: (field: string) => string
): string | null {
  if (!value?.trim()) {
    return getRequiredError(fieldLabel);
  }
  const unmasked = unmaskCPF(value);
  if (unmasked.length !== 11) {
    return getInvalidError(fieldLabel);
  }
  return null;
}

/**
 * Validates a CNPJ (Brazilian company tax ID) - must have exactly 14 digits when unmasked.
 * @param value - The CNPJ value to validate (may be masked)
 * @param fieldLabel - The label of the field for error messages
 * @param getRequiredError - Function that returns the required error message (optional, if CNPJ can be optional)
 * @param getInvalidError - Function that returns the invalid error message
 * @returns Error message if invalid, null if valid
 */
export function validateCNPJ(
  value: string | undefined | null,
  fieldLabel: string,
  getRequiredError: (field: string) => string | undefined,
  getInvalidError: (field: string) => string
): string | null {
  const unmasked = value ? unmaskCNPJ(value) : "";
  if (!unmasked) {
    const requiredError = getRequiredError(fieldLabel);
    return requiredError || null;
  }
  if (unmasked.length !== 14) {
    return getInvalidError(fieldLabel);
  }
  return null;
}

/**
 * Validates a phone number - must have exactly 10 or 11 digits when unmasked (Brazilian format).
 * @param value - The phone value to validate (may be masked)
 * @param fieldLabel - The label of the field for error messages
 * @param getRequiredError - Function that returns the required error message
 * @param getInvalidError - Function that returns the invalid error message
 * @returns Error message if invalid, null if valid
 */
export function validatePhone(
  value: string | undefined | null,
  fieldLabel: string,
  getRequiredError: (field: string) => string,
  getInvalidError: (field: string) => string
): string | null {
  if (!value?.trim()) {
    return getRequiredError(fieldLabel);
  }
  const unmasked = unmaskPhone(value);
  if (unmasked.length !== 10 && unmasked.length !== 11) {
    return getInvalidError(fieldLabel);
  }
  return null;
}

/**
 * Validates a CEP (Brazilian postal code) - must have exactly 8 digits when unmasked.
 * @param value - The CEP value to validate (may be masked)
 * @param fieldLabel - The label of the field for error messages
 * @param getRequiredError - Function that returns the required error message
 * @param getInvalidError - Function that returns the invalid error message
 * @returns Error message if invalid, null if valid
 */
export function validateCEP(
  value: string | undefined | null,
  fieldLabel: string,
  getRequiredError: (field: string) => string,
  getInvalidError: (field: string) => string
): string | null {
  if (!value?.trim()) {
    return getRequiredError(fieldLabel);
  }
  const unmasked = unmaskCEP(value);
  if (unmasked.length !== 8) {
    return getInvalidError(fieldLabel);
  }
  return null;
}

/**
 * Validates address fields (street, neighborhood, city, state, zipCode).
 * @param data - Object containing address fields
 * @param fieldLabels - Object containing labels for each address field
 * @param getRequiredError - Function that returns the required error message
 * @param getInvalidError - Function that returns the invalid error message (for zipCode)
 * @returns Object with error messages for invalid fields
 */
export function validateAddressFields(
  data: {
    street?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
  },
  fieldLabels: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  },
  getRequiredError: (field: string) => string,
  getInvalidError: (field: string) => string
): Record<string, string> {
  const errors: Record<string, string> = {};

  const streetError = validateRequired(data.street, fieldLabels.street, getRequiredError);
  if (streetError) errors.street = streetError;

  const neighborhoodError = validateRequired(
    data.neighborhood,
    fieldLabels.neighborhood,
    getRequiredError
  );
  if (neighborhoodError) errors.neighborhood = neighborhoodError;

  const cityError = validateRequired(data.city, fieldLabels.city, getRequiredError);
  if (cityError) errors.city = cityError;

  const stateError = validateRequired(data.state, fieldLabels.state, getRequiredError);
  if (stateError) errors.state = stateError;

  const zipCodeError = validateCEP(
    data.zipCode,
    fieldLabels.zipCode,
    getRequiredError,
    getInvalidError
  );
  if (zipCodeError) errors.zipCode = zipCodeError;

  return errors;
}
