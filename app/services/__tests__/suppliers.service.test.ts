import { describe, it, expect, beforeEach } from "vitest";
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

describe("suppliers.service", () => {
  beforeEach(() => {
    mockSuppliers.length = 0;
    mockSuppliers.push(
      {
        id: "990e8400-e29b-41d4-a716-446655440001",
        companyId: "company-1",
        propertyIds: ["property-1", "property-2"],
        code: "SUP001",
        name: "Supplier 1",
        email: "supplier1@test.com",
        phone: "1234567890",
        status: "active",
        createdAt: "2025-01-01",
      },
      {
        id: "990e8400-e29b-41d4-a716-446655440002",
        companyId: "company-1",
        propertyIds: ["property-2"],
        code: "SUP002",
        name: "Supplier 2",
        email: "supplier2@test.com",
        phone: "0987654321",
        status: "active",
        createdAt: "2025-01-02",
      },
      {
        id: "990e8400-e29b-41d4-a716-446655440003",
        companyId: "company-2",
        propertyIds: ["property-3"],
        code: "SUP003",
        name: "Supplier 3",
        email: "supplier3@test.com",
        phone: "5555555555",
        status: "inactive",
        createdAt: "2025-01-03",
      }
    );
  });

  describe("getSupplierById", () => {
    it("should return supplier when ID exists", () => {
      const result = getSupplierById("990e8400-e29b-41d4-a716-446655440001");
      expect(result).toBeDefined();
      expect(result?.id).toBe("990e8400-e29b-41d4-a716-446655440001");
      expect(result?.name).toBe("Supplier 1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getSupplierById("non-existent-id");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getSupplierById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getSuppliersByCompanyId", () => {
    it("should return all suppliers for a company", () => {
      const result = getSuppliersByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("990e8400-e29b-41d4-a716-446655440001");
      expect(result[1].id).toBe("990e8400-e29b-41d4-a716-446655440002");
    });

    it("should return empty array when no suppliers exist for company", () => {
      const result = getSuppliersByCompanyId("company-999");
      expect(result).toHaveLength(0);
    });
  });

  describe("getSuppliersByPropertyId", () => {
    it("should return all suppliers for a property", () => {
      const result = getSuppliersByPropertyId("property-2");
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("990e8400-e29b-41d4-a716-446655440001");
      expect(result[1].id).toBe("990e8400-e29b-41d4-a716-446655440002");
    });

    it("should return empty array when no suppliers exist for property", () => {
      const result = getSuppliersByPropertyId("property-999");
      expect(result).toHaveLength(0);
    });

    it("should return suppliers that have property in propertyIds array", () => {
      const result = getSuppliersByPropertyId("property-1");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("990e8400-e29b-41d4-a716-446655440001");
    });
  });

  describe("addSupplier", () => {
    it("should add a new supplier with generated ID", () => {
      const newSupplier: SupplierFormData = {
        companyId: "company-1",
        propertyIds: ["property-1"],
        code: "SUP004",
        name: "Supplier 4",
        email: "supplier4@test.com",
        phone: "1111111111",
        status: "active",
      };

      const result = addSupplier(newSupplier);

      expect(result.id).toMatch(/^990e8400-e29b-41d4-a716-/);
      expect(result.code).toBe("SUP004");
      expect(result.name).toBe("Supplier 4");
      expect(result.companyId).toBe("company-1");
      expect(result.propertyIds).toEqual(["property-1"]);
      expect(result.status).toBe("active");
      expect(result.createdAt).toBeDefined();
      expect(mockSuppliers).toHaveLength(4);
    });

    it("should use default ID when no suppliers exist", () => {
      mockSuppliers.length = 0;
      const newSupplier: SupplierFormData = {
        companyId: "company-1",
        propertyIds: [],
        code: "SUP001",
        name: "First Supplier",
        status: "active",
      };

      const result = addSupplier(newSupplier);

      expect(result.id).toBe("990e8400-e29b-41d4-a716-446655440009");
    });
  });

  describe("updateSupplier", () => {
    it("should update an existing supplier", () => {
      const updateData: Partial<SupplierFormData> = {
        name: "Updated Supplier",
        email: "updated@test.com",
      };

      const result = updateSupplier("990e8400-e29b-41d4-a716-446655440001", updateData);

      expect(result).toBe(true);
      const updated = mockSuppliers.find((s) => s.id === "990e8400-e29b-41d4-a716-446655440001");
      expect(updated?.name).toBe("Updated Supplier");
      expect(updated?.email).toBe("updated@test.com");
    });

    it("should return false when supplier does not exist", () => {
      const updateData: Partial<SupplierFormData> = {
        name: "Updated Name",
      };

      const result = updateSupplier("non-existent-id", updateData);

      expect(result).toBe(false);
    });

    it("should update only provided fields", () => {
      const original = { ...mockSuppliers[0] };
      const updateData: Partial<SupplierFormData> = {
        status: "inactive",
      };

      updateSupplier("990e8400-e29b-41d4-a716-446655440001", updateData);

      const updated = mockSuppliers.find((s) => s.id === "990e8400-e29b-41d4-a716-446655440001");
      expect(updated?.status).toBe("inactive");
      expect(updated?.code).toBe(original.code);
      expect(updated?.name).toBe(original.name);
    });
  });

  describe("deleteSupplier", () => {
    it("should delete an existing supplier", () => {
      const result = deleteSupplier("990e8400-e29b-41d4-a716-446655440001");
      expect(result).toBe(true);
      expect(mockSuppliers).toHaveLength(2);
      expect(
        mockSuppliers.find((s) => s.id === "990e8400-e29b-41d4-a716-446655440001")
      ).toBeUndefined();
    });

    it("should return false when supplier does not exist", () => {
      const result = deleteSupplier("non-existent-id");
      expect(result).toBe(false);
      expect(mockSuppliers).toHaveLength(3);
    });
  });
});
