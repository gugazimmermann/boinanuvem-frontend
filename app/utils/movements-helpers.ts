import type { LocationMovement, AnimalMovement } from "~/types";
import type { UnifiedMovement } from "~/components/dashboard/movements/movements-section";

export function getLocationIds(movement: UnifiedMovement): string[] {
  if (movement.movementType === "location") {
    return (movement as LocationMovement).locationIds;
  }
  const animalMovement = movement as AnimalMovement;
  return animalMovement.locationId ? [animalMovement.locationId] : [];
}

export function getLocationNamesForSearch(
  locationIds: string[],
  getLocationById: (id: string) => { name: string; code: string } | null
): string {
  return locationIds
    .map((id) => {
      const location = getLocationById(id);
      return location ? `${location.name} ${location.code}`.toLowerCase() : id.toLowerCase();
    })
    .join(" ");
}

export function getLocationNamesForSort(
  locationIds: string[],
  getLocationById: (id: string) => { name: string; code: string } | null
): string {
  return locationIds
    .map((id) => {
      const location = getLocationById(id);
      return location ? `${location.name} (${location.code})` : id;
    })
    .sort((a, b) => a.localeCompare(b))
    .join(", ");
}

export function getEntityNames(
  ids: string[],
  getEntityById: (id: string) => { name: string } | null
): string {
  return ids
    .map((id) => {
      const entity = getEntityById(id);
      return entity ? entity.name.toLowerCase() : "";
    })
    .filter((name) => name !== "")
    .join(" ");
}

export function getAnimalNames(
  animalIds: string[],
  getAnimalById: (id: string) => { code: string; registrationNumber: string } | null
): string {
  return animalIds
    .map((id) => {
      const animal = getAnimalById(id);
      return animal ? `${animal.code} ${animal.registrationNumber}`.toLowerCase() : "";
    })
    .filter((name) => name !== "")
    .join(" ");
}
