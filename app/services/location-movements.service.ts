import type { LocationMovement, LocationMovementFormData } from "~/types/location-movement";
import { LocationMovementType } from "~/types/location-movement";
import { mockLocationMovements } from "~/mocks/location-movements";
import { findById, findByField, deleteEntity } from "./base-service";
import { generateUUID } from "~/utils/uuid";

export function getLocationMovementsByLocationId(locationId: string): LocationMovement[] {
  return mockLocationMovements.filter((movement) => movement.locationIds.includes(locationId));
}

export function getLocationMovementsByPropertyId(propertyId: string): LocationMovement[] {
  return findByField(mockLocationMovements, "propertyId", propertyId);
}

export function getLocationMovementsByCompanyId(companyId: string): LocationMovement[] {
  return findByField(mockLocationMovements, "companyId", companyId);
}

export function getLocationMovementsByEmployeeId(employeeId: string): LocationMovement[] {
  return mockLocationMovements.filter((movement) => movement.employeeIds.includes(employeeId));
}

export function getLocationMovementsByServiceProviderId(
  serviceProviderId: string
): LocationMovement[] {
  return mockLocationMovements.filter((movement) =>
    movement.serviceProviderIds?.includes(serviceProviderId)
  );
}

export function getLocationMovementsByType(type: LocationMovementType): LocationMovement[] {
  return findByField(mockLocationMovements, "type", type);
}

export function getLocationMovementById(
  movementId: string | undefined
): LocationMovement | undefined {
  return findById(mockLocationMovements, movementId);
}

export function addLocationMovement(data: LocationMovementFormData): LocationMovement {
  const newMovement: LocationMovement = {
    ...data,
    id: generateUUID(),
    createdAt: new Date().toISOString(),
  };
  mockLocationMovements.push(newMovement);
  return newMovement;
}

export function deleteLocationMovement(movementId: string): boolean {
  return deleteEntity(mockLocationMovements, movementId);
}

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
