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
    retryOn401 = true
  ): Promise<T> {
    // Handle both full URLs and relative paths
    const url = endpoint.startsWith("http") ? endpoint : `${this.baseUrl}${endpoint}`;
    let response = await fetch(url, options);

    // If we get a 401 and have a refresh token, try to refresh
    if (response.status === 401 && retryOn401) {
      response = await this.handle401Response(url, options, response);
    }

    if (!response.ok) {
      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        response
      );
    }

    return response.json();
  }

  /**
   * Make a GET request to the specified endpoint
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
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

    return this.makeRequest<T>(url, {
      method: "GET",
      headers: this.getHeaders(),
    });
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
