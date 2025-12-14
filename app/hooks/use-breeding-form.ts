import { useState, useRef, useEffect, useCallback } from "react";
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
  companyId: string;
  t: TranslationKey | ReturnType<typeof useTranslation>;
}

export function useBreedingForm({
  initialAnimalIds = [],
  initialDate,
  companyId: _companyId,
  t,
}: UseBreedingFormOptions) {
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

  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update ref synchronously when setFormData is called
  const setFormDataWithRef = useCallback((updater: React.SetStateAction<BreedingFormState>) => {
    setFormData((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      formDataRef.current = next;
      return next;
    });
  }, []);

  const handleChange = (
    field: keyof BreedingFormState,
    value: string | string[] | Record<string, number> | boolean
  ) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      formDataRef.current = next;
      return next;
    });
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const updateAttemptNumberForAnimal = useCallback((animalId: string) => {
    getNextAttemptNumber(animalId).then((attemptNumber) => {
      setFormData((current) => ({
        ...current,
        attemptNumbers: { ...current.attemptNumbers, [animalId]: attemptNumber },
      }));
    });
  }, []);

  const toggleAnimalSelection = async (animalId: string) => {
    setFormData((prev) => {
      const currentIds = prev.animalIds;
      const newIds = currentIds.includes(animalId)
        ? currentIds.filter((id) => id !== animalId)
        : [...currentIds, animalId];

      const attemptNumbers = { ...prev.attemptNumbers };
      if (prev.method === "artificial_insemination") {
        if (newIds.includes(animalId) && !attemptNumbers[animalId]) {
          // Async call - will update on next render
          updateAttemptNumberForAnimal(animalId);
        } else if (!newIds.includes(animalId)) {
          delete attemptNumbers[animalId];
        }
      }

      const next = { ...prev, animalIds: newIds, attemptNumbers };
      formDataRef.current = next;
      return next;
    });
  };

  const toggleSelection = (field: "employeeIds" | "serviceProviderIds", id: string) => {
    setFormData((prev) => {
      const currentIds = prev[field];
      const newIds = currentIds.includes(id)
        ? currentIds.filter((itemId) => itemId !== id)
        : [...currentIds, id];
      const next = { ...prev, [field]: newIds };
      formDataRef.current = next;
      return next;
    });
  };

  const updateAttemptNumbersForAnimals = useCallback(
    (animalIds: string[]) => {
      // Async calls - will update on next render
      for (const animalId of animalIds) {
        updateAttemptNumberForAnimal(animalId);
      }
    },
    [updateAttemptNumberForAnimal]
  );

  const handleMethodChange = (method: BreedingMethod) => {
    setFormData((prev) => {
      let attemptNumbers: Record<string, number>;

      if (method === "artificial_insemination") {
        attemptNumbers = {};
        // Async calls - will update on next render
        updateAttemptNumbersForAnimals(prev.animalIds);
      } else {
        attemptNumbers = {};
      }

      const next = {
        ...prev,
        method,
        bullId: method === "natural" ? prev.bullId : "",
        semenCode: method === "artificial_insemination" ? prev.semenCode : "",
        attemptNumbers,
      };
      formDataRef.current = next;
      return next;
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
      setFormData((prev) => {
        const next = {
          ...prev,
          attemptNumbers: { ...prev.attemptNumbers, [animalId]: numValue },
        };
        formDataRef.current = next;
        return next;
      });
    }
  };

  const validate = useCallback(
    (dataToValidate?: BreedingFormState): boolean => {
      // Use provided data, or current formData state, or ref as fallback
      // This ensures we can validate the latest data even when called immediately after setFormData
      const currentFormData = dataToValidate ?? formDataRef.current;
      const newErrors: Record<string, string> = {};

      if (currentFormData.animalIds.length === 0) {
        newErrors.animalIds = t.breedings.new.errors.animalRequired;
      }

      if (!currentFormData.date) {
        newErrors.date = t.breedings.new.errors.dateRequired;
      }

      if (!currentFormData.method) {
        newErrors.method = t.breedings.new.errors.methodRequired;
      }

      if (currentFormData.method === "natural" && !currentFormData.bullId) {
        newErrors.bullId = t.breedings.new.errors.bullRequired;
      }

      if (currentFormData.method === "artificial_insemination") {
        if (!currentFormData.semenCode?.trim()) {
          newErrors.semenCode = t.breedings.new.errors.semenCodeRequired;
        }

        for (const animalId of currentFormData.animalIds) {
          const attemptNum = currentFormData.attemptNumbers[animalId];
          if (!attemptNum || attemptNum < 1) {
            newErrors[`attemptNumber_${animalId}`] = t.breedings.new.errors.attemptNumberRequired;
          }
        }
      }

      if (
        currentFormData.employeeIds.length === 0 &&
        currentFormData.serviceProviderIds.length === 0
      ) {
        newErrors.responsible = t.breedings.new.errors.responsibleRequired;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [t]
  );

  return {
    formData,
    errors,
    handleChange,
    toggleAnimalSelection,
    toggleSelection,
    handleMethodChange,
    handleAttemptNumberChange,
    validate,
    setFormData: setFormDataWithRef,
  };
}
