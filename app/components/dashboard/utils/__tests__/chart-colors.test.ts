import { describe, it, expect } from "vitest";
import { getChartColors, getPieChartColors, type ChartColors } from "../chart-colors";

describe("getChartColors", () => {
  it("should return dark theme colors when isDark is true", () => {
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

  it("should return light theme colors when isDark is false", () => {
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

  it("should return all required color properties", () => {
    const darkColors = getChartColors(true);
    const lightColors = getChartColors(false);

    const requiredKeys: (keyof ChartColors)[] = [
      "income",
      "expense",
      "net",
      "weight",
      "paid",
      "unpaid",
      "overdue",
      "partial",
      "grid",
      "text",
      "background",
      "border",
    ];

    requiredKeys.forEach((key) => {
      expect(darkColors).toHaveProperty(key);
      expect(lightColors).toHaveProperty(key);
      expect(typeof darkColors[key]).toBe("string");
      expect(typeof lightColors[key]).toBe("string");
    });
  });
});

describe("getPieChartColors", () => {
  it("should return array of pie chart colors in correct order", () => {
    const colors = getChartColors(false);
    const pieColors = getPieChartColors(colors);

    expect(pieColors).toEqual([colors.paid, colors.unpaid, colors.overdue, colors.partial]);
  });

  it("should return correct colors for dark theme", () => {
    const darkColors = getChartColors(true);
    const pieColors = getPieChartColors(darkColors);

    expect(pieColors).toHaveLength(4);
    expect(pieColors[0]).toBe(darkColors.paid);
    expect(pieColors[1]).toBe(darkColors.unpaid);
    expect(pieColors[2]).toBe(darkColors.overdue);
    expect(pieColors[3]).toBe(darkColors.partial);
  });

  it("should return correct colors for light theme", () => {
    const lightColors = getChartColors(false);
    const pieColors = getPieChartColors(lightColors);

    expect(pieColors).toHaveLength(4);
    expect(pieColors[0]).toBe(lightColors.paid);
    expect(pieColors[1]).toBe(lightColors.unpaid);
    expect(pieColors[2]).toBe(lightColors.overdue);
    expect(pieColors[3]).toBe(lightColors.partial);
  });
});
