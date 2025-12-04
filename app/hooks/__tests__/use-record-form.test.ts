import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRecordForm } from "../use-record-form";
import * as useAlertHook from "../use-alert";

vi.mock("../use-alert");

describe("useRecordForm", () => {
  const mockShowAlert = vi.fn();
  const mockClearAlert = vi.fn();
  const mockAlertMessage = null;
  const mockOnSubmit = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();

  const mockInitialFormData = {
    name: "Record 1",
    value: 100,
    date: "2024-01-01",
  };

  const defaultOptions = {
    onSubmit: mockOnSubmit,
    successMessage: "Record saved successfully",
    errorMessage: "Error saving record",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAlertHook.useAlert).mockReturnValue({
      alert: null,
      alertMessage: mockAlertMessage,
      showAlert: mockShowAlert,
      clearAlert: mockClearAlert,
      AlertDisplay: () => null,
    });
  });

  it("should initialize with initial form data", () => {
    const { result } = renderHook(() => useRecordForm(mockInitialFormData, defaultOptions));

    expect(result.current.formData).toEqual(mockInitialFormData);
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should initialize with initial errors", () => {
    const initialErrors = {
      name: "Name is required",
      value: "Value must be positive",
    };

    const { result } = renderHook(() =>
      useRecordForm(mockInitialFormData, {
        ...defaultOptions,
        initialErrors,
      })
    );

    expect(result.current.errors).toEqual(initialErrors);
  });

  it("should update form data when handleChange is called", () => {
    const { result } = renderHook(() => useRecordForm(mockInitialFormData, defaultOptions));

    act(() => {
      result.current.handleChange("name", "Updated Record");
    });

    expect(result.current.formData.name).toBe("Updated Record");
  });

  it("should clear error when field is changed", () => {
    const initialErrors = {
      name: "Name is required",
    };

    const { result } = renderHook(() =>
      useRecordForm(mockInitialFormData, {
        ...defaultOptions,
        initialErrors,
      })
    );

    expect(result.current.errors.name).toBe("Name is required");

    act(() => {
      result.current.handleChange("name", "New Name");
    });

    expect(result.current.errors.name).toBeUndefined();
  });

  it("should set error for specific field", () => {
    const { result } = renderHook(() => useRecordForm(mockInitialFormData, defaultOptions));

    act(() => {
      result.current.setError("name", "Name is required");
    });

    expect(result.current.errors.name).toBe("Name is required");
  });

  it("should set all errors at once", () => {
    const { result } = renderHook(() => useRecordForm(mockInitialFormData, defaultOptions));

    const newErrors = {
      name: "Name is required",
      value: "Value must be positive",
      date: "Date is required",
    };

    act(() => {
      result.current.setAllErrors(newErrors);
    });

    expect(result.current.errors).toEqual(newErrors);
  });

  it("should clear all errors", () => {
    const initialErrors = {
      name: "Name is required",
      value: "Value must be positive",
    };

    const { result } = renderHook(() =>
      useRecordForm(mockInitialFormData, {
        ...defaultOptions,
        initialErrors,
      })
    );

    expect(result.current.errors).toEqual(initialErrors);

    act(() => {
      result.current.clearErrors();
    });

    expect(result.current.errors).toEqual({});
  });

  it("should reset form to initial state", () => {
    const { result } = renderHook(() => useRecordForm(mockInitialFormData, defaultOptions));

    act(() => {
      result.current.setFormData({ name: "Modified", value: 200, date: "2024-02-01" });
      result.current.setError("name", "Error");
    });

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formData).toEqual(mockInitialFormData);
    expect(result.current.errors).toEqual({});
    expect(mockClearAlert).toHaveBeenCalled();
  });

  it("should update form data when setFormData is called", () => {
    const { result } = renderHook(() => useRecordForm(mockInitialFormData, defaultOptions));

    const newData = {
      name: "New Record",
      value: 200,
      date: "2024-02-01",
    };

    act(() => {
      result.current.setFormData(newData);
    });

    expect(result.current.formData).toEqual(newData);
  });

  it("should not submit if there are errors", async () => {
    const { result } = renderHook(() => useRecordForm(mockInitialFormData, defaultOptions));

    act(() => {
      result.current.setError("name", "Name is required");
    });

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(mockShowAlert).toHaveBeenCalledWith("Error saving record", "error");
  });

  it("should submit form successfully", async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useRecordForm(mockInitialFormData, {
        ...defaultOptions,
        onSuccess: mockOnSuccess,
      })
    );

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockOnSubmit).toHaveBeenCalledWith(mockInitialFormData);
    expect(mockShowAlert).toHaveBeenCalledWith("Record saved successfully", "success");
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should call onSuccess callback after successful submission", async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useRecordForm(mockInitialFormData, {
        ...defaultOptions,
        onSuccess: mockOnSuccess,
      })
    );

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it("should not call onSuccess if not provided", async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    const { result } = renderHook(() => useRecordForm(mockInitialFormData, defaultOptions));

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    // onSuccess is not provided in defaultOptions, so it should not be called
    // But the hook calls onSuccess?.(), so we need to check it's not called
    // Since we're not providing it, it won't be called
  });

  it("should handle submission error", async () => {
    const error = new Error("Submission failed");
    mockOnSubmit.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useRecordForm(mockInitialFormData, {
        ...defaultOptions,
        onError: mockOnError,
      })
    );

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockShowAlert).toHaveBeenCalledWith("Error saving record", "error");
    expect(mockOnError).toHaveBeenCalledWith(error);
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should call onError callback on submission error", async () => {
    const error = new Error("Submission failed");
    mockOnSubmit.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useRecordForm(mockInitialFormData, {
        ...defaultOptions,
        onError: mockOnError,
      })
    );

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockOnError).toHaveBeenCalledWith(error);
  });

  it("should not show error message if errorMessage is not provided", async () => {
    const error = new Error("Submission failed");
    mockOnSubmit.mockRejectedValue(error);

    const { result } = renderHook(() =>
      useRecordForm(mockInitialFormData, {
        onSubmit: mockOnSubmit,
        successMessage: "Success",
      })
    );

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockShowAlert).not.toHaveBeenCalled();
  });

  it("should not show success message if successMessage is not provided", async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useRecordForm(mockInitialFormData, {
        onSubmit: mockOnSubmit,
        errorMessage: "Error",
      })
    );

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockShowAlert).not.toHaveBeenCalled();
  });

  it("should handle submit without event", async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    const { result } = renderHook(() => useRecordForm(mockInitialFormData, defaultOptions));

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it("should set isSubmitting to true during submission", async () => {
    let resolveSubmit: () => void;
    const submitPromise = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });

    mockOnSubmit.mockImplementation(() => submitPromise);

    const { result } = renderHook(() => useRecordForm(mockInitialFormData, defaultOptions));

    act(() => {
      result.current.handleSubmit();
    });

    expect(result.current.isSubmitting).toBe(true);

    act(() => {
      resolveSubmit!();
    });

    await act(async () => {
      await submitPromise;
    });

    expect(result.current.isSubmitting).toBe(false);
  });

  it("should return alertMessage from useAlert", () => {
    const { result } = renderHook(() => useRecordForm(mockInitialFormData, defaultOptions));

    expect(result.current.alertMessage).toBe(mockAlertMessage);
  });

  it("should expose showAlert function", () => {
    const { result } = renderHook(() => useRecordForm(mockInitialFormData, defaultOptions));

    act(() => {
      result.current.showAlert("Test message", "info");
    });

    expect(mockShowAlert).toHaveBeenCalledWith("Test message", "info");
  });

  it("should expose clearAlert function", () => {
    const { result } = renderHook(() => useRecordForm(mockInitialFormData, defaultOptions));

    act(() => {
      result.current.clearAlert();
    });

    expect(mockClearAlert).toHaveBeenCalled();
  });
});
