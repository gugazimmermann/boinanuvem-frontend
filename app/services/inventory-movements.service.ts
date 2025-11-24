import type { InventoryMovement, InventoryMovementFormData } from "~/types";
import { mockInventoryMovements } from "~/mocks/inventory-movements";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";
import { clearInventoryCache } from "./inventory.service";

const ID_PREFIX = "im0e8400-e29b-41d4-a716";
const DEFAULT_ID = "im0e8400-e29b-41d4-a716-446655440010";

export function getInventoryMovementById(
  movementId: string | undefined
): InventoryMovement | undefined {
  return findById(mockInventoryMovements, movementId);
}

export function getMovementsByItemId(itemId: string): InventoryMovement[] {
  return findByField(mockInventoryMovements, "itemId", itemId);
}

export function getMovementsByCompanyId(companyId: string): InventoryMovement[] {
  return findByField(mockInventoryMovements, "companyId", companyId);
}

export function getMovementsBySupplierId(supplierId: string): InventoryMovement[] {
  return findByField(mockInventoryMovements, "supplierId", supplierId);
}

export function getMovementsByCashFlowId(cashFlowId: string): InventoryMovement[] {
  return findByField(mockInventoryMovements, "cashFlowId", cashFlowId);
}

export function getMovementsByPropertyId(propertyId: string): InventoryMovement[] {
  return findByField(mockInventoryMovements, "propertyId", propertyId);
}

export function getMovementsByLocationId(locationId: string): InventoryMovement[] {
  return findByField(mockInventoryMovements, "locationId", locationId);
}

export function getConsumptionMovementsByLocationId(locationId: string): InventoryMovement[] {
  return mockInventoryMovements.filter(
    (movement) => movement.locationId === locationId && movement.type === "consumption"
  );
}

export function addInventoryMovement(data: InventoryMovementFormData): InventoryMovement {
  const { createCashFlowTransaction: _createCashFlowTransaction, ...movementData } = data;
  clearInventoryCache();
  return createEntity(mockInventoryMovements, movementData, ID_PREFIX, DEFAULT_ID);
}

export function updateInventoryMovement(
  movementId: string,
  data: Partial<InventoryMovementFormData>
): boolean {
  const { createCashFlowTransaction: _createCashFlowTransaction, ...updateData } = data;
  const updated = updateEntity(mockInventoryMovements, movementId, updateData);
  if (updated) {
    clearInventoryCache();
  }
  return updated;
}

export function deleteInventoryMovement(movementId: string): boolean {
  const deleted = deleteEntity(mockInventoryMovements, movementId);
  if (deleted) {
    clearInventoryCache();
  }
  return deleted;
}
