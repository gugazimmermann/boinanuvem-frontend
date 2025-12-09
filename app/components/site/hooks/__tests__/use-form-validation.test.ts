import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFormValidation, validators } from "../use-form-validation";

vi.mock("~/utils/email-validation", () => ({
  isValidEmail: vi.fn((email: string) => email.includes("@")),
}));

describe("useFormValidation", () => {
  it("should return no errors for valid data", () => {
    const { result } = renderHook(() =>
      useFormValidation({ email: "test@example.com", password: "password123" }, [
        { field: "email", validator: validators.email },
        { field: "password", validator: validators.minLength(6) },
      ])
    );

    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });

  it("should return errors for invalid data", () => {
    const { result } = renderHook(() =>
      useFormValidation({ email: "invalid-email", password: "123" }, [
        { field: "email", validator: validators.email },
        { field: "password", validator: validators.minLength(6) },
      ])
    );

    expect(result.current.errors.email).toBe("invalidEmail");
    expect(result.current.errors.password).toBe("minLength_6");
    expect(result.current.isValid).toBe(false);
  });

  it("should validate required fields", () => {
    const { result } = renderHook(() =>
      useFormValidation({ email: "", password: "" }, [
        { field: "email", validator: validators.email, required: true },
        { field: "password", validator: validators.minLength(6), required: true },
      ])
    );

    expect(result.current.errors.email).toBe("required");
    expect(result.current.errors.password).toBe("required");
    expect(result.current.isValid).toBe(false);
  });

  it("should not validate empty non-required fields", () => {
    const { result } = renderHook(() =>
      useFormValidation({ email: "", password: "" }, [
        { field: "email", validator: validators.email },
        { field: "password", validator: validators.minLength(6) },
      ])
    );

    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });

  it("should validate email format", () => {
    const { result: invalidResult } = renderHook(() =>
      useFormValidation({ email: "invalid" }, [{ field: "email", validator: validators.email }])
    );

    expect(invalidResult.current.errors.email).toBe("invalidEmail");

    const { result: validResult } = renderHook(() =>
      useFormValidation({ email: "test@example.com" }, [
        { field: "email", validator: validators.email },
      ])
    );

    expect(validResult.current.errors).toEqual({});
  });

  it("should validate minLength", () => {
    const { result } = renderHook(() =>
      useFormValidation({ password: "123" }, [
        { field: "password", validator: validators.minLength(6) },
      ])
    );

    expect(result.current.errors.password).toBe("minLength_6");
  });

  it("should validate maxLength", () => {
    const { result } = renderHook(() =>
      useFormValidation({ name: "very long name that exceeds limit" }, [
        { field: "name", validator: validators.maxLength(10) },
      ])
    );

    expect(result.current.errors.name).toBe("maxLength_10");
  });

  it("should validate match", () => {
    const { result } = renderHook(() =>
      useFormValidation({ password: "password123", confirmPassword: "password456" }, [
        {
          field: "confirmPassword",
          validator: validators.match("password123", "password"),
        },
      ])
    );

    expect(result.current.errors.confirmPassword).toBe("mismatch_password");
  });

  it("should validate CNPJ format", () => {
    const { result: invalidResult } = renderHook(() =>
      useFormValidation({ cnpj: "123" }, [{ field: "cnpj", validator: validators.cnpj }])
    );

    expect(invalidResult.current.errors.cnpj).toBe("cnpjMustHave14Digits");

    const { result: validResult } = renderHook(() =>
      useFormValidation({ cnpj: "12.345.678/0001-90" }, [
        { field: "cnpj", validator: validators.cnpj },
      ])
    );

    expect(validResult.current.errors).toEqual({});
  });

  it("should validate CEP format", () => {
    const { result: invalidResult } = renderHook(() =>
      useFormValidation({ cep: "123" }, [{ field: "cep", validator: validators.cep }])
    );

    expect(invalidResult.current.errors.cep).toBe("cepMustHave8Digits");

    const { result: validResult } = renderHook(() =>
      useFormValidation({ cep: "12.345-678" }, [{ field: "cep", validator: validators.cep }])
    );

    expect(validResult.current.errors).toEqual({});
  });

  it("should update errors when data changes", () => {
    const { result, rerender } = renderHook(
      ({ data }) => useFormValidation(data, [{ field: "email", validator: validators.email }]),
      { initialProps: { data: { email: "invalid" } } }
    );

    expect(result.current.errors.email).toBe("invalidEmail");

    rerender({ data: { email: "test@example.com" } });

    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });

  it("should handle multiple validation rules", () => {
    const { result } = renderHook(() =>
      useFormValidation({ email: "test@example.com", password: "123" }, [
        { field: "email", validator: validators.email },
        { field: "password", validator: validators.minLength(6), required: true },
      ])
    );

    expect(result.current.errors.email).toBeUndefined();
    expect(result.current.errors.password).toBe("minLength_6");
  });

  it("should trim values before validation", () => {
    const { result } = renderHook(() =>
      useFormValidation({ email: "  test@example.com  " }, [
        { field: "email", validator: validators.email },
      ])
    );

    expect(result.current.errors).toEqual({});
  });

  it("should handle required validator", () => {
    const { result } = renderHook(() =>
      useFormValidation({ field: "" }, [
        { field: "field", validator: validators.required, required: true },
      ])
    );

    expect(result.current.errors.field).toBe("required");
  });

  it("should return required error for field with whitespace-only value", () => {
    const { result } = renderHook(() =>
      useFormValidation({ field: "   " }, [
        { field: "field", validator: validators.email, required: true },
      ])
    );

    expect(result.current.errors.field).toBe("required");
    expect(result.current.isValid).toBe(false);
  });

  it("should pass validation for field with whitespace-only value when required is false", () => {
    const { result } = renderHook(() =>
      useFormValidation({ field: "   " }, [
        { field: "field", validator: validators.email, required: false },
      ])
    );

    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });

  it("should call validator with original value (not trimmed)", () => {
    const mockValidator = vi.fn((_value: string) => {
      // Validator receives the original value, trimming is only used for required check
      return null;
    });

    renderHook(() =>
      useFormValidation({ email: "  test@example.com  " }, [
        { field: "email", validator: mockValidator },
      ])
    );

    // Validator is called with the original value, not trimmed
    // The trimming check (value.trim()) is only used to determine if validator should be called
    expect(mockValidator).toHaveBeenCalledWith("  test@example.com  ");
  });

  it("should set validator error correctly when validator returns error", () => {
    const customValidator = vi.fn((value: string) => {
      if (value.length < 5) {
        return "tooShort";
      }
      return null;
    });

    const { result } = renderHook(() =>
      useFormValidation({ field: "abc" }, [{ field: "field", validator: customValidator }])
    );

    expect(result.current.errors.field).toBe("tooShort");
    expect(customValidator).toHaveBeenCalledWith("abc");
  });

  it("should not set error when validator returns null", () => {
    const customValidator = vi.fn((_value: string) => {
      return null; // Valid value
    });

    const { result } = renderHook(() =>
      useFormValidation({ field: "validValue" }, [{ field: "field", validator: customValidator }])
    );

    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
    expect(customValidator).toHaveBeenCalledWith("validValue");
  });

  it("should handle required field with whitespace and custom validator", () => {
    const customValidator = vi.fn((value: string) => {
      return value.length < 3 ? "minLength" : null;
    });

    const { result } = renderHook(() =>
      useFormValidation({ field: "  " }, [
        { field: "field", validator: customValidator, required: true },
      ])
    );

    // Should return "required" because whitespace-only is treated as empty
    expect(result.current.errors.field).toBe("required");
    // Validator should not be called for whitespace-only required fields
    expect(customValidator).not.toHaveBeenCalled();
  });

  it("should handle field with value that trims to empty but is not required", () => {
    const customValidator = vi.fn((value: string) => {
      return value.length < 3 ? "minLength" : null;
    });

    const { result } = renderHook(() =>
      useFormValidation({ field: "  " }, [
        { field: "field", validator: customValidator, required: false },
      ])
    );

    // Should pass validation because field is not required and whitespace-only is skipped
    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
    // Validator should not be called for whitespace-only non-required fields
    expect(customValidator).not.toHaveBeenCalled();
  });

  it("should handle multiple rules for same field correctly", () => {
    const { result } = renderHook(() =>
      useFormValidation({ password: "abc" }, [
        { field: "password", validator: validators.minLength(6), required: true },
        { field: "password", validator: validators.maxLength(10), required: true },
      ])
    );

    // First validator should fail (minLength)
    expect(result.current.errors.password).toBe("minLength_6");
    expect(result.current.isValid).toBe(false);
  });

  it("should handle required field with empty string", () => {
    const { result } = renderHook(() =>
      useFormValidation({ field: "" }, [
        { field: "field", validator: validators.email, required: true },
      ])
    );

    expect(result.current.errors.field).toBe("required");
    expect(result.current.isValid).toBe(false);
  });

  it("should handle field with undefined value", () => {
    const { result } = renderHook(() =>
      useFormValidation({ field: undefined as unknown as string }, [
        { field: "field", validator: validators.email, required: false },
      ])
    );

    // Undefined should be treated as empty string
    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });

  it("should handle validator that checks trimmed value length", () => {
    const { result } = renderHook(() =>
      useFormValidation({ name: "  test  " }, [
        { field: "name", validator: validators.minLength(4) },
      ])
    );

    // Validator receives trimmed value "test" which has length 4, so it should pass
    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });
});
