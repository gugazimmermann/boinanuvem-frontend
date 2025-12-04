import { useCallback } from "react";
import { useBaseMovementForm, type BaseMovementFormData } from "./use-base-movement-form";

export interface InventoryMovementFormBaseData extends BaseMovementFormData {
  itemId?: string;
  quantity: string;
  description: string;
}

export interface UseInventoryMovementFormOptions<T extends InventoryMovementFormBaseData> {
  initialData?: Partial<T>;
  onSubmit: (data: T, fileIds: string[]) => Promise<void> | void;
  onSuccess?: () => void;
  successMessage?: string;
  errorMessage?: string;
  validate?: (data: T) => Record<string, string> | true;
  translationKeys?: {
    quantityRequired?: string;
    dateRequired?: string;
    itemRequired?: string;
  };
}

export interface UseInventoryMovementFormReturn<T extends InventoryMovementFormBaseData> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isSubmitting: boolean;
  alertMessage: ReturnType<typeof import("./use-alert").useAlert>["alertMessage"];
  handleChange: (field: keyof T, value: string | string[] | boolean) => void;
  toggleSelection: (field: "employeeIds" | "serviceProviderIds", id: string) => void;
  validate: () => boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

/**
 * Hook for managing inventory movement form state and logic.
 * Provides common patterns for handleChange, toggleSelection, validation, and file handling.
 */
export function useInventoryMovementForm<T extends InventoryMovementFormBaseData>({
  initialData,
  onSubmit,
  onSuccess,
  successMessage,
  errorMessage,
  validate: customValidate,
  translationKeys = {},
}: UseInventoryMovementFormOptions<T>): UseInventoryMovementFormReturn<T> {
  const validateForm = useCallback(
    (data: T): boolean | Record<string, string> => {
      const newErrors: Record<string, string> = {};

      // Basic validation
      if (data.itemId !== undefined && !data.itemId) {
        newErrors.itemId = translationKeys.itemRequired || "Item é obrigatório";
      }
      if (!data.quantity || Number.parseFloat(data.quantity) <= 0) {
        newErrors.quantity = translationKeys.quantityRequired || "Quantidade é obrigatória";
      }
      if (!data.date) {
        newErrors.date = translationKeys.dateRequired || "Data é obrigatória";
      }

      // Run custom validation if provided
      if (customValidate) {
        const customResult = customValidate(data);
        if (customResult !== true) {
          Object.assign(newErrors, customResult);
        }
      }

      return Object.keys(newErrors).length === 0 ? true : newErrors;
    },
    [customValidate, translationKeys]
  );

  const baseForm = useBaseMovementForm<T>({
    initialData: {
      quantity: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      observation: "",
      employeeIds: [],
      serviceProviderIds: [],
      ...initialData,
    } as Partial<T>,
    onSubmit,
    onSuccess,
    successMessage,
    errorMessage,
    validateBeforeSubmit: validateForm,
    errorContext: "inventory movement",
  });

  const validate = useCallback((): boolean => {
    const result = validateForm(baseForm.formData);
    if (typeof result === "object") {
      baseForm.setErrors(result);
      return false;
    }
    baseForm.setErrors({});
    return true;
  }, [baseForm, validateForm]);

  return {
    formData: baseForm.formData,
    setFormData: baseForm.setFormData,
    files: baseForm.files,
    setFiles: baseForm.setFiles,
    errors: baseForm.errors,
    setErrors: baseForm.setErrors,
    isSubmitting: baseForm.isSubmitting,
    alertMessage: baseForm.alertMessage,
    handleChange: baseForm.handleChange,
    toggleSelection: baseForm.toggleSelection,
    validate,
    handleSubmit: baseForm.handleSubmit,
  };
}
