import type { Buyer, BuyerFormData } from "~/types";
import { mockBuyers } from "~/mocks/buyers";
import { findById, findByField, findByFieldIncludes, createEntity, updateEntity, deleteEntity } from "./base-service";

const ID_PREFIX = "aa0e8400-e29b-41d4-a716";
const DEFAULT_ID = "aa0e8400-e29b-41d4-a716-446655440009";

/**
 * Get buyer by ID
 */
export function getBuyerById(buyerId: string | undefined): Buyer | undefined {
  return findById(mockBuyers, buyerId);
}

/**
 * Get buyers by company ID
 */
export function getBuyersByCompanyId(companyId: string): Buyer[] {
  return findByField(mockBuyers, "companyId", companyId);
}

/**
 * Get buyers by property ID
 */
export function getBuyersByPropertyId(propertyId: string): Buyer[] {
  return findByFieldIncludes(mockBuyers, "propertyIds", propertyId);
}

/**
 * Add a new buyer
 */
export function addBuyer(data: BuyerFormData): Buyer {
  return createEntity(mockBuyers, data, ID_PREFIX, DEFAULT_ID);
}

/**
 * Update a buyer
 */
export function updateBuyer(buyerId: string, data: Partial<BuyerFormData>): boolean {
  return updateEntity(mockBuyers, buyerId, data);
}

/**
 * Delete a buyer
 */
export function deleteBuyer(buyerId: string): boolean {
  return deleteEntity(mockBuyers, buyerId);
}

