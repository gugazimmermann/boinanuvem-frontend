import type { Property, PropertyFormData } from "~/types";
import { apiClient } from "./api-client";
import { unmaskCEP } from "~/components/site/utils/masks";
import { handleApiError, createResourceErrorMessages } from "./error-handlers";

const propertyErrors = createResourceErrorMessages("propriedades");

/**
 * Get all properties for the current user's company via API
 */
export async function getProperties(): Promise<Property[]> {
  try {
    return await apiClient.get<Property[]>("/properties");
  } catch (error) {
    handleApiError(error, propertyErrors.list);
  }
}

/**
 * Get a single property by ID via API
 */
export async function getPropertyById(propertyId: string): Promise<Property> {
  try {
    return await apiClient.get<Property>(`/properties/${propertyId}`);
  } catch (error) {
    handleApiError(error, {
      ...propertyErrors.view,
      403: "Você não tem permissão para visualizar esta propriedade",
    });
  }
}

/**
 * Create a new property via API
 */
export async function addProperty(data: PropertyFormData): Promise<Property> {
  try {
    const createDto = {
      code: data.code,
      name: data.name,
      area: data.area,
      status: data.status,
      street: data.street,
      number: data.number,
      complement: data.complement || undefined,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state ? data.state.toUpperCase() : undefined,
      zipCode: data.zipCode ? unmaskCEP(data.zipCode) : undefined,
      pasturePlanning: data.pasturePlanning,
      breedingMonths: data.breedingMonths,
      pasturePlanningModifiedByUser: data.pasturePlanningModifiedByUser,
      breedingSeasonModifiedByUser: data.breedingSeasonModifiedByUser,
    };

    const response = await apiClient.post<Property>("/properties", createDto);
    return response;
  } catch (error) {
    handleApiError(error, {
      ...propertyErrors.create,
      409: "Já existe uma propriedade com este código",
    });
  }
}

/**
 * Update a property via API
 */
export async function updateProperty(
  propertyId: string,
  data: Partial<PropertyFormData>
): Promise<Property> {
  try {
    const updateDto = {
      code: data.code,
      name: data.name,
      area: data.area,
      status: data.status,
      street: data.street,
      number: data.number,
      complement: data.complement || undefined,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state ? data.state.toUpperCase() : undefined,
      zipCode: data.zipCode ? unmaskCEP(data.zipCode) : undefined,
      pasturePlanning: data.pasturePlanning,
      breedingMonths: data.breedingMonths,
      pasturePlanningModifiedByUser: data.pasturePlanningModifiedByUser,
      breedingSeasonModifiedByUser: data.breedingSeasonModifiedByUser,
    };

    const response = await apiClient.put<Property>(`/properties/${propertyId}`, updateDto);
    return response;
  } catch (error) {
    handleApiError(error, {
      ...propertyErrors.update,
      409: "Já existe uma propriedade com este código",
    });
  }
}

/**
 * Delete a property via API
 */
export async function deleteProperty(propertyId: string): Promise<void> {
  try {
    await apiClient.delete(`/properties/${propertyId}`);
  } catch (error) {
    handleApiError(error, propertyErrors.delete);
  }
}
