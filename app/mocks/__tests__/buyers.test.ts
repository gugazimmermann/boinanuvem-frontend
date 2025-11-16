import { describe, it, expect } from "vitest";
import {
  mockBuyers,
  getBuyerById,
  getBuyersByCompanyId,
  getBuyersByPropertyId,
  addBuyer,
  deleteBuyer,
  updateBuyer,
} from "../buyers";
import type { BuyerFormData } from "~/types";

describe("Buyers Mock Functions", () => {
  const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";
  const PROPERTY_ID = "550e8400-e29b-41d4-a716-446655440010";

  describe("getBuyerById", () => {
    it("should return buyer by id", () => {
      if (mockBuyers.length > 0) {
        const buyer = getBuyerById(mockBuyers[0].id);
        expect(buyer).toBeDefined();
        expect(buyer?.id).toBe(mockBuyers[0].id);
      }
    });

    it("should return undefined for non-existent id", () => {
      const buyer = getBuyerById("non-existent-id");
      expect(buyer).toBeUndefined();
    });

    it("should return undefined for undefined id", () => {
      const buyer = getBuyerById(undefined);
      expect(buyer).toBeUndefined();
    });
  });

  describe("getBuyersByCompanyId", () => {
    it("should return buyers for a company", () => {
      const buyers = getBuyersByCompanyId(COMPANY_ID);
      expect(Array.isArray(buyers)).toBe(true);
      buyers.forEach((buyer) => {
        expect(buyer.companyId).toBe(COMPANY_ID);
      });
    });

    it("should return empty array for non-existent company", () => {
      const buyers = getBuyersByCompanyId("non-existent-company");
      expect(buyers).toEqual([]);
    });
  });

  describe("getBuyersByPropertyId", () => {
    it("should return buyers for a property", () => {
      const buyers = getBuyersByPropertyId(PROPERTY_ID);
      expect(Array.isArray(buyers)).toBe(true);
      buyers.forEach((buyer) => {
        expect(buyer.propertyIds).toContain(PROPERTY_ID);
      });
    });

    it("should return empty array for non-existent property", () => {
      const buyers = getBuyersByPropertyId("non-existent-property");
      expect(buyers).toEqual([]);
    });
  });

  describe("addBuyer", () => {
    it("should add a new buyer", () => {
      const initialCount = mockBuyers.length;
      const newBuyerData: BuyerFormData = {
        code: "999",
        name: "Test Buyer",
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

      const added = addBuyer(newBuyerData);
      expect(added).toBeDefined();
      expect(added.id).toBeDefined();
      expect(added.createdAt).toBeDefined();
      expect(added.code).toBe(newBuyerData.code);
      expect(added.name).toBe(newBuyerData.name);
      expect(added.companyId).toBe(newBuyerData.companyId);
      expect(mockBuyers.length).toBe(initialCount + 1);
    });
  });

  describe("deleteBuyer", () => {
    it("should delete a buyer by id", () => {
      const newBuyerData: BuyerFormData = {
        code: "DELETE",
        name: "Delete Buyer",
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

      const added = addBuyer(newBuyerData);
      const initialCount = mockBuyers.length;
      const deleted = deleteBuyer(added.id);

      expect(deleted).toBe(true);
      expect(mockBuyers.length).toBe(initialCount - 1);
      expect(getBuyerById(added.id)).toBeUndefined();
    });

    it("should return false for non-existent id", () => {
      const deleted = deleteBuyer("non-existent-id");
      expect(deleted).toBe(false);
    });
  });

  describe("updateBuyer", () => {
    it("should update a buyer", () => {
      const newBuyerData: BuyerFormData = {
        code: "UPDATE",
        name: "Update Buyer",
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

      const added = addBuyer(newBuyerData);
      const updated = updateBuyer(added.id, { name: "Updated Buyer", status: "inactive" });

      expect(updated).toBe(true);
      const buyer = getBuyerById(added.id);
      expect(buyer?.name).toBe("Updated Buyer");
      expect(buyer?.status).toBe("inactive");
      expect(buyer?.code).toBe(newBuyerData.code);
    });

    it("should return false for non-existent id", () => {
      const updated = updateBuyer("non-existent-id", { name: "Test" });
      expect(updated).toBe(false);
    });
  });
});

