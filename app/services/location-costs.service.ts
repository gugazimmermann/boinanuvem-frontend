import type {
  LocationConsumptionCost,
  AnimalCostBreakdown,
  AnimalTotalCost,
  AnimalLocationCost,
} from "~/types/location-costs";
import type { Animal, InventoryMovement } from "~/types";
import {
  getConsumptionMovementsByLocationId,
  getMovementsByCompanyId,
} from "./inventory-movements.service";
import { getInventoryItemById } from "./inventory.service";
import {
  getAnimalMovementsByAnimalId,
  getAnimalMovementsByLocationId,
} from "./animal-movements.service";
import { getAnimalById } from "./animals.service";
import { getLocationById } from "./locations.service";

async function getAnimalIdsInLocation(locationId: string): Promise<Set<string>> {
  const animalIdsInLocation = new Set<string>();
  try {
    const movements = await getAnimalMovementsByLocationId(locationId);
    for (const movement of movements) {
      if (movement.locationId === locationId) {
        for (const id of movement.animalIds) {
          animalIdsInLocation.add(id);
        }
      }
    }
  } catch {
    // Return empty set on error - movements service already handles errors and returns []
    return new Set<string>();
  }
  return animalIdsInLocation;
}

async function isAnimalInLocationOnDate(
  animalId: string,
  locationId: string,
  targetDate: Date
): Promise<boolean> {
  try {
    const animalMovements = await getAnimalMovementsByAnimalId(animalId);
    const movementsBeforeDate = animalMovements
      .filter((m) => new Date(m.date) <= targetDate)
      .toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (movementsBeforeDate.length === 0) return false;
    const mostRecentMovement = movementsBeforeDate[0];
    return mostRecentMovement.locationId === locationId;
  } catch {
    // Return false on error - movements service already handles errors and returns []
    return false;
  }
}

export async function getAnimalsInLocationOnDate(
  locationId: string,
  date: string
): Promise<Animal[]> {
  const _animals: Animal[] = [];
  const targetDate = new Date(date);
  const animalIdsInLocation = await getAnimalIdsInLocation(locationId);

  // Check each animal and filter by location on date
  const animalChecks = await Promise.all(
    Array.from(animalIdsInLocation).map(async (animalId) => {
      const isInLocation = await isAnimalInLocationOnDate(animalId, locationId, targetDate);
      return { animalId, isInLocation };
    })
  );

  const validAnimalIds = animalChecks
    .filter((check) => check.isInLocation)
    .map((check) => check.animalId);

  const animalPromises = validAnimalIds.map(async (animalId) => {
    const animal = await getAnimalById(animalId);
    return animal;
  });

  const animalsData = await Promise.all(animalPromises);
  return animalsData.filter((animal): animal is Animal => animal !== null && animal !== undefined);
}

export async function getLocationConsumptionCosts(
  locationId: string,
  startDate?: string,
  endDate?: string
): Promise<LocationConsumptionCost[]> {
  const movements = await getConsumptionMovementsByLocationId(locationId);

  let filteredMovements = movements;
  if (startDate || endDate) {
    filteredMovements = movements.filter((movement) => {
      const movementDate = new Date(movement.date);
      if (startDate && movementDate < new Date(startDate)) {
        return false;
      }
      if (endDate && movementDate > new Date(endDate)) {
        return false;
      }
      return true;
    });
  }

  const costPromises = filteredMovements.map(async (movement) => {
    const item = await getInventoryItemById(movement.itemId);
    if (!item) return null;

    const unitPrice = movement.unitPrice ?? item.unitPrice ?? 0;
    const totalCost = movement.quantity * unitPrice;

    const animalsPresent = await getAnimalsInLocationOnDate(locationId, movement.date);

    return {
      movement,
      item,
      totalCost,
      animalsPresent,
    };
  });

  const costs = await Promise.all(costPromises);
  return costs.filter((cost): cost is LocationConsumptionCost => cost !== null);
}

export async function getTotalLocationCost(
  locationId: string,
  startDate?: string,
  endDate?: string
): Promise<number> {
  const costs = await getLocationConsumptionCosts(locationId, startDate, endDate);
  return costs.reduce((total, cost) => total + cost.totalCost, 0);
}

export async function getAnimalCostBreakdown(
  locationId: string,
  startDate?: string,
  endDate?: string
): Promise<AnimalCostBreakdown[]> {
  const consumptionCosts = await getLocationConsumptionCosts(locationId, startDate, endDate);

  const animalCosts = new Map<string, { animal: Animal; totalCost: number; periods: number }>();

  for (const cost of consumptionCosts) {
    const animalsPresent = cost.animalsPresent;
    const costPerAnimal = animalsPresent.length > 0 ? cost.totalCost / animalsPresent.length : 0;

    for (const animal of animalsPresent) {
      const existing = animalCosts.get(animal.id);
      if (existing) {
        existing.totalCost += costPerAnimal;
        existing.periods += 1;
      } else {
        animalCosts.set(animal.id, {
          animal,
          totalCost: costPerAnimal,
          periods: 1,
        });
      }
    }
  }

  return Array.from(animalCosts.values()).map(({ animal, totalCost, periods }) => ({
    animal,
    totalCost,
    consumptionPeriods: periods,
    averageCostPerPeriod: periods > 0 ? totalCost / periods : 0,
  }));
}

export async function getAnimalCostByLocation(
  animalId: string,
  locationId: string,
  startDate?: string,
  endDate?: string
): Promise<number> {
  const consumptionCosts = await getLocationConsumptionCosts(locationId, startDate, endDate);
  let totalCost = 0;

  for (const cost of consumptionCosts) {
    const wasPresent = cost.animalsPresent.some((animal) => animal.id === animalId);
    if (wasPresent) {
      const costPerAnimal =
        cost.animalsPresent.length > 0 ? cost.totalCost / cost.animalsPresent.length : 0;
      totalCost += costPerAnimal;
    }
  }

  return totalCost;
}

function isMovementInDateRange(
  movement: InventoryMovement,
  startDate?: string,
  endDate?: string
): boolean {
  if (!startDate && !endDate) return true;
  const movementDate = new Date(movement.date);
  if (startDate && movementDate < new Date(startDate)) return false;
  if (endDate && movementDate > new Date(endDate)) return false;
  return true;
}

async function getRelevantCostsForAnimal(
  locationId: string,
  animalId: string,
  startDate?: string,
  endDate?: string
): Promise<LocationConsumptionCost[]> {
  const locationConsumptionCosts = await getLocationConsumptionCosts(
    locationId,
    startDate,
    endDate
  );
  return locationConsumptionCosts.filter((cost) =>
    cost.animalsPresent.some((animal) => animal.id === animalId)
  );
}

export async function getAnimalCostBreakdownByLocation(
  animalId: string,
  startDate?: string,
  endDate?: string
): Promise<AnimalLocationCost[]> {
  // Get animal to retrieve companyId, then get all movements for that company
  const animal = await getAnimalById(animalId);
  if (!animal) {
    return [];
  }

  // Get all inventory movements for the company, then filter for consumption type with locationId
  const allMovements = await getMovementsByCompanyId();
  const consumptionMovements = allMovements.filter(
    (m) => m.type === "consumption" && m.locationId && m.locationId.trim() !== ""
  );

  const locationCostsPromises = consumptionMovements
    .filter((movement) => isMovementInDateRange(movement, startDate, endDate))
    .map(async (movement) => {
      const locationId = movement.locationId!;
      const relevantCosts = await getRelevantCostsForAnimal(
        locationId,
        animalId,
        startDate,
        endDate
      );
      return { locationId, relevantCosts };
    });

  const locationCostsResults = await Promise.all(locationCostsPromises);
  const locationCosts = new Map<string, LocationConsumptionCost[]>();

  for (const { locationId, relevantCosts } of locationCostsResults) {
    if (relevantCosts.length > 0) {
      const existing = locationCosts.get(locationId);
      if (existing) {
        existing.push(...relevantCosts);
      } else {
        locationCosts.set(locationId, relevantCosts);
      }
    }
  }

  const locationPromises = Array.from(locationCosts.entries()).map(
    async ([locationId, consumptionDetails]) => {
      const location = await getLocationById(locationId);
      const totalCost = consumptionDetails.reduce((sum, cost) => {
        const wasPresent = cost.animalsPresent.some((animal) => animal.id === animalId);
        if (wasPresent) {
          const costPerAnimal =
            cost.animalsPresent.length > 0 ? cost.totalCost / cost.animalsPresent.length : 0;
          return sum + costPerAnimal;
        }
        return sum;
      }, 0);

      return {
        locationId,
        locationName: location?.name || "Unknown Location",
        totalCost,
        consumptionPeriods: consumptionDetails.length,
        consumptionDetails,
      };
    }
  );

  return Promise.all(locationPromises);
}

export async function getAnimalTotalCost(
  animalId: string,
  startDate?: string,
  endDate?: string
): Promise<AnimalTotalCost> {
  const locationBreakdown = await getAnimalCostBreakdownByLocation(animalId, startDate, endDate);
  const totalCost = locationBreakdown.reduce((sum, location) => sum + location.totalCost, 0);
  const consumptionPeriods = locationBreakdown.reduce(
    (sum, location) => sum + location.consumptionPeriods,
    0
  );

  return {
    animalId,
    totalCost,
    locationBreakdown,
    consumptionPeriods,
  };
}
