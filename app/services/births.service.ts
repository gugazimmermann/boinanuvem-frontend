import type { Birth, BirthFormData } from "~/types";
import { BirthPurity } from "~/types";
import { mockBirths } from "~/mocks/births";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";

const ID_PREFIX = "bi0e8400-e29b-41d4-a716";
const DEFAULT_ID = "bi0e8400-e29b-41d4-a716-446655440009";

/**
 * Get birth by ID
 */
export function getBirthById(birthId: string | undefined): Birth | undefined {
  return findById(mockBirths, birthId);
}

/**
 * Get birth by animal ID
 */
export function getBirthByAnimalId(animalId: string): Birth | undefined {
  return mockBirths.find((birth) => birth.animalId === animalId);
}

/**
 * Get births by company ID
 */
export function getBirthsByCompanyId(companyId: string): Birth[] {
  return findByField(mockBirths, "companyId", companyId);
}

/**
 * Add a new birth
 */
export function addBirth(data: BirthFormData): Birth {
  return createEntity(mockBirths, data, ID_PREFIX, DEFAULT_ID);
}

/**
 * Update a birth
 */
export function updateBirth(birthId: string, data: Partial<BirthFormData>): boolean {
  return updateEntity(mockBirths, birthId, data);
}

/**
 * Delete a birth
 */
export function deleteBirth(birthId: string): boolean {
  return deleteEntity(mockBirths, birthId);
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

