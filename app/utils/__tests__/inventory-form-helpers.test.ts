import { describe, it, expect, vi } from "vitest";
import {
  isMedicineOrVaccine,
  getUsageFields,
  getCustomCategory,
  getExpirationDate,
  handleNitrogenContent,
  getInitialStock,
} from "../inventory-form-helpers";
import { InventoryItemCategory } from "~/types";
import type { InventoryFormData } from "../inventory-form-helpers";

describe("inventory-form-helpers", () => {
  describe("isMedicineOrVaccine", () => {
    it("should return true for medicines", () => {
      expect(isMedicineOrVaccine(InventoryItemCategory.MEDICINES)).toBe(true);
    });

    it("should return true for vaccines", () => {
      expect(isMedicineOrVaccine(InventoryItemCategory.VACCINES)).toBe(true);
    });

    it("should return false for other categories", () => {
      expect(isMedicineOrVaccine(InventoryItemCategory.FEED)).toBe(false);
      expect(isMedicineOrVaccine(InventoryItemCategory.FERTILIZER)).toBe(false);
      expect(isMedicineOrVaccine(InventoryItemCategory.CUSTOM)).toBe(false);
    });
  });

  describe("getUsageFields", () => {
    it("should return undefined for non-medicine/vaccine categories", () => {
      const formData: InventoryFormData = {
        category: InventoryItemCategory.FEED,
        customCategory: "",
        hasExpiration: false,
        expirationDate: "",
      };
      const result = getUsageFields(formData);
      expect(result.usageAmount).toBeUndefined();
      expect(result.usageUnit).toBeUndefined();
      expect(result.usageBasis).toBeUndefined();
    });

    it("should return usage fields for medicine category", () => {
      const formData: InventoryFormData = {
        category: InventoryItemCategory.MEDICINES,
        customCategory: "",
        hasExpiration: false,
        expirationDate: "",
        usageAmount: "10",
        usageUnit: "ml",
        usageBasis: "per_animal",
      };
      const result = getUsageFields(formData);
      expect(result.usageAmount).toBe(10);
      expect(result.usageUnit).toBe("ml");
      expect(result.usageBasis).toBe("per_animal");
    });

    it("should parse usage amount", () => {
      const formData: InventoryFormData = {
        category: InventoryItemCategory.MEDICINES,
        customCategory: "",
        hasExpiration: false,
        expirationDate: "",
        usageAmount: "5.5",
      };
      const result = getUsageFields(formData);
      expect(result.usageAmount).toBe(5.5);
    });

    it("should return undefined for empty usage amount", () => {
      const formData: InventoryFormData = {
        category: InventoryItemCategory.MEDICINES,
        customCategory: "",
        hasExpiration: false,
        expirationDate: "",
        usageAmount: "",
      };
      const result = getUsageFields(formData);
      expect(result.usageAmount).toBeUndefined();
    });

    it("should trim usage unit", () => {
      const formData: InventoryFormData = {
        category: InventoryItemCategory.MEDICINES,
        customCategory: "",
        hasExpiration: false,
        expirationDate: "",
        usageUnit: "  ml  ",
      };
      const result = getUsageFields(formData);
      expect(result.usageUnit).toBe("ml");
    });
  });

  describe("getCustomCategory", () => {
    it("should return custom category when category is CUSTOM", () => {
      const formData: InventoryFormData = {
        category: InventoryItemCategory.CUSTOM,
        customCategory: "Custom Item",
        hasExpiration: false,
        expirationDate: "",
      };
      expect(getCustomCategory(formData)).toBe("Custom Item");
    });

    it("should return undefined for non-custom category", () => {
      const formData: InventoryFormData = {
        category: InventoryItemCategory.FEED,
        customCategory: "Custom Item",
        hasExpiration: false,
        expirationDate: "",
      };
      expect(getCustomCategory(formData)).toBeUndefined();
    });

    it("should return undefined for empty custom category", () => {
      const formData: InventoryFormData = {
        category: InventoryItemCategory.CUSTOM,
        customCategory: "",
        hasExpiration: false,
        expirationDate: "",
      };
      expect(getCustomCategory(formData)).toBeUndefined();
    });

    it("should trim custom category", () => {
      const formData: InventoryFormData = {
        category: InventoryItemCategory.CUSTOM,
        customCategory: "  Custom Item  ",
        hasExpiration: false,
        expirationDate: "",
      };
      expect(getCustomCategory(formData)).toBe("Custom Item");
    });
  });

  describe("getExpirationDate", () => {
    it("should return expiration date when hasExpiration is true", () => {
      const formData: InventoryFormData = {
        category: InventoryItemCategory.MEDICINES,
        customCategory: "",
        hasExpiration: true,
        expirationDate: "2024-12-31",
      };
      expect(getExpirationDate(formData)).toBe("2024-12-31");
    });

    it("should return undefined when hasExpiration is false", () => {
      const formData: InventoryFormData = {
        category: InventoryItemCategory.MEDICINES,
        customCategory: "",
        hasExpiration: false,
        expirationDate: "2024-12-31",
      };
      expect(getExpirationDate(formData)).toBeUndefined();
    });

    it("should return undefined when expiration date is empty", () => {
      const formData: InventoryFormData = {
        category: InventoryItemCategory.MEDICINES,
        customCategory: "",
        hasExpiration: true,
        expirationDate: "",
      };
      expect(getExpirationDate(formData)).toBeUndefined();
    });
  });

  describe("handleNitrogenContent", () => {
    it("should set nitrogen content for fertilizer category", () => {
      const setNitrogenContent = vi.fn();
      const formData: InventoryFormData = {
        category: InventoryItemCategory.FERTILIZER,
        customCategory: "",
        hasExpiration: false,
        expirationDate: "",
        nitrogenContent: "15.5",
      };
      handleNitrogenContent("item1", formData, setNitrogenContent);
      expect(setNitrogenContent).toHaveBeenCalledWith("item1", 15.5);
    });

    it("should not set nitrogen content for non-fertilizer category", () => {
      const setNitrogenContent = vi.fn();
      const formData: InventoryFormData = {
        category: InventoryItemCategory.FEED,
        customCategory: "",
        hasExpiration: false,
        expirationDate: "",
        nitrogenContent: "15.5",
      };
      handleNitrogenContent("item1", formData, setNitrogenContent);
      expect(setNitrogenContent).not.toHaveBeenCalled();
    });

    it("should not set nitrogen content for empty value", () => {
      const setNitrogenContent = vi.fn();
      const formData: InventoryFormData = {
        category: InventoryItemCategory.FERTILIZER,
        customCategory: "",
        hasExpiration: false,
        expirationDate: "",
        nitrogenContent: "",
      };
      handleNitrogenContent("item1", formData, setNitrogenContent);
      expect(setNitrogenContent).not.toHaveBeenCalled();
    });

    it("should not set nitrogen content for invalid number", () => {
      const setNitrogenContent = vi.fn();
      const formData: InventoryFormData = {
        category: InventoryItemCategory.FERTILIZER,
        customCategory: "",
        hasExpiration: false,
        expirationDate: "",
        nitrogenContent: "invalid",
      };
      handleNitrogenContent("item1", formData, setNitrogenContent);
      expect(setNitrogenContent).not.toHaveBeenCalled();
    });

    it("should not set nitrogen content for negative number", () => {
      const setNitrogenContent = vi.fn();
      const formData: InventoryFormData = {
        category: InventoryItemCategory.FERTILIZER,
        customCategory: "",
        hasExpiration: false,
        expirationDate: "",
        nitrogenContent: "-5",
      };
      handleNitrogenContent("item1", formData, setNitrogenContent);
      expect(setNitrogenContent).not.toHaveBeenCalled();
    });
  });

  describe("getInitialStock", () => {
    it("should parse valid stock value", () => {
      expect(getInitialStock("100")).toBe(100);
      expect(getInitialStock("50.5")).toBe(50.5);
    });

    it("should return 0 for empty string", () => {
      expect(getInitialStock("")).toBe(0);
      expect(getInitialStock("   ")).toBe(0);
    });

    it("should return 0 for undefined", () => {
      expect(getInitialStock(undefined)).toBe(0);
    });

    it("should return 0 for invalid number", () => {
      expect(getInitialStock("invalid")).toBe(0);
      expect(getInitialStock("abc123")).toBe(0);
    });
  });
});
