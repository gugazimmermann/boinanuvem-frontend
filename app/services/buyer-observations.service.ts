import type { BuyerObservation, BuyerObservationFormData } from "~/types/buyer-observation";
import { apiClient } from "./api-client";
import { createResourceErrorMessages, handleApiError } from "./error-handlers";
import { createEntityTransform } from "./transform-helpers";
import { buildUpdateDto } from "~/utils/update-dto-builder";

const buyerObservationErrors = createResourceErrorMessages("observação de comprador");

/**
 * Transform backend BuyerObservationResponseDto to frontend BuyerObservation type
 */
const transformBuyerObservation = createEntityTransform<BuyerObservation & Record<string, unknown>>(
  {
    dateTimeFields: ["createdAt", "updatedAt"],
  }
) as (obs: BuyerObservation) => BuyerObservation;

/**
 * Get all observations for a buyer via API
 */
export async function getBuyerObservationsByBuyerId(buyerId: string): Promise<BuyerObservation[]> {
  if (!buyerId) return [];
  try {
    const observations = await apiClient.get<BuyerObservation[]>(`/buyers/${buyerId}/observations`);
    return observations.map(transformBuyerObservation);
  } catch (error) {
    try {
      handleApiError(error, buyerObservationErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get a single buyer observation by ID via API
 */
export async function getBuyerObservationById(
  observationId: string | undefined
): Promise<BuyerObservation | undefined> {
  if (!observationId) return undefined;
  try {
    const observation = await apiClient.get<BuyerObservation>(
      `/buyer-observations/${observationId}`
    );
    return transformBuyerObservation(observation);
  } catch (error) {
    try {
      handleApiError(error, {
        ...buyerObservationErrors.view,
        403: "Você não tem permissão para visualizar esta observação",
      });
    } catch {
      return undefined;
    }
  }
}

/**
 * Create a new buyer observation via API
 */
export async function addBuyerObservation(
  data: BuyerObservationFormData
): Promise<BuyerObservation> {
  try {
    const createDto = {
      observation: data.observation,
      fileIds: data.fileIds,
    };

    const response = await apiClient.post<BuyerObservation>(
      `/buyers/${data.buyerId}/observations`,
      createDto
    );
    return transformBuyerObservation(response);
  } catch (error) {
    handleApiError(error, buyerObservationErrors.create);
  }
}

/**
 * Update a buyer observation via API
 */
export async function updateBuyerObservation(
  observationId: string,
  data: Partial<BuyerObservationFormData>
): Promise<BuyerObservation> {
  try {
    const updateDto = buildUpdateDto(data, ["observation", "fileIds"]);
    const response = await apiClient.put<BuyerObservation>(
      `/buyer-observations/${observationId}`,
      updateDto
    );
    return transformBuyerObservation(response);
  } catch (error) {
    handleApiError(error, buyerObservationErrors.update);
  }
}

/**
 * Delete a buyer observation via API
 */
export async function deleteBuyerObservation(observationId: string): Promise<void> {
  try {
    await apiClient.delete(`/buyer-observations/${observationId}`);
  } catch (error) {
    handleApiError(error, buyerObservationErrors.delete);
  }
}
