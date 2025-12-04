import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useBaseMovementForm } from "../use-base-movement-form";
import * as useAlertHook from "../use-alert";

vi.mock("../use-alert");

describe("useBaseMovementForm", () => {
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

  it("should initialize with default values", () => {
    const { result } = renderHook(() =>
      useBaseMovementForm({
        onSubmit: vi.fn(),
      })
    );

    const today = new Date().toISOString().split("T")[0];
    expect(result.current.formData.date).toBe(today);
    expect(result.current.formData.employeeIds).toEqual([]);
    expect(result.current.formData.serviceProviderIds).toEqual([]);
    expect(result.current.formData.observation).toBe("");
    expect(result.current.files).toEqual([]);
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should initialize with provided initialData", () => {
    const initialData = {
      date: "2024-01-15",
      employeeIds: ["emp-1"],
      serviceProviderIds: ["sp-1"],
      observation: "Test observation",
    };

    const { result } = renderHook(() =>
      useBaseMovementForm({
        initialData,
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.formData.date).toBe("2024-01-15");
    expect(result.current.formData.employeeIds).toEqual(["emp-1"]);
    expect(result.current.formData.serviceProviderIds).toEqual(["sp-1"]);
    expect(result.current.formData.observation).toBe("Test observation");
  });

  it("should handle field changes", () => {
    const { result } = renderHook(() =>
      useBaseMovementForm({
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("date", "2024-01-20");
    });

    expect(result.current.formData.date).toBe("2024-01-20");
  });

  it("should handle boolean field changes", () => {
    const extendedFormData = {
      date: "2024-01-15",
      employeeIds: [] as string[],
      serviceProviderIds: [] as string[],
      observation: "",
      confirmed: false,
    };

    const { result } = renderHook(() =>
      useBaseMovementForm({
        initialData: extendedFormData,
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("confirmed", true);
    });

    expect(result.current.formData.confirmed).toBe(true);
  });

  it("should clear error when field is changed", () => {
    const { result } = renderHook(() =>
      useBaseMovementForm({
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.setErrors({ date: "Date is required" });
    });

    expect(result.current.errors.date).toBe("Date is required");

    act(() => {
      result.current.handleChange("date", "2024-01-20");
    });

    expect(result.current.errors.date).toBeUndefined();
  });

  it("should toggle employee selection", () => {
    const { result } = renderHook(() =>
      useBaseMovementForm({
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.toggleSelection("employeeIds", "emp-1");
    });

    expect(result.current.formData.employeeIds).toContain("emp-1");

    act(() => {
      result.current.toggleSelection("employeeIds", "emp-1");
    });

    expect(result.current.formData.employeeIds).not.toContain("emp-1");
  });

  it("should toggle service provider selection", () => {
    const { result } = renderHook(() =>
      useBaseMovementForm({
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.toggleSelection("serviceProviderIds", "sp-1");
    });

    expect(result.current.formData.serviceProviderIds).toContain("sp-1");

    act(() => {
      result.current.toggleSelection("serviceProviderIds", "sp-1");
    });

    expect(result.current.formData.serviceProviderIds).not.toContain("sp-1");
  });

  it("should clear errors when toggling selection", () => {
    const { result } = renderHook(() =>
      useBaseMovementForm({
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.setErrors({
        employeeIds: "Required",
        responsible: "Required",
      });
    });

    act(() => {
      result.current.toggleSelection("employeeIds", "emp-1");
    });

    expect(result.current.errors.employeeIds).toBeUndefined();
    expect(result.current.errors.responsible).toBeUndefined();
  });

  it("should handle form submission successfully", async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    const mockOnSuccess = vi.fn();

    const { result } = renderHook(() =>
      useBaseMovementForm({
        onSubmit: mockOnSubmit,
        onSuccess: mockOnSuccess,
        successMessage: "Success!",
      })
    );

    const mockFile = new File(["content"], "test.txt", { type: "text/plain" });
    act(() => {
      result.current.setFiles([mockFile]);
    });

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockOnSubmit).toHaveBeenCalled();
    expect(mockOnSubmit.mock.calls[0]?.[0]).toEqual(result.current.formData);
    expect(Array.isArray(mockOnSubmit.mock.calls[0]?.[1])).toBe(true);
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockShowAlert).toHaveBeenCalledWith("Success!", "success");
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should generate file IDs for submission", async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useBaseMovementForm({
        onSubmit: mockOnSubmit,
      })
    );

    const mockFile1 = new File(["content1"], "test1.txt", { type: "text/plain" });
    const mockFile2 = new File(["content2"], "test2.txt", { type: "text/plain" });

    act(() => {
      result.current.setFiles([mockFile1, mockFile2]);
    });

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    const fileIds = mockOnSubmit.mock.calls[0]?.[1] as string[];
    expect(fileIds).toHaveLength(2);
    expect(fileIds[0]).toMatch(/^file-\d+-\d+$/);
    expect(fileIds[1]).toMatch(/^file-\d+-\d+$/);
  });

  it("should handle submission error", async () => {
    const mockError = new Error("Submission failed");
    const mockOnSubmit = vi.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() =>
      useBaseMovementForm({
        onSubmit: mockOnSubmit,
        errorMessage: "Error occurred",
        errorContext: "test movement",
      })
    );

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith("Error submitting test movement:", mockError);
    expect(mockShowAlert).toHaveBeenCalledWith("Error occurred", "error");
    expect(result.current.isSubmitting).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it("should use default errorContext when not provided", async () => {
    const mockError = new Error("Submission failed");
    const mockOnSubmit = vi.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() =>
      useBaseMovementForm({
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

    expect(consoleErrorSpy).toHaveBeenCalledWith("Error submitting movement:", mockError);

    consoleErrorSpy.mockRestore();
  });

  it("should validate before submission", async () => {
    const mockValidate = vi.fn().mockReturnValue({
      date: "Date is required",
    });
    const mockOnSubmit = vi.fn();

    const { result } = renderHook(() =>
      useBaseMovementForm({
        onSubmit: mockOnSubmit,
        validateBeforeSubmit: mockValidate,
      })
    );

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockValidate).toHaveBeenCalledWith(result.current.formData);
    expect(result.current.errors.date).toBe("Date is required");
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should proceed with submission when validation returns true", async () => {
    const mockValidate = vi.fn().mockReturnValue(true);
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useBaseMovementForm({
        onSubmit: mockOnSubmit,
        validateBeforeSubmit: mockValidate,
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

  it("should not call onSuccess when not provided", async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useBaseMovementForm({
        onSubmit: mockOnSubmit,
      })
    );

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it("should handle multiple employee selections", () => {
    const { result } = renderHook(() =>
      useBaseMovementForm({
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.toggleSelection("employeeIds", "emp-1");
      result.current.toggleSelection("employeeIds", "emp-2");
      result.current.toggleSelection("employeeIds", "emp-3");
    });

    expect(result.current.formData.employeeIds).toHaveLength(3);
    expect(result.current.formData.employeeIds).toContain("emp-1");
    expect(result.current.formData.employeeIds).toContain("emp-2");
    expect(result.current.formData.employeeIds).toContain("emp-3");
  });

  it("should handle multiple service provider selections", () => {
    const { result } = renderHook(() =>
      useBaseMovementForm({
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.toggleSelection("serviceProviderIds", "sp-1");
      result.current.toggleSelection("serviceProviderIds", "sp-2");
    });

    expect(result.current.formData.serviceProviderIds).toHaveLength(2);
    expect(result.current.formData.serviceProviderIds).toContain("sp-1");
    expect(result.current.formData.serviceProviderIds).toContain("sp-2");
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
      useBaseMovementForm({
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

  it("should expose setFormData", () => {
    const { result } = renderHook(() =>
      useBaseMovementForm({
        onSubmit: vi.fn(),
      })
    );

    const newData = {
      date: "2024-02-01",
      employeeIds: ["emp-1"],
      serviceProviderIds: ["sp-1"],
      observation: "New observation",
    };

    act(() => {
      result.current.setFormData(newData as typeof result.current.formData);
    });

    expect(result.current.formData).toEqual(newData);
  });

  it("should expose setFiles", () => {
    const { result } = renderHook(() =>
      useBaseMovementForm({
        onSubmit: vi.fn(),
      })
    );

    const mockFile = new File(["content"], "test.txt", { type: "text/plain" });

    act(() => {
      result.current.setFiles([mockFile]);
    });

    expect(result.current.files).toEqual([mockFile]);
  });

  it("should expose setErrors", () => {
    const { result } = renderHook(() =>
      useBaseMovementForm({
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.setErrors({ date: "Error" });
    });

    expect(result.current.errors).toEqual({ date: "Error" });
  });
});
