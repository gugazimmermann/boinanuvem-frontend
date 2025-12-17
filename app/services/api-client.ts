/**
 * Generic API client utility for making HTTP requests to the backend
 */

const API_BASE_URL = "http://localhost:3000/api";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type TokenRefreshCallback = (
  refreshToken: string
) => Promise<{ access_token: string; refresh_token: string }>;
type OnTokenRefreshCallback = (tokens: { access_token: string; refresh_token: string }) => void;
type OnAuthFailureCallback = () => void;

/**
 * Generic API client for making HTTP requests
 */
export class ApiClient {
  private readonly baseUrl: string;
  private tokenRefreshCallback: TokenRefreshCallback | null = null;
  private onTokenRefreshCallback: OnTokenRefreshCallback | null = null;
  private onAuthFailureCallback: OnAuthFailureCallback | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<{ access_token: string; refresh_token: string }> | null = null;
  private inflightRequests = new Map<string, Promise<unknown>>();
  private responseCache = new Map<string, { expiresAt: number; value: unknown }>();

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Set callback for token refresh
   */
  setTokenRefreshCallback(callback: TokenRefreshCallback): void {
    this.tokenRefreshCallback = callback;
  }

  /**
   * Set callback for when tokens are refreshed
   */
  setOnTokenRefreshCallback(callback: OnTokenRefreshCallback): void {
    this.onTokenRefreshCallback = callback;
  }

  /**
   * Set callback for when authentication fails completely
   */
  setOnAuthFailureCallback(callback: OnAuthFailureCallback): void {
    this.onAuthFailureCallback = callback;
  }

  /**
   * Get access token from localStorage
   */
  getAccessToken(): string | null {
    if (globalThis.window === undefined) {
      return null;
    }
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken(): string | null {
    if (globalThis.window === undefined) {
      return null;
    }
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Set access token in localStorage
   */
  setAccessToken(token: string): void {
    if (globalThis.window !== undefined) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  }

  /**
   * Set refresh token in localStorage
   */
  setRefreshToken(token: string): void {
    if (globalThis.window !== undefined) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    if (globalThis.window !== undefined) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  /**
   * Get headers with authentication if token is available
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = this.getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Attempt to refresh the access token
   */
  private async refreshAccessToken(): Promise<{ access_token: string; refresh_token: string }> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    if (!this.tokenRefreshCallback) {
      throw new Error("Token refresh callback not set");
    }

    this.isRefreshing = true;
    this.refreshPromise = this.tokenRefreshCallback(refreshToken)
      .then((tokens) => {
        this.setAccessToken(tokens.access_token);
        this.setRefreshToken(tokens.refresh_token);
        if (this.onTokenRefreshCallback) {
          this.onTokenRefreshCallback(tokens);
        }
        return tokens;
      })
      .finally(() => {
        this.isRefreshing = false;
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  /**
   * Handle 401 response by attempting token refresh
   */
  private async handle401Response(
    url: string,
    options: RequestInit,
    response: Response
  ): Promise<Response> {
    const refreshToken = this.getRefreshToken();
    if (refreshToken && this.tokenRefreshCallback) {
      try {
        await this.refreshAccessToken();
        // Retry the request with new token
        const newHeaders = { ...options.headers, ...this.getHeaders() };
        return await fetch(url, { ...options, headers: newHeaders });
      } catch {
        // Refresh failed, clear tokens and call auth failure callback
        this.clearTokens();
        if (this.onAuthFailureCallback) {
          this.onAuthFailureCallback();
        }
        throw new ApiError("Authentication failed", 401, response);
      }
    }

    // No refresh token or callback, clear tokens and call auth failure callback
    this.clearTokens();
    if (this.onAuthFailureCallback) {
      this.onAuthFailureCallback();
    }
    return response;
  }

  /**
   * Make a request with automatic token refresh on 401
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit,
    retryOn401 = true,
    retryOn429 = 1
  ): Promise<T> {
    // Handle both full URLs and relative paths
    const url = endpoint.startsWith("http") ? endpoint : `${this.baseUrl}${endpoint}`;
    let response = await fetch(url, options);

    // If we get a 401 and have a refresh token, try to refresh
    if (response.status === 401 && retryOn401) {
      response = await this.handle401Response(url, options, response);
    }

    // If we get a 429, respect Retry-After and retry a limited number of times.
    if (response.status === 429 && retryOn429 > 0) {
      const retryAfterHeader = response.headers.get("retry-after");
      let delayMs = 500;
      if (retryAfterHeader) {
        const asSeconds = Number(retryAfterHeader);
        if (Number.isFinite(asSeconds) && asSeconds >= 0) {
          delayMs = Math.max(delayMs, Math.round(asSeconds * 1000));
        }
      }
      await new Promise<void>((resolve, reject) => {
        const id = setTimeout(() => resolve(), delayMs);
        if (options.signal) {
          if (options.signal.aborted) {
            clearTimeout(id);
            reject(new DOMException("The operation was aborted.", "AbortError"));
            return;
          }
          options.signal.addEventListener(
            "abort",
            () => {
              clearTimeout(id);
              reject(new DOMException("The operation was aborted.", "AbortError"));
            },
            { once: true }
          );
        }
      });
      return this.makeRequest<T>(endpoint, options, retryOn401, retryOn429 - 1);
    }

    if (!response.ok) {
      // Try to extract a useful error message from the response body.
      // NestJS (and many APIs) often return `{ message, error, statusCode }` for 4xx
      // and may return plain text / HTML for 5xx depending on config.
      let details: string | undefined;
      try {
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          const body = (await response.clone().json()) as unknown;
          if (body && typeof body === "object") {
            const maybeMessage = (body as Record<string, unknown>).message;
            const maybeError = (body as Record<string, unknown>).error;
            if (typeof maybeMessage === "string") {
              details = maybeMessage;
            } else if (Array.isArray(maybeMessage)) {
              details = maybeMessage.filter((x) => typeof x === "string").join("; ");
            } else if (typeof maybeError === "string") {
              details = maybeError;
            } else {
              details = JSON.stringify(body);
            }
          }
        } else {
          const text = await response.clone().text();
          if (text) details = text;
        }
      } catch {
        // Ignore parsing errors and fallback to status text.
      }

      const suffix = details ? ` - ${details}` : "";
      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}${suffix}`,
        response.status,
        response
      );
    }

    try {
      return await response.json();
    } catch {
      // If json parsing fails, throw ApiError instead of TypeError
      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        response
      );
    }
  }

  /**
   * Make a GET request to the specified endpoint
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, string>,
    options?: RequestInit & {
      dedupe?: boolean;
      retryOn429?: number;
      /**
       * Cache successful GET responses for a short time (ms) to avoid request storms
       * from repeated sequential calls (common in dev + StrictMode).
       * Set to 0 to disable caching for this request.
       */
      cacheTtlMs?: number;
    }
  ): Promise<T> {
    let url = endpoint;

    // Build query string if params provided
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        searchParams.append(key, value);
      }
      const queryString = searchParams.toString();
      url = `${endpoint}${endpoint.includes("?") ? "&" : "?"}${queryString}`;
    }

    const requestOptions: RequestInit = {
      method: "GET",
      headers: { ...this.getHeaders(), ...(options?.headers ?? {}) },
      signal: options?.signal,
    };

    const shouldDedupe = options?.dedupe ?? true;
    const cacheTtlMs = options?.cacheTtlMs ?? 5000;
    const auth = (requestOptions.headers as Record<string, unknown>)?.Authorization ?? "";
    const inflightKey = `GET ${url} :: ${String(auth)}`;

    if (cacheTtlMs > 0) {
      const cached = this.responseCache.get(inflightKey);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.value as T;
      }
    }

    if (shouldDedupe) {
      const existing = this.inflightRequests.get(inflightKey);
      if (existing) return existing as Promise<T>;
    }

    const promise = this.makeRequest<T>(url, requestOptions, true, options?.retryOn429 ?? 1)
      .then((value) => {
        if (cacheTtlMs > 0) {
          this.responseCache.set(inflightKey, { expiresAt: Date.now() + cacheTtlMs, value });
        }
        return value;
      })
      .finally(() => {
        this.inflightRequests.delete(inflightKey);
      });

    if (shouldDedupe) {
      this.inflightRequests.set(inflightKey, promise as Promise<unknown>);
    }
    return promise;
  }

  /**
   * Make a POST request to the specified endpoint
   */
  async post<T>(endpoint: string, data?: unknown, retryOn401 = true): Promise<T> {
    return this.makeRequest<T>(
      endpoint,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      },
      retryOn401
    );
  }

  /**
   * Make a PUT request to the specified endpoint
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: "PUT",
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Make a DELETE request to the specified endpoint
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
  }
}

// Default API client instance
export const apiClient = new ApiClient();
