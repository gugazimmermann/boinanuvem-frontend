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

// Cache for stock calculations
const stockCache = new Map<string, { stock: number; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute cache

// Cache for filtered items
const filteredItemsCache = new Map<string, { items: InventoryItem[]; timestamp: number }>();

function getCacheKey(itemId: string, propertyId?: string): string {
  return propertyId ? `${itemId}-${propertyId}` : itemId;
}

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL;
}

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
  const cacheKey = getCacheKey(itemId, propertyId);
  const cached = stockCache.get(cacheKey);

  if (cached && isCacheValid(cached.timestamp)) {
    return cached.stock;
  }

  const movements = getMovementsByItemId(itemId);

  const filteredMovements = propertyId
    ? movements.filter((m) => m.propertyId === propertyId)
    : movements;

  const sortedMovements = [...filteredMovements].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateA !== dateB) {
      return dateA - dateB;
    }

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  let stock = 0;

  for (const movement of sortedMovements) {
    switch (movement.type) {
      case "purchase":
        stock += movement.quantity;
        break;
      case "adjustment":
        stock += movement.quantity;
        break;
      case "consumption":
      case "sale":
        stock -= movement.quantity;
        break;
      case "transfer":
        stock -= movement.quantity;
        break;
    }
  }

  const finalStock = Math.max(0, stock);
  stockCache.set(cacheKey, { stock: finalStock, timestamp: Date.now() });
  return finalStock;
}

export function getLowStockItems(companyId: string): InventoryItem[] {
  const cacheKey = `lowStock-${companyId}`;
  const cached = filteredItemsCache.get(cacheKey);

  if (cached && isCacheValid(cached.timestamp)) {
    return cached.items;
  }

  const items = getInventoryItemsByCompanyId(companyId);
  const lowStockItems = items.filter((item) => {
    const currentStock = getCurrentStock(item.id);
    return currentStock < item.minimumStock;
  });

  filteredItemsCache.set(cacheKey, { items: lowStockItems, timestamp: Date.now() });
  return lowStockItems;
}

export function getExpiringItems(companyId: string, daysThreshold: number = 30): InventoryItem[] {
  const cacheKey = `expiring-${companyId}-${daysThreshold}`;
  const cached = filteredItemsCache.get(cacheKey);

  if (cached && isCacheValid(cached.timestamp)) {
    return cached.items;
  }

  const items = getInventoryItemsByCompanyId(companyId);
  const today = new Date();
  const thresholdDate = new Date(today);
  thresholdDate.setDate(today.getDate() + daysThreshold);

  const expiringItems = items.filter((item) => {
    if (!item.hasExpiration || !item.expirationDate) {
      return false;
    }
    const expirationDate = new Date(item.expirationDate);
    return expirationDate <= thresholdDate && expirationDate >= today;
  });

  filteredItemsCache.set(cacheKey, { items: expiringItems, timestamp: Date.now() });
  return expiringItems;
}

// Clear cache when items or movements are modified
export function clearInventoryCache(): void {
  stockCache.clear();
  filteredItemsCache.clear();
}

export function addInventoryItem(data: InventoryItemFormData): InventoryItem {
  clearInventoryCache();
  return createEntity(mockInventoryItems, data, ID_PREFIX, DEFAULT_ID);
}

export function updateInventoryItem(itemId: string, data: Partial<InventoryItemFormData>): boolean {
  const updated = updateEntity(mockInventoryItems, itemId, data);
  if (updated) {
    clearInventoryCache();
    const item = getInventoryItemById(itemId);
    if (item) {
      item.updatedAt = new Date().toISOString().split("T")[0];
    }
  }
  return updated;
}

export function deleteInventoryItem(itemId: string): boolean {
  clearInventoryCache();
  return deleteEntity(mockInventoryItems, itemId);
}
