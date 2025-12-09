import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useBaseForm } from "../use-base-form";

describe("useBaseForm", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("should initialize with provided initial data", () => {
    const initialData = { name: "John", email: "john@example.com" };
    const { result } = renderHook(() =>
      useBaseForm({
        initialData,
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.formData).toEqual(initialData);
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should update form data when handleChange is called", () => {
    const { result } = renderHook(() =>
      useBaseForm({
        initialData: { name: "", email: "" },
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.handleChange("name", "John Doe");
    });

    expect(result.current.formData.name).toBe("John Doe");
  });

  it("should clear error for field when value changes", () => {
    const { result } = renderHook(() =>
      useBaseForm({
        initialData: { name: "", email: "" },
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.setError("name", "Name is required");
    });

    expect(result.current.errors.name).toBe("Name is required");

    act(() => {
      result.current.handleChange("name", "John Doe");
    });

    expect(result.current.errors.name).toBeUndefined();
  });

  it("should clear all errors when clearErrors is called", () => {
    const { result } = renderHook(() =>
      useBaseForm({
        initialData: { name: "", email: "" },
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.setError("name", "Name is required");
      result.current.setError("email", "Email is required");
    });

    expect(Object.keys(result.current.errors)).toHaveLength(2);

    act(() => {
      result.current.clearErrors();
    });

    expect(result.current.errors).toEqual({});
  });

  it("should set error when setError is called", () => {
    const { result } = renderHook(() =>
      useBaseForm({
        initialData: { name: "" },
        onSubmit: vi.fn(),
      })
    );

    act(() => {
      result.current.setError("name", "Name is required");
    });

    expect(result.current.errors.name).toBe("Name is required");
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
          initialData: { name: "John", email: "john@example.com" },
        },
      }
    );

    expect(result.current.formData.name).toBe("John");

    rerender({
      initialData: { name: "Jane", email: "jane@example.com" },
    });

    expect(result.current.formData.name).toBe("Jane");
  });

  it("should not update form data when initialData reference changes but content is same", () => {
    const initialData = { name: "John", email: "john@example.com" };
    const { result, rerender } = renderHook(
      ({ initialData }) =>
        useBaseForm({
          initialData,
          onSubmit: vi.fn(),
        }),
      {
        initialProps: { initialData },
      }
    );

    const firstFormData = result.current.formData;

    rerender({
      initialData: { name: "John", email: "john@example.com" },
    });

    expect(result.current.formData).toBe(firstFormData);
  });

  describe("handleSubmit", () => {
    it("should call onSubmit when form is valid", async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useBaseForm({
          initialData: { name: "John" },
          onSubmit,
        })
      );

      const event = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleSubmit(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(onSubmit).toHaveBeenCalledWith({ name: "John" });
    });

    it("should set isSubmitting during submission", async () => {
      vi.useRealTimers();
      const onSubmit = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 10)));
      const { result } = renderHook(() =>
        useBaseForm({
          initialData: { name: "John" },
          onSubmit,
        })
      );

      const event = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent;

      // Start submission without awaiting
      act(() => {
        result.current.handleSubmit(event);
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

    it("should call onSuccess after successful submission", async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      const onSuccess = vi.fn();
      const { result } = renderHook(() =>
        useBaseForm({
          initialData: { name: "John" },
          onSubmit,
          onSuccess,
        })
      );

      expect(result.current).not.toBeNull();

      const event = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        if (result.current) {
          await result.current.handleSubmit(event);
        }
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it("should show success message after successful submission", async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useBaseForm({
          initialData: { name: "John" },
          onSubmit,
          successMessage: "Form submitted successfully",
        })
      );

      expect(result.current).not.toBeNull();

      const event = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        if (result.current) {
          await result.current.handleSubmit(event);
        }
      });

      // Alert should be set immediately after submission
      expect(result.current.alertMessage).toEqual({
        title: "Form submitted successfully",
        variant: "success",
      });
    });

    it("should show error message when submission fails", async () => {
      const onSubmit = vi.fn().mockRejectedValue(new Error("Submission failed"));
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const { result } = renderHook(() =>
        useBaseForm({
          initialData: { name: "John" },
          onSubmit,
          errorMessage: "Failed to submit form",
        })
      );

      expect(result.current).not.toBeNull();

      const event = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        if (result.current) {
          await result.current.handleSubmit(event);
        }
      });

      // Alert should be set immediately after error
      expect(result.current.alertMessage).toEqual({
        title: "Failed to submit form",
        variant: "error",
      });

      consoleErrorSpy.mockRestore();
    });

    it("should show default error message when submission fails without errorMessage", async () => {
      const onSubmit = vi.fn().mockRejectedValue(new Error("Submission failed"));
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const { result } = renderHook(() =>
        useBaseForm({
          initialData: { name: "John" },
          onSubmit,
        })
      );

      expect(result.current).not.toBeNull();

      const event = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        if (result.current) {
          await result.current.handleSubmit(event);
        }
      });

      // Alert should be set immediately after error
      expect(result.current.alertMessage).toEqual({
        title: "Error submitting form",
        variant: "error",
      });

      consoleErrorSpy.mockRestore();
    });

    it("should not submit when validation fails", async () => {
      const onSubmit = vi.fn();
      const validate = vi.fn().mockReturnValue({
        name: "Name is required",
      });
      const { result } = renderHook(() =>
        useBaseForm({
          initialData: { name: "" },
          onSubmit,
          validate,
        })
      );

      expect(result.current).not.toBeNull();

      const event = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        if (result.current) {
          await result.current.handleSubmit(event);
        }
      });

      expect(onSubmit).not.toHaveBeenCalled();
      expect(result.current.errors.name).toBe("Name is required");
    });

    it("should show error message when validation fails", async () => {
      const onSubmit = vi.fn();
      const validate = vi.fn().mockReturnValue({
        name: "Name is required",
      });
      const { result } = renderHook(() =>
        useBaseForm({
          initialData: { name: "" },
          onSubmit,
          validate,
          errorMessage: "Validation failed",
        })
      );

      expect(result.current).not.toBeNull();

      const event = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        if (result.current) {
          await result.current.handleSubmit(event);
        }
      });

      // Alert should be set immediately after validation failure
      expect(result.current.alertMessage).toEqual({
        title: "Validation failed",
        variant: "error",
      });
    });

    it("should accept validation function returning boolean", async () => {
      const onSubmit = vi.fn();
      const validate = vi.fn().mockReturnValue(true);
      const { result } = renderHook(() =>
        useBaseForm({
          initialData: { name: "John" },
          onSubmit,
          validate,
        })
      );

      expect(result.current).not.toBeNull();

      const event = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        if (result.current) {
          await result.current.handleSubmit(event);
        }
      });

      expect(onSubmit).toHaveBeenCalled();
    });

    it("should transform data before submission when transformData is provided", async () => {
      const onSubmit = vi.fn();
      const transformData = vi.fn((data: Record<string, unknown>) => ({
        ...data,
        transformed: true,
      }));
      const { result } = renderHook(() =>
        useBaseForm({
          initialData: { name: "John" },
          onSubmit,
          transformData,
        })
      );

      expect(result.current).not.toBeNull();

      const event = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        if (result.current) {
          await result.current.handleSubmit(event);
        }
      });

      expect(transformData).toHaveBeenCalledWith({ name: "John" });
      expect(onSubmit).toHaveBeenCalledWith({
        name: "John",
        transformed: true,
      });
    });

    it("should handle synchronous onSubmit", async () => {
      const onSubmit = vi.fn();
      const { result } = renderHook(() =>
        useBaseForm({
          initialData: { name: "John" },
          onSubmit,
        })
      );

      expect(result.current).not.toBeNull();

      const event = {
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        if (result.current) {
          await result.current.handleSubmit(event);
        }
      });

      expect(onSubmit).toHaveBeenCalled();
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe("setFormData", () => {
    it("should update form data when setFormData is called", () => {
      const { result } = renderHook(() =>
        useBaseForm({
          initialData: { name: "John" },
          onSubmit: vi.fn(),
        })
      );

      expect(result.current).not.toBeNull();

      act(() => {
        if (result.current) {
          result.current.setFormData({ name: "Jane" });
        }
      });

      expect(result.current.formData.name).toBe("Jane");
    });

    it("should update form data with function updater", () => {
      const { result } = renderHook(() =>
        useBaseForm({
          initialData: { name: "John", count: 0 },
          onSubmit: vi.fn(),
        })
      );

      expect(result.current).not.toBeNull();

      act(() => {
        if (result.current) {
          result.current.setFormData((prev) => ({
            ...prev,
            count: prev.count + 1,
          }));
        }
      });

      expect(result.current.formData.count).toBe(1);
    });
  });

  describe("setErrors", () => {
    it("should update errors when setErrors is called", () => {
      const { result } = renderHook(() =>
        useBaseForm({
          initialData: { name: "" },
          onSubmit: vi.fn(),
        })
      );

      expect(result.current).not.toBeNull();

      act(() => {
        if (result.current) {
          result.current.setErrors({ name: "Name is required", email: "Email is required" });
        }
      });

      expect(result.current.errors).toEqual({
        name: "Name is required",
        email: "Email is required",
      });
    });
  });
});
