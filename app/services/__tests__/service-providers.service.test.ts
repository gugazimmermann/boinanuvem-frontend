import { describe, it, expect, beforeEach, vi } from "vitest";

// Create mock service using vi.hoisted to make it available in the mock factory
const { mockService } = vi.hoisted(() => {
  const mockService = {
    getAll: vi.fn(),
    getById: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
  return { mockService };
});

// Mock entity-service-factory before importing the service
vi.mock("../entity-service-factory", () => {
  return {
    createEntityService: vi.fn(() => mockService),
  };
});

import {
  getServiceProviders,
  getServiceProviderById,
  addServiceProvider,
  updateServiceProvider,
  deleteServiceProvider,
} from "../service-providers.service";

describe("service-providers.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getServiceProviders", () => {
    it("should fetch all service providers", async () => {
      const mockProviders = [
        { id: "1", code: "001", name: "Provider 1", status: "active", propertyIds: [] },
      ];
      mockService.getAll.mockResolvedValue(mockProviders);

      const result = await getServiceProviders();

      expect(mockService.getAll).toHaveBeenCalled();
      expect(result).toEqual(mockProviders);
    });
  });

  describe("getServiceProviderById", () => {
    it("should fetch service provider by id", async () => {
      const mockProvider = {
        id: "1",
        code: "001",
        name: "Provider 1",
        status: "active",
        propertyIds: [],
      };
      mockService.getById.mockResolvedValue(mockProvider);

      const result = await getServiceProviderById("1");

      expect(mockService.getById).toHaveBeenCalledWith("1");
      expect(result).toEqual(mockProvider);
    });
  });

  describe("addServiceProvider", () => {
    it("should create service provider", async () => {
      const formData = {
        code: "001",
        name: "New Provider",
        status: "active" as const,
        companyId: "company-1",
        propertyIds: [],
      };
      const mockProvider = { id: "1", ...formData };
      mockService.add.mockResolvedValue(mockProvider);

      const result = await addServiceProvider(formData);

      expect(mockService.add).toHaveBeenCalledWith(formData);
      expect(result).toEqual(mockProvider);
    });
  });

  describe("updateServiceProvider", () => {
    it("should update service provider", async () => {
      const updateData = { name: "Updated Provider" };
      const mockProvider = {
        id: "1",
        code: "001",
        name: "Updated Provider",
        status: "active",
        propertyIds: [],
      };
      mockService.update.mockResolvedValue(mockProvider);

      const result = await updateServiceProvider("1", updateData);

      expect(mockService.update).toHaveBeenCalledWith("1", updateData);
      expect(result).toEqual(mockProvider);
    });
  });

  describe("deleteServiceProvider", () => {
    it("should delete service provider", async () => {
      mockService.remove.mockResolvedValue(undefined);

      await deleteServiceProvider("1");

      expect(mockService.remove).toHaveBeenCalledWith("1");
    });
  });
});
