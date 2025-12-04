import { describe, it, expect } from "vitest";
import { getChartColors, getPieChartColors } from "../chart-colors";

describe("chart-colors", () => {
  describe("getChartColors", () => {
    it("should return light colors when isDark is false", () => {
      const colors = getChartColors(false);
      expect(colors.income).toBe("#059669");
      expect(colors.expense).toBe("#dc2626");
      expect(colors.net).toBe("#2563eb");
      expect(colors.weight).toBe("#2563eb");
      expect(colors.paid).toBe("#059669");
      expect(colors.unpaid).toBe("#d97706");
      expect(colors.overdue).toBe("#dc2626");
      expect(colors.partial).toBe("#4f46e5");
      expect(colors.grid).toBe("#e5e7eb");
      expect(colors.text).toBe("#6b7280");
      expect(colors.background).toBe("#ffffff");
      expect(colors.border).toBe("#e5e7eb");
    });

    it("should return dark colors when isDark is true", () => {
      const colors = getChartColors(true);
      expect(colors.income).toBe("#10b981");
      expect(colors.expense).toBe("#ef4444");
      expect(colors.net).toBe("#3b82f6");
      expect(colors.weight).toBe("#3b82f6");
      expect(colors.paid).toBe("#10b981");
      expect(colors.unpaid).toBe("#f59e0b");
      expect(colors.overdue).toBe("#ef4444");
      expect(colors.partial).toBe("#6366f1");
      expect(colors.grid).toBe("#374151");
      expect(colors.text).toBe("#9ca3af");
      expect(colors.background).toBe("#1f2937");
      expect(colors.border).toBe("#374151");
    });

    it("should return all required color properties", () => {
      const colors = getChartColors(false);
      expect(colors).toHaveProperty("income");
      expect(colors).toHaveProperty("expense");
      expect(colors).toHaveProperty("net");
      expect(colors).toHaveProperty("weight");
      expect(colors).toHaveProperty("paid");
      expect(colors).toHaveProperty("unpaid");
      expect(colors).toHaveProperty("overdue");
      expect(colors).toHaveProperty("partial");
      expect(colors).toHaveProperty("grid");
      expect(colors).toHaveProperty("text");
      expect(colors).toHaveProperty("background");
      expect(colors).toHaveProperty("border");
    });

    it("should return valid hex color codes", () => {
      const colors = getChartColors(false);
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

      Object.values(colors).forEach((color) => {
        expect(color).toMatch(hexColorRegex);
      });
    });
  });

  describe("getPieChartColors", () => {
    it("should return array of pie chart colors", () => {
      const colors = getChartColors(false);
      const pieColors = getPieChartColors(colors);

      expect(Array.isArray(pieColors)).toBe(true);
      expect(pieColors.length).toBe(4);
    });

    it("should return correct color order", () => {
      const colors = getChartColors(false);
      const pieColors = getPieChartColors(colors);

      expect(pieColors[0]).toBe(colors.paid);
      expect(pieColors[1]).toBe(colors.unpaid);
      expect(pieColors[2]).toBe(colors.overdue);
      expect(pieColors[3]).toBe(colors.partial);
    });

    it("should work with dark colors", () => {
      const colors = getChartColors(true);
      const pieColors = getPieChartColors(colors);

      expect(pieColors[0]).toBe(colors.paid);
      expect(pieColors[1]).toBe(colors.unpaid);
      expect(pieColors[2]).toBe(colors.overdue);
      expect(pieColors[3]).toBe(colors.partial);
    });

    it("should return valid hex color codes", () => {
      const colors = getChartColors(false);
      const pieColors = getPieChartColors(colors);
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

      pieColors.forEach((color) => {
        expect(color).toMatch(hexColorRegex);
      });
    });
  });
});
