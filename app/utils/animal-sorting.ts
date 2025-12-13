import { differenceInDays } from "date-fns";
import type { Animal } from "~/types";
import { getWeighingsByAnimalId } from "~/services/weighings.service";
import { getBirthByAnimalId } from "~/services/births.service";
import { toSafeString } from "~/utils/table-helpers";

export type AnimalSortValue = string | number | undefined;

/**
 * Get birth field value from births map
 */
export function getBirthFieldValue(
  animalId: string,
  field: "breed" | "purity" | "gender",
  birthsMap: Map<string, Awaited<ReturnType<typeof getBirthByAnimalId>>>
): string {
  const birth = birthsMap.get(animalId);
  if (field === "breed") return birth?.breed || "";
  if (field === "purity") return birth?.purity || "";
  return birth?.gender || "";
}

/**
 * Get the last weighing for an animal
 */
export async function getLastWeighing(animalId: string) {
  const weighings = await getWeighingsByAnimalId(animalId);
  const sorted = weighings.toSorted(
    (x, y) => new Date(y.date).getTime() - new Date(x.date).getTime()
  );
  return sorted[0];
}

/**
 * Get weighing field value for sorting
 */
export async function getWeighingFieldValue(
  animal: Animal,
  column: string
): Promise<AnimalSortValue> {
  const weighings = await getWeighingsByAnimalId(animal.id);
  if (weighings.length === 0) return 0;

  const sorted = weighings.toSorted(
    (x, y) => new Date(y.date).getTime() - new Date(x.date).getTime()
  );
  const lastWeighing = sorted[0];

  if (column === "weight") return lastWeighing?.weight || 0;
  if (column === "weightInArrobas") return lastWeighing ? lastWeighing.weight / 30 : 0;
  if (column === "lastWeighingDate")
    return lastWeighing ? new Date(lastWeighing.date).getTime() : 0;
  return 0;
}

/**
 * Calculate GMD (Ganho Médio Diário - Daily Average Gain) for an animal
 */
export async function getGmdValue(animal: Animal): Promise<AnimalSortValue> {
  const weighings = await getWeighingsByAnimalId(animal.id);
  const sorted = weighings.toSorted(
    (x, y) => new Date(y.date).getTime() - new Date(x.date).getTime()
  );
  if (sorted.length >= 2) {
    const weightDiff = sorted[0].weight - sorted[1].weight;
    const daysDiff = differenceInDays(new Date(sorted[0].date), new Date(sorted[1].date));
    return daysDiff > 0 ? weightDiff / daysDiff : 0;
  }
  return 0;
}

/**
 * Get sort value for an animal based on column name
 */
export async function getAnimalSortValue(
  animal: Animal,
  column: string,
  _localeForDateTime: string,
  birthsMap: Map<string, Awaited<ReturnType<typeof getBirthByAnimalId>>>
): Promise<AnimalSortValue> {
  if (column === "code") return animal.code;
  if (column === "registrationNumber") return animal.registrationNumber;

  if (column === "breed") {
    return getBirthFieldValue(animal.id, "breed", birthsMap);
  }
  if (column === "purity") {
    return getBirthFieldValue(animal.id, "purity", birthsMap);
  }
  if (column === "gender") {
    return getBirthFieldValue(animal.id, "gender", birthsMap);
  }

  if (column === "birthDate") {
    const birth = birthsMap.get(animal.id);
    return birth?.birthDate ? new Date(birth.birthDate).getTime() : 0;
  }

  if (column === "acquisitionDate") {
    return animal.acquisitionDate ? new Date(animal.acquisitionDate).getTime() : 0;
  }

  if (column === "weight" || column === "weightInArrobas" || column === "lastWeighingDate") {
    return await getWeighingFieldValue(animal, column);
  }

  if (column === "gmd") {
    return await getGmdValue(animal);
  }

  return animal[column as keyof Animal] as AnimalSortValue;
}

/**
 * Compare two animal sort values for sorting
 */
export function compareAnimalSortValues(
  aValue: AnimalSortValue,
  bValue: AnimalSortValue,
  localeForDateTime: string
): number {
  if (aValue == null && bValue == null) return 0;
  if (aValue == null) return 1;
  if (bValue == null) return -1;

  if (typeof aValue === "string" && typeof bValue === "string") {
    return aValue.localeCompare(bValue, localeForDateTime, { sensitivity: "base" });
  }
  if (typeof aValue === "number" && typeof bValue === "number") {
    return aValue - bValue;
  }
  return toSafeString(aValue).localeCompare(toSafeString(bValue), localeForDateTime);
}
