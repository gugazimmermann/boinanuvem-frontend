import type {
  ServiceProviderObservation,
  ServiceProviderObservationFormData,
} from "~/types/service-provider-observation";
import { apiClient } from "./api-client";
import { createResourceErrorMessages, handleApiError } from "./error-handlers";
import { createEntityTransform } from "./transform-helpers";
import { buildUpdateDto } from "~/utils/update-dto-builder";

const serviceProviderObservationErrors = createResourceErrorMessages(
  "observação de prestador de serviço"
);

/**
 * Transform backend ServiceProviderObservationResponseDto to frontend ServiceProviderObservation type
 */
const transformServiceProviderObservation = createEntityTransform<
  ServiceProviderObservation & Record<string, unknown>
>({
  dateTimeFields: ["createdAt", "updatedAt"],
}) as unknown as (obs: ServiceProviderObservation) => ServiceProviderObservation;

/**
 * Get all observations for a service provider via API
 */
export async function getServiceProviderObservationsByServiceProviderId(
  serviceProviderId: string
): Promise<ServiceProviderObservation[]> {
  if (!serviceProviderId) return [];
  try {
    const observations = await apiClient.get<ServiceProviderObservation[]>(
      `/service-providers/${serviceProviderId}/observations`
    );
    return observations.map(transformServiceProviderObservation);
  } catch (error) {
    try {
      handleApiError(error, serviceProviderObservationErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get a single service provider observation by ID via API
 */
export async function getServiceProviderObservationById(
  observationId: string | undefined
): Promise<ServiceProviderObservation | undefined> {
  if (!observationId) return undefined;
  try {
    const observation = await apiClient.get<ServiceProviderObservation>(
      `/service-provider-observations/${observationId}`
    );
    return transformServiceProviderObservation(observation);
  } catch (error) {
    try {
      handleApiError(error, {
        ...serviceProviderObservationErrors.view,
        403: "Você não tem permissão para visualizar esta observação",
      });
    } catch {
      return undefined;
    }
  }
}

/**
 * Create a new service provider observation via API
 */
export async function addServiceProviderObservation(
  data: ServiceProviderObservationFormData
): Promise<ServiceProviderObservation> {
  try {
    const createDto = {
      observation: data.observation,
      fileIds: data.fileIds,
    };

    const response = await apiClient.post<ServiceProviderObservation>(
      `/service-providers/${data.serviceProviderId}/observations`,
      createDto
    );
    return transformServiceProviderObservation(response);
  } catch (error) {
    handleApiError(error, serviceProviderObservationErrors.create);
  }
}

/**
 * Update a service provider observation via API
 */
export async function updateServiceProviderObservation(
  observationId: string,
  data: Partial<ServiceProviderObservationFormData>
): Promise<ServiceProviderObservation> {
  try {
    const updateDto = buildUpdateDto(data, ["observation", "fileIds"]);
    const response = await apiClient.put<ServiceProviderObservation>(
      `/service-provider-observations/${observationId}`,
      updateDto
    );
    return transformServiceProviderObservation(response);
  } catch (error) {
    handleApiError(error, serviceProviderObservationErrors.update);
  }
}

/**
 * Delete a service provider observation via API
 */
export async function deleteServiceProviderObservation(observationId: string): Promise<void> {
  try {
    await apiClient.delete(`/service-provider-observations/${observationId}`);
  } catch (error) {
    handleApiError(error, serviceProviderObservationErrors.delete);
  }
}
