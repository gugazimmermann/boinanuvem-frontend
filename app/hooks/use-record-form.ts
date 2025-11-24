import { useState, useCallback } from "react";
import { useAlert } from "./use-alert";
import type { RecordFormErrors } from "~/types/records";

export interface UseRecordFormOptions {
  initialErrors?: RecordFormErrors;
  onSubmit: (formData: unknown) => Promise<void> | void;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useRecordForm<T extends Record<string, unknown>>(
  initialFormData: T,
  options: UseRecordFormOptions
) {
  const {
    onSubmit,
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    initialErrors = {},
  } = options;

  const [formData, setFormData] = useState<T>(initialFormData);
  const [errors, setErrors] = useState<RecordFormErrors>(initialErrors);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { alertMessage, showAlert, clearAlert } = useAlert();

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
    [errors]
  );

  const setError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const setAllErrors = useCallback((newErrors: RecordFormErrors) => {
    setErrors(newErrors);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    clearAlert();
  }, [initialFormData, clearAlert]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      if (Object.keys(errors).length > 0) {
        if (errorMessage) {
          showAlert(errorMessage, "error");
        }
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(formData);
        if (successMessage) {
          showAlert(successMessage, "success");
        }
        onSuccess?.();
      } catch (error) {
        if (errorMessage) {
          showAlert(errorMessage, "error");
        }
        onError?.(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, errors, onSubmit, onSuccess, onError, successMessage, errorMessage, showAlert]
  );

  return {
    formData,
    errors,
    isSubmitting,
    alertMessage,
    setFormData,
    handleChange,
    setError,
    setAllErrors,
    clearErrors,
    resetForm,
    handleSubmit,
    showAlert,
    clearAlert,
  };
}
