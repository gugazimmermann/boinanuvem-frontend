import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useBaseForm } from "../use-base-form";
import * as useAlertHook from "../use-alert";

vi.mock("../use-alert");

describe("useBaseForm", () => {
  const mockInitialData = {
    name: "",
    email: "",
    age: 0,
  };

  const mockShowAlert = vi.fn();
  const mockAlertMessage = null;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAlertHook.useAlert).mockReturnValue({
      alert: null,
      alertMessage: mockAlertMessage,
      showAlert: mockShowAlert,
      clearAlert: vi.fn(),
      AlertDisplay: () => null,
    });
  });

  it("should initialize with initial data", () => {
    const { result } = renderHook(() =>
      useBaseForm({
        initialData: mockInitialData,
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.formData).toEqual(mockInitialData);
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should update form data when handleChange is called", () => {
    const { result } = renderHook(() =>
      useBaseForm({
        initialData: mockInitialData,
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("name", "John Doe");
    });

    expect(result.current.formData.name).toBe("John Doe");
  });

  it("should clear error when field is changed", () => {
    const { result } = renderHook(() =>
      useBaseForm({
        initialData: mockInitialData,
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.setError("name", "Name is required");
    });

    expect(result.current.errors.name).toBe("Name is required");

    act(() => {
      result.current.handleChange("name", "John");
    });

    expect(result.current.errors.name).toBeUndefined();
  });

  it("should handle form submission successfully", async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    const mockOnSuccess = vi.fn();

    const { result } = renderHook(() =>
      useBaseForm({
        initialData: mockInitialData,
        onSubmit: mockOnSubmit,
        onSuccess: mockOnSuccess,
        successMessage: "Success!",
      })
    );

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockOnSubmit).toHaveBeenCalledWith(mockInitialData);
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockShowAlert).toHaveBeenCalledWith("Success!", "success");
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should handle form submission with error", async () => {
    const mockError = new Error("Submission failed");
    const mockOnSubmit = vi.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() =>
      useBaseForm({
        initialData: mockInitialData,
        onSubmit: mockOnSubmit,
        errorMessage: "Error occurred",
      })
    );

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockOnSubmit).toHaveBeenCalled();
    expect(mockShowAlert).toHaveBeenCalledWith("Error occurred", "error");
    expect(result.current.isSubmitting).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it("should use default error message when errorMessage is not provided", async () => {
    const mockError = new Error("Submission failed");
    const mockOnSubmit = vi.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() =>
      useBaseForm({
        initialData: mockInitialData,
        onSubmit: mockOnSubmit,
      })
    );

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockShowAlert).toHaveBeenCalledWith("Error submitting form", "error");

    consoleErrorSpy.mockRestore();
  });

  it("should validate form data before submission", async () => {
    const mockValidate = vi.fn().mockReturnValue({
      name: "Name is required",
    });
    const mockOnSubmit = vi.fn();

    const { result } = renderHook(() =>
      useBaseForm({
        initialData: mockInitialData,
        onSubmit: mockOnSubmit,
        validate: mockValidate,
        errorMessage: "Validation failed",
      })
    );

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockValidate).toHaveBeenCalledWith(mockInitialData);
    expect(result.current.errors.name).toBe("Name is required");
    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(mockShowAlert).toHaveBeenCalledWith("Validation failed", "error");
  });

  it("should proceed with submission when validation returns true", async () => {
    const mockValidate = vi.fn().mockReturnValue(true);
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useBaseForm({
        initialData: mockInitialData,
        onSubmit: mockOnSubmit,
        validate: mockValidate,
      })
    );

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockValidate).toHaveBeenCalled();
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it("should transform data before submission", async () => {
    const mockTransform = vi.fn((data: Record<string, unknown>) => ({
      ...data,
      transformed: true,
    }));
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useBaseForm({
        initialData: mockInitialData,
        onSubmit: mockOnSubmit,
        transformData: mockTransform,
      })
    );

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockTransform).toHaveBeenCalledWith(mockInitialData);
    expect(mockOnSubmit).toHaveBeenCalledWith({
      ...mockInitialData,
      transformed: true,
    });
  });

  it("should update form data when initialData changes", () => {
    const { result, rerender } = renderHook(
      ({ initialData }) =>
        useBaseForm({
          initialData,
          onSubmit: vi.fn(),
        }),
      {
        initialProps: {
          initialData: mockInitialData,
        },
      }
    );

    const newInitialData = {
      name: "New Name",
      email: "new@email.com",
      age: 25,
    };

    rerender({ initialData: newInitialData });

    expect(result.current.formData).toEqual(newInitialData);
  });

  it("should not update form data when initialData reference changes but content is same", () => {
    const { result, rerender } = renderHook(
      ({ initialData }) =>
        useBaseForm({
          initialData,
          onSubmit: vi.fn(),
        }),
      {
        initialProps: {
          initialData: mockInitialData,
        },
      }
    );

    act(() => {
      result.current.handleChange("name", "Modified");
    });

    const sameData = { ...mockInitialData };
    rerender({ initialData: sameData });

    expect(result.current.formData.name).toBe("Modified");
  });

  it("should clear all errors", () => {
    const { result } = renderHook(() =>
      useBaseForm({
        initialData: mockInitialData,
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.setError("name", "Error 1");
      result.current.setError("email", "Error 2");
    });

    expect(Object.keys(result.current.errors)).toHaveLength(2);

    act(() => {
      result.current.clearErrors();
    });

    expect(result.current.errors).toEqual({});
  });

  it("should set error for specific field", () => {
    const { result } = renderHook(() =>
      useBaseForm({
        initialData: mockInitialData,
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.setError("name", "Name is required");
    });

    expect(result.current.errors.name).toBe("Name is required");
  });

  it("should handle synchronous onSubmit", async () => {
    const mockOnSubmit = vi.fn();

    const { result } = renderHook(() =>
      useBaseForm({
        initialData: mockInitialData,
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

    expect(mockOnSubmit).toHaveBeenCalled();
    expect(mockShowAlert).toHaveBeenCalledWith("Success!", "success");
  });

  it("should set isSubmitting to true during submission", async () => {
    let resolveSubmit: () => void;
    const mockOnSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        })
    );

    const { result } = renderHook(() =>
      useBaseForm({
        initialData: mockInitialData,
        onSubmit: mockOnSubmit,
      })
    );

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    act(() => {
      result.current.handleSubmit(mockEvent);
    });

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(true);
    });

    act(() => {
      resolveSubmit!();
    });

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  it("should handle validation returning object with errors", async () => {
    const mockValidate = vi.fn().mockReturnValue({
      name: "Name error",
      email: "Email error",
    });

    const { result } = renderHook(() =>
      useBaseForm({
        initialData: mockInitialData,
        onSubmit: vi.fn(),
        validate: mockValidate,
      })
    );

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(result.current.errors.name).toBe("Name error");
    expect(result.current.errors.email).toBe("Email error");
  });

  it("should expose setFormData", () => {
    const { result } = renderHook(() =>
      useBaseForm({
        initialData: mockInitialData,
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.setFormData({ name: "New", email: "new@test.com", age: 30 });
    });

    expect(result.current.formData).toEqual({
      name: "New",
      email: "new@test.com",
      age: 30,
    });
  });

  it("should expose setErrors", () => {
    const { result } = renderHook(() =>
      useBaseForm({
        initialData: mockInitialData,
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.setErrors({ name: "Error" });
    });

    expect(result.current.errors).toEqual({ name: "Error" });
  });
});
