import type { InventoryItem, InventoryItemFormData } from "~/types";
import { handleApiError, createResourceErrorMessages } from "./error-handlers";
import { getMovementsByItemId } from "./inventory-movements.service";
import { buildUpdateDto } from "~/utils/update-dto-builder";
import {
  createListHandler,
  createGetByIdHandler,
  createGetByFilterHandler,
  createCrudHandlers,
} from "./service-helpers";
import { createEntityTransform } from "./transform-helpers";

const inventoryErrors = createResourceErrorMessages("itens de estoque");

/**
 * Cache for stock calculations to avoid recalculating on every call
 */
const stockCache: Map<string, number> = new Map();

/**
 * Clear the inventory stock cache
 */
export function clearInventoryCache(): void {
  stockCache.clear();
}

/**
 * Transform backend InventoryItemResponseDto to frontend InventoryItem type
 */
const transformInventoryItem = createEntityTransform<InventoryItem>({
  dateStringFields: ["expirationDate"],
  dateTimeFields: ["createdAt", "updatedAt"],
});

/**
 * Get all inventory items for the current user's company via API
 */
export const getInventoryItemsByCompanyId = createListHandler<InventoryItem>({
  endpoint: "/inventory-items",
  errorMessages: inventoryErrors.list,
  transform: transformInventoryItem,
});

/**
 * Get a single inventory item by ID via API
 */
export const getInventoryItemById = createGetByIdHandler<InventoryItem>({
  endpoint: "/inventory-items",
  errorMessages: inventoryErrors.view,
  transform: transformInventoryItem,
  custom403Message: "Você não tem permissão para visualizar este item de estoque",
});

/**
 * Get inventory items by property ID via API
 */
export const getInventoryItemsByPropertyId = createGetByFilterHandler<InventoryItem>({
  endpoint: "/inventory-items",
  errorMessages: inventoryErrors.list,
  transform: transformInventoryItem,
  filterFn: (item, propertyId) => item.propertyIds?.includes(propertyId) ?? false,
});

/**
 * Get inventory items by supplier ID via API
 */
export const getInventoryItemsBySupplierId = createGetByFilterHandler<InventoryItem>({
  endpoint: "/inventory-items",
  errorMessages: inventoryErrors.list,
  transform: transformInventoryItem,
  filterFn: (item, supplierId) => item.supplierId === supplierId,
});

/**
 * Get inventory items by category via API
 */
export async function getInventoryItemsByCategory(
  category: string,
  companyId: string
): Promise<InventoryItem[]> {
  const items = await getInventoryItemsByCompanyId(companyId);
  return items.filter((item) => item.category === category && item.companyId === companyId);
}

/**
 * Get current stock for an item (calculated from movements)
 */
export async function getCurrentStock(itemId: string, propertyId?: string): Promise<number> {
  const cacheKey = `${itemId}-${propertyId || "all"}`;

  // Check cache first
  if (stockCache.has(cacheKey)) {
    return stockCache.get(cacheKey)!;
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

  // Cache the result
  stockCache.set(cacheKey, finalStock);

  return finalStock;
}

/**
 * Get low stock items via API
 */
export async function getLowStockItems(companyId: string): Promise<InventoryItem[]> {
  try {
    const items = await getInventoryItemsByCompanyId(companyId);
    const lowStockItems: InventoryItem[] = [];

    for (const item of items) {
      const currentStock = await getCurrentStock(item.id);
      if (currentStock < item.minimumStock) {
        lowStockItems.push(item);
      }
    }

    return lowStockItems;
  } catch (error) {
    try {
      handleApiError(error, inventoryErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get expiring items via API
 */
export async function getExpiringItems(
  companyId: string,
  daysThreshold: number = 30
): Promise<InventoryItem[]> {
  try {
    const items = await getInventoryItemsByCompanyId(companyId);
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

    return expiringItems;
  } catch (error) {
    try {
      handleApiError(error, inventoryErrors.list);
    } catch {
      return [];
    }
  }
}

const inventoryCrud = createCrudHandlers<InventoryItem, InventoryItem, InventoryItemFormData>({
  endpoint: "/inventory-items",
  errorMessages: {
    create: {
      ...inventoryErrors.create,
      409: "Já existe um item de estoque com este código",
    },
    update: {
      ...inventoryErrors.update,
      409: "Já existe um item de estoque com este código",
    },
    delete: inventoryErrors.delete,
  },
  transform: transformInventoryItem,
  buildCreateDto: (data) => ({
    code: data.code,
    name: data.name,
    description: data.description,
    category: data.category,
    customCategory: data.customCategory,
    unit: data.unit,
    minimumStock: data.minimumStock,
    unitPrice: data.unitPrice,
    supplierId: data.supplierId,
    hasExpiration: data.hasExpiration,
    expirationDate: data.expirationDate,
    usageAmount: data.usageAmount,
    usageUnit: data.usageUnit,
    usageBasis: data.usageBasis,
    propertyIds: data.propertyIds,
  }),
  buildUpdateDto: (data) =>
    buildUpdateDto(data, [
      "code",
      "name",
      "description",
      "category",
      "customCategory",
      "unit",
      "minimumStock",
      "unitPrice",
      "supplierId",
      "hasExpiration",
      "expirationDate",
      "usageAmount",
      "usageUnit",
      "usageBasis",
      "propertyIds",
    ]),
  onAfterCreate: clearInventoryCache,
  onAfterUpdate: clearInventoryCache,
  onAfterDelete: clearInventoryCache,
});

/**
 * Create a new inventory item via API
 */
export const addInventoryItem = inventoryCrud.add;

/**
 * Update an inventory item via API
 */
export const updateInventoryItem = inventoryCrud.update;

/**
 * Delete an inventory item via API
 */
export const deleteInventoryItem = inventoryCrud.remove;
