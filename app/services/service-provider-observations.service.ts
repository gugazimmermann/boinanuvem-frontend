import type {
  ServiceProviderObservation,
  ServiceProviderObservationFormData,
} from "~/types/service-provider-observation";
import { mockServiceProviderObservations } from "~/mocks/service-provider-observations";
import { findById, findByField, updateEntity, deleteEntity } from "./base-service";
import { generateUUID } from "~/utils/uuid";

/**
 * Get service provider observations by service provider ID
 */
export function getServiceProviderObservationsByServiceProviderId(
  serviceProviderId: string
): ServiceProviderObservation[] {
  return findByField(mockServiceProviderObservations, "serviceProviderId", serviceProviderId);
}

/**
 * Get service provider observation by ID
 */
export function getServiceProviderObservationById(
  observationId: string | undefined
): ServiceProviderObservation | undefined {
  return findById(mockServiceProviderObservations, observationId);
}

/**
 * Add a new service provider observation
 */
export function addServiceProviderObservation(
  data: ServiceProviderObservationFormData
): ServiceProviderObservation {
  const newObservation: ServiceProviderObservation = {
    ...data,
    id: generateUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockServiceProviderObservations.push(newObservation);
  return newObservation;
}

/**
 * Delete a service provider observation
 */
export function deleteServiceProviderObservation(observationId: string): boolean {
  return deleteEntity(mockServiceProviderObservations, observationId);
}

/**
 * Update a service provider observation
 */
export function updateServiceProviderObservation(
  observationId: string,
  data: Partial<ServiceProviderObservationFormData>
): boolean {
  const index = mockServiceProviderObservations.findIndex((obs) => obs.id === observationId);
  if (index !== -1) {
    mockServiceProviderObservations[index] = {
      ...mockServiceProviderObservations[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }
  return false;
}

