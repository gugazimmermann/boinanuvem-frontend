import type {
  LocationMovement,
  AnimalMovement,
  Location,
  Animal,
  Employee,
  ServiceProvider,
} from "~/types";

export type UnifiedMovement =
  | (LocationMovement & { movementType: "location" } & Record<string, unknown>)
  | (AnimalMovement & { movementType: "animal" } & Record<string, unknown>);

/**
 * Checks if a movement type matches the search string
 */
export function matchesMovementType(
  movement: UnifiedMovement,
  searchLower: string,
  movementTypes: Record<string, string>
): boolean {
  if (movement.movementType === "location") {
    const typeText =
      movementTypes[(movement as LocationMovement).type as keyof typeof movementTypes] ||
      (movement as LocationMovement).type;
    return typeText.toLowerCase().includes(searchLower);
  }
  const animalMovementText = movementTypes.animal_movement.toLowerCase();
  return animalMovementText.includes(searchLower) || "animal".toLowerCase().includes(searchLower);
}

/**
 * Checks if location names in a movement match the search string
 */
export function matchesLocationNames(
  movement: UnifiedMovement,
  searchLower: string,
  locations: Location[]
): boolean {
  let locationIds: string[];
  if (movement.movementType === "location") {
    locationIds = (movement as LocationMovement).locationIds;
  } else {
    const animalMovement = movement as AnimalMovement;
    locationIds = animalMovement.locationId ? [animalMovement.locationId] : [];
  }
  const locationNames = locationIds
    .filter((id): id is string => id !== null && id !== undefined)
    .map((id) => {
      const location = locations.find((l) => l.id === id);
      return location ? `${location.name} ${location.code}`.toLowerCase() : id.toLowerCase();
    })
    .join(" ");
  return locationNames.includes(searchLower);
}

/**
 * Checks if animal names in a movement match the search string
 */
export function matchesAnimalNames(
  movement: UnifiedMovement | AnimalMovement,
  searchLower: string,
  animalsMap: Map<string, Animal>
): boolean {
  if ("movementType" in movement && movement.movementType !== "animal") return false;

  const animalMovement = movement as AnimalMovement;
  const animalNames = animalMovement.animalIds
    .map((id) => {
      const animal = animalsMap.get(id);
      return animal ? `${animal.code} ${animal.registrationNumber}`.toLowerCase() : "";
    })
    .filter((name) => name !== "")
    .join(" ");
  return animalNames.includes(searchLower);
}

/**
 * Checks if employee names in a movement match the search string
 */
export function matchesEmployeeNames(
  movement: UnifiedMovement,
  searchLower: string,
  employees: Employee[]
): boolean {
  const employeeNames = movement.employeeIds
    .map((id) => {
      const employee = employees.find((e) => e.id === id);
      return employee ? employee.name.toLowerCase() : "";
    })
    .filter((name) => name !== "")
    .join(" ");
  return employeeNames.includes(searchLower);
}

/**
 * Checks if service provider names in a movement match the search string
 */
export function matchesProviderNames(
  movement: UnifiedMovement,
  searchLower: string,
  serviceProviders: ServiceProvider[]
): boolean {
  const providerNames = movement.serviceProviderIds
    .map((id) => {
      const provider = serviceProviders.find((sp) => sp.id === id);
      return provider ? provider.name.toLowerCase() : "";
    })
    .filter((name) => name !== "")
    .join(" ");
  return providerNames.includes(searchLower);
}
