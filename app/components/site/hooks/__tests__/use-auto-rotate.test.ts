import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

  it("should initialize with index 0", () => {
    const { result } = renderHook(() => useAutoRotate({ itemsCount: 5 }));

    expect(result.current[0]).toBe(0);
  });

  it("should rotate through items", async () => {
    const { result } = renderHook(() => useAutoRotate({ itemsCount: 3, interval: 1000 }));

    expect(result.current[0]).toBe(0);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current[0]).toBe(1);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current[0]).toBe(2);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current[0]).toBe(0);
  });

  it("should use custom interval", async () => {
    const { result } = renderHook(() => useAutoRotate({ itemsCount: 2, interval: 500 }));

    expect(result.current[0]).toBe(0);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current[0]).toBe(1);
  });

  it("should provide setActiveIndex function", async () => {
    const { result } = renderHook(() => useAutoRotate({ itemsCount: 5 }));

    expect(typeof result.current[1]).toBe("function");

    await act(async () => {
      result.current[1](3);
    });
    expect(result.current[0]).toBe(3);
  });

  it("should handle single item", () => {
    const { result } = renderHook(() => useAutoRotate({ itemsCount: 1 }));

    expect(result.current[0]).toBe(0);

    vi.advanceTimersByTime(5000);
    expect(result.current[0]).toBe(0);
  });
});
