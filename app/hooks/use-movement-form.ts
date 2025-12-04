import { useBaseMovementForm, type BaseMovementFormData } from "./use-base-movement-form";

export type MovementFormBaseData = BaseMovementFormData;

export interface UseMovementFormOptions<T extends MovementFormBaseData> {
  initialData?: Partial<T>;
  onSubmit: (data: T, fileIds: string[]) => Promise<void> | void;
  onSuccess?: () => void;
  successMessage?: string;
  errorMessage?: string;
  validate?: (data: T) => Record<string, string> | true;
}

export interface UseMovementFormReturn<T extends MovementFormBaseData> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  errors: Record<string, string>;
  isSubmitting: boolean;
  alertMessage: ReturnType<typeof import("./use-alert").useAlert>["alertMessage"];
  handleChange: (field: keyof T, value: string | string[]) => void;
  toggleSelection: (field: "employeeIds" | "serviceProviderIds", id: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useMovementForm<T extends MovementFormBaseData>({
  initialData,
  onSubmit,
  onSuccess,
  successMessage,
  errorMessage,
  validate,
}: UseMovementFormOptions<T>): UseMovementFormReturn<T> {
  const baseForm = useBaseMovementForm<T>({
    initialData,
    onSubmit,
    onSuccess,
    successMessage,
    errorMessage,
    validateBeforeSubmit: validate
      ? (data: T) => {
          const result = validate(data);
          return result === true ? true : result;
        }
      : undefined,
    errorContext: "movement",
  });

  return {
    formData: baseForm.formData,
    setFormData: baseForm.setFormData,
    files: baseForm.files,
    setFiles: baseForm.setFiles,
    errors: baseForm.errors,
    isSubmitting: baseForm.isSubmitting,
    alertMessage: baseForm.alertMessage,
    handleChange: baseForm.handleChange as (field: keyof T, value: string | string[]) => void,
    toggleSelection: baseForm.toggleSelection,
    handleSubmit: baseForm.handleSubmit,
  };
}
