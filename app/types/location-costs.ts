import type { InventoryMovement, InventoryItem, Animal } from "~/types";

export interface LocationConsumptionCost {
  movement: InventoryMovement;
  item: InventoryItem;
  totalCost: number;
  animalsPresent: Animal[];
}

export interface AnimalCostBreakdown {
  animal: Animal;
  totalCost: number;
  consumptionPeriods: number;
  averageCostPerPeriod: number;
}

export interface AnimalLocationCost {
  locationId: string;
  locationName: string;
  totalCost: number;
  consumptionPeriods: number;
  consumptionDetails: LocationConsumptionCost[];
}

export interface AnimalTotalCost {
  animalId: string;
  totalCost: number;
  locationBreakdown: AnimalLocationCost[];
  consumptionPeriods: number;
}
