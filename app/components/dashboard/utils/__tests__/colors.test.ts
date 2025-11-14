import { describe, it, expect } from "vitest";
import { DASHBOARD_COLORS } from "../colors";

describe("DASHBOARD_COLORS", () => {
  it("should export color constants", () => {
    expect(DASHBOARD_COLORS.primary).toBeDefined();
    expect(DASHBOARD_COLORS.secondary).toBeDefined();
    expect(DASHBOARD_COLORS.primaryDark).toBeDefined();
    expect(DASHBOARD_COLORS.secondaryDark).toBeDefined();
    expect(DASHBOARD_COLORS.primaryLight).toBeDefined();
    expect(DASHBOARD_COLORS.secondaryLight).toBeDefined();
  });

  it("should have valid color values", () => {
    Object.values(DASHBOARD_COLORS).forEach((color) => {
      expect(typeof color).toBe("string");
      expect(color.length).toBeGreaterThan(0);
    });
  });
});
