import { describe, it, expect, beforeEach } from "vitest";
import {
  getNitrogenContent,
  setNitrogenContent,
  hasNitrogenContent,
} from "../nitrogen-content.service";

describe("nitrogen-content.service", () => {
  beforeEach(() => {
    // Reset the map by clearing and reinitializing
    vi.clearAllMocks();
  });

  describe("getNitrogenContent", () => {
    it("should return nitrogen content for existing item", () => {
      setNitrogenContent("item-1", 10);
      const result = getNitrogenContent("item-1");
      expect(result).toBe(10);
    });

    it("should return 0 for non-existent item", () => {
      const result = getNitrogenContent("nonexistent");
      expect(result).toBe(0);
    });
  });

  describe("setNitrogenContent", () => {
    it("should set nitrogen content", () => {
      setNitrogenContent("item-2", 15);
      const result = getNitrogenContent("item-2");
      expect(result).toBe(15);
    });

    it("should throw error for negative value", () => {
      expect(() => setNitrogenContent("item-3", -5)).toThrow(
        "Nitrogen content must be greater than or equal to 0"
      );
    });

    it("should allow zero value", () => {
      setNitrogenContent("item-4", 0);
      const result = getNitrogenContent("item-4");
      expect(result).toBe(0);
    });
  });

  describe("hasNitrogenContent", () => {
    it("should return true when item has nitrogen content", () => {
      setNitrogenContent("item-5", 20);
      const result = hasNitrogenContent("item-5");
      expect(result).toBe(true);
    });

    it("should return false when item does not have nitrogen content", () => {
      const result = hasNitrogenContent("nonexistent");
      expect(result).toBe(false);
    });
  });
});
