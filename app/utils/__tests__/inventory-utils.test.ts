import { describe, it, expect, vi } from "vitest";
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

vi.mock("../formatting", () => ({
  formatDate: vi.fn((date: string) => date),
}));

describe("inventory-utils", () => {
  const mockTranslations = {
    inventory: {
      units: {
        unit: "Unidade",
        unitPlural: "Unidades",
        gram: "Grama",
        kg: "Quilograma",
        ton: "Tonelada",
        tonPlural: "Toneladas",
        milliliter: "Mililitro",
        liter: "Litro",
        centimeter: "Centímetro",
        centimeterPlural: "Centímetros",
        meter: "Metro",
        meterPlural: "Metros",
        squareMeter: "Metro quadrado",
        squareMeterPlural: "Metros quadrados",
        hectare: "Hectare",
        hectarePlural: "Hectares",
        bag: "Saco",
        bagPlural: "Sacos",
        bottle: "Frasco",
        bottlePlural: "Frasco",
        dose: "Dose",
        dosePlural: "Doses",
        box: "Caixa",
        boxPlural: "Caixas",
        tablet: "Comprimido",
        tabletPlural: "Comprimidos",
        pill: "Pílula",
        pillPlural: "Pílulas",
        ampoule: "Ampola",
        ampoulePlural: "Ampolas",
        syringe: "Seringa",
        syringePlural: "Seringas",
        cartridge: "Cartucho",
        cartridgePlural: "Cartuchos",
        roll: "Rolo",
        rollPlural: "Rolos",
        package: "Pacote",
        packagePlural: "Pacotes",
        can: "Lata",
        canPlural: "Latas",
      },
      categories: {
        feed: "Ração",
        medicines: "Medicamentos",
        vaccines: "Vacinas",
        supplements: "Suplementos",
        vitamins: "Vitaminas",
        custom: "Personalizado",
      },
      new: {
        usageBasisOptions: {
          perAnimal: "Por animal",
          perKg: "Por quilograma",
        },
      },
    },
  };

  describe("getUnitLabel", () => {
    it("should return singular form for quantity 1", () => {
      expect(getUnitLabel("unidade", 1, mockTranslations)).toBe("Unidade");
    });

    it("should return plural form for quantity not equal to 1", () => {
      expect(getUnitLabel("unidade", 2, mockTranslations)).toBe("Unidades");
      expect(getUnitLabel("unidade", 0, mockTranslations)).toBe("Unidades");
      expect(getUnitLabel("unidade", -2, mockTranslations)).toBe("Unidades");
    });

    it("should handle units without plural form", () => {
      expect(getUnitLabel("g", 1, mockTranslations)).toBe("Grama");
      expect(getUnitLabel("g", 2, mockTranslations)).toBe("Grama");
    });

    it("should handle units with plural form", () => {
      expect(getUnitLabel("tonelada", 1, mockTranslations)).toBe("Tonelada");
      expect(getUnitLabel("tonelada", 2, mockTranslations)).toBe("Toneladas");
    });

    it("should return original unit if not found in map", () => {
      expect(getUnitLabel("unknown", 1, mockTranslations)).toBe("unknown");
    });

    it("should handle all unit types", () => {
      const units = [
        "unidade",
        "g",
        "kg",
        "tonelada",
        "ml",
        "L",
        "cm",
        "m",
        "m2",
        "ha",
        "saco",
        "frasco",
        "dose",
        "caixa",
        "comprimido",
        "pilula",
        "ampola",
        "seringa",
        "cartucho",
        "rolo",
        "pacote",
        "lata",
      ];

      units.forEach((unit) => {
        const result = getUnitLabel(unit, 1, mockTranslations);
        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
      });
    });
  });

  describe("isExpiringSoon", () => {
    it("should return false if expirationDate is not provided", () => {
      expect(isExpiringSoon()).toBe(false);
      expect(isExpiringSoon(undefined)).toBe(false);
    });

    it("should return true if expiration date is within threshold", () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isExpiringSoon(tomorrow.toISOString().split("T")[0], 30)).toBe(true);
    });

    it("should return true if expiration date is exactly at threshold", () => {
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + 30);
      expect(isExpiringSoon(futureDate.toISOString().split("T")[0], 30)).toBe(true);
    });

    it("should return false if expiration date is beyond threshold", () => {
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + 31);
      expect(isExpiringSoon(futureDate.toISOString().split("T")[0], 30)).toBe(false);
    });

    it("should return false if expiration date is in the past", () => {
      const today = new Date();
      const pastDate = new Date(today);
      pastDate.setDate(pastDate.getDate() - 1);
      expect(isExpiringSoon(pastDate.toISOString().split("T")[0], 30)).toBe(false);
    });

    it("should use custom threshold", () => {
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + 15);
      expect(isExpiringSoon(futureDate.toISOString().split("T")[0], 10)).toBe(false);
      expect(isExpiringSoon(futureDate.toISOString().split("T")[0], 20)).toBe(true);
    });

    it("should return true for today", () => {
      const today = new Date();
      expect(isExpiringSoon(today.toISOString().split("T")[0], 30)).toBe(true);
    });
  });

  describe("getCategoryForCashFlow", () => {
    it("should return FEED for FEED category", () => {
      expect(getCategoryForCashFlow(InventoryItemCategory.FEED)).toBe(CashFlowCategory.FEED);
    });

    it("should return MEDICINES for MEDICINES category", () => {
      expect(getCategoryForCashFlow(InventoryItemCategory.MEDICINES)).toBe(
        CashFlowCategory.MEDICINES
      );
    });

    it("should return VACCINES for VACCINES category", () => {
      expect(getCategoryForCashFlow(InventoryItemCategory.VACCINES)).toBe(
        CashFlowCategory.VACCINES
      );
    });

    it("should return OTHER_EXPENSES for SUPPLEMENTS category", () => {
      expect(getCategoryForCashFlow(InventoryItemCategory.SUPPLEMENTS)).toBe(
        CashFlowCategory.OTHER_EXPENSES
      );
    });

    it("should return OTHER_EXPENSES for VITAMINS category", () => {
      expect(getCategoryForCashFlow(InventoryItemCategory.VITAMINS)).toBe(
        CashFlowCategory.OTHER_EXPENSES
      );
    });

    it("should return OTHER_EXPENSES for unknown category", () => {
      expect(getCategoryForCashFlow("unknown" as InventoryItemCategory)).toBe(
        CashFlowCategory.OTHER_EXPENSES
      );
    });
  });

  describe("getInventoryUnitOptions", () => {
    it("should return array of unit options", () => {
      const options = getInventoryUnitOptions(mockTranslations);
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThan(0);
    });

    it("should have correct structure for each option", () => {
      const options = getInventoryUnitOptions(mockTranslations);
      options.forEach((option) => {
        expect(option).toHaveProperty("value");
        expect(option).toHaveProperty("label");
        expect(typeof option.value).toBe("string");
        expect(typeof option.label).toBe("string");
      });
    });

    it("should include all expected units", () => {
      const options = getInventoryUnitOptions(mockTranslations);
      const values = options.map((o) => o.value);
      expect(values).toContain("unidade");
      expect(values).toContain("g");
      expect(values).toContain("kg");
      expect(values).toContain("tonelada");
    });
  });

  describe("getUsageUnitOptions", () => {
    it("should return array of usage unit options", () => {
      const options = getUsageUnitOptions(mockTranslations);
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThan(0);
    });

    it("should have correct structure for each option", () => {
      const options = getUsageUnitOptions(mockTranslations);
      options.forEach((option) => {
        expect(option).toHaveProperty("value");
        expect(option).toHaveProperty("label");
      });
    });

    it("should include expected usage units", () => {
      const options = getUsageUnitOptions(mockTranslations);
      const values = options.map((o) => o.value);
      expect(values).toContain("unidade");
      expect(values).toContain("ml");
      expect(values).toContain("L");
      expect(values).toContain("dose");
    });
  });

  describe("getInventoryCategoryOptions", () => {
    it("should return array of category options", () => {
      const options = getInventoryCategoryOptions(mockTranslations);
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThan(0);
    });

    it("should have correct structure for each option", () => {
      const options = getInventoryCategoryOptions(mockTranslations);
      options.forEach((option) => {
        expect(option).toHaveProperty("value");
        expect(option).toHaveProperty("label");
        expect(Object.values(InventoryItemCategory)).toContain(option.value);
      });
    });

    it("should handle CUSTOM category specially", () => {
      const options = getInventoryCategoryOptions(mockTranslations);
      const customOption = options.find((o) => o.value === InventoryItemCategory.CUSTOM);
      expect(customOption).toBeDefined();
      expect(customOption?.label).toBe("Personalizado");
    });
  });

  describe("getUsageBasisOptions", () => {
    it("should return array of usage basis options", () => {
      const options = getUsageBasisOptions(mockTranslations);
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBe(2);
    });

    it("should have correct structure", () => {
      const options = getUsageBasisOptions(mockTranslations);
      options.forEach((option) => {
        expect(option).toHaveProperty("value");
        expect(option).toHaveProperty("label");
      });
    });

    it("should include per_animal and per_kg options", () => {
      const options = getUsageBasisOptions(mockTranslations);
      const values = options.map((o) => o.value);
      expect(values).toContain("per_animal");
      expect(values).toContain("per_kg");
    });
  });

  describe("formatInventoryDate", () => {
    it("should call formatDate with correct parameters", async () => {
      const { formatDate } = await import("../formatting");
      formatInventoryDate("2024-01-15", "pt");
      expect(formatDate).toHaveBeenCalledWith("2024-01-15", "pt");
    });

    it("should default to pt language", async () => {
      const { formatDate } = await import("../formatting");
      formatInventoryDate("2024-01-15");
      expect(formatDate).toHaveBeenCalledWith("2024-01-15", "pt");
    });

    it("should support different languages", async () => {
      const { formatDate } = await import("../formatting");
      formatInventoryDate("2024-01-15", "en");
      expect(formatDate).toHaveBeenCalledWith("2024-01-15", "en");
    });
  });
});
