import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  getErrorMessage,
} from "../auth-helpers";

describe("validateEmail", () => {
  it("should validate correct email addresses", () => {
    expect(validateEmail("user@example.com")).toBe(true);
    expect(validateEmail("test@domain.org")).toBe(true);
  });

  it("should reject invalid email addresses", () => {
    expect(validateEmail("invalid")).toBe(false);
    expect(validateEmail("user@")).toBe(false);
    expect(validateEmail("@example.com")).toBe(false);
  });

  it("should delegate to isValidEmail", () => {
    // This function is a wrapper, so we test it delegates correctly
    expect(validateEmail("valid@email.com")).toBe(true);
    expect(validateEmail("invalid-email")).toBe(false);
  });
});

describe("validatePassword", () => {
  it("should validate password with default min length (6)", () => {
    expect(validatePassword("123456")).toBe(true);
    expect(validatePassword("password")).toBe(true);
    expect(validatePassword("12345")).toBe(false); // 5 characters
  });

  it("should validate password with custom min length", () => {
    expect(validatePassword("1234", 4)).toBe(true);
    expect(validatePassword("123", 4)).toBe(false);
    expect(validatePassword("12345678", 8)).toBe(true);
    expect(validatePassword("1234567", 8)).toBe(false);
  });

  it("should handle empty password", () => {
    expect(validatePassword("")).toBe(false);
  });

  it("should handle exactly min length", () => {
    expect(validatePassword("123456", 6)).toBe(true);
    expect(validatePassword("12345", 6)).toBe(false);
  });
});

describe("validatePasswordMatch", () => {
  it("should return true when passwords match", () => {
    expect(validatePasswordMatch("password123", "password123")).toBe(true);
    expect(validatePasswordMatch("", "")).toBe(true);
    expect(validatePasswordMatch("a", "a")).toBe(true);
  });

  it("should return false when passwords do not match", () => {
    expect(validatePasswordMatch("password123", "password456")).toBe(false);
    expect(validatePasswordMatch("password", "Password")).toBe(false);
    expect(validatePasswordMatch("a", "b")).toBe(false);
  });

  it("should be case sensitive", () => {
    expect(validatePasswordMatch("Password", "password")).toBe(false);
    expect(validatePasswordMatch("PASSWORD", "password")).toBe(false);
  });
});

describe("getErrorMessage", () => {
  it("should return translation when key exists", () => {
    const translations = {
      error1: "Error message 1",
      error2: "Error message 2",
    };
    expect(getErrorMessage("error1", translations)).toBe("Error message 1");
    expect(getErrorMessage("error2", translations)).toBe("Error message 2");
  });

  it("should return key when translation does not exist", () => {
    const translations = {
      error1: "Error message 1",
    };
    expect(getErrorMessage("nonexistent", translations)).toBe("nonexistent");
    expect(getErrorMessage("error2", translations)).toBe("error2");
  });

  it("should handle empty translations object", () => {
    expect(getErrorMessage("anyKey", {})).toBe("anyKey");
  });

  it("should handle empty key", () => {
    const translations = { error1: "Error" };
    expect(getErrorMessage("", translations)).toBe("");
  });
});
