import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCEPLookup } from "../use-cep-lookup";

describe("useCEPLookup", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should initialize with null data, false loading, and null error", () => {
    const { result } = renderHook(() => useCEPLookup(""));

    expect(result.current.data).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should not fetch when CEP is less than 8 digits", async () => {
    const { result } = renderHook(() => useCEPLookup("12345"));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it("should not fetch when CEP is more than 8 digits", async () => {
    renderHook(() => useCEPLookup("123456789"));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should debounce fetch requests", async () => {
    const mockData = {
      cep: "12345678",
      street: "Rua Test",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      location: { type: "Point", coordinates: {} },
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const { rerender } = renderHook(({ cep }) => useCEPLookup(cep, { debounceMs: 800 }), {
      initialProps: { cep: "12345" },
    });

    rerender({ cep: "12345678" });

    // Should not fetch immediately
    await act(async () => {
      vi.advanceTimersByTime(799);
    });

    expect(global.fetch).not.toHaveBeenCalled();

    // Should fetch after debounce
    await act(async () => {
      vi.advanceTimersByTime(1);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("should fetch CEP data successfully", async () => {
    const mockData = {
      cep: "12345678",
      street: "Rua Test",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      location: { type: "Point", coordinates: {} },
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const { result } = renderHook(() => useCEPLookup("12345678", { debounceMs: 0 }));

    await act(async () => {
      vi.advanceTimersByTime(1);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
    expect(result.current.loading).toBe(false);
  });

  it("should handle fetch error", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useCEPLookup("12345678", { debounceMs: 0 }));

    await act(async () => {
      vi.advanceTimersByTime(1);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe("Network error");
    expect(result.current.loading).toBe(false);
  });

  it("should handle non-ok response", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    const { result } = renderHook(() => useCEPLookup("12345678", { debounceMs: 0 }));

    await act(async () => {
      vi.advanceTimersByTime(1);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe("CEP not found");
    expect(result.current.loading).toBe(false);
  });

  it("should call onSuccess callback when data is fetched", async () => {
    const mockData = {
      cep: "12345678",
      street: "Rua Test",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      location: { type: "Point", coordinates: {} },
    };

    const onSuccess = vi.fn();

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    renderHook(() => useCEPLookup("12345678", { debounceMs: 0, onSuccess }));

    await act(async () => {
      vi.advanceTimersByTime(1);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(onSuccess).toHaveBeenCalledWith(mockData);
  });

  it("should call onError callback when fetch fails", async () => {
    const error = new Error("Network error");
    const onError = vi.fn();

    vi.mocked(global.fetch).mockRejectedValueOnce(error);

    renderHook(() => useCEPLookup("12345678", { debounceMs: 0, onError }));

    await act(async () => {
      vi.advanceTimersByTime(1);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(onError).toHaveBeenCalledWith(error);
  });

  it("should not fetch same CEP twice", async () => {
    const mockData = {
      cep: "12345678",
      street: "Rua Test",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      location: { type: "Point", coordinates: {} },
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const { rerender } = renderHook(({ cep }) => useCEPLookup(cep, { debounceMs: 0 }), {
      initialProps: { cep: "12345678" },
    });

    await act(async () => {
      vi.advanceTimersByTime(1);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Rerender with same CEP
    rerender({ cep: "12345678" });

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("should format CEP by removing non-digits", async () => {
    const mockData = {
      cep: "12345678",
      street: "Rua Test",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      location: { type: "Point", coordinates: {} },
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    renderHook(() => useCEPLookup("12.345-678", { debounceMs: 0 }));

    await act(async () => {
      vi.advanceTimersByTime(1);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(global.fetch).toHaveBeenCalledWith("https://brasilapi.com.br/api/cep/v2/12345678");
  });

  it("should not fetch when enabled is false", async () => {
    const { result } = renderHook(() =>
      useCEPLookup("12345678", { debounceMs: 0, enabled: false })
    );

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.data).toBe(null);
  });

  it("should clear data and error when CEP becomes invalid", async () => {
    const mockData = {
      cep: "12345678",
      street: "Rua Test",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      location: { type: "Point", coordinates: {} },
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const { result, rerender } = renderHook(({ cep }) => useCEPLookup(cep, { debounceMs: 0 }), {
      initialProps: { cep: "12345678" },
    });

    await act(async () => {
      vi.advanceTimersByTime(1);
      await vi.runOnlyPendingTimersAsync();
    });

    // Change to invalid CEP
    rerender({ cep: "123" });

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it("should expose fetchCEP function", () => {
    const { result } = renderHook(() => useCEPLookup(""));

    expect(typeof result.current.fetchCEP).toBe("function");
  });

  it("should allow manual fetch via fetchCEP", async () => {
    const mockData = {
      cep: "12345678",
      street: "Rua Test",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      location: { type: "Point", coordinates: {} },
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const { result } = renderHook(() => useCEPLookup("", { debounceMs: 0 }));

    await act(async () => {
      await result.current.fetchCEP("12345678");
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.data).toEqual(mockData);
  });

  it("should handle non-Error rejection in onError", async () => {
    const onError = vi.fn();

    vi.mocked(global.fetch).mockRejectedValueOnce("String error");

    renderHook(() => useCEPLookup("12345678", { debounceMs: 0, onError }));

    await act(async () => {
      vi.advanceTimersByTime(1);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should update callbacks when they change", async () => {
    const mockData = {
      cep: "12345678",
      street: "Rua Test",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      location: { type: "Point", coordinates: {} },
    };

    const onSuccess1 = vi.fn();
    const onSuccess2 = vi.fn();

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    const { rerender } = renderHook(
      ({ cep, onSuccess }) => useCEPLookup(cep, { debounceMs: 0, onSuccess }),
      { initialProps: { cep: "12345678", onSuccess: onSuccess1 } }
    );

    await act(async () => {
      vi.advanceTimersByTime(1);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(onSuccess1).toHaveBeenCalledWith(mockData);

    rerender({ cep: "12345678", onSuccess: onSuccess2 });

    // Clear previous call
    onSuccess1.mockClear();
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    // Trigger new fetch by changing CEP to a different value
    rerender({ cep: "87654321", onSuccess: onSuccess2 });

    await act(async () => {
      vi.advanceTimersByTime(1);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(onSuccess2).toHaveBeenCalledWith(mockData);
  });
});
