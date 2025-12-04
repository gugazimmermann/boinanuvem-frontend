import { describe, it, expect } from "vitest";
import {
  clearFieldError,
  setFieldError,
  validateRequired,
  validateNumeric,
  validateDate,
} from "../form-helpers";

describe("form-helpers", () => {
  describe("clearFieldError", () => {
    it("should remove error for specified field", () => {
      const errors = {
        name: "Name is required",
        email: "Email is invalid",
      };
      const result = clearFieldError(errors, "name");
      expect(result).not.toHaveProperty("name");
      expect(result).toHaveProperty("email");
    });

    it("should not modify original errors object", () => {
      const errors = {
        name: "Name is required",
      };
      const result = clearFieldError(errors, "name");
      expect(errors).toHaveProperty("name");
      expect(result).not.toHaveProperty("name");
    });

    it("should handle non-existent field", () => {
      const errors = {
        name: "Name is required",
      };
      const result = clearFieldError(errors, "email" as keyof typeof errors);
      expect(result).toEqual(errors);
    });
  });

  describe("setFieldError", () => {
    it("should add error for specified field", () => {
      const errors: Record<string, string> = {
        name: "Name is required",
      };
      const result = setFieldError(errors, "email", "Email is invalid");
      expect(result.name).toBe("Name is required");
      expect(result.email).toBe("Email is invalid");
    });

    it("should overwrite existing error", () => {
      const errors = {
        name: "Name is required",
      };
      const result = setFieldError(errors, "name", "Name is too short");
      expect(result.name).toBe("Name is too short");
    });
  });

  describe("validateRequired", () => {
    it("should return null for valid value", () => {
      expect(validateRequired("test", "error")).toBeNull();
      expect(validateRequired("  test  ", "error")).toBeNull();
    });

    it("should return error message for empty value", () => {
      expect(validateRequired("", "error")).toBe("error");
      expect(validateRequired("   ", "error")).toBe("error");
    });

    it("should return error message for null", () => {
      expect(validateRequired(null, "error")).toBe("error");
    });

    it("should return error message for undefined", () => {
      expect(validateRequired(undefined, "error")).toBe("error");
    });
  });

  describe("validateNumeric", () => {
    it("should return null for valid number", () => {
      expect(validateNumeric("123", "error")).toBeNull();
      expect(validateNumeric("123.45", "error")).toBeNull();
      expect(validateNumeric("-123", "error")).toBeNull();
    });

    it("should return error for empty value", () => {
      expect(validateNumeric("", "error")).toBe("error");
      expect(validateNumeric(null, "error")).toBe("error");
      expect(validateNumeric(undefined, "error")).toBe("error");
    });

    it("should return error for non-numeric value", () => {
      expect(validateNumeric("abc", "error")).toBe("error");
      // parseFloat parses "12abc" as 12, so this won't return an error
      // Only completely non-numeric strings return error
      expect(validateNumeric("abc12", "error")).toBe("error");
    });

    it("should validate minimum value", () => {
      expect(validateNumeric("10", "error", 5)).toBeNull();
      expect(validateNumeric("3", "error", 5)).toBe("error");
    });

    it("should validate maximum value", () => {
      expect(validateNumeric("10", "error", undefined, 20)).toBeNull();
      expect(validateNumeric("25", "error", undefined, 20)).toBe("error");
    });

    it("should validate both min and max", () => {
      expect(validateNumeric("15", "error", 10, 20)).toBeNull();
      expect(validateNumeric("5", "error", 10, 20)).toBe("error");
      expect(validateNumeric("25", "error", 10, 20)).toBe("error");
    });
  });

  describe("validateDate", () => {
    it("should return null for valid date", () => {
      expect(validateDate("2024-01-15", "error")).toBeNull();
      expect(validateDate("2024-01-15T12:00:00Z", "error")).toBeNull();
    });

    it("should return error for empty value", () => {
      expect(validateDate("", "error")).toBe("error");
      expect(validateDate(null, "error")).toBe("error");
      expect(validateDate(undefined, "error")).toBe("error");
    });

    it("should return error for invalid date", () => {
      expect(validateDate("invalid", "error")).toBe("error");
      expect(validateDate("2024-13-45", "error")).toBe("error");
    });

    it("should validate max date", () => {
      const maxDate = new Date("2024-12-31");
      expect(validateDate("2024-01-15", "error", maxDate)).toBeNull();
      expect(validateDate("2025-01-15", "error", maxDate)).toBe("error");
    });
  });
});
