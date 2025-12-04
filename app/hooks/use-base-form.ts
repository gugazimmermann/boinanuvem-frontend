import { useState, useCallback, useEffect, useRef } from "react";
import { useAlert } from "./use-alert";

export interface UseBaseFormOptions<T> {
  initialData: T;
  onSubmit: (data: T) => Promise<void> | void;
  onSuccess?: () => void;
  successMessage?: string;
  errorMessage?: string;
  validate?: (data: T) => Record<string, string> | boolean;
  transformData?: (data: T) => T;
}

export interface UseBaseFormReturn<T> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isSubmitting: boolean;
  alertMessage: ReturnType<typeof useAlert>["alertMessage"];
  handleChange: (field: keyof T, value: unknown) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  showAlert: ReturnType<typeof useAlert>["showAlert"];
  clearErrors: () => void;
  setError: (field: string, message: string) => void;
}

export function useBaseForm<T extends Record<string, unknown>>({
  initialData,
  onSubmit,
  onSuccess,
  successMessage,
  errorMessage,
  validate,
  transformData,
}: UseBaseFormOptions<T>): UseBaseFormReturn<T> {
  const { alertMessage, showAlert } = useAlert();
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialDataRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const currentKey = JSON.stringify(initialData);
    if (currentKey !== initialDataRef.current) {
      initialDataRef.current = currentKey;
      setFormData(initialData);
    }
  }, [initialData]);

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

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      let validationResult: Record<string, string> | boolean = true;
      if (validate) {
        validationResult = validate(formData);
      }

      if (validationResult !== true) {
        if (typeof validationResult === "object") {
          setErrors(validationResult);
        }
        if (errorMessage) {
          showAlert(errorMessage, "error");
        }
        return;
      }

      setIsSubmitting(true);
      try {
        const dataToSubmit = transformData ? transformData(formData) : formData;
        await Promise.resolve(onSubmit(dataToSubmit));
        if (successMessage) {
          showAlert(successMessage, "success");
        }
        onSuccess?.();
      } catch (error) {
        console.error("Error submitting form:", error);
        showAlert(errorMessage || "Error submitting form", "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      formData,
      validate,
      onSubmit,
      onSuccess,
      successMessage,
      errorMessage,
      showAlert,
      transformData,
    ]
  );

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    isSubmitting,
    alertMessage,
    handleChange,
    handleSubmit,
    showAlert,
    clearErrors,
    setError,
  };
}
