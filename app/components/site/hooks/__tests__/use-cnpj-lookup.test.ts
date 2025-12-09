import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCNPJLookup } from "../use-cnpj-lookup";

describe("useCNPJLookup", () => {
  const mockFetch = vi.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = mockFetch;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    global.fetch = originalFetch;
  });

  it("should initialize with null data and no loading", () => {
    const { result } = renderHook(() => useCNPJLookup(""));
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should not fetch when CNPJ is empty", async () => {
    renderHook(() => useCNPJLookup(""));
    vi.advanceTimersByTime(1000);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should not fetch when CNPJ has less than 14 digits", async () => {
    renderHook(() => useCNPJLookup("1234567890123"));
    vi.advanceTimersByTime(1000);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should debounce fetch requests", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ cnpj: "12345678000190" }),
    });

    const { rerender } = renderHook(({ cnpj }) => useCNPJLookup(cnpj), {
      initialProps: { cnpj: "" },
    });

    // Change to first valid CNPJ
    await act(async () => {
      rerender({ cnpj: "12.345.678/0001-90" });
      vi.advanceTimersByTime(400);
    });
    expect(mockFetch).not.toHaveBeenCalled();

    // Change to second valid CNPJ (should cancel previous timer)
    await act(async () => {
      rerender({ cnpj: "12.345.678/0001-91" });
      vi.advanceTimersByTime(400);
    });
    expect(mockFetch).not.toHaveBeenCalled();

    // Complete the debounce period
    await act(async () => {
      vi.advanceTimersByTime(400);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should fetch CNPJ when valid and debounce time passes", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        cnpj: "12345678000190",
        razao_social: "Test Company",
      }),
    });

    renderHook(() => useCNPJLookup("12.345.678/0001-90"));

    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockFetch).toHaveBeenCalledWith("https://brasilapi.com.br/api/cnpj/v1/12345678000190");
  });

  it("should set loading state during fetch", async () => {
    let resolveFetch: (value: unknown) => void;
    const fetchPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });

    mockFetch.mockReturnValue(
      Promise.resolve({
        ok: true,
        json: async () => fetchPromise as unknown,
      })
    );

    const { result } = renderHook(() => useCNPJLookup("12345678000190"));

    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveFetch!({ cnpj: "12345678000190" });
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.loading).toBe(false);
  });

  it("should set data when fetch succeeds", async () => {
    const mockData = {
      cnpj: "12345678000190",
      razao_social: "Test Company",
      email: "test@example.com",
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useCNPJLookup("12345678000190"));

    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it("should set error when fetch fails", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
    });

    const { result } = renderHook(() => useCNPJLookup("12345678000190"));

    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.error).toBe("CNPJ not found");
    expect(result.current.data).toBeNull();
  });

  it("should call onSuccess callback when provided", async () => {
    const mockOnSuccess = vi.fn();
    const mockData = {
      cnpj: "12345678000190",
      razao_social: "Test Company",
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    renderHook(() => useCNPJLookup("12345678000190", { onSuccess: mockOnSuccess }));

    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockOnSuccess).toHaveBeenCalledWith(mockData);
  });

  it("should call onError callback when fetch fails", async () => {
    const mockOnError = vi.fn();
    mockFetch.mockRejectedValue(new Error("Network error"));

    renderHook(() => useCNPJLookup("12345678000190", { onError: mockOnError }));

    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockOnError).toHaveBeenCalled();
  });

  it("should not fetch when enabled is false", async () => {
    renderHook(() => useCNPJLookup("12345678000190", { enabled: false }));

    vi.advanceTimersByTime(1000);

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should not fetch same CNPJ twice", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ cnpj: "12345678000190" }),
    });

    const { rerender } = renderHook(({ cnpj }) => useCNPJLookup(cnpj), {
      initialProps: { cnpj: "12345678000190" },
    });

    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      rerender({ cnpj: "12345678000190" });
      vi.advanceTimersByTime(800);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should expose fetchCNPJ function", () => {
    const { result } = renderHook(() => useCNPJLookup(""));
    expect(typeof result.current.fetchCNPJ).toBe("function");
  });

  it("should allow manual fetch via fetchCNPJ", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ cnpj: "12345678000190" }),
    });

    const { result } = renderHook(() => useCNPJLookup(""));

    await act(async () => {
      result.current.fetchCNPJ("12345678000190");
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockFetch).toHaveBeenCalled();
  });

  it("should use custom debounce time", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ cnpj: "12345678000190" }),
    });

    renderHook(() => useCNPJLookup("12345678000190", { debounceMs: 2000 }));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(mockFetch).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1000);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockFetch).toHaveBeenCalled();
  });

  it("should clear data and error when CNPJ becomes invalid", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ cnpj: "12345678000190" }),
    });

    const { result, rerender } = renderHook(({ cnpj }) => useCNPJLookup(cnpj), {
      initialProps: { cnpj: "12345678000190" },
    });

    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.data).not.toBeNull();

    await act(async () => {
      rerender({ cnpj: "123" });
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should handle error when fetch throws string (non-Error)", async () => {
    const mockOnError = vi.fn();
    mockFetch.mockRejectedValue("String error");

    const { result } = renderHook(() => useCNPJLookup("12345678000190", { onError: mockOnError }));

    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.error).toBe("CNPJ not found or invalid");
    expect(result.current.data).toBeNull();
    expect(mockOnError).toHaveBeenCalled();
    // Verify onError receives an Error object even when fetch throws non-Error
    const errorCall = mockOnError.mock.calls[0]?.[0];
    expect(errorCall).toBeInstanceOf(Error);
  });

  it("should handle error when fetch throws object (non-Error)", async () => {
    const mockOnError = vi.fn();
    mockFetch.mockRejectedValue({ message: "Object error" });

    const { result } = renderHook(() => useCNPJLookup("12345678000190", { onError: mockOnError }));

    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.error).toBe("CNPJ not found or invalid");
    expect(mockOnError).toHaveBeenCalled();
    const errorCall = mockOnError.mock.calls[0]?.[0];
    expect(errorCall).toBeInstanceOf(Error);
  });

  it("should not fetch when manual fetchCNPJ is called with invalid length", async () => {
    const { result } = renderHook(() => useCNPJLookup(""));

    await act(async () => {
      result.current.fetchCNPJ("1234567890123"); // Less than 14 digits
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should not fetch when manual fetchCNPJ is called with same CNPJ as lastFetchedCNPJ", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ cnpj: "12345678000190" }),
    });

    const { result } = renderHook(() => useCNPJLookup(""));

    // First fetch
    await act(async () => {
      result.current.fetchCNPJ("12345678000190");
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    mockFetch.mockClear();

    // Second fetch with same CNPJ should be skipped
    await act(async () => {
      result.current.fetchCNPJ("12345678000190");
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should fetch when manual fetchCNPJ is called with different CNPJ", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ cnpj: "12345678000190" }),
    });

    const { result } = renderHook(() => useCNPJLookup(""));

    // First fetch
    await act(async () => {
      result.current.fetchCNPJ("12345678000190");
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    mockFetch.mockClear();

    // Second fetch with different CNPJ should proceed
    await act(async () => {
      result.current.fetchCNPJ("98765432000100");
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should handle error message from Error object when fetch throws", async () => {
    mockFetch.mockRejectedValue(new Error("Custom network error"));

    const { result } = renderHook(() => useCNPJLookup("12345678000190"));

    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.error).toBe("Custom network error");
  });
});
