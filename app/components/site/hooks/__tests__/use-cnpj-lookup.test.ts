import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCNPJLookup } from "../use-cnpj-lookup";

describe("useCNPJLookup", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should initialize with null data, false loading, and null error", () => {
    const { result } = renderHook(() => useCNPJLookup(""));

    expect(result.current.data).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should not fetch when CNPJ is less than 14 digits", async () => {
    const { result } = renderHook(() => useCNPJLookup("1234567890123"));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it("should not fetch when CNPJ is more than 14 digits", async () => {
    renderHook(() => useCNPJLookup("123456789012345"));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should debounce fetch requests", async () => {
    const mockData = {
      cnpj: "12345678000190",
      razao_social: "Test Company",
      email: "test@example.com",
      ddd_telefone_1: "11999999999",
      logradouro: "Rua Test",
      numero: "123",
      complemento: "",
      bairro: "Centro",
      municipio: "São Paulo",
      uf: "SP",
      cep: "12345678",
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const { rerender } = renderHook(({ cnpj }) => useCNPJLookup(cnpj, { debounceMs: 800 }), {
      initialProps: { cnpj: "12345" },
    });

    rerender({ cnpj: "12345678000190" });

    // Should not fetch immediately
    await act(async () => {
      vi.advanceTimersByTime(799);
    });

    expect(global.fetch).not.toHaveBeenCalled();

    // Should fetch after debounce
    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    await vi.runOnlyPendingTimersAsync();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("should fetch CNPJ data successfully", async () => {
    const mockData = {
      cnpj: "12345678000190",
      razao_social: "Test Company",
      email: "test@example.com",
      ddd_telefone_1: "11999999999",
      logradouro: "Rua Test",
      numero: "123",
      complemento: "",
      bairro: "Centro",
      municipio: "São Paulo",
      uf: "SP",
      cep: "12345678",
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const { result } = renderHook(() => useCNPJLookup("12345678000190", { debounceMs: 0 }));

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

    const { result } = renderHook(() => useCNPJLookup("12345678000190", { debounceMs: 0 }));

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

    const { result } = renderHook(() => useCNPJLookup("12345678000190", { debounceMs: 0 }));

    await act(async () => {
      vi.advanceTimersByTime(1);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe("CNPJ not found");
    expect(result.current.loading).toBe(false);
  });

  it("should call onSuccess callback when data is fetched", async () => {
    const mockData = {
      cnpj: "12345678000190",
      razao_social: "Test Company",
      email: "test@example.com",
      ddd_telefone_1: "11999999999",
      logradouro: "Rua Test",
      numero: "123",
      complemento: "",
      bairro: "Centro",
      municipio: "São Paulo",
      uf: "SP",
      cep: "12345678",
    };

    const onSuccess = vi.fn();

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    renderHook(() => useCNPJLookup("12345678000190", { debounceMs: 0, onSuccess }));

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

    renderHook(() => useCNPJLookup("12345678000190", { debounceMs: 0, onError }));

    await act(async () => {
      vi.advanceTimersByTime(1);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(onError).toHaveBeenCalledWith(error);
  });

  it("should not fetch same CNPJ twice", async () => {
    const mockData = {
      cnpj: "12345678000190",
      razao_social: "Test Company",
      email: "test@example.com",
      ddd_telefone_1: "11999999999",
      logradouro: "Rua Test",
      numero: "123",
      complemento: "",
      bairro: "Centro",
      municipio: "São Paulo",
      uf: "SP",
      cep: "12345678",
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const { rerender } = renderHook(({ cnpj }) => useCNPJLookup(cnpj, { debounceMs: 0 }), {
      initialProps: { cnpj: "12345678000190" },
    });

    await act(async () => {
      vi.advanceTimersByTime(1);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Rerender with same CNPJ
    rerender({ cnpj: "12345678000190" });

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("should format CNPJ by removing non-digits", async () => {
    const mockData = {
      cnpj: "12345678000190",
      razao_social: "Test Company",
      email: "test@example.com",
      ddd_telefone_1: "11999999999",
      logradouro: "Rua Test",
      numero: "123",
      complemento: "",
      bairro: "Centro",
      municipio: "São Paulo",
      uf: "SP",
      cep: "12345678",
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    renderHook(() => useCNPJLookup("12.345.678/0001-90", { debounceMs: 0 }));

    await act(async () => {
      vi.advanceTimersByTime(1);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "https://brasilapi.com.br/api/cnpj/v1/12345678000190"
    );
  });

  it("should not fetch when enabled is false", async () => {
    const { result } = renderHook(() =>
      useCNPJLookup("12345678000190", { debounceMs: 0, enabled: false })
    );

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.data).toBe(null);
  });

  it("should clear data and error when CNPJ becomes invalid", async () => {
    const mockData = {
      cnpj: "12345678000190",
      razao_social: "Test Company",
      email: "test@example.com",
      ddd_telefone_1: "11999999999",
      logradouro: "Rua Test",
      numero: "123",
      complemento: "",
      bairro: "Centro",
      municipio: "São Paulo",
      uf: "SP",
      cep: "12345678",
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const { result, rerender } = renderHook(({ cnpj }) => useCNPJLookup(cnpj, { debounceMs: 0 }), {
      initialProps: { cnpj: "12345678000190" },
    });

    await act(async () => {
      vi.advanceTimersByTime(1);
      await vi.runOnlyPendingTimersAsync();
    });

    // Change to invalid CNPJ
    rerender({ cnpj: "123" });

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it("should expose fetchCNPJ function", () => {
    const { result } = renderHook(() => useCNPJLookup(""));

    expect(typeof result.current.fetchCNPJ).toBe("function");
  });

  it("should allow manual fetch via fetchCNPJ", async () => {
    const mockData = {
      cnpj: "12345678000190",
      razao_social: "Test Company",
      email: "test@example.com",
      ddd_telefone_1: "11999999999",
      logradouro: "Rua Test",
      numero: "123",
      complemento: "",
      bairro: "Centro",
      municipio: "São Paulo",
      uf: "SP",
      cep: "12345678",
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const { result } = renderHook(() => useCNPJLookup("", { debounceMs: 0 }));

    await act(async () => {
      await result.current.fetchCNPJ("12345678000190");
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.data).toEqual(mockData);
  });

  it("should handle non-Error rejection in onError", async () => {
    const onError = vi.fn();

    vi.mocked(global.fetch).mockRejectedValueOnce("String error");

    renderHook(() => useCNPJLookup("12345678000190", { debounceMs: 0, onError }));

    await act(async () => {
      vi.advanceTimersByTime(1);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should update callbacks when they change", async () => {
    const mockData = {
      cnpj: "12345678000190",
      razao_social: "Test Company",
      email: "test@example.com",
      ddd_telefone_1: "11999999999",
      logradouro: "Rua Test",
      numero: "123",
      complemento: "",
      bairro: "Centro",
      municipio: "São Paulo",
      uf: "SP",
      cep: "12345678",
    };

    const onSuccess1 = vi.fn();
    const onSuccess2 = vi.fn();

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    const { rerender } = renderHook(
      ({ cnpj, onSuccess }) => useCNPJLookup(cnpj, { debounceMs: 0, onSuccess }),
      { initialProps: { cnpj: "12345678000190", onSuccess: onSuccess1 } }
    );

    await act(async () => {
      vi.advanceTimersByTime(1);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(onSuccess1).toHaveBeenCalledWith(mockData);

    rerender({ cnpj: "12345678000190", onSuccess: onSuccess2 });

    // Clear previous call
    onSuccess1.mockClear();
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    // Trigger new fetch by changing CNPJ to a different value
    rerender({ cnpj: "98765432000123", onSuccess: onSuccess2 });

    await act(async () => {
      vi.advanceTimersByTime(1);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(onSuccess2).toHaveBeenCalledWith(mockData);
  });
});
