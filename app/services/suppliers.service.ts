import type { Supplier, SupplierFormData } from "~/types";
import { createEntityService } from "./entity-service-factory";

const supplierService = createEntityService<Supplier, SupplierFormData>({
  endpoint: "/suppliers",
  entityName: "fornecedor",
  entityNamePlural: "fornecedores",
  supportsCNPJ: true,
});

/**
 * Get all suppliers for the current user's company via API
 */
export async function getSuppliers(): Promise<Supplier[]> {
  return supplierService.getAll();
}

/**
 * Get a single supplier by ID via API
 */
export async function getSupplierById(supplierId: string): Promise<Supplier> {
  return supplierService.getById(supplierId);
}

/**
 * Create a new supplier via API
 */
export async function addSupplier(data: SupplierFormData): Promise<Supplier> {
  return supplierService.add(data);
}

/**
 * Update a supplier via API
 */
export async function updateSupplier(
  supplierId: string,
  data: Partial<SupplierFormData>
): Promise<Supplier> {
  return supplierService.update(supplierId, data);
}

/**
 * Delete a supplier via API
 */
export async function deleteSupplier(supplierId: string): Promise<void> {
  return supplierService.remove(supplierId);
}
