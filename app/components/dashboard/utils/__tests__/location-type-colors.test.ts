import { describe, it, expect } from "vitest";
import { getLocationTypeColors, LOCATION_TYPE_COLORS } from "../location-type-colors";
import { LocationType } from "~/types";

describe("LOCATION_TYPE_COLORS", () => {
  it("should have colors for all LocationType values", () => {
    const locationTypes = Object.values(LocationType);

    locationTypes.forEach((type) => {
      expect(LOCATION_TYPE_COLORS).toHaveProperty(type);
      expect(LOCATION_TYPE_COLORS[type]).toHaveProperty("light");
      expect(LOCATION_TYPE_COLORS[type]).toHaveProperty("dark");
      expect(LOCATION_TYPE_COLORS[type].light).toHaveProperty("text");
      expect(LOCATION_TYPE_COLORS[type].light).toHaveProperty("bg");
      expect(LOCATION_TYPE_COLORS[type].dark).toHaveProperty("text");
      expect(LOCATION_TYPE_COLORS[type].dark).toHaveProperty("bg");
    });
  });

  it("should have valid color values for PASTURE", () => {
    const colors = LOCATION_TYPE_COLORS[LocationType.PASTURE];
    expect(colors.light.text).toBe("#16a34a");
    expect(colors.light.bg).toBe("#dcfce7");
    expect(colors.dark.text).toBe("#4ade80");
    expect(colors.dark.bg).toBe("rgba(16, 185, 129, 0.2)");
  });

  it("should have valid color values for BARN", () => {
    const colors = LOCATION_TYPE_COLORS[LocationType.BARN];
    expect(colors.light.text).toBe("#2563eb");
    expect(colors.light.bg).toBe("#dbeafe");
    expect(colors.dark.text).toBe("#60a5fa");
    expect(colors.dark.bg).toBe("rgba(37, 99, 235, 0.2)");
  });

  it("should have valid color values for STORAGE", () => {
    const colors = LOCATION_TYPE_COLORS[LocationType.STORAGE];
    expect(colors.light.text).toBe("#7c3aed");
    expect(colors.light.bg).toBe("#ede9fe");
    expect(colors.dark.text).toBe("#a78bfa");
    expect(colors.dark.bg).toBe("rgba(124, 58, 237, 0.2)");
  });

  it("should have valid color values for CORRAL", () => {
    const colors = LOCATION_TYPE_COLORS[LocationType.CORRAL];
    expect(colors.light.text).toBe("#ea580c");
    expect(colors.light.bg).toBe("#ffedd5");
    expect(colors.dark.text).toBe("#fb923c");
    expect(colors.dark.bg).toBe("rgba(234, 88, 12, 0.2)");
  });

  it("should have valid color values for OTHER", () => {
    const colors = LOCATION_TYPE_COLORS[LocationType.OTHER];
    expect(colors.light.text).toBe("#64748b");
    expect(colors.light.bg).toBe("#f8fafc");
    expect(colors.dark.text).toBe("#cbd5e1");
    expect(colors.dark.bg).toBe("rgba(100, 116, 139, 0.2)");
  });
});

describe("getLocationTypeColors", () => {
  it("should return colors for valid LocationType", () => {
    const colors = getLocationTypeColors(LocationType.PASTURE);
    expect(colors).toEqual(LOCATION_TYPE_COLORS[LocationType.PASTURE]);
  });

  it("should return colors for all valid LocationType values", () => {
    const locationTypes = Object.values(LocationType);

    locationTypes.forEach((type) => {
      const colors = getLocationTypeColors(type);
      expect(colors).toEqual(LOCATION_TYPE_COLORS[type]);
    });
  });

  it("should return OTHER colors for invalid LocationType", () => {
    // TypeScript won't allow this, but testing runtime behavior
    const invalidType = "INVALID_TYPE" as LocationType;
    const colors = getLocationTypeColors(invalidType);
    expect(colors).toEqual(LOCATION_TYPE_COLORS[LocationType.OTHER]);
  });

  it("should return colors with correct structure", () => {
    const colors = getLocationTypeColors(LocationType.PASTURE);
    expect(colors).toHaveProperty("light");
    expect(colors).toHaveProperty("dark");
    expect(colors.light).toHaveProperty("text");
    expect(colors.light).toHaveProperty("bg");
    expect(colors.dark).toHaveProperty("text");
    expect(colors.dark).toHaveProperty("bg");
  });
});
