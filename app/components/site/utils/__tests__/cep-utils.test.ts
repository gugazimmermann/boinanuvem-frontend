import { describe, it, expect } from "vitest";
import { mapCEPDataToAddressForm } from "../cep-utils";
import type { CEPData, AddressFormData } from "~/types";

describe("mapCEPDataToAddressForm", () => {
  const mockCEPData: CEPData = {
    cep: "12345678",
    street: "Test Street",
    neighborhood: "Test Neighborhood",
    city: "Test City",
    state: "SP",
    service: "brasilapi",
    location: {
      type: "Point",
      coordinates: {},
    },
  };

  it("should map CEP data to address form", () => {
    const result = mapCEPDataToAddressForm(mockCEPData);

    expect(result.zipCode).toBe("12.345-678");
    expect(result.street).toBe("Test Street");
    expect(result.neighborhood).toBe("Test Neighborhood");
    expect(result.city).toBe("Test City");
    expect(result.state).toBe("SP");
    expect(result.number).toBe("");
    expect(result.complement).toBe("");
  });

  it("should preserve existing zipCode when provided", () => {
    const existingData: Partial<AddressFormData> = {
      zipCode: "98.765-432",
    };

    const result = mapCEPDataToAddressForm(mockCEPData, existingData);

    expect(result.zipCode).toBe("98.765-432");
  });

  it("should use CEP data zipCode when existing data has no zipCode", () => {
    const result = mapCEPDataToAddressForm(mockCEPData);

    expect(result.zipCode).toBe("12.345-678");
  });

  it("should preserve existing number", () => {
    const existingData: Partial<AddressFormData> = {
      number: "123",
    };

    const result = mapCEPDataToAddressForm(mockCEPData, existingData);

    expect(result.number).toBe("123");
  });

  it("should preserve existing complement", () => {
    const existingData: Partial<AddressFormData> = {
      complement: "Apt 101",
    };

    const result = mapCEPDataToAddressForm(mockCEPData, existingData);

    expect(result.complement).toBe("Apt 101");
  });

  it("should use existing data when CEP data is missing", () => {
    const existingData: Partial<AddressFormData> = {
      street: "Existing Street",
      city: "Existing City",
    };

    const incompleteCEPData: CEPData = {
      cep: "12345678",
      street: "",
      neighborhood: "",
      city: "",
      state: "",
      service: "brasilapi",
      location: {
        type: "Point",
        coordinates: {},
      },
    };

    const result = mapCEPDataToAddressForm(incompleteCEPData, existingData);

    expect(result.street).toBe("Existing Street");
    expect(result.city).toBe("Existing City");
  });

  it("should prioritize CEP data over existing data", () => {
    const existingData: Partial<AddressFormData> = {
      street: "Existing Street",
      city: "Existing City",
    };

    const result = mapCEPDataToAddressForm(mockCEPData, existingData);

    expect(result.street).toBe("Test Street");
    expect(result.city).toBe("Test City");
  });

  it("should handle empty CEP data", () => {
    const emptyCEPData: CEPData = {
      cep: "",
      street: "",
      neighborhood: "",
      city: "",
      state: "",
      service: "brasilapi",
      location: {
        type: "Point",
        coordinates: {},
      },
    };

    const result = mapCEPDataToAddressForm(emptyCEPData);

    expect(result.zipCode).toBe("");
    expect(result.street).toBe("");
    expect(result.neighborhood).toBe("");
    expect(result.city).toBe("");
    expect(result.state).toBe("");
  });

  it("should handle CEP data without cep field", () => {
    const cepDataWithoutCEP: CEPData = {
      cep: "",
      street: "Test Street",
      neighborhood: "Test Neighborhood",
      city: "Test City",
      state: "SP",
      service: "brasilapi",
      location: {
        type: "Point",
        coordinates: {},
      },
    };

    const existingData: Partial<AddressFormData> = {
      zipCode: "12.345-678",
    };

    const result = mapCEPDataToAddressForm(cepDataWithoutCEP, existingData);

    expect(result.zipCode).toBe("12.345-678");
    expect(result.street).toBe("Test Street");
  });

  it("should return empty strings for missing fields", () => {
    const minimalCEPData: CEPData = {
      cep: "12345678",
      street: "",
      neighborhood: "",
      city: "",
      state: "",
      service: "brasilapi",
      location: {
        type: "Point",
        coordinates: {},
      },
    };

    const result = mapCEPDataToAddressForm(minimalCEPData);

    expect(result.street).toBe("");
    expect(result.neighborhood).toBe("");
    expect(result.city).toBe("");
    expect(result.state).toBe("");
    expect(result.number).toBe("");
    expect(result.complement).toBe("");
  });
});
