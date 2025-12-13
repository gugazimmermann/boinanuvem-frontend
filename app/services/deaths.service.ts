import type { Death, DeathFormData } from "~/types";
import { apiClient } from "./api-client";
import { handleApiError, createResourceErrorMessages } from "./error-handlers";
import { safeDateToString, safeDateToDateString } from "~/utils/date-transforms";
import { buildUpdateDto } from "~/utils/update-dto-builder";

const deathsErrors = createResourceErrorMessages("óbitos");

interface DeathResponse {
  id: string;
  animalId: string;
  deathDate: string | Date;
  cause: string;
  observation?: string;
  companyId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Transform backend DeathResponseDto to frontend Death type
 */
function transformDeath(backendDeath: DeathResponse): Death {
  const dateValue =
    typeof backendDeath.deathDate === "string"
      ? backendDeath.deathDate.split("T")[0]
      : safeDateToDateString(backendDeath.deathDate);

  return {
    id: backendDeath.id,
    animalId: backendDeath.animalId,
    date: dateValue || new Date().toISOString().split("T")[0],
    cause: backendDeath.cause,
    observation: backendDeath.observation,
    companyId: backendDeath.companyId,
    createdAt: safeDateToString(backendDeath.createdAt) || new Date().toISOString(),
  };
}

/**
 * Transform DeathFormData to CreateDeathDto format
 */
function transformDeathFormDataToDto(data: DeathFormData) {
  return {
    animalId: data.animalId,
    date: data.date,
    cause: data.cause,
    observation: data.observation,
  };
}

/**
 * Get all deaths for the current user's company via API
 */
export async function getDeathsByCompanyId(_companyId?: string): Promise<Death[]> {
  try {
    const deaths = await apiClient.get<DeathResponse[]>("/deaths");
    return deaths.map(transformDeath);
  } catch (error) {
    try {
      handleApiError(error, deathsErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Get a single death by ID via API
 */
export async function getDeathById(deathId: string | undefined): Promise<Death | undefined> {
  if (!deathId) return undefined;
  try {
    const death = await apiClient.get<DeathResponse>(`/deaths/${deathId}`);
    return transformDeath(death);
  } catch (error) {
    try {
      handleApiError(error, {
        ...deathsErrors.view,
        403: "Você não tem permissão para visualizar este óbito",
      });
    } catch {
      return undefined;
    }
  }
}

/**
 * Get death by animal ID via API
 */
export async function getDeathByAnimalId(animalId: string): Promise<Death | undefined> {
  if (!animalId) return undefined;
  try {
    const death = await apiClient.get<DeathResponse>(`/deaths/animal/${animalId}`);
    return transformDeath(death);
  } catch (error) {
    try {
      handleApiError(error, {
        ...deathsErrors.view,
        404: "Óbito não encontrado para este animal",
      });
    } catch {
      return undefined;
    }
  }
}

/**
 * Create a new death via API
 */
export async function addDeath(data: DeathFormData): Promise<Death> {
  try {
    const createDto = transformDeathFormDataToDto(data);
    const death = await apiClient.post<DeathResponse>("/deaths", createDto);
    return transformDeath(death);
  } catch (error) {
    handleApiError(error, {
      ...deathsErrors.create,
      409: "Este animal já possui um registro de óbito",
      400: "Dados inválidos. Verifique os campos preenchidos",
    });
  }
}

/**
 * Update an existing death via API
 */
export async function updateDeath(deathId: string, data: Partial<DeathFormData>): Promise<boolean> {
  try {
    const updateDto = buildUpdateDto(data, ["animalId", "date", "cause", "observation"]);

    await apiClient.put<DeathResponse>(`/deaths/${deathId}`, updateDto);
    return true;
  } catch (error) {
    handleApiError(error, {
      ...deathsErrors.update,
      400: "Dados inválidos. Verifique os campos preenchidos",
    });
  }
}

/**
 * Delete a death via API
 */
export async function deleteDeath(deathId: string): Promise<boolean> {
  try {
    await apiClient.delete(`/deaths/${deathId}`);
    return true;
  } catch (error) {
    handleApiError(error, deathsErrors.delete);
  }
}
