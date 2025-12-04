import { describe, it, expect, vi, beforeEach } from "vitest";
import { mapCEPDataToAddressForm } from "../cep-utils";
import { maskCEP } from "../masks";
import type { CEPData, AddressFormData } from "~/types";

vi.mock("../masks", () => ({
  maskCEP: vi.fn(),
}));

describe("cep-utils", () => {
  describe("mapCEPDataToAddressForm", () => {
    const mockCEPData: CEPData = {
      cep: "12345678",
      street: "Rua Test",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      service: "standard",
      location: {
        type: "Point",
        coordinates: {},
      },
    };

    beforeEach(() => {
      vi.clearAllMocks();
      vi.mocked(maskCEP).mockImplementation((value: string) => {
        const numbers = value.replaceAll(/\D/g, "");
        if (numbers.length === 0) return "";
        if (numbers.length <= 2) return numbers;
        if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
        return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}-${numbers.slice(5, 8)}`;
      });
    });

    it("should map CEP data to address form", () => {
      const result = mapCEPDataToAddressForm(mockCEPData);

      expect(result.street).toBe("Rua Test");
      expect(result.neighborhood).toBe("Centro");
      expect(result.city).toBe("São Paulo");
      expect(result.state).toBe("SP");
      expect(maskCEP).toHaveBeenCalledWith("12345678");
    });

    it("should use existing zipCode when provided", () => {
      const existingData: Partial<AddressFormData> = {
        zipCode: "12.345-678",
      };

      const result = mapCEPDataToAddressForm(mockCEPData, existingData);

      expect(result.zipCode).toBe("12.345-678");
      expect(maskCEP).not.toHaveBeenCalled();
    });

    it("should use CEP data zipCode when existing zipCode is not provided", () => {
      vi.mocked(maskCEP).mockReturnValue("12.345-678");

      const result = mapCEPDataToAddressForm(mockCEPData);

      expect(result.zipCode).toBe("12.345-678");
      expect(maskCEP).toHaveBeenCalledWith("12345678");
    });

    it("should use empty string for zipCode when CEP is not provided", () => {
      const dataWithoutCEP: CEPData = {
        ...mockCEPData,
        cep: "",
      };

      const result = mapCEPDataToAddressForm(dataWithoutCEP);

      expect(result.zipCode).toBe("");
    });

    it("should preserve existing number and complement", () => {
      const existingData: Partial<AddressFormData> = {
        number: "123",
        complement: "Apto 45",
      };

      const result = mapCEPDataToAddressForm(mockCEPData, existingData);

      expect(result.number).toBe("123");
      expect(result.complement).toBe("Apto 45");
    });

    it("should use empty string for number and complement when not provided", () => {
      const result = mapCEPDataToAddressForm(mockCEPData);

      expect(result.number).toBe("");
      expect(result.complement).toBe("");
    });

    it("should prioritize CEP data over existing data for address fields", () => {
      const existingData: Partial<AddressFormData> = {
        street: "Existing Street",
        neighborhood: "Existing Neighborhood",
        city: "Existing City",
        state: "RJ",
      };

      const result = mapCEPDataToAddressForm(mockCEPData, existingData);

      // The function uses data.field || existingData?.field, so CEP data takes priority
      expect(result.street).toBe("Rua Test");
      expect(result.neighborhood).toBe("Centro");
      expect(result.city).toBe("São Paulo");
      expect(result.state).toBe("SP");
    });

    it("should use CEP data when existing data is empty", () => {
      const existingData: Partial<AddressFormData> = {
        street: "",
        neighborhood: "",
        city: "",
        state: "",
      };

      const result = mapCEPDataToAddressForm(mockCEPData, existingData);

      expect(result.street).toBe("Rua Test");
      expect(result.neighborhood).toBe("Centro");
      expect(result.city).toBe("São Paulo");
      expect(result.state).toBe("SP");
    });

    it("should handle partial CEP data", () => {
      const partialData: CEPData = {
        cep: "12345678",
        street: "",
        neighborhood: "Centro",
        city: "",
        state: "SP",
        service: "standard",
        location: {
          type: "Point",
          coordinates: {},
        },
      };

      const result = mapCEPDataToAddressForm(partialData);

      expect(result.street).toBe("");
      expect(result.neighborhood).toBe("Centro");
      expect(result.city).toBe("");
      expect(result.state).toBe("SP");
    });

    it("should handle empty existing data", () => {
      const result = mapCEPDataToAddressForm(mockCEPData, {});

      expect(result.street).toBe("Rua Test");
      expect(result.neighborhood).toBe("Centro");
      expect(result.city).toBe("São Paulo");
      expect(result.state).toBe("SP");
    });

    it("should handle undefined existing data", () => {
      const result = mapCEPDataToAddressForm(mockCEPData, undefined);

      expect(result.street).toBe("Rua Test");
      expect(result.neighborhood).toBe("Centro");
      expect(result.city).toBe("São Paulo");
      expect(result.state).toBe("SP");
    });
  });
});
