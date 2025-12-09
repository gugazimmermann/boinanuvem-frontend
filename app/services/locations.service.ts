import type { Location, LocationFormData } from "~/types";
import { apiClient, ApiError } from "./api-client";

/**
 * Get all locations for the current user's company via API
 */
export async function getLocations(propertyId?: string): Promise<Location[]> {
  try {
    const params = propertyId ? { propertyId } : undefined;
    return await apiClient.get<Location[]>("/locations", params);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        throw new Error("Você não tem permissão para visualizar localizações");
      }
      if (error.status === 401) {
        throw new Error("Autenticação necessária");
      }
    }
    throw error;
  }
}

/**
 * Get a single location by ID via API
 */
export async function getLocationById(locationId: string): Promise<Location> {
  try {
    return await apiClient.get<Location>(`/locations/${locationId}`);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        throw new Error("Você não tem permissão para visualizar esta localização");
      }
      if (error.status === 404) {
        throw new Error("Localização não encontrada");
      }
      if (error.status === 401) {
        throw new Error("Autenticação necessária");
      }
    }
    throw error;
  }
}

/**
 * Create a new location via API
 */
export async function addLocation(data: LocationFormData): Promise<Location> {
  try {
    const createDto = {
      code: data.code,
      name: data.name,
      locationType: data.locationType,
      area: data.area,
      status: data.status,
      propertyId: data.propertyId,
    };

    const response = await apiClient.post<Location>("/locations", createDto);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        throw new Error("Você não tem permissão para adicionar localizações");
      }
      if (error.status === 404) {
        throw new Error("Propriedade não encontrada");
      }
      if (error.status === 409) {
        throw new Error("Já existe uma localização com este código");
      }
      if (error.status === 400) {
        throw new Error("Dados inválidos. Verifique os campos preenchidos");
      }
    }
    throw error;
  }
}

/**
 * Update a location via API
 */
export async function updateLocation(
  locationId: string,
  data: Partial<LocationFormData>
): Promise<Location> {
  try {
    const updateDto = {
      code: data.code,
      name: data.name,
      locationType: data.locationType,
      area: data.area,
      status: data.status,
      propertyId: data.propertyId,
    };

    const response = await apiClient.put<Location>(`/locations/${locationId}`, updateDto);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        throw new Error("Você não tem permissão para editar localizações");
      }
      if (error.status === 404) {
        throw new Error("Localização não encontrada");
      }
      if (error.status === 409) {
        throw new Error("Já existe uma localização com este código");
      }
      if (error.status === 400) {
        throw new Error("Dados inválidos. Verifique os campos preenchidos");
      }
    }
    throw error;
  }
}

/**
 * Delete a location via API
 */
export async function deleteLocation(locationId: string): Promise<void> {
  try {
    await apiClient.delete(`/locations/${locationId}`);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        throw new Error("Você não tem permissão para excluir localizações");
      }
      if (error.status === 404) {
        throw new Error("Localização não encontrada");
      }
      if (error.status === 401) {
        throw new Error("Autenticação necessária");
      }
    }
    throw error;
  }
}
