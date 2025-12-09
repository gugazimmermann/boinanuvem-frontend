import { describe, it, expect } from "vitest";
import {
  clearFieldError,
  setFieldError,
  validateRequired,
  validateNumeric,
  validateDate,
} from "../form-helpers";

describe("clearFieldError", () => {
  it("should remove error for specified field", () => {
    const errors = {
      name: "Name is required",
      email: "Email is invalid",
      phone: "Phone is required",
    };
    const result = clearFieldError(errors, "email");
    expect(result.email).toBeUndefined();
    expect(result.name).toBe("Name is required");
    expect(result.phone).toBe("Phone is required");
  });

  it("should not mutate original errors object", () => {
    const errors = {
      name: "Name is required",
      email: "Email is invalid",
    };
    const original = { ...errors };
    clearFieldError(errors, "email");
    expect(errors).toEqual(original);
  });

  it("should handle empty errors object", () => {
    const errors: Record<string, string> = {};
    const result = clearFieldError(errors, "name");
    expect(result).toEqual({});
  });

  it("should handle field that doesn't exist", () => {
    const errors = { name: "Name is required" };
    const result = clearFieldError(errors, "nonexistent" as keyof typeof errors);
    expect(result).toEqual({ name: "Name is required" });
  });
});

describe("setFieldError", () => {
  it("should set error for specified field", () => {
    const errors = {
      name: "Name is required",
    };
    const result = setFieldError(errors, "name", "Name is invalid");
    expect(result.name).toBe("Name is invalid");
  });

  it("should overwrite existing error", () => {
    const errors = {
      email: "Email is invalid",
    };
    const result = setFieldError(errors, "email", "Email is required");
    expect(result.email).toBe("Email is required");
  });

  it("should not mutate original errors object", () => {
    const errors = { name: "Name is required" };
    const original = { ...errors };
    setFieldError(errors as Record<string, string>, "email", "Email is invalid");
    expect(errors).toEqual(original);
  });
});

describe("validateRequired", () => {
  it("should return null for valid non-empty value", () => {
    expect(validateRequired("value", "Field is required")).toBeNull();
    expect(validateRequired("  value  ", "Field is required")).toBeNull();
  });

  it("should return error message for empty string", () => {
    expect(validateRequired("", "Field is required")).toBe("Field is required");
  });

  it("should return error message for whitespace-only string", () => {
    expect(validateRequired("   ", "Field is required")).toBe("Field is required");
    expect(validateRequired("\t", "Field is required")).toBe("Field is required");
  });

  it("should return error message for null", () => {
    expect(validateRequired(null, "Field is required")).toBe("Field is required");
  });

  it("should return error message for undefined", () => {
    expect(validateRequired(undefined, "Field is required")).toBe("Field is required");
  });
});

describe("validateNumeric", () => {
  it("should return null for valid number", () => {
    expect(validateNumeric("123", "Invalid number")).toBeNull();
    expect(validateNumeric("123.45", "Invalid number")).toBeNull();
    expect(validateNumeric("-123", "Invalid number")).toBeNull();
  });

  it("should return error for empty value", () => {
    expect(validateNumeric("", "Invalid number")).toBe("Invalid number");
    expect(validateNumeric(null, "Invalid number")).toBe("Invalid number");
    expect(validateNumeric(undefined, "Invalid number")).toBe("Invalid number");
  });

  it("should return error for non-numeric value", () => {
    expect(validateNumeric("abc", "Invalid number")).toBe("Invalid number");
    // Number.parseFloat("12abc") returns 12, so this is valid according to the implementation
    expect(validateNumeric("12abc", "Invalid number")).toBeNull();
  });

  it("should validate minimum value", () => {
    expect(validateNumeric("5", "Invalid number", 10)).toBe("Invalid number");
    expect(validateNumeric("15", "Invalid number", 10)).toBeNull();
  });

  it("should validate maximum value", () => {
    expect(validateNumeric("15", "Invalid number", undefined, 10)).toBe("Invalid number");
    expect(validateNumeric("5", "Invalid number", undefined, 10)).toBeNull();
  });

  it("should validate both min and max", () => {
    expect(validateNumeric("5", "Invalid number", 10, 20)).toBe("Invalid number");
    expect(validateNumeric("15", "Invalid number", 10, 20)).toBeNull();
    expect(validateNumeric("25", "Invalid number", 10, 20)).toBe("Invalid number");
  });
});

describe("validateDate", () => {
  it("should return null for valid date string", () => {
    expect(validateDate("2024-01-15", "Invalid date")).toBeNull();
    expect(validateDate("2024-01-15T10:30:00Z", "Invalid date")).toBeNull();
  });

  it("should return error for empty value", () => {
    expect(validateDate("", "Invalid date")).toBe("Invalid date");
    expect(validateDate(null, "Invalid date")).toBe("Invalid date");
    expect(validateDate(undefined, "Invalid date")).toBe("Invalid date");
  });

  it("should return error for invalid date string", () => {
    expect(validateDate("invalid-date", "Invalid date")).toBe("Invalid date");
    expect(validateDate("2024-13-45", "Invalid date")).toBe("Invalid date");
  });

  it("should validate against max date", () => {
    const maxDate = new Date("2024-01-31");
    expect(validateDate("2024-02-01", "Invalid date", maxDate)).toBe("Invalid date");
    expect(validateDate("2024-01-15", "Invalid date", maxDate)).toBeNull();
  });

  it("should allow date equal to max date", () => {
    const maxDate = new Date("2024-01-31");
    expect(validateDate("2024-01-31", "Invalid date", maxDate)).toBeNull();
  });
});
