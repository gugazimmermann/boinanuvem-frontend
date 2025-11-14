import { describe, it, expect } from "vitest";
import { LOCATION_TYPE_COLORS, getLocationTypeColors } from "../location-type-colors";
import { LocationType } from "~/types";

describe("location-type-colors", () => {
  describe("LOCATION_TYPE_COLORS", () => {
    it("should have colors for all location types", () => {
      const locationTypes = Object.values(LocationType);
      locationTypes.forEach((type) => {
        expect(LOCATION_TYPE_COLORS[type]).toBeDefined();
        expect(LOCATION_TYPE_COLORS[type].light).toBeDefined();
        expect(LOCATION_TYPE_COLORS[type].dark).toBeDefined();
        expect(LOCATION_TYPE_COLORS[type].light.text).toBeDefined();
        expect(LOCATION_TYPE_COLORS[type].light.bg).toBeDefined();
        expect(LOCATION_TYPE_COLORS[type].dark.text).toBeDefined();
        expect(LOCATION_TYPE_COLORS[type].dark.bg).toBeDefined();
      });
    });

    it("should have valid color formats", () => {
      Object.values(LOCATION_TYPE_COLORS).forEach((colors) => {
        expect(colors.light.text).toMatch(/^#[\da-fA-F]{6}$/);
        expect(colors.light.bg).toMatch(/^#[\da-fA-F]{6}$/);
        expect(colors.dark.text).toMatch(/^#[\da-fA-F]{6}$/);
        expect(colors.dark.bg).toMatch(/rgba?\([\d\s,.]+\)/);
      });
    });
  });

  describe("getLocationTypeColors", () => {
    it("should return colors for valid location type", () => {
      const colors = getLocationTypeColors(LocationType.PASTURE);
      expect(colors).toBeDefined();
      expect(colors.light).toBeDefined();
      expect(colors.dark).toBeDefined();
    });

    it("should return OTHER colors for invalid location type", () => {
      const invalidType = "INVALID_TYPE" as LocationType;
      const colors = getLocationTypeColors(invalidType);
      expect(colors).toEqual(LOCATION_TYPE_COLORS[LocationType.OTHER]);
    });

    it("should return different colors for different types", () => {
      const pastureColors = getLocationTypeColors(LocationType.PASTURE);
      const barnColors = getLocationTypeColors(LocationType.BARN);
      expect(pastureColors).not.toEqual(barnColors);
    });
  });
});
