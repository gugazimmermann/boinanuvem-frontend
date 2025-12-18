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
  private readonly inflightRequests = new Map<string, Promise<unknown>>();
  private readonly responseCache = new Map<string, { expiresAt: number; value: unknown }>();

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
   * Extract error message from JSON response body
   */
  private async extractJsonErrorMessage(response: Response): Promise<string | undefined> {
    try {
      const body = (await response.clone().json()) as unknown;
      if (!body || typeof body !== "object") {
        return undefined;
      }
      const record = body as Record<string, unknown>;
      const maybeMessage = record.message;
      const maybeError = record.error;

      if (typeof maybeMessage === "string") {
        return maybeMessage;
      }
      if (Array.isArray(maybeMessage)) {
        return maybeMessage.filter((x) => typeof x === "string").join("; ");
      }
      if (typeof maybeError === "string") {
        return maybeError;
      }
      return JSON.stringify(body);
    } catch {
      return undefined;
    }
  }

  /**
   * Extract error message from text response body
   */
  private async extractTextErrorMessage(response: Response): Promise<string | undefined> {
    try {
      const text = await response.clone().text();
      return text || undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Extract error message from response body
   */
  private async extractErrorMessage(response: Response): Promise<string | undefined> {
    try {
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        return await this.extractJsonErrorMessage(response);
      }
      return await this.extractTextErrorMessage(response);
    } catch {
      // Ignore parsing errors and fallback to status text.
    }
    return undefined;
  }

  /**
   * Handle 429 rate limit response with retry logic
   */
  private async handle429Retry<T>(
    endpoint: string,
    options: RequestInit,
    response: Response,
    retryOn401: boolean,
    retryOn429: number
  ): Promise<T | undefined> {
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

  /**
   * Make a request with automatic token refresh on 401
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit,
    retryOn401 = true,
    retryOn429 = 1,
    allow404 = false
  ): Promise<T | undefined> {
    // Handle both full URLs and relative paths
    const url = endpoint.startsWith("http") ? endpoint : `${this.baseUrl}${endpoint}`;
    let response = await fetch(url, options);

    // If we get a 401 and have a refresh token, try to refresh
    if (response.status === 401 && retryOn401) {
      response = await this.handle401Response(url, options, response);
    }

    // If we get a 429, respect Retry-After and retry a limited number of times.
    if (response.status === 429 && retryOn429 > 0) {
      return this.handle429Retry<T>(endpoint, options, response, retryOn401, retryOn429);
    }

    if (!response.ok) {
      // If 404 is allowed, return undefined instead of throwing
      if (allow404 && response.status === 404) {
        return undefined as T;
      }

      const details = await this.extractErrorMessage(response);
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
   * Build URL with query parameters
   */
  private buildUrlWithParams(endpoint: string, params?: Record<string, string>): string {
    if (!params || Object.keys(params).length === 0) {
      return endpoint;
    }

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      searchParams.append(key, value);
    }
    const queryString = searchParams.toString();
    return `${endpoint}${endpoint.includes("?") ? "&" : "?"}${queryString}`;
  }

  /**
   * Get cache key for a request
   */
  private getCacheKey(method: string, url: string, headers: HeadersInit): string {
    const authHeader = (headers as Record<string, unknown>)?.Authorization;
    const authString = typeof authHeader === "string" ? authHeader : "";
    return `${method} ${url} :: ${authString}`;
  }

  /**
   * Check and return cached response if available
   */
  private getCachedResponse<T>(cacheKey: string, cacheTtlMs: number): T | null {
    if (cacheTtlMs <= 0) return null;
    const cached = this.responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as T;
    }
    return null;
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
      /**
       * If true, 404 responses will return undefined instead of throwing an error.
       * Useful for optional resources where 404 is expected.
       */
      allow404?: boolean;
    }
  ): Promise<T> {
    const url = this.buildUrlWithParams(endpoint, params);

    const baseHeaders = this.getHeaders();
    const additionalHeaders = options?.headers;
    const requestOptions: RequestInit = {
      method: "GET",
      headers: additionalHeaders ? { ...baseHeaders, ...additionalHeaders } : baseHeaders,
      signal: options?.signal,
    };

    const shouldDedupe = options?.dedupe ?? true;
    const cacheTtlMs = options?.cacheTtlMs ?? 5000;
    const inflightKey = this.getCacheKey("GET", url, requestOptions.headers!);

    const cached = this.getCachedResponse<T>(inflightKey, cacheTtlMs);
    if (cached !== null) {
      return cached;
    }

    if (shouldDedupe) {
      const existing = this.inflightRequests.get(inflightKey);
      if (existing) return existing as Promise<T>;
    }

    const allow404 = options?.allow404 ?? false;
    const promise = this.makeRequest<T>(
      url,
      requestOptions,
      true,
      options?.retryOn429 ?? 1,
      allow404
    )
      .then((value) => {
        if (cacheTtlMs > 0 && value !== undefined) {
          this.responseCache.set(inflightKey, { expiresAt: Date.now() + cacheTtlMs, value });
        }
        // When allow404 is true, value might be undefined, but we return it as T
        // Callers using allow404 should handle undefined (type assertion needed)
        return value as T;
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
    const result = await this.makeRequest<T>(
      endpoint,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      },
      retryOn401
    );
    if (result === undefined) {
      throw new ApiError("Unexpected undefined response", 500);
    }
    return result;
  }

  /**
   * Make a PUT request to the specified endpoint
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const result = await this.makeRequest<T>(endpoint, {
      method: "PUT",
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    if (result === undefined) {
      throw new ApiError("Unexpected undefined response", 500);
    }
    return result;
  }

  /**
   * Make a DELETE request to the specified endpoint
   */
  async delete<T>(endpoint: string): Promise<T> {
    const result = await this.makeRequest<T>(endpoint, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    if (result === undefined) {
      throw new ApiError("Unexpected undefined response", 500);
    }
    return result;
  }
}

// Default API client instance
export const apiClient = new ApiClient();
