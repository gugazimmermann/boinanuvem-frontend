import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ApiClient, ApiError, apiClient } from "../api-client";

// Mock fetch globally
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("ApiClient", () => {
  let client: ApiClient;
  const mockFetch = global.fetch as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    client = new ApiClient("http://localhost:3000/api");
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Token Management", () => {
    it("should get access token from localStorage", () => {
      localStorageMock.getItem.mockReturnValue("test-access-token");
      expect(client.getAccessToken()).toBe("test-access-token");
      expect(localStorageMock.getItem).toHaveBeenCalledWith("access_token");
    });

    it("should return null when window is undefined", () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error - testing SSR scenario
      delete globalThis.window;

      expect(client.getAccessToken()).toBeNull();

      globalThis.window = originalWindow;
    });

    it("should get refresh token from localStorage", () => {
      localStorageMock.getItem.mockReturnValue("test-refresh-token");
      expect(client.getRefreshToken()).toBe("test-refresh-token");
      expect(localStorageMock.getItem).toHaveBeenCalledWith("refresh_token");
    });

    it("should set access token in localStorage", () => {
      client.setAccessToken("new-access-token");
      expect(localStorageMock.setItem).toHaveBeenCalledWith("access_token", "new-access-token");
    });

    it("should set refresh token in localStorage", () => {
      client.setRefreshToken("new-refresh-token");
      expect(localStorageMock.setItem).toHaveBeenCalledWith("refresh_token", "new-refresh-token");
    });

    it("should clear tokens", () => {
      client.clearTokens();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("access_token");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("refresh_token");
    });

    it("should not set token when window is undefined", () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error - testing SSR scenario
      delete globalThis.window;

      client.setAccessToken("token");
      expect(localStorageMock.setItem).not.toHaveBeenCalled();

      globalThis.window = originalWindow;
    });
  });

  describe("Request Headers", () => {
    it("should include Content-Type header", () => {
      const headers = (
        client as unknown as { getHeaders: () => Record<string, string> }
      ).getHeaders();
      expect(headers["Content-Type"]).toBe("application/json");
    });

    it("should include Authorization header when token exists", () => {
      localStorageMock.getItem.mockReturnValue("test-token");
      const headers = (
        client as unknown as { getHeaders: () => Record<string, string> }
      ).getHeaders();
      expect(headers.Authorization).toBe("Bearer test-token");
    });

    it("should not include Authorization header when token is null", () => {
      localStorageMock.getItem.mockReturnValue(null);
      const headers = (
        client as unknown as { getHeaders: () => Record<string, string> }
      ).getHeaders();
      expect(headers.Authorization).toBeUndefined();
    });
  });

  describe("GET requests", () => {
    it("should make GET request successfully", async () => {
      const mockResponse = { data: "test" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await client.get("/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/test",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it("should include query parameters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await client.get("/test", { param1: "value1", param2: "value2" });

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/test?param1=value1&param2=value2",
        expect.any(Object)
      );
    });

    it("should handle existing query string in endpoint", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await client.get("/test?existing=param", { new: "value" });

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/test?existing=param&new=value",
        expect.any(Object)
      );
    });

    it("should handle full URLs", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await client.get("https://external-api.com/endpoint");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://external-api.com/endpoint",
        expect.any(Object)
      );
    });

    it("should throw ApiError on non-ok response", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => {
          throw new Error("Invalid JSON");
        },
      } as unknown as Response;
      mockFetch.mockResolvedValueOnce(mockResponse);

      try {
        await client.get("/test");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).message).toBe("HTTP 404: Not Found");
      }
    });
  });

  describe("POST requests", () => {
    it("should make POST request with data", async () => {
      const mockData = { name: "test" };
      const mockResponse = { id: "123", ...mockData };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await client.post("/test", mockData);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/test",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(mockData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it("should make POST request without data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await client.post("/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/test",
        expect.objectContaining({
          method: "POST",
          body: undefined,
        })
      );
    });
  });

  describe("PUT requests", () => {
    it("should make PUT request with data", async () => {
      const mockData = { name: "updated" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await client.put("/test", mockData);

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/test",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(mockData),
        })
      );
      expect(result).toEqual(mockData);
    });
  });

  describe("DELETE requests", () => {
    it("should make DELETE request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await client.delete("/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/test",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });
  });

  describe("Token Refresh", () => {
    it("should refresh token on 401 and retry request", async () => {
      const refreshCallback = vi.fn().mockResolvedValue({
        access_token: "new-access",
        refresh_token: "new-refresh",
      });
      client.setTokenRefreshCallback(refreshCallback);
      localStorageMock.getItem
        .mockReturnValueOnce("old-refresh") // refresh token (first call)
        .mockReturnValueOnce("old-access") // access token (first call)
        .mockReturnValueOnce("old-refresh") // refresh token (refresh attempt)
        .mockReturnValueOnce("new-access"); // access token (retry call)

      // First call returns 401
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          statusText: "Unauthorized",
        } as Response)
        // Retry call after refresh
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        } as Response);

      const result = await client.get("/test");

      expect(refreshCallback).toHaveBeenCalledWith("old-refresh");
      expect(localStorageMock.setItem).toHaveBeenCalledWith("access_token", "new-access");
      expect(localStorageMock.setItem).toHaveBeenCalledWith("refresh_token", "new-refresh");
      expect(result).toEqual({ success: true });
    });

    it("should handle refresh failure", async () => {
      const refreshCallback = vi.fn().mockRejectedValue(new Error("Refresh failed"));
      const authFailureCallback = vi.fn();
      client.setTokenRefreshCallback(refreshCallback);
      client.setOnAuthFailureCallback(authFailureCallback);
      localStorageMock.getItem
        .mockReturnValueOnce("refresh-token") // getRefreshToken (first call in makeRequest)
        .mockReturnValueOnce("access-token") // getAccessToken (first call in makeRequest)
        .mockReturnValueOnce("refresh-token") // getRefreshToken (in handle401Response)
        .mockReturnValueOnce("refresh-token"); // getRefreshToken (in refreshAccessToken)

      const mock401Response = {
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      } as Response;

      mockFetch.mockResolvedValueOnce(mock401Response); // Initial 401

      // refreshCallback will reject, which should trigger auth failure
      await expect(client.get("/test")).rejects.toThrow(ApiError);
      expect(authFailureCallback).toHaveBeenCalled();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("access_token");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("refresh_token");
    });

    it("should not retry when retryOn401 is false", async () => {
      // When retryOn401 is false, it should still throw on 401 but not attempt refresh
      localStorageMock.getItem.mockReturnValue(null); // No refresh token
      const mock401Response = {
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      } as Response;
      mockFetch.mockResolvedValueOnce(mock401Response);

      await expect(client.post("/test", {}, false)).rejects.toThrow(ApiError);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should call onTokenRefreshCallback when token is refreshed", async () => {
      const onTokenRefreshCallback = vi.fn();
      const refreshCallback = vi.fn().mockResolvedValue({
        access_token: "new-access",
        refresh_token: "new-refresh",
      });
      client.setTokenRefreshCallback(refreshCallback);
      client.setOnTokenRefreshCallback(onTokenRefreshCallback);
      localStorageMock.getItem
        .mockReturnValueOnce("refresh-token") // getRefreshToken
        .mockReturnValueOnce("access-token") // getAccessToken (first call)
        .mockReturnValueOnce("refresh-token") // getRefreshToken (refresh)
        .mockReturnValueOnce("new-access"); // getAccessToken (retry)

      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          statusText: "Unauthorized",
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        } as Response);

      await client.get("/test");

      expect(onTokenRefreshCallback).toHaveBeenCalledWith({
        access_token: "new-access",
        refresh_token: "new-refresh",
      });
    });
  });

  describe("ApiError", () => {
    it("should create ApiError with message and status", () => {
      const error = new ApiError("Test error", 404);
      expect(error.message).toBe("Test error");
      expect(error.status).toBe(404);
      expect(error.name).toBe("ApiError");
    });

    it("should include response in ApiError", () => {
      const response = {} as Response;
      const error = new ApiError("Test error", 500, response);
      expect(error.response).toBe(response);
    });
  });

  describe("Default apiClient instance", () => {
    it("should be an instance of ApiClient", () => {
      expect(apiClient).toBeInstanceOf(ApiClient);
    });

    it("should use default base URL", async () => {
      localStorageMock.getItem.mockReturnValue(null);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => ({}),
      } as Response);

      await apiClient.get("/test");

      expect(mockFetch).toHaveBeenCalledWith("http://localhost:3000/api/test", expect.any(Object));
    });
  });
});
