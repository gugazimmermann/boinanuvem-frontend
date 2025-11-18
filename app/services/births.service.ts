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

export function calculatePurity(
  motherBirth: Birth | undefined,
  fatherBirth: Birth | undefined,
  motherBreed?: string,
  fatherBreed?: string
): BirthPurity {
  if (!motherBirth && !fatherBirth) {
    return BirthPurity.PO;
  }

  if (
    motherBirth?.purity === BirthPurity.PO &&
    fatherBirth?.purity === BirthPurity.PO &&
    motherBreed === fatherBreed
  ) {
    return BirthPurity.PO;
  }

  if (
    (motherBirth?.purity === BirthPurity.PO && fatherBirth?.purity === BirthPurity.F1) ||
    (motherBirth?.purity === BirthPurity.F1 && fatherBirth?.purity === BirthPurity.PO)
  ) {
    return BirthPurity.F2;
  }

  if (motherBirth?.purity === BirthPurity.F1 && fatherBirth?.purity === BirthPurity.F1) {
    return BirthPurity.F2;
  }

  if (
    (motherBirth?.purity === BirthPurity.PO && fatherBirth?.purity === BirthPurity.F2) ||
    (motherBirth?.purity === BirthPurity.F2 && fatherBirth?.purity === BirthPurity.PO)
  ) {
    return BirthPurity.F3;
  }

  if (
    (motherBirth?.purity === BirthPurity.PO && fatherBirth?.purity === BirthPurity.F3) ||
    (motherBirth?.purity === BirthPurity.F3 && fatherBirth?.purity === BirthPurity.PO)
  ) {
    return BirthPurity.F4;
  }

  if (
    (motherBirth?.purity === BirthPurity.PO && fatherBirth?.purity === BirthPurity.F4) ||
    (motherBirth?.purity === BirthPurity.F4 && fatherBirth?.purity === BirthPurity.PO)
  ) {
    return BirthPurity.F5;
  }

  if (
    (motherBirth?.purity === BirthPurity.PO && fatherBirth?.purity === BirthPurity.F5) ||
    (motherBirth?.purity === BirthPurity.F5 && fatherBirth?.purity === BirthPurity.PO) ||
    motherBirth?.purity === BirthPurity.PC ||
    fatherBirth?.purity === BirthPurity.PC
  ) {
    return BirthPurity.PC;
  }

  if (
    motherBirth?.purity === BirthPurity.PO &&
    fatherBirth?.purity === BirthPurity.PO &&
    motherBreed !== fatherBreed
  ) {
    return BirthPurity.F1;
  }

  if (
    (motherBirth?.purity === BirthPurity.PO && !fatherBirth) ||
    (!motherBirth && fatherBirth?.purity === BirthPurity.PO)
  ) {
    return BirthPurity.F1;
  }

  if (
    (motherBirth?.purity === BirthPurity.F1 && !fatherBirth) ||
    (!motherBirth && fatherBirth?.purity === BirthPurity.F1)
  ) {
    return BirthPurity.F2;
  }

  if (
    (motherBirth?.purity === BirthPurity.F2 && !fatherBirth) ||
    (!motherBirth && fatherBirth?.purity === BirthPurity.F2)
  ) {
    return BirthPurity.F3;
  }

  if (
    (motherBirth?.purity === BirthPurity.F3 && !fatherBirth) ||
    (!motherBirth && fatherBirth?.purity === BirthPurity.F3)
  ) {
    return BirthPurity.F4;
  }

  if (
    (motherBirth?.purity === BirthPurity.F4 && !fatherBirth) ||
    (!motherBirth && fatherBirth?.purity === BirthPurity.F4)
  ) {
    return BirthPurity.F5;
  }

  if (
    (motherBirth?.purity === BirthPurity.F5 && !fatherBirth) ||
    (!motherBirth && fatherBirth?.purity === BirthPurity.F5)
  ) {
    return BirthPurity.PC;
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

  const sortedBirths = [...birthsAsMother].sort(
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
