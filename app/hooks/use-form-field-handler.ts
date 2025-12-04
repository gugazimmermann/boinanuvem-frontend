import { useCallback } from "react";

/**
 * Creates a handleChange function that updates form data and clears errors for the changed field.
 * This is a common pattern used across many forms.
 */
export function useFormFieldHandler<T extends Record<string, unknown>>(
  setFormData: React.Dispatch<React.SetStateAction<T>>,
  errors: Record<string, string>,
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
) {
  const handleChange = useCallback(
    (field: keyof T, value: unknown) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field as string]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }
    },
    [errors, setFormData, setErrors]
  );

  return handleChange;
}
