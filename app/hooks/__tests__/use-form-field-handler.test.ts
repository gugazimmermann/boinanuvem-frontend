import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useState } from "react";
import { useFormFieldHandler } from "../use-form-field-handler";

describe("useFormFieldHandler", () => {
  it("should update form data when handleChange is called", () => {
    const TestComponent = () => {
      const [formData, setFormData] = useState({ name: "", email: "" });
      const [errors, setErrors] = useState<Record<string, string>>({});
      const handleChange = useFormFieldHandler(setFormData, errors, setErrors);

      return { formData, handleChange };
    };

    const { result } = renderHook(() => TestComponent());

    act(() => {
      result.current.handleChange("name", "John Doe");
    });

    expect(result.current.formData.name).toBe("John Doe");
  });

  it("should clear error for field when value changes", () => {
    const TestComponent = () => {
      const [formData, setFormData] = useState({ name: "", email: "" });
      const [errors, setErrors] = useState<Record<string, string>>({
        name: "Name is required",
      });
      const handleChange = useFormFieldHandler(setFormData, errors, setErrors);

      return { formData, errors, handleChange };
    };

    const { result } = renderHook(() => TestComponent());

    expect(result.current.errors.name).toBe("Name is required");

    act(() => {
      result.current.handleChange("name", "John Doe");
    });

    expect(result.current.errors.name).toBeUndefined();
    expect(result.current.formData.name).toBe("John Doe");
  });

  it("should preserve other errors when clearing one field", () => {
    const TestComponent = () => {
      const [formData, setFormData] = useState({ name: "", email: "" });
      const [errors, setErrors] = useState<Record<string, string>>({
        name: "Name is required",
        email: "Email is required",
      });
      const handleChange = useFormFieldHandler(setFormData, errors, setErrors);

      return { formData, errors, handleChange };
    };

    const { result } = renderHook(() => TestComponent());

    act(() => {
      result.current.handleChange("name", "John Doe");
    });

    expect(result.current.errors.name).toBeUndefined();
    expect(result.current.errors.email).toBe("Email is required");
  });

  it("should handle multiple field updates", () => {
    const TestComponent = () => {
      const [formData, setFormData] = useState({ name: "", email: "", age: 0 });
      const [errors, setErrors] = useState<Record<string, string>>({});
      const handleChange = useFormFieldHandler(setFormData, errors, setErrors);

      return { formData, handleChange };
    };

    const { result } = renderHook(() => TestComponent());

    act(() => {
      result.current.handleChange("name", "John Doe");
      result.current.handleChange("email", "john@example.com");
      result.current.handleChange("age", 30);
    });

    expect(result.current.formData.name).toBe("John Doe");
    expect(result.current.formData.email).toBe("john@example.com");
    expect(result.current.formData.age).toBe(30);
  });

  it("should handle null and undefined values", () => {
    const TestComponent = () => {
      const [formData, setFormData] = useState<Record<string, unknown>>({ value: "test" });
      const [errors, setErrors] = useState<Record<string, string>>({});
      const handleChange = useFormFieldHandler(setFormData, errors, setErrors);

      return { formData, handleChange };
    };

    const { result } = renderHook(() => TestComponent());

    act(() => {
      result.current.handleChange("value", null);
    });

    expect(result.current.formData.value).toBeNull();

    act(() => {
      result.current.handleChange("value", undefined);
    });

    expect(result.current.formData.value).toBeUndefined();
  });

  it("should not clear error if field has no error", () => {
    const TestComponent = () => {
      const [formData, setFormData] = useState({ name: "", email: "" });
      const [errors, setErrors] = useState<Record<string, string>>({
        email: "Email is required",
      });
      const handleChange = useFormFieldHandler(setFormData, errors, setErrors);

      return { formData, errors, handleChange };
    };

    const { result } = renderHook(() => TestComponent());

    act(() => {
      result.current.handleChange("name", "John Doe");
    });

    expect(result.current.errors.email).toBe("Email is required");
    expect(result.current.formData.name).toBe("John Doe");
  });

  it("should preserve other form data when updating one field", () => {
    const TestComponent = () => {
      const [formData, setFormData] = useState({
        name: "John",
        email: "john@example.com",
        age: 25,
      });
      const [errors, setErrors] = useState<Record<string, string>>({});
      const handleChange = useFormFieldHandler(setFormData, errors, setErrors);

      return { formData, handleChange };
    };

    const { result } = renderHook(() => TestComponent());

    act(() => {
      result.current.handleChange("name", "Jane");
    });

    expect(result.current.formData.name).toBe("Jane");
    expect(result.current.formData.email).toBe("john@example.com");
    expect(result.current.formData.age).toBe(25);
  });
});
