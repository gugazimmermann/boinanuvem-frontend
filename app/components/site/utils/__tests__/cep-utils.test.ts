import { describe, it, expect } from "vitest";
import { mapCEPDataToAddressForm } from "../cep-utils";
import type { CEPData, AddressFormData } from "~/types";

describe("cep-utils", () => {
  describe("mapCEPDataToAddressForm", () => {
    it("should map CEP data to address form", () => {
      const cepData: CEPData = {
        cep: "12345678",
        street: "Rua Test",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        service: "viacep",
        location: {
          type: "Point",
          coordinates: {},
        },
      };

      const result = mapCEPDataToAddressForm(cepData);

      expect(result).toEqual({
        zipCode: "12.345-678",
        street: "Rua Test",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        number: "",
        complement: "",
      });
    });

    it("should use existing data when provided", () => {
      const cepData: CEPData = {
        cep: "12345678",
        street: "Rua Test",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        service: "viacep",
        location: {
          type: "Point",
          coordinates: {},
        },
      };

      const existingData: Partial<AddressFormData> = {
        zipCode: "12.345-678",
        number: "123",
        complement: "Apto 45",
      };

      const result = mapCEPDataToAddressForm(cepData, existingData);

      expect(result).toEqual({
        zipCode: "12.345-678",
        street: "Rua Test",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        number: "123",
        complement: "Apto 45",
      });
    });

    it("should handle missing CEP data", () => {
      const cepData: CEPData = {
        cep: "",
        street: "",
        neighborhood: "",
        city: "",
        state: "",
        service: "viacep",
        location: {
          type: "Point",
          coordinates: {},
        },
      };

      const result = mapCEPDataToAddressForm(cepData);

      expect(result).toEqual({
        zipCode: "",
        street: "",
        neighborhood: "",
        city: "",
        state: "",
        number: "",
        complement: "",
      });
    });

    it("should prioritize existing data over CEP data", () => {
      const cepData: CEPData = {
        cep: "12345678",
        street: "Rua Test",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        service: "viacep",
        location: {
          type: "Point",
          coordinates: {},
        },
      };

      const existingData: Partial<AddressFormData> = {
        street: "Existing Street",
        city: "Existing City",
      };

      const result = mapCEPDataToAddressForm(cepData, existingData);

      expect(result.street).toBe("Rua Test");
      expect(result.city).toBe("São Paulo");
    });
  });
});
