import type { Animal, AnimalFormData } from "~/types";
import { apiClient } from "./api-client";
import { handleApiError, createResourceErrorMessages } from "./error-handlers";

const animalErrors = createResourceErrorMessages("animais");

/**
 * Convert backend Date to frontend string format
 */
function transformAnimal(backendAnimal: Animal): Animal {
  let acquisitionDate: string | undefined;
  if (backendAnimal.acquisitionDate) {
    acquisitionDate =
      typeof backendAnimal.acquisitionDate === "string"
        ? backendAnimal.acquisitionDate
        : new Date(backendAnimal.acquisitionDate).toISOString().split("T")[0];
  }

  return {
    ...backendAnimal,
    acquisitionDate,
    createdAt:
      typeof backendAnimal.createdAt === "string"
        ? backendAnimal.createdAt
        : new Date(backendAnimal.createdAt).toISOString(),
  };
}

/**
 * Get all animals for the current user's company via API
 */
export async function getAnimalsByCompanyId(_companyId: string): Promise<Animal[]> {
  try {
    const animals = await apiClient.get<Animal[]>("/animals");
    return animals.map(transformAnimal);
  } catch (error) {
    try {
      handleApiError(error, animalErrors.list);
    } catch {
      return undefined as unknown as Animal[];
    }
  }
}

/**
 * Get a single animal by ID via API
 */
export async function getAnimalById(animalId: string | undefined): Promise<Animal | undefined> {
  if (!animalId) return undefined;
  try {
    const animal = await apiClient.get<Animal>(`/animals/${animalId}`);
    return transformAnimal(animal);
  } catch (error) {
    try {
      handleApiError(error, {
        ...animalErrors.view,
        403: "Você não tem permissão para visualizar este animal",
      });
    } catch {
      return undefined;
    }
  }
}

/**
 * Get animals by property ID via API
 */
export async function getAnimalsByPropertyId(propertyId: string): Promise<Animal[]> {
  try {
    const animals = await apiClient.get<Animal[]>("/animals");
    return animals.filter((animal) => animal.propertyId === propertyId).map(transformAnimal);
  } catch (error) {
    try {
      handleApiError(error, animalErrors.list);
    } catch {
      return undefined as unknown as Animal[];
    }
  }
}

/**
 * Create a new animal via API
 */
export async function addAnimal(data: AnimalFormData): Promise<Animal> {
  try {
    const createDto = {
      code: data.code,
      registrationNumber: data.registrationNumber,
      acquisitionDate: data.acquisitionDate || undefined,
      status: data.status,
      propertyId: data.propertyId,
    };

    const response = await apiClient.post<Animal>("/animals", createDto);
    return transformAnimal(response);
  } catch (error) {
    handleApiError(error, {
      ...animalErrors.create,
      409: "Já existe um animal com este código ou número de registro",
    });
  }
}

/**
 * Update an animal via API
 */
export async function updateAnimal(
  animalId: string,
  data: Partial<AnimalFormData>
): Promise<Animal> {
  try {
    const updateDto: Record<string, unknown> = {};
    if (data.code !== undefined) updateDto.code = data.code;
    if (data.registrationNumber !== undefined)
      updateDto.registrationNumber = data.registrationNumber;
    if (data.acquisitionDate !== undefined)
      updateDto.acquisitionDate = data.acquisitionDate || undefined;
    if (data.status !== undefined) updateDto.status = data.status;
    if (data.propertyId !== undefined) updateDto.propertyId = data.propertyId;

    const response = await apiClient.put<Animal>(`/animals/${animalId}`, updateDto);
    return transformAnimal(response);
  } catch (error) {
    handleApiError(error, {
      ...animalErrors.update,
      409: "Já existe um animal com este código ou número de registro",
    });
  }
}

/**
 * Delete an animal via API
 */
export async function deleteAnimal(animalId: string): Promise<void> {
  try {
    await apiClient.delete(`/animals/${animalId}`);
  } catch (error) {
    handleApiError(error, animalErrors.delete);
  }
}
