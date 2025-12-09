import { describe, it, expect, vi } from "vitest";
import {
  validateRequired,
  validateEmail,
  validateCPF,
  validateCNPJ,
  validatePhone,
  validateCEP,
  validateAddressFields,
} from "../form-validation";

// Mock the unmask functions
vi.mock("~/components/site/utils/masks", () => ({
  unmaskCPF: (value: string) => value.replaceAll(/\D/g, ""),
  unmaskCNPJ: (value: string) => value.replaceAll(/\D/g, ""),
  unmaskPhone: (value: string) => value.replaceAll(/\D/g, ""),
  unmaskCEP: (value: string) => value.replaceAll(/\D/g, ""),
}));

describe("validateRequired", () => {
  const getRequiredError = (field: string) => `${field} is required`;

  it("should return null for valid non-empty values", () => {
    expect(validateRequired("value", "Field", getRequiredError)).toBeNull();
    expect(validateRequired("  value  ", "Field", getRequiredError)).toBeNull();
    expect(validateRequired("0", "Field", getRequiredError)).toBeNull();
  });

  it("should return error for empty strings", () => {
    expect(validateRequired("", "Field", getRequiredError)).toBe("Field is required");
  });

  it("should return error for whitespace-only strings", () => {
    expect(validateRequired("   ", "Field", getRequiredError)).toBe("Field is required");
    expect(validateRequired("\t", "Field", getRequiredError)).toBe("Field is required");
    expect(validateRequired("\n", "Field", getRequiredError)).toBe("Field is required");
  });

  it("should return error for null", () => {
    expect(validateRequired(null, "Field", getRequiredError)).toBe("Field is required");
  });

  it("should return error for undefined", () => {
    expect(validateRequired(undefined, "Field", getRequiredError)).toBe("Field is required");
  });
});

describe("validateEmail", () => {
  const getRequiredError = (field: string) => `${field} is required`;
  const getInvalidError = (field: string) => `${field} is invalid`;

  it("should return null for valid emails", () => {
    expect(
      validateEmail("user@example.com", "Email", getRequiredError, getInvalidError)
    ).toBeNull();
    expect(validateEmail("test@domain.org", "Email", getRequiredError, getInvalidError)).toBeNull();
  });

  it("should return required error for empty values", () => {
    expect(validateEmail("", "Email", getRequiredError, getInvalidError)).toBe("Email is required");
    expect(validateEmail("   ", "Email", getRequiredError, getInvalidError)).toBe(
      "Email is required"
    );
    expect(validateEmail(null, "Email", getRequiredError, getInvalidError)).toBe(
      "Email is required"
    );
  });

  it("should return invalid error for invalid emails", () => {
    expect(validateEmail("invalid", "Email", getRequiredError, getInvalidError)).toBe(
      "Email is invalid"
    );
    expect(validateEmail("user@", "Email", getRequiredError, getInvalidError)).toBe(
      "Email is invalid"
    );
    expect(validateEmail("@example.com", "Email", getRequiredError, getInvalidError)).toBe(
      "Email is invalid"
    );
  });
});

describe("validateCPF", () => {
  const getRequiredError = (field: string) => `${field} is required`;
  const getInvalidError = (field: string) => `${field} is invalid`;

  it("should return null for valid CPF (11 digits)", () => {
    expect(validateCPF("12345678901", "CPF", getRequiredError, getInvalidError)).toBeNull();
    expect(validateCPF("123.456.789-01", "CPF", getRequiredError, getInvalidError)).toBeNull(); // Masked
  });

  it("should return required error for empty values", () => {
    expect(validateCPF("", "CPF", getRequiredError, getInvalidError)).toBe("CPF is required");
    expect(validateCPF("   ", "CPF", getRequiredError, getInvalidError)).toBe("CPF is required");
  });

  it("should return invalid error for invalid CPF lengths", () => {
    expect(validateCPF("1234567890", "CPF", getRequiredError, getInvalidError)).toBe(
      "CPF is invalid"
    ); // 10 digits
    expect(validateCPF("123456789012", "CPF", getRequiredError, getInvalidError)).toBe(
      "CPF is invalid"
    ); // 12 digits
    expect(validateCPF("123", "CPF", getRequiredError, getInvalidError)).toBe("CPF is invalid"); // Too short
  });
});

describe("validateCNPJ", () => {
  const getRequiredError = (field: string) => `${field} is required`;
  const getInvalidError = (field: string) => `${field} is invalid`;

  it("should return null for valid CNPJ (14 digits)", () => {
    expect(validateCNPJ("12345678000190", "CNPJ", getRequiredError, getInvalidError)).toBeNull();
    expect(
      validateCNPJ("12.345.678/0001-90", "CNPJ", getRequiredError, getInvalidError)
    ).toBeNull(); // Masked
  });

  it("should return null for empty when getRequiredError returns undefined", () => {
    const getOptionalError = () => undefined;
    expect(validateCNPJ("", "CNPJ", getOptionalError, getInvalidError)).toBeNull();
  });

  it("should return required error when provided", () => {
    expect(validateCNPJ("", "CNPJ", getRequiredError, getInvalidError)).toBe("CNPJ is required");
  });

  it("should return invalid error for invalid CNPJ lengths", () => {
    expect(validateCNPJ("1234567800019", "CNPJ", getRequiredError, getInvalidError)).toBe(
      "CNPJ is invalid"
    ); // 13 digits
    expect(validateCNPJ("123456780001901", "CNPJ", getRequiredError, getInvalidError)).toBe(
      "CNPJ is invalid"
    ); // 15 digits
  });
});

describe("validatePhone", () => {
  const getRequiredError = (field: string) => `${field} is required`;
  const getInvalidError = (field: string) => `${field} is invalid`;

  it("should return null for valid phone with 10 digits", () => {
    expect(validatePhone("1234567890", "Phone", getRequiredError, getInvalidError)).toBeNull();
    expect(validatePhone("(12) 3456-7890", "Phone", getRequiredError, getInvalidError)).toBeNull(); // Masked
  });

  it("should return null for valid phone with 11 digits", () => {
    expect(validatePhone("12345678901", "Phone", getRequiredError, getInvalidError)).toBeNull();
    expect(validatePhone("(12) 34567-8901", "Phone", getRequiredError, getInvalidError)).toBeNull(); // Masked
  });

  it("should return required error for empty values", () => {
    expect(validatePhone("", "Phone", getRequiredError, getInvalidError)).toBe("Phone is required");
  });

  it("should return invalid error for invalid phone lengths", () => {
    expect(validatePhone("123456789", "Phone", getRequiredError, getInvalidError)).toBe(
      "Phone is invalid"
    ); // 9 digits
    expect(validatePhone("123456789012", "Phone", getRequiredError, getInvalidError)).toBe(
      "Phone is invalid"
    ); // 12 digits
  });
});

describe("validateCEP", () => {
  const getRequiredError = (field: string) => `${field} is required`;
  const getInvalidError = (field: string) => `${field} is invalid`;

  it("should return null for valid CEP (8 digits)", () => {
    expect(validateCEP("12345678", "CEP", getRequiredError, getInvalidError)).toBeNull();
    expect(validateCEP("12.345-678", "CEP", getRequiredError, getInvalidError)).toBeNull(); // Masked
  });

  it("should return required error for empty values", () => {
    expect(validateCEP("", "CEP", getRequiredError, getInvalidError)).toBe("CEP is required");
  });

  it("should return invalid error for invalid CEP lengths", () => {
    expect(validateCEP("1234567", "CEP", getRequiredError, getInvalidError)).toBe("CEP is invalid"); // 7 digits
    expect(validateCEP("123456789", "CEP", getRequiredError, getInvalidError)).toBe(
      "CEP is invalid"
    ); // 9 digits
  });
});

describe("validateAddressFields", () => {
  const getRequiredError = (field: string) => `${field} is required`;
  const getInvalidError = (field: string) => `${field} is invalid`;

  const fieldLabels = {
    street: "Street",
    neighborhood: "Neighborhood",
    city: "City",
    state: "State",
    zipCode: "Zip Code",
  };

  it("should return empty object for valid address", () => {
    const data = {
      street: "Main Street",
      neighborhood: "Downtown",
      city: "São Paulo",
      state: "SP",
      zipCode: "12345678",
    };
    expect(validateAddressFields(data, fieldLabels, getRequiredError, getInvalidError)).toEqual({});
  });

  it("should return errors for missing required fields", () => {
    const data = {
      street: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
    };
    const errors = validateAddressFields(data, fieldLabels, getRequiredError, getInvalidError);
    expect(errors.street).toBe("Street is required");
    expect(errors.neighborhood).toBe("Neighborhood is required");
    expect(errors.city).toBe("City is required");
    expect(errors.state).toBe("State is required");
    expect(errors.zipCode).toBe("Zip Code is required");
  });

  it("should return errors for partial invalid data", () => {
    const data = {
      street: "Main Street",
      neighborhood: "",
      city: "São Paulo",
      state: "",
      zipCode: "123", // Invalid CEP
    };
    const errors = validateAddressFields(data, fieldLabels, getRequiredError, getInvalidError);
    expect(errors.street).toBeUndefined();
    expect(errors.neighborhood).toBe("Neighborhood is required");
    expect(errors.city).toBeUndefined();
    expect(errors.state).toBe("State is required");
    expect(errors.zipCode).toBe("Zip Code is invalid");
  });

  it("should handle null values", () => {
    const data = {
      street: null,
      neighborhood: null,
      city: null,
      state: null,
      zipCode: null,
    };
    const errors = validateAddressFields(data, fieldLabels, getRequiredError, getInvalidError);
    expect(Object.keys(errors).length).toBeGreaterThan(0);
  });

  it("should validate CEP format correctly", () => {
    const data = {
      street: "Main Street",
      neighborhood: "Downtown",
      city: "São Paulo",
      state: "SP",
      zipCode: "12345-678", // Valid masked CEP
    };
    const errors = validateAddressFields(data, fieldLabels, getRequiredError, getInvalidError);
    expect(errors.zipCode).toBeUndefined();
  });
});
