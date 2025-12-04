import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockSales, initializeSales } from "../sales";
import { mockAnimals } from "../animals";
import { mockBuyers } from "../buyers";
import { mockCompanies } from "../companies";
import { mockProperties } from "../properties";
import { SaleType, PricingMode, SalePaymentMethod } from "~/types";
import * as weighingsService from "~/services/weighings.service";

describe("sales", () => {
  beforeEach(() => {
    vi.spyOn(weighingsService, "getWeighingsByAnimalId").mockReturnValue([]);
  });

  describe("mockSales", () => {
    it("should export an array", () => {
      expect(Array.isArray(mockSales)).toBe(true);
    });

    it("should not be empty after initialization", () => {
      expect(mockSales.length).toBeGreaterThan(0);
    });

    it("should have valid data structure", () => {
      mockSales.forEach((sale) => {
        expect(sale).toHaveProperty("id");
        expect(sale).toHaveProperty("companyId");
        expect(sale).toHaveProperty("propertyId");
        expect(sale).toHaveProperty("buyerId");
        expect(sale).toHaveProperty("saleDate");
        expect(sale).toHaveProperty("saleType");
        expect(sale).toHaveProperty("pricingMode");
        expect(sale).toHaveProperty("paymentMethod");
        expect(sale).toHaveProperty("totalPrice");
        expect(sale).toHaveProperty("saleItems");
        expect(sale).toHaveProperty("createdAt");
      });
    });

    it("should have unique IDs", () => {
      const ids = mockSales.map((sale) => sale.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid ID format", () => {
      const idRegex = /^sa0e8400-e29b-41d4-a716-\d{12}$/;
      mockSales.forEach((sale) => {
        expect(sale.id).toMatch(idRegex);
      });
    });

    it("should have valid date format", () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      mockSales.forEach((sale) => {
        expect(sale.saleDate).toMatch(dateRegex);
        expect(sale.createdAt).toMatch(dateRegex);
      });
    });

    it("should have dates within expected range", () => {
      mockSales.forEach((sale) => {
        const date = new Date(sale.saleDate);
        expect(date.getFullYear()).toBeGreaterThanOrEqual(2020);
        expect(date.getFullYear()).toBeLessThanOrEqual(2025);
      });
    });

    it("should have valid sale types", () => {
      const validTypes = Object.values(SaleType);
      mockSales.forEach((sale) => {
        expect(validTypes).toContain(sale.saleType);
      });
    });

    it("should have valid pricing modes", () => {
      const validModes = Object.values(PricingMode);
      mockSales.forEach((sale) => {
        expect(validModes).toContain(sale.pricingMode);
      });
    });

    it("should have valid payment methods", () => {
      const validMethods = Object.values(SalePaymentMethod);
      mockSales.forEach((sale) => {
        expect(validMethods).toContain(sale.paymentMethod);
      });
    });

    it("should have valid total price", () => {
      mockSales.forEach((sale) => {
        expect(typeof sale.totalPrice).toBe("number");
        expect(sale.totalPrice).toBeGreaterThan(0);
      });
    });

    it("should have valid sale items", () => {
      mockSales.forEach((sale) => {
        expect(Array.isArray(sale.saleItems)).toBe(true);
        expect(sale.saleItems.length).toBeGreaterThan(0);
        sale.saleItems.forEach((item) => {
          expect(item).toHaveProperty("animalId");
          expect(item).toHaveProperty("price");
          expect(item).toHaveProperty("weight");
          expect(typeof item.price).toBe("number");
          expect(typeof item.weight).toBe("number");
          expect(item.price).toBeGreaterThan(0);
          expect(item.weight).toBeGreaterThan(0);
        });
      });
    });

    it("should reference valid company IDs", () => {
      const companyIds = mockCompanies.map((c) => c.id);
      mockSales.forEach((sale) => {
        expect(companyIds).toContain(sale.companyId);
      });
    });

    it("should reference valid property IDs", () => {
      const propertyIds = mockProperties.map((p) => p.id);
      mockSales.forEach((sale) => {
        expect(propertyIds).toContain(sale.propertyId);
      });
    });

    it("should reference valid buyer IDs", () => {
      const buyerIds = mockBuyers.map((b) => b.id);
      mockSales.forEach((sale) => {
        expect(buyerIds).toContain(sale.buyerId);
      });
    });

    it("should reference valid animal IDs in sale items", () => {
      const animalIds = mockAnimals.map((a) => a.id);
      mockSales.forEach((sale) => {
        sale.saleItems.forEach((item) => {
          expect(animalIds).toContain(item.animalId);
        });
      });
    });

    it("should have carcassWeight for slaughterhouse sales", () => {
      mockSales
        .filter((s) => s.saleType === SaleType.SLAUGHTERHOUSE)
        .forEach((sale) => {
          sale.saleItems.forEach((item) => {
            if (item.carcassWeight) {
              expect(typeof item.carcassWeight).toBe("number");
              expect(item.carcassWeight).toBeGreaterThan(0);
              expect(item.carcassWeight).toBeLessThan(item.weight);
            }
          });
        });
    });

    it("should have totalPrice greater than or equal to sum of sale items", () => {
      mockSales.forEach((sale) => {
        const calculatedTotal = sale.saleItems.reduce((sum, item) => sum + item.price, 0);
        expect(sale.totalPrice).toBeGreaterThanOrEqual(calculatedTotal);
      });
    });
  });

  describe("initializeSales", () => {
    it("should be a function", () => {
      expect(typeof initializeSales).toBe("function");
    });
  });
});
