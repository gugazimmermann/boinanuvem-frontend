import type { AnimalObservation, AnimalObservationFormData } from "~/types/animal-observation";
import { apiClient } from "./api-client";
import { createResourceErrorMessages, handleApiError } from "./error-handlers";
import { createEntityTransform } from "./transform-helpers";
import { buildUpdateDto } from "~/utils/update-dto-builder";

const animalObservationErrors = createResourceErrorMessages("observação de animal");

/**
 * Transform backend AnimalObservationResponseDto to frontend AnimalObservation type
 */
const transformAnimalObservation = createEntityTransform<
  AnimalObservation & Record<string, unknown>
>({
  dateTimeFields: ["createdAt", "updatedAt"],
}) as unknown as (obs: AnimalObservation) => AnimalObservation;

/**
 * Get all observations for an animal via API
 */
export async function getAnimalObservationsByAnimalId(
  animalId: string
): Promise<AnimalObservation[]> {
  if (!animalId) return [];
  try {
    const observations = await apiClient.get<AnimalObservation[]>(
      `/animals/${animalId}/observations`
    );
    return observations.map(transformAnimalObservation);
  } catch (error) {
    try {
      handleApiError(error, animalObservationErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get a single animal observation by ID via API
 */
export async function getAnimalObservationById(
  observationId: string | undefined
): Promise<AnimalObservation | undefined> {
  if (!observationId) return undefined;
  try {
    const observation = await apiClient.get<AnimalObservation>(
      `/animal-observations/${observationId}`
    );
    return transformAnimalObservation(observation);
  } catch (error) {
    try {
      handleApiError(error, {
        ...animalObservationErrors.view,
        403: "Você não tem permissão para visualizar esta observação",
      });
    } catch {
      return undefined;
    }
  }
}

/**
 * Create a new animal observation via API
 */
export async function addAnimalObservation(
  data: AnimalObservationFormData
): Promise<AnimalObservation> {
  try {
    const createDto = {
      observation: data.observation,
      fileIds: data.fileIds,
    };

    const response = await apiClient.post<AnimalObservation>(
      `/animals/${data.animalId}/observations`,
      createDto
    );
    return transformAnimalObservation(response);
  } catch (error) {
    handleApiError(error, animalObservationErrors.create);
  }
}

/**
 * Update an animal observation via API
 */
export async function updateAnimalObservation(
  observationId: string,
  data: Partial<AnimalObservationFormData>
): Promise<AnimalObservation> {
  try {
    const updateDto = buildUpdateDto(data, ["observation", "fileIds"]);
    const response = await apiClient.put<AnimalObservation>(
      `/animal-observations/${observationId}`,
      updateDto
    );
    return transformAnimalObservation(response);
  } catch (error) {
    handleApiError(error, animalObservationErrors.update);
  }
}

/**
 * Delete an animal observation via API
 */
export async function deleteAnimalObservation(observationId: string): Promise<void> {
  try {
    await apiClient.delete(`/animal-observations/${observationId}`);
  } catch (error) {
    handleApiError(error, animalObservationErrors.delete);
  }
}
