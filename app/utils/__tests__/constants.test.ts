import { describe, it, expect } from "vitest";
import { ANIMAL_UNIT_WEIGHT_KG } from "../constants";

describe("constants", () => {
  describe("ANIMAL_UNIT_WEIGHT_KG", () => {
    it("should be a number", () => {
      expect(typeof ANIMAL_UNIT_WEIGHT_KG).toBe("number");
    });

    it("should equal 450", () => {
      expect(ANIMAL_UNIT_WEIGHT_KG).toBe(450);
    });
  });
});
