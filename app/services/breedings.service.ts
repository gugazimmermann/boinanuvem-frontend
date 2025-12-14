import type { Breeding, BreedingFormData, Animal, Property } from "~/types";
import { apiClient } from "./api-client";
import { handleApiError, createResourceErrorMessages } from "./error-handlers";
import { getAnimalById } from "./animals.service";
import { getBirthByAnimalId } from "./births.service";
import { buildUpdateDto } from "~/utils/update-dto-builder";
import { createListHandler, createGetByIdHandler, createCrudHandlers } from "./service-helpers";
import { createEntityTransform } from "./transform-helpers";

const breedingsErrors = createResourceErrorMessages("cruzamentos");

/**
 * Transform backend BreedingResponseDto to frontend Breeding type
 */
const transformBreeding = createEntityTransform<Breeding>({
  dateStringFields: ["date"],
  dateTimeFields: ["createdAt"],
  customTransform: (breeding) => ({
    ...breeding,
    date: breeding.date || new Date().toISOString().split("T")[0],
    confirmed: breeding.confirmed ?? false,
    employeeIds: breeding.employeeIds || [],
    serviceProviderIds: breeding.serviceProviderIds || [],
  }),
});

/**
 * Get all breedings for the current user's company via API
 */
export const getBreedingsByCompanyId = createListHandler<Breeding>({
  endpoint: "/breedings",
  errorMessages: breedingsErrors.list,
  transform: transformBreeding,
});

/**
 * Get a single breeding by ID via API
 */
export const getBreedingById = createGetByIdHandler<Breeding>({
  endpoint: "/breedings",
  errorMessages: breedingsErrors.view,
  transform: transformBreeding,
  custom403Message: "Você não tem permissão para visualizar este cruzamento",
});

/**
 * Get breedings by animal ID via API
 */
export async function getBreedingsByAnimalId(animalId: string): Promise<Breeding[]> {
  try {
    const breedings = await apiClient.get<Breeding[]>(`/breedings/animal/${animalId}`);
    return breedings.map(transformBreeding);
  } catch (error) {
    try {
      handleApiError(error, breedingsErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get next attempt number for an animal
 */
export async function getNextAttemptNumber(animalId: string): Promise<number> {
  try {
    const response = await apiClient.get<{ nextAttemptNumber: number }>(
      `/breedings/animal/${animalId}/next-attempt`
    );
    return response.nextAttemptNumber;
  } catch (error) {
    try {
      handleApiError(error, breedingsErrors.view);
    } catch {
      return 1; // Default fallback
    }
  }
}

/**
 * Check if an animal is pregnant
 */
export async function isAnimalPregnant(animalId: string): Promise<boolean> {
  try {
    const response = await apiClient.get<{ isPregnant: boolean }>(
      `/breedings/animal/${animalId}/pregnant`
    );
    return response.isPregnant;
  } catch (error) {
    try {
      handleApiError(error, breedingsErrors.view);
    } catch {
      return false;
    }
  }
}

/**
 * Get most recent confirmed breeding for an animal
 */
export async function getMostRecentConfirmedBreeding(
  animalId: string
): Promise<Breeding | undefined> {
  try {
    const breeding = await apiClient.get<Breeding | null>(
      `/breedings/animal/${animalId}/most-recent-confirmed`
    );
    return breeding ? transformBreeding(breeding) : undefined;
  } catch (error) {
    try {
      handleApiError(error, breedingsErrors.view);
    } catch {
      return undefined;
    }
  }
}

/**
 * Get pregnant animals for a company
 */
export async function getPregnantAnimals(companyId: string): Promise<string[]> {
  const breedings = await getBreedingsByCompanyId(companyId);
  const uniqueAnimalIds = new Set<string>();

  for (const breeding of breedings) {
    if (breeding.confirmed === true) {
      uniqueAnimalIds.add(breeding.animalId);
    }
  }

  return Array.from(uniqueAnimalIds);
}

/**
 * Get unconfirmed breedings for a company
 */
export async function getUnconfirmedBreedings(_companyId: string): Promise<Breeding[]> {
  try {
    const breedings = await apiClient.get<Breeding[]>("/breedings/unconfirmed");
    return breedings.map(transformBreeding);
  } catch (error) {
    try {
      handleApiError(error, breedingsErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Confirm a breeding via API
 */
export async function confirmBreeding(breedingId: string): Promise<boolean> {
  try {
    await apiClient.put(`/breedings/${breedingId}/confirm`, {});
    return true;
  } catch (error) {
    handleApiError(error, breedingsErrors.update);
  }
}

const breedingsCrud = createCrudHandlers<Breeding, Breeding, BreedingFormData>({
  endpoint: "/breedings",
  errorMessages: {
    create: breedingsErrors.create,
    update: breedingsErrors.update,
    delete: breedingsErrors.delete,
  },
  transform: transformBreeding,
  buildCreateDto: (data) => ({
    animalId: data.animalId,
    date: data.date,
    method: data.method,
    bullId: data.bullId,
    attemptNumber: data.attemptNumber,
    semenCode: data.semenCode,
    employeeIds: data.employeeIds,
    serviceProviderIds: data.serviceProviderIds,
    observation: data.observation,
    confirmed: data.confirmed ?? false,
  }),
  buildUpdateDto: (data) =>
    buildUpdateDto(data, [
      "animalId",
      "date",
      "method",
      "bullId",
      "attemptNumber",
      "semenCode",
      "employeeIds",
      "serviceProviderIds",
      "observation",
      "confirmed",
    ]),
});

/**
 * Create a new breeding via API
 */
export const addBreeding = breedingsCrud.add;

/**
 * Update a breeding via API
 */
export const updateBreeding = breedingsCrud.update;

/**
 * Delete a breeding via API
 */
export const deleteBreeding = breedingsCrud.remove;

/**
 * Get breedings by property ID
 */
export async function getBreedingsByPropertyId(propertyId: string): Promise<Breeding[]> {
  try {
    const breedings = await apiClient.get<Breeding[]>(`/breedings/property/${propertyId}`);
    return breedings.map(transformBreeding);
  } catch (error) {
    try {
      handleApiError(error, breedingsErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get exposed cows for a property
 */
export async function getExposedCows(propertyId: string): Promise<string[]> {
  const breedings = await getBreedingsByPropertyId(propertyId);
  const uniqueAnimalIds = new Set(breedings.map((b) => b.animalId));
  return Array.from(uniqueAnimalIds);
}

/**
 * Get pregnant cows by property ID
 */
export async function getPregnantCowsByPropertyId(propertyId: string): Promise<string[]> {
  try {
    const response = await apiClient.get<{ animalIds: string[] }>(
      `/breedings/property/${propertyId}/pregnant`
    );
    return response.animalIds;
  } catch (error) {
    try {
      handleApiError(error, breedingsErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Enrich breeding with animal data
 */
export async function enrichBreedingWithAnimalData(breeding: Breeding): Promise<
  Breeding & {
    animal?: Animal;
    property?: Property;
    bull?: Animal;
    breed?: string;
  }
> {
  const animal = await getAnimalById(breeding.animalId);
  const bull = breeding.bullId ? await getAnimalById(breeding.bullId) : null;
  const birth = animal ? await getBirthByAnimalId(animal.id) : null;

  return {
    ...breeding,
    animal: animal || undefined,
    property: undefined, // Property needs to be loaded asynchronously
    bull: bull || undefined,
    breed: birth?.breed,
  };
}

/**
 * Unconfirm most recent breeding for an animal
 */
export async function unconfirmMostRecentBreedingForAnimal(animalId: string): Promise<boolean> {
  try {
    await apiClient.put(`/breedings/animal/${animalId}/unconfirm-most-recent`, {});
    return true;
  } catch (error) {
    try {
      handleApiError(error, breedingsErrors.update);
    } catch {
      return false;
    }
  }
}
