import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useCNPJLookup } from "../use-cnpj-lookup";
import type { CNPJData } from "~/types";

describe("useCNPJLookup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should initialize with null data and no loading", () => {
    const { result } = renderHook(() => useCNPJLookup(""));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should not fetch when CNPJ is invalid length", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    const { result } = renderHook(() => useCNPJLookup("123"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
  });

  it("should fetch CNPJ data successfully", async () => {
    const mockCNPJData: CNPJData = {
      cnpj: "12345678901234",
      razao_social: "Test Company",
      email: "test@example.com",
      ddd_telefone_1: "11987654321",
      logradouro: "Rua Test",
      numero: "123",
      complemento: "Apto 45",
      bairro: "Centro",
      municipio: "São Paulo",
      uf: "SP",
      cep: "12345678",
    };

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockCNPJData,
    } as Response);

    const { result } = renderHook(() => useCNPJLookup("12345678901234", { debounceMs: 0 }));

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
        expect(result.current.data).not.toBeNull();
      },
      { timeout: 2000 }
    );

    expect(result.current.data).toEqual(mockCNPJData);
    expect(result.current.error).toBeNull();
  });

  it("should handle fetch error", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useCNPJLookup("12345678901234", { debounceMs: 0 }));

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

    const { result } = renderHook(() => useCNPJLookup("12345678901234", { debounceMs: 0 }));

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
    const mockCNPJData: CNPJData = {
      cnpj: "12345678901234",
      razao_social: "Test Company",
      email: "",
      ddd_telefone_1: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      municipio: "",
      uf: "",
      cep: "",
    };

    const onSuccess = vi.fn();

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockCNPJData,
    } as Response);

    renderHook(() => useCNPJLookup("12345678901234", { debounceMs: 0, onSuccess }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockCNPJData);
    });
  });

  it("should call onError callback when fetch fails", async () => {
    const onError = vi.fn();
    const error = new Error("Network error");

    vi.spyOn(global, "fetch").mockRejectedValueOnce(error);

    renderHook(() => useCNPJLookup("12345678901234", { debounceMs: 0, onError }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it("should debounce fetch requests", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cnpj: "12345678901234" }),
    } as Response);

    const { rerender } = renderHook(({ cnpj }) => useCNPJLookup(cnpj, { debounceMs: 100 }), {
      initialProps: { cnpj: "12345678901234" },
    });

    rerender({ cnpj: "12345678901234" });
    rerender({ cnpj: "12345678901234" });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });

  it("should not fetch when enabled is false", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");

    renderHook(() => useCNPJLookup("12345678901234", { enabled: false, debounceMs: 0 }));

    await waitFor(() => {
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  it("should allow manual fetch", async () => {
    const mockCNPJData: CNPJData = {
      cnpj: "12345678901234",
      razao_social: "Test Company",
      email: "",
      ddd_telefone_1: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      municipio: "",
      uf: "",
      cep: "",
    };

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockCNPJData,
    } as Response);

    const { result } = renderHook(() => useCNPJLookup("", { enabled: false }));

    await act(async () => {
      await result.current.fetchCNPJ("12345678901234");
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockCNPJData);
    });
  });
});
