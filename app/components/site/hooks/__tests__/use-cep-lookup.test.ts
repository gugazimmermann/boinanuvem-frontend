import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useCEPLookup } from "../use-cep-lookup";
import type { CEPData } from "~/types";

describe("useCEPLookup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize with null data and no loading", () => {
    const { result } = renderHook(() => useCEPLookup(""));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should not fetch when CEP is invalid length", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    const { result } = renderHook(() => useCEPLookup("123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
  });

  it("should fetch CEP data successfully", async () => {
    const mockCEPData: CEPData = {
      cep: "12345678",
      street: "Rua Test",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      service: "viacep",
      location: {
        type: "Point",
        coordinates: {},
      },
    };

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockCEPData,
    } as Response);

    const { result } = renderHook(() => useCEPLookup("12345678", { debounceMs: 0 }));

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
        expect(result.current.data).not.toBeNull();
      },
      { timeout: 2000 }
    );

    expect(result.current.data).toEqual(mockCEPData);
    expect(result.current.error).toBeNull();
  });

  it("should handle fetch error", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useCEPLookup("12345678", { debounceMs: 0 }));

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeTruthy();
      },
      { timeout: 2000 }
    );

    expect(result.current.data).toBeNull();
  });

  it("should handle 404 error", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    const { result } = renderHook(() => useCEPLookup("12345678", { debounceMs: 0 }));

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeTruthy();
      },
      { timeout: 2000 }
    );

    expect(result.current.data).toBeNull();
  });

  it("should call onSuccess callback when data is fetched", async () => {
    const mockCEPData: CEPData = {
      cep: "12345678",
      street: "Rua Test",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      service: "viacep",
      location: {
        type: "Point",
        coordinates: {},
      },
    };

    const onSuccess = vi.fn();

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockCEPData,
    } as Response);

    renderHook(() => useCEPLookup("12345678", { debounceMs: 0, onSuccess }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockCEPData);
    });
  });

  it("should call onError callback when fetch fails", async () => {
    const onError = vi.fn();
    const error = new Error("Network error");

    vi.spyOn(global, "fetch").mockRejectedValueOnce(error);

    renderHook(() => useCEPLookup("12345678", { debounceMs: 0, onError }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it("should debounce fetch requests", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cep: "12345678" }),
    } as Response);

    const { rerender } = renderHook(({ cep }) => useCEPLookup(cep, { debounceMs: 100 }), {
      initialProps: { cep: "12345678" },
    });

    rerender({ cep: "12345678" });
    rerender({ cep: "12345678" });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });

  it("should not fetch when enabled is false", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");

    renderHook(() => useCEPLookup("12345678", { enabled: false, debounceMs: 0 }));

    await waitFor(() => {
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  it("should allow manual fetch", async () => {
    const mockCEPData: CEPData = {
      cep: "12345678",
      street: "Rua Test",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      service: "viacep",
      location: {
        type: "Point",
        coordinates: {},
      },
    };

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockCEPData,
    } as Response);

    const { result } = renderHook(() => useCEPLookup("", { enabled: false }));

    await act(async () => {
      await result.current.fetchCEP("12345678");
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockCEPData);
    });
  });
});
