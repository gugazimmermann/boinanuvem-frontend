import { describe, it, expect } from "vitest";
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
        minimumStockInvalid: "Invalid minimum stock",
        unitPriceInvalid: "Invalid unit price",
        initialStockInvalid: "Invalid initial stock",
        expirationDateRequired: "Expiration date is required",
        usageAmountInvalid: "Invalid usage amount",
        nitrogenContentInvalid: "Invalid nitrogen content",
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

  it("should initialize with default form data", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        translations: mockTranslations,
      })
    );

    expect(result.current.formData.code).toBe("");
    expect(result.current.formData.category).toBe(InventoryItemCategory.CUSTOM);
    expect(result.current.formData.unit).toBe("unidade");
    expect(result.current.formData.minimumStock).toBe("0");
    expect(result.current.formData.initialStock).toBe("0");
  });

  it("should merge initial data with defaults", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        initialData: {
          code: "I001",
          name: "Test Item",
        },
        translations: mockTranslations,
      })
    );

    expect(result.current.formData.code).toBe("I001");
    expect(result.current.formData.name).toBe("Test Item");
  });

  it("should update form data when handleChange is called", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        translations: mockTranslations,
      })
    );

    act(() => {
      result.current.handleChange("name", "New Item");
    });

    expect(result.current.formData.name).toBe("New Item");
  });

  it("should clear error when field is changed", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        translations: mockTranslations,
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.code).toBeDefined();

    act(() => {
      result.current.handleChange("code", "I001");
    });

    expect(result.current.errors.code).toBeUndefined();
  });

  it("should validate code field", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        translations: mockTranslations,
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.code).toBeDefined();
  });

  it("should validate name field", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        translations: mockTranslations,
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.name).toBeDefined();
  });

  it("should validate propertyIds field", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        translations: mockTranslations,
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.propertyIds).toBeDefined();
  });

  it("should validate customCategory when category is CUSTOM", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        initialData: {
          category: InventoryItemCategory.CUSTOM,
        },
        translations: mockTranslations,
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.customCategory).toBeDefined();
  });

  it("should validate minimumStock is non-negative", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        initialData: {
          code: "I001",
          name: "Test",
          propertyIds: ["P001"],
          minimumStock: "-10",
        },
        translations: mockTranslations,
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.minimumStock).toBeDefined();
  });

  it("should validate unitPrice is positive when provided", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        initialData: {
          code: "I001",
          name: "Test",
          propertyIds: ["P001"],
          unitPrice: "-10",
        },
        translations: mockTranslations,
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.unitPrice).toBeDefined();
  });

  it("should validate expirationDate when hasExpiration is true", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        initialData: {
          code: "I001",
          name: "Test",
          propertyIds: ["P001"],
          hasExpiration: true,
          expirationDate: "",
        },
        translations: mockTranslations,
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.expirationDate).toBeDefined();
  });

  it("should validate usageAmount for medicines and vaccines", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        initialData: {
          code: "I001",
          name: "Test",
          propertyIds: ["P001"],
          category: InventoryItemCategory.MEDICINES,
          usageAmount: "-10",
        },
        translations: mockTranslations,
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.usageAmount).toBeDefined();
  });

  it("should validate nitrogenContent for fertilizers", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        initialData: {
          code: "I001",
          name: "Test",
          propertyIds: ["P001"],
          category: InventoryItemCategory.FERTILIZER,
          nitrogenContent: "-10",
        },
        translations: mockTranslations,
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.nitrogenContent).toBeDefined();
  });

  it("should validate financial fields when createCashFlowTransaction is true", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        initialData: {
          code: "I001",
          name: "Test",
          propertyIds: ["P001"],
          initialStock: "10",
          supplierId: "S001",
          createCashFlowTransaction: true,
          unitPrice: "",
        },
        translations: mockTranslations,
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.unitPrice).toBeDefined();
  });

  it("should validate dueDate when createAccountPayable is true", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        initialData: {
          code: "I001",
          name: "Test",
          propertyIds: ["P001"],
          initialStock: "10",
          supplierId: "S001",
          createAccountPayable: true,
          dueDate: "",
        },
        translations: mockTranslations,
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.dueDate).toBeDefined();
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
      result.current.handleChange("propertyIds", ["P001", "P002"]);
    });

    expect(result.current.formData.propertyIds).toEqual(["P001", "P002"]);
  });

  it("should handle PaymentMethod field changes", () => {
    const { result } = renderHook(() =>
      useInventoryForm({
        translations: mockTranslations,
      })
    );

    act(() => {
      result.current.handleChange("paymentMethod", PaymentMethod.CREDIT_CARD);
    });

    expect(result.current.formData.paymentMethod).toBe(PaymentMethod.CREDIT_CARD);
  });
});
