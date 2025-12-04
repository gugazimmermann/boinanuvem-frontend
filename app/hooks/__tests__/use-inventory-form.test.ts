import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInventoryForm } from "../use-inventory-form";
import { InventoryItemCategory, PaymentMethod } from "~/types";

describe("useInventoryForm", () => {
  const mockTranslations = {
    inventory: {
      table: {
        code: "Code",
        name: "Name",
      },
      new: {
        propertyRequired: "Property is required",
        customCategoryRequired: "Custom category is required",
        minimumStockInvalid: "Minimum stock is invalid",
        unitPriceInvalid: "Unit price is invalid",
        initialStockInvalid: "Initial stock is invalid",
        expirationDateRequired: "Expiration date is required",
        usageAmountInvalid: "Usage amount is invalid",
        nitrogenContentInvalid: "Nitrogen content is invalid",
      },
      movements: {
        new: {
          unitPriceRequired: "Unit price is required",
          paymentMethodRequired: "Payment method is required",
          dueDateRequired: "Due date is required",
        },
      },
    },
    profile: {
      errors: {
        required: (field: string) => `${field} is required`,
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        translations: mockTranslations,
      })
    );

    expect(result.current.formData.code).toBe("");
    expect(result.current.formData.name).toBe("");
    expect(result.current.formData.category).toBe(InventoryItemCategory.CUSTOM);
    expect(result.current.formData.unit).toBe("unidade");
    expect(result.current.formData.minimumStock).toBe("0");
    expect(result.current.formData.initialStock).toBe("0");
    expect(result.current.formData.hasExpiration).toBe(false);
    expect(result.current.formData.propertyIds).toEqual([]);
  });

  it("should initialize with provided initialData", () => {
    const initialData = {
      code: "ITEM001",
      name: "Test Item",
      category: InventoryItemCategory.FEED,
    };

    const { result } = renderHook(() =>
      useInventoryForm({
        initialData,
        translations: mockTranslations,
      })
    );

    expect(result.current.formData.code).toBe("ITEM001");
    expect(result.current.formData.name).toBe("Test Item");
    expect(result.current.formData.category).toBe(InventoryItemCategory.FEED);
  });

  it("should handle field changes", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        translations: mockTranslations,
      })
    );

    act(() => {
      result.current.handleChange("name", "New Name");
    });

    expect(result.current.formData.name).toBe("New Name");
  });

  it("should clear error when field is changed", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        translations: mockTranslations,
      })
    );

    act(() => {
      result.current.setErrors({ name: "Name is required" });
    });

    expect(result.current.errors.name).toBe("Name is required");

    act(() => {
      result.current.handleChange("name", "Test");
    });

    expect(result.current.errors.name).toBeUndefined();
  });

  it("should validate basic fields", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        translations: mockTranslations,
      })
    );

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(false);
    expect(result.current.errors.code).toBeDefined();
    expect(result.current.errors.name).toBeDefined();
    expect(result.current.errors.propertyIds).toBeDefined();
  });

  it("should validate custom category when category is CUSTOM", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        initialData: {
          code: "ITEM001",
          name: "Test",
          category: InventoryItemCategory.CUSTOM,
          propertyIds: ["prop-1"],
        },
        translations: mockTranslations,
      })
    );

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(false);
    expect(result.current.errors.customCategory).toBeDefined();
  });

  it("should validate minimum stock", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        initialData: {
          code: "ITEM001",
          name: "Test",
          propertyIds: ["prop-1"],
          minimumStock: "-5",
        },
        translations: mockTranslations,
      })
    );

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(false);
    expect(result.current.errors.minimumStock).toBeDefined();
  });

  it("should validate unit price when provided", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        initialData: {
          code: "ITEM001",
          name: "Test",
          propertyIds: ["prop-1"],
          unitPrice: "invalid",
        },
        translations: mockTranslations,
      })
    );

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(false);
    expect(result.current.errors.unitPrice).toBeDefined();
  });

  it("should validate expiration date when hasExpiration is true", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        initialData: {
          code: "ITEM001",
          name: "Test",
          propertyIds: ["prop-1"],
          hasExpiration: true,
        },
        translations: mockTranslations,
      })
    );

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(false);
    expect(result.current.errors.expirationDate).toBeDefined();
  });

  it("should validate usage amount for medicines and vaccines", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        initialData: {
          code: "ITEM001",
          name: "Test",
          propertyIds: ["prop-1"],
          category: InventoryItemCategory.MEDICINES,
          usageAmount: "invalid",
        },
        translations: mockTranslations,
      })
    );

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(false);
    expect(result.current.errors.usageAmount).toBeDefined();
  });

  it("should validate nitrogen content for fertilizer", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        initialData: {
          code: "ITEM001",
          name: "Test",
          propertyIds: ["prop-1"],
          category: InventoryItemCategory.FERTILIZER,
          nitrogenContent: "-5",
        },
        translations: mockTranslations,
      })
    );

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(false);
    expect(result.current.errors.nitrogenContent).toBeDefined();
  });

  it("should validate financial fields for cash flow transaction", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        initialData: {
          code: "ITEM001",
          name: "Test",
          propertyIds: ["prop-1"],
          createCashFlowTransaction: true,
          initialStock: "10",
          supplierId: "supplier-1",
          unitPrice: "100",
          paymentMethod: "" as unknown as PaymentMethod,
        },
        translations: mockTranslations,
      })
    );

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(false);
    expect(result.current.errors.paymentMethod).toBeDefined();
  });

  it("should validate financial fields for account payable", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        initialData: {
          code: "ITEM001",
          name: "Test",
          propertyIds: ["prop-1"],
          createAccountPayable: true,
          initialStock: "10",
          supplierId: "supplier-1",
        },
        translations: mockTranslations,
      })
    );

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(false);
    expect(result.current.errors.unitPrice).toBeDefined();
    expect(result.current.errors.dueDate).toBeDefined();
  });

  it("should return true for valid form", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        initialData: {
          code: "ITEM001",
          name: "Test Item",
          propertyIds: ["prop-1"],
          category: InventoryItemCategory.FEED,
        },
        translations: mockTranslations,
      })
    );

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(true);
  });

  it("should handle boolean field changes", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        translations: mockTranslations,
      })
    );

    act(() => {
      result.current.handleChange("hasExpiration", true);
    });

    expect(result.current.formData.hasExpiration).toBe(true);
  });

  it("should handle array field changes", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        translations: mockTranslations,
      })
    );

    act(() => {
      result.current.handleChange("propertyIds", ["prop-1", "prop-2"]);
    });

    expect(result.current.formData.propertyIds).toEqual(["prop-1", "prop-2"]);
  });

  it("should handle PaymentMethod field changes", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        translations: mockTranslations,
      })
    );

    act(() => {
      result.current.handleChange("paymentMethod", PaymentMethod.PIX);
    });

    expect(result.current.formData.paymentMethod).toBe(PaymentMethod.PIX);
  });
});
