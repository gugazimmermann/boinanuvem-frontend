import type { AnimalObservation, AnimalObservationFormData } from "~/types/animal-observation";
import { mockAnimalObservations } from "~/mocks/animal-observations";
import { findById, findByField, deleteEntity } from "./base-service";
import { generateUUID } from "~/utils/uuid";

/**
 * Get animal observations by animal ID
 */
export function getAnimalObservationsByAnimalId(animalId: string): AnimalObservation[] {
  return findByField(mockAnimalObservations, "animalId", animalId);
}

/**
 * Get animal observation by ID
 */
export function getAnimalObservationById(
  observationId: string | undefined
): AnimalObservation | undefined {
  return findById(mockAnimalObservations, observationId);
}

/**
 * Add a new animal observation
 */

export function addAnimalObservation(data: AnimalObservationFormData): AnimalObservation {
  const newObservation: AnimalObservation = {
    ...data,
    id: generateUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockAnimalObservations.push(newObservation);
  return newObservation;
}

/**
 * Delete an animal observation
 */
export function deleteAnimalObservation(observationId: string): boolean {
  return deleteEntity(mockAnimalObservations, observationId);
}

/**
 * Update an animal observation
 */
export function updateAnimalObservation(
  observationId: string,
  data: Partial<AnimalObservationFormData>
): boolean {
  const index = mockAnimalObservations.findIndex((obs) => obs.id === observationId);
  if (index !== -1) {
    mockAnimalObservations[index] = {
      ...mockAnimalObservations[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }
  return false;
}
