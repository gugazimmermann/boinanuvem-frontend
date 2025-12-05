import { useState, useCallback } from "react";
import { useTranslation } from "~/i18n";
import { maskPhone, maskCPF, unmaskCPF, maskCEP, unmaskCEP } from "~/components/site/utils/masks";
import { useCEPLookup, type CEPData } from "~/components/site/hooks";
import { mapCEPDataToAddressForm } from "~/components/site/utils";
import { isValidEmail } from "~/utils/email-validation";
import type { UserFormData } from "~/types";
import { useBaseForm } from "./use-base-form";
// TeamFormData is defined below

function validateBasicFields(
  data: TeamFormData,
  errors: Record<string, string>,
  t: ReturnType<typeof useTranslation>
): void {
  const fields = t.team.addModal.fields;

  if (!data.name?.trim()) {
    errors.name = t.profile.errors.required(fields.name);
  }
  if (!data.cpf?.trim()) {
    errors.cpf = t.profile.errors.required("CPF");
  } else if (unmaskCPF(data.cpf).length !== 11) {
    errors.cpf = t.profile.errors.invalid("CPF");
  }
  if (!data.email?.trim()) {
    errors.email = t.profile.errors.required(fields.email);
  } else if (!isValidEmail(data.email)) {
    errors.email = t.profile.errors.invalid(fields.email);
  }
  if (!data.phone?.trim()) {
    errors.phone = t.profile.errors.required(fields.phone);
  }
}

function validateAddressFields(
  data: TeamFormData,
  errors: Record<string, string>,
  t: ReturnType<typeof useTranslation>
): void {
  if (!data.street?.trim()) {
    errors.street = t.profile.errors.required(t.team.new.fields.street);
  }
  if (!data.neighborhood?.trim()) {
    errors.neighborhood = t.profile.errors.required(t.team.new.fields.neighborhood);
  }
  if (!data.city?.trim()) {
    errors.city = t.profile.errors.required(t.team.new.fields.city);
  }
  if (!data.state?.trim()) {
    errors.state = t.profile.errors.required(t.team.new.fields.state);
  }
  if (!data.zipCode?.trim()) {
    errors.zipCode = t.profile.errors.required(t.team.new.fields.cep);
  }
}

function validatePasswordFields(
  data: TeamFormData,
  errors: Record<string, string>,
  isEdit: boolean,
  changePassword: boolean,
  t: ReturnType<typeof useTranslation>
): void {
  const fields = t.team.addModal.fields;
  // For new team members, password is not required (will be set via email invitation)
  // Only validate password when editing and user wants to change it
  const shouldValidatePassword = isEdit && changePassword;

  if (!shouldValidatePassword) {
    return;
  }

  if (!data.password?.trim()) {
    errors.password = t.profile.errors.required(fields.password);
  } else if (data.password.length < 6) {
    errors.password = t.team.new.passwordMinLength;
  }
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = t.team.new.passwordMismatch;
  }
}

export interface TeamFormData extends UserFormData {
  password: string;
  confirmPassword: string;
}

export interface UseTeamFormOptions {
  initialData?: Partial<TeamFormData>;
  isEdit?: boolean;
  onSubmit: (data: UserFormData) => Promise<void> | void;
  onSuccess?: () => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useTeamForm({
  initialData,
  isEdit = false,
  onSubmit,
  onSuccess,
  successMessage,
  errorMessage,
}: UseTeamFormOptions) {
  const t = useTranslation();
  const [changePassword, setChangePassword] = useState(false);

  const initialFormData: TeamFormData = {
    name: "",
    cpf: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    ...initialData,
  };

  const baseForm = useBaseForm({
    initialData: initialFormData as unknown as Record<string, unknown>,
    onSubmit: (data) => {
      const teamData = data as unknown as TeamFormData;
      const updateData: UserFormData = {
        ...teamData,
        cpf: unmaskCPF((teamData.cpf as string) || ""),
      };

      // Remove password fields if not needed
      // For new members: password is not sent (will be set via email)
      // For editing: only send password if user wants to change it
      if (!isEdit || (isEdit && !changePassword)) {
        delete updateData.password;
        delete updateData.confirmPassword;
      }

      return onSubmit(updateData);
    },
    onSuccess,
    successMessage,
    errorMessage: errorMessage || "Error submitting form",
    validate: (data) => {
      const newErrors: Record<string, string> = {};

      const teamData = data as unknown as TeamFormData;
      validateBasicFields(teamData, newErrors, t);
      validateAddressFields(teamData, newErrors, t);
      validatePasswordFields(teamData, newErrors, isEdit, changePassword, t);

      return Object.keys(newErrors).length === 0 ? true : newErrors;
    },
  });

  const handleZipCodeSuccess = useCallback(
    (data: CEPData) => {
      baseForm.setFormData((prev) => {
        const mappedData = mapCEPDataToAddressForm(data, prev);
        return { ...prev, ...mappedData, zipCode: prev.zipCode };
      });
    },
    [baseForm]
  );

  const { loading: zipCodeLoading, error: zipCodeError } = useCEPLookup(
    unmaskCEP((baseForm.formData.zipCode as string) || ""),
    {
      debounceMs: 800,
      onSuccess: handleZipCodeSuccess,
    }
  );

  const handleChange = useCallback(
    (field: keyof TeamFormData, value: string) => {
      let maskedValue: string = value;
      if (field === "phone") {
        maskedValue = maskPhone(value);
      } else if (field === "cpf") {
        maskedValue = maskCPF(value);
      } else if (field === "zipCode") {
        maskedValue = maskCEP(value);
      }
      baseForm.handleChange(field, maskedValue);
    },
    [baseForm]
  );

  return {
    formData: baseForm.formData,
    errors: baseForm.errors,
    isSubmitting: baseForm.isSubmitting,
    alertMessage: baseForm.alertMessage,
    zipCodeLoading,
    zipCodeError,
    changePassword,
    setChangePassword,
    handleChange,
    validate: () => {
      const result = baseForm.errors;
      return Object.keys(result).length === 0;
    },
    handleSubmit: baseForm.handleSubmit,
  };
}
