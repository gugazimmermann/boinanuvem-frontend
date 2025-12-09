import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutoRotate } from "../use-auto-rotate";

describe("useAutoRotate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with activeIndex 0", () => {
    const { result } = renderHook(() => useAutoRotate({ itemsCount: 3 }));
    expect(result.current[0]).toBe(0);
  });

  it("should return setActiveIndex function", () => {
    const { result } = renderHook(() => useAutoRotate({ itemsCount: 3 }));
    expect(typeof result.current[1]).toBe("function");
  });

  it("should rotate to next index after interval", async () => {
    const { result } = renderHook(() => useAutoRotate({ itemsCount: 3, interval: 1000 }));

    expect(result.current[0]).toBe(0);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current[0]).toBe(1);
  });

  it("should wrap around to 0 after last index", async () => {
    const { result } = renderHook(() => useAutoRotate({ itemsCount: 3, interval: 1000 }));

    // Set to last index
    act(() => {
      result.current[1](2);
    });

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current[0]).toBe(0);
  });

  it("should use default interval of 5000ms", async () => {
    const { result } = renderHook(() => useAutoRotate({ itemsCount: 3 }));

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current[0]).toBe(1);
  });

  it("should use custom interval", async () => {
    const { result } = renderHook(() => useAutoRotate({ itemsCount: 3, interval: 2000 }));

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current[0]).toBe(1);
  });

  it("should allow manual index setting", () => {
    const { result } = renderHook(() => useAutoRotate({ itemsCount: 3 }));

    act(() => {
      result.current[1](2);
    });

    expect(result.current[0]).toBe(2);
  });

  it("should continue rotating after manual setting", async () => {
    const { result } = renderHook(() => useAutoRotate({ itemsCount: 3, interval: 1000 }));

    act(() => {
      result.current[1](1);
    });

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current[0]).toBe(2);
  });

  it("should clean up interval on unmount", () => {
    const clearIntervalSpy = vi.spyOn(global, "clearInterval");
    const { unmount } = renderHook(() => useAutoRotate({ itemsCount: 3 }));

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it("should handle single item", async () => {
    const { result } = renderHook(() => useAutoRotate({ itemsCount: 1, interval: 1000 }));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current[0]).toBe(0);
  });

  it("should update interval when itemsCount changes", async () => {
    const { result, rerender } = renderHook(
      ({ itemsCount }) => useAutoRotate({ itemsCount, interval: 1000 }),
      { initialProps: { itemsCount: 3 } }
    );

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current[0]).toBe(1);

    await act(async () => {
      rerender({ itemsCount: 5 });
      vi.advanceTimersByTime(1000);
    });
    expect(result.current[0]).toBe(2);
  });
});
