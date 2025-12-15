import type {
  InventoryObservation,
  InventoryObservationFormData,
} from "~/types/inventory-observation";
import { apiClient } from "./api-client";
import { createResourceErrorMessages, handleApiError } from "./error-handlers";
import { createEntityTransform } from "./transform-helpers";
import { buildUpdateDto } from "~/utils/update-dto-builder";

const inventoryObservationErrors = createResourceErrorMessages("observação de item de estoque");

/**
 * Transform backend InventoryObservationResponseDto to frontend InventoryObservation type
 */
const transformInventoryObservation = createEntityTransform<
  InventoryObservation & Record<string, unknown>
>({
  dateTimeFields: ["createdAt", "updatedAt"],
}) as unknown as (obs: InventoryObservation) => InventoryObservation;

/**
 * Get all observations for an inventory item via API
 */
export async function getInventoryObservationsByItemId(
  itemId: string
): Promise<InventoryObservation[]> {
  if (!itemId) return [];
  try {
    const observations = await apiClient.get<InventoryObservation[]>(
      `/inventory-items/${itemId}/observations`
    );
    return observations.map(transformInventoryObservation);
  } catch (error) {
    try {
      handleApiError(error, inventoryObservationErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get a single inventory observation by ID via API
 */
export async function getInventoryObservationById(
  observationId: string | undefined
): Promise<InventoryObservation | undefined> {
  if (!observationId) return undefined;
  try {
    const observation = await apiClient.get<InventoryObservation>(
      `/inventory-observations/${observationId}`
    );
    return transformInventoryObservation(observation);
  } catch (error) {
    try {
      handleApiError(error, {
        ...inventoryObservationErrors.view,
        403: "Você não tem permissão para visualizar esta observação",
      });
    } catch {
      return undefined;
    }
  }
}

/**
 * Create a new inventory observation via API
 */
export async function addInventoryObservation(
  data: InventoryObservationFormData
): Promise<InventoryObservation> {
  try {
    const createDto = {
      observation: data.observation,
      fileIds: data.fileIds,
    };

    const response = await apiClient.post<InventoryObservation>(
      `/inventory-items/${data.itemId}/observations`,
      createDto
    );
    return transformInventoryObservation(response);
  } catch (error) {
    handleApiError(error, inventoryObservationErrors.create);
  }
}

/**
 * Update an inventory observation via API
 */
export async function updateInventoryObservation(
  observationId: string,
  data: Partial<InventoryObservationFormData>
): Promise<InventoryObservation> {
  try {
    const updateDto = buildUpdateDto(data, ["observation", "fileIds"]);
    const response = await apiClient.put<InventoryObservation>(
      `/inventory-observations/${observationId}`,
      updateDto
    );
    return transformInventoryObservation(response);
  } catch (error) {
    handleApiError(error, inventoryObservationErrors.update);
  }
}

/**
 * Delete an inventory observation via API
 */
export async function deleteInventoryObservation(observationId: string): Promise<void> {
  try {
    await apiClient.delete(`/inventory-observations/${observationId}`);
  } catch (error) {
    handleApiError(error, inventoryObservationErrors.delete);
  }
}
