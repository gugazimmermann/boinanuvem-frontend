import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useRecordForm } from "../use-record-form";
import { useAlert } from "../use-alert";

vi.mock("../use-alert", () => ({
  useAlert: vi.fn(),
}));

describe("useRecordForm", () => {
  let mockShowAlert: ReturnType<typeof vi.fn>;
  let mockClearAlert: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockShowAlert = vi.fn();
    mockClearAlert = vi.fn();

    vi.mocked(useAlert).mockReturnValue({
      alert: null,
      alertMessage: null,
      showAlert: mockShowAlert,
      clearAlert: mockClearAlert,
      AlertDisplay: () => null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with provided initial form data", () => {
    const initialData = { name: "Test", value: 10 };
    const { result } = renderHook(() =>
      useRecordForm(initialData, {
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.formData).toEqual(initialData);
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should initialize with provided initial errors", () => {
    const initialErrors = { name: "Name is required" };
    const { result } = renderHook(() =>
      useRecordForm(
        { name: "" },
        {
          initialErrors,
          onSubmit: vi.fn(),
        }
      )
    );

    expect(result.current.errors).toEqual(initialErrors);
  });

  it("should update form data when handleChange is called", () => {
    const { result } = renderHook(() =>
      useRecordForm(
        { name: "" },
        {
          onSubmit: vi.fn(),
        }
      )
    );

    act(() => {
      result.current.handleChange("name", "New Name");
    });

    expect(result.current.formData.name).toBe("New Name");
  });

  it("should clear error when field is changed", () => {
    const { result } = renderHook(() =>
      useRecordForm(
        { name: "" },
        {
          initialErrors: { name: "Name is required" },
          onSubmit: vi.fn(),
        }
      )
    );

    expect(result.current.errors.name).toBeDefined();

    act(() => {
      result.current.handleChange("name", "New Name");
    });

    expect(result.current.errors.name).toBeUndefined();
  });

  it("should set error when setError is called", () => {
    const { result } = renderHook(() =>
      useRecordForm(
        { name: "" },
        {
          onSubmit: vi.fn(),
        }
      )
    );

    act(() => {
      result.current.setError("name", "Name is required");
    });

    expect(result.current.errors.name).toBe("Name is required");
  });

  it("should set all errors when setAllErrors is called", () => {
    const { result } = renderHook(() =>
      useRecordForm(
        { name: "", email: "" },
        {
          onSubmit: vi.fn(),
        }
      )
    );

    act(() => {
      result.current.setAllErrors({
        name: "Name is required",
        email: "Email is required",
      });
    });

    expect(result.current.errors).toEqual({
      name: "Name is required",
      email: "Email is required",
    });
  });

  it("should clear all errors when clearErrors is called", () => {
    const { result } = renderHook(() =>
      useRecordForm(
        { name: "" },
        {
          initialErrors: { name: "Name is required" },
          onSubmit: vi.fn(),
        }
      )
    );

    act(() => {
      result.current.clearErrors();
    });

    expect(result.current.errors).toEqual({});
  });

  it("should reset form to initial data", () => {
    const initialData = { name: "Initial" };
    const { result } = renderHook(() =>
      useRecordForm(initialData, {
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("name", "Modified");
    });

    expect(result.current.formData.name).toBe("Modified");

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formData.name).toBe("Initial");
    expect(result.current.errors).toEqual({});
    expect(mockClearAlert).toHaveBeenCalled();
  });

  it("should call onSubmit when form is valid", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useRecordForm(
        { name: "Test" },
        {
          onSubmit,
        }
      )
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({ name: "Test" });
  });

  it("should prevent default when event is provided", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useRecordForm(
        { name: "Test" },
        {
          onSubmit,
        }
      )
    );

    const event = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("should not submit when errors exist", async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useRecordForm(
        { name: "" },
        {
          initialErrors: { name: "Name is required" },
          onSubmit,
          errorMessage: "Validation failed",
        }
      )
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("should show error message when errors exist", async () => {
    const { result } = renderHook(() =>
      useRecordForm(
        { name: "" },
        {
          initialErrors: { name: "Name is required" },
          onSubmit: vi.fn(),
          errorMessage: "Validation failed",
        }
      )
    );

    expect(result.current).not.toBeNull();

    await act(async () => {
      if (result.current) {
        await result.current.handleSubmit();
      }
    });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(mockShowAlert).toHaveBeenCalledWith("Validation failed", "error");
  });

  it("should show success message after successful submission", async () => {
    const { result } = renderHook(() =>
      useRecordForm(
        { name: "Test" },
        {
          onSubmit: vi.fn().mockResolvedValue(undefined),
          successMessage: "Record saved",
        }
      )
    );

    expect(result.current).not.toBeNull();

    await act(async () => {
      if (result.current) {
        await result.current.handleSubmit();
      }
    });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(mockShowAlert).toHaveBeenCalledWith("Record saved", "success");
  });

  it("should call onSuccess after successful submission", async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() =>
      useRecordForm(
        { name: "Test" },
        {
          onSubmit: vi.fn().mockResolvedValue(undefined),
          onSuccess,
        }
      )
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSuccess).toHaveBeenCalled();
  });

  it("should show error message when submission fails", async () => {
    const { result } = renderHook(() =>
      useRecordForm(
        { name: "Test" },
        {
          onSubmit: vi.fn().mockRejectedValue(new Error("Failed")),
          errorMessage: "Failed to save record",
        }
      )
    );

    expect(result.current).not.toBeNull();

    await act(async () => {
      if (result.current) {
        await result.current.handleSubmit();
      }
    });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(mockShowAlert).toHaveBeenCalledWith("Failed to save record", "error");
  });

  it("should call onError when submission fails", async () => {
    const onError = vi.fn();
    const error = new Error("Failed");
    const { result } = renderHook(() =>
      useRecordForm(
        { name: "Test" },
        {
          onSubmit: vi.fn().mockRejectedValue(error),
          onError,
        }
      )
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onError).toHaveBeenCalledWith(error);
  });

  it("should set isSubmitting during submission", async () => {
    vi.useRealTimers();
    const onSubmit = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 10)));
    const { result } = renderHook(() =>
      useRecordForm(
        { name: "Test" },
        {
          onSubmit,
        }
      )
    );

    expect(result.current).not.toBeNull();

    // Start submission without awaiting
    act(() => {
      if (result.current) {
        result.current.handleSubmit();
      }
    });

    // Wait for state update to be processed
    await waitFor(
      () => {
        expect(result.current.isSubmitting).toBe(true);
      },
      { timeout: 1000 }
    );

    // Wait for submission to complete
    await waitFor(
      () => {
        expect(result.current.isSubmitting).toBe(false);
      },
      { timeout: 1000 }
    );

    vi.useFakeTimers();
  });
});
