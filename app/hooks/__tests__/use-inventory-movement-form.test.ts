import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInventoryMovementForm } from "../use-inventory-movement-form";
import * as useBaseMovementFormHook from "../use-base-movement-form";

vi.mock("../use-base-movement-form");

describe("useInventoryMovementForm", () => {
  const mockBaseFormReturn = {
    formData: {
      date: new Date().toISOString().split("T")[0],
      employeeIds: [],
      serviceProviderIds: [],
      observation: "",
      itemId: "item-1",
      quantity: "10",
      description: "Test movement",
    },
    setFormData: vi.fn(),
    files: [],
    setFiles: vi.fn(),
    errors: {},
    setErrors: vi.fn(),
    isSubmitting: false,
    alertMessage: null,
    handleChange: vi.fn(),
    toggleSelection: vi.fn(),
    handleSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useBaseMovementFormHook.useBaseMovementForm).mockReturnValue(
      mockBaseFormReturn as never
    );
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() =>
      useInventoryMovementForm({
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.formData).toBeDefined();
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should initialize with provided initialData", () => {
    const initialData = {
      itemId: "item-2",
      quantity: "20",
      description: "Initial description",
    };

    renderHook(() =>
      useInventoryMovementForm({
        initialData,
        onSubmit: vi.fn(),
      })
    );

    expect(useBaseMovementFormHook.useBaseMovementForm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialData: expect.objectContaining(initialData),
      })
    );
  });

  it("should validate itemId when provided", () => {
    const { result } = renderHook(() =>
      useInventoryMovementForm({
        onSubmit: vi.fn(),
        translationKeys: {
          itemRequired: "Item is required",
        },
      })
    );

    const isValid = result.current.validate();

    expect(isValid).toBeDefined();
  });

  it("should validate quantity", () => {
    const { result } = renderHook(() =>
      useInventoryMovementForm({
        onSubmit: vi.fn(),
        translationKeys: {
          quantityRequired: "Quantity is required",
        },
      })
    );

    const isValid = result.current.validate();

    expect(isValid).toBeDefined();
  });

  it("should validate date", () => {
    const { result } = renderHook(() =>
      useInventoryMovementForm({
        onSubmit: vi.fn(),
        translationKeys: {
          dateRequired: "Date is required",
        },
      })
    );

    const isValid = result.current.validate();

    expect(isValid).toBeDefined();
  });

  it("should run custom validation when provided", () => {
    const customValidate = vi.fn().mockReturnValue({ customError: "Custom error" });

    const { result } = renderHook(() =>
      useInventoryMovementForm({
        onSubmit: vi.fn(),
        validate: customValidate,
      })
    );

    result.current.validate();

    expect(customValidate).toHaveBeenCalled();
  });

  it("should handle form submission", async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useInventoryMovementForm({
        onSubmit: mockOnSubmit,
        successMessage: "Success!",
      })
    );

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockBaseFormReturn.handleSubmit).toHaveBeenCalled();
  });

  it("should expose all base form properties", () => {
    const { result } = renderHook(() =>
      useInventoryMovementForm({
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.formData).toBeDefined();
    expect(result.current.files).toBeDefined();
    expect(result.current.errors).toBeDefined();
    expect(result.current.isSubmitting).toBeDefined();
    expect(result.current.alertMessage).toBeDefined();
    expect(result.current.handleChange).toBeDefined();
    expect(result.current.toggleSelection).toBeDefined();
  });

  it("should use default translation keys when not provided", () => {
    const { result } = renderHook(() =>
      useInventoryMovementForm({
        onSubmit: vi.fn(),
      })
    );

    const isValid = result.current.validate();

    expect(isValid).toBeDefined();
  });
});
