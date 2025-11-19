import type { InventoryItem, InventoryItemFormData } from "~/types";
import { mockInventoryItems } from "~/mocks/inventory";
import {
  findById,
  findByField,
  findByFieldIncludes,
  createEntity,
  updateEntity,
  deleteEntity,
} from "./base-service";
import { getMovementsByItemId } from "./inventory-movements.service";

const ID_PREFIX = "ii0e8400-e29b-41d4-a716";
const DEFAULT_ID = "ii0e8400-e29b-41d4-a716-446655440010";

export function getInventoryItemById(itemId: string | undefined): InventoryItem | undefined {
  return findById(mockInventoryItems, itemId);
}

export function getInventoryItemsByCompanyId(companyId: string): InventoryItem[] {
  return findByField(mockInventoryItems, "companyId", companyId);
}

export function getInventoryItemsByPropertyId(propertyId: string): InventoryItem[] {
  return findByFieldIncludes(mockInventoryItems, "propertyIds", propertyId);
}

export function getInventoryItemsBySupplierId(supplierId: string): InventoryItem[] {
  return findByField(mockInventoryItems, "supplierId", supplierId);
}

export function getInventoryItemsByCategory(category: string, companyId: string): InventoryItem[] {
  return mockInventoryItems.filter(
    (item) => item.category === category && item.companyId === companyId
  );
}

export function getCurrentStock(itemId: string, propertyId?: string): number {
  const movements = getMovementsByItemId(itemId);

  // Filter by property if specified
  const filteredMovements = propertyId
    ? movements.filter((m) => m.propertyId === propertyId)
    : movements;

  // Sort movements by date (chronological order) to ensure accurate stock calculation
  const sortedMovements = [...filteredMovements].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateA !== dateB) {
      return dateA - dateB;
    }
    // If same date, sort by creation time for consistency
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  let stock = 0;

  for (const movement of sortedMovements) {
    switch (movement.type) {
      case "purchase":
        stock += movement.quantity;
        break;
      case "adjustment":
        // Adjustments can be positive or negative
        stock += movement.quantity;
        break;
      case "consumption":
      case "sale":
        stock -= movement.quantity;
        break;
      case "transfer":
        // Transfer out decreases, transfer in increases
        // For simplicity, we'll treat as consumption for now
        stock -= movement.quantity;
        break;
    }
  }

  return Math.max(0, stock);
}

export function getLowStockItems(companyId: string): InventoryItem[] {
  const items = getInventoryItemsByCompanyId(companyId);
  return items.filter((item) => {
    const currentStock = getCurrentStock(item.id);
    return currentStock < item.minimumStock;
  });
}

export function getExpiringItems(companyId: string, daysThreshold: number = 30): InventoryItem[] {
  const items = getInventoryItemsByCompanyId(companyId);
  const today = new Date();
  const thresholdDate = new Date(today);
  thresholdDate.setDate(today.getDate() + daysThreshold);

  return items.filter((item) => {
    if (!item.hasExpiration || !item.expirationDate) {
      return false;
    }
    const expirationDate = new Date(item.expirationDate);
    return expirationDate <= thresholdDate && expirationDate >= today;
  });
}

export function addInventoryItem(data: InventoryItemFormData): InventoryItem {
  return createEntity(mockInventoryItems, data, ID_PREFIX, DEFAULT_ID);
}

export function updateInventoryItem(itemId: string, data: Partial<InventoryItemFormData>): boolean {
  const updated = updateEntity(mockInventoryItems, itemId, data);
  if (updated) {
    const item = getInventoryItemById(itemId);
    if (item) {
      item.updatedAt = new Date().toISOString().split("T")[0];
    }
  }
  return updated;
}

export function deleteInventoryItem(itemId: string): boolean {
  return deleteEntity(mockInventoryItems, itemId);
}
