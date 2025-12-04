import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiClient, ApiError, apiClient } from "../api-client";

// Mock fetch globally
global.fetch = vi.fn();

describe("api-client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ApiError", () => {
    it("should create an ApiError with message and status", () => {
      const error = new ApiError("Test error", 404);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Test error");
      expect(error.status).toBe(404);
      expect(error.name).toBe("ApiError");
    });

    it("should include response in ApiError", () => {
      const response = new Response();
      const error = new ApiError("Test error", 500, response);
      expect(error.response).toBe(response);
    });
  });

  describe("ApiClient", () => {
    describe("constructor", () => {
      it("should use default base URL when not provided", () => {
        const client = new ApiClient();
        expect(client).toBeInstanceOf(ApiClient);
      });

      it("should use custom base URL when provided", () => {
        const client = new ApiClient("https://api.example.com");
        expect(client).toBeInstanceOf(ApiClient);
      });
    });

    describe("get", () => {
      it("should make GET request successfully", async () => {
        const mockData = { id: 1, name: "Test" };
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockData,
        } as Response);

        const client = new ApiClient();
        const result = await client.get("/test");

        expect(fetch).toHaveBeenCalledWith(
          "http://localhost:3000/api/test",
          expect.objectContaining({
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })
        );
        expect(result).toEqual(mockData);
      });

      it("should include query parameters in GET request", async () => {
        const mockData = { id: 1 };
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockData,
        } as Response);

        const client = new ApiClient();
        await client.get("/test", { page: "1", limit: "10" });

        expect(fetch).toHaveBeenCalledWith(expect.stringContaining("page=1"), expect.any(Object));
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining("limit=10"), expect.any(Object));
      });

      it("should throw ApiError on non-ok response", async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: "Not Found",
        } as Response);

        const client = new ApiClient();
        await expect(client.get("/test")).rejects.toThrow(ApiError);
      });

      it("should throw ApiError with correct message on non-ok response", async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: "Not Found",
        } as Response);

        const client = new ApiClient();
        await expect(client.get("/test")).rejects.toThrow("HTTP 404: Not Found");
      });

      it("should throw ApiError with status code", async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
        } as Response);

        const client = new ApiClient();
        try {
          await client.get("/test");
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          if (error instanceof ApiError) {
            expect(error.status).toBe(500);
          }
        }
      });
    });

    describe("post", () => {
      it("should make POST request successfully", async () => {
        const mockData = { id: 1, name: "Created" };
        const requestData = { name: "Test" };
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockData,
        } as Response);

        const client = new ApiClient();
        const result = await client.post("/test", requestData);

        expect(fetch).toHaveBeenCalledWith(
          "http://localhost:3000/api/test",
          expect.objectContaining({
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          })
        );
        expect(result).toEqual(mockData);
      });

      it("should make POST request without body", async () => {
        const mockData = { id: 1 };
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockData,
        } as Response);

        const client = new ApiClient();
        await client.post("/test");

        expect(fetch).toHaveBeenCalledWith(
          "http://localhost:3000/api/test",
          expect.objectContaining({
            method: "POST",
            body: undefined,
          })
        );
      });

      it("should throw ApiError on non-ok response", async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: false,
          status: 400,
          statusText: "Bad Request",
        } as Response);

        const client = new ApiClient();
        await expect(client.post("/test", {})).rejects.toThrow(ApiError);
      });
    });

    describe("put", () => {
      it("should make PUT request successfully", async () => {
        const mockData = { id: 1, name: "Updated" };
        const requestData = { name: "Test" };
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockData,
        } as Response);

        const client = new ApiClient();
        const result = await client.put("/test", requestData);

        expect(fetch).toHaveBeenCalledWith(
          "http://localhost:3000/api/test",
          expect.objectContaining({
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          })
        );
        expect(result).toEqual(mockData);
      });

      it("should make PUT request without body", async () => {
        const mockData = { id: 1 };
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockData,
        } as Response);

        const client = new ApiClient();
        await client.put("/test");

        expect(fetch).toHaveBeenCalledWith(
          "http://localhost:3000/api/test",
          expect.objectContaining({
            method: "PUT",
            body: undefined,
          })
        );
      });

      it("should throw ApiError on non-ok response", async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: "Not Found",
        } as Response);

        const client = new ApiClient();
        await expect(client.put("/test", {})).rejects.toThrow(ApiError);
      });
    });

    describe("delete", () => {
      it("should make DELETE request successfully", async () => {
        const mockData = { success: true };
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockData,
        } as Response);

        const client = new ApiClient();
        const result = await client.delete("/test/1");

        expect(fetch).toHaveBeenCalledWith(
          "http://localhost:3000/api/test/1",
          expect.objectContaining({
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          })
        );
        expect(result).toEqual(mockData);
      });

      it("should throw ApiError on non-ok response", async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: "Not Found",
        } as Response);

        const client = new ApiClient();
        await expect(client.delete("/test/1")).rejects.toThrow(ApiError);
      });
    });

    describe("custom base URL", () => {
      it("should use custom base URL in requests", async () => {
        const mockData = { id: 1 };
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          json: async () => mockData,
        } as Response);

        const client = new ApiClient("https://api.example.com");
        await client.get("/test");

        expect(fetch).toHaveBeenCalledWith("https://api.example.com/test", expect.any(Object));
      });
    });
  });

  describe("apiClient", () => {
    it("should export a default ApiClient instance", () => {
      expect(apiClient).toBeInstanceOf(ApiClient);
    });

    it("should use default base URL", async () => {
      const mockData = { id: 1 };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      await apiClient.get("/test");

      expect(fetch).toHaveBeenCalledWith("http://localhost:3000/api/test", expect.any(Object));
    });
  });
});
