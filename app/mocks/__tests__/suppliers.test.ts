import { describe, it, expect } from "vitest";
import {
  mockSuppliers,
  getSupplierById,
  getSuppliersByCompanyId,
  getSuppliersByPropertyId,
  addSupplier,
  deleteSupplier,
  updateSupplier,
} from "../suppliers";
import type { SupplierFormData } from "~/types";

describe("Suppliers Mock Functions", () => {
  const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";
  const PROPERTY_ID = "550e8400-e29b-41d4-a716-446655440010";

  describe("getSupplierById", () => {
    it("should return supplier by id", () => {
      if (mockSuppliers.length > 0) {
        const supplier = getSupplierById(mockSuppliers[0].id);
        expect(supplier).toBeDefined();
        expect(supplier?.id).toBe(mockSuppliers[0].id);
      }
    });

    it("should return undefined for non-existent id", () => {
      const supplier = getSupplierById("non-existent-id");
      expect(supplier).toBeUndefined();
    });

    it("should return undefined for undefined id", () => {
      const supplier = getSupplierById(undefined);
      expect(supplier).toBeUndefined();
    });
  });

  describe("getSuppliersByCompanyId", () => {
    it("should return suppliers for a company", () => {
      const suppliers = getSuppliersByCompanyId(COMPANY_ID);
      expect(Array.isArray(suppliers)).toBe(true);
      suppliers.forEach((supplier) => {
        expect(supplier.companyId).toBe(COMPANY_ID);
      });
    });

    it("should return empty array for non-existent company", () => {
      const suppliers = getSuppliersByCompanyId("non-existent-company");
      expect(suppliers).toEqual([]);
    });
  });

  describe("getSuppliersByPropertyId", () => {
    it("should return suppliers for a property", () => {
      const suppliers = getSuppliersByPropertyId(PROPERTY_ID);
      expect(Array.isArray(suppliers)).toBe(true);
      suppliers.forEach((supplier) => {
        expect(supplier.propertyIds).toContain(PROPERTY_ID);
      });
    });

    it("should return empty array for non-existent property", () => {
      const suppliers = getSuppliersByPropertyId("non-existent-property");
      expect(suppliers).toEqual([]);
    });
  });

  describe("addSupplier", () => {
    it("should add a new supplier", () => {
      const initialCount = mockSuppliers.length;
      const newSupplierData: SupplierFormData = {
        code: "999",
        name: "Test Supplier",
        cnpj: "12.345.678/0001-90",
        email: "test@example.com",
        phone: "47999999999",
        status: "active",
        companyId: COMPANY_ID,
        propertyIds: [PROPERTY_ID],
        street: "Test Street",
        number: "123",
        neighborhood: "Test Neighborhood",
        city: "Test City",
        state: "SC",
        zipCode: "12345678",
      };

      const added = addSupplier(newSupplierData);
      expect(added).toBeDefined();
      expect(added.id).toBeDefined();
      expect(added.createdAt).toBeDefined();
      expect(added.code).toBe(newSupplierData.code);
      expect(added.name).toBe(newSupplierData.name);
      expect(added.companyId).toBe(newSupplierData.companyId);
      expect(mockSuppliers.length).toBe(initialCount + 1);
    });
  });

  describe("deleteSupplier", () => {
    it("should delete a supplier by id", () => {
      const newSupplierData: SupplierFormData = {
        code: "DELETE",
        name: "Delete Supplier",
        cnpj: "98.765.432/0001-10",
        email: "delete@example.com",
        phone: "47988888888",
        status: "active",
        companyId: COMPANY_ID,
        propertyIds: [PROPERTY_ID],
        street: "Test Street",
        number: "456",
        neighborhood: "Test Neighborhood",
        city: "Test City",
        state: "SC",
        zipCode: "12345678",
      };

      const added = addSupplier(newSupplierData);
      const initialCount = mockSuppliers.length;
      const deleted = deleteSupplier(added.id);

      expect(deleted).toBe(true);
      expect(mockSuppliers.length).toBe(initialCount - 1);
      expect(getSupplierById(added.id)).toBeUndefined();
    });

    it("should return false for non-existent id", () => {
      const deleted = deleteSupplier("non-existent-id");
      expect(deleted).toBe(false);
    });
  });

  describe("updateSupplier", () => {
    it("should update a supplier", () => {
      const newSupplierData: SupplierFormData = {
        code: "UPDATE",
        name: "Update Supplier",
        cnpj: "11.222.333/0001-44",
        email: "update@example.com",
        phone: "47977777777",
        status: "active",
        companyId: COMPANY_ID,
        propertyIds: [PROPERTY_ID],
        street: "Test Street",
        number: "789",
        neighborhood: "Test Neighborhood",
        city: "Test City",
        state: "SC",
        zipCode: "12345678",
      };

      const added = addSupplier(newSupplierData);
      const updated = updateSupplier(added.id, { name: "Updated Supplier", status: "inactive" });

      expect(updated).toBe(true);
      const supplier = getSupplierById(added.id);
      expect(supplier?.name).toBe("Updated Supplier");
      expect(supplier?.status).toBe("inactive");
      expect(supplier?.code).toBe(newSupplierData.code);
    });

    it("should return false for non-existent id", () => {
      const updated = updateSupplier("non-existent-id", { name: "Test" });
      expect(updated).toBe(false);
    });
  });
});

