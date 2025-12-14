import type { InventoryMovement, InventoryMovementFormData } from "~/types";
import { handleApiError, createResourceErrorMessages } from "./error-handlers";
import { clearInventoryCache } from "./inventory.service";
import { createListHandler, createGetByIdHandler, createCrudHandlers } from "./service-helpers";
import { createEntityTransform } from "./transform-helpers";
import { apiClient } from "./api-client";

const inventoryMovementsErrors = createResourceErrorMessages("movimentações de estoque");

/**
 * Transform backend InventoryMovementResponseDto to frontend InventoryMovement type
 */
const transformInventoryMovement = createEntityTransform<InventoryMovement>({
  dateStringFields: ["date", "expirationDate"],
  dateTimeFields: ["createdAt", "updatedAt"],
});

/**
 * Get all inventory movements for the current user's company via API
 */
export const getMovementsByCompanyId = createListHandler<InventoryMovement>({
  endpoint: "/inventory-movements",
  errorMessages: inventoryMovementsErrors.list,
  transform: transformInventoryMovement,
});

/**
 * Get a single inventory movement by ID via API
 */
export const getInventoryMovementById = createGetByIdHandler<InventoryMovement>({
  endpoint: "/inventory-movements",
  errorMessages: inventoryMovementsErrors.view,
  transform: transformInventoryMovement,
  custom403Message: "Você não tem permissão para visualizar esta movimentação de estoque",
});

/**
 * Get inventory movements by item ID via API
 */
export async function getMovementsByItemId(itemId: string): Promise<InventoryMovement[]> {
  try {
    const movements = await apiClient.get<InventoryMovement[]>(
      `/inventory-movements/item/${itemId}`
    );
    return movements.map(transformInventoryMovement);
  } catch (error) {
    try {
      handleApiError(error, inventoryMovementsErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get inventory movements by property ID via API
 */
export async function getMovementsByPropertyId(propertyId: string): Promise<InventoryMovement[]> {
  try {
    const movements = await apiClient.get<InventoryMovement[]>(
      `/inventory-movements/property/${propertyId}`
    );
    return movements.map(transformInventoryMovement);
  } catch (error) {
    try {
      handleApiError(error, inventoryMovementsErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get inventory movements by location ID via API
 */
export async function getMovementsByLocationId(locationId: string): Promise<InventoryMovement[]> {
  try {
    const movements = await apiClient.get<InventoryMovement[]>(
      `/inventory-movements/location/${locationId}`
    );
    return movements.map(transformInventoryMovement);
  } catch (error) {
    try {
      handleApiError(error, inventoryMovementsErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get consumption movements by location ID via API
 */
export async function getConsumptionMovementsByLocationId(
  locationId: string
): Promise<InventoryMovement[]> {
  const movements = await getMovementsByLocationId(locationId);
  return movements.filter((movement) => movement.type === "consumption");
}

/**
 * Get inventory movements by supplier ID
 * Note: Backend doesn't have a dedicated endpoint, so we filter from all movements
 */
export async function getMovementsBySupplierId(supplierId: string): Promise<InventoryMovement[]> {
  try {
    const allMovements = await getMovementsByCompanyId();
    return allMovements.filter((movement) => movement.supplierId === supplierId);
  } catch (error) {
    try {
      handleApiError(error, inventoryMovementsErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get inventory movements by cash flow ID
 * Note: Backend doesn't have a dedicated endpoint, so we filter from all movements
 */
export async function getMovementsByCashFlowId(cashFlowId: string): Promise<InventoryMovement[]> {
  try {
    const allMovements = await getMovementsByCompanyId();
    return allMovements.filter((movement) => movement.cashFlowId === cashFlowId);
  } catch (error) {
    try {
      handleApiError(error, inventoryMovementsErrors.list);
    } catch {
      return [];
    }
  }
}

const inventoryMovementsCrud = createCrudHandlers<
  InventoryMovement,
  InventoryMovement,
  InventoryMovementFormData
>({
  endpoint: "/inventory-movements",
  errorMessages: {
    create: inventoryMovementsErrors.create,
    update: inventoryMovementsErrors.update,
    delete: inventoryMovementsErrors.delete,
  },
  transform: transformInventoryMovement,
  buildCreateDto: (data) => {
    const { createCashFlowTransaction: _createCashFlowTransaction, ...dto } = data;
    return dto;
  },
  buildUpdateDto: (data) => {
    const { createCashFlowTransaction: _createCashFlowTransaction, ...dto } = data;
    return dto;
  },
  onAfterCreate: clearInventoryCache,
  onAfterUpdate: clearInventoryCache,
  onAfterDelete: clearInventoryCache,
});

/**
 * Create a new inventory movement via API
 */
export const addInventoryMovement = inventoryMovementsCrud.add;

/**
 * Update an inventory movement via API
 */
export const updateInventoryMovement = inventoryMovementsCrud.update;

/**
 * Delete an inventory movement via API
 */
export const deleteInventoryMovement = inventoryMovementsCrud.remove;
