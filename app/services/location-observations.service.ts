import type {
  LocationObservation,
  LocationObservationFormData,
} from "~/types/location-observation";
import { apiClient } from "./api-client";
import { createResourceErrorMessages, handleApiError } from "./error-handlers";
import { createEntityTransform } from "./transform-helpers";
import { buildUpdateDto } from "~/utils/update-dto-builder";

const locationObservationErrors = createResourceErrorMessages("observação de local");

/**
 * Transform backend LocationObservationResponseDto to frontend LocationObservation type
 */
const transformLocationObservation = createEntityTransform<
  LocationObservation & Record<string, unknown>
>({
  dateTimeFields: ["createdAt", "updatedAt"],
}) as unknown as (obs: LocationObservation) => LocationObservation;

/**
 * Get all observations for a location via API
 */
export async function getLocationObservationsByLocationId(
  locationId: string
): Promise<LocationObservation[]> {
  if (!locationId) return [];
  try {
    const observations = await apiClient.get<LocationObservation[]>(
      `/locations/${locationId}/observations`
    );
    return observations.map(transformLocationObservation);
  } catch (error) {
    try {
      handleApiError(error, locationObservationErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get a single location observation by ID via API
 */
export async function getLocationObservationById(
  observationId: string | undefined
): Promise<LocationObservation | undefined> {
  if (!observationId) return undefined;
  try {
    const observation = await apiClient.get<LocationObservation>(
      `/location-observations/${observationId}`
    );
    return transformLocationObservation(observation);
  } catch (error) {
    try {
      handleApiError(error, {
        ...locationObservationErrors.view,
        403: "Você não tem permissão para visualizar esta observação",
      });
    } catch {
      return undefined;
    }
  }
}

/**
 * Create a new location observation via API
 */
export async function addLocationObservation(
  data: LocationObservationFormData
): Promise<LocationObservation> {
  try {
    const createDto = {
      observation: data.observation,
      fileIds: data.fileIds,
    };

    const response = await apiClient.post<LocationObservation>(
      `/locations/${data.locationId}/observations`,
      createDto
    );
    return transformLocationObservation(response);
  } catch (error) {
    handleApiError(error, locationObservationErrors.create);
  }
}

/**
 * Update a location observation via API
 */
export async function updateLocationObservation(
  observationId: string,
  data: Partial<LocationObservationFormData>
): Promise<LocationObservation> {
  try {
    const updateDto = buildUpdateDto(data, ["observation", "fileIds"]);
    const response = await apiClient.put<LocationObservation>(
      `/location-observations/${observationId}`,
      updateDto
    );
    return transformLocationObservation(response);
  } catch (error) {
    handleApiError(error, locationObservationErrors.update);
  }
}

/**
 * Delete a location observation via API
 */
export async function deleteLocationObservation(observationId: string): Promise<void> {
  try {
    await apiClient.delete(`/location-observations/${observationId}`);
  } catch (error) {
    handleApiError(error, locationObservationErrors.delete);
  }
}
