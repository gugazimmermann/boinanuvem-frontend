import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildAddressString, geocodeAddress } from "../geocoding";

describe("buildAddressString", () => {
  it("should build address string with all fields", () => {
    const address = {
      street: "Test Street",
      number: "123",
      complement: "Apt 101",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
      zipCode: "12345678",
    };

    const result = buildAddressString(address);

    expect(result).toBe("Test Street, 123, Apt 101, Test Neighborhood, Test City, SP, 12345678");
  });

  it("should build address string without optional fields", () => {
    const address = {
      street: "Test Street",
      number: "",
      complement: "",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
      zipCode: "",
    };

    const result = buildAddressString(address);

    expect(result).toBe("Test Street, Test Neighborhood, Test City, SP");
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

    const result = buildAddressString(address);

    expect(result).toBe("");
  });

  it("should only include non-empty fields", () => {
    const address = {
      street: "Test Street",
      number: "",
      complement: "Apt 101",
      neighborhood: "",
      city: "Test City",
      state: "SP",
      zipCode: "",
    };

    const result = buildAddressString(address);

    expect(result).toBe("Test Street, Apt 101, Test City, SP");
  });
});

describe("geocodeAddress", () => {
  const originalFetch = global.fetch;
  const mockFetch = vi.fn();

  beforeEach(() => {
    global.fetch = mockFetch;
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should return error for incomplete address", async () => {
    const address = {
      street: "",
      number: "",
      neighborhood: "Test Neighborhood",
      city: "",
      state: "SP",
      zipCode: "",
    };

    const result = await geocodeAddress(address);

    expect(result).toEqual({ error: "INCOMPLETE_ADDRESS" });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should return error when missing street", async () => {
    const address = {
      street: "",
      number: "123",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
      zipCode: "12345678",
    };

    const result = await geocodeAddress(address);

    expect(result).toEqual({ error: "INCOMPLETE_ADDRESS" });
  });

  it("should return error when missing city", async () => {
    const address = {
      street: "Test Street",
      number: "123",
      neighborhood: "Test Neighborhood",
      city: "",
      state: "SP",
      zipCode: "12345678",
    };

    const result = await geocodeAddress(address);

    expect(result).toEqual({ error: "INCOMPLETE_ADDRESS" });
  });

  it("should return error when missing state", async () => {
    const address = {
      street: "Test Street",
      number: "123",
      neighborhood: "Test Neighborhood",
      city: "Test City",
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
        display_name: "Test Street, Test City, SP, Brazil",
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const address = {
      street: "Test Street",
      number: "123",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
      zipCode: "12345678",
    };

    const result = await geocodeAddress(address);

    expect(result).toEqual({
      lat: "-23.5505",
      lon: "-46.6333",
      display_name: "Test Street, Test City, SP, Brazil",
    });
  });

  it("should include number in street when provided", async () => {
    const mockResponse = [
      {
        lat: "-23.5505",
        lon: "-46.6333",
        display_name: "Test Street 123, Test City, SP, Brazil",
      },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const address = {
      street: "Test Street",
      number: "123",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
      zipCode: "12345678",
    };

    await geocodeAddress(address);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringMatching(/Test\+Street\+123|Test%20Street%20123/),
      expect.any(Object)
    );
  });

  it("should use fallback query when first query returns no results", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            lat: "-23.5505",
            lon: "-46.6333",
            display_name: "Test Street, Test City, SP, Brazil",
          },
        ],
      });

    const address = {
      street: "Test Street",
      number: "123",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
      zipCode: "12345678",
    };

    const result = await geocodeAddress(address);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      lat: "-23.5505",
      lon: "-46.6333",
      display_name: "Test Street, Test City, SP, Brazil",
    });
  });

  it("should use minimal address query when second query returns no results", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            lat: "-23.5505",
            lon: "-46.6333",
            display_name: "Test Street, Test City, SP",
          },
        ],
      });

    const address = {
      street: "Test Street",
      number: "123",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
      zipCode: "12345678",
    };

    const result = await geocodeAddress(address);

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(result).toEqual({
      lat: "-23.5505",
      lon: "-46.6333",
      display_name: "Test Street, Test City, SP",
    });
  });

  it("should return ADDRESS_NOT_FOUND when all queries fail", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const address = {
      street: "Test Street",
      number: "123",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
      zipCode: "12345678",
    };

    const result = await geocodeAddress(address);

    expect(result).toEqual({ error: "ADDRESS_NOT_FOUND" });
  });

  it("should return REQUEST_ERROR when fetch fails", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      statusText: "Not Found",
    });

    const address = {
      street: "Test Street",
      number: "123",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
      zipCode: "12345678",
    };

    const result = await geocodeAddress(address);

    expect(result).toEqual({ error: "REQUEST_ERROR:Not Found" });
  });

  it("should return UNKNOWN_ERROR when exception occurs", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const address = {
      street: "Test Street",
      number: "123",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
      zipCode: "12345678",
    };

    const result = await geocodeAddress(address);

    expect(result).toEqual({ error: "UNKNOWN_ERROR:Network error" });
  });

  it("should include User-Agent header", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          lat: "-23.5505",
          lon: "-46.6333",
          display_name: "Test",
        },
      ],
    });

    const address = {
      street: "Test Street",
      number: "123",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
      zipCode: "12345678",
    };

    await geocodeAddress(address);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          "User-Agent": "BoiNaNuvem/1.0",
        }),
      })
    );
  });
});
