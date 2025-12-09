import { describe, it, expect, vi, beforeEach } from "vitest";
import { getTooltipStyle } from "../chart-tooltip";
import { getChartColors } from "../../utils/chart-colors";

vi.mock("../../utils/chart-colors", () => ({
  getChartColors: vi.fn(),
}));

describe("getTooltipStyle", () => {
  const mockChartColors = {
    income: "#10b981",
    expense: "#ef4444",
    net: "#3b82f6",
    weight: "#3b82f6",
    paid: "#10b981",
    unpaid: "#f59e0b",
    overdue: "#ef4444",
    partial: "#6366f1",
    grid: "#374151",
    text: "#9ca3af",
    background: "#1f2937",
    border: "#374151",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return tooltip style for dark theme", () => {
    vi.mocked(getChartColors).mockReturnValue(mockChartColors);
    const result = getTooltipStyle(true);

    expect(getChartColors).toHaveBeenCalledWith(true);
    expect(result).toEqual({
      contentStyle: {
        backgroundColor: mockChartColors.background,
        border: `1px solid ${mockChartColors.border}`,
        borderRadius: "8px",
      },
      labelStyle: {
        color: mockChartColors.text,
        fontSize: "12px",
        fontWeight: "bold",
      },
    });
  });

  it("should return tooltip style for light theme", () => {
    const lightColors = {
      ...mockChartColors,
      background: "#ffffff",
      border: "#e5e7eb",
      text: "#6b7280",
    };
    vi.mocked(getChartColors).mockReturnValue(lightColors);
    const result = getTooltipStyle(false);

    expect(getChartColors).toHaveBeenCalledWith(false);
    expect(result.contentStyle.backgroundColor).toBe(lightColors.background);
    expect(result.contentStyle.border).toBe(`1px solid ${lightColors.border}`);
    expect(result.labelStyle.color).toBe(lightColors.text);
  });

  it("should have correct contentStyle properties", () => {
    vi.mocked(getChartColors).mockReturnValue(mockChartColors);
    const result = getTooltipStyle(true);

    expect(result.contentStyle).toHaveProperty("backgroundColor");
    expect(result.contentStyle).toHaveProperty("border");
    expect(result.contentStyle).toHaveProperty("borderRadius", "8px");
  });

  it("should have correct labelStyle properties", () => {
    vi.mocked(getChartColors).mockReturnValue(mockChartColors);
    const result = getTooltipStyle(true);

    expect(result.labelStyle).toHaveProperty("color");
    expect(result.labelStyle).toHaveProperty("fontSize", "12px");
    expect(result.labelStyle).toHaveProperty("fontWeight", "bold");
  });
});
