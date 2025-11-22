import type { SanitaryControl, SanitaryControlFormData } from "~/types/sanitary-control";
import { mockSanitaryControls } from "~/mocks/sanitary-controls";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";

const ID_PREFIX = "ma0e8400-e29b-41d4-a716";
const DEFAULT_ID = "ma0e8400-e29b-41d4-a716-446655440010";

export function getSanitaryControlById(id: string | undefined): SanitaryControl | undefined {
  return findById(mockSanitaryControls, id);
}

export function getSanitaryControlsByAnimalId(animalId: string): SanitaryControl[] {
  return findByField(mockSanitaryControls, "animalId", animalId);
}

export function getSanitaryControlsByCompanyId(companyId: string): SanitaryControl[] {
  return findByField(mockSanitaryControls, "companyId", companyId);
}

export function addSanitaryControl(data: SanitaryControlFormData): SanitaryControl {
  return createEntity(mockSanitaryControls, data, ID_PREFIX, DEFAULT_ID);
}

export function updateSanitaryControl(id: string, data: Partial<SanitaryControlFormData>): boolean {
  return updateEntity(mockSanitaryControls, id, data);
}

export function deleteSanitaryControl(id: string): boolean {
  return deleteEntity(mockSanitaryControls, id);
}

export const getMedicineAdministrationById = getSanitaryControlById;
export const getMedicineAdministrationsByAnimalId = getSanitaryControlsByAnimalId;
export const getMedicineAdministrationsByCompanyId = getSanitaryControlsByCompanyId;
export const addMedicineAdministration = addSanitaryControl;
export const updateMedicineAdministration = updateSanitaryControl;
export const deleteMedicineAdministration = deleteSanitaryControl;
