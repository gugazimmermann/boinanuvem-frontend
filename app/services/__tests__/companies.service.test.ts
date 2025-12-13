import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiError } from "../api-client";
import { getCompany, updateCompany, getCompanyById, getCompanyByCNPJ } from "../companies.service";

vi.mock("../api-client", async () => {
  const actual = await vi.importActual("../api-client");
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      put: vi.fn(),
    },
  };
});

const { mockCompanies } = vi.hoisted(() => {
  const mockCompanies = [
    {
      id: "company-1",
      cnpj: "12345678000190",
      companyName: "Test Company",
      status: "active",
    },
    {
      id: "company-2",
      cnpj: "98765432000110",
      companyName: "Another Company",
      status: "active",
    },
  ];
  return { mockCompanies };
});

vi.mock("~/mocks/companies", () => ({
  mockCompanies,
}));

import { apiClient } from "../api-client";

describe("companies.service", () => {
  const mockGet = apiClient.get as ReturnType<typeof vi.fn>;
  const mockPut = apiClient.put as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCompany", () => {
    it("should fetch company successfully", async () => {
      const mockCompany = {
        id: "company-1",
        cnpj: "12345678000190",
        companyName: "Test Company",
        email: "test@company.com",
        phone: "11987654321",
        street: "Main St",
        number: "123",
        neighborhood: "Downtown",
        city: "São Paulo",
        state: "SP",
        zipCode: "01234567",
        status: "active",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
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
      mockGet.mockResolvedValue(mockCompany);

      const result = await getCompany("company-1");

      expect(mockGet).toHaveBeenCalledWith("/companies/company-1");
      expect(result).toEqual(mockCompany);
    });

    it("should throw error on 404", async () => {
      mockGet.mockRejectedValue(new ApiError("Not Found", 404));

      await expect(getCompany("company-1")).rejects.toThrow("Company not found");
    });

    it("should throw error on 403", async () => {
      mockGet.mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(getCompany("company-1")).rejects.toThrow("Access denied to this company");
    });
  });

  describe("updateCompany", () => {
    const updateData = {
      companyName: "Updated Company",
      email: "updated@company.com",
    };

    it("should update company successfully", async () => {
      const mockCompany = {
        id: "company-1",
        ...updateData,
        cnpj: "12345678000190",
        status: "active",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
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
      mockPut.mockResolvedValue(mockCompany);

      const result = await updateCompany("company-1", updateData);

      expect(mockPut).toHaveBeenCalledWith("/companies/company-1", updateData);
      expect(result).toEqual(mockCompany);
    });

    it("should throw error on 404", async () => {
      mockPut.mockRejectedValue(new ApiError("Not Found", 404));

      await expect(updateCompany("company-1", updateData)).rejects.toThrow("Company not found");
    });

    it("should throw error on 403", async () => {
      mockPut.mockRejectedValue(new ApiError("Forbidden", 403));

      await expect(updateCompany("company-1", updateData)).rejects.toThrow(
        "Access denied. Only main users can update company information"
      );
    });

    it("should throw error on 409", async () => {
      mockPut.mockRejectedValue(new ApiError("Conflict", 409));

      await expect(updateCompany("company-1", updateData)).rejects.toThrow(
        "Company with this email already exists"
      );
    });
  });

  describe("getCompanyById", () => {
    it("should find company by id", () => {
      const result = getCompanyById("company-1");
      expect(result).toEqual(mockCompanies[0]);
    });

    it("should return undefined when not found", () => {
      const result = getCompanyById("nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when id is undefined", () => {
      const result = getCompanyById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getCompanyByCNPJ", () => {
    it("should find company by CNPJ", () => {
      const result = getCompanyByCNPJ("12.345.678/0001-90");
      expect(result).toEqual(mockCompanies[0]);
    });

    it("should find company by unmasked CNPJ", () => {
      const result = getCompanyByCNPJ("12345678000190");
      expect(result).toEqual(mockCompanies[0]);
    });

    it("should return undefined when not found", () => {
      const result = getCompanyByCNPJ("00000000000000");
      expect(result).toBeUndefined();
    });
  });
});
