import { useState, useCallback, useEffect, useRef } from "react";
import { useAlert } from "./use-alert";
import { LocationType, AreaType } from "~/types";
import type { LocationFormData } from "~/types";

export interface LocationFormState {
  code: string;
  name: string;
  locationType: LocationType;
  areaValue: string;
  areaType: AreaType;
  status: "active" | "inactive";
  propertyId: string;
}

export interface UseLocationFormOptions {
  initialData?: Partial<LocationFormState>;
  translationKeys: {
    codeLabel: string;
    nameLabel: string;
    locationTypeLabel: string;
    areaLabel: string;
    propertyLabel: string;
    areaValidationError: string;
  };
  translation: {
    profile: { errors: { required: (label: string) => string } };
  };
  onSubmit: (data: LocationFormData) => void;
  onSuccess?: () => void;
  successMessage: string;
  errorMessage: string;
}

export function useLocationForm({
  initialData,
  translationKeys,
  translation: t,
  onSubmit,
  onSuccess,
  successMessage,
  errorMessage,
}: UseLocationFormOptions) {
  const { alertMessage, showAlert } = useAlert();

  const getInitialFormData = (): LocationFormState => {
    return {
      code: "",
      name: "",
      locationType: LocationType.PASTURE,
      areaValue: "",
      areaType: AreaType.HECTARES,
      status: "active",
      propertyId: "",
      ...initialData,
    };
  };

  const [formData, setFormData] = useState<LocationFormState>(getInitialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialDataRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const currentKey = initialData ? JSON.stringify(initialData) : undefined;
    if (currentKey !== initialDataRef.current) {
      initialDataRef.current = currentKey;
      if (initialData) {
        setFormData((prev) => ({ ...prev, ...initialData }));
      }
    }
  }, [initialData]);

  const handleChange = useCallback(
    (field: keyof LocationFormState, value: string | LocationType | AreaType) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      newErrors.code = t.profile.errors.required(translationKeys.codeLabel);
    }
    if (!formData.name?.trim()) {
      newErrors.name = t.profile.errors.required(translationKeys.nameLabel);
    }
    if (!formData.locationType) {
      newErrors.locationType = t.profile.errors.required(translationKeys.locationTypeLabel);
    }
    if (!formData.propertyId?.trim()) {
      newErrors.propertyId = t.profile.errors.required(translationKeys.propertyLabel);
    }
    if (formData.areaValue?.trim()) {
      const areaNum = Number.parseFloat(formData.areaValue);
      if (Number.isNaN(areaNum) || areaNum <= 0) {
        newErrors.areaValue = translationKeys.areaValidationError;
      }
    } else {
      newErrors.areaValue = t.profile.errors.required(translationKeys.areaLabel);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, translationKeys, t]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      setIsSubmitting(true);
      try {
        const locationData: LocationFormData = {
          code: formData.code,
          name: formData.name,
          locationType: formData.locationType,
          area: {
            value: Number.parseFloat(formData.areaValue),
            type: formData.areaType,
          },
          status: formData.status,
          propertyId: formData.propertyId,
          companyId: "", // Will be set from property
        };

        await Promise.resolve(onSubmit(locationData));
        showAlert(successMessage, "success");
        onSuccess?.();
      } catch (error) {
        console.error("Error submitting form:", error);
        showAlert(errorMessage, "error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validate, onSubmit, onSuccess, successMessage, errorMessage, showAlert]
  );

  return {
    formData,
    errors,
    isSubmitting,
    alertMessage,
    handleChange,
    validate,
    handleSubmit,
    showAlert,
  };
}
