import type { Birth, BirthFormData } from "~/types";
import { BirthPurity } from "~/types";
import { apiClient, ApiError } from "./api-client";
import { handleApiError, createResourceErrorMessages } from "./error-handlers";
import { getAnimalsByPropertyId } from "./animals.service";

const birthErrors = createResourceErrorMessages("nascimentos");

/**
 * Convert backend Date to frontend string format
 */
function transformBirth(backendBirth: Birth): Birth {
  return {
    ...backendBirth,
    birthDate:
      typeof backendBirth.birthDate === "string"
        ? backendBirth.birthDate
        : new Date(backendBirth.birthDate).toISOString().split("T")[0],
    createdAt:
      typeof backendBirth.createdAt === "string"
        ? backendBirth.createdAt
        : new Date(backendBirth.createdAt).toISOString(),
  };
}

/**
 * Get all births for the current user's company via API
 */
export async function getBirthsByCompanyId(_companyId: string): Promise<Birth[] | undefined> {
  try {
    const births = await apiClient.get<Birth[]>("/births");
    return births.map(transformBirth);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) {
      return undefined;
    }
    handleApiError(error, birthErrors.list);
  }
}

/**
 * Get a single birth by ID via API
 */
export async function getBirthById(birthId: string | undefined): Promise<Birth | undefined> {
  if (!birthId) return undefined;
  try {
    const birth = await apiClient.get<Birth>(`/births/${birthId}`);
    return transformBirth(birth);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return undefined;
    }
    handleApiError(error, {
      ...birthErrors.view,
      403: "Você não tem permissão para visualizar este nascimento",
    });
  }
}

/**
 * Get birth by animal ID via API
 */
export async function getBirthByAnimalId(animalId: string): Promise<Birth | undefined> {
  try {
    const births = await apiClient.get<Birth[]>("/births");
    const birth = births.find((b) => b.animalId === animalId);
    return birth ? transformBirth(birth) : undefined;
  } catch (error) {
    handleApiError(error, birthErrors.list);
  }
}

/**
 * Create a new birth via API (backend creates the animal automatically)
 */
export async function addBirth(
  data: BirthFormData & { code: string; registrationNumber: string; propertyId: string }
): Promise<Birth> {
  try {
    const createDto = {
      code: data.code,
      registrationNumber: data.registrationNumber,
      propertyId: data.propertyId,
      birthDate: data.birthDate,
      breed: data.breed || undefined,
      gender: data.gender || undefined,
      motherId: data.motherId || undefined,
      fatherId: data.fatherId || undefined,
      purity: data.purity || undefined,
      observation: data.observation || undefined,
    };

    const response = await apiClient.post<Birth>("/births", createDto);
    return transformBirth(response);
  } catch (error) {
    handleApiError(error, {
      ...birthErrors.create,
      409: "Já existe um animal com este código ou número de registro",
    });
  }
}

/**
 * Update a birth via API
 */
export async function updateBirth(birthId: string, data: Partial<BirthFormData>): Promise<Birth> {
  try {
    const updateDto: Record<string, unknown> = {};
    if (data.birthDate !== undefined) updateDto.birthDate = data.birthDate;
    if (data.breed !== undefined) updateDto.breed = data.breed || undefined;
    if (data.gender !== undefined) updateDto.gender = data.gender || undefined;
    if (data.motherId !== undefined) updateDto.motherId = data.motherId || undefined;
    if (data.fatherId !== undefined) updateDto.fatherId = data.fatherId || undefined;
    if (data.purity !== undefined) updateDto.purity = data.purity || undefined;
    if (data.observation !== undefined) updateDto.observation = data.observation || undefined;

    const response = await apiClient.put<Birth>(`/births/${birthId}`, updateDto);
    return transformBirth(response);
  } catch (error) {
    handleApiError(error, {
      ...birthErrors.update,
      404: "Nascimento não encontrado",
    });
  }
}

/**
 * Delete a birth via API
 */
export async function deleteBirth(birthId: string): Promise<void> {
  try {
    await apiClient.delete(`/births/${birthId}`);
  } catch (error) {
    handleApiError(error, birthErrors.delete);
  }
}

const PURITY_SEQUENCE: BirthPurity[] = [
  BirthPurity.PO,
  BirthPurity.F1,
  BirthPurity.F2,
  BirthPurity.F3,
  BirthPurity.F4,
  BirthPurity.F5,
  BirthPurity.PC,
];

function getNextPurity(purity: BirthPurity): BirthPurity | null {
  const index = PURITY_SEQUENCE.indexOf(purity);
  return index >= 0 && index < PURITY_SEQUENCE.length - 1 ? PURITY_SEQUENCE[index + 1] : null;
}

function getPurityWhenOneMissing(
  motherBirth: Birth | undefined,
  fatherBirth: Birth | undefined
): BirthPurity | null {
  if (!motherBirth && !fatherBirth) {
    return BirthPurity.PO;
  }

  const motherPurity = motherBirth?.purity;
  const fatherPurity = fatherBirth?.purity;
  const availablePurity = motherPurity || fatherPurity;

  if (!availablePurity) return null;

  if (motherPurity && !fatherBirth) {
    return getNextPurity(motherPurity);
  }
  if (!motherBirth && fatherPurity) {
    return getNextPurity(fatherPurity);
  }

  return null;
}

function checkPOPOCombination(motherBreed?: string, fatherBreed?: string): BirthPurity | null {
  if (motherBreed === fatherBreed) {
    return BirthPurity.PO;
  }
  return BirthPurity.F1;
}

function checkPOAndF1Combination(): BirthPurity {
  return BirthPurity.F2;
}

function checkF1F1Combination(): BirthPurity {
  return BirthPurity.F2;
}

function checkPOAndF2Combination(): BirthPurity {
  return BirthPurity.F3;
}

function checkPOAndF3Combination(): BirthPurity {
  return BirthPurity.F4;
}

function checkPOAndF4Combination(): BirthPurity {
  return BirthPurity.F5;
}

function checkPOAndF5OrPCCombination(
  motherPurity: BirthPurity,
  fatherPurity: BirthPurity
): BirthPurity | null {
  if (
    (motherPurity === BirthPurity.PO && fatherPurity === BirthPurity.F5) ||
    (motherPurity === BirthPurity.F5 && fatherPurity === BirthPurity.PO) ||
    motherPurity === BirthPurity.PC ||
    fatherPurity === BirthPurity.PC
  ) {
    return BirthPurity.PC;
  }
  return null;
}

function getPurityForPOPO(motherBreed?: string, fatherBreed?: string): BirthPurity | null {
  return checkPOPOCombination(motherBreed, fatherBreed);
}

function getPurityForPOAndF1(): BirthPurity | null {
  return checkPOAndF1Combination();
}

function getPurityForF1F1(): BirthPurity | null {
  return checkF1F1Combination();
}

function getPurityForPOAndF2(): BirthPurity | null {
  return checkPOAndF2Combination();
}

function getPurityForPOAndF3(): BirthPurity | null {
  return checkPOAndF3Combination();
}

function getPurityForPOAndF4(): BirthPurity | null {
  return checkPOAndF4Combination();
}

function checkPOAndFCombination(
  motherPurity: BirthPurity,
  fatherPurity: BirthPurity,
  fLevel: BirthPurity
): boolean {
  return (
    (motherPurity === BirthPurity.PO && fatherPurity === fLevel) ||
    (motherPurity === fLevel && fatherPurity === BirthPurity.PO)
  );
}

function getPurityWhenBothPresent(
  motherBirth: Birth,
  fatherBirth: Birth,
  motherBreed?: string,
  fatherBreed?: string
): BirthPurity | null {
  const motherPurity = motherBirth.purity;
  const fatherPurity = fatherBirth.purity;

  if (!motherPurity || !fatherPurity) {
    return null;
  }

  if (motherPurity === BirthPurity.PO && fatherPurity === BirthPurity.PO) {
    return getPurityForPOPO(motherBreed, fatherBreed);
  }

  if (checkPOAndFCombination(motherPurity, fatherPurity, BirthPurity.F1)) {
    return getPurityForPOAndF1();
  }

  if (motherPurity === BirthPurity.F1 && fatherPurity === BirthPurity.F1) {
    return getPurityForF1F1();
  }

  if (checkPOAndFCombination(motherPurity, fatherPurity, BirthPurity.F2)) {
    return getPurityForPOAndF2();
  }

  if (checkPOAndFCombination(motherPurity, fatherPurity, BirthPurity.F3)) {
    return getPurityForPOAndF3();
  }

  if (checkPOAndFCombination(motherPurity, fatherPurity, BirthPurity.F4)) {
    return getPurityForPOAndF4();
  }

  return checkPOAndF5OrPCCombination(motherPurity, fatherPurity);
}

export function calculatePurity(
  motherBirth: Birth | undefined,
  fatherBirth: Birth | undefined,
  motherBreed?: string,
  fatherBreed?: string
): BirthPurity {
  if (!motherBirth && !fatherBirth) {
    return BirthPurity.PO;
  }

  if (motherBirth && fatherBirth) {
    const result = getPurityWhenBothPresent(motherBirth, fatherBirth, motherBreed, fatherBreed);
    if (result !== null) {
      return result;
    }
  } else {
    const result = getPurityWhenOneMissing(motherBirth, fatherBirth);
    if (result !== null) {
      return result;
    }
  }

  return BirthPurity.F1;
}

/**
 * Get births by property ID via API
 */
export async function getBirthsByPropertyId(propertyId: string): Promise<Birth[] | undefined> {
  try {
    const animals = await getAnimalsByPropertyId(propertyId);
    const animalIds = new Set(animals.map((a) => a.id));
    const births = await apiClient.get<Birth[]>("/births");
    return births.filter((birth) => animalIds.has(birth.animalId)).map(transformBirth);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) {
      return undefined;
    }
    if (error instanceof Error) {
      return undefined;
    }
    handleApiError(error, birthErrors.list);
  }
}

/**
 * Get calving intervals by animal ID via API
 */
export async function getCalvingIntervalsByAnimalId(animalId: string): Promise<number[]> {
  try {
    const births = await apiClient.get<Birth[]>("/births");
    const birthsAsMother = births.filter((birth) => birth.motherId === animalId);

    if (birthsAsMother.length < 2) {
      return [];
    }

    const birthsArray = [...birthsAsMother];
    const sortedBirths = birthsArray.toSorted(
      (a, b) => new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime()
    );

    const intervals: number[] = [];
    for (let i = 1; i < sortedBirths.length; i++) {
      const prevDate = new Date(sortedBirths[i - 1].birthDate).getTime();
      const currDate = new Date(sortedBirths[i].birthDate).getTime();
      const intervalDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
      intervals.push(intervalDays);
    }

    return intervals;
  } catch (error) {
    handleApiError(error, birthErrors.list);
  }
}

/**
 * Get births by father ID via API
 */
export async function getBirthsByFatherId(fatherId: string): Promise<Birth[]> {
  try {
    const births = await apiClient.get<Birth[]>("/births");
    return births.filter((birth) => birth.fatherId === fatherId).map(transformBirth);
  } catch (error) {
    handleApiError(error, birthErrors.list);
  }
}
