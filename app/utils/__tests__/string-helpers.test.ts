import { describe, it, expect } from "vitest";
import { getStringValue } from "../string-helpers";

describe("getStringValue", () => {
  describe("primitive types", () => {
    it("should return string as-is", () => {
      expect(getStringValue("hello")).toBe("hello");
      expect(getStringValue("")).toBe("");
      expect(getStringValue("123")).toBe("123");
    });

    it("should convert number to string", () => {
      expect(getStringValue(123)).toBe("123");
      expect(getStringValue(0)).toBe("0");
      expect(getStringValue(-123)).toBe("-123");
      expect(getStringValue(123.456)).toBe("123.456");
    });

    it("should convert boolean to string", () => {
      expect(getStringValue(true)).toBe("true");
      expect(getStringValue(false)).toBe("false");
    });

    it("should return empty string for null", () => {
      expect(getStringValue(null)).toBe("");
    });

    it("should return empty string for undefined", () => {
      expect(getStringValue(undefined)).toBe("");
    });

    it("should convert bigint to string", () => {
      expect(getStringValue(BigInt(123))).toBe("123");
      expect(getStringValue(BigInt(0))).toBe("0");
    });

    it("should convert symbol to string", () => {
      const sym = Symbol("test");
      const result = getStringValue(sym);
      expect(typeof result).toBe("string");
      expect(result).toContain("Symbol");
    });
  });

  describe("Date objects", () => {
    it("should convert Date to ISO string", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      const result = getStringValue(date);
      expect(result).toBe(date.toISOString());
      expect(result).toContain("2024-01-15");
    });

    it("should handle different dates", () => {
      const date1 = new Date("2020-01-01T00:00:00Z");
      const date2 = new Date("2024-12-31T23:59:59Z");
      expect(getStringValue(date1)).toBe(date1.toISOString());
      expect(getStringValue(date2)).toBe(date2.toISOString());
    });
  });

  describe("objects", () => {
    it("should stringify plain objects with JSON.stringify", () => {
      const obj = { name: "test", value: 123 };
      const result = getStringValue(obj);
      expect(result).toBe('{"name":"test","value":123}');
    });

    it("should stringify arrays", () => {
      const arr = [1, 2, 3];
      const result = getStringValue(arr);
      // Arrays have a custom toString that returns comma-separated values
      expect(result).toBe("1,2,3");
    });

    it("should handle nested objects", () => {
      const obj = { a: { b: { c: "test" } } };
      const result = getStringValue(obj);
      expect(result).toBe('{"a":{"b":{"c":"test"}}}');
    });

    it("should handle objects with custom toString", () => {
      class CustomClass {
        toString() {
          return "custom string";
        }
      }
      const custom = new CustomClass();
      const result = getStringValue(custom);
      expect(result).toBe("custom string");
    });

    it("should handle objects with toString returning [object Object]", () => {
      const obj = { toString: () => "[object Object]" };
      const result = getStringValue(obj);
      // When toString returns "[object Object]", it falls back to JSON.stringify
      // But since the object has a toString property, JSON.stringify includes it
      expect(result).toBe("{}");
    });

    it("should handle circular references", () => {
      const obj: Record<string, unknown> = { name: "test" };
      obj.self = obj;
      const result = getStringValue(obj);
      // Should handle circular reference gracefully
      expect(result).toBe("[object Object]");
    });

    it("should handle objects that throw in JSON.stringify", () => {
      const obj = {
        toJSON: () => {
          throw new Error("Cannot serialize");
        },
      };
      const result = getStringValue(obj);
      expect(result).toBe("[object Object]");
    });
  });

  describe("functions", () => {
    it("should convert function to string", () => {
      function testFunc() {
        return "test";
      }
      const result = getStringValue(testFunc);
      expect(typeof result).toBe("string");
      expect(result).toContain("function");
    });

    it("should handle arrow functions", () => {
      const arrowFunc = () => "test";
      const result = getStringValue(arrowFunc);
      expect(typeof result).toBe("string");
      expect(result).toContain("=>");
    });

    it("should handle anonymous functions", () => {
      const anonFunc = function () {
        return "test";
      };
      const result = getStringValue(anonFunc);
      expect(typeof result).toBe("string");
    });
  });

  describe("edge cases", () => {
    it("should handle empty objects", () => {
      expect(getStringValue({})).toBe("{}");
    });

    it("should handle empty arrays", () => {
      expect(getStringValue([])).toBe("[]");
    });

    it("should handle objects with null values", () => {
      const obj = { a: null, b: undefined };
      const result = getStringValue(obj);
      expect(result).toContain("null");
    });

    it("should handle special number values", () => {
      expect(getStringValue(Infinity)).toBe("Infinity");
      expect(getStringValue(-Infinity)).toBe("-Infinity");
      expect(getStringValue(NaN)).toBe("NaN");
    });
  });
});
