import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCEPLookup } from "../use-cep-lookup";

describe("useCEPLookup", () => {
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
    const { result } = renderHook(() => useCEPLookup(""));
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should not fetch when CEP is empty", async () => {
    renderHook(() => useCEPLookup(""));
    vi.advanceTimersByTime(1000);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should not fetch when CEP has less than 8 digits", async () => {
    renderHook(() => useCEPLookup("12345"));
    vi.advanceTimersByTime(1000);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should debounce fetch requests", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ cep: "12345678", street: "Test Street" }),
    });

    const { rerender } = renderHook(({ cep }) => useCEPLookup(cep), {
      initialProps: { cep: "" },
    });

    // Change to first valid CEP
    await act(async () => {
      rerender({ cep: "12345-678" });
      vi.advanceTimersByTime(400);
    });
    expect(mockFetch).not.toHaveBeenCalled();

    // Change to second valid CEP (should cancel previous timer)
    await act(async () => {
      rerender({ cep: "12345-679" });
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

  it("should fetch CEP when valid and debounce time passes", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        cep: "12345678",
        street: "Test Street",
        neighborhood: "Test Neighborhood",
        city: "Test City",
        state: "SP",
      }),
    });

    renderHook(() => useCEPLookup("12345-678"));

    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockFetch).toHaveBeenCalledWith("https://brasilapi.com.br/api/cep/v2/12345678");
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

    const { result } = renderHook(() => useCEPLookup("12345678"));

    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveFetch!({ cep: "12345678" });
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.loading).toBe(false);
  });

  it("should set data when fetch succeeds", async () => {
    const mockData = {
      cep: "12345678",
      street: "Test Street",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useCEPLookup("12345678"));

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

    const { result } = renderHook(() => useCEPLookup("12345678"));

    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.error).toBe("CEP not found");
    expect(result.current.data).toBeNull();
  });

  it("should call onSuccess callback when provided", async () => {
    const mockOnSuccess = vi.fn();
    const mockData = {
      cep: "12345678",
      street: "Test Street",
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    renderHook(() => useCEPLookup("12345678", { onSuccess: mockOnSuccess }));

    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockOnSuccess).toHaveBeenCalledWith(mockData);
  });

  it("should call onError callback when fetch fails", async () => {
    const mockOnError = vi.fn();
    mockFetch.mockRejectedValue(new Error("Network error"));

    renderHook(() => useCEPLookup("12345678", { onError: mockOnError }));

    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockOnError).toHaveBeenCalled();
  });

  it("should not fetch when enabled is false", async () => {
    renderHook(() => useCEPLookup("12345678", { enabled: false }));

    vi.advanceTimersByTime(1000);

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should not fetch same CEP twice", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ cep: "12345678" }),
    });

    const { rerender } = renderHook(({ cep }) => useCEPLookup(cep), {
      initialProps: { cep: "12345678" },
    });

    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      rerender({ cep: "12345678" });
      vi.advanceTimersByTime(800);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should expose fetchCEP function", () => {
    const { result } = renderHook(() => useCEPLookup(""));
    expect(typeof result.current.fetchCEP).toBe("function");
  });

  it("should allow manual fetch via fetchCEP", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ cep: "12345678" }),
    });

    const { result } = renderHook(() => useCEPLookup(""));

    await act(async () => {
      result.current.fetchCEP("12345678");
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockFetch).toHaveBeenCalled();
  });

  it("should use custom debounce time", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ cep: "12345678" }),
    });

    renderHook(() => useCEPLookup("12345678", { debounceMs: 2000 }));

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

  it("should clear data and error when CEP becomes invalid", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ cep: "12345678" }),
    });

    const { result, rerender } = renderHook(({ cep }) => useCEPLookup(cep), {
      initialProps: { cep: "12345678" },
    });

    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.data).not.toBeNull();

    await act(async () => {
      rerender({ cep: "123" });
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should handle error when fetch throws string (non-Error)", async () => {
    const mockOnError = vi.fn();
    mockFetch.mockRejectedValue("String error");

    const { result } = renderHook(() => useCEPLookup("12345678", { onError: mockOnError }));

    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.error).toBe("CEP not found or invalid");
    expect(result.current.data).toBeNull();
    expect(mockOnError).toHaveBeenCalled();
    // Verify onError receives an Error object even when fetch throws non-Error
    const errorCall = mockOnError.mock.calls[0]?.[0];
    expect(errorCall).toBeInstanceOf(Error);
  });

  it("should handle error when fetch throws object (non-Error)", async () => {
    const mockOnError = vi.fn();
    mockFetch.mockRejectedValue({ message: "Object error" });

    const { result } = renderHook(() => useCEPLookup("12345678", { onError: mockOnError }));

    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.error).toBe("CEP not found or invalid");
    expect(mockOnError).toHaveBeenCalled();
    const errorCall = mockOnError.mock.calls[0]?.[0];
    expect(errorCall).toBeInstanceOf(Error);
  });

  it("should not fetch when manual fetchCEP is called with invalid length", async () => {
    const { result } = renderHook(() => useCEPLookup(""));

    await act(async () => {
      result.current.fetchCEP("12345"); // Less than 8 digits
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should not fetch when manual fetchCEP is called with same CEP as lastFetchedCEP", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ cep: "12345678" }),
    });

    const { result } = renderHook(() => useCEPLookup(""));

    // First fetch
    await act(async () => {
      result.current.fetchCEP("12345678");
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    mockFetch.mockClear();

    // Second fetch with same CEP should be skipped
    await act(async () => {
      result.current.fetchCEP("12345678");
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should fetch when manual fetchCEP is called with different CEP", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ cep: "12345678" }),
    });

    const { result } = renderHook(() => useCEPLookup(""));

    // First fetch
    await act(async () => {
      result.current.fetchCEP("12345678");
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    mockFetch.mockClear();

    // Second fetch with different CEP should proceed
    await act(async () => {
      result.current.fetchCEP("87654321");
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should handle error message from Error object when fetch throws", async () => {
    mockFetch.mockRejectedValue(new Error("Custom network error"));

    const { result } = renderHook(() => useCEPLookup("12345678"));

    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.error).toBe("Custom network error");
  });
});
