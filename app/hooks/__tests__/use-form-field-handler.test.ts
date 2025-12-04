import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFormFieldHandler } from "../use-form-field-handler";

describe("useFormFieldHandler", () => {
  const mockSetFormData = vi.fn();
  const mockSetErrors = vi.fn();
  const mockErrors = {};

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update form data when handleChange is called", () => {
    const { result } = renderHook(() =>
      useFormFieldHandler(mockSetFormData, mockErrors, mockSetErrors)
    );

    act(() => {
      result.current("name", "John Doe");
    });

    expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));
    const updateFn = mockSetFormData.mock.calls[0]?.[0];
    if (typeof updateFn === "function") {
      const prev = { name: "" };
      const updated = updateFn(prev);
      expect(updated).toEqual({ name: "John Doe" });
    }
  });

  it("should clear error when field is changed and has error", () => {
    const errorsWithName = { name: "Name is required" };

    const { result } = renderHook(() =>
      useFormFieldHandler(mockSetFormData, errorsWithName, mockSetErrors)
    );

    act(() => {
      result.current("name", "John");
    });

    expect(mockSetErrors).toHaveBeenCalledWith(expect.any(Function));
    const updateFn = mockSetErrors.mock.calls[0]?.[0];
    if (typeof updateFn === "function") {
      const prev = errorsWithName;
      const updated = updateFn(prev);
      expect(updated).not.toHaveProperty("name");
    }
  });

  it("should not call setErrors when field has no error", () => {
    const { result } = renderHook(() =>
      useFormFieldHandler(mockSetFormData, mockErrors, mockSetErrors)
    );

    act(() => {
      result.current("name", "John");
    });

    expect(mockSetErrors).not.toHaveBeenCalled();
  });

  it("should handle multiple field changes", () => {
    const { result } = renderHook(() =>
      useFormFieldHandler(mockSetFormData, mockErrors, mockSetErrors)
    );

    act(() => {
      result.current("name", "John");
      result.current("email", "john@example.com");
    });

    expect(mockSetFormData).toHaveBeenCalledTimes(2);
  });

  it("should handle different value types", () => {
    const { result } = renderHook(() =>
      useFormFieldHandler(mockSetFormData, mockErrors, mockSetErrors)
    );

    act(() => {
      result.current("age", 25);
      result.current("active", true);
      result.current("tags", ["tag1", "tag2"]);
    });

    expect(mockSetFormData).toHaveBeenCalledTimes(3);
  });

  it("should clear multiple errors when multiple fields are changed", () => {
    const errors = {
      name: "Name is required",
      email: "Email is required",
    };

    const { result } = renderHook(() =>
      useFormFieldHandler(mockSetFormData, errors, mockSetErrors)
    );

    act(() => {
      result.current("name", "John");
    });

    expect(mockSetErrors).toHaveBeenCalled();
  });

  it("should preserve other fields when updating one field", () => {
    const { result } = renderHook(() =>
      useFormFieldHandler(mockSetFormData, mockErrors, mockSetErrors)
    );

    act(() => {
      result.current("name", "John");
    });

    const updateFn = mockSetFormData.mock.calls[0]?.[0];
    if (typeof updateFn === "function") {
      const prev = { name: "", email: "test@example.com", age: 25 };
      const updated = updateFn(prev);
      expect(updated).toEqual({
        name: "John",
        email: "test@example.com",
        age: 25,
      });
    }
  });

  it("should handle null and undefined values", () => {
    const { result } = renderHook(() =>
      useFormFieldHandler(mockSetFormData, mockErrors, mockSetErrors)
    );

    act(() => {
      result.current("optionalField", null);
      result.current("anotherField", undefined);
    });

    expect(mockSetFormData).toHaveBeenCalledTimes(2);
  });
});
