import { useState, useMemo, useEffect, useCallback } from "react";
import { getAnimalsByCompanyId } from "~/services/animals.service";
import { getBirthByAnimalId, getBirthsByCompanyId } from "~/services/births.service";
import type { TranslationKey } from "~/i18n/translations";
import type { useTranslation } from "~/i18n";

export interface UseAnimalSearchOptions {
  companyId: string;
  gender?: "male" | "female";
  t: TranslationKey | ReturnType<typeof useTranslation>;
}

export function useAnimalSearch({ companyId, gender, t }: UseAnimalSearchOptions) {
  const [searchValue, setSearchValue] = useState("");
  const [allAnimals, setAllAnimals] = useState<Awaited<ReturnType<typeof getAnimalsByCompanyId>>>(
    []
  );
  const [births, setBirths] = useState<
    Awaited<ReturnType<typeof getBirthsByCompanyId>> | undefined
  >(undefined);

  useEffect(() => {
    const loadData = async () => {
      if (!companyId) return;
      try {
        const [animalsData, birthsData] = await Promise.all([
          getAnimalsByCompanyId(companyId),
          getBirthsByCompanyId(companyId),
        ]);
        setAllAnimals(animalsData || []);
        setBirths(birthsData);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    loadData();
  }, [companyId]);

  const birthsMap = useMemo(() => {
    const map = new Map<string, Awaited<ReturnType<typeof getBirthByAnimalId>>>();
    if (births) {
      for (const birth of births) {
        map.set(birth.animalId, birth);
      }
    }
    return map;
  }, [births]);

  const getBirthByAnimalIdLocal = useCallback(
    (animalId: string) => {
      return birthsMap.get(animalId);
    },
    [birthsMap]
  );

  const filteredAnimals = useMemo(() => {
    let animals = allAnimals;

    if (gender) {
      animals = animals.filter((animal) => {
        const birth = getBirthByAnimalIdLocal(animal.id);
        return birth?.gender === gender;
      });
    }

    if (!searchValue.trim()) return animals;
    const searchLower = searchValue.toLowerCase();
    return animals.filter((animal) => {
      const birth = getBirthByAnimalIdLocal(animal.id);
      const breedText = birth?.breed ? t.animals.breeds[birth.breed] || birth.breed : "";
      const breedCode = birth?.breed || "";
      return (
        animal.code.toLowerCase().includes(searchLower) ||
        animal.registrationNumber.toLowerCase().includes(searchLower) ||
        breedText.toLowerCase().includes(searchLower) ||
        breedCode.toLowerCase().includes(searchLower)
      );
    });
  }, [allAnimals, gender, searchValue, t, getBirthByAnimalIdLocal]);

  return {
    searchValue,
    setSearchValue,
    filteredAnimals,
    allAnimals: gender
      ? allAnimals.filter((animal) => {
          const birth = getBirthByAnimalIdLocal(animal.id);
          return birth?.gender === gender;
        })
      : allAnimals,
    birthsMap,
  };
}
