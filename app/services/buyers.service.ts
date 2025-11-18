import type { Buyer, BuyerFormData } from "~/types";
import { mockBuyers } from "~/mocks/buyers";
import {
  findById,
  findByField,
  findByFieldIncludes,
  createEntity,
  updateEntity,
  deleteEntity,
} from "./base-service";

const ID_PREFIX = "aa0e8400-e29b-41d4-a716";
const DEFAULT_ID = "aa0e8400-e29b-41d4-a716-446655440009";

export function getBuyerById(buyerId: string | undefined): Buyer | undefined {
  return findById(mockBuyers, buyerId);
}

export function getBuyersByCompanyId(companyId: string): Buyer[] {
  return findByField(mockBuyers, "companyId", companyId);
}

export function getBuyersByPropertyId(propertyId: string): Buyer[] {
  return findByFieldIncludes(mockBuyers, "propertyIds", propertyId);
}

export function addBuyer(data: BuyerFormData): Buyer {
  return createEntity(mockBuyers, data, ID_PREFIX, DEFAULT_ID);
}

export function updateBuyer(buyerId: string, data: Partial<BuyerFormData>): boolean {
  return updateEntity(mockBuyers, buyerId, data);
}

export function deleteBuyer(buyerId: string): boolean {
  return deleteEntity(mockBuyers, buyerId);
}
