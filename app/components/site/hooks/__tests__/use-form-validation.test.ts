import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFormValidation, validators } from "../use-form-validation";
import { isValidEmail } from "~/utils/email-validation";

vi.mock("~/utils/email-validation", () => ({
  isValidEmail: vi.fn(),
}));

describe("useFormValidation", () => {
  describe("validation rules", () => {
    it("should return no errors for valid data", () => {
      const data = {
        email: "test@example.com",
        name: "John Doe",
      };

      const rules = [
        {
          field: "email" as const,
          validator: validators.email,
          required: true,
        },
        {
          field: "name" as const,
          validator: () => null,
          required: true,
        },
      ];

      vi.mocked(isValidEmail).mockReturnValue(true);

      const { result } = renderHook(() => useFormValidation(data, rules));

      expect(result.current.errors).toEqual({});
      expect(result.current.isValid).toBe(true);
    });

    it("should return error for required field that is empty", () => {
      const data = {
        email: "",
        name: "John Doe",
      };

      const rules = [
        {
          field: "email" as const,
          validator: validators.email,
          required: true,
        },
      ];

      const { result } = renderHook(() => useFormValidation(data, rules));

      expect(result.current.errors.email).toBe("required");
      expect(result.current.isValid).toBe(false);
    });

    it("should return error for required field that is only whitespace", () => {
      const data = {
        email: "   ",
        name: "John Doe",
      };

      const rules = [
        {
          field: "email" as const,
          validator: validators.email,
          required: true,
        },
      ];

      const { result } = renderHook(() => useFormValidation(data, rules));

      expect(result.current.errors.email).toBe("required");
      expect(result.current.isValid).toBe(false);
    });

    it("should not validate non-required empty fields", () => {
      const data = {
        email: "",
        name: "John Doe",
      };

      const rules = [
        {
          field: "email" as const,
          validator: validators.email,
          required: false,
        },
      ];

      const { result } = renderHook(() => useFormValidation(data, rules));

      expect(result.current.errors).toEqual({});
      expect(result.current.isValid).toBe(true);
    });

    it("should validate non-empty non-required fields", () => {
      const data = {
        email: "invalid-email",
        name: "John Doe",
      };

      const rules = [
        {
          field: "email" as const,
          validator: validators.email,
          required: false,
        },
      ];

      vi.mocked(isValidEmail).mockReturnValue(false);

      const { result } = renderHook(() => useFormValidation(data, rules));

      expect(result.current.errors.email).toBe("invalidEmail");
      expect(result.current.isValid).toBe(false);
    });

    it("should handle multiple validation errors", () => {
      const data = {
        email: "invalid-email",
        password: "123",
        name: "",
      };

      const rules = [
        {
          field: "email" as const,
          validator: validators.email,
          required: true,
        },
        {
          field: "password" as const,
          validator: validators.minLength(6),
          required: true,
        },
        {
          field: "name" as const,
          validator: () => null,
          required: true,
        },
      ];

      vi.mocked(isValidEmail).mockReturnValue(false);

      const { result } = renderHook(() => useFormValidation(data, rules));

      expect(result.current.errors.email).toBe("invalidEmail");
      expect(result.current.errors.password).toBe("minLength_6");
      expect(result.current.errors.name).toBe("required");
      expect(result.current.isValid).toBe(false);
    });

    it("should update when data changes", () => {
      const { result, rerender } = renderHook(
        ({ data }) =>
          useFormValidation(data, [
            {
              field: "email" as const,
              validator: validators.email,
              required: true,
            },
          ]),
        {
          initialProps: {
            data: { email: "" },
          },
        }
      );

      expect(result.current.errors.email).toBe("required");

      vi.mocked(isValidEmail).mockReturnValue(true);

      rerender({
        data: { email: "test@example.com" },
      });

      expect(result.current.errors).toEqual({});
      expect(result.current.isValid).toBe(true);
    });

    it("should update when rules change", () => {
      const data = {
        email: "test@example.com",
      };

      const { result, rerender } = renderHook(({ rules }) => useFormValidation(data, rules), {
        initialProps: {
          rules: [
            {
              field: "email" as const,
              validator: validators.email,
              required: false,
            },
          ],
        },
      });

      expect(result.current.errors).toEqual({});

      rerender({
        rules: [
          {
            field: "email" as const,
            validator: validators.email,
            required: true,
          },
        ],
      });

      // Data is still valid, so no error
      vi.mocked(isValidEmail).mockReturnValue(true);
      expect(result.current.errors).toEqual({});
    });
  });

  describe("validators", () => {
    describe("email", () => {
      it("should return null for valid email", () => {
        vi.mocked(isValidEmail).mockReturnValue(true);
        expect(validators.email("test@example.com")).toBe(null);
      });

      it("should return error for invalid email", () => {
        vi.mocked(isValidEmail).mockReturnValue(false);
        expect(validators.email("invalid-email")).toBe("invalidEmail");
      });
    });

    describe("required", () => {
      it("should return null for non-empty value", () => {
        expect(validators.required("test")).toBe(null);
      });

      it("should return error for empty value", () => {
        expect(validators.required("")).toBe("required");
      });

      it("should return error for whitespace-only value", () => {
        expect(validators.required("   ")).toBe("required");
      });
    });

    describe("minLength", () => {
      it("should return null for value meeting minimum length", () => {
        const validator = validators.minLength(5);
        expect(validator("12345")).toBe(null);
        expect(validator("123456")).toBe(null);
      });

      it("should return error for value below minimum length", () => {
        const validator = validators.minLength(5);
        expect(validator("1234")).toBe("minLength_5");
      });
    });

    describe("maxLength", () => {
      it("should return null for value within maximum length", () => {
        const validator = validators.maxLength(5);
        expect(validator("12345")).toBe(null);
        expect(validator("1234")).toBe(null);
      });

      it("should return error for value exceeding maximum length", () => {
        const validator = validators.maxLength(5);
        expect(validator("123456")).toBe("maxLength_5");
      });
    });

    describe("match", () => {
      it("should return null for matching values", () => {
        const validator = validators.match("password123", "password");
        expect(validator("password123")).toBe(null);
      });

      it("should return error for non-matching values", () => {
        const validator = validators.match("password123", "password");
        expect(validator("password456")).toBe("mismatch_password");
      });
    });

    describe("cnpj", () => {
      it("should return null for valid CNPJ length", () => {
        expect(validators.cnpj("12.345.678/0001-90")).toBe(null);
        expect(validators.cnpj("12345678000190")).toBe(null);
      });

      it("should return error for invalid CNPJ length", () => {
        expect(validators.cnpj("1234567890123")).toBe("cnpjMustHave14Digits");
        expect(validators.cnpj("123")).toBe("cnpjMustHave14Digits");
      });

      it("should return null for empty CNPJ", () => {
        expect(validators.cnpj("")).toBe(null);
      });
    });

    describe("cep", () => {
      it("should return null for valid CEP length", () => {
        expect(validators.cep("12.345-678")).toBe(null);
        expect(validators.cep("12345678")).toBe(null);
      });

      it("should return error for invalid CEP length", () => {
        expect(validators.cep("1234567")).toBe("cepMustHave8Digits");
        expect(validators.cep("123")).toBe("cepMustHave8Digits");
      });

      it("should return null for empty CEP", () => {
        expect(validators.cep("")).toBe(null);
      });
    });
  });
});
