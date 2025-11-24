import { useMemo } from "react";

export interface ValidationRule<T> {
  field: keyof T;
  validator: (value: string) => string | null;
  required?: boolean;
}

export function useFormValidation<T extends Record<string, string>>(
  data: T,
  rules: ValidationRule<T>[]
) {
  const errors = useMemo(() => {
    const validationErrors: Partial<Record<keyof T, string>> = {};

    rules.forEach((rule) => {
      const value = data[rule.field] || "";

      if (rule.required && !value.trim()) {
        validationErrors[rule.field] = "required";
        return;
      }

      if (value.trim()) {
        const error = rule.validator(value);
        if (error) {
          validationErrors[rule.field] = error;
        }
      }
    });

    return validationErrors;
  }, [data, rules]);

  const isValid = Object.keys(errors).length === 0;

  return { errors, isValid };
}

// Common validators
export const validators = {
  email: (value: string): string | null => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "invalidEmail";
    }
    return null;
  },
  required: (value: string): string | null => {
    if (!value.trim()) {
      return "required";
    }
    return null;
  },
  minLength:
    (min: number) =>
    (value: string): string | null => {
      if (value.length < min) {
        return `minLength_${min}`;
      }
      return null;
    },
  maxLength:
    (max: number) =>
    (value: string): string | null => {
      if (value.length > max) {
        return `maxLength_${max}`;
      }
      return null;
    },
  match:
    (otherValue: string, fieldName: string) =>
    (value: string): string | null => {
      if (value !== otherValue) {
        return `mismatch_${fieldName}`;
      }
      return null;
    },
  cnpj: (value: string): string | null => {
    const unmasked = value.replace(/\D/g, "");
    if (unmasked && unmasked.length !== 14) {
      return "cnpjMustHave14Digits";
    }
    return null;
  },
  cep: (value: string): string | null => {
    const unmasked = value.replace(/\D/g, "");
    if (unmasked && unmasked.length !== 8) {
      return "cepMustHave8Digits";
    }
    return null;
  },
};
