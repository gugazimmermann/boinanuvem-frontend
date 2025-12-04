import { describe, it, expect } from "vitest";
import { getTooltipStyle } from "../chart-tooltip";

vi.mock("../../utils/chart-colors", () => ({
  getChartColors: vi.fn((isDark: boolean) => {
    if (isDark) {
      return {
        background: "#1f2937",
        border: "#374151",
        text: "#9ca3af",
      };
    }
    return {
      background: "#ffffff",
      border: "#e5e7eb",
      text: "#6b7280",
    };
  }),
}));

describe("getTooltipStyle", () => {
  it("should return tooltip style for light mode", () => {
    const style = getTooltipStyle(false);
    expect(style.contentStyle.backgroundColor).toBe("#ffffff");
    expect(style.contentStyle.border).toBe("1px solid #e5e7eb");
    expect(style.contentStyle.borderRadius).toBe("8px");
    expect(style.labelStyle.color).toBe("#6b7280");
    expect(style.labelStyle.fontSize).toBe("12px");
    expect(style.labelStyle.fontWeight).toBe("bold");
  });

  it("should return tooltip style for dark mode", () => {
    const style = getTooltipStyle(true);
    expect(style.contentStyle.backgroundColor).toBe("#1f2937");
    expect(style.contentStyle.border).toBe("1px solid #374151");
    expect(style.contentStyle.borderRadius).toBe("8px");
    expect(style.labelStyle.color).toBe("#9ca3af");
    expect(style.labelStyle.fontSize).toBe("12px");
    expect(style.labelStyle.fontWeight).toBe("bold");
  });

  it("should have correct contentStyle properties", () => {
    const style = getTooltipStyle(false);
    expect(style.contentStyle).toHaveProperty("backgroundColor");
    expect(style.contentStyle).toHaveProperty("border");
    expect(style.contentStyle).toHaveProperty("borderRadius");
  });

  it("should have correct labelStyle properties", () => {
    const style = getTooltipStyle(false);
    expect(style.labelStyle).toHaveProperty("color");
    expect(style.labelStyle).toHaveProperty("fontSize");
    expect(style.labelStyle).toHaveProperty("fontWeight");
  });
});
