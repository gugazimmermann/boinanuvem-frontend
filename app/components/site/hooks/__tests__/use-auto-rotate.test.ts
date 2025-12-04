import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutoRotate } from "../use-auto-rotate";

describe("useAutoRotate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should initialize with activeIndex 0", () => {
    const { result } = renderHook(() =>
      useAutoRotate({
        itemsCount: 5,
      })
    );

    expect(result.current[0]).toBe(0);
  });

  it("should rotate to next index after interval", () => {
    const { result } = renderHook(() =>
      useAutoRotate({
        itemsCount: 3,
        interval: 1000,
      })
    );

    expect(result.current[0]).toBe(0);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current[0]).toBe(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current[0]).toBe(2);
  });

  it("should wrap around to 0 after last index", () => {
    const { result } = renderHook(() =>
      useAutoRotate({
        itemsCount: 3,
        interval: 1000,
      })
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current[0]).toBe(2);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current[0]).toBe(0);
  });

  it("should use default interval of 5000ms when not provided", () => {
    const { result } = renderHook(() =>
      useAutoRotate({
        itemsCount: 2,
      })
    );

    expect(result.current[0]).toBe(0);

    act(() => {
      vi.advanceTimersByTime(4999);
    });

    expect(result.current[0]).toBe(0);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current[0]).toBe(1);
  });

  it("should use custom interval when provided", () => {
    const { result } = renderHook(() =>
      useAutoRotate({
        itemsCount: 2,
        interval: 2000,
      })
    );

    expect(result.current[0]).toBe(0);

    act(() => {
      vi.advanceTimersByTime(1999);
    });

    expect(result.current[0]).toBe(0);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current[0]).toBe(1);
  });

  it("should handle single item", () => {
    const { result } = renderHook(() =>
      useAutoRotate({
        itemsCount: 1,
        interval: 1000,
      })
    );

    expect(result.current[0]).toBe(0);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current[0]).toBe(0);
  });

  it("should allow manual index setting", () => {
    const { result } = renderHook(() =>
      useAutoRotate({
        itemsCount: 5,
        interval: 1000,
      })
    );

    expect(result.current[0]).toBe(0);

    act(() => {
      result.current[1](3);
    });

    expect(result.current[0]).toBe(3);
  });

  it("should continue rotating after manual index change", () => {
    const { result } = renderHook(() =>
      useAutoRotate({
        itemsCount: 5,
        interval: 1000,
      })
    );

    act(() => {
      result.current[1](2);
    });

    expect(result.current[0]).toBe(2);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current[0]).toBe(3);
  });

  it("should handle multiple rotations", () => {
    const { result } = renderHook(() =>
      useAutoRotate({
        itemsCount: 3,
        interval: 1000,
      })
    );

    // Rotate through all items multiple times
    for (let i = 0; i < 10; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current[0]).toBe((i + 1) % 3);
    }
  });

  it("should clear interval on unmount", () => {
    const { result, unmount } = renderHook(() =>
      useAutoRotate({
        itemsCount: 3,
        interval: 1000,
      })
    );

    expect(result.current[0]).toBe(0);

    unmount();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // After unmount, the timer should be cleared, but we can't verify
    // the state since the hook is unmounted. This test ensures no errors occur.
  });

  it("should update when itemsCount changes", () => {
    const { result, rerender } = renderHook(
      ({ itemsCount }) =>
        useAutoRotate({
          itemsCount,
          interval: 1000,
        }),
      {
        initialProps: { itemsCount: 3 },
      }
    );

    expect(result.current[0]).toBe(0);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current[0]).toBe(1);

    rerender({ itemsCount: 5 });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current[0]).toBe(2);
  });

  it("should update when interval changes", () => {
    const { result, rerender } = renderHook(
      ({ interval }) =>
        useAutoRotate({
          itemsCount: 3,
          interval: interval ?? 1000,
        }),
      {
        initialProps: { interval: 1000 },
      }
    );

    expect(result.current[0]).toBe(0);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current[0]).toBe(1);

    rerender({ interval: 2000 });

    act(() => {
      vi.advanceTimersByTime(1999);
    });

    expect(result.current[0]).toBe(1);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current[0]).toBe(2);
  });
});
