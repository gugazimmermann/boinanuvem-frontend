import { useCallback } from "react";
import { useTranslation } from "~/i18n";
import { maskCPF, maskCNPJ, maskPhone, unmaskCPF, unmaskCNPJ } from "~/components/site/utils/masks";
import { useBaseForm } from "./use-base-form";
import { useAddressForm } from "./use-address-form";

export interface EntityFormData {
  code: string;
  name: string;
  cpf?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  status: "active" | "inactive";
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  propertyIds: string[];
}

export interface UseEntityFormOptions {
  initialData?: Partial<EntityFormData>;
  entityType: "buyer" | "supplier" | "service-provider" | "employee";
  onSubmit: (data: EntityFormData) => Promise<void> | void;
  onSuccess?: () => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useEntityForm({
  initialData,
  entityType,
  onSubmit,
  onSuccess,
  successMessage,
  errorMessage,
}: UseEntityFormOptions) {
  const t = useTranslation();
  const initialFormData: EntityFormData = {
    code: "",
    name: "",
    cpf: "",
    cnpj: "",
    email: "",
    phone: "",
    status: "active",
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    propertyIds: [],
    ...initialData,
  };

  const baseForm = useBaseForm({
    initialData: initialFormData as unknown as Record<string, unknown>,
    onSubmit: onSubmit as unknown as (data: Record<string, unknown>) => void | Promise<void>,
    onSuccess,
    successMessage,
    errorMessage: errorMessage || `${entityType} error`,
    validate: (data) => {
      const newErrors: Record<string, string> = {};
      const getTranslationKey = () => {
        if (entityType === "buyer") return "buyers";
        if (entityType === "supplier") return "suppliers";
        if (entityType === "service-provider") return "serviceProviders";
        return "employees";
      };
      const translations = t[getTranslationKey()] as Record<string, unknown>;

      if (!data.code || (typeof data.code === "string" && !data.code.trim())) {
        const codeLabel = (translations.table as { code?: string })?.code || "Code";
        newErrors.code = t.profile.errors.required(codeLabel);
      }
      if (!data.name || (typeof data.name === "string" && !data.name.trim())) {
        const nameLabel =
          (translations.new as { nameLabel?: string })?.nameLabel ||
          (translations.edit as { nameLabel?: string })?.nameLabel ||
          (translations.table as { name?: string })?.name ||
          "Name";
        newErrors.name = t.profile.errors.required(nameLabel);
      }
      if (!data.propertyIds || !Array.isArray(data.propertyIds) || data.propertyIds.length === 0) {
        const propertyRequired =
          (translations.new as { propertyRequired?: string })?.propertyRequired ||
          (translations.edit as { propertyRequired?: string })?.propertyRequired ||
          t.profile.errors.required("Property");
        newErrors.propertyIds = propertyRequired;
      }

      // Require exactly one of CPF or CNPJ for non-employees
      if (entityType !== "employee") {
        const cpfDigits = typeof data.cpf === "string" ? unmaskCPF(data.cpf) : "";
        const cnpjDigits = typeof data.cnpj === "string" ? unmaskCNPJ(data.cnpj) : "";
        const hasCpf = cpfDigits.length > 0;
        const hasCnpj = cnpjDigits.length > 0;

        if (hasCpf === hasCnpj) {
          const cpfLabel =
            (translations.new as { cpfLabel?: string })?.cpfLabel ||
            (translations.edit as { cpfLabel?: string })?.cpfLabel ||
            "CPF";
          const cnpjLabel =
            (translations.new as { cnpjLabel?: string })?.cnpjLabel ||
            (translations.edit as { cnpjLabel?: string })?.cnpjLabel ||
            "CNPJ";

          const message = t.profile.errors.required(`${cpfLabel} ou ${cnpjLabel}`);
          newErrors.cpf = message;
          newErrors.cnpj = message;
        }
      }

      return Object.keys(newErrors).length === 0 ? true : newErrors;
    },
  });

  const addressForm = useAddressForm({
    formData: baseForm.formData as unknown as EntityFormData,
    setFormData: baseForm.setFormData as unknown as React.Dispatch<
      React.SetStateAction<EntityFormData>
    >,
  });

  const handleChange = useCallback(
    (field: keyof EntityFormData, value: string | string[]) => {
      if (field === "zipCode") {
        addressForm.handleZipCodeChange(value as string);
      } else {
        let maskedValue: string | string[] = value;
        if (field === "cpf") {
          maskedValue = maskCPF(value as string);
        } else if (field === "cnpj") {
          maskedValue = maskCNPJ(value as string);
        } else if (field === "phone") {
          maskedValue = maskPhone(value as string);
        }
        baseForm.handleChange(field, maskedValue);
      }
    },
    [baseForm, addressForm]
  );

  return {
    formData: baseForm.formData,
    errors: baseForm.errors,
    isSubmitting: baseForm.isSubmitting,
    alertMessage: baseForm.alertMessage,
    zipCodeLoading: addressForm.zipCodeLoading,
    zipCodeError: addressForm.zipCodeError,
    handleChange,
    validate: () => {
      const result = baseForm.errors;
      return Object.keys(result).length === 0;
    },
    handleSubmit: baseForm.handleSubmit,
    showAlert: baseForm.showAlert,
    setFormData: baseForm.setFormData,
  };
}
