import type { SanitaryControl, SanitaryControlFormData } from "~/types/sanitary-control";
import { apiClient } from "./api-client";
import { handleApiError, createResourceErrorMessages } from "./error-handlers";
import { safeDateToString, safeDateToDateString } from "~/utils/date-transforms";
import { createListHandler, createGetByIdHandler, createCrudHandlers } from "./service-helpers";

const sanitaryControlsErrors = createResourceErrorMessages("controles sanitários");

/**
 * Transform backend SanitaryControlResponseDto to frontend SanitaryControl type
 */
function transformSanitaryControl(backendControl: Record<string, unknown>): SanitaryControl {
  // Backend may return appliedMedicines array (preferred) or flat structure (legacy)
  // Frontend always expects appliedMedicines array
  let appliedMedicines: Array<{
    itemId: string;
    quantity: number;
    calculatedDosage: number;
  }> = [];

  if (Array.isArray(backendControl.appliedMedicines)) {
    // New structure: array already exists
    appliedMedicines = (backendControl.appliedMedicines as Array<Record<string, unknown>>).map(
      (med) => ({
        itemId: med.itemId as string,
        quantity: (med.quantity as number) || 0,
        calculatedDosage: (med.calculatedDosage as number) || 0,
      })
    );
  } else if (backendControl.itemId && backendControl.quantity !== undefined) {
    // Legacy structure: flat itemId, quantity, calculatedDosage
    appliedMedicines = [
      {
        itemId: backendControl.itemId as string,
        quantity: backendControl.quantity as number,
        calculatedDosage: (backendControl.calculatedDosage as number) || 0,
      },
    ];
  }

  return {
    id: backendControl.id as string,
    animalId: backendControl.animalId as string,
    date: safeDateToDateString(backendControl.date) || new Date().toISOString().split("T")[0],
    appliedMedicines,
    employeeIds: (backendControl.employeeIds as string[]) || [],
    serviceProviderIds: (backendControl.serviceProviderIds as string[]) || [],
    observation: backendControl.observation as string | undefined,
    companyId: backendControl.companyId as string,
    createdAt: safeDateToString(backendControl.createdAt) || new Date().toISOString(),
  };
}

/**
 * Get all sanitary controls for the current user's company via API
 */
export const getSanitaryControlsByCompanyId = createListHandler<SanitaryControl>({
  endpoint: "/sanitary-controls",
  errorMessages: sanitaryControlsErrors.list,
  transform: transformSanitaryControl,
});

/**
 * Get a single sanitary control by ID via API
 */
export const getSanitaryControlById = createGetByIdHandler<SanitaryControl>({
  endpoint: "/sanitary-controls",
  errorMessages: sanitaryControlsErrors.view,
  transform: transformSanitaryControl,
  custom403Message: "Você não tem permissão para visualizar este controle sanitário",
});

/**
 * Get sanitary controls by animal ID via API
 */
export async function getSanitaryControlsByAnimalId(animalId: string): Promise<SanitaryControl[]> {
  try {
    const controls = await apiClient.get<SanitaryControl[]>(
      `/sanitary-controls/animal/${animalId}`
    );
    return controls.map(transformSanitaryControl);
  } catch (error) {
    try {
      handleApiError(error, sanitaryControlsErrors.list);
    } catch {
      return [];
    }
  }
}

const sanitaryControlsCrud = createCrudHandlers<
  SanitaryControl,
  SanitaryControl,
  SanitaryControlFormData
>({
  endpoint: "/sanitary-controls",
  errorMessages: {
    create: sanitaryControlsErrors.create,
    update: sanitaryControlsErrors.update,
    delete: sanitaryControlsErrors.delete,
  },
  transform: transformSanitaryControl,
  buildCreateDto: (data) => {
    // Backend supports appliedMedicines array (preferred) or legacy single itemId/quantity/calculatedDosage
    // Send appliedMedicines array if available, otherwise use legacy fields
    const dto: Record<string, unknown> = {
      animalId: data.animalId,
      date: data.date,
      employeeIds: data.employeeIds,
      serviceProviderIds: data.serviceProviderIds,
      observation: data.observation,
    };

    if (data.appliedMedicines && data.appliedMedicines.length > 0) {
      // Use new structure with array
      dto.appliedMedicines = data.appliedMedicines.map((med) => ({
        itemId: med.itemId,
        quantity: med.quantity,
        calculatedDosage: med.calculatedDosage,
      }));
    } else {
      // Fallback to legacy structure if no medicines provided
      const firstMedicine = data.appliedMedicines?.[0];
      if (firstMedicine) {
        dto.itemId = firstMedicine.itemId;
        dto.quantity = firstMedicine.quantity;
        dto.calculatedDosage = firstMedicine.calculatedDosage;
      }
    }

    return dto;
  },
  buildUpdateDto: (data) => {
    const updateDto: Record<string, unknown> = {};

    if (data.animalId !== undefined) updateDto.animalId = data.animalId;
    if (data.date !== undefined) updateDto.date = data.date;
    if (data.employeeIds !== undefined) updateDto.employeeIds = data.employeeIds;
    if (data.serviceProviderIds !== undefined)
      updateDto.serviceProviderIds = data.serviceProviderIds;
    if (data.observation !== undefined) updateDto.observation = data.observation;

    // Handle appliedMedicines array if provided
    if (data.appliedMedicines !== undefined) {
      if (data.appliedMedicines.length > 0) {
        // Use new structure with array
        updateDto.appliedMedicines = data.appliedMedicines.map((med) => ({
          itemId: med.itemId,
          quantity: med.quantity,
          calculatedDosage: med.calculatedDosage,
        }));
      } else {
        // Empty array - clear medicines
        updateDto.appliedMedicines = [];
      }
    }

    return updateDto;
  },
});

/**
 * Create a new sanitary control via API
 */
export const addSanitaryControl = sanitaryControlsCrud.add;

/**
 * Update a sanitary control via API
 */
export const updateSanitaryControl = sanitaryControlsCrud.update;

/**
 * Delete a sanitary control via API
 */
export const deleteSanitaryControl = sanitaryControlsCrud.remove;

// Legacy aliases for medicine administration
export const getMedicineAdministrationById = getSanitaryControlById;
export const getMedicineAdministrationsByAnimalId = getSanitaryControlsByAnimalId;
export const getMedicineAdministrationsByCompanyId = getSanitaryControlsByCompanyId;
export const addMedicineAdministration = addSanitaryControl;
export const updateMedicineAdministration = updateSanitaryControl;
export const deleteMedicineAdministration = deleteSanitaryControl;
