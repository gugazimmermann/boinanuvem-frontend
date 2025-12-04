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

// Mock the mask functions
vi.mock("~/components/site/utils/masks", () => ({
  unmaskCPF: (value: string) => value.replaceAll(/\D/g, ""),
  unmaskCNPJ: (value: string) => value.replaceAll(/\D/g, ""),
  unmaskPhone: (value: string) => value.replaceAll(/\D/g, ""),
  unmaskCEP: (value: string) => value.replaceAll(/\D/g, ""),
}));

describe("form-validation", () => {
  const getRequiredError = (field: string) => `${field} is required`;
  const getInvalidError = (field: string) => `${field} is invalid`;

  describe("validateRequired", () => {
    it("should return null for valid value", () => {
      expect(validateRequired("test", "Name", getRequiredError)).toBeNull();
      expect(validateRequired("  test  ", "Name", getRequiredError)).toBeNull();
    });

    it("should return error for empty value", () => {
      expect(validateRequired("", "Name", getRequiredError)).toBe("Name is required");
      expect(validateRequired("   ", "Name", getRequiredError)).toBe("Name is required");
      expect(validateRequired(null, "Name", getRequiredError)).toBe("Name is required");
      expect(validateRequired(undefined, "Name", getRequiredError)).toBe("Name is required");
    });
  });

  describe("validateEmail", () => {
    it("should return null for valid email", () => {
      expect(
        validateEmail("test@example.com", "Email", getRequiredError, getInvalidError)
      ).toBeNull();
      expect(
        validateEmail("user.name@domain.co.uk", "Email", getRequiredError, getInvalidError)
      ).toBeNull();
    });

    it("should return required error for empty email", () => {
      expect(validateEmail("", "Email", getRequiredError, getInvalidError)).toBe(
        "Email is required"
      );
      expect(validateEmail("   ", "Email", getRequiredError, getInvalidError)).toBe(
        "Email is required"
      );
    });

    it("should return invalid error for invalid email", () => {
      expect(validateEmail("invalid", "Email", getRequiredError, getInvalidError)).toBe(
        "Email is invalid"
      );
      expect(validateEmail("invalid@", "Email", getRequiredError, getInvalidError)).toBe(
        "Email is invalid"
      );
      expect(validateEmail("@example.com", "Email", getRequiredError, getInvalidError)).toBe(
        "Email is invalid"
      );
    });
  });

  describe("validateCPF", () => {
    it("should return null for valid CPF", () => {
      expect(validateCPF("123.456.789-00", "CPF", getRequiredError, getInvalidError)).toBeNull();
      expect(validateCPF("12345678900", "CPF", getRequiredError, getInvalidError)).toBeNull();
    });

    it("should return required error for empty CPF", () => {
      expect(validateCPF("", "CPF", getRequiredError, getInvalidError)).toBe("CPF is required");
      expect(validateCPF("   ", "CPF", getRequiredError, getInvalidError)).toBe("CPF is required");
    });

    it("should return invalid error for CPF with wrong length", () => {
      expect(validateCPF("123456789", "CPF", getRequiredError, getInvalidError)).toBe(
        "CPF is invalid"
      );
      expect(validateCPF("123456789012", "CPF", getRequiredError, getInvalidError)).toBe(
        "CPF is invalid"
      );
    });
  });

  describe("validateCNPJ", () => {
    it("should return null for valid CNPJ", () => {
      expect(
        validateCNPJ("12.345.678/0001-90", "CNPJ", getRequiredError, getInvalidError)
      ).toBeNull();
      expect(validateCNPJ("12345678000190", "CNPJ", getRequiredError, getInvalidError)).toBeNull();
    });

    it("should return null for empty CNPJ when getRequiredError returns undefined", () => {
      const getRequiredErrorOptional = () => undefined;
      expect(validateCNPJ("", "CNPJ", getRequiredErrorOptional, getInvalidError)).toBeNull();
    });

    it("should return required error for empty CNPJ when getRequiredError returns string", () => {
      expect(validateCNPJ("", "CNPJ", getRequiredError, getInvalidError)).toBe("CNPJ is required");
    });

    it("should return invalid error for CNPJ with wrong length", () => {
      expect(validateCNPJ("123456789", "CNPJ", getRequiredError, getInvalidError)).toBe(
        "CNPJ is invalid"
      );
      expect(validateCNPJ("123456780001901", "CNPJ", getRequiredError, getInvalidError)).toBe(
        "CNPJ is invalid"
      );
    });
  });

  describe("validatePhone", () => {
    it("should return null for valid phone (10 digits)", () => {
      expect(
        validatePhone("(11) 1234-5678", "Phone", getRequiredError, getInvalidError)
      ).toBeNull();
      expect(validatePhone("1112345678", "Phone", getRequiredError, getInvalidError)).toBeNull();
    });

    it("should return null for valid phone (11 digits)", () => {
      expect(
        validatePhone("(11) 91234-5678", "Phone", getRequiredError, getInvalidError)
      ).toBeNull();
      expect(validatePhone("11912345678", "Phone", getRequiredError, getInvalidError)).toBeNull();
    });

    it("should return required error for empty phone", () => {
      expect(validatePhone("", "Phone", getRequiredError, getInvalidError)).toBe(
        "Phone is required"
      );
    });

    it("should return invalid error for phone with wrong length", () => {
      expect(validatePhone("123", "Phone", getRequiredError, getInvalidError)).toBe(
        "Phone is invalid"
      );
      expect(validatePhone("123456789012", "Phone", getRequiredError, getInvalidError)).toBe(
        "Phone is invalid"
      );
    });
  });

  describe("validateCEP", () => {
    it("should return null for valid CEP", () => {
      expect(validateCEP("12345-678", "CEP", getRequiredError, getInvalidError)).toBeNull();
      expect(validateCEP("12345678", "CEP", getRequiredError, getInvalidError)).toBeNull();
    });

    it("should return required error for empty CEP", () => {
      expect(validateCEP("", "CEP", getRequiredError, getInvalidError)).toBe("CEP is required");
    });

    it("should return invalid error for CEP with wrong length", () => {
      expect(validateCEP("12345", "CEP", getRequiredError, getInvalidError)).toBe("CEP is invalid");
      expect(validateCEP("123456789", "CEP", getRequiredError, getInvalidError)).toBe(
        "CEP is invalid"
      );
    });
  });

  describe("validateAddressFields", () => {
    it("should return empty object for valid address", () => {
      const data = {
        street: "Rua Test",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        zipCode: "12345-678",
      };
      const fieldLabels = {
        street: "Street",
        neighborhood: "Neighborhood",
        city: "City",
        state: "State",
        zipCode: "ZIP Code",
      };
      const errors = validateAddressFields(data, fieldLabels, getRequiredError, getInvalidError);
      expect(errors).toEqual({});
    });

    it("should return errors for missing required fields", () => {
      const data = {
        street: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
      };
      const fieldLabels = {
        street: "Street",
        neighborhood: "Neighborhood",
        city: "City",
        state: "State",
        zipCode: "ZIP Code",
      };
      const errors = validateAddressFields(data, fieldLabels, getRequiredError, getInvalidError);
      expect(errors.street).toBe("Street is required");
      expect(errors.neighborhood).toBe("Neighborhood is required");
      expect(errors.city).toBe("City is required");
      expect(errors.state).toBe("State is required");
      expect(errors.zipCode).toBe("ZIP Code is required");
    });

    it("should return error for invalid CEP", () => {
      const data = {
        street: "Rua Test",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        zipCode: "12345",
      };
      const fieldLabels = {
        street: "Street",
        neighborhood: "Neighborhood",
        city: "City",
        state: "State",
        zipCode: "ZIP Code",
      };
      const errors = validateAddressFields(data, fieldLabels, getRequiredError, getInvalidError);
      expect(errors.zipCode).toBe("ZIP Code is invalid");
    });

    it("should only return errors for invalid fields", () => {
      const data = {
        street: "Rua Test",
        neighborhood: "",
        city: "São Paulo",
        state: "SP",
        zipCode: "12345-678",
      };
      const fieldLabels = {
        street: "Street",
        neighborhood: "Neighborhood",
        city: "City",
        state: "State",
        zipCode: "ZIP Code",
      };
      const errors = validateAddressFields(data, fieldLabels, getRequiredError, getInvalidError);
      expect(errors.neighborhood).toBe("Neighborhood is required");
      expect(errors.street).toBeUndefined();
      expect(errors.city).toBeUndefined();
      expect(errors.state).toBeUndefined();
      expect(errors.zipCode).toBeUndefined();
    });
  });
});
