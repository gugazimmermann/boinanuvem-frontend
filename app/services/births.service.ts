import type { Birth, BirthFormData } from "~/types";
import { BirthPurity } from "~/types";
import { mockBirths } from "~/mocks/births";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";
import { getAnimalsByPropertyId } from "./animals.service";

const ID_PREFIX = "bi0e8400-e29b-41d4-a716";
const DEFAULT_ID = "bi0e8400-e29b-41d4-a716-446655440009";

export function getBirthById(birthId: string | undefined): Birth | undefined {
  return findById(mockBirths, birthId);
}

export function getBirthByAnimalId(animalId: string): Birth | undefined {
  return mockBirths.find((birth) => birth.animalId === animalId);
}

export function getBirthsByCompanyId(companyId: string): Birth[] {
  return findByField(mockBirths, "companyId", companyId);
}

export function addBirth(data: BirthFormData): Birth {
  return createEntity(mockBirths, data, ID_PREFIX, DEFAULT_ID);
}

export function updateBirth(birthId: string, data: Partial<BirthFormData>): boolean {
  return updateEntity(mockBirths, birthId, data);
}

export function deleteBirth(birthId: string): boolean {
  return deleteEntity(mockBirths, birthId);
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

export function getBirthsByPropertyId(propertyId: string): Birth[] {
  const animals = getAnimalsByPropertyId(propertyId);
  const animalIds = new Set(animals.map((a) => a.id));
  return mockBirths.filter((birth) => animalIds.has(birth.animalId));
}

export function getCalvingIntervalsByAnimalId(animalId: string): number[] {
  const birthsAsMother = mockBirths.filter((birth) => birth.motherId === animalId);

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
}

export function getBirthsByFatherId(fatherId: string): Birth[] {
  return mockBirths.filter((birth) => birth.fatherId === fatherId);
}
