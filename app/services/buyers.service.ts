import type { Buyer, BuyerFormData } from "~/types";
import { createEntityService } from "./entity-service-factory";

const buyerService = createEntityService<Buyer, BuyerFormData>({
  endpoint: "/buyers",
  entityName: "comprador",
  entityNamePlural: "compradores",
  supportsCNPJ: true,
});

/**
 * Get all buyers for the current user's company via API
 */
export async function getBuyers(): Promise<Buyer[]> {
  return buyerService.getAll();
}

/**
 * Get a single buyer by ID via API
 */
export async function getBuyerById(buyerId: string): Promise<Buyer> {
  return buyerService.getById(buyerId);
}

/**
 * Create a new buyer via API
 */
export async function addBuyer(data: BuyerFormData): Promise<Buyer> {
  return buyerService.add(data);
}

/**
 * Update a buyer via API
 */
export async function updateBuyer(buyerId: string, data: Partial<BuyerFormData>): Promise<Buyer> {
  return buyerService.update(buyerId, data);
}

/**
 * Delete a buyer via API
 */
export async function deleteBuyer(buyerId: string): Promise<void> {
  return buyerService.remove(buyerId);
}
