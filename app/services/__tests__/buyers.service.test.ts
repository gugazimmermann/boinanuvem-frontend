import { describe, it, expect, beforeEach } from "vitest";
import {
  getBuyerById,
  getBuyersByCompanyId,
  getBuyersByPropertyId,
  addBuyer,
  updateBuyer,
  deleteBuyer,
} from "../buyers.service";
import { mockBuyers } from "~/mocks/buyers";
import type { BuyerFormData } from "~/types";

describe("buyers.service", () => {
  beforeEach(() => {
    mockBuyers.length = 0;
    mockBuyers.push(
      {
        id: "buyer-1",
        companyId: "company-1",
        propertyIds: ["property-1", "property-2"],
        code: "BUY001",
        name: "Buyer 1",
        email: "buyer1@test.com",
        phone: "1234567890",
        status: "active",
        createdAt: "2025-01-01",
      },
      {
        id: "buyer-2",
        companyId: "company-1",
        propertyIds: ["property-2"],
        code: "BUY002",
        name: "Buyer 2",
        email: "buyer2@test.com",
        phone: "0987654321",
        status: "active",
        createdAt: "2025-01-02",
      },
      {
        id: "buyer-3",
        companyId: "company-2",
        propertyIds: ["property-3"],
        code: "BUY003",
        name: "Buyer 3",
        email: "buyer3@test.com",
        phone: "5555555555",
        status: "active",
        createdAt: "2025-01-03",
      }
    );
  });

  describe("getBuyerById", () => {
    it("should return buyer when ID exists", () => {
      const result = getBuyerById("buyer-1");
      expect(result).toBeDefined();
      expect(result?.id).toBe("buyer-1");
      expect(result?.name).toBe("Buyer 1");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getBuyerById("buyer-nonexistent");
      expect(result).toBeUndefined();
    });

    it("should return undefined when ID is undefined", () => {
      const result = getBuyerById(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe("getBuyersByCompanyId", () => {
    it("should return all buyers for a company", () => {
      const result = getBuyersByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("buyer-1");
      expect(result[1]?.id).toBe("buyer-2");
    });

    it("should return empty array when company has no buyers", () => {
      const result = getBuyersByCompanyId("company-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("getBuyersByPropertyId", () => {
    it("should return buyers that have the property in propertyIds", () => {
      const result = getBuyersByPropertyId("property-1");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe("buyer-1");
    });

    it("should return multiple buyers when multiple have the property", () => {
      const result = getBuyersByPropertyId("property-2");
      expect(result).toHaveLength(2);
      expect(result.some((b) => b.id === "buyer-1")).toBe(true);
      expect(result.some((b) => b.id === "buyer-2")).toBe(true);
    });

    it("should return empty array when property has no buyers", () => {
      const result = getBuyersByPropertyId("property-nonexistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("addBuyer", () => {
    it("should add a new buyer with generated ID", () => {
      const formData: BuyerFormData = {
        companyId: "company-1",
        propertyIds: ["property-1"],
        code: "BUY004",
        name: "Buyer 4",
        email: "buyer4@test.com",
        phone: "1111111111",
        status: "active",
      };

      const initialLength = mockBuyers.length;
      const result = addBuyer(formData);

      expect(mockBuyers).toHaveLength(initialLength + 1);
      expect(result.id).toBeDefined();
      expect(result.companyId).toBe("company-1");
      expect(result.name).toBe("Buyer 4");
      expect(result.createdAt).toBeDefined();
    });

    it("should generate ID with correct prefix", () => {
      const formData: BuyerFormData = {
        companyId: "company-1",
        propertyIds: ["property-1"],
        code: "BUY004",
        name: "Buyer 4",
        email: "buyer4@test.com",
        phone: "1111111111",
        status: "active",
      };

      const result = addBuyer(formData);
      expect(result.id).toContain("aa0e8400-e29b-41d4-a716");
    });
  });

  describe("updateBuyer", () => {
    it("should update buyer when ID exists", () => {
      const updateData: Partial<BuyerFormData> = {
        name: "Updated Buyer 1",
        email: "updated@test.com",
      };

      const result = updateBuyer("buyer-1", updateData);
      expect(result).toBe(true);

      const updated = mockBuyers.find((buyer) => buyer.id === "buyer-1");
      expect(updated?.name).toBe("Updated Buyer 1");
      expect(updated?.email).toBe("updated@test.com");
    });

    it("should return false when ID does not exist", () => {
      const updateData: Partial<BuyerFormData> = {
        name: "Updated Buyer",
      };

      const result = updateBuyer("buyer-nonexistent", updateData);
      expect(result).toBe(false);
    });
  });

  describe("deleteBuyer", () => {
    it("should delete buyer when ID exists", () => {
      const initialLength = mockBuyers.length;
      const result = deleteBuyer("buyer-1");

      expect(result).toBe(true);
      expect(mockBuyers).toHaveLength(initialLength - 1);
      expect(mockBuyers.find((buyer) => buyer.id === "buyer-1")).toBeUndefined();
    });

    it("should return false when ID does not exist", () => {
      const initialLength = mockBuyers.length;
      const result = deleteBuyer("buyer-nonexistent");

      expect(result).toBe(false);
      expect(mockBuyers).toHaveLength(initialLength);
    });
  });
});
