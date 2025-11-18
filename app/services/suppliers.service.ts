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

export function getSupplierById(supplierId: string | undefined): Supplier | undefined {
  return findById(mockSuppliers, supplierId);
}

export function getSuppliersByCompanyId(companyId: string): Supplier[] {
  return findByField(mockSuppliers, "companyId", companyId);
}

export function getSuppliersByPropertyId(propertyId: string): Supplier[] {
  return findByFieldIncludes(mockSuppliers, "propertyIds", propertyId);
}

export function addSupplier(data: SupplierFormData): Supplier {
  return createEntity(mockSuppliers, data, ID_PREFIX, DEFAULT_ID);
}

export function updateSupplier(supplierId: string, data: Partial<SupplierFormData>): boolean {
  return updateEntity(mockSuppliers, supplierId, data);
}

export function deleteSupplier(supplierId: string): boolean {
  return deleteEntity(mockSuppliers, supplierId);
}
