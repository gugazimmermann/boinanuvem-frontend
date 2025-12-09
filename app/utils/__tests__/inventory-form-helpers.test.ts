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
  it("should return usage fields for medicine category", () => {
    const formData = {
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

  it("should return undefined for non-medicine/vaccine categories", () => {
    const formData = {
      category: InventoryItemCategory.FEED,
      customCategory: "",
      hasExpiration: false,
      expirationDate: "",
      usageAmount: "10",
      usageUnit: "ml",
      usageBasis: "per_animal",
    };
    const result = getUsageFields(formData);
    expect(result.usageAmount).toBeUndefined();
    expect(result.usageUnit).toBeUndefined();
    expect(result.usageBasis).toBeUndefined();
  });

  it("should handle empty usage fields", () => {
    const formData = {
      category: InventoryItemCategory.MEDICINES,
      customCategory: "",
      hasExpiration: false,
      expirationDate: "",
      usageAmount: "",
      usageUnit: "   ",
      usageBasis: "",
    };
    const result = getUsageFields(formData);
    expect(result.usageAmount).toBeUndefined();
    expect(result.usageUnit).toBeUndefined();
    expect(result.usageBasis).toBeUndefined();
  });

  it("should trim usage unit and basis", () => {
    const formData = {
      category: InventoryItemCategory.VACCINES,
      customCategory: "",
      hasExpiration: false,
      expirationDate: "",
      usageAmount: "10",
      usageUnit: "  ml  ",
      usageBasis: "  per_animal  ",
    };
    const result = getUsageFields(formData);
    expect(result.usageUnit).toBe("ml");
    expect(result.usageBasis).toBe("per_animal");
  });
});

describe("getCustomCategory", () => {
  it("should return custom category when category is CUSTOM", () => {
    const formData = {
      category: InventoryItemCategory.CUSTOM,
      customCategory: "Custom Category Name",
      hasExpiration: false,
      expirationDate: "",
    };
    expect(getCustomCategory(formData)).toBe("Custom Category Name");
  });

  it("should return undefined for non-CUSTOM category", () => {
    const formData = {
      category: InventoryItemCategory.MEDICINES,
      customCategory: "Some Category",
      hasExpiration: false,
      expirationDate: "",
    };
    expect(getCustomCategory(formData)).toBeUndefined();
  });

  it("should return undefined for empty custom category", () => {
    const formData = {
      category: InventoryItemCategory.CUSTOM,
      customCategory: "",
      hasExpiration: false,
      expirationDate: "",
    };
    expect(getCustomCategory(formData)).toBeUndefined();
  });

  it("should trim custom category", () => {
    const formData = {
      category: InventoryItemCategory.CUSTOM,
      customCategory: "  Custom Category  ",
      hasExpiration: false,
      expirationDate: "",
    };
    expect(getCustomCategory(formData)).toBe("Custom Category");
  });
});

describe("getExpirationDate", () => {
  it("should return expiration date when hasExpiration is true", () => {
    const formData = {
      category: InventoryItemCategory.MEDICINES,
      customCategory: "",
      hasExpiration: true,
      expirationDate: "2024-12-31",
    };
    expect(getExpirationDate(formData)).toBe("2024-12-31");
  });

  it("should return undefined when hasExpiration is false", () => {
    const formData = {
      category: InventoryItemCategory.MEDICINES,
      customCategory: "",
      hasExpiration: false,
      expirationDate: "2024-12-31",
    };
    expect(getExpirationDate(formData)).toBeUndefined();
  });

  it("should return undefined when expirationDate is empty", () => {
    const formData = {
      category: InventoryItemCategory.MEDICINES,
      customCategory: "",
      hasExpiration: true,
      expirationDate: "",
    };
    expect(getExpirationDate(formData)).toBeUndefined();
  });
});

describe("handleNitrogenContent", () => {
  it("should call setNitrogenContent for fertilizer category", () => {
    const setNitrogenContent = vi.fn();
    const formData = {
      category: InventoryItemCategory.FERTILIZER,
      customCategory: "",
      hasExpiration: false,
      expirationDate: "",
      nitrogenContent: "15.5",
    };
    handleNitrogenContent("item-1", formData, setNitrogenContent);
    expect(setNitrogenContent).toHaveBeenCalledWith("item-1", 15.5);
  });

  it("should not call setNitrogenContent for non-fertilizer category", () => {
    const setNitrogenContent = vi.fn();
    const formData = {
      category: InventoryItemCategory.MEDICINES,
      customCategory: "",
      hasExpiration: false,
      expirationDate: "",
      nitrogenContent: "15.5",
    };
    handleNitrogenContent("item-1", formData, setNitrogenContent);
    expect(setNitrogenContent).not.toHaveBeenCalled();
  });

  it("should not call setNitrogenContent for empty nitrogen content", () => {
    const setNitrogenContent = vi.fn();
    const formData = {
      category: InventoryItemCategory.FERTILIZER,
      customCategory: "",
      hasExpiration: false,
      expirationDate: "",
      nitrogenContent: "",
    };
    handleNitrogenContent("item-1", formData, setNitrogenContent);
    expect(setNitrogenContent).not.toHaveBeenCalled();
  });

  it("should not call setNitrogenContent for invalid number", () => {
    const setNitrogenContent = vi.fn();
    const formData = {
      category: InventoryItemCategory.FERTILIZER,
      customCategory: "",
      hasExpiration: false,
      expirationDate: "",
      nitrogenContent: "invalid",
    };
    handleNitrogenContent("item-1", formData, setNitrogenContent);
    expect(setNitrogenContent).not.toHaveBeenCalled();
  });

  it("should not call setNitrogenContent for negative values", () => {
    const setNitrogenContent = vi.fn();
    const formData = {
      category: InventoryItemCategory.FERTILIZER,
      customCategory: "",
      hasExpiration: false,
      expirationDate: "",
      nitrogenContent: "-5",
    };
    handleNitrogenContent("item-1", formData, setNitrogenContent);
    expect(setNitrogenContent).not.toHaveBeenCalled();
  });
});

describe("getInitialStock", () => {
  it("should parse valid stock string", () => {
    expect(getInitialStock("100")).toBe(100);
    expect(getInitialStock("100.5")).toBe(100.5);
    expect(getInitialStock("0")).toBe(0);
  });

  it("should return 0 for empty string", () => {
    expect(getInitialStock("")).toBe(0);
    expect(getInitialStock("   ")).toBe(0);
  });

  it("should return 0 for undefined", () => {
    expect(getInitialStock(undefined)).toBe(0);
  });

  it("should return 0 for invalid number", () => {
    expect(getInitialStock("abc")).toBe(0);
    // Number.parseFloat("12abc") returns 12, so this is valid according to the implementation
    expect(getInitialStock("12abc")).toBe(12);
  });
});
