import { describe, it, expect, beforeEach, vi } from "vitest";
import { ApiError } from "../api-client";
import { PlansService, plansService, fetchPlans } from "../plans.service";

vi.mock("../api-client", async () => {
  const actual = await vi.importActual("../api-client");
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
    },
  };
});

import { apiClient } from "../api-client";

describe("plans.service", () => {
  let service: PlansService;
  const mockGet = apiClient.get as ReturnType<typeof vi.fn>;
  const originalConsoleError = console.error;

  beforeEach(() => {
    service = new PlansService();
    vi.clearAllMocks();
    // Suppress console.error during tests
    console.error = vi.fn();
  });

  afterEach(() => {
    // Restore console.error after tests
    console.error = originalConsoleError;
  });

  describe("getPlans", () => {
    it("should fetch plans successfully", async () => {
      const mockPlans = [{ id: "plan-1", name: "Basic Plan", price: 100, status: "active" }];
      mockGet.mockResolvedValue(mockPlans);

      const result = await service.getPlans();

      expect(mockGet).toHaveBeenCalledWith("/plans", { status: "active" });
      expect(result).toEqual(mockPlans);
    });

    it("should use provided params", async () => {
      const mockPlans = [{ id: "plan-1", name: "Basic Plan", price: 100 }];
      mockGet.mockResolvedValue(mockPlans);

      await service.getPlans({ status: "all" });

      expect(mockGet).toHaveBeenCalledWith("/plans", { status: "all" });
    });

    it("should throw error on API failure", async () => {
      mockGet.mockRejectedValue(new ApiError("Server Error", 500));

      await expect(service.getPlans()).rejects.toThrow("Failed to fetch plans: Server Error");
    });
  });

  describe("getActivePlans", () => {
    it("should fetch active plans", async () => {
      const mockPlans = [{ id: "plan-1", name: "Basic Plan", status: "active" }];
      mockGet.mockResolvedValue(mockPlans);

      const result = await service.getActivePlans();

      expect(mockGet).toHaveBeenCalledWith("/plans", { status: "active" });
      expect(result).toEqual(mockPlans);
    });
  });

  describe("getAllPlans", () => {
    it("should fetch all plans", async () => {
      const mockPlans = [
        { id: "plan-1", name: "Basic Plan", status: "active" },
        { id: "plan-2", name: "Premium Plan", status: "inactive" },
      ];
      mockGet.mockResolvedValue(mockPlans);

      const result = await service.getAllPlans();

      expect(mockGet).toHaveBeenCalledWith("/plans", { status: "all" });
      expect(result).toEqual(mockPlans);
    });
  });

  describe("plansService singleton", () => {
    it("should be an instance of PlansService", () => {
      expect(plansService).toBeInstanceOf(PlansService);
    });
  });

  describe("fetchPlans", () => {
    it("should fetch plans using singleton", async () => {
      const mockPlans = [{ id: "plan-1", name: "Basic Plan" }];
      mockGet.mockResolvedValue(mockPlans);

      const result = await fetchPlans();

      expect(mockGet).toHaveBeenCalledWith("/plans", { status: "active" });
      expect(result).toEqual(mockPlans);
    });
  });
});
