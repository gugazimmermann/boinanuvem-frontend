import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildAddressString, geocodeAddress } from "../geocoding";

describe("geocoding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

      const result = buildAddressString(address);
      expect(result).toBe("Rua Test, 123, Apto 45, Centro, São Paulo, SP, 12345678");
    });

    it("should build address string without optional fields", () => {
      const address = {
        street: "Rua Test",
        number: "123",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        zipCode: "12345678",
      };

      const result = buildAddressString(address);
      expect(result).toBe("Rua Test, 123, Centro, São Paulo, SP, 12345678");
    });

    it("should handle empty fields", () => {
      const address = {
        street: "",
        number: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
      };

      const result = buildAddressString(address);
      expect(result).toBe("");
    });

    it("should handle partial address", () => {
      const address = {
        street: "Rua Test",
        number: "123",
        neighborhood: "",
        city: "São Paulo",
        state: "SP",
        zipCode: "",
      };

      const result = buildAddressString(address);
      expect(result).toBe("Rua Test, 123, São Paulo, SP");
    });
  });

  describe("geocodeAddress", () => {
    it("should return error for incomplete address", async () => {
      const address = {
        street: "",
        number: "123",
        neighborhood: "Centro",
        city: "",
        state: "SP",
        zipCode: "12345678",
      };

      const result = await geocodeAddress(address);
      expect(result).toEqual({ error: "INCOMPLETE_ADDRESS" });
    });

    it("should return error when street is missing", async () => {
      const address = {
        street: "",
        number: "123",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        zipCode: "12345678",
      };

      const result = await geocodeAddress(address);
      expect(result).toEqual({ error: "INCOMPLETE_ADDRESS" });
    });

    it("should return error when city is missing", async () => {
      const address = {
        street: "Rua Test",
        number: "123",
        neighborhood: "Centro",
        city: "",
        state: "SP",
        zipCode: "12345678",
      };

      const result = await geocodeAddress(address);
      expect(result).toEqual({ error: "INCOMPLETE_ADDRESS" });
    });

    it("should return error when state is missing", async () => {
      const address = {
        street: "Rua Test",
        number: "123",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "",
        zipCode: "12345678",
      };

      const result = await geocodeAddress(address);
      expect(result).toEqual({ error: "INCOMPLETE_ADDRESS" });
    });

    it("should geocode address successfully", async () => {
      const mockResponse = [
        {
          lat: "-23.5505",
          lon: "-46.6333",
          display_name: "São Paulo, SP, Brazil",
        },
      ];

      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const address = {
        street: "Avenida Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
        zipCode: "01310100",
      };

      const result = await geocodeAddress(address);

      expect(result).toEqual({
        lat: "-23.5505",
        lon: "-46.6333",
        display_name: "São Paulo, SP, Brazil",
      });
    });

    it("should handle fetch error", async () => {
      vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

      const address = {
        street: "Rua Test",
        number: "123",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        zipCode: "12345678",
      };

      const result = await geocodeAddress(address);
      expect(result).toEqual({ error: "UNKNOWN_ERROR:Network error" });
    });

    it("should handle non-ok response", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: false,
        statusText: "Not Found",
      } as Response);

      const address = {
        street: "Rua Test",
        number: "123",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        zipCode: "12345678",
      };

      const result = await geocodeAddress(address);
      expect(result).toEqual({ error: "REQUEST_ERROR:Not Found" });
    });

    it("should try simplified address when first attempt fails", async () => {
      const mockResponse1: Array<Record<string, unknown>> = [];
      const mockResponse2 = [
        {
          lat: "-23.5505",
          lon: "-46.6333",
          display_name: "São Paulo, SP, Brazil",
        },
      ];

      vi.spyOn(global, "fetch")
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse1,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse2,
        } as Response);

      const address = {
        street: "Avenida Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
        zipCode: "01310100",
      };

      const result = await geocodeAddress(address);

      expect(result).toEqual({
        lat: "-23.5505",
        lon: "-46.6333",
        display_name: "São Paulo, SP, Brazil",
      });
    });

    it("should return error when address not found", async () => {
      vi.spyOn(global, "fetch")
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
          json: async () => [],
        } as Response);

      const address = {
        street: "Invalid Street",
        number: "999",
        neighborhood: "Nowhere",
        city: "Invalid City",
        state: "XX",
        zipCode: "00000000",
      };

      const result = await geocodeAddress(address);
      expect(result).toEqual({ error: "ADDRESS_NOT_FOUND" });
    });
  });
});
