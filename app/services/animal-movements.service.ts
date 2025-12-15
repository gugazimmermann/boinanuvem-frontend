import type { AnimalMovement } from "~/types";
import { apiClient } from "./api-client";
import { createCrudHandlers, createGetByIdHandler, createListHandler } from "./service-helpers";
import { createEntityTransform } from "./transform-helpers";
import { createResourceErrorMessages, handleApiError } from "./error-handlers";

const animalMovementsErrors = createResourceErrorMessages("movimentações de animais");

export type AnimalMovementFormData = Omit<AnimalMovement, "id" | "createdAt" | "updatedAt">;

/**
 * Transform backend AnimalMovementResponseDto to frontend AnimalMovement type
 */
const transformAnimalMovement = createEntityTransform<AnimalMovement & Record<string, unknown>>({
  dateStringFields: ["date"],
  dateTimeFields: ["createdAt", "updatedAt"],
}) as unknown as (obj: AnimalMovement) => AnimalMovement;

/**
 * Get all animal movements for the current user's company via API
 */
export const getAnimalMovementsByCompanyId = createListHandler<AnimalMovement>({
  endpoint: "/animal-movements",
  errorMessages: animalMovementsErrors.list,
  transform: transformAnimalMovement,
});

/**
 * Get animal movements by animal ID via API
 */
export async function getAnimalMovementsByAnimalId(animalId: string): Promise<AnimalMovement[]> {
  try {
    const movements = await apiClient.get<AnimalMovement[]>(`/animal-movements/animal/${animalId}`);
    return movements.map(transformAnimalMovement);
  } catch (error) {
    try {
      handleApiError(error, animalMovementsErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get animal movements by location ID via API
 */
export async function getAnimalMovementsByLocationId(
  locationId: string
): Promise<AnimalMovement[]> {
  try {
    const movements = await apiClient.get<AnimalMovement[]>(
      `/animal-movements/location/${locationId}`
    );
    return movements.map(transformAnimalMovement);
  } catch (error) {
    try {
      handleApiError(error, animalMovementsErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get animal movements by property ID via API
 */
export async function getAnimalMovementsByPropertyId(
  propertyId: string
): Promise<AnimalMovement[]> {
  try {
    const movements = await apiClient.get<AnimalMovement[]>(
      `/animal-movements/property/${propertyId}`
    );
    return movements.map(transformAnimalMovement);
  } catch (error) {
    try {
      handleApiError(error, animalMovementsErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get animal movements by employee ID via API
 */
export async function getAnimalMovementsByEmployeeId(
  employeeId: string
): Promise<AnimalMovement[]> {
  try {
    const movements = await apiClient.get<AnimalMovement[]>(
      `/animal-movements/employee/${employeeId}`
    );
    return movements.map(transformAnimalMovement);
  } catch (error) {
    try {
      handleApiError(error, animalMovementsErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get animal movements by service provider ID via API
 */
export async function getAnimalMovementsByServiceProviderId(
  serviceProviderId: string
): Promise<AnimalMovement[]> {
  try {
    const movements = await apiClient.get<AnimalMovement[]>(
      `/animal-movements/service-provider/${serviceProviderId}`
    );
    return movements.map(transformAnimalMovement);
  } catch (error) {
    try {
      handleApiError(error, animalMovementsErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get an animal movement by ID via API
 */
export const getAnimalMovementById = createGetByIdHandler<AnimalMovement>({
  endpoint: "/animal-movements",
  errorMessages: animalMovementsErrors.view,
  transform: transformAnimalMovement,
});

/**
 * Get animal IDs whose last movement is to the specified location via API
 */
export async function getAnimalsByLastMovementLocation(locationId: string): Promise<string[]> {
  try {
    const animalIds = await apiClient.get<string[]>(
      `/animal-movements/last-location/${locationId}/animals`
    );
    return animalIds;
  } catch (error) {
    try {
      handleApiError(error, animalMovementsErrors.list);
    } catch {
      return [];
    }
  }
}

const animalMovementsCrud = createCrudHandlers<
  AnimalMovement,
  AnimalMovement,
  AnimalMovementFormData
>({
  endpoint: "/animal-movements",
  errorMessages: {
    create: animalMovementsErrors.create,
    update: animalMovementsErrors.update,
    delete: animalMovementsErrors.delete,
  },
  transform: transformAnimalMovement,
});

/**
 * Create a new animal movement via API
 */
export const addAnimalMovement = animalMovementsCrud.add;

/**
 * Delete an animal movement via API
 */
export const deleteAnimalMovement = animalMovementsCrud.remove;
