import type { LocationMovement, LocationMovementFormData } from "~/types/location-movement";
import { LocationMovementType } from "~/types/location-movement";
import { mockLocationMovements } from "~/mocks/location-movements";
import { findById, findByField, deleteEntity } from "./base-service";
import { generateUUID } from "~/utils/uuid";

/**
 * Get location movements by location ID
 */
export function getLocationMovementsByLocationId(locationId: string): LocationMovement[] {
  return mockLocationMovements.filter((movement) => movement.locationIds.includes(locationId));
}

/**
 * Get location movements by property ID
 */
export function getLocationMovementsByPropertyId(propertyId: string): LocationMovement[] {
  return findByField(mockLocationMovements, "propertyId", propertyId);
}

/**
 * Get location movements by company ID
 */
export function getLocationMovementsByCompanyId(companyId: string): LocationMovement[] {
  return findByField(mockLocationMovements, "companyId", companyId);
}

/**
 * Get location movements by employee ID
 */
export function getLocationMovementsByEmployeeId(employeeId: string): LocationMovement[] {
  return mockLocationMovements.filter((movement) => movement.employeeIds.includes(employeeId));
}

/**
 * Get location movements by service provider ID
 */
export function getLocationMovementsByServiceProviderId(
  serviceProviderId: string
): LocationMovement[] {
  return mockLocationMovements.filter((movement) =>
    movement.serviceProviderIds?.includes(serviceProviderId)
  );
}

/**
 * Get location movements by type
 */
export function getLocationMovementsByType(type: LocationMovementType): LocationMovement[] {
  return findByField(mockLocationMovements, "type", type);
}

/**
 * Get location movement by ID
 */
export function getLocationMovementById(
  movementId: string | undefined
): LocationMovement | undefined {
  return findById(mockLocationMovements, movementId);
}

/**
 * Add a new location movement
 */
export function addLocationMovement(data: LocationMovementFormData): LocationMovement {
  const newMovement: LocationMovement = {
    ...data,
    id: generateUUID(),
    createdAt: new Date().toISOString(),
  };
  mockLocationMovements.push(newMovement);
  return newMovement;
}

/**
 * Delete a location movement
 */
export function deleteLocationMovement(movementId: string): boolean {
  return deleteEntity(mockLocationMovements, movementId);
}

/**
 * Update a location movement
 */
export function updateLocationMovement(
  movementId: string,
  data: Partial<LocationMovementFormData>
): boolean {
  const index = mockLocationMovements.findIndex((movement) => movement.id === movementId);
  if (index !== -1) {
    mockLocationMovements[index] = {
      ...mockLocationMovements[index],
      ...data,
    };
    return true;
  }
  return false;
}

