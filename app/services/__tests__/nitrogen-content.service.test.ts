import { describe, it, expect, beforeEach } from "vitest";
import {
  getNitrogenContent,
  setNitrogenContent,
  hasNitrogenContent,
} from "../nitrogen-content.service";

describe("nitrogen-content.service", () => {
  beforeEach(() => {
    // Clear the map by setting known values to 0 or removing them
    // Since we can't directly access the internal map, we'll test with known IDs
  });

  describe("getNitrogenContent", () => {
    it("should return 0 when item ID does not exist", () => {
      const result = getNitrogenContent("item-nonexistent");
      expect(result).toBe(0);
    });

    it("should return stored nitrogen content when item ID exists", () => {
      setNitrogenContent("test-item-1", 15.5);
      const result = getNitrogenContent("test-item-1");
      expect(result).toBe(15.5);
    });

    it("should return initialized value for known item", () => {
      const result = getNitrogenContent("ii0e8400-e29b-41d4-a716-446655440016");
      expect(result).toBe(10);
    });
  });

  describe("setNitrogenContent", () => {
    it("should set nitrogen content for an item", () => {
      setNitrogenContent("test-item-2", 20.5);
      const result = getNitrogenContent("test-item-2");
      expect(result).toBe(20.5);
    });

    it("should update existing nitrogen content", () => {
      setNitrogenContent("test-item-3", 10);
      setNitrogenContent("test-item-3", 25);
      const result = getNitrogenContent("test-item-3");
      expect(result).toBe(25);
    });

    it("should allow setting to 0", () => {
      setNitrogenContent("test-item-4", 0);
      const result = getNitrogenContent("test-item-4");
      expect(result).toBe(0);
    });

    it("should throw error when setting negative value", () => {
      expect(() => setNitrogenContent("test-item-5", -5)).toThrow(
        "Nitrogen content must be greater than or equal to 0"
      );
    });
  });

  describe("hasNitrogenContent", () => {
    it("should return false when item ID does not exist", () => {
      const result = hasNitrogenContent("item-nonexistent");
      expect(result).toBe(false);
    });

    it("should return true when item ID exists", () => {
      setNitrogenContent("test-item-6", 12.5);
      const result = hasNitrogenContent("test-item-6");
      expect(result).toBe(true);
    });

    it("should return true even when content is 0", () => {
      setNitrogenContent("test-item-7", 0);
      const result = hasNitrogenContent("test-item-7");
      expect(result).toBe(true);
    });

    it("should return true for initialized item", () => {
      const result = hasNitrogenContent("ii0e8400-e29b-41d4-a716-446655440016");
      expect(result).toBe(true);
    });
  });
});
