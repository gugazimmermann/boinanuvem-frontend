import type { Breeding, BreedingFormData, Animal, Property } from "~/types";
import { apiClient } from "./api-client";
import { handleApiError, createResourceErrorMessages } from "./error-handlers";
import { getAnimalsByPropertyId, getAnimalById } from "./animals.service";
import { getBirthByAnimalId, getBirthsByCompanyId } from "./births.service";
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
export async function getNextAttemptNumber(animalId: string, companyId: string): Promise<number> {
  // Get all births for the company to find births where this animal is the mother
  const allBirths = await getBirthsByCompanyId(companyId);
  const birthsAsMother = allBirths?.filter((birth) => birth.motherId === animalId) || [];

  let mostRecentBirthDate: string | null = null;
  if (birthsAsMother.length > 0) {
    const sortedBirths = birthsAsMother.toSorted(
      (a, b) => new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime()
    );
    mostRecentBirthDate = sortedBirths[0].birthDate;
  }

  const breedings = await getBreedingsByAnimalId(animalId);
  const aiBreedings = breedings.filter((b) => b.method === "artificial_insemination");

  if (!mostRecentBirthDate) {
    if (aiBreedings.length === 0) {
      return 1;
    }
    const maxAttempt = Math.max(...aiBreedings.map((b) => b.attemptNumber || 0));
    return maxAttempt + 1;
  }

  const mostRecentBirthDateValue = mostRecentBirthDate;
  const aiBreedingsAfterBirth = aiBreedings.filter((b) => {
    const breedingDate = new Date(b.date).getTime();
    const birthDate = new Date(mostRecentBirthDateValue).getTime();
    return breedingDate > birthDate;
  });

  if (aiBreedingsAfterBirth.length === 0) {
    return 1;
  }

  const maxAttempt = Math.max(...aiBreedingsAfterBirth.map((b) => b.attemptNumber || 0));
  return maxAttempt + 1;
}

/**
 * Check if an animal is pregnant
 */
export async function isAnimalPregnant(animalId: string): Promise<boolean> {
  const breedings = await getBreedingsByAnimalId(animalId);
  return breedings.some((b) => b.confirmed === true);
}

/**
 * Get most recent confirmed breeding for an animal
 */
export async function getMostRecentConfirmedBreeding(
  animalId: string
): Promise<Breeding | undefined> {
  const breedings = await getBreedingsByAnimalId(animalId);
  const confirmedBreedings = breedings.filter((b) => b.confirmed === true);

  if (confirmedBreedings.length === 0) {
    return undefined;
  }

  const sortedBreedings = confirmedBreedings.toSorted(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return sortedBreedings[0];
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
export async function getUnconfirmedBreedings(companyId: string): Promise<Breeding[]> {
  const breedings = await getBreedingsByCompanyId(companyId);
  return breedings.filter((b) => b.confirmed !== true);
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
  const animals = await getAnimalsByPropertyId(propertyId);
  const animalIds = new Set(animals.map((a) => a.id));
  const allBreedings = await getBreedingsByCompanyId(animals[0]?.companyId || "");
  return allBreedings.filter((breeding) => animalIds.has(breeding.animalId));
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
  const breedings = await getBreedingsByPropertyId(propertyId);
  const uniqueAnimalIds = new Set<string>();

  for (const breeding of breedings) {
    if (breeding.confirmed === true) {
      uniqueAnimalIds.add(breeding.animalId);
    }
  }

  return Array.from(uniqueAnimalIds);
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
  const breedings = await getBreedingsByAnimalId(animalId);
  const confirmedBreedings = breedings.filter((b) => b.confirmed === true);

  if (confirmedBreedings.length === 0) {
    return false;
  }

  const sortedBreedings = confirmedBreedings.toSorted(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const mostRecentBreeding = sortedBreedings[0];

  try {
    await updateBreeding(mostRecentBreeding.id, { confirmed: false });
    return true;
  } catch {
    return false;
  }
}
