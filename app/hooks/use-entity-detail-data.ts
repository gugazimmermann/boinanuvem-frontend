import { useState, useEffect, useMemo } from "react";
import type { Animal, Birth, Acquisition, Breeding, AcquisitionItem } from "~/types";
import { getWeighingsByAnimalId } from "~/services/weighings.service";
import { createBirthsMap } from "~/utils/births-map";

interface UseEntityDetailDataOptions {
  companyId?: string;
  animals?: Animal[];
  births?: Birth[];
  acquisitions?: Acquisition[];
  breedings?: Breeding[];
}

interface UseEntityDetailDataResult {
  animalsMap: Map<string, Animal>;
  birthsMap: Map<string, Birth>;
  acquisitionItemsByAnimalId: Map<string, AcquisitionItem>;
  acquisitionDateByAnimalId: Map<string, string>;
  breedingsByAnimalId: Map<string, Breeding[]>;
  weighingsMap: Map<string, Awaited<ReturnType<typeof getWeighingsByAnimalId>>>;
  isLoadingWeighings: boolean;
}

/**
 * Hook to manage common data structures and maps used in entity detail pages
 * (properties, locations, etc.)
 */
export function useEntityDetailData({
  companyId: _companyId,
  animals = [],
  births = [],
  acquisitions = [],
  breedings = [],
}: UseEntityDetailDataOptions): UseEntityDetailDataResult {
  const [weighingsMap, setWeighingsMap] = useState<
    Map<string, Awaited<ReturnType<typeof getWeighingsByAnimalId>>>
  >(new Map());
  const [isLoadingWeighings, setIsLoadingWeighings] = useState(false);

  const animalsMap = useMemo(() => new Map(animals.map((a) => [a.id, a])), [animals]);

  const birthsMap = useMemo(() => createBirthsMap(births), [births]);

  const acquisitionItemsByAnimalId = useMemo(() => {
    const map = new Map<string, AcquisitionItem>();
    for (const acq of acquisitions || []) {
      for (const item of acq.acquisitionItems || []) {
        if (item?.animalId) {
          map.set(item.animalId, item);
        }
      }
    }
    return map;
  }, [acquisitions]);

  const acquisitionDateByAnimalId = useMemo(() => {
    const map = new Map<string, string>();
    for (const acq of acquisitions || []) {
      for (const item of acq.acquisitionItems || []) {
        if (item?.animalId && acq.acquisitionDate) {
          map.set(item.animalId, acq.acquisitionDate);
        }
      }
    }
    return map;
  }, [acquisitions]);

  const breedingsByAnimalId = useMemo(() => {
    const map = new Map<string, Breeding[]>();
    for (const b of breedings || []) {
      const existing = map.get(b.animalId) || [];
      existing.push(b);
      map.set(b.animalId, existing);
    }
    return map;
  }, [breedings]);

  // Load weighings for all animals
  useEffect(() => {
    const loadWeighings = async () => {
      if (animals.length === 0) {
        setWeighingsMap(new Map());
        return;
      }

      setIsLoadingWeighings(true);
      try {
        const animalsList = animals || [];
        const weighingsEntries = await Promise.all(
          animalsList.map(async (a) => [a.id, await getWeighingsByAnimalId(a.id)] as const)
        );
        setWeighingsMap(new Map(weighingsEntries));
      } catch (error) {
        console.error("Failed to load weighings:", error);
        setWeighingsMap(new Map());
      } finally {
        setIsLoadingWeighings(false);
      }
    };

    void loadWeighings();
  }, [animals]);

  return {
    animalsMap,
    birthsMap,
    acquisitionItemsByAnimalId,
    acquisitionDateByAnimalId,
    breedingsByAnimalId,
    weighingsMap,
    isLoadingWeighings,
  };
}
