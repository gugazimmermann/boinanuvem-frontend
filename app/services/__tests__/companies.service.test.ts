import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getCompanyById,
  getCompanyByCNPJ,
  updateCompany,
  getCompany,
  type EnhancedCompany,
} from "../companies.service";
import { apiClient, ApiError } from "../api-client";
import { mockCompanies } from "~/mocks/companies";

// Mock the API client
vi.mock("../api-client", () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
  ApiError: class extends Error {
    constructor(
      message: string,
      public status: number
    ) {
      super(message);
      this.name = "ApiError";
    }
  },
}));

describe("companies.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCompanies.length = 0;
    mockCompanies.push(
      {
        id: "company-1",
        companyName: "Company 1",
        cnpj: "12.345.678/0001-90",
        email: "company1@test.com",
        phone: "1234567890",
        street: "Street 1",
        number: "123",
        complement: "",
        neighborhood: "Neighborhood 1",
        city: "City 1",
        state: "State 1",
        zipCode: "12345-678",
        createdAt: "2025-01-01",
      },
      {
        id: "company-2",
        companyName: "Company 2",
        cnpj: "98.765.432/0001-10",
        email: "company2@test.com",
        phone: "0987654321",
        street: "Street 2",
        number: "456",
        complement: "",
        neighborhood: "Neighborhood 2",
        city: "City 2",
        state: "State 2",
        zipCode: "98765-432",
        createdAt: "2025-01-02",
      }
    );
  });

  describe("getCompanyById", () => {
    it("should return company when ID exists", () => {
      const result = getCompanyById("company-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("company-1");
      expect(result?.companyName).toBe("Company 1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getCompanyById("company-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getCompanyById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getCompanyByCNPJ", () => {
    it("should return company when CNPJ exists (masked)", () => {
      const result = getCompanyByCNPJ("12.345.678/0001-90");
      expect(result).toBeDefined();
      expect(result?.id).toBe("company-1");
    });

    it("should return company when CNPJ exists (unmasked)", () => {
      const result = getCompanyByCNPJ("12345678000190");
      expect(result).toBeDefined();
      expect(result?.id).toBe("company-1");
    });

    it("should return undefined when CNPJ does not exist", () => {
      const result = getCompanyByCNPJ("11.111.111/0001-11");
      expect(result).toBeUndefined();
    });

    it("should handle CNPJ with different formatting", () => {
      const result = getCompanyByCNPJ("12.345.678/0001-90");
      expect(result).toBeDefined();
    });
  });

  describe("getCompany", () => {
    it("should return company when ID exists", async () => {
      const mockCompany: EnhancedCompany = {
        id: "company-1",
        cnpj: "12.345.678/0001-90",
        companyName: "Company 1",
        email: "company1@test.com",
        phone: "1234567890",
        street: "Street 1",
        number: "123",
        complement: "",
        neighborhood: "Neighborhood 1",
        city: "City 1",
        state: "State 1",
        zipCode: "12345-678",
        status: "active",
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
        trial: {
          isOnTrial: false,
          isTrialExpired: false,
          trialDaysRemaining: 0,
          trialStartDate: null,
          trialEndDate: null,
          trialStatus: null,
        },
        currentPlan: null,
        currentSubscription: null,
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockCompany);

      const result = await getCompany("company-1");

      expect(result).toEqual(mockCompany);
      expect(apiClient.get).toHaveBeenCalledWith("/companies/company-1");
    });

    it("should throw error on 404", async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new ApiError("Not found", 404));

      await expect(getCompany("nonexistent")).rejects.toThrow("Company not found");
    });

    it("should throw error on 403", async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(getCompany("company-1")).rejects.toThrow("Access denied to this company");
    });

    it("should throw original error for other status codes", async () => {
      const error = new ApiError("Server error", 500);
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(getCompany("company-1")).rejects.toThrow(error);
    });
  });

  describe("updateCompany", () => {
    it("should update company successfully", async () => {
      const mockUpdatedCompany: EnhancedCompany = {
        id: "company-1",
        cnpj: "12.345.678/0001-90",
        companyName: "Updated Company 1",
        email: "updated@test.com",
        phone: "1234567890",
        street: "Street 1",
        number: "123",
        complement: "",
        neighborhood: "Neighborhood 1",
        city: "City 1",
        state: "State 1",
        zipCode: "12345-678",
        status: "active",
        createdAt: "2025-01-01",
        updatedAt: "2025-01-02",
        trial: {
          isOnTrial: false,
          isTrialExpired: false,
          trialDaysRemaining: 0,
          trialStartDate: null,
          trialEndDate: null,
          trialStatus: null,
        },
        currentPlan: null,
        currentSubscription: null,
      };

      const updateData = {
        companyName: "Updated Company 1",
        email: "updated@test.com",
      };

      vi.mocked(apiClient.put).mockResolvedValue(mockUpdatedCompany);

      const result = await updateCompany("company-1", updateData);

      expect(result).toEqual(mockUpdatedCompany);
      expect(apiClient.put).toHaveBeenCalledWith("/companies/company-1", updateData);
    });

    it("should throw error on 404", async () => {
      vi.mocked(apiClient.put).mockRejectedValue(new ApiError("Not found", 404));

      await expect(updateCompany("nonexistent", { companyName: "Test" })).rejects.toThrow(
        "Company not found"
      );
    });

    it("should throw error on 403", async () => {
      vi.mocked(apiClient.put).mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(updateCompany("company-1", { companyName: "Test" })).rejects.toThrow(
        "Access denied. Only main users can update company information"
      );
    });

    it("should throw error on 409", async () => {
      vi.mocked(apiClient.put).mockRejectedValue(new ApiError("Conflict", 409));

      await expect(updateCompany("company-1", { email: "existing@test.com" })).rejects.toThrow(
        "Company with this email already exists"
      );
    });

    it("should throw original error for other status codes", async () => {
      const error = new ApiError("Server error", 500);
      vi.mocked(apiClient.put).mockRejectedValue(error);

      await expect(updateCompany("company-1", { companyName: "Test" })).rejects.toThrow(error);
    });
  });
});
