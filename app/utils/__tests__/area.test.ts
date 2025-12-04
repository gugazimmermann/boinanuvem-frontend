import { describe, it, expect } from "vitest";
import { convertToHectares } from "../area";
import { AreaType } from "~/types";

describe("area", () => {
  describe("convertToHectares", () => {
    it("should convert hectares to hectares (no conversion)", () => {
      expect(convertToHectares(100, AreaType.HECTARES)).toBe(100);
    });

    it("should convert square meters to hectares", () => {
      expect(convertToHectares(10000, AreaType.SQUARE_METERS)).toBe(1);
      expect(convertToHectares(50000, AreaType.SQUARE_METERS)).toBe(5);
    });

    it("should convert square feet to hectares", () => {
      expect(convertToHectares(107639, AreaType.SQUARE_FEET)).toBeCloseTo(1, 5);
      expect(convertToHectares(538195, AreaType.SQUARE_FEET)).toBeCloseTo(5, 5);
    });

    it("should convert acres to hectares", () => {
      expect(convertToHectares(1, AreaType.ACRES)).toBeCloseTo(0.404686, 5);
      expect(convertToHectares(10, AreaType.ACRES)).toBeCloseTo(4.04686, 5);
    });

    it("should convert square kilometers to hectares", () => {
      expect(convertToHectares(1, AreaType.SQUARE_KILOMETERS)).toBe(100);
      expect(convertToHectares(2.5, AreaType.SQUARE_KILOMETERS)).toBe(250);
    });

    it("should convert square miles to hectares", () => {
      expect(convertToHectares(1, AreaType.SQUARE_MILES)).toBeCloseTo(258.999, 3);
      expect(convertToHectares(2, AreaType.SQUARE_MILES)).toBeCloseTo(517.998, 3);
    });

    it("should return value as-is for unknown type", () => {
      expect(convertToHectares(100, "unknown" as AreaType)).toBe(100);
    });
  });
});
