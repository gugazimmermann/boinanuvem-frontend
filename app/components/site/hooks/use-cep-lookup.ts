import { useState, useEffect, useCallback, useRef } from "react";

export interface CEPData {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service: string;
  location: {
    type: string;
    coordinates: Record<string, unknown>;
  };
}

export interface UseCEPLookupOptions {
  debounceMs?: number;
  onSuccess?: (data: CEPData) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export interface UseCEPLookupReturn {
  data: CEPData | null;
  loading: boolean;
  error: string | null;
  fetchCEP: (cep: string) => Promise<void>;
}

/**
 * Reusable hook for CEP lookup using BrasilAPI
 * @param cep - The CEP value to lookup
 * @param options - Configuration options
 * @returns CEP data, loading state, error, and fetch function
 */
export function useCEPLookup(
  cep: string,
  options: UseCEPLookupOptions = {}
): UseCEPLookupReturn {
  const {
    debounceMs = 800,
    onSuccess,
    onError,
    enabled = true,
  } = options;

  const [data, setData] = useState<CEPData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedCEP = useRef<string>("");
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const formatCEP = useCallback((value: string): string => {
    return value.replace(/\D/g, "");
  }, []);

  const fetchCEP = useCallback(
    async (cepValue: string) => {
      const cleanCEP = formatCEP(cepValue);

      if (cleanCEP.length !== 8) {
        setError(null);
        setData(null);
        lastFetchedCEP.current = "";
        return;
      }

      if (lastFetchedCEP.current === cleanCEP) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://brasilapi.com.br/api/cep/v2/${cleanCEP}`
        );

        if (!response.ok) {
          throw new Error("CEP não encontrado");
        }

        const cepData: CEPData = await response.json();
        setData(cepData);
        lastFetchedCEP.current = cleanCEP;
        onSuccessRef.current?.(cepData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "CEP não encontrado ou inválido";
        setError(errorMessage);
        setData(null);
        lastFetchedCEP.current = "";
        onErrorRef.current?.(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        setLoading(false);
      }
    },
    [formatCEP]
  );

  useEffect(() => {
    if (!enabled) return;

    const cleanCEP = formatCEP(cep);

    if (cleanCEP.length === 8 && cleanCEP !== lastFetchedCEP.current) {
      const timeoutId = setTimeout(() => {
        fetchCEP(cleanCEP);
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    } else if (cleanCEP.length !== 8) {
      setError(null);
      setData(null);
      lastFetchedCEP.current = "";
    }
  }, [cep, debounceMs, enabled, fetchCEP, formatCEP]);

  return {
    data,
    loading,
    error,
    fetchCEP,
  };
}

