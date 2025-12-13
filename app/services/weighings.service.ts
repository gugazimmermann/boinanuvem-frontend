import type { Weighing, WeighingFormData } from "~/types";
import { apiClient } from "./api-client";
import { handleApiError, createResourceErrorMessages } from "./error-handlers";
import { safeDateToString, safeDateToDateString } from "~/utils/date-transforms";
import { createListHandler, createGetByIdHandler, createCrudHandlers } from "./service-helpers";

const weighingsErrors = createResourceErrorMessages("pesagens");

interface WeighingResponse {
  id: string;
  animalId: string;
  weighingDate: string | Date;
  weight: number;
  employeeIds: string[];
  serviceProviderIds?: string[];
  appliedMedicines?: Array<{
    itemId: string;
    quantity: number;
    calculatedDosage: number;
  }>;
  observation?: string;
  companyId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Transform backend WeighingResponseDto to frontend Weighing type
 */
function transformWeighing(backendWeighing: WeighingResponse): Weighing {
  const dateValue =
    typeof backendWeighing.weighingDate === "string"
      ? backendWeighing.weighingDate.split("T")[0]
      : safeDateToDateString(backendWeighing.weighingDate);

  return {
    id: backendWeighing.id,
    animalId: backendWeighing.animalId,
    date: dateValue || new Date().toISOString().split("T")[0],
    weight:
      typeof backendWeighing.weight === "number"
        ? backendWeighing.weight
        : Number.parseFloat(String(backendWeighing.weight)),
    employeeIds: backendWeighing.employeeIds || [],
    serviceProviderIds: backendWeighing.serviceProviderIds || [],
    appliedMedicines: backendWeighing.appliedMedicines,
    observation: backendWeighing.observation,
    companyId: backendWeighing.companyId,
    createdAt: safeDateToString(backendWeighing.createdAt) || new Date().toISOString(),
  };
}

/**
 * Transform WeighingFormData to CreateWeighingDto format
 */
function transformWeighingFormDataToDto(data: WeighingFormData) {
  return {
    animalId: data.animalId,
    date: data.date,
    weight: data.weight,
    employeeIds: data.employeeIds,
    serviceProviderIds: data.serviceProviderIds || [],
    appliedMedicines: data.appliedMedicines,
    observation: data.observation,
  };
}

/**
 * Get all weighings for the current user's company via API
 */
export const getWeighingsByCompanyId = createListHandler<WeighingResponse, Weighing>({
  endpoint: "/weighings",
  errorMessages: weighingsErrors.list,
  transform: transformWeighing,
});

/**
 * Get a single weighing by ID via API
 */
export const getWeighingById = createGetByIdHandler<WeighingResponse, Weighing>({
  endpoint: "/weighings",
  errorMessages: weighingsErrors.view,
  transform: transformWeighing,
  custom403Message: "Você não tem permissão para visualizar esta pesagem",
});

/**
 * Get weighings by animal ID via API
 */
export async function getWeighingsByAnimalId(animalId: string): Promise<Weighing[]> {
  if (!animalId) return [];
  try {
    const weighings = await apiClient.get<WeighingResponse[]>(`/weighings/animal/${animalId}`);
    return weighings.map(transformWeighing);
  } catch (error) {
    try {
      handleApiError(error, weighingsErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get weighings by multiple animal IDs
 */
export async function getWeighingsByAnimalIds(
  animalIds: string[]
): Promise<Map<string, Weighing[]>> {
  const weighingsMap = new Map<string, Weighing[]>();

  // Initialize map with empty arrays
  for (const id of animalIds) {
    weighingsMap.set(id, []);
  }

  try {
    // Get all weighings and filter by animal IDs
    const allWeighings = await apiClient.get<WeighingResponse[]>("/weighings");
    const animalIdSet = new Set(animalIds);

    for (const weighing of allWeighings) {
      if (animalIdSet.has(weighing.animalId)) {
        const existing = weighingsMap.get(weighing.animalId) || [];
        existing.push(transformWeighing(weighing));
        weighingsMap.set(weighing.animalId, existing);
      }
    }
  } catch (error) {
    try {
      handleApiError(error, weighingsErrors.list);
    } catch {
      // Return empty map on error
    }
  }

  return weighingsMap;
}

const weighingsCrud = createCrudHandlers<WeighingResponse, Weighing, WeighingFormData>({
  endpoint: "/weighings",
  errorMessages: {
    create: {
      ...weighingsErrors.create,
      400: "Dados inválidos. Verifique os campos preenchidos",
    },
    update: {
      ...weighingsErrors.update,
      400: "Dados inválidos. Verifique os campos preenchidos",
    },
    delete: weighingsErrors.delete,
  },
  transform: transformWeighing,
  buildCreateDto: transformWeighingFormDataToDto,
  buildUpdateDto: (data) => {
    const updateDto: Partial<ReturnType<typeof transformWeighingFormDataToDto>> = {};
    if (data.animalId !== undefined) updateDto.animalId = data.animalId;
    if (data.date !== undefined) updateDto.date = data.date;
    if (data.weight !== undefined) updateDto.weight = data.weight;
    if (data.employeeIds !== undefined) updateDto.employeeIds = data.employeeIds;
    if (data.serviceProviderIds !== undefined)
      updateDto.serviceProviderIds = data.serviceProviderIds;
    if (data.appliedMedicines !== undefined) updateDto.appliedMedicines = data.appliedMedicines;
    if (data.observation !== undefined) updateDto.observation = data.observation;
    return updateDto;
  },
});

/**
 * Create a new weighing via API
 */
export async function addWeighing(data: WeighingFormData): Promise<Weighing> {
  return weighingsCrud.add(data);
}

/**
 * Update an existing weighing via API
 */
export async function updateWeighing(
  weighingId: string,
  data: Partial<WeighingFormData>
): Promise<boolean> {
  await weighingsCrud.update(weighingId, data);
  return true;
}

/**
 * Delete a weighing via API
 */
export async function deleteWeighing(weighingId: string): Promise<boolean> {
  await weighingsCrud.remove(weighingId);
  return true;
}
