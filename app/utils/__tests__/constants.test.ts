import { describe, it, expect } from "vitest";
import { ANIMAL_UNIT_WEIGHT_KG } from "../constants";

describe("constants", () => {
  describe("ANIMAL_UNIT_WEIGHT_KG", () => {
    it("should export the constant", () => {
      expect(ANIMAL_UNIT_WEIGHT_KG).toBeDefined();
    });

    it("should have the correct value", () => {
      expect(ANIMAL_UNIT_WEIGHT_KG).toBe(450);
    });

    it("should be a number", () => {
      expect(typeof ANIMAL_UNIT_WEIGHT_KG).toBe("number");
    });
  });
});
