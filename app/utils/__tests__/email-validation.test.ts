import { describe, it, expect } from "vitest";
import { isValidEmail } from "../email-validation";

describe("email-validation", () => {
  describe("isValidEmail", () => {
    it("should return true for valid email addresses", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name@domain.co.uk")).toBe(true);
      expect(isValidEmail("user+tag@example.com")).toBe(true);
      expect(isValidEmail("user_name@example.com")).toBe(true);
      expect(isValidEmail("user-name@example.com")).toBe(true);
      expect(isValidEmail("user%tag@example.com")).toBe(true);
      expect(isValidEmail("user_tag@example.com")).toBe(true);
      expect(isValidEmail("123@example.com")).toBe(true);
      expect(isValidEmail("a@b.co")).toBe(true);
    });

    it("should return false for invalid email addresses", () => {
      expect(isValidEmail("invalid")).toBe(false);
      expect(isValidEmail("invalid@")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
      expect(isValidEmail("test@")).toBe(false);
      expect(isValidEmail("test@.com")).toBe(false);
      expect(isValidEmail("test@example")).toBe(false);
      expect(isValidEmail("test@example.")).toBe(false);
      expect(isValidEmail("test@example.c")).toBe(false);
      expect(isValidEmail("")).toBe(false);
      expect(isValidEmail("test space@example.com")).toBe(false);
      expect(isValidEmail("test@exam ple.com")).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(isValidEmail("a@b.c")).toBe(false); // TLD must be at least 2 chars
      expect(isValidEmail("test@example.co.uk")).toBe(true);
      expect(isValidEmail("test123@example123.com")).toBe(true);
    });
  });
});
