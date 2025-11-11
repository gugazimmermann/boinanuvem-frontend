import { useState, useEffect, useCallback, useRef } from "react";

export interface CNPJData {
  cnpj: string;
  razao_social: string;
  email: string | null;
  ddd_telefone_1: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
}

export interface UseCNPJLookupOptions {
  debounceMs?: number;
  onSuccess?: (data: CNPJData) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export interface UseCNPJLookupReturn {
  data: CNPJData | null;
  loading: boolean;
  error: string | null;
  fetchCNPJ: (cnpj: string) => Promise<void>;
}

export function useCNPJLookup(
  cnpj: string,
  options: UseCNPJLookupOptions = {}
): UseCNPJLookupReturn {
  const {
    debounceMs = 800,
    onSuccess,
    onError,
    enabled = true,
  } = options;

  const [data, setData] = useState<CNPJData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedCNPJ = useRef<string>("");
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const formatCNPJ = useCallback((value: string): string => {
    return value.replace(/\D/g, "");
  }, []);

  const fetchCNPJ = useCallback(
    async (cnpjValue: string) => {
      const cleanCNPJ = formatCNPJ(cnpjValue);

      if (cleanCNPJ.length !== 14) {
        setError(null);
        setData(null);
        lastFetchedCNPJ.current = "";
        return;
      }

      if (lastFetchedCNPJ.current === cleanCNPJ) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`
        );

        if (!response.ok) {
          throw new Error("CNPJ not found");
        }

        const cnpjData: CNPJData = await response.json();
        setData(cnpjData);
        lastFetchedCNPJ.current = cleanCNPJ;
        onSuccessRef.current?.(cnpjData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "CNPJ not found or invalid";
        setError(errorMessage);
        setData(null);
        lastFetchedCNPJ.current = "";
        onErrorRef.current?.(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        setLoading(false);
      }
    },
    [formatCNPJ]
  );

  useEffect(() => {
    if (!enabled) return;

    const cleanCNPJ = formatCNPJ(cnpj);

    if (cleanCNPJ.length === 14 && cleanCNPJ !== lastFetchedCNPJ.current) {
      const timeoutId = setTimeout(() => {
        fetchCNPJ(cleanCNPJ);
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    } else if (cleanCNPJ.length !== 14) {
      setError(null);
      setData(null);
      lastFetchedCNPJ.current = "";
    }
  }, [cnpj, debounceMs, enabled, fetchCNPJ, formatCNPJ]);

  return {
    data,
    loading,
    error,
    fetchCNPJ,
  };
}

