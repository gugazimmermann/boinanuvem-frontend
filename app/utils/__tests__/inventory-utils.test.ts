import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getUnitLabel,
  isExpiringSoon,
  getCategoryForCashFlow,
  getInventoryUnitOptions,
  getUsageUnitOptions,
  getInventoryCategoryOptions,
  getUsageBasisOptions,
  formatInventoryDate,
} from "../inventory-utils";
import { InventoryItemCategory, CashFlowCategory } from "~/types";

describe("getUnitLabel", () => {
  const translations = {
    inventory: {
      units: {
        unit: "Unit",
        unitPlural: "Units",
        gram: "Gram",
        kg: "Kilogram",
        ton: "Ton",
        tonPlural: "Tons",
        milliliter: "Milliliter",
        liter: "Liter",
      },
    },
  };

  it("should return singular form for quantity of 1", () => {
    expect(getUnitLabel("unidade", 1, translations)).toBe("Unit");
  });

  it("should return plural form for quantity not equal to 1", () => {
    expect(getUnitLabel("unidade", 2, translations)).toBe("Units");
    expect(getUnitLabel("unidade", 0, translations)).toBe("Units");
  });

  it("should return unit as-is when not in unitMap", () => {
    expect(getUnitLabel("unknown", 1, translations)).toBe("unknown");
  });

  it("should handle units without plural form", () => {
    expect(getUnitLabel("g", 1, translations)).toBe("Gram");
    expect(getUnitLabel("g", 2, translations)).toBe("Gram");
  });
});

describe("isExpiringSoon", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return false when expiration date is not provided", () => {
    expect(isExpiringSoon()).toBe(false);
    expect(isExpiringSoon(undefined)).toBe(false);
  });

  it("should return true when expiration is within threshold", () => {
    const today = new Date("2024-01-15");
    vi.setSystemTime(today);

    const expirationDate = "2024-01-20"; // 5 days from now
    expect(isExpiringSoon(expirationDate, 30)).toBe(true);
  });

  it("should return false when expiration is beyond threshold", () => {
    const today = new Date("2024-01-15");
    vi.setSystemTime(today);

    const expirationDate = "2024-02-20"; // More than 30 days
    expect(isExpiringSoon(expirationDate, 30)).toBe(false);
  });

  it("should return false when expiration date has passed", () => {
    const today = new Date("2024-01-15");
    vi.setSystemTime(today);

    const expirationDate = "2024-01-10"; // 5 days ago
    expect(isExpiringSoon(expirationDate, 30)).toBe(false);
  });

  it("should use custom threshold", () => {
    const today = new Date("2024-01-15");
    vi.setSystemTime(today);

    const expirationDate = "2024-01-20"; // 5 days from now
    expect(isExpiringSoon(expirationDate, 7)).toBe(true);
    expect(isExpiringSoon(expirationDate, 3)).toBe(false);
  });
});

describe("getCategoryForCashFlow", () => {
  it("should map FEED to FEED", () => {
    expect(getCategoryForCashFlow(InventoryItemCategory.FEED)).toBe(CashFlowCategory.FEED);
  });

  it("should map MEDICINES to MEDICINES", () => {
    expect(getCategoryForCashFlow(InventoryItemCategory.MEDICINES)).toBe(
      CashFlowCategory.MEDICINES
    );
  });

  it("should map VACCINES to VACCINES", () => {
    expect(getCategoryForCashFlow(InventoryItemCategory.VACCINES)).toBe(CashFlowCategory.VACCINES);
  });

  it("should map SUPPLEMENTS to OTHER_EXPENSES", () => {
    expect(getCategoryForCashFlow(InventoryItemCategory.SUPPLEMENTS)).toBe(
      CashFlowCategory.OTHER_EXPENSES
    );
  });

  it("should map VITAMINS to OTHER_EXPENSES", () => {
    expect(getCategoryForCashFlow(InventoryItemCategory.VITAMINS)).toBe(
      CashFlowCategory.OTHER_EXPENSES
    );
  });

  it("should default to OTHER_EXPENSES for unknown categories", () => {
    expect(getCategoryForCashFlow("unknown" as InventoryItemCategory)).toBe(
      CashFlowCategory.OTHER_EXPENSES
    );
  });
});

describe("getInventoryUnitOptions", () => {
  const translations = {
    inventory: {
      units: {
        unit: "Unit",
        gram: "Gram",
        kg: "Kilogram",
        ton: "Ton",
        milliliter: "Milliliter",
        liter: "Liter",
        centimeter: "Centimeter",
        meter: "Meter",
        squareMeter: "Square Meter",
        hectare: "Hectare",
        bag: "Bag",
        bottle: "Bottle",
        dose: "Dose",
        box: "Box",
        tablet: "Tablet",
        pill: "Pill",
        ampoule: "Ampoule",
        syringe: "Syringe",
        cartridge: "Cartridge",
        roll: "Roll",
        package: "Package",
        can: "Can",
      },
    },
  };

  it("should return array of unit options", () => {
    const options = getInventoryUnitOptions(translations);
    expect(Array.isArray(options)).toBe(true);
    expect(options.length).toBeGreaterThan(0);
  });

  it("should include common units", () => {
    const options = getInventoryUnitOptions(translations);
    const unitValues = options.map((opt) => opt.value);
    expect(unitValues).toContain("unidade");
    expect(unitValues).toContain("kg");
    expect(unitValues).toContain("L");
  });
});

describe("getUsageUnitOptions", () => {
  const translations = {
    inventory: {
      units: {
        unit: "Unit",
        milliliter: "Milliliter",
        liter: "Liter",
        dose: "Dose",
        bottle: "Bottle",
        ampoule: "Ampoule",
        syringe: "Syringe",
        tablet: "Tablet",
        pill: "Pill",
        gram: "Gram",
        kg: "Kilogram",
      },
    },
  };

  it("should return array of usage unit options", () => {
    const options = getUsageUnitOptions(translations);
    expect(Array.isArray(options)).toBe(true);
    expect(options.length).toBeGreaterThan(0);
  });

  it("should include usage-specific units", () => {
    const options = getUsageUnitOptions(translations);
    const unitValues = options.map((opt) => opt.value);
    expect(unitValues).toContain("dose");
    expect(unitValues).toContain("ml");
  });
});

describe("getInventoryCategoryOptions", () => {
  const translations = {
    inventory: {
      categories: {
        feed: "Feed",
        medicines: "Medicines",
        vaccines: "Vaccines",
        custom: "Custom",
      },
    },
  };

  it("should return array of category options", () => {
    const options = getInventoryCategoryOptions(translations);
    expect(Array.isArray(options)).toBe(true);
    expect(options.length).toBeGreaterThan(0);
  });

  it("should map CUSTOM category correctly", () => {
    const options = getInventoryCategoryOptions(translations);
    const customOption = options.find((opt) => opt.value === InventoryItemCategory.CUSTOM);
    expect(customOption?.label).toBe("Custom");
  });
});

describe("getUsageBasisOptions", () => {
  const translations = {
    inventory: {
      new: {
        usageBasisOptions: {
          perAnimal: "Per Animal",
          perKg: "Per Kilogram",
        },
      },
    },
  };

  it("should return usage basis options", () => {
    const options = getUsageBasisOptions(translations);
    expect(options).toHaveLength(2);
    expect(options[0].value).toBe("per_animal");
    expect(options[1].value).toBe("per_kg");
  });
});

describe("formatInventoryDate", () => {
  it("should format date string", () => {
    const result = formatInventoryDate("2024-01-15", "en");
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("should default to Portuguese", () => {
    const result1 = formatInventoryDate("2024-01-15");
    const result2 = formatInventoryDate("2024-01-15", "pt");
    expect(result1).toBe(result2);
  });
});
