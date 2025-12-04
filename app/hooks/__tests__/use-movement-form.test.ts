import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMovementForm } from "../use-movement-form";
import * as useBaseMovementFormHook from "../use-base-movement-form";

vi.mock("../use-base-movement-form");

describe("useMovementForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockSetFormData = vi.fn();
  const mockHandleChange = vi.fn();
  const mockToggleSelection = vi.fn();
  const mockHandleSubmit = vi.fn();

  const mockBaseForm = {
    formData: {
      date: "",
      locationIds: [],
      employeeIds: [],
      serviceProviderIds: [],
      observation: "",
    },
    setFormData: mockSetFormData,
    files: [],
    setFiles: vi.fn(),
    errors: {},
    isSubmitting: false,
    alertMessage: null,
    handleChange: mockHandleChange,
    toggleSelection: mockToggleSelection,
    handleSubmit: mockHandleSubmit,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useBaseMovementFormHook.useBaseMovementForm).mockReturnValue(mockBaseForm);
  });

  it("should return base form data and handlers", () => {
    const { result } = renderHook(() =>
      useMovementForm({
        onSubmit: mockOnSubmit,
      })
    );

    expect(result.current.formData).toEqual(mockBaseForm.formData);
    expect(result.current.setFormData).toBe(mockSetFormData);
    expect(result.current.files).toEqual([]);
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.alertMessage).toBe(null);
    expect(result.current.handleChange).toBeDefined();
    expect(result.current.toggleSelection).toBe(mockToggleSelection);
    expect(result.current.handleSubmit).toBe(mockHandleSubmit);
  });

  it("should call useBaseMovementForm with correct options", () => {
    renderHook(() =>
      useMovementForm({
        onSubmit: mockOnSubmit,
      })
    );

    expect(useBaseMovementFormHook.useBaseMovementForm).toHaveBeenCalledWith({
      initialData: undefined,
      onSubmit: mockOnSubmit,
      onSuccess: undefined,
      successMessage: undefined,
      errorMessage: undefined,
      validateBeforeSubmit: undefined,
      errorContext: "movement",
    });
  });

  it("should pass initialData to useBaseMovementForm", () => {
    const initialData = {
      date: "2024-01-01",
      locationIds: ["loc-1"],
    };

    renderHook(() =>
      useMovementForm({
        initialData,
        onSubmit: mockOnSubmit,
      })
    );

    expect(useBaseMovementFormHook.useBaseMovementForm).toHaveBeenCalledWith(
      expect.objectContaining({
        initialData,
      })
    );
  });

  it("should pass onSuccess to useBaseMovementForm", () => {
    renderHook(() =>
      useMovementForm({
        onSubmit: mockOnSubmit,
        onSuccess: mockOnSuccess,
      })
    );

    expect(useBaseMovementFormHook.useBaseMovementForm).toHaveBeenCalledWith(
      expect.objectContaining({
        onSuccess: mockOnSuccess,
      })
    );
  });

  it("should pass successMessage to useBaseMovementForm", () => {
    const successMessage = "Movement saved successfully";

    renderHook(() =>
      useMovementForm({
        onSubmit: mockOnSubmit,
        successMessage,
      })
    );

    expect(useBaseMovementFormHook.useBaseMovementForm).toHaveBeenCalledWith(
      expect.objectContaining({
        successMessage,
      })
    );
  });

  it("should pass errorMessage to useBaseMovementForm", () => {
    const errorMessage = "Error saving movement";

    renderHook(() =>
      useMovementForm({
        onSubmit: mockOnSubmit,
        errorMessage,
      })
    );

    expect(useBaseMovementFormHook.useBaseMovementForm).toHaveBeenCalledWith(
      expect.objectContaining({
        errorMessage,
      })
    );
  });

  it("should pass validate function to useBaseMovementForm", () => {
    const validate = vi.fn((data: Record<string, unknown>) => {
      if (!data.date) {
        return { date: "Date is required" };
      }
      return true;
    });

    renderHook(() =>
      useMovementForm({
        onSubmit: mockOnSubmit,
        validate,
      })
    );

    expect(useBaseMovementFormHook.useBaseMovementForm).toHaveBeenCalledWith(
      expect.objectContaining({
        validateBeforeSubmit: expect.any(Function),
      })
    );
  });

  it("should wrap validate function to return errors object", () => {
    const validate = vi.fn((data: Record<string, unknown>) => {
      if (!data.date) {
        return { date: "Date is required" };
      }
      return true;
    });

    renderHook(() =>
      useMovementForm({
        onSubmit: mockOnSubmit,
        validate,
      })
    );

    const callArgs = vi.mocked(useBaseMovementFormHook.useBaseMovementForm).mock.calls[0][0];
    const validateBeforeSubmit = callArgs.validateBeforeSubmit;

    expect(validateBeforeSubmit).toBeDefined();

    const resultWithErrors = validateBeforeSubmit!({ date: "" } as Record<string, unknown>);
    expect(resultWithErrors).toEqual({ date: "Date is required" });

    const resultValid = validateBeforeSubmit!({ date: "2024-01-01" } as Record<string, unknown>);
    expect(resultValid).toBe(true);
  });

  it("should handle handleChange with string value", () => {
    const { result } = renderHook(() =>
      useMovementForm({
        onSubmit: mockOnSubmit,
      })
    );

    act(() => {
      result.current.handleChange("date", "2024-01-01");
    });

    expect(mockHandleChange).toHaveBeenCalledWith("date", "2024-01-01");
  });

  it("should handle handleChange with string array value", () => {
    const { result } = renderHook(() =>
      useMovementForm({
        onSubmit: mockOnSubmit,
      })
    );

    act(() => {
      result.current.handleChange("employeeIds", ["emp-1", "emp-2"]);
    });

    expect(mockHandleChange).toHaveBeenCalledWith("employeeIds", ["emp-1", "emp-2"]);
  });

  it("should handle toggleSelection for employeeIds", () => {
    const { result } = renderHook(() =>
      useMovementForm({
        onSubmit: mockOnSubmit,
      })
    );

    act(() => {
      result.current.toggleSelection("employeeIds", "emp-1");
    });

    expect(mockToggleSelection).toHaveBeenCalledWith("employeeIds", "emp-1");
  });

  it("should handle toggleSelection for serviceProviderIds", () => {
    const { result } = renderHook(() =>
      useMovementForm({
        onSubmit: mockOnSubmit,
      })
    );

    act(() => {
      result.current.toggleSelection("serviceProviderIds", "sp-1");
    });

    expect(mockToggleSelection).toHaveBeenCalledWith("serviceProviderIds", "sp-1");
  });

  it("should handle form submission", async () => {
    const { result } = renderHook(() =>
      useMovementForm({
        onSubmit: mockOnSubmit,
      })
    );

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockHandleSubmit).toHaveBeenCalledWith(mockEvent);
  });

  it("should update formData when setFormData is called", () => {
    const updatedFormData = {
      date: "2024-01-01",
      locationIds: ["loc-1"],
      employeeIds: [],
      serviceProviderIds: [],
      observation: "Test observation",
    };

    vi.mocked(useBaseMovementFormHook.useBaseMovementForm).mockReturnValue({
      ...mockBaseForm,
      formData: updatedFormData,
    });

    const { result } = renderHook(() =>
      useMovementForm({
        onSubmit: mockOnSubmit,
      })
    );

    expect(result.current.formData).toEqual(updatedFormData);
  });

  it("should update files when setFiles is called", () => {
    const mockFiles = [new File([], "test.jpg")];

    vi.mocked(useBaseMovementFormHook.useBaseMovementForm).mockReturnValue({
      ...mockBaseForm,
      files: mockFiles,
    });

    const { result } = renderHook(() =>
      useMovementForm({
        onSubmit: mockOnSubmit,
      })
    );

    expect(result.current.files).toEqual(mockFiles);
  });

  it("should update errors when validation fails", () => {
    const mockErrors = {
      date: "Date is required",
      locationIds: "At least one location is required",
    };

    vi.mocked(useBaseMovementFormHook.useBaseMovementForm).mockReturnValue({
      ...mockBaseForm,
      errors: mockErrors,
    });

    const { result } = renderHook(() =>
      useMovementForm({
        onSubmit: mockOnSubmit,
      })
    );

    expect(result.current.errors).toEqual(mockErrors);
  });

  it("should update isSubmitting state", () => {
    vi.mocked(useBaseMovementFormHook.useBaseMovementForm).mockReturnValue({
      ...mockBaseForm,
      isSubmitting: true,
    });

    const { result } = renderHook(() =>
      useMovementForm({
        onSubmit: mockOnSubmit,
      })
    );

    expect(result.current.isSubmitting).toBe(true);
  });

  it("should update alertMessage", () => {
    const mockAlertMessage = {
      message: "Success",
      variant: "success" as const,
    };

    vi.mocked(useBaseMovementFormHook.useBaseMovementForm).mockReturnValue({
      ...mockBaseForm,
      alertMessage: mockAlertMessage,
    });

    const { result } = renderHook(() =>
      useMovementForm({
        onSubmit: mockOnSubmit,
      })
    );

    expect(result.current.alertMessage).toEqual(mockAlertMessage);
  });
});
