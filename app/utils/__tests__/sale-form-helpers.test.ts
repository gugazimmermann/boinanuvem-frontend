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

describe("parsePrice", () => {
  it("should parse price with currency symbols", () => {
    // Brazilian format: "1.234,56" - thousands separator is dot, decimal is comma
    // parseCurrency now properly handles locale-specific formats
    expect(parsePrice("R$ 1.234,56", "pt")).toBe(1234.56);
    // US format: "$1,234.56" - thousands separator is comma, decimal is dot
    expect(parsePrice("$1,234.56", "en")).toBe(1234.56);
  });

  it("should parse simple number string", () => {
    // Without locale context, defaults to pt (Brazilian format)
    expect(parsePrice("1234,56", "pt")).toBe(1234.56);
    // US format
    expect(parsePrice("1234.56", "en")).toBe(1234.56);
  });

  it("should handle negative prices", () => {
    expect(parsePrice("-1234,56", "pt")).toBe(-1234.56);
    expect(parsePrice("-1,234.56", "en")).toBe(-1234.56);
  });

  it("should return 0 for invalid input", () => {
    expect(parsePrice("abc", "pt")).toBe(0);
    expect(parsePrice("", "pt")).toBe(0);
  });

  it("should handle prices with spaces", () => {
    // Spaces are removed by parseCurrency
    expect(parsePrice("1 234,56", "pt")).toBe(1234.56);
    expect(parsePrice("1 234.56", "en")).toBe(1234.56);
  });
});

describe("transformSaleItems", () => {
  it("should transform sale items correctly", () => {
    const saleItems = [
      {
        animalId: "animal-1",
        price: "1000",
        weight: "300",
        carcassWeight: "",
      },
      {
        animalId: "animal-2",
        price: "500",
        weight: "250",
        carcassWeight: "200",
      },
    ];
    const result = transformSaleItems(saleItems);
    expect(result).toHaveLength(2);
    expect(result[0].animalId).toBe("animal-1");
    expect(result[0].price).toBe(1000);
    expect(result[0].weight).toBe(300);
    expect(result[0].carcassWeight).toBeUndefined();
    expect(result[1].carcassWeight).toBe(200);
  });

  it("should handle invalid weight", () => {
    const saleItems = [
      {
        animalId: "animal-1",
        price: "1000",
        weight: "invalid",
        carcassWeight: "",
      },
    ];
    const result = transformSaleItems(saleItems);
    expect(result[0].weight).toBe(0);
  });

  it("should handle empty array", () => {
    expect(transformSaleItems([])).toEqual([]);
  });
});

describe("transformSaleFees", () => {
  it("should transform fees correctly", () => {
    const fees = [
      { id: "fee-1", name: "Transport Fee", amount: "R$ 100,00" },
      { id: "fee-2", name: "Handling Fee", amount: "50" },
    ];
    const result = transformSaleFees(fees);
    expect(result).toHaveLength(2);
    expect(result?.[0].name).toBe("Transport Fee");
    expect(result?.[0].amount).toBe(100);
  });

  it("should filter out empty fees", () => {
    const fees = [
      { id: "fee-1", name: "Transport Fee", amount: "100" },
      { id: "fee-2", name: "   ", amount: "50" },
      { id: "fee-3", name: "Handling Fee", amount: "" },
    ];
    const result = transformSaleFees(fees);
    expect(result).toHaveLength(1);
    expect(result?.[0].name).toBe("Transport Fee");
  });

  it("should return undefined for empty array", () => {
    expect(transformSaleFees([])).toBeUndefined();
  });

  it("should trim fee names", () => {
    const fees = [{ id: "fee-1", name: "  Transport Fee  ", amount: "100" }];
    const result = transformSaleFees(fees);
    expect(result?.[0].name).toBe("Transport Fee");
  });
});

describe("calculateTotalPrice", () => {
  it("should calculate total from sale items", () => {
    const items: SaleItem[] = [
      { animalId: "animal-1", price: 1000, weight: 300 },
      { animalId: "animal-2", price: 500, weight: 250 },
    ];
    expect(calculateTotalPrice(items)).toBe(1500);
  });

  it("should return 0 for empty array", () => {
    expect(calculateTotalPrice([])).toBe(0);
  });

  it("should handle negative prices", () => {
    const items: SaleItem[] = [
      { animalId: "animal-1", price: 1000, weight: 300 },
      { animalId: "animal-2", price: -200, weight: 250 },
    ];
    expect(calculateTotalPrice(items)).toBe(800);
  });
});

describe("transformSaleFormData", () => {
  const mockFormData = {
    propertyId: "property-1",
    buyerId: "buyer-1",
    saleDate: "2024-01-15",
    saleType: "" as "" | import("~/types").SaleType,
    pricingMode: "per_kg" as "" | import("~/types").PricingMode,
    paymentMethod: "cash" as "" | import("~/types").SalePaymentMethod,
    saleItems: [
      {
        animalId: "animal-1",
        price: "1000",
        weight: "300",
        carcassWeight: "",
      },
    ],
    fees: [{ id: "fee-1", name: "Transport", amount: "100" }],
    observation: "Test observation",
    totalPrice: "1000",
    selectedAnimalIds: ["animal-1"],
  };

  it("should transform form data correctly", () => {
    const result = transformSaleFormData(mockFormData, "company-1");
    expect(result.companyId).toBe("company-1");
    expect(result.propertyId).toBe("property-1");
    expect(result.buyerId).toBe("buyer-1");
    expect(result.saleDate).toBe("2024-01-15");
    expect(result.totalPrice).toBe(1000);
    expect(result.observation).toBe("Test observation");
  });

  it("should transform sale items", () => {
    const result = transformSaleFormData(mockFormData, "company-1");
    expect(result.saleItems).toHaveLength(1);
    expect(result.saleItems[0].price).toBe(1000);
  });

  it("should transform fees", () => {
    const result = transformSaleFormData(mockFormData, "company-1");
    expect(result.fees).toHaveLength(1);
    expect(result.fees?.[0].amount).toBe(100);
  });

  it("should handle empty observation", () => {
    const formDataWithoutObservation = { ...mockFormData, observation: "" };
    const result = transformSaleFormData(formDataWithoutObservation, "company-1");
    expect(result.observation).toBeUndefined();
  });
});

describe("transformSaleFormDataForUpdate", () => {
  const mockFormData = {
    propertyId: "property-1",
    buyerId: "buyer-1",
    saleDate: "2024-01-15",
    saleType: "" as "" | import("~/types").SaleType,
    pricingMode: "per_kg" as "" | import("~/types").PricingMode,
    paymentMethod: "cash" as "" | import("~/types").SalePaymentMethod,
    saleItems: [
      {
        animalId: "animal-1",
        price: "1000",
        weight: "300",
        carcassWeight: "",
      },
    ],
    fees: [{ id: "fee-1", name: "Transport", amount: "100" }],
    observation: "Test observation",
    totalPrice: "1000",
    selectedAnimalIds: ["animal-1"],
  };

  it("should transform form data without companyId", () => {
    const result = transformSaleFormDataForUpdate(mockFormData);
    expect(result.companyId).toBeUndefined();
    expect(result.propertyId).toBe("property-1");
    expect(result.totalPrice).toBe(1000);
  });

  it("should include all fields except companyId", () => {
    const result = transformSaleFormDataForUpdate(mockFormData);
    expect(result).toHaveProperty("propertyId");
    expect(result).toHaveProperty("buyerId");
    expect(result).toHaveProperty("saleDate");
    expect(result).toHaveProperty("saleItems");
    expect(result).not.toHaveProperty("companyId");
  });
});
