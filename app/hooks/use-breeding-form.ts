import { useState } from "react";
import { getNextAttemptNumber } from "~/services/breedings.service";
import type { BreedingMethod } from "~/types";
import type { TranslationKey } from "~/i18n/translations";
import type { useTranslation } from "~/i18n";

export interface BreedingFormState {
  animalIds: string[];
  date: string;
  method: BreedingMethod | "";
  bullId: string;
  attemptNumbers: Record<string, number>;
  semenCode: string;
  employeeIds: string[];
  serviceProviderIds: string[];
  observation: string;
  confirmed: boolean;
}

export interface UseBreedingFormOptions {
  initialAnimalIds?: string[];
  initialDate?: string;
  t: TranslationKey | ReturnType<typeof useTranslation>;
}

export function useBreedingForm({ initialAnimalIds = [], initialDate, t }: UseBreedingFormOptions) {
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState<BreedingFormState>({
    animalIds: initialAnimalIds,
    date: initialDate || today,
    method: "",
    bullId: "",
    attemptNumbers: {},
    semenCode: "",
    employeeIds: [],
    serviceProviderIds: [],
    observation: "",
    confirmed: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    field: keyof BreedingFormState,
    value: string | string[] | Record<string, number> | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleAnimalSelection = (animalId: string) => {
    setFormData((prev) => {
      const currentIds = prev.animalIds;
      const newIds = currentIds.includes(animalId)
        ? currentIds.filter((id) => id !== animalId)
        : [...currentIds, animalId];

      const attemptNumbers = { ...prev.attemptNumbers };
      if (prev.method === "artificial_insemination") {
        if (newIds.includes(animalId) && !attemptNumbers[animalId]) {
          attemptNumbers[animalId] = getNextAttemptNumber(animalId);
        } else if (!newIds.includes(animalId)) {
          delete attemptNumbers[animalId];
        }
      }

      return { ...prev, animalIds: newIds, attemptNumbers };
    });
  };

  const toggleSelection = (field: "employeeIds" | "serviceProviderIds", id: string) => {
    setFormData((prev) => {
      const currentIds = prev[field];
      const newIds = currentIds.includes(id)
        ? currentIds.filter((itemId) => itemId !== id)
        : [...currentIds, id];
      return { ...prev, [field]: newIds };
    });
  };

  const handleMethodChange = (method: BreedingMethod) => {
    setFormData((prev) => {
      let attemptNumbers: Record<string, number>;

      if (method === "artificial_insemination") {
        attemptNumbers = {};
        for (const animalId of prev.animalIds) {
          attemptNumbers[animalId] = getNextAttemptNumber(animalId);
        }
      } else {
        attemptNumbers = {};
      }

      return {
        ...prev,
        method,
        bullId: method === "natural" ? prev.bullId : "",
        semenCode: method === "artificial_insemination" ? prev.semenCode : "",
        attemptNumbers,
      };
    });

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.bullId;
      delete newErrors.semenCode;
      return newErrors;
    });
  };

  const handleAttemptNumberChange = (animalId: string, value: string) => {
    const numValue = Number.parseInt(value, 10);
    if (!Number.isNaN(numValue) && numValue > 0) {
      setFormData((prev) => ({
        ...prev,
        attemptNumbers: { ...prev.attemptNumbers, [animalId]: numValue },
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.animalIds.length === 0) {
      newErrors.animalIds = t.breedings.new.errors.animalRequired;
    }

    if (!formData.date) {
      newErrors.date = t.breedings.new.errors.dateRequired;
    }

    if (!formData.method) {
      newErrors.method = t.breedings.new.errors.methodRequired;
    }

    if (formData.method === "natural" && !formData.bullId) {
      newErrors.bullId = t.breedings.new.errors.bullRequired;
    }

    if (formData.method === "artificial_insemination") {
      if (!formData.semenCode?.trim()) {
        newErrors.semenCode = t.breedings.new.errors.semenCodeRequired;
      }

      for (const animalId of formData.animalIds) {
        const attemptNum = formData.attemptNumbers[animalId];
        if (!attemptNum || attemptNum < 1) {
          newErrors[`attemptNumber_${animalId}`] = t.breedings.new.errors.attemptNumberRequired;
        }
      }
    }

    if (formData.employeeIds.length === 0 && formData.serviceProviderIds.length === 0) {
      newErrors.responsible = t.breedings.new.errors.responsibleRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    formData,
    errors,
    handleChange,
    toggleAnimalSelection,
    toggleSelection,
    handleMethodChange,
    handleAttemptNumberChange,
    validate,
    setFormData,
  };
}
