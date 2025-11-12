/**
 * Custom hooks-related types
 */

import type { CEPData, CNPJData } from "./address";

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
