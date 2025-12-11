import { getBirthByAnimalId } from "~/services/births.service";
import type { Birth } from "~/types";

/**
 * Create a map of births by animal ID from an array of births
 * @param births Array of birth records
 * @returns Map with animal ID as key and birth record as value
 */
export function createBirthsMap(
  births: Birth[] | undefined | null
): Map<string, Awaited<ReturnType<typeof getBirthByAnimalId>>> {
  const map = new Map<string, Awaited<ReturnType<typeof getBirthByAnimalId>>>();
  if (births) {
    for (const birth of births) {
      map.set(birth.animalId, birth);
    }
  }
  return map;
}
