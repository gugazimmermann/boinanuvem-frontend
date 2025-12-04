import type { Weighing, WeighingFormData } from "~/types";
import { mockWeighings } from "~/mocks/weighings";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";

const ID_PREFIX = "ww0e8400-e29b-41d4-a716";
const DEFAULT_ID = "ww0e8400-e29b-41d4-a716-446655440009";

export function getWeighingById(weighingId: string | undefined): Weighing | undefined {
  return findById(mockWeighings, weighingId);
}

export function getWeighingsByAnimalId(animalId: string): Weighing[] {
  return findByField(mockWeighings, "animalId", animalId);
}

export function getWeighingsByCompanyId(companyId: string): Weighing[] {
  return findByField(mockWeighings, "companyId", companyId);
}

export function getWeighingsByAnimalIds(animalIds: string[]): Map<string, Weighing[]> {
  const animalIdSet = new Set(animalIds);
  const weighingsMap = new Map<string, Weighing[]>();

  for (const id of animalIds) {
    weighingsMap.set(id, []);
  }

  for (const weighing of mockWeighings) {
    if (animalIdSet.has(weighing.animalId)) {
      const existing = weighingsMap.get(weighing.animalId) || [];
      existing.push(weighing);
      weighingsMap.set(weighing.animalId, existing);
    }
  }

  return weighingsMap;
}

export function addWeighing(data: WeighingFormData): Weighing {
  return createEntity(mockWeighings, data, ID_PREFIX, DEFAULT_ID);
}

export function updateWeighing(weighingId: string, data: Partial<WeighingFormData>): boolean {
  return updateEntity(mockWeighings, weighingId, data);
}

export function deleteWeighing(weighingId: string): boolean {
  return deleteEntity(mockWeighings, weighingId);
}
