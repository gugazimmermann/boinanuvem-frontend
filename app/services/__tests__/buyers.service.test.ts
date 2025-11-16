import { describe, it, expect, beforeEach, vi } from "vitest";
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

vi.mock("~/mocks/buyers", () => ({
  mockBuyers: [],
}));

describe("buyers.service", () => {
  beforeEach(() => {
    mockBuyers.length = 0;
    mockBuyers.push(
      {
        id: "aa0e8400-e29b-41d4-a716-446655440010",
        name: "Buyer One",
        companyId: "company-1",
        propertyIds: ["property-1"],
        createdAt: "2020-01-01",
      },
      {
        id: "aa0e8400-e29b-41d4-a716-446655440011",
        name: "Buyer Two",
        companyId: "company-1",
        propertyIds: ["property-2"],
        createdAt: "2020-01-02",
      }
    );
  });

  describe("getBuyerById", () => {
    it("should return buyer when ID exists", () => {
      const result = getBuyerById("aa0e8400-e29b-41d4-a716-446655440010");
      expect(result).toBeDefined();
      expect(result?.name).toBe("Buyer One");
    });

    it("should return undefined when ID does not exist", () => {
      const result = getBuyerById("nonexistent-id");
      expect(result).toBeUndefined();
    });
  });

  describe("getBuyersByCompanyId", () => {
    it("should return buyers for specific company", () => {
      const result = getBuyersByCompanyId("company-1");
      expect(result).toHaveLength(2);
      expect(result.every((buyer) => buyer.companyId === "company-1")).toBe(true);
    });
  });

  describe("getBuyersByPropertyId", () => {
    it("should return buyers for specific property", () => {
      const result = getBuyersByPropertyId("property-1");
      expect(result).toHaveLength(1);
      expect(result[0].propertyIds?.includes("property-1")).toBe(true);
    });
  });

  describe("addBuyer", () => {
    it("should add new buyer", () => {
      const formData: BuyerFormData = {
        name: "New Buyer",
        companyId: "company-1",
        propertyIds: ["property-1"],
      };

      const initialLength = mockBuyers.length;
      const result = addBuyer(formData);

      expect(mockBuyers).toHaveLength(initialLength + 1);
      expect(result.name).toBe("New Buyer");
    });
  });

  describe("updateBuyer", () => {
    it("should update existing buyer", () => {
      const result = updateBuyer("aa0e8400-e29b-41d4-a716-446655440010", {
        name: "Updated Buyer",
      });

      expect(result).toBe(true);
      const updated = mockBuyers.find(
        (b) => b.id === "aa0e8400-e29b-41d4-a716-446655440010"
      );
      expect(updated?.name).toBe("Updated Buyer");
    });
  });

  describe("deleteBuyer", () => {
    it("should delete existing buyer", () => {
      const initialLength = mockBuyers.length;
      const result = deleteBuyer("aa0e8400-e29b-41d4-a716-446655440010");

      expect(result).toBe(true);
      expect(mockBuyers).toHaveLength(initialLength - 1);
    });
  });
});

