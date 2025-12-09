import { describe, it, expect } from "vitest";
import { convertToHectares } from "../area";
import { AreaType } from "~/types";

describe("convertToHectares", () => {
  describe("conversion from different area types", () => {
    it("should return same value for hectares", () => {
      expect(convertToHectares(100, AreaType.HECTARES)).toBe(100);
      expect(convertToHectares(0, AreaType.HECTARES)).toBe(0);
      expect(convertToHectares(1.5, AreaType.HECTARES)).toBe(1.5);
    });

    it("should convert from square meters", () => {
      expect(convertToHectares(10000, AreaType.SQUARE_METERS)).toBeCloseTo(1, 5);
      expect(convertToHectares(50000, AreaType.SQUARE_METERS)).toBeCloseTo(5, 5);
      expect(convertToHectares(0, AreaType.SQUARE_METERS)).toBe(0);
    });

    it("should convert from square feet", () => {
      expect(convertToHectares(107639, AreaType.SQUARE_FEET)).toBeCloseTo(1, 2);
      expect(convertToHectares(215278, AreaType.SQUARE_FEET)).toBeCloseTo(2, 2);
    });

    it("should convert from acres", () => {
      expect(convertToHectares(1, AreaType.ACRES)).toBeCloseTo(0.404686, 5);
      expect(convertToHectares(2, AreaType.ACRES)).toBeCloseTo(0.809372, 5);
      expect(convertToHectares(10, AreaType.ACRES)).toBeCloseTo(4.04686, 5);
    });

    it("should convert from square kilometers", () => {
      expect(convertToHectares(1, AreaType.SQUARE_KILOMETERS)).toBe(100);
      expect(convertToHectares(2, AreaType.SQUARE_KILOMETERS)).toBe(200);
      expect(convertToHectares(0.5, AreaType.SQUARE_KILOMETERS)).toBe(50);
    });

    it("should convert from square miles", () => {
      expect(convertToHectares(1, AreaType.SQUARE_MILES)).toBeCloseTo(258.999, 2);
      expect(convertToHectares(2, AreaType.SQUARE_MILES)).toBeCloseTo(517.998, 2);
    });
  });

  describe("edge cases", () => {
    it("should handle zero values", () => {
      expect(convertToHectares(0, AreaType.HECTARES)).toBe(0);
      expect(convertToHectares(0, AreaType.SQUARE_METERS)).toBe(0);
      expect(convertToHectares(0, AreaType.ACRES)).toBe(0);
      expect(convertToHectares(0, AreaType.SQUARE_KILOMETERS)).toBe(0);
      expect(convertToHectares(0, AreaType.SQUARE_MILES)).toBe(0);
      expect(convertToHectares(0, AreaType.SQUARE_FEET)).toBe(0);
    });

    it("should handle negative values", () => {
      expect(convertToHectares(-100, AreaType.HECTARES)).toBe(-100);
      expect(convertToHectares(-10000, AreaType.SQUARE_METERS)).toBeCloseTo(-1, 5);
    });

    it("should handle decimal values", () => {
      expect(convertToHectares(1.5, AreaType.HECTARES)).toBe(1.5);
      expect(convertToHectares(15000, AreaType.SQUARE_METERS)).toBeCloseTo(1.5, 5);
    });

    it("should handle very large values", () => {
      const largeValue = 1000000;
      expect(convertToHectares(largeValue, AreaType.HECTARES)).toBe(largeValue);
      expect(convertToHectares(largeValue, AreaType.SQUARE_METERS)).toBeCloseTo(100, 5);
    });

    it("should handle very small values", () => {
      const smallValue = 0.0001;
      expect(convertToHectares(smallValue, AreaType.HECTARES)).toBe(smallValue);
    });
  });

  describe("default case", () => {
    it("should return original value for unknown type", () => {
      // Using a type assertion to test the default case
      const unknownType = "unknown" as AreaType;
      expect(convertToHectares(100, unknownType)).toBe(100);
    });
  });

  describe("precision", () => {
    it("should maintain reasonable precision for square meters", () => {
      const result = convertToHectares(12345, AreaType.SQUARE_METERS);
      expect(result).toBeCloseTo(1.2345, 4);
    });

    it("should maintain reasonable precision for acres", () => {
      const result = convertToHectares(5, AreaType.ACRES);
      expect(result).toBeCloseTo(2.02343, 4);
    });
  });
});
