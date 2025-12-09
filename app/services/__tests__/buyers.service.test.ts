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

import { getBuyers, getBuyerById, addBuyer, updateBuyer, deleteBuyer } from "../buyers.service";

describe("buyers.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBuyers", () => {
    it("should fetch all buyers", async () => {
      const mockBuyers = [
        { id: "1", code: "001", name: "Buyer 1", status: "active", propertyIds: [] },
      ];
      mockService.getAll.mockResolvedValue(mockBuyers);

      const result = await getBuyers();

      expect(mockService.getAll).toHaveBeenCalled();
      expect(result).toEqual(mockBuyers);
    });

    it("should propagate errors", async () => {
      const error = new Error("Network error");
      mockService.getAll.mockRejectedValue(error);

      await expect(getBuyers()).rejects.toThrow("Network error");
    });
  });

  describe("getBuyerById", () => {
    it("should fetch buyer by id", async () => {
      const mockBuyer = {
        id: "1",
        code: "001",
        name: "Buyer 1",
        status: "active",
        propertyIds: [],
      };
      mockService.getById.mockResolvedValue(mockBuyer);

      const result = await getBuyerById("1");

      expect(mockService.getById).toHaveBeenCalledWith("1");
      expect(result).toEqual(mockBuyer);
    });
  });

  describe("addBuyer", () => {
    it("should create buyer", async () => {
      const formData = {
        code: "001",
        name: "New Buyer",
        status: "active" as const,
        companyId: "company-1",
        propertyIds: [],
      };
      const mockBuyer = { id: "1", ...formData };
      mockService.add.mockResolvedValue(mockBuyer);

      const result = await addBuyer(formData);

      expect(mockService.add).toHaveBeenCalledWith(formData);
      expect(result).toEqual(mockBuyer);
    });
  });

  describe("updateBuyer", () => {
    it("should update buyer", async () => {
      const updateData = { name: "Updated Buyer" };
      const mockBuyer = {
        id: "1",
        code: "001",
        name: "Updated Buyer",
        status: "active",
        propertyIds: [],
      };
      mockService.update.mockResolvedValue(mockBuyer);

      const result = await updateBuyer("1", updateData);

      expect(mockService.update).toHaveBeenCalledWith("1", updateData);
      expect(result).toEqual(mockBuyer);
    });
  });

  describe("deleteBuyer", () => {
    it("should delete buyer", async () => {
      mockService.remove.mockResolvedValue(undefined);

      await deleteBuyer("1");

      expect(mockService.remove).toHaveBeenCalledWith("1");
    });
  });
});
