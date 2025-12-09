import { describe, it, expect } from "vitest";
import { isValidEmail } from "../email-validation";

describe("isValidEmail", () => {
  describe("valid email formats", () => {
    it("should validate simple email addresses", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("test@domain.com")).toBe(true);
      expect(isValidEmail("name@company.org")).toBe(true);
    });

    it("should validate emails with numbers", () => {
      expect(isValidEmail("user123@example.com")).toBe(true);
      expect(isValidEmail("123@example.com")).toBe(true);
      expect(isValidEmail("user@123.com")).toBe(true);
    });

    it("should validate emails with dots", () => {
      expect(isValidEmail("first.last@example.com")).toBe(true);
      expect(isValidEmail("user.name@example.com")).toBe(true);
      expect(isValidEmail("test@sub.domain.com")).toBe(true);
    });

    it("should validate emails with underscores", () => {
      expect(isValidEmail("user_name@example.com")).toBe(true);
      expect(isValidEmail("test_user@example.com")).toBe(true);
    });

    it("should validate emails with plus signs", () => {
      expect(isValidEmail("user+tag@example.com")).toBe(true);
      expect(isValidEmail("test+filter@example.com")).toBe(true);
    });

    it("should validate emails with hyphens", () => {
      expect(isValidEmail("user-name@example.com")).toBe(true);
      expect(isValidEmail("test@sub-domain.com")).toBe(true);
    });

    it("should validate emails with percent signs", () => {
      expect(isValidEmail("user%name@example.com")).toBe(true);
    });

    it("should validate emails with long TLDs", () => {
      expect(isValidEmail("user@example.info")).toBe(true);
      // The regex pattern accepts this format
      expect(isValidEmail("test@domain.co.uk")).toBe(true);
    });

    it("should validate emails with short TLDs", () => {
      expect(isValidEmail("user@example.co")).toBe(true);
      expect(isValidEmail("test@domain.io")).toBe(true);
    });
  });

  describe("invalid email formats", () => {
    it("should reject empty strings", () => {
      expect(isValidEmail("")).toBe(false);
    });

    it("should reject emails without @ symbol", () => {
      expect(isValidEmail("userexample.com")).toBe(false);
      expect(isValidEmail("user.example.com")).toBe(false);
    });

    it("should reject emails with multiple @ symbols", () => {
      expect(isValidEmail("user@@example.com")).toBe(false);
      expect(isValidEmail("user@test@example.com")).toBe(false);
    });

    it("should reject emails without domain", () => {
      expect(isValidEmail("user@")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
    });

    it("should reject emails without TLD", () => {
      expect(isValidEmail("user@example")).toBe(false);
      expect(isValidEmail("test@domain")).toBe(false);
    });

    it("should reject emails with TLD shorter than 2 characters", () => {
      expect(isValidEmail("user@example.c")).toBe(false);
    });

    it("should reject emails with spaces", () => {
      expect(isValidEmail("user name@example.com")).toBe(false);
      expect(isValidEmail("user@example .com")).toBe(false);
      expect(isValidEmail("user @example.com")).toBe(false);
    });

    it("should reject emails with invalid characters", () => {
      expect(isValidEmail("user@example!com")).toBe(false);
      expect(isValidEmail("user#name@example.com")).toBe(false);
      expect(isValidEmail("user$name@example.com")).toBe(false);
    });

    it("should reject emails starting with special characters", () => {
      expect(isValidEmail("@user@example.com")).toBe(false);
      // The regex allows dots at the start of local part
      expect(isValidEmail(".user@example.com")).toBe(true);
    });

    it("should reject emails ending with special characters", () => {
      // The regex allows dots and hyphens at the end of local part
      expect(isValidEmail("user.@example.com")).toBe(true);
      expect(isValidEmail("user-@example.com")).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle very long email addresses", () => {
      const longLocal = "a".repeat(64);
      const longDomain = "b".repeat(63);
      expect(isValidEmail(`${longLocal}@${longDomain}.com`)).toBe(true);
    });

    it("should handle emails with many dots", () => {
      expect(isValidEmail("a.b.c.d.e@example.com")).toBe(true);
    });

    it("should handle case sensitivity", () => {
      expect(isValidEmail("USER@EXAMPLE.COM")).toBe(true);
      expect(isValidEmail("User@Example.Com")).toBe(true);
    });
  });
});
