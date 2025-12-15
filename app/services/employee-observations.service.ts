import type {
  EmployeeObservation,
  EmployeeObservationFormData,
} from "~/types/employee-observation";
import { apiClient } from "./api-client";
import { createResourceErrorMessages, handleApiError } from "./error-handlers";
import { createEntityTransform } from "./transform-helpers";
import { buildUpdateDto } from "~/utils/update-dto-builder";

const employeeObservationErrors = createResourceErrorMessages("observação de funcionário");

/**
 * Transform backend EmployeeObservationResponseDto to frontend EmployeeObservation type
 */
const transformEmployeeObservation = createEntityTransform<
  EmployeeObservation & Record<string, unknown>
>({
  dateTimeFields: ["createdAt", "updatedAt"],
}) as unknown as (obs: EmployeeObservation) => EmployeeObservation;

/**
 * Get all observations for an employee via API
 */
export async function getEmployeeObservationsByEmployeeId(
  employeeId: string
): Promise<EmployeeObservation[]> {
  if (!employeeId) return [];
  try {
    const observations = await apiClient.get<EmployeeObservation[]>(
      `/employees/${employeeId}/observations`
    );
    return observations.map(transformEmployeeObservation);
  } catch (error) {
    try {
      handleApiError(error, employeeObservationErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get a single employee observation by ID via API
 */
export async function getEmployeeObservationById(
  observationId: string | undefined
): Promise<EmployeeObservation | undefined> {
  if (!observationId) return undefined;
  try {
    const observation = await apiClient.get<EmployeeObservation>(
      `/employee-observations/${observationId}`
    );
    return transformEmployeeObservation(observation);
  } catch (error) {
    try {
      handleApiError(error, {
        ...employeeObservationErrors.view,
        403: "Você não tem permissão para visualizar esta observação",
      });
    } catch {
      return undefined;
    }
  }
}

/**
 * Create a new employee observation via API
 */
export async function addEmployeeObservation(
  data: EmployeeObservationFormData
): Promise<EmployeeObservation> {
  try {
    const createDto = {
      observation: data.observation,
      fileIds: data.fileIds,
    };

    const response = await apiClient.post<EmployeeObservation>(
      `/employees/${data.employeeId}/observations`,
      createDto
    );
    return transformEmployeeObservation(response);
  } catch (error) {
    handleApiError(error, employeeObservationErrors.create);
  }
}

/**
 * Update an employee observation via API
 */
export async function updateEmployeeObservation(
  observationId: string,
  data: Partial<EmployeeObservationFormData>
): Promise<EmployeeObservation> {
  try {
    const updateDto = buildUpdateDto(data, ["observation", "fileIds"]);
    const response = await apiClient.put<EmployeeObservation>(
      `/employee-observations/${observationId}`,
      updateDto
    );
    return transformEmployeeObservation(response);
  } catch (error) {
    handleApiError(error, employeeObservationErrors.update);
  }
}

/**
 * Delete an employee observation via API
 */
export async function deleteEmployeeObservation(observationId: string): Promise<void> {
  try {
    await apiClient.delete(`/employee-observations/${observationId}`);
  } catch (error) {
    handleApiError(error, employeeObservationErrors.delete);
  }
}
