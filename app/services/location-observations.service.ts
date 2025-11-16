import type {
  LocationObservation,
  LocationObservationFormData,
} from "~/types/location-observation";
import { mockLocationObservations } from "~/mocks/location-observations";
import { findById, findByField, deleteEntity } from "./base-service";
import { generateUUID } from "~/utils/uuid";

/**
 * Get location observations by location ID
 */
export function getLocationObservationsByLocationId(locationId: string): LocationObservation[] {
  return findByField(mockLocationObservations, "locationId", locationId);
}

/**
 * Get location observation by ID
 */
export function getLocationObservationById(
  observationId: string | undefined
): LocationObservation | undefined {
  return findById(mockLocationObservations, observationId);
}

/**
 * Add a new location observation
 */
export function addLocationObservation(data: LocationObservationFormData): LocationObservation {
  const newObservation: LocationObservation = {
    ...data,
    id: generateUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockLocationObservations.push(newObservation);
  return newObservation;
}

/**
 * Delete a location observation
 */
export function deleteLocationObservation(observationId: string): boolean {
  return deleteEntity(mockLocationObservations, observationId);
}

/**
 * Update a location observation
 */
export function updateLocationObservation(
  observationId: string,
  data: Partial<LocationObservationFormData>
): boolean {
  const index = mockLocationObservations.findIndex((obs) => obs.id === observationId);
  if (index !== -1) {
    mockLocationObservations[index] = {
      ...mockLocationObservations[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }
  return false;
}
