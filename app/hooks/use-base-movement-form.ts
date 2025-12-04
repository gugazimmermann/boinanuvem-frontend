import { useState, useCallback } from "react";
import { useAlert } from "~/hooks/use-alert";

export interface BaseMovementFormData {
  date: string;
  employeeIds: string[];
  serviceProviderIds: string[];
  observation: string;
}

export interface UseBaseMovementFormOptions<T extends BaseMovementFormData> {
  initialData?: Partial<T>;
  onSubmit: (data: T, fileIds: string[]) => Promise<void> | void;
  onSuccess?: () => void;
  successMessage?: string;
  errorMessage?: string;
  validateBeforeSubmit?: (data: T) => boolean | Record<string, string>;
  errorContext?: string;
}

export interface UseBaseMovementFormReturn<T extends BaseMovementFormData> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isSubmitting: boolean;
  alertMessage: ReturnType<typeof useAlert>["alertMessage"];
  handleChange: (field: keyof T, value: string | string[] | boolean) => void;
  toggleSelection: (field: "employeeIds" | "serviceProviderIds", id: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

/**
 * Base hook for movement forms with common functionality
 * Handles form state, file management, errors, and submission
 */
export function useBaseMovementForm<T extends BaseMovementFormData>({
  initialData,
  onSubmit,
  onSuccess,
  successMessage,
  errorMessage,
  validateBeforeSubmit,
  errorContext = "movement",
}: UseBaseMovementFormOptions<T>): UseBaseMovementFormReturn<T> {
  const { alertMessage, showAlert } = useAlert();

  const [formData, setFormData] = useState<T>(() => {
    const baseData: BaseMovementFormData = {
      date: new Date().toISOString().split("T")[0],
      employeeIds: [],
      serviceProviderIds: [],
      observation: "",
    };
    return { ...baseData, ...initialData } as T;
  });

  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (field: keyof T, value: string | string[] | boolean) => {
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

  const toggleSelection = useCallback(
    (field: "employeeIds" | "serviceProviderIds", id: string) => {
      setFormData((prev) => {
        const currentIds = prev[field];
        const newIds = currentIds.includes(id)
          ? currentIds.filter((itemId) => itemId !== id)
          : [...currentIds, id];
        return { ...prev, [field]: newIds };
      });
      if (errors[field] || errors.responsible) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          delete newErrors.responsible;
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Run validation if provided
      if (validateBeforeSubmit) {
        const validationResult = validateBeforeSubmit(formData);
        if (validationResult !== true) {
          if (typeof validationResult === "object") {
            setErrors(validationResult);
          }
          // If validation fails, don't proceed
          return;
        }
      }

      setIsSubmitting(true);
      try {
        const fileIds = files.map((_, index) => `file-${Date.now()}-${index}`);
        await onSubmit(formData, fileIds);
        if (successMessage) {
          showAlert(successMessage, "success");
        }
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error(`Error submitting ${errorContext}:`, error);
        if (errorMessage) {
          showAlert(errorMessage, "error");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      formData,
      files,
      validateBeforeSubmit,
      onSubmit,
      onSuccess,
      successMessage,
      errorMessage,
      showAlert,
      errorContext,
    ]
  );

  return {
    formData,
    setFormData,
    files,
    setFiles,
    errors,
    setErrors,
    isSubmitting,
    alertMessage,
    handleChange,
    toggleSelection,
    handleSubmit,
  };
}
