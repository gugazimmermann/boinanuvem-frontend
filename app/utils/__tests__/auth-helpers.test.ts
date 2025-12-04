import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  getErrorMessage,
} from "../auth-helpers";

describe("auth-helpers", () => {
  describe("validateEmail", () => {
    it("should return true for valid email addresses", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name@domain.co.uk")).toBe(true);
      expect(validateEmail("user+tag@example.com")).toBe(true);
    });

    it("should return false for invalid email addresses", () => {
      expect(validateEmail("invalid")).toBe(false);
      expect(validateEmail("invalid@")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("test@")).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("should return true for passwords meeting minimum length", () => {
      expect(validatePassword("password", 6)).toBe(true);
      expect(validatePassword("123456", 6)).toBe(true);
      expect(validatePassword("longpassword", 6)).toBe(true);
    });

    it("should return false for passwords below minimum length", () => {
      expect(validatePassword("short", 6)).toBe(false);
      expect(validatePassword("12345", 6)).toBe(false);
    });

    it("should use default minimum length of 6", () => {
      expect(validatePassword("123456")).toBe(true);
      expect(validatePassword("12345")).toBe(false);
    });
  });

  describe("validatePasswordMatch", () => {
    it("should return true when passwords match", () => {
      expect(validatePasswordMatch("password", "password")).toBe(true);
      expect(validatePasswordMatch("123456", "123456")).toBe(true);
    });

    it("should return false when passwords do not match", () => {
      expect(validatePasswordMatch("password", "different")).toBe(false);
      expect(validatePasswordMatch("123456", "654321")).toBe(false);
    });
  });

  describe("getErrorMessage", () => {
    it("should return translation for existing error key", () => {
      const translations = {
        "error.required": "This field is required",
        "error.invalid": "Invalid value",
      };
      expect(getErrorMessage("error.required", translations)).toBe("This field is required");
      expect(getErrorMessage("error.invalid", translations)).toBe("Invalid value");
    });

    it("should return error key when translation is not found", () => {
      const translations = {
        "error.required": "This field is required",
      };
      expect(getErrorMessage("error.notfound", translations)).toBe("error.notfound");
    });
  });
});
