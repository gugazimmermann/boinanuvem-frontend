import { describe, it, expect } from "vitest";
import { mockDeaths } from "../deaths";

describe("deaths", () => {
  describe("mockDeaths", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockDeaths)).toBe(true);
    });

    it("should be an empty array initially", () => {
      expect(mockDeaths.length).toBe(0);
    });
  });
});
