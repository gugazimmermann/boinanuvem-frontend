import { describe, it, expect } from "vitest";
import { DASHBOARD_COLORS } from "../colors";
import { COLORS } from "~/components/site/constants";

describe("DASHBOARD_COLORS", () => {
  it("should have all required color properties", () => {
    expect(DASHBOARD_COLORS).toHaveProperty("primary");
    expect(DASHBOARD_COLORS).toHaveProperty("secondary");
    expect(DASHBOARD_COLORS).toHaveProperty("primaryDark");
    expect(DASHBOARD_COLORS).toHaveProperty("secondaryDark");
    expect(DASHBOARD_COLORS).toHaveProperty("primaryLight");
    expect(DASHBOARD_COLORS).toHaveProperty("secondaryLight");
  });

  it("should map primary to COLORS.secondary", () => {
    expect(DASHBOARD_COLORS.primary).toBe(COLORS.secondary);
  });

  it("should map secondary to COLORS.primary", () => {
    expect(DASHBOARD_COLORS.secondary).toBe(COLORS.primary);
  });

  it("should map primaryDark to COLORS.secondaryDark", () => {
    expect(DASHBOARD_COLORS.primaryDark).toBe(COLORS.secondaryDark);
  });

  it("should map secondaryDark to COLORS.primaryDark", () => {
    expect(DASHBOARD_COLORS.secondaryDark).toBe(COLORS.primaryDark);
  });

  it("should map primaryLight to COLORS.secondaryLight", () => {
    expect(DASHBOARD_COLORS.primaryLight).toBe(COLORS.secondaryLight);
  });

  it("should map secondaryLight to COLORS.primaryLight", () => {
    expect(DASHBOARD_COLORS.secondaryLight).toBe(COLORS.primaryLight);
  });

  it("should be a readonly object", () => {
    expect(Object.isFrozen(DASHBOARD_COLORS)).toBe(true);
  });
});
