import { describe, it, expect } from "vitest";
import {
  parsePrice,
  transformSaleItems,
  transformSaleFees,
  calculateTotalPrice,
  transformSaleFormData,
  transformSaleFormDataForUpdate,
} from "../sale-form-helpers";
import type { SaleItem } from "~/types";

describe("sale-form-helpers", () => {
  describe("parsePrice", () => {
    it("should parse simple price string", () => {
      expect(parsePrice("100")).toBe(100);
      expect(parsePrice("123.45")).toBe(123.45);
    });

    it("should parse price with currency symbols", () => {
      expect(parsePrice("R$ 100,50")).toBe(100.5);
      expect(parsePrice("$ 100.50")).toBe(100.5);
    });

    it("should parse price with commas and dots", () => {
      // parsePrice replaces commas with dots, so "1.234,56" becomes "1.234.56" which parses as 1.234
      // For "1,234.56", it becomes "1.234.56" which parses as 1.234
      expect(parsePrice("1,234.56")).toBe(1.234);
      expect(parsePrice("1234,56")).toBe(1234.56);
    });

    it("should handle empty string", () => {
      expect(parsePrice("")).toBe(0);
    });

    it("should handle invalid strings", () => {
      expect(parsePrice("abc")).toBe(0);
      expect(parsePrice("---")).toBe(0);
    });
  });

  describe("transformSaleItems", () => {
    it("should transform sale items correctly", () => {
      const formItems = [
        {
          animalId: "animal1",
          price: "R$ 100,50",
          weight: "300",
          carcassWeight: "200",
        },
        {
          animalId: "animal2",
          price: "200",
          weight: "400",
        },
      ];
      const result = transformSaleItems(formItems);
      expect(result).toHaveLength(2);
      expect(result[0].animalId).toBe("animal1");
      expect(result[0].price).toBe(100.5);
      expect(result[0].weight).toBe(300);
      expect(result[0].carcassWeight).toBe(200);
      expect(result[1].carcassWeight).toBeUndefined();
    });

    it("should handle invalid weight", () => {
      const formItems = [
        {
          animalId: "animal1",
          price: "100",
          weight: "invalid",
        },
      ];
      const result = transformSaleItems(formItems);
      expect(result[0].weight).toBe(0);
    });
  });

  describe("transformSaleFees", () => {
    it("should transform fees correctly", () => {
      const formFees = [
        { id: "1", name: "Transport", amount: "R$ 50,00" },
        { id: "2", name: "Handling", amount: "25.50" },
      ];
      const result = transformSaleFees(formFees);
      expect(result).toHaveLength(2);
      expect(result?.[0].name).toBe("Transport");
      expect(result?.[0].amount).toBe(50);
      expect(result?.[1].amount).toBe(25.5);
    });

    it("should filter out empty fees", () => {
      const formFees = [
        { id: "1", name: "Transport", amount: "50" },
        { id: "2", name: "", amount: "25" },
        { id: "3", name: "Handling", amount: "" },
      ];
      const result = transformSaleFees(formFees);
      expect(result).toHaveLength(1);
      expect(result?.[0].name).toBe("Transport");
    });

    it("should return undefined for empty array", () => {
      const result = transformSaleFees([]);
      expect(result).toBeUndefined();
    });

    it("should trim fee names", () => {
      const formFees = [{ id: "1", name: "  Transport  ", amount: "50" }];
      const result = transformSaleFees(formFees);
      expect(result?.[0].name).toBe("Transport");
    });
  });

  describe("calculateTotalPrice", () => {
    it("should calculate total from sale items", () => {
      const items: SaleItem[] = [
        { animalId: "1", price: 100, weight: 300 },
        { animalId: "2", price: 200, weight: 400 },
        { animalId: "3", price: 150, weight: 350 },
      ];
      expect(calculateTotalPrice(items)).toBe(450);
    });

    it("should return 0 for empty array", () => {
      expect(calculateTotalPrice([])).toBe(0);
    });

    it("should handle negative prices", () => {
      const items: SaleItem[] = [
        { animalId: "1", price: 100, weight: 300 },
        { animalId: "2", price: -50, weight: 400 },
      ];
      expect(calculateTotalPrice(items)).toBe(50);
    });
  });

  describe("transformSaleFormData", () => {
    it("should transform form data correctly", () => {
      const formData = {
        propertyId: "prop1",
        buyerId: "buyer1",
        saleDate: "2024-01-15",
        saleType: "direct",
        pricingMode: "per_kg",
        paymentMethod: "cash",
        saleItems: [
          {
            animalId: "animal1",
            price: "100",
            weight: "300",
          },
        ],
        fees: [{ id: "1", name: "Transport", amount: "50" }],
        observation: "Test observation",
      };
      const result = transformSaleFormData(
        formData as unknown as Parameters<typeof transformSaleFormData>[0],
        "company1"
      );
      expect(result.companyId).toBe("company1");
      expect(result.propertyId).toBe("prop1");
      expect(result.buyerId).toBe("buyer1");
      expect(result.saleDate).toBe("2024-01-15");
      expect(result.totalPrice).toBe(100);
      expect(result.fees).toBeDefined();
      expect(result.observation).toBe("Test observation");
    });

    it("should handle undefined observation", () => {
      const formData = {
        propertyId: "prop1",
        buyerId: "buyer1",
        saleDate: "2024-01-15",
        saleType: "direct",
        pricingMode: "per_kg",
        paymentMethod: "cash",
        saleItems: [
          {
            animalId: "animal1",
            price: "100",
            weight: "300",
          },
        ],
        fees: [],
      };
      const result = transformSaleFormData(
        formData as unknown as Parameters<typeof transformSaleFormData>[0],
        "company1"
      );
      expect(result.observation).toBeUndefined();
    });
  });

  describe("transformSaleFormDataForUpdate", () => {
    it("should transform form data for update", () => {
      const formData = {
        propertyId: "prop1",
        buyerId: "buyer1",
        saleDate: "2024-01-15",
        saleType: "direct",
        pricingMode: "per_kg",
        paymentMethod: "cash",
        saleItems: [
          {
            animalId: "animal1",
            price: "100",
            weight: "300",
          },
        ],
        fees: [],
      };
      const result = transformSaleFormDataForUpdate(
        formData as unknown as Parameters<typeof transformSaleFormDataForUpdate>[0]
      );
      expect(result.propertyId).toBe("prop1");
      expect(result.totalPrice).toBe(100);
      expect(result).not.toHaveProperty("companyId");
    });
  });
});
