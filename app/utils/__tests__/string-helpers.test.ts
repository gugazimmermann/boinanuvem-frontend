import { describe, it, expect } from "vitest";
import { getStringValue } from "../string-helpers";

describe("string-helpers", () => {
  describe("getStringValue", () => {
    it("should return string as-is", () => {
      expect(getStringValue("hello")).toBe("hello");
      expect(getStringValue("")).toBe("");
    });

    it("should convert number to string", () => {
      expect(getStringValue(123)).toBe("123");
      expect(getStringValue(0)).toBe("0");
      expect(getStringValue(-123)).toBe("-123");
      expect(getStringValue(123.45)).toBe("123.45");
    });

    it("should convert Date to ISO string", () => {
      const date = new Date("2024-01-15T12:00:00Z");
      const result = getStringValue(date);
      expect(result).toBe(date.toISOString());
    });

    it("should return empty string for null", () => {
      expect(getStringValue(null)).toBe("");
    });

    it("should return empty string for undefined", () => {
      expect(getStringValue(undefined)).toBe("");
    });

    it("should convert boolean to string", () => {
      expect(getStringValue(true)).toBe("true");
      expect(getStringValue(false)).toBe("false");
    });

    it("should convert bigint to string", () => {
      expect(getStringValue(BigInt(123))).toBe("123");
      expect(getStringValue(BigInt(0))).toBe("0");
    });

    it("should convert symbol to string", () => {
      const sym = Symbol("test");
      const result = getStringValue(sym);
      expect(result).toBe(sym.toString());
    });

    it("should stringify plain objects", () => {
      const obj = { a: 1, b: "test" };
      const result = getStringValue(obj);
      expect(result).toBe(JSON.stringify(obj));
    });

    it("should stringify arrays", () => {
      const arr = [1, 2, 3];
      const result = getStringValue(arr);
      // Arrays might be stringified differently, but should be a string representation
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
      // Should contain the array elements in some form
      expect(result).toContain("1");
    });

    it("should handle objects with custom toString", () => {
      const obj = {
        toString() {
          return "custom string";
        },
      };
      expect(getStringValue(obj)).toBe("custom string");
    });

    it("should handle objects with toString returning [object Object]", () => {
      const obj = {
        toString() {
          return "[object Object]";
        },
      };
      const result = getStringValue(obj);
      expect(result).toBe(JSON.stringify(obj));
    });

    it("should handle circular references gracefully", () => {
      const obj: Record<string, unknown> = { a: 1 };
      obj.self = obj;
      const result = getStringValue(obj);
      // Should handle circular reference without throwing
      expect(typeof result).toBe("string");
    });

    it("should convert function to string", () => {
      const fn = function test() {
        return "test";
      };
      const result = getStringValue(fn);
      expect(result).toContain("test");
      expect(typeof result).toBe("string");
    });

    it("should handle arrow functions", () => {
      const fn = () => "test";
      const result = getStringValue(fn);
      expect(typeof result).toBe("string");
    });
  });
});
