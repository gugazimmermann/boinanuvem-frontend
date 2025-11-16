import type { Supplier, SupplierFormData } from "~/types";
import { mockSuppliers } from "~/mocks/suppliers";
import {
  findById,
  findByField,
  findByFieldIncludes,
  createEntity,
  updateEntity,
  deleteEntity,
} from "./base-service";

const ID_PREFIX = "990e8400-e29b-41d4-a716";
const DEFAULT_ID = "990e8400-e29b-41d4-a716-446655440009";

/**
 * Get supplier by ID
 */
export function getSupplierById(supplierId: string | undefined): Supplier | undefined {
  return findById(mockSuppliers, supplierId);
}

/**
 * Get suppliers by company ID
 */
export function getSuppliersByCompanyId(companyId: string): Supplier[] {
  return findByField(mockSuppliers, "companyId", companyId);
}

/**
 * Get suppliers by property ID
 */
export function getSuppliersByPropertyId(propertyId: string): Supplier[] {
  return findByFieldIncludes(mockSuppliers, "propertyIds", propertyId);
}

/**
 * Add a new supplier
 */
export function addSupplier(data: SupplierFormData): Supplier {
  return createEntity(mockSuppliers, data, ID_PREFIX, DEFAULT_ID);
}

/**
 * Update a supplier
 */
export function updateSupplier(supplierId: string, data: Partial<SupplierFormData>): boolean {
  return updateEntity(mockSuppliers, supplierId, data);
}

/**
 * Delete a supplier
 */
export function deleteSupplier(supplierId: string): boolean {
  return deleteEntity(mockSuppliers, supplierId);
}
