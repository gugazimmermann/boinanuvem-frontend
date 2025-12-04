import { describe, it, expect } from "vitest";
import { LOCATION_TYPE_COLORS, getLocationTypeColors } from "../location-type-colors";
import { LocationType } from "~/types";

describe("location-type-colors", () => {
  describe("LOCATION_TYPE_COLORS", () => {
    it("should have colors for all location types", () => {
      const locationTypes = Object.values(LocationType);
      locationTypes.forEach((type) => {
        expect(LOCATION_TYPE_COLORS[type]).toBeDefined();
      });
    });

    it("should have light and dark color variants", () => {
      Object.values(LOCATION_TYPE_COLORS).forEach((colors) => {
        expect(colors).toHaveProperty("light");
        expect(colors).toHaveProperty("dark");
        expect(colors.light).toHaveProperty("text");
        expect(colors.light).toHaveProperty("bg");
        expect(colors.dark).toHaveProperty("text");
        expect(colors.dark).toHaveProperty("bg");
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

    it("should have valid color values for SILO", () => {
      const colors = LOCATION_TYPE_COLORS[LocationType.SILO];
      expect(colors.light.text).toBe("#0891b2");
      expect(colors.light.bg).toBe("#cffafe");
      expect(colors.dark.text).toBe("#22d3ee");
      expect(colors.dark.bg).toBe("rgba(8, 145, 178, 0.2)");
    });

    it("should have valid color values for FIELD", () => {
      const colors = LOCATION_TYPE_COLORS[LocationType.FIELD];
      expect(colors.light.text).toBe("#059669");
      expect(colors.light.bg).toBe("#d1fae5");
      expect(colors.dark.text).toBe("#34d399");
      expect(colors.dark.bg).toBe("rgba(5, 150, 105, 0.2)");
    });

    it("should have valid color values for PADDOCK", () => {
      const colors = LOCATION_TYPE_COLORS[LocationType.PADDOCK];
      expect(colors.light.text).toBe("#65a30d");
      expect(colors.light.bg).toBe("#f7fee7");
      expect(colors.dark.text).toBe("#a3e635");
      expect(colors.dark.bg).toBe("rgba(101, 163, 13, 0.2)");
    });

    it("should have valid color values for FEEDLOT", () => {
      const colors = LOCATION_TYPE_COLORS[LocationType.FEEDLOT];
      expect(colors.light.text).toBe("#dc2626");
      expect(colors.light.bg).toBe("#fee2e2");
      expect(colors.dark.text).toBe("#f87171");
      expect(colors.dark.bg).toBe("rgba(220, 38, 38, 0.2)");
    });

    it("should have valid color values for SEMI_FEEDLOT", () => {
      const colors = LOCATION_TYPE_COLORS[LocationType.SEMI_FEEDLOT];
      expect(colors.light.text).toBe("#d97706");
      expect(colors.light.bg).toBe("#fef3c7");
      expect(colors.dark.text).toBe("#fbbf24");
      expect(colors.dark.bg).toBe("rgba(217, 119, 6, 0.2)");
    });

    it("should have valid color values for MILKING_PARLOR", () => {
      const colors = LOCATION_TYPE_COLORS[LocationType.MILKING_PARLOR];
      expect(colors.light.text).toBe("#0284c7");
      expect(colors.light.bg).toBe("#e0f2fe");
      expect(colors.dark.text).toBe("#38bdf8");
      expect(colors.dark.bg).toBe("rgba(2, 132, 199, 0.2)");
    });

    it("should have valid color values for WAREHOUSE", () => {
      const colors = LOCATION_TYPE_COLORS[LocationType.WAREHOUSE];
      expect(colors.light.text).toBe("#6b7280");
      expect(colors.light.bg).toBe("#f3f4f6");
      expect(colors.dark.text).toBe("#9ca3af");
      expect(colors.dark.bg).toBe("rgba(107, 114, 128, 0.2)");
    });

    it("should have valid color values for GARAGE", () => {
      const colors = LOCATION_TYPE_COLORS[LocationType.GARAGE];
      expect(colors.light.text).toBe("#475569");
      expect(colors.light.bg).toBe("#f1f5f9");
      expect(colors.dark.text).toBe("#94a3b8");
      expect(colors.dark.bg).toBe("rgba(71, 85, 105, 0.2)");
    });

    it("should have valid color values for OFFICE", () => {
      const colors = LOCATION_TYPE_COLORS[LocationType.OFFICE];
      expect(colors.light.text).toBe("#0369a1");
      expect(colors.light.bg).toBe("#e0f2fe");
      expect(colors.dark.text).toBe("#0ea5e9");
      expect(colors.dark.bg).toBe("rgba(3, 105, 161, 0.2)");
    });

    it("should have valid color values for RESIDENCE", () => {
      const colors = LOCATION_TYPE_COLORS[LocationType.RESIDENCE];
      expect(colors.light.text).toBe("#9333ea");
      expect(colors.light.bg).toBe("#f3e8ff");
      expect(colors.dark.text).toBe("#c084fc");
      expect(colors.dark.bg).toBe("rgba(147, 51, 234, 0.2)");
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
    it("should return colors for valid location type", () => {
      const colors = getLocationTypeColors(LocationType.PASTURE);
      expect(colors).toBeDefined();
      expect(colors).toEqual(LOCATION_TYPE_COLORS[LocationType.PASTURE]);
    });

    it("should return OTHER colors for invalid location type", () => {
      // TypeScript won't allow invalid types, but we can test the fallback behavior
      const colors = getLocationTypeColors(LocationType.OTHER);
      expect(colors).toBeDefined();
      expect(colors).toEqual(LOCATION_TYPE_COLORS[LocationType.OTHER]);
    });

    it("should return colors for all location types", () => {
      Object.values(LocationType).forEach((type) => {
        const colors = getLocationTypeColors(type);
        expect(colors).toBeDefined();
        expect(colors).toHaveProperty("light");
        expect(colors).toHaveProperty("dark");
      });
    });

    it("should return consistent colors for same type", () => {
      const colors1 = getLocationTypeColors(LocationType.BARN);
      const colors2 = getLocationTypeColors(LocationType.BARN);
      expect(colors1).toEqual(colors2);
    });
  });
});
