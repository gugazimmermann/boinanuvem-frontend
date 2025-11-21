import type {
  LocationConsumptionCost,
  AnimalCostBreakdown,
  AnimalTotalCost,
  AnimalLocationCost,
} from "~/types/location-costs";
import type { Animal } from "~/types";
import { getConsumptionMovementsByLocationId } from "./inventory-movements.service";
import { getInventoryItemById } from "./inventory.service";
import { getAnimalMovementsByAnimalId } from "./animal-movements.service";
import { getAnimalById } from "./animals.service";
import { getLocationById } from "./locations.service";
import { mockAnimalMovements } from "~/mocks/animal-movements";
import { mockInventoryMovements } from "~/mocks/inventory-movements";

/**
 * Determines which animals were in a location on a specific date
 * by checking the most recent animal movement before or on that date
 */
export function getAnimalsInLocationOnDate(locationId: string, date: string): Animal[] {
  const animals: Animal[] = [];
  const targetDate = new Date(date);

  // Get all unique animal IDs that have been in this location
  const animalIdsInLocation = new Set<string>();
  mockAnimalMovements.forEach((movement) => {
    if (movement.locationId === locationId) {
      movement.animalIds.forEach((id) => animalIdsInLocation.add(id));
    }
  });

  // For each animal, find the most recent movement before or on the target date
  for (const animalId of animalIdsInLocation) {
    const animalMovements = getAnimalMovementsByAnimalId(animalId);

    // Filter movements before or on target date and sort by date descending
    const movementsBeforeDate = animalMovements
      .filter((m) => new Date(m.date) <= targetDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // If the most recent movement before/on date has this location, animal was present
    if (movementsBeforeDate.length > 0) {
      const mostRecentMovement = movementsBeforeDate[0];
      if (mostRecentMovement.locationId === locationId) {
        const animal = getAnimalById(animalId);
        if (animal) {
          animals.push(animal);
        }
      }
    }
  }

  return animals;
}

/**
 * Gets all consumption movements for a location with calculated costs
 */
export function getLocationConsumptionCosts(
  locationId: string,
  startDate?: string,
  endDate?: string
): LocationConsumptionCost[] {
  const movements = getConsumptionMovementsByLocationId(locationId);

  // Filter by date range if provided
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

  return filteredMovements
    .map((movement) => {
      const item = getInventoryItemById(movement.itemId);
      if (!item) return null;

      // Use unitPrice from movement if available, otherwise fall back to item's unitPrice
      const unitPrice = movement.unitPrice ?? item.unitPrice ?? 0;
      const totalCost = movement.quantity * unitPrice;

      // Get animals present on consumption date
      const animalsPresent = getAnimalsInLocationOnDate(locationId, movement.date);

      return {
        movement,
        item,
        totalCost,
        animalsPresent,
      };
    })
    .filter((cost): cost is LocationConsumptionCost => cost !== null);
}

/**
 * Gets total cost of all consumption in a location
 */
export function getTotalLocationCost(
  locationId: string,
  startDate?: string,
  endDate?: string
): number {
  const costs = getLocationConsumptionCosts(locationId, startDate, endDate);
  return costs.reduce((total, cost) => total + cost.totalCost, 0);
}

/**
 * Gets per-animal cost breakdown with time-weighted allocation
 */
export function getAnimalCostBreakdown(
  locationId: string,
  startDate?: string,
  endDate?: string
): AnimalCostBreakdown[] {
  const consumptionCosts = getLocationConsumptionCosts(locationId, startDate, endDate);

  // Track costs per animal
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

  // Convert to array and calculate averages
  return Array.from(animalCosts.values()).map(({ animal, totalCost, periods }) => ({
    animal,
    totalCost,
    consumptionPeriods: periods,
    averageCostPerPeriod: periods > 0 ? totalCost / periods : 0,
  }));
}

/**
 * Calculates total cost allocated to a specific animal in a specific location
 */
export function getAnimalCostByLocation(
  animalId: string,
  locationId: string,
  startDate?: string,
  endDate?: string
): number {
  const consumptionCosts = getLocationConsumptionCosts(locationId, startDate, endDate);
  let totalCost = 0;

  for (const cost of consumptionCosts) {
    // Check if this animal was present in the location on the consumption date
    const wasPresent = cost.animalsPresent.some((animal) => animal.id === animalId);
    if (wasPresent) {
      // Divide cost equally among all animals present
      const costPerAnimal =
        cost.animalsPresent.length > 0 ? cost.totalCost / cost.animalsPresent.length : 0;
      totalCost += costPerAnimal;
    }
  }

  return totalCost;
}

/**
 * Gets cost breakdown for an animal grouped by location
 */
export function getAnimalCostBreakdownByLocation(
  animalId: string,
  startDate?: string,
  endDate?: string
): AnimalLocationCost[] {
  // Get all consumption movements with locationId
  const consumptionMovements = mockInventoryMovements.filter(
    (m) => m.type === "consumption" && m.locationId && m.locationId.trim() !== ""
  );

  // Group by location
  const locationCosts = new Map<string, LocationConsumptionCost[]>();

  for (const movement of consumptionMovements) {
    // Filter by date range if provided
    if (startDate || endDate) {
      const movementDate = new Date(movement.date);
      if (startDate && movementDate < new Date(startDate)) continue;
      if (endDate && movementDate > new Date(endDate)) continue;
    }

    const locationId = movement.locationId!;
    const locationConsumptionCosts = getLocationConsumptionCosts(locationId, startDate, endDate);

    // Filter to only include costs where this animal was present
    const relevantCosts = locationConsumptionCosts.filter((cost) =>
      cost.animalsPresent.some((animal) => animal.id === animalId)
    );

    if (relevantCosts.length > 0) {
      const existing = locationCosts.get(locationId);
      if (existing) {
        existing.push(...relevantCosts);
      } else {
        locationCosts.set(locationId, relevantCosts);
      }
    }
  }

  // Convert to AnimalLocationCost array
  return Array.from(locationCosts.entries()).map(([locationId, consumptionDetails]) => {
    const location = getLocationById(locationId);
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
  });
}

/**
 * Gets total cost for an animal across all locations
 */
export function getAnimalTotalCost(
  animalId: string,
  startDate?: string,
  endDate?: string
): AnimalTotalCost {
  const locationBreakdown = getAnimalCostBreakdownByLocation(animalId, startDate, endDate);
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
