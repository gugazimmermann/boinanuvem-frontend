import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useEntityTab } from "../use-entity-tab";
import { useSearchParams } from "react-router";

vi.mock("react-router", () => ({
  useSearchParams: vi.fn(),
}));

describe("useEntityTab", () => {
  let mockSetSearchParams: ReturnType<typeof vi.fn>;
  let mockSearchParams: URLSearchParams;

  beforeEach(() => {
    mockSetSearchParams = vi.fn();
    mockSearchParams = new URLSearchParams();

    vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, mockSetSearchParams]);
  });

  it("should return default tab when no tab param in URL", () => {
    const { result } = renderHook(() =>
      useEntityTab({
        validTabs: ["info", "activities", "finance"] as const,
        defaultTab: "info",
      })
    );

    expect(result.current[0]).toBe("info");
  });

  it("should return tab from URL when valid", () => {
    mockSearchParams.set("tab", "activities");

    const { result } = renderHook(() =>
      useEntityTab({
        validTabs: ["info", "activities", "finance"] as const,
        defaultTab: "info",
      })
    );

    expect(result.current[0]).toBe("activities");
  });

  it("should return default tab when tab param is invalid", () => {
    mockSearchParams.set("tab", "invalid");

    const { result } = renderHook(() =>
      useEntityTab({
        validTabs: ["info", "activities", "finance"] as const,
        defaultTab: "info",
      })
    );

    expect(result.current[0]).toBe("info");
  });

  it("should return default tab when restricted tab is accessed by non-main user", () => {
    mockSearchParams.set("tab", "activities");

    const { result } = renderHook(() =>
      useEntityTab({
        validTabs: ["info", "activities", "finance"] as const,
        defaultTab: "info",
        isMainUser: () => false,
        restrictedTabs: ["activities"] as const,
      })
    );

    expect(result.current[0]).toBe("info");
  });

  it("should return restricted tab when accessed by main user", () => {
    mockSearchParams.set("tab", "activities");

    const { result } = renderHook(() =>
      useEntityTab({
        validTabs: ["info", "activities", "finance"] as const,
        defaultTab: "info",
        isMainUser: () => true,
        restrictedTabs: ["activities"] as const,
      })
    );

    expect(result.current[0]).toBe("activities");
  });

  it("should update URL when setActiveTab is called", () => {
    const { result } = renderHook(() =>
      useEntityTab({
        validTabs: ["info", "activities", "finance"] as const,
        defaultTab: "info",
      })
    );

    act(() => {
      result.current[1]("finance");
    });

    expect(mockSetSearchParams).toHaveBeenCalledWith({ tab: "finance" });
  });

  it("should use custom restricted tabs", () => {
    mockSearchParams.set("tab", "finance");

    const { result } = renderHook(() =>
      useEntityTab({
        validTabs: ["info", "activities", "finance"] as const,
        defaultTab: "info",
        isMainUser: () => false,
        restrictedTabs: ["finance"] as const,
      })
    );

    expect(result.current[0]).toBe("info");
  });

  it("should handle multiple restricted tabs", () => {
    mockSearchParams.set("tab", "activities");

    const { result } = renderHook(() =>
      useEntityTab({
        validTabs: ["info", "activities", "finance", "settings"] as const,
        defaultTab: "info",
        isMainUser: () => false,
        restrictedTabs: ["activities", "settings"] as const,
      })
    );

    expect(result.current[0]).toBe("info");
  });

  it("should allow non-restricted tabs for non-main users", () => {
    mockSearchParams.set("tab", "finance");

    const { result } = renderHook(() =>
      useEntityTab({
        validTabs: ["info", "activities", "finance"] as const,
        defaultTab: "info",
        isMainUser: () => false,
        restrictedTabs: ["activities"] as const,
      })
    );

    expect(result.current[0]).toBe("finance");
  });

  it("should update when searchParams change", () => {
    const { result, rerender } = renderHook(() =>
      useEntityTab({
        validTabs: ["info", "activities", "finance"] as const,
        defaultTab: "info",
      })
    );

    expect(result.current[0]).toBe("info");

    mockSearchParams.set("tab", "finance");
    rerender();

    expect(result.current[0]).toBe("finance");
  });

  it("should redirect to default tab when restricted tab accessed by non-main user", async () => {
    mockSearchParams.set("tab", "activities");

    renderHook(() =>
      useEntityTab({
        validTabs: ["info", "activities", "finance"] as const,
        defaultTab: "info",
        isMainUser: () => false,
        restrictedTabs: ["activities"] as const,
      })
    );

    await waitFor(() => {
      expect(mockSetSearchParams).toHaveBeenCalledWith({ tab: "info" }, { replace: true });
    });
  });
});
