import type {
  SupplierObservation,
  SupplierObservationFormData,
} from "~/types/supplier-observation";
import { apiClient } from "./api-client";
import { createResourceErrorMessages, handleApiError } from "./error-handlers";
import { createEntityTransform } from "./transform-helpers";
import { buildUpdateDto } from "~/utils/update-dto-builder";

const supplierObservationErrors = createResourceErrorMessages("observação de fornecedor");

/**
 * Transform backend SupplierObservationResponseDto to frontend SupplierObservation type
 */
const transformSupplierObservation = createEntityTransform<
  SupplierObservation & Record<string, unknown>
>({
  dateTimeFields: ["createdAt", "updatedAt"],
}) as unknown as (obs: SupplierObservation) => SupplierObservation;

/**
 * Get all observations for a supplier via API
 */
export async function getSupplierObservationsBySupplierId(
  supplierId: string
): Promise<SupplierObservation[]> {
  if (!supplierId) return [];
  try {
    const observations = await apiClient.get<SupplierObservation[]>(
      `/suppliers/${supplierId}/observations`
    );
    return observations.map(transformSupplierObservation);
  } catch (error) {
    try {
      handleApiError(error, supplierObservationErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get a single supplier observation by ID via API
 */
export async function getSupplierObservationById(
  observationId: string | undefined
): Promise<SupplierObservation | undefined> {
  if (!observationId) return undefined;
  try {
    const observation = await apiClient.get<SupplierObservation>(
      `/supplier-observations/${observationId}`
    );
    return transformSupplierObservation(observation);
  } catch (error) {
    try {
      handleApiError(error, {
        ...supplierObservationErrors.view,
        403: "Você não tem permissão para visualizar esta observação",
      });
    } catch {
      return undefined;
    }
  }
}

/**
 * Create a new supplier observation via API
 */
export async function addSupplierObservation(
  data: SupplierObservationFormData
): Promise<SupplierObservation> {
  try {
    const createDto = {
      observation: data.observation,
      fileIds: data.fileIds,
    };

    const response = await apiClient.post<SupplierObservation>(
      `/suppliers/${data.supplierId}/observations`,
      createDto
    );
    return transformSupplierObservation(response);
  } catch (error) {
    handleApiError(error, supplierObservationErrors.create);
  }
}

/**
 * Update a supplier observation via API
 */
export async function updateSupplierObservation(
  observationId: string,
  data: Partial<SupplierObservationFormData>
): Promise<SupplierObservation> {
  try {
    const updateDto = buildUpdateDto(data, ["observation", "fileIds"]);
    const response = await apiClient.put<SupplierObservation>(
      `/supplier-observations/${observationId}`,
      updateDto
    );
    return transformSupplierObservation(response);
  } catch (error) {
    handleApiError(error, supplierObservationErrors.update);
  }
}

/**
 * Delete a supplier observation via API
 */
export async function deleteSupplierObservation(observationId: string): Promise<void> {
  try {
    await apiClient.delete(`/supplier-observations/${observationId}`);
  } catch (error) {
    handleApiError(error, supplierObservationErrors.delete);
  }
}
