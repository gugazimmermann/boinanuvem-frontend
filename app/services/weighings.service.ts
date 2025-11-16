import type { Weighing, WeighingFormData } from "~/types";
import { mockWeighings } from "~/mocks/weighings";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";

const ID_PREFIX = "ww0e8400-e29b-41d4-a716";
const DEFAULT_ID = "ww0e8400-e29b-41d4-a716-446655440009";

/**
 * Get weighing by ID
 */
export function getWeighingById(weighingId: string | undefined): Weighing | undefined {
  return findById(mockWeighings, weighingId);
}

/**
 * Get weighings by animal ID
 */
export function getWeighingsByAnimalId(animalId: string): Weighing[] {
  return findByField(mockWeighings, "animalId", animalId);
}

/**
 * Get weighings by company ID
 */
export function getWeighingsByCompanyId(companyId: string): Weighing[] {
  return findByField(mockWeighings, "companyId", companyId);
}

/**
 * Add a new weighing
 */
export function addWeighing(data: WeighingFormData): Weighing {
  return createEntity(mockWeighings, data, ID_PREFIX, DEFAULT_ID);
}

/**
 * Update a weighing
 */
export function updateWeighing(weighingId: string, data: Partial<WeighingFormData>): boolean {
  return updateEntity(mockWeighings, weighingId, data);
}

/**
 * Delete a weighing
 */
export function deleteWeighing(weighingId: string): boolean {
  return deleteEntity(mockWeighings, weighingId);
}
