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
  getSuppliers,
  getSupplierById,
  addSupplier,
  updateSupplier,
  deleteSupplier,
} from "../suppliers.service";

describe("suppliers.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSuppliers", () => {
    it("should fetch all suppliers", async () => {
      const mockSuppliers = [
        { id: "1", code: "001", name: "Supplier 1", status: "active", propertyIds: [] },
      ];
      mockService.getAll.mockResolvedValue(mockSuppliers);

      const result = await getSuppliers();

      expect(mockService.getAll).toHaveBeenCalled();
      expect(result).toEqual(mockSuppliers);
    });
  });

  describe("getSupplierById", () => {
    it("should fetch supplier by id", async () => {
      const mockSupplier = {
        id: "1",
        code: "001",
        name: "Supplier 1",
        status: "active",
        propertyIds: [],
      };
      mockService.getById.mockResolvedValue(mockSupplier);

      const result = await getSupplierById("1");

      expect(mockService.getById).toHaveBeenCalledWith("1");
      expect(result).toEqual(mockSupplier);
    });
  });

  describe("addSupplier", () => {
    it("should create supplier", async () => {
      const formData = {
        code: "001",
        name: "New Supplier",
        status: "active" as const,
        companyId: "company-1",
        propertyIds: [],
      };
      const mockSupplier = { id: "1", ...formData };
      mockService.add.mockResolvedValue(mockSupplier);

      const result = await addSupplier(formData);

      expect(mockService.add).toHaveBeenCalledWith(formData);
      expect(result).toEqual(mockSupplier);
    });
  });

  describe("updateSupplier", () => {
    it("should update supplier", async () => {
      const updateData = { name: "Updated Supplier" };
      const mockSupplier = {
        id: "1",
        code: "001",
        name: "Updated Supplier",
        status: "active",
        propertyIds: [],
      };
      mockService.update.mockResolvedValue(mockSupplier);

      const result = await updateSupplier("1", updateData);

      expect(mockService.update).toHaveBeenCalledWith("1", updateData);
      expect(result).toEqual(mockSupplier);
    });
  });

  describe("deleteSupplier", () => {
    it("should delete supplier", async () => {
      mockService.remove.mockResolvedValue(undefined);

      await deleteSupplier("1");

      expect(mockService.remove).toHaveBeenCalledWith("1");
    });
  });
});
