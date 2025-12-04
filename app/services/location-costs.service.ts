import type {
  LocationConsumptionCost,
  AnimalCostBreakdown,
  AnimalTotalCost,
  AnimalLocationCost,
} from "~/types/location-costs";
import type { Animal, InventoryMovement } from "~/types";
import { getConsumptionMovementsByLocationId } from "./inventory-movements.service";
import { getInventoryItemById } from "./inventory.service";
import { getAnimalMovementsByAnimalId } from "./animal-movements.service";
import { getAnimalById } from "./animals.service";
import { getLocationById } from "./locations.service";
import { mockAnimalMovements } from "~/mocks/animal-movements";
import { mockInventoryMovements } from "~/mocks/inventory-movements";

function getAnimalIdsInLocation(locationId: string): Set<string> {
  const animalIdsInLocation = new Set<string>();
  for (const movement of mockAnimalMovements) {
    if (movement.locationId === locationId) {
      for (const id of movement.animalIds) {
        animalIdsInLocation.add(id);
      }
    }
  }
  return animalIdsInLocation;
}

function isAnimalInLocationOnDate(animalId: string, locationId: string, targetDate: Date): boolean {
  const animalMovements = getAnimalMovementsByAnimalId(animalId);
  const movementsBeforeDate = animalMovements
    .filter((m) => new Date(m.date) <= targetDate)
    .toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (movementsBeforeDate.length === 0) return false;
  const mostRecentMovement = movementsBeforeDate[0];
  return mostRecentMovement.locationId === locationId;
}

export function getAnimalsInLocationOnDate(locationId: string, date: string): Animal[] {
  const animals: Animal[] = [];
  const targetDate = new Date(date);
  const animalIdsInLocation = getAnimalIdsInLocation(locationId);

  for (const animalId of animalIdsInLocation) {
    if (isAnimalInLocationOnDate(animalId, locationId, targetDate)) {
      const animal = getAnimalById(animalId);
      if (animal) {
        animals.push(animal);
      }
    }
  }

  return animals;
}

export function getLocationConsumptionCosts(
  locationId: string,
  startDate?: string,
  endDate?: string
): LocationConsumptionCost[] {
  const movements = getConsumptionMovementsByLocationId(locationId);

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

      const unitPrice = movement.unitPrice ?? item.unitPrice ?? 0;
      const totalCost = movement.quantity * unitPrice;

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

export function getTotalLocationCost(
  locationId: string,
  startDate?: string,
  endDate?: string
): number {
  const costs = getLocationConsumptionCosts(locationId, startDate, endDate);
  return costs.reduce((total, cost) => total + cost.totalCost, 0);
}

export function getAnimalCostBreakdown(
  locationId: string,
  startDate?: string,
  endDate?: string
): AnimalCostBreakdown[] {
  const consumptionCosts = getLocationConsumptionCosts(locationId, startDate, endDate);

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

export function getAnimalCostByLocation(
  animalId: string,
  locationId: string,
  startDate?: string,
  endDate?: string
): number {
  const consumptionCosts = getLocationConsumptionCosts(locationId, startDate, endDate);
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

function getRelevantCostsForAnimal(
  locationId: string,
  animalId: string,
  startDate?: string,
  endDate?: string
): LocationConsumptionCost[] {
  const locationConsumptionCosts = getLocationConsumptionCosts(locationId, startDate, endDate);
  return locationConsumptionCosts.filter((cost) =>
    cost.animalsPresent.some((animal) => animal.id === animalId)
  );
}

export function getAnimalCostBreakdownByLocation(
  animalId: string,
  startDate?: string,
  endDate?: string
): AnimalLocationCost[] {
  const consumptionMovements = mockInventoryMovements.filter(
    (m) => m.type === "consumption" && m.locationId && m.locationId.trim() !== ""
  );

  const locationCosts = new Map<string, LocationConsumptionCost[]>();

  for (const movement of consumptionMovements) {
    if (!isMovementInDateRange(movement, startDate, endDate)) continue;

    const locationId = movement.locationId!;
    const relevantCosts = getRelevantCostsForAnimal(locationId, animalId, startDate, endDate);

    if (relevantCosts.length > 0) {
      const existing = locationCosts.get(locationId);
      if (existing) {
        existing.push(...relevantCosts);
      } else {
        locationCosts.set(locationId, relevantCosts);
      }
    }
  }

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
