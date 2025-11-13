import type { Birth, BirthFormData } from "~/types";
import { BirthPurity, AnimalBreed } from "~/types";

export type { Birth, BirthFormData };
export { BirthPurity };

export const mockBirths: Birth[] = [
  {
    id: "bi0e8400-e29b-41d4-a716-446655440010",
    animalId: "bb0e8400-e29b-41d4-a716-446655440010",
    birthDate: "2021-05-15",
    breed: AnimalBreed.NELORE,
    gender: "male",
    motherId: undefined,
    fatherId: undefined,
    purity: BirthPurity.PO,
    observation: "Nascimento natural na fazenda",
    createdAt: "2021-05-15",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
  },
  {
    id: "bi0e8400-e29b-41d4-a716-446655440011",
    animalId: "bb0e8400-e29b-41d4-a716-446655440011",
    birthDate: "2020-03-20",
    breed: AnimalBreed.ANGUS,
    gender: "female",
    motherId: "bb0e8400-e29b-41d4-a716-446655440010",
    fatherId: undefined,
    purity: BirthPurity.F1,
    observation: "Nascimento assistido",
    createdAt: "2020-03-20",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
  },
  {
    id: "bi0e8400-e29b-41d4-a716-446655440012",
    animalId: "bb0e8400-e29b-41d4-a716-446655440012",
    birthDate: "2022-08-10",
    breed: AnimalBreed.BRAHMAN,
    gender: "male",
    motherId: "bb0e8400-e29b-41d4-a716-446655440011",
    fatherId: "bb0e8400-e29b-41d4-a716-446655440010",
    purity: BirthPurity.F2,
    observation: "Nascimento com acompanhamento veterinário",
    createdAt: "2022-08-10",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
  },
];

export function getBirthById(birthId: string | undefined): Birth | undefined {
  if (!birthId) return undefined;
  return mockBirths.find((birth) => birth.id === birthId);
}

export function getBirthByAnimalId(animalId: string): Birth | undefined {
  return mockBirths.find((birth) => birth.animalId === animalId);
}

export function getBirthsByCompanyId(companyId: string): Birth[] {
  return mockBirths.filter((birth) => birth.companyId === companyId);
}

export function addBirth(data: BirthFormData): Birth {
  const lastId =
    mockBirths.length > 0
      ? mockBirths[mockBirths.length - 1].id
      : "bi0e8400-e29b-41d4-a716-446655440009";
  const lastPart = lastId.split("-").pop() || "446655440009";
  const lastNumber = parseInt(lastPart, 10);
  const nextNumber = (lastNumber + 1).toString().padStart(12, "0");

  const newBirth: Birth = {
    ...data,
    id: `bi0e8400-e29b-41d4-a716-${nextNumber}`,
    createdAt: new Date().toISOString().split("T")[0],
  };
  mockBirths.push(newBirth);
  return newBirth;
}

export function deleteBirth(birthId: string): boolean {
  const index = mockBirths.findIndex((birth) => birth.id === birthId);
  if (index !== -1) {
    mockBirths.splice(index, 1);
    return true;
  }
  return false;
}

export function updateBirth(birthId: string, data: Partial<BirthFormData>): boolean {
  const index = mockBirths.findIndex((birth) => birth.id === birthId);
  if (index !== -1) {
    mockBirths[index] = {
      ...mockBirths[index],
      ...data,
    };
    return true;
  }
  return false;
}

/**
 * Calculates the birth purity based on parents
 *
 * Logic:
 * - PO (Pure Origin): Both parents are of the same PO breed
 * - PC (Pure by Cross): ~96.875% or more (F5 or higher)
 * - F1: First generation cross (different PO breeds or one PO × one non-PO)
 * - F2, F3, F4, F5: Subsequent generations of crossing
 *
 * @param motherBirth - Mother's birth (optional)
 * @param fatherBirth - Father's birth (optional)
 * @param motherBreed - Mother's breed
 * @param fatherBreed - Father's breed
 * @returns Calculated BirthPurity
 */
export function calculatePurity(
  motherBirth: Birth | undefined,
  fatherBirth: Birth | undefined,
  motherBreed?: string,
  fatherBreed?: string
): BirthPurity {
  // If there is no parent information, assume PO (pure origin)
  if (!motherBirth && !fatherBirth) {
    return BirthPurity.PO;
  }

  // If both parents are PO of the same breed → PO
  if (
    motherBirth?.purity === BirthPurity.PO &&
    fatherBirth?.purity === BirthPurity.PO &&
    motherBreed === fatherBreed
  ) {
    return BirthPurity.PO;
  }

  // If one parent is PO and the other is F1 → F2
  if (
    (motherBirth?.purity === BirthPurity.PO && fatherBirth?.purity === BirthPurity.F1) ||
    (motherBirth?.purity === BirthPurity.F1 && fatherBirth?.purity === BirthPurity.PO)
  ) {
    return BirthPurity.F2;
  }

  // If both are F1 → F2
  if (motherBirth?.purity === BirthPurity.F1 && fatherBirth?.purity === BirthPurity.F1) {
    return BirthPurity.F2;
  }

  // If one is PO and the other is F2 → F3
  if (
    (motherBirth?.purity === BirthPurity.PO && fatherBirth?.purity === BirthPurity.F2) ||
    (motherBirth?.purity === BirthPurity.F2 && fatherBirth?.purity === BirthPurity.PO)
  ) {
    return BirthPurity.F3;
  }

  // If one is PO and the other is F3 → F4
  if (
    (motherBirth?.purity === BirthPurity.PO && fatherBirth?.purity === BirthPurity.F3) ||
    (motherBirth?.purity === BirthPurity.F3 && fatherBirth?.purity === BirthPurity.PO)
  ) {
    return BirthPurity.F4;
  }

  // If one is PO and the other is F4 → F5
  if (
    (motherBirth?.purity === BirthPurity.PO && fatherBirth?.purity === BirthPurity.F4) ||
    (motherBirth?.purity === BirthPurity.F4 && fatherBirth?.purity === BirthPurity.PO)
  ) {
    return BirthPurity.F5;
  }

  // If one is PO and the other is F5 or higher → PC (Pure by Cross)
  if (
    (motherBirth?.purity === BirthPurity.PO && fatherBirth?.purity === BirthPurity.F5) ||
    (motherBirth?.purity === BirthPurity.F5 && fatherBirth?.purity === BirthPurity.PO) ||
    motherBirth?.purity === BirthPurity.PC ||
    fatherBirth?.purity === BirthPurity.PC
  ) {
    return BirthPurity.PC;
  }

  // If both are PO but different breeds → F1
  if (
    motherBirth?.purity === BirthPurity.PO &&
    fatherBirth?.purity === BirthPurity.PO &&
    motherBreed !== fatherBreed
  ) {
    return BirthPurity.F1;
  }

  // If one parent is PO and the other has no information → F1
  if (
    (motherBirth?.purity === BirthPurity.PO && !fatherBirth) ||
    (!motherBirth && fatherBirth?.purity === BirthPurity.PO)
  ) {
    return BirthPurity.F1;
  }

  // If one is F1 and the other has no information → F2
  if (
    (motherBirth?.purity === BirthPurity.F1 && !fatherBirth) ||
    (!motherBirth && fatherBirth?.purity === BirthPurity.F1)
  ) {
    return BirthPurity.F2;
  }

  // If one is F2 and the other has no information → F3
  if (
    (motherBirth?.purity === BirthPurity.F2 && !fatherBirth) ||
    (!motherBirth && fatherBirth?.purity === BirthPurity.F2)
  ) {
    return BirthPurity.F3;
  }

  // If one is F3 and the other has no information → F4
  if (
    (motherBirth?.purity === BirthPurity.F3 && !fatherBirth) ||
    (!motherBirth && fatherBirth?.purity === BirthPurity.F3)
  ) {
    return BirthPurity.F4;
  }

  // If one is F4 and the other has no information → F5
  if (
    (motherBirth?.purity === BirthPurity.F4 && !fatherBirth) ||
    (!motherBirth && fatherBirth?.purity === BirthPurity.F4)
  ) {
    return BirthPurity.F5;
  }

  // If one is F5 and the other has no information → PC
  if (
    (motherBirth?.purity === BirthPurity.F5 && !fatherBirth) ||
    (!motherBirth && fatherBirth?.purity === BirthPurity.F5)
  ) {
    return BirthPurity.PC;
  }

  // Default case: F1 (first generation cross)
  return BirthPurity.F1;
}
