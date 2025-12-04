import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildAddressString, geocodeAddress } from "../geocoding";

describe("geocoding", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("buildAddressString", () => {
    it("should build address string with all fields", () => {
      const address = {
        street: "Rua Test",
        number: "123",
        complement: "Apto 45",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        zipCode: "12345678",
      };

      expect(buildAddressString(address)).toBe(
        "Rua Test, 123, Apto 45, Centro, São Paulo, SP, 12345678"
      );
    });

    it("should build address string without complement", () => {
      const address = {
        street: "Rua Test",
        number: "123",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        zipCode: "12345678",
      };

      expect(buildAddressString(address)).toBe("Rua Test, 123, Centro, São Paulo, SP, 12345678");
    });

    it("should build address string with empty fields", () => {
      const address = {
        street: "Rua Test",
        number: "",
        complement: "",
        neighborhood: "",
        city: "São Paulo",
        state: "SP",
        zipCode: "",
      };

      expect(buildAddressString(address)).toBe("Rua Test, São Paulo, SP");
    });

    it("should handle only required fields", () => {
      const address = {
        street: "Rua Test",
        number: "123",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        zipCode: "12345678",
      };

      expect(buildAddressString(address)).toBe("Rua Test, 123, Centro, São Paulo, SP, 12345678");
    });

    it("should handle empty address", () => {
      const address = {
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
      };

      expect(buildAddressString(address)).toBe("");
    });
  });

  describe("geocodeAddress", () => {
    const mockAddress = {
      street: "Rua Test",
      number: "123",
      complement: "Apto 45",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zipCode: "12345678",
    };

    it("should return error for incomplete address without street", async () => {
      const address = {
        ...mockAddress,
        street: "",
      };

      const result = await geocodeAddress(address);

      expect(result).toEqual({ error: "INCOMPLETE_ADDRESS" });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should return error for incomplete address without city", async () => {
      const address = {
        ...mockAddress,
        city: "",
      };

      const result = await geocodeAddress(address);

      expect(result).toEqual({ error: "INCOMPLETE_ADDRESS" });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should return error for incomplete address without state", async () => {
      const address = {
        ...mockAddress,
        state: "",
      };

      const result = await geocodeAddress(address);

      expect(result).toEqual({ error: "INCOMPLETE_ADDRESS" });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should geocode address successfully", async () => {
      const mockResponse = [
        {
          lat: "-23.5505",
          lon: "-46.6333",
          display_name: "Rua Test, 123, Centro, São Paulo, SP, Brazil",
        },
      ];

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await geocodeAddress(mockAddress);

      expect(result).toEqual({
        lat: "-23.5505",
        lon: "-46.6333",
        display_name: "Rua Test, 123, Centro, São Paulo, SP, Brazil",
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("nominatim.openstreetmap.org"),
        expect.objectContaining({
          headers: {
            "User-Agent": "BoiNaNuvem/1.0",
          },
        })
      );
    });

    it("should include number in street when provided", async () => {
      const mockResponse = [
        {
          lat: "-23.5505",
          lon: "-46.6333",
          display_name: "Rua Test, 123",
        },
      ];

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await geocodeAddress(mockAddress);

      const fetchCall = vi.mocked(global.fetch).mock.calls[0]?.[0];
      expect(typeof fetchCall).toBe("string");
      // URLSearchParams encodes values, spaces become + or %20
      const url = new URL(fetchCall as string);
      const streetParam = url.searchParams.get("street");
      expect(streetParam).toBe("Rua Test 123");
    });

    it("should not include number in street when not provided", async () => {
      const addressWithoutNumber = {
        ...mockAddress,
        number: "",
      };

      const mockResponse = [
        {
          lat: "-23.5505",
          lon: "-46.6333",
          display_name: "Rua Test",
        },
      ];

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await geocodeAddress(addressWithoutNumber);

      const fetchCall = vi.mocked(global.fetch).mock.calls[0]?.[0];
      expect(typeof fetchCall).toBe("string");
      const url = new URL(fetchCall as string);
      const streetParam = url.searchParams.get("street");
      expect(streetParam).toBe("Rua Test");
      expect(streetParam).not.toContain("123");
    });

    it("should retry with simple address when first request returns no results", async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            {
              lat: "-23.5505",
              lon: "-46.6333",
              display_name: "Rua Test, São Paulo, SP, Brazil",
            },
          ],
        } as Response);

      const result = await geocodeAddress(mockAddress);

      expect(result).toEqual({
        lat: "-23.5505",
        lon: "-46.6333",
        display_name: "Rua Test, São Paulo, SP, Brazil",
      });

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it("should retry with minimal address when second request returns no results", async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            {
              lat: "-23.5505",
              lon: "-46.6333",
              display_name: "Rua Test, São Paulo, SP",
            },
          ],
        } as Response);

      const result = await geocodeAddress(mockAddress);

      expect(result).toEqual({
        lat: "-23.5505",
        lon: "-46.6333",
        display_name: "Rua Test, São Paulo, SP",
      });

      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it("should return error when all requests return no results", async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

      const result = await geocodeAddress(mockAddress);

      expect(result).toEqual({ error: "ADDRESS_NOT_FOUND" });
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it("should handle fetch error", async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network error"));

      const result = await geocodeAddress(mockAddress);

      expect(result).toEqual({ error: "UNKNOWN_ERROR:Network error" });
    });

    it("should handle non-ok response", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        statusText: "Not Found",
      } as Response);

      const result = await geocodeAddress(mockAddress);

      expect(result).toEqual({ error: "REQUEST_ERROR:Not Found" });
    });

    it("should handle non-ok response in retry", async () => {
      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          statusText: "Not Found",
        } as Response);

      const result = await geocodeAddress(mockAddress);

      expect(result).toEqual({ error: "REQUEST_ERROR:Not Found" });
    });

    it("should handle non-Error rejection", async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce("String error");

      const result = await geocodeAddress(mockAddress);

      expect(result).toEqual({ error: "UNKNOWN_ERROR" });
    });

    it("should use correct User-Agent header", async () => {
      const mockResponse = [
        {
          lat: "-23.5505",
          lon: "-46.6333",
          display_name: "Test",
        },
      ];

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await geocodeAddress(mockAddress);

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      expect(fetchCall[1]).toEqual({
        headers: {
          "User-Agent": "BoiNaNuvem/1.0",
        },
      });
    });

    it("should include correct query parameters", async () => {
      const mockResponse = [
        {
          lat: "-23.5505",
          lon: "-46.6333",
          display_name: "Test",
        },
      ];

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await geocodeAddress(mockAddress);

      const fetchCall = vi.mocked(global.fetch).mock.calls[0]?.[0];
      expect(typeof fetchCall).toBe("string");
      const url = new URL(fetchCall as string);

      expect(url.searchParams.get("format")).toBe("json");
      expect(url.searchParams.get("limit")).toBe("1");
      expect(url.searchParams.get("addressdetails")).toBe("1");
      expect(url.searchParams.get("street")).toBe("Rua Test 123");
      expect(url.searchParams.get("city")).toBe("São Paulo");
      expect(url.searchParams.get("state")).toBe("SP");
      expect(url.searchParams.get("country")).toBe("Brazil");
    });
  });
});
