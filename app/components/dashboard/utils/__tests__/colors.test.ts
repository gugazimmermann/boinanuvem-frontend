import { describe, it, expect } from "vitest";
import { DASHBOARD_COLORS } from "../colors";

describe("colors", () => {
  it("should export DASHBOARD_COLORS", () => {
    expect(DASHBOARD_COLORS).toBeDefined();
  });

  it("should have primary color", () => {
    expect(DASHBOARD_COLORS.primary).toBeDefined();
    expect(typeof DASHBOARD_COLORS.primary).toBe("string");
  });

  it("should have secondary color", () => {
    expect(DASHBOARD_COLORS.secondary).toBeDefined();
    expect(typeof DASHBOARD_COLORS.secondary).toBe("string");
  });

  it("should have primaryDark color", () => {
    expect(DASHBOARD_COLORS.primaryDark).toBeDefined();
    expect(typeof DASHBOARD_COLORS.primaryDark).toBe("string");
  });

  it("should have secondaryDark color", () => {
    expect(DASHBOARD_COLORS.secondaryDark).toBeDefined();
    expect(typeof DASHBOARD_COLORS.secondaryDark).toBe("string");
  });

  it("should have primaryLight color", () => {
    expect(DASHBOARD_COLORS.primaryLight).toBeDefined();
    expect(typeof DASHBOARD_COLORS.primaryLight).toBe("string");
  });

  it("should have secondaryLight color", () => {
    expect(DASHBOARD_COLORS.secondaryLight).toBeDefined();
    expect(typeof DASHBOARD_COLORS.secondaryLight).toBe("string");
  });

  it("should have all required color properties", () => {
    expect(DASHBOARD_COLORS).toHaveProperty("primary");
    expect(DASHBOARD_COLORS).toHaveProperty("secondary");
    expect(DASHBOARD_COLORS).toHaveProperty("primaryDark");
    expect(DASHBOARD_COLORS).toHaveProperty("secondaryDark");
    expect(DASHBOARD_COLORS).toHaveProperty("primaryLight");
    expect(DASHBOARD_COLORS).toHaveProperty("secondaryLight");
  });
});
