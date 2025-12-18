import { differenceInMonths } from "date-fns";
import { getBirthByAnimalId } from "~/services/births.service";
import { getAcquisitionByAnimalId } from "~/services/acquisitions.service";
import type { Birth, Weighing } from "~/types";

export interface AnimalBasicData {
  birth: Birth | null;
  acquisition: Awaited<ReturnType<typeof getAcquisitionByAnimalId>> | null;
  acquisitionItem: {
    birthDate?: string;
    gender?: string;
    motherId?: string;
    fatherId?: string;
  } | null;
  isMale: boolean;
}

export async function computeAnimalBasicData(
  animal: { id: string } | null,
  birth?: Awaited<ReturnType<typeof getBirthByAnimalId>> | null,
  acquisition?: Awaited<ReturnType<typeof getAcquisitionByAnimalId>> | null
): Promise<AnimalBasicData | null> {
  if (!animal) return null;

  const birthData = birth ?? (await getBirthByAnimalId(animal.id)) ?? null;
  const acquisitionData = acquisition ?? (await getAcquisitionByAnimalId(animal.id));
  const acquisitionItem =
    acquisitionData?.acquisitionItems?.find((item) => item.animalId === animal?.id) || null;
  const isMale = birthData?.gender === "male" || acquisitionItem?.gender === "male";

  return { birth: birthData, acquisition: acquisitionData, acquisitionItem, isMale };
}

export interface WeighingData {
  sortedWeighings: Weighing[];
  lastWeighing: Weighing | undefined;
  firstWeighing: Weighing | null;
  currentWeight: number;
  weightInArrobas: string;
}

export function computeWeighingData(
  weighings: Weighing[],
  options?: { fallbackWeightKg?: number }
): WeighingData {
  const sortedWeighings = weighings.toSorted(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastWeighing = sortedWeighings[0];
  const firstWeighing = sortedWeighings.length > 0 ? (sortedWeighings.at(-1) ?? null) : null;
  const fallbackWeightKg = options?.fallbackWeightKg ?? 0;
  const currentWeight =
    (lastWeighing?.weight ?? 0) > 0 ? (lastWeighing?.weight ?? 0) : fallbackWeightKg;
  const weightInArrobas = currentWeight > 0 ? (currentWeight / 30).toFixed(2) : "0.00";

  return {
    sortedWeighings,
    lastWeighing: lastWeighing ?? undefined,
    firstWeighing,
    currentWeight,
    weightInArrobas,
  };
}

export function computeAgeData(
  birth: Birth | null,
  acquisitionItem: { birthDate?: string } | null
): number | null {
  const referenceDate = birth?.birthDate || acquisitionItem?.birthDate;
  if (!referenceDate) return null;
  const today = new Date();
  const ref = new Date(referenceDate);
  const months = differenceInMonths(today, ref);
  return months;
}

export function hasNoGenealogyData(
  birth: Birth | null,
  acquisitionItem: {
    birthDate?: string;
    gender?: string;
    motherId?: string;
    fatherId?: string;
  } | null
): boolean {
  return (
    !birth?.purity &&
    !birth?.motherId &&
    !birth?.fatherId &&
    !acquisitionItem?.motherId &&
    !acquisitionItem?.fatherId
  );
}

export function getParentId(
  birth: Birth | null,
  acquisitionItem: { motherId?: string; fatherId?: string } | null,
  parentType: "mother" | "father"
): string | undefined {
  if (parentType === "mother") {
    return birth?.motherId || acquisitionItem?.motherId;
  }
  return birth?.fatherId || acquisitionItem?.fatherId;
}
