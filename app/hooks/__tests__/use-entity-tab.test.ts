import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEntityTab } from "../use-entity-tab";
import * as reactRouter from "react-router";

vi.mock("react-router", () => ({
  useSearchParams: vi.fn(),
}));

describe("useEntityTab", () => {
  const mockSetSearchParams = vi.fn();
  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.delete("tab");
    vi.mocked(reactRouter.useSearchParams).mockReturnValue([mockSearchParams, mockSetSearchParams]);
  });

  it("should return default tab when no tab param", () => {
    const { result } = renderHook(() =>
      useEntityTab({
        validTabs: ["info", "finance", "activities"] as const,
        defaultTab: "info" as const,
      })
    );

    expect(result.current[0]).toBe("info");
  });

  it("should return tab from URL param", () => {
    mockSearchParams.set("tab", "finance");

    const { result } = renderHook(() =>
      useEntityTab({
        validTabs: ["info", "finance", "activities"] as const,
        defaultTab: "info" as const,
      })
    );

    expect(result.current[0]).toBe("finance");
  });

  it("should return default tab when invalid tab param", () => {
    mockSearchParams.set("tab", "invalid");

    const { result } = renderHook(() =>
      useEntityTab({
        validTabs: ["info", "finance", "activities"] as const,
        defaultTab: "info" as const,
      })
    );

    expect(result.current[0]).toBe("info");
  });

  it("should change tab when setActiveTab is called", () => {
    const { result } = renderHook(() =>
      useEntityTab({
        validTabs: ["info", "finance", "activities"] as const,
        defaultTab: "info" as const,
      })
    );

    act(() => {
      result.current[1]("finance");
    });

    expect(mockSetSearchParams).toHaveBeenCalledWith({ tab: "finance" });
  });

  it("should restrict access to restricted tabs for non-main users", () => {
    mockSearchParams.set("tab", "activities");
    const mockIsMainUser = vi.fn().mockReturnValue(false);

    const { result } = renderHook(() =>
      useEntityTab({
        validTabs: ["info", "finance", "activities"] as const,
        defaultTab: "info" as const,
        isMainUser: mockIsMainUser,
        restrictedTabs: ["activities"] as const,
      })
    );

    expect(result.current[0]).toBe("info");
  });

  it("should allow access to restricted tabs for main users", () => {
    mockSearchParams.set("tab", "activities");
    const mockIsMainUser = vi.fn().mockReturnValue(true);

    const { result } = renderHook(() =>
      useEntityTab({
        validTabs: ["info", "finance", "activities"] as const,
        defaultTab: "info" as const,
        isMainUser: mockIsMainUser,
        restrictedTabs: ["activities"] as const,
      })
    );

    expect(result.current[0]).toBe("activities");
  });

  it("should redirect to default tab if restricted tab accessed by non-main user", () => {
    mockSearchParams.set("tab", "activities");
    const mockIsMainUser = vi.fn().mockReturnValue(false);

    renderHook(() =>
      useEntityTab({
        validTabs: ["info", "finance", "activities"] as const,
        defaultTab: "info" as const,
        isMainUser: mockIsMainUser,
        restrictedTabs: ["activities"] as const,
      })
    );

    expect(mockSetSearchParams).toHaveBeenCalledWith({ tab: "info" }, { replace: true });
  });

  it("should allow access to non-restricted tabs without isMainUser", () => {
    mockSearchParams.set("tab", "finance");

    const { result } = renderHook(() =>
      useEntityTab({
        validTabs: ["info", "finance", "activities"] as const,
        defaultTab: "info" as const,
        restrictedTabs: ["activities"] as const,
      })
    );

    expect(result.current[0]).toBe("finance");
  });

  it("should handle multiple valid tabs", () => {
    const validTabs = ["tab1", "tab2", "tab3", "tab4", "tab5"] as const;

    mockSearchParams.set("tab", "tab3");

    const { result } = renderHook(() =>
      useEntityTab({
        validTabs,
        defaultTab: "tab1" as const,
      })
    );

    expect(result.current[0]).toBe("tab3");
  });

  it("should update URL when activeTab changes", () => {
    const { result } = renderHook(() =>
      useEntityTab({
        validTabs: ["info", "finance", "activities"] as const,
        defaultTab: "info" as const,
      })
    );

    act(() => {
      result.current[1]("activities");
    });

    expect(mockSetSearchParams).toHaveBeenCalledWith({ tab: "activities" });
  });

  it("should use default restrictedTabs when not provided", () => {
    mockSearchParams.set("tab", "activities");
    const mockIsMainUser = vi.fn().mockReturnValue(false);

    const { result } = renderHook(() =>
      useEntityTab({
        validTabs: ["info", "finance", "activities"] as const,
        defaultTab: "info" as const,
        isMainUser: mockIsMainUser,
      })
    );

    expect(result.current[0]).toBe("info");
  });

  it("should allow changing from restricted to non-restricted tab", () => {
    mockSearchParams.set("tab", "activities");
    const mockIsMainUser = vi.fn().mockReturnValue(true);

    const { result } = renderHook(() =>
      useEntityTab({
        validTabs: ["info", "finance", "activities"] as const,
        defaultTab: "info" as const,
        isMainUser: mockIsMainUser,
        restrictedTabs: ["activities"] as const,
      })
    );

    act(() => {
      result.current[1]("info");
    });

    expect(mockSetSearchParams).toHaveBeenCalledWith({ tab: "info" });
  });
});
