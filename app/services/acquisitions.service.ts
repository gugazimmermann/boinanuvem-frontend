import type { Acquisition, AcquisitionFormData } from "~/types";
import { mockAcquisitions } from "~/mocks/acquisitions";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";

const ID_PREFIX = "ac0e8400-e29b-41d4-a716";
const DEFAULT_ID = "ac0e8400-e29b-41d4-a716-446655440009";

/**
 * Get acquisition by ID
 */
export function getAcquisitionById(acquisitionId: string | undefined): Acquisition | undefined {
  return findById(mockAcquisitions, acquisitionId);
}

/**
 * Get acquisition by animal ID
 */
export function getAcquisitionByAnimalId(animalId: string): Acquisition | undefined {
  return mockAcquisitions.find((acquisition) => acquisition.animalId === animalId);
}

/**
 * Get acquisitions by company ID
 */
export function getAcquisitionsByCompanyId(companyId: string): Acquisition[] {
  return findByField(mockAcquisitions, "companyId", companyId);
}

/**
 * Add a new acquisition
 */
export function addAcquisition(data: AcquisitionFormData): Acquisition {
  return createEntity(mockAcquisitions, data, ID_PREFIX, DEFAULT_ID);
}

/**
 * Update an acquisition
 */
export function updateAcquisition(
  acquisitionId: string,
  data: Partial<AcquisitionFormData>
): boolean {
  return updateEntity(mockAcquisitions, acquisitionId, data);
}

/**
 * Delete an acquisition
 */
export function deleteAcquisition(acquisitionId: string): boolean {
  return deleteEntity(mockAcquisitions, acquisitionId);
}

/**
 * Generate acquisition ID (used in mock initialization)
 */
export function generateAcquisitionId(index: number): string {
  const base = 446655440100 + index;
  return `ac0e8400-e29b-41d4-a716-${base.toString().padStart(12, "0")}`;
}

