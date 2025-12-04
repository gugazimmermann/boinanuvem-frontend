import { describe, it, expect, beforeEach, vi } from "vitest";
import { PlansService, plansService, fetchPlans } from "../plans.service";
import { apiClient, ApiError } from "../api-client";
import type { Plan } from "~/types/plan";

// Mock the API client
vi.mock("../api-client", () => ({
  apiClient: {
    get: vi.fn(),
  },
  ApiError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = "ApiError";
    }
  },
}));

describe("plans.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console.error for error handling tests
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("PlansService", () => {
    describe("getPlans", () => {
      it("should fetch plans with default active status", async () => {
        const mockPlans: Plan[] = [
          {
            id: "plan-1",
            name: "Basic Plan",
            description: "Basic plan description",
            monthlyPrice: "100",
            annualPrice: "1000",
            limits: {
              properties: "1",
              locations: "10",
              animals: "100",
              members: "1",
            },
            features: [],
            popular: false,
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        vi.mocked(apiClient.get).mockResolvedValue(mockPlans);

        const service = new PlansService();
        const result = await service.getPlans();

        expect(apiClient.get).toHaveBeenCalledWith("/plans", { status: "active" });
        expect(result).toEqual(mockPlans);
      });

      it("should fetch plans with custom status", async () => {
        const mockPlans: Plan[] = [
          {
            id: "plan-1",
            name: "Basic Plan",
            description: "Basic plan description",
            monthlyPrice: "100",
            annualPrice: "1000",
            limits: {
              properties: "1",
              locations: "10",
              animals: "100",
              members: "1",
            },
            features: [],
            popular: false,
            status: "inactive",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        vi.mocked(apiClient.get).mockResolvedValue(mockPlans);

        const service = new PlansService();
        const result = await service.getPlans({ status: "inactive" });

        expect(apiClient.get).toHaveBeenCalledWith("/plans", { status: "inactive" });
        expect(result).toEqual(mockPlans);
      });

      it("should fetch all plans when status is 'all'", async () => {
        const mockPlans: Plan[] = [
          {
            id: "plan-1",
            name: "Basic Plan",
            description: "Basic plan description",
            monthlyPrice: "100",
            annualPrice: "1000",
            limits: {
              properties: "1",
              locations: "10",
              animals: "100",
              members: "1",
            },
            features: [],
            popular: false,
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        vi.mocked(apiClient.get).mockResolvedValue(mockPlans);

        const service = new PlansService();
        const result = await service.getPlans({ status: "all" });

        expect(apiClient.get).toHaveBeenCalledWith("/plans", { status: "all" });
        expect(result).toEqual(mockPlans);
      });

      it("should handle ApiError and throw with message", async () => {
        const error = new ApiError("Network error", 500);
        vi.mocked(apiClient.get).mockRejectedValue(error);

        const service = new PlansService();
        await expect(service.getPlans()).rejects.toThrow("Failed to fetch plans: Network error");
      });

      it("should handle unexpected errors", async () => {
        const error = new Error("Unexpected error");
        vi.mocked(apiClient.get).mockRejectedValue(error);

        const service = new PlansService();
        await expect(service.getPlans()).rejects.toThrow(
          "Failed to fetch plans due to unexpected error"
        );
      });
    });

    describe("getActivePlans", () => {
      it("should fetch only active plans", async () => {
        const mockPlans: Plan[] = [
          {
            id: "plan-1",
            name: "Basic Plan",
            description: "Basic plan description",
            monthlyPrice: "100",
            annualPrice: "1000",
            limits: {
              properties: "1",
              locations: "10",
              animals: "100",
              members: "1",
            },
            features: [],
            popular: false,
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        vi.mocked(apiClient.get).mockResolvedValue(mockPlans);

        const service = new PlansService();
        const result = await service.getActivePlans();

        expect(apiClient.get).toHaveBeenCalledWith("/plans", { status: "active" });
        expect(result).toEqual(mockPlans);
      });
    });

    describe("getAllPlans", () => {
      it("should fetch all plans regardless of status", async () => {
        const mockPlans: Plan[] = [
          {
            id: "plan-1",
            name: "Basic Plan",
            description: "Basic plan description",
            monthlyPrice: "100",
            annualPrice: "1000",
            limits: {
              properties: "1",
              locations: "10",
              animals: "100",
              members: "1",
            },
            features: [],
            popular: false,
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        vi.mocked(apiClient.get).mockResolvedValue(mockPlans);

        const service = new PlansService();
        const result = await service.getAllPlans();

        expect(apiClient.get).toHaveBeenCalledWith("/plans", { status: "all" });
        expect(result).toEqual(mockPlans);
      });
    });
  });

  describe("plansService instance", () => {
    it("should be an instance of PlansService", () => {
      expect(plansService).toBeInstanceOf(PlansService);
    });

    it("should fetch plans", async () => {
      const mockPlans: Plan[] = [
        {
          id: "plan-1",
          name: "Basic Plan",
          description: "Basic plan description",
          monthlyPrice: "100",
          annualPrice: "1000",
          limits: {
            properties: "1",
            locations: "10",
            animals: "100",
            members: "1",
          },
          features: [],
          popular: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: "active",
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue(mockPlans);

      const result = await plansService.getPlans();
      expect(result).toEqual(mockPlans);
    });
  });

  describe("fetchPlans", () => {
    it("should fetch plans with default active status", async () => {
      const mockPlans: Plan[] = [
        {
          id: "plan-1",
          name: "Basic Plan",
          description: "Basic plan description",
          monthlyPrice: "100",
          annualPrice: "1000",
          limits: {
            properties: "1",
            locations: "10",
            animals: "100",
            members: "1",
          },
          features: [],
          popular: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: "active",
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue(mockPlans);

      const result = await fetchPlans();

      expect(apiClient.get).toHaveBeenCalledWith("/plans", { status: "active" });
      expect(result).toEqual(mockPlans);
    });

    it("should fetch plans with custom params", async () => {
      const mockPlans: Plan[] = [
        {
          id: "plan-1",
          name: "Basic Plan",
          description: "Basic plan description",
          monthlyPrice: "100",
          annualPrice: "1000",
          limits: {
            properties: "1",
            locations: "10",
            animals: "100",
            members: "1",
          },
          features: [],
          popular: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: "inactive",
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue(mockPlans);

      const result = await fetchPlans({ status: "inactive" });

      expect(apiClient.get).toHaveBeenCalledWith("/plans", { status: "inactive" });
      expect(result).toEqual(mockPlans);
    });
  });
});
