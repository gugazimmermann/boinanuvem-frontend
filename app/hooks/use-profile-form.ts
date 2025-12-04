import { useState, useCallback } from "react";
import { useAlert } from "~/hooks/use-alert";
import type { AddressFormData } from "~/components/site/utils/cep-utils";

export interface ProfileFormData extends AddressFormData {
  [key: string]: string | undefined;
}

export interface UseProfileFormOptions<T extends ProfileFormData> {
  initialData: T;
  validate: (data: T) => Record<string, string>;
  onSave?: (data: T) => Promise<void> | void;
  onSaveSuccess?: (data: T) => void;
  successMessage: string;
  errorMessage: string;
}

export interface UseProfileFormReturn<T extends ProfileFormData> {
  data: T;
  errors: Record<string, string>;
  isEditing: boolean;
  isSaving: boolean;
  alertMessage: ReturnType<typeof useAlert>["alertMessage"];
  setData: React.Dispatch<React.SetStateAction<T>>;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  handleChange: (field: keyof T, value: string) => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
}

/**
 * Hook that provides common form state and handlers for profile forms.
 * Handles editing state, validation, saving, and error management.
 */
export function useProfileForm<T extends ProfileFormData>({
  initialData,
  validate,
  onSave,
  onSaveSuccess,
  successMessage,
  errorMessage,
}: UseProfileFormOptions<T>): UseProfileFormReturn<T> {
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<T>(initialData);
  const [originalData, setOriginalData] = useState<T>(initialData);
  const { alertMessage, showAlert } = useAlert();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = useCallback(
    (field: keyof T, value: string) => {
      setData((prev) => ({ ...prev, [field]: value }));
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

  const handleSave = useCallback(async () => {
    const validationErrors = validate(data);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(data);
        if (onSaveSuccess) {
          onSaveSuccess(data);
        }
        setOriginalData(data);
      }
      setIsEditing(false);
      showAlert(successMessage, "success");
    } catch {
      showAlert(errorMessage, "error");
    } finally {
      setIsSaving(false);
    }
  }, [data, validate, onSave, onSaveSuccess, successMessage, errorMessage, showAlert]);

  const handleCancel = useCallback(() => {
    setData(originalData);
    setErrors({});
    setIsEditing(false);
  }, [originalData]);

  return {
    data,
    errors,
    isEditing,
    isSaving,
    alertMessage,
    setData,
    setIsEditing,
    handleChange,
    handleSave,
    handleCancel,
  };
}
