import type { Breeding, BreedingFormData, Animal, Property } from "~/types";
import { mockBreedings } from "~/mocks/breedings";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";
import { getAnimalsByPropertyId, getAnimalById } from "./animals.service";
import { getBirthByAnimalId, getBirthsByCompanyId } from "./births.service";

const ID_PREFIX = "pp0e8400-e29b-41d4-a716";
const DEFAULT_ID = "pp0e8400-e29b-41d4-a716-446655440009";

export function getBreedingById(breedingId: string | undefined): Breeding | undefined {
  return findById(mockBreedings, breedingId);
}

export function getBreedingsByAnimalId(animalId: string): Breeding[] {
  return findByField(mockBreedings, "animalId", animalId);
}

export function getBreedingsByCompanyId(companyId: string): Breeding[] {
  return findByField(mockBreedings, "companyId", companyId);
}

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

  const breedings = getBreedingsByAnimalId(animalId);
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

export function isAnimalPregnant(animalId: string): boolean {
  const breedings = getBreedingsByAnimalId(animalId);
  return breedings.some((b) => b.confirmed === true);
}

export function getMostRecentConfirmedBreeding(animalId: string): Breeding | undefined {
  const breedings = getBreedingsByAnimalId(animalId);
  const confirmedBreedings = breedings.filter((b) => b.confirmed === true);

  if (confirmedBreedings.length === 0) {
    return undefined;
  }

  const sortedBreedings = confirmedBreedings.toSorted(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return sortedBreedings[0];
}

export function getPregnantAnimals(companyId: string): string[] {
  const breedings = getBreedingsByCompanyId(companyId);
  const uniqueAnimalIds = new Set<string>();

  for (const breeding of breedings) {
    if (breeding.confirmed === true) {
      uniqueAnimalIds.add(breeding.animalId);
    }
  }

  return Array.from(uniqueAnimalIds);
}

export function getUnconfirmedBreedings(companyId: string): Breeding[] {
  const breedings = getBreedingsByCompanyId(companyId);
  return breedings.filter((b) => b.confirmed !== true);
}

export function confirmBreeding(breedingId: string): boolean {
  return updateBreeding(breedingId, { confirmed: true });
}

export function addBreeding(data: BreedingFormData): Breeding {
  return createEntity(mockBreedings, data, ID_PREFIX, DEFAULT_ID);
}

export function updateBreeding(breedingId: string, data: Partial<BreedingFormData>): boolean {
  return updateEntity(mockBreedings, breedingId, data);
}

export function deleteBreeding(breedingId: string): boolean {
  return deleteEntity(mockBreedings, breedingId);
}

export async function getBreedingsByPropertyId(propertyId: string): Promise<Breeding[]> {
  const animals = await getAnimalsByPropertyId(propertyId);
  const animalIds = new Set(animals.map((a) => a.id));
  return mockBreedings.filter((breeding) => animalIds.has(breeding.animalId));
}

export async function getExposedCows(propertyId: string): Promise<string[]> {
  const breedings = await getBreedingsByPropertyId(propertyId);
  const uniqueAnimalIds = new Set(breedings.map((b) => b.animalId));
  return Array.from(uniqueAnimalIds);
}

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

export async function enrichBreedingWithAnimalData(breeding: Breeding): Promise<
  Breeding & {
    animal?: Animal;
    property?: Property;
    bull?: Animal;
    breed?: string;
  }
> {
  const animal = await getAnimalById(breeding.animalId);
  // Note: property is set to undefined here since getPropertyById is async
  // The property should be loaded separately if needed
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

export function unconfirmMostRecentBreedingForAnimal(animalId: string): boolean {
  const breedings = getBreedingsByAnimalId(animalId);
  const confirmedBreedings = breedings.filter((b) => b.confirmed === true);

  if (confirmedBreedings.length === 0) {
    return false;
  }

  const sortedBreedings = confirmedBreedings.toSorted(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const mostRecentBreeding = sortedBreedings[0];

  return updateBreeding(mostRecentBreeding.id, { confirmed: false });
}
