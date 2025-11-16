import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getSupplierById,
  getSuppliersByCompanyId,
  getSuppliersByPropertyId,
  addSupplier,
  updateSupplier,
  deleteSupplier,
} from "../suppliers.service";
import { mockSuppliers } from "~/mocks/suppliers";
import type { SupplierFormData } from "~/types";

vi.mock("~/mocks/suppliers", () => ({
  mockSuppliers: [],
}));

describe("suppliers.service", () => {
  beforeEach(() => {
    mockSuppliers.length = 0;
    mockSuppliers.push(
      {
        id: "990e8400-e29b-41d4-a716-446655440010",
        code: "SU001",
        name: "Supplier One",
        status: "active" as const,
        companyId: "company-1",
        propertyIds: ["property-1", "property-2"],
        createdAt: "2020-01-01",
      },
      {
        id: "990e8400-e29b-41d4-a716-446655440011",
        code: "SU002",
        name: "Supplier Two",
        status: "active" as const,
        companyId: "company-1",
        propertyIds: ["property-1"],
        createdAt: "2020-01-02",
      }
    );
  });

  describe("getSupplierById", () => {
    it("should return supplier when ID exists", () => {
      const result = getSupplierById("990e8400-e29b-41d4-a716-446655440010");
      expect(result).toBeDefined();
      expect(result?.name).toBe("Supplier One");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getSupplierById("nonexistent-id");
      expect(result).toBeUndefined();
    });
  });

  describe("getSuppliersByCompanyId", () => {
    it("should return suppliers for specific company", () => {
      const result = getSuppliersByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result.every((supplier) => supplier.companyId === "company-1")).toBe(true);
    });
  });

  describe("getSuppliersByPropertyId", () => {
    it("should return suppliers for specific property", () => {
      const result = getSuppliersByPropertyId("property-1");
      expect(result).toHaveLength(2);
      expect(result.every((supplier) => supplier.propertyIds?.includes("property-1"))).toBe(true);
    });
  });

  describe("addSupplier", () => {
    it("should add new supplier", () => {
      const formData: SupplierFormData = {
        code: "SU003",
        name: "New Supplier",
        status: "active" as const,
        companyId: "company-1",
        propertyIds: ["property-1"],
      };

      const initialLength = mockSuppliers.length;
      const result = addSupplier(formData);

      expect(mockSuppliers).toHaveLength(initialLength + 1);
      expect(result.name).toBe("New Supplier");
    });
  });

  describe("updateSupplier", () => {
    it("should update existing supplier", () => {
      const result = updateSupplier("990e8400-e29b-41d4-a716-446655440010", {
        name: "Updated Supplier",
      });

      expect(result).toBe(true);
      const updated = mockSuppliers.find((s) => s.id === "990e8400-e29b-41d4-a716-446655440010");
      expect(updated?.name).toBe("Updated Supplier");
    });
  });

  describe("deleteSupplier", () => {
    it("should delete existing supplier", () => {
      const initialLength = mockSuppliers.length;
      const result = deleteSupplier("990e8400-e29b-41d4-a716-446655440010");

      expect(result).toBe(true);
      expect(mockSuppliers).toHaveLength(initialLength - 1);
    });
  });
});
