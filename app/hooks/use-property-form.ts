import { useCallback } from "react";
import { AreaType } from "~/types";
import type { PropertyFormValues } from "~/components/dashboard/properties/property-form";
import { useBaseForm } from "./use-base-form";
import { useAddressForm } from "./use-address-form";

interface UsePropertyFormOptions {
  initialValues?: Partial<PropertyFormValues>;
  translationKeys: {
    required: (field: string) => string;
    areaValidationError: string;
  };
  onSubmit: (data: PropertyFormValues) => void | Promise<void>;
}

export function usePropertyForm({
  initialValues,
  translationKeys,
  onSubmit,
}: UsePropertyFormOptions) {
  const initialData: PropertyFormValues = {
    code: initialValues?.code || "",
    name: initialValues?.name || "",
    city: initialValues?.city || "",
    state: initialValues?.state || "",
    areaValue: initialValues?.areaValue || "",
    areaType: initialValues?.areaType || AreaType.HECTARES,
    status: initialValues?.status || "active",
    zipCode: initialValues?.zipCode || "",
    street: initialValues?.street || "",
    number: initialValues?.number || "",
    complement: initialValues?.complement || "",
    neighborhood: initialValues?.neighborhood || "",
  };

  const baseForm = useBaseForm({
    initialData: initialData as unknown as Record<string, unknown>,
    onSubmit: onSubmit as unknown as (data: Record<string, unknown>) => void | Promise<void>,
    validate: (data) => {
      const newErrors: Record<string, string> = {};

      if (!data.code || (typeof data.code === "string" && !data.code.trim())) {
        newErrors.code = translationKeys.required("code");
      }
      if (!data.name || (typeof data.name === "string" && !data.name.trim())) {
        newErrors.name = translationKeys.required("name");
      }
      if (!data.city || (typeof data.city === "string" && !data.city.trim())) {
        newErrors.city = translationKeys.required("city");
      }
      if (!data.state || (typeof data.state === "string" && !data.state.trim())) {
        newErrors.state = translationKeys.required("state");
      }
      if (data.areaValue && typeof data.areaValue === "string" && data.areaValue.trim()) {
        const areaNum = Number.parseFloat(data.areaValue);
        if (Number.isNaN(areaNum) || areaNum <= 0) {
          newErrors.areaValue = translationKeys.areaValidationError;
        }
      } else {
        newErrors.areaValue = translationKeys.required("area");
      }

      return Object.keys(newErrors).length === 0 ? true : newErrors;
    },
  });

  const addressForm = useAddressForm({
    formData: baseForm.formData as unknown as PropertyFormValues,
    setFormData: baseForm.setFormData as unknown as React.Dispatch<
      React.SetStateAction<PropertyFormValues>
    >,
  });

  const handleChange = useCallback(
    (field: keyof PropertyFormValues, value: string | AreaType) => {
      if (field === "zipCode" && typeof value === "string") {
        addressForm.handleZipCodeChange(value);
      } else {
        baseForm.handleChange(field, value);
      }
    },
    [baseForm, addressForm]
  );

  return {
    formData: baseForm.formData,
    errors: baseForm.errors,
    isSubmitting: baseForm.isSubmitting,
    zipCodeLoading: addressForm.zipCodeLoading,
    zipCodeError: addressForm.zipCodeError,
    handleChange,
    handleSubmit: baseForm.handleSubmit,
    validate: () => {
      const result = baseForm.errors;
      return Object.keys(result).length === 0;
    },
  };
}
