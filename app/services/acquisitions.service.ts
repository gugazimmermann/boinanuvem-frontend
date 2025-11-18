import type { Acquisition, AcquisitionFormData } from "~/types";
import { mockAcquisitions } from "~/mocks/acquisitions";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";

const ID_PREFIX = "ac0e8400-e29b-41d4-a716";
const DEFAULT_ID = "ac0e8400-e29b-41d4-a716-446655440009";

export function getAcquisitionById(acquisitionId: string | undefined): Acquisition | undefined {
  return findById(mockAcquisitions, acquisitionId);
}

export function getAcquisitionByAnimalId(animalId: string): Acquisition | undefined {
  return mockAcquisitions.find((acquisition) => acquisition.animalId === animalId);
}

export function getAcquisitionsByCompanyId(companyId: string): Acquisition[] {
  return findByField(mockAcquisitions, "companyId", companyId);
}

export function addAcquisition(data: AcquisitionFormData): Acquisition {
  return createEntity(mockAcquisitions, data, ID_PREFIX, DEFAULT_ID);
}

export function updateAcquisition(
  acquisitionId: string,
  data: Partial<AcquisitionFormData>
): boolean {
  return updateEntity(mockAcquisitions, acquisitionId, data);
}

export function deleteAcquisition(acquisitionId: string): boolean {
  return deleteEntity(mockAcquisitions, acquisitionId);
}

export function generateAcquisitionId(index: number): string {
  const base = 446655440100 + index;
  return `ac0e8400-e29b-41d4-a716-${base.toString().padStart(12, "0")}`;
}
