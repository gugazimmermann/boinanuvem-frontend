import { useState, useMemo } from "react";
import { getAnimalsByCompanyId } from "~/services/animals.service";
import { getBirthByAnimalId } from "~/services/births.service";
import type { TranslationKey } from "~/i18n/translations";
import type { useTranslation } from "~/i18n";

export interface UseAnimalSearchOptions {
  companyId: string;
  gender?: "male" | "female";
  t: TranslationKey | ReturnType<typeof useTranslation>;
}

export function useAnimalSearch({ companyId, gender, t }: UseAnimalSearchOptions) {
  const [searchValue, setSearchValue] = useState("");

  const allAnimals = useMemo(() => getAnimalsByCompanyId(companyId), [companyId]);

  const filteredAnimals = useMemo(() => {
    let animals = allAnimals;

    // Filter by gender if specified
    if (gender) {
      animals = animals.filter((animal) => {
        const birth = getBirthByAnimalId(animal.id);
        return birth?.gender === gender;
      });
    }

    // Filter by search value
    if (!searchValue.trim()) return animals;
    const searchLower = searchValue.toLowerCase();
    return animals.filter((animal) => {
      const birth = getBirthByAnimalId(animal.id);
      const breedText = birth?.breed ? t.animals.breeds[birth.breed] || birth.breed : "";
      return (
        animal.code.toLowerCase().includes(searchLower) ||
        animal.registrationNumber.toLowerCase().includes(searchLower) ||
        breedText.toLowerCase().includes(searchLower)
      );
    });
  }, [allAnimals, gender, searchValue, t]);

  return {
    searchValue,
    setSearchValue,
    filteredAnimals,
    allAnimals: gender
      ? allAnimals.filter((animal) => {
          const birth = getBirthByAnimalId(animal.id);
          return birth?.gender === gender;
        })
      : allAnimals,
  };
}
