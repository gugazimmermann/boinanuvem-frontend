import type {
  LocationObservation,
  LocationObservationFormData,
} from "~/types/location-observation";
import { mockLocationObservations } from "~/mocks/location-observations";
import { findById, findByField, deleteEntity } from "./base-service";
import { generateUUID } from "~/utils/uuid";

export function getLocationObservationsByLocationId(locationId: string): LocationObservation[] {
  return findByField(mockLocationObservations, "locationId", locationId);
}

export function getLocationObservationById(
  observationId: string | undefined
): LocationObservation | undefined {
  return findById(mockLocationObservations, observationId);
}

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

export function deleteLocationObservation(observationId: string): boolean {
  return deleteEntity(mockLocationObservations, observationId);
}

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
