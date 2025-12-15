import type { LocationMovement, LocationMovementFormData } from "~/types/location-movement";
import { LocationMovementType } from "~/types/location-movement";
import { apiClient } from "./api-client";
import { createCrudHandlers, createGetByIdHandler, createListHandler } from "./service-helpers";
import { createEntityTransform } from "./transform-helpers";
import { createResourceErrorMessages, handleApiError } from "./error-handlers";

const locationMovementsErrors = createResourceErrorMessages("movimentações de localizações");

/**
 * Transform backend LocationMovementResponseDto to frontend LocationMovement type
 */
const transformLocationMovement = createEntityTransform<LocationMovement & Record<string, unknown>>(
  {
    dateStringFields: ["date"],
    dateTimeFields: ["createdAt", "updatedAt"],
  }
) as unknown as (obj: LocationMovement) => LocationMovement;

/**
 * Get all location movements for the current user's company via API
 */
export const getLocationMovementsByCompanyId = createListHandler<LocationMovement>({
  endpoint: "/location-movements",
  errorMessages: locationMovementsErrors.list,
  transform: transformLocationMovement,
});

/**
 * Get a single location movement by ID via API
 */
export const getLocationMovementById = createGetByIdHandler<LocationMovement>({
  endpoint: "/location-movements",
  errorMessages: locationMovementsErrors.view,
  transform: transformLocationMovement,
});

/**
 * Get location movements by location ID via API
 */
export async function getLocationMovementsByLocationId(
  locationId: string
): Promise<LocationMovement[]> {
  try {
    const movements = await apiClient.get<LocationMovement[]>(
      `/location-movements/location/${locationId}`
    );
    return movements.map(transformLocationMovement);
  } catch (error) {
    try {
      handleApiError(error, locationMovementsErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get location movements by property ID via API
 */
export async function getLocationMovementsByPropertyId(
  propertyId: string
): Promise<LocationMovement[]> {
  try {
    const movements = await apiClient.get<LocationMovement[]>(
      `/location-movements/property/${propertyId}`
    );
    return movements.map(transformLocationMovement);
  } catch (error) {
    try {
      handleApiError(error, locationMovementsErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get location movements by employee ID via API
 */
export async function getLocationMovementsByEmployeeId(
  employeeId: string
): Promise<LocationMovement[]> {
  try {
    const movements = await apiClient.get<LocationMovement[]>(
      `/location-movements/employee/${employeeId}`
    );
    return movements.map(transformLocationMovement);
  } catch (error) {
    try {
      handleApiError(error, locationMovementsErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get location movements by service provider ID via API
 */
export async function getLocationMovementsByServiceProviderId(
  serviceProviderId: string
): Promise<LocationMovement[]> {
  try {
    const movements = await apiClient.get<LocationMovement[]>(
      `/location-movements/service-provider/${serviceProviderId}`
    );
    return movements.map(transformLocationMovement);
  } catch (error) {
    try {
      handleApiError(error, locationMovementsErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get location movements by type via API
 */
export async function getLocationMovementsByType(
  type: LocationMovementType
): Promise<LocationMovement[]> {
  try {
    const movements = await apiClient.get<LocationMovement[]>(`/location-movements/type/${type}`);
    return movements.map(transformLocationMovement);
  } catch (error) {
    try {
      handleApiError(error, locationMovementsErrors.list);
    } catch {
      return [];
    }
  }
}

const locationMovementsCrud = createCrudHandlers<
  LocationMovement,
  LocationMovement,
  LocationMovementFormData
>({
  endpoint: "/location-movements",
  errorMessages: {
    create: locationMovementsErrors.create,
    update: locationMovementsErrors.update,
    delete: locationMovementsErrors.delete,
  },
  transform: transformLocationMovement,
  buildCreateDto: (data) => data as unknown as Record<string, unknown>,
  buildUpdateDto: (data) => data,
});

/**
 * Create a new location movement via API
 */
export const addLocationMovement = locationMovementsCrud.add;

/**
 * Update a location movement via API
 */
export const updateLocationMovement = locationMovementsCrud.update;

/**
 * Delete a location movement via API
 */
export const deleteLocationMovement = locationMovementsCrud.remove;
