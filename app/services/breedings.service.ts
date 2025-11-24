import type { Breeding, BreedingFormData, Animal } from "~/types";
import { mockBreedings } from "~/mocks/breedings";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";
import { mockBirths } from "~/mocks/births";
import { getAnimalsByPropertyId, getAnimalById } from "./animals.service";
import { getBirthByAnimalId } from "./births.service";
import { getPropertyById } from "./properties.service";

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

export function getNextAttemptNumber(animalId: string): number {
  const birthsAsMother = mockBirths.filter((birth) => birth.motherId === animalId);

  let mostRecentBirthDate: string | null = null;
  if (birthsAsMother.length > 0) {
    const sortedBirths = [...birthsAsMother].sort(
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

  const aiBreedingsAfterBirth = aiBreedings.filter((b) => {
    const breedingDate = new Date(b.date).getTime();
    const birthDate = new Date(mostRecentBirthDate!).getTime();
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

  return confirmedBreedings.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];
}

export function getPregnantAnimals(companyId: string): string[] {
  const breedings = getBreedingsByCompanyId(companyId);
  const uniqueAnimalIds = new Set<string>();

  breedings.forEach((breeding) => {
    if (breeding.confirmed === true) {
      uniqueAnimalIds.add(breeding.animalId);
    }
  });

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

export function getBreedingsByPropertyId(propertyId: string): Breeding[] {
  const animals = getAnimalsByPropertyId(propertyId);
  const animalIds = new Set(animals.map((a) => a.id));
  return mockBreedings.filter((breeding) => animalIds.has(breeding.animalId));
}

export function getExposedCows(propertyId: string): string[] {
  const breedings = getBreedingsByPropertyId(propertyId);
  const uniqueAnimalIds = new Set(breedings.map((b) => b.animalId));
  return Array.from(uniqueAnimalIds);
}

export function getPregnantCowsByPropertyId(propertyId: string): string[] {
  const breedings = getBreedingsByPropertyId(propertyId);
  const uniqueAnimalIds = new Set<string>();

  breedings.forEach((breeding) => {
    if (breeding.confirmed === true) {
      uniqueAnimalIds.add(breeding.animalId);
    }
  });

  return Array.from(uniqueAnimalIds);
}

export function enrichBreedingWithAnimalData(breeding: Breeding): Breeding & {
  animal?: Animal;
  property?: ReturnType<typeof getPropertyById>;
  bull?: Animal;
  breed?: string;
} {
  const animal = getAnimalById(breeding.animalId);
  const property = animal ? getPropertyById(animal.propertyId) : null;
  const bull = breeding.bullId ? getAnimalById(breeding.bullId) : null;
  const birth = animal ? getBirthByAnimalId(animal.id) : null;

  return {
    ...breeding,
    animal: animal || undefined,
    property: property || undefined,
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

  const mostRecentBreeding = confirmedBreedings.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];

  return updateBreeding(mostRecentBreeding.id, { confirmed: false });
}
