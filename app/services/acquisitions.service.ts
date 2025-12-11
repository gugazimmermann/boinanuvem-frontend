import type { Acquisition, AcquisitionFormData, AcquisitionItem } from "~/types";
import { apiClient } from "./api-client";
import { handleApiError, createResourceErrorMessages } from "./error-handlers";
import { getTotalFees } from "~/utils/fees";

const acquisitionErrors = createResourceErrorMessages("aquisições");

const ARROBA_KG = 30;
const ID_PREFIX = "ac0e8400-e29b-41d4-a716";

/**
 * Generate acquisition ID based on index
 */
export function generateAcquisitionId(index: number): string {
  const base = 446655440100 + index;
  return `${ID_PREFIX}-${base.toString().padStart(12, "0")}`;
}

/**
 * Calculate cost per arroba
 */
export function calculateAcquisitionCostPerArroba(
  weightInKg: number,
  costPerAnimal: number
): number {
  if (weightInKg <= 0) return 0;
  const arrobas = weightInKg / ARROBA_KG;
  return arrobas > 0 ? costPerAnimal / arrobas : 0;
}

/**
 * Convert backend Date to frontend string format
 */
function transformAcquisition(backendAcquisition: Acquisition): Acquisition {
  const result: Acquisition = {
    ...backendAcquisition,
    acquisitionDate:
      typeof backendAcquisition.acquisitionDate === "string"
        ? backendAcquisition.acquisitionDate
        : new Date(backendAcquisition.acquisitionDate).toISOString().split("T")[0],
  };

  // Handle createdAt - it might be missing or invalid
  if (backendAcquisition.createdAt) {
    if (typeof backendAcquisition.createdAt === "string") {
      result.createdAt = backendAcquisition.createdAt;
    } else {
      const date = new Date(backendAcquisition.createdAt);
      if (!Number.isNaN(date.getTime())) {
        result.createdAt = date.toISOString();
      }
    }
  }

  return result;
}

/**
 * Get all acquisitions for the current user's company via API
 */
export async function getAcquisitionsByCompanyId(_companyId: string): Promise<Acquisition[]> {
  try {
    const acquisitions = await apiClient.get<Acquisition[]>("/acquisitions");
    return acquisitions.map(transformAcquisition);
  } catch (error) {
    handleApiError(error, acquisitionErrors.list);
  }
}

/**
 * Get a single acquisition by ID via API
 */
export async function getAcquisitionById(
  acquisitionId: string | undefined
): Promise<Acquisition | undefined> {
  if (!acquisitionId) return undefined;
  try {
    const acquisition = await apiClient.get<Acquisition>(`/acquisitions/${acquisitionId}`);
    return transformAcquisition(acquisition);
  } catch (error) {
    handleApiError(error, {
      ...acquisitionErrors.view,
      403: "Você não tem permissão para visualizar esta aquisição",
    });
  }
}

/**
 * Get acquisition by animal ID via API
 */
export async function getAcquisitionByAnimalId(animalId: string): Promise<Acquisition | undefined> {
  if (!animalId) return undefined;
  try {
    const acquisitions = await apiClient.get<Acquisition[]>("/acquisitions");
    const acquisition = acquisitions.find((acq) =>
      acq.acquisitionItems.some((item) => item.animalId === animalId)
    );
    return acquisition ? transformAcquisition(acquisition) : undefined;
  } catch (error) {
    handleApiError(error, acquisitionErrors.list);
  }
}

/**
 * Get acquisitions by supplier ID via API
 */
export async function getAcquisitionsBySupplierId(supplierId: string): Promise<Acquisition[]> {
  try {
    const acquisitions = await apiClient.get<Acquisition[]>("/acquisitions");
    return acquisitions.filter((acq) => acq.supplierId === supplierId).map(transformAcquisition);
  } catch (error) {
    handleApiError(error, acquisitionErrors.list);
  }
}

/**
 * Get acquisitions by date range via API
 */
export async function getAcquisitionsByDateRange(
  companyId: string,
  startDate: string,
  endDate: string
): Promise<Acquisition[]> {
  try {
    const acquisitions = await getAcquisitionsByCompanyId(companyId);
    return acquisitions.filter((acquisition) => {
      const acquisitionDate = new Date(acquisition.acquisitionDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return acquisitionDate >= start && acquisitionDate <= end;
    });
  } catch (error) {
    handleApiError(error, acquisitionErrors.list);
  }
}

/**
 * Create a new acquisition via API (backend creates animals automatically for items with code/registrationNumber)
 */
export async function addAcquisition(
  data: AcquisitionFormData & {
    acquisitionItems: Array<AcquisitionItem & { code?: string; registrationNumber?: string }>;
  }
): Promise<Acquisition> {
  try {
    const _totalFees = getTotalFees(data.fees, data.transportationFee, undefined, data.handlingFee);

    // Map acquisition items to backend DTO format
    const acquisitionItems = data.acquisitionItems.map((item) => {
      const itemDto: Record<string, unknown> = {
        price: item.price,
        weight: item.weight,
      };

      // If animalId exists, use it; otherwise use code/registrationNumber (backend will create animal)
      if (item.animalId && item.animalId !== "") {
        itemDto.animalId = item.animalId;
      } else if (
        "code" in item &&
        "registrationNumber" in item &&
        item.code &&
        item.registrationNumber
      ) {
        itemDto.code = item.code;
        itemDto.registrationNumber = item.registrationNumber;
      }

      // Add optional fields
      if (item.breed) itemDto.breed = item.breed;
      if (item.gender) itemDto.gender = item.gender;
      if (item.birthDate) itemDto.birthDate = item.birthDate;
      if (item.motherId) itemDto.motherId = item.motherId;
      if (item.fatherId) itemDto.fatherId = item.fatherId;
      if (item.motherRegistrationNumber)
        itemDto.motherRegistrationNumber = item.motherRegistrationNumber;
      if (item.fatherRegistrationNumber)
        itemDto.fatherRegistrationNumber = item.fatherRegistrationNumber;
      if (item.purity) itemDto.purity = item.purity;
      if (item.birthObservation) itemDto.birthObservation = item.birthObservation;

      return itemDto;
    });

    const createDto = {
      propertyId: data.propertyId,
      supplierId: data.supplierId,
      acquisitionDate: data.acquisitionDate,
      pricingMode: data.pricingMode,
      paymentMethod: data.paymentMethod,
      totalPrice: data.totalPrice,
      fees: data.fees && data.fees.length > 0 ? data.fees : undefined,
      transportationFee: data.transportationFee || undefined,
      handlingFee: data.handlingFee || undefined,
      acquisitionItems,
      observation: data.observation || undefined,
    };

    const response = await apiClient.post<Acquisition>("/acquisitions", createDto);
    return transformAcquisition(response);
  } catch (error) {
    handleApiError(error, {
      ...acquisitionErrors.create,
      409: "Já existe uma aquisição com este identificador",
    });
  }
}

/**
 * Update an acquisition via API
 */
export async function updateAcquisition(
  acquisitionId: string,
  data: Partial<
    AcquisitionFormData & {
      acquisitionItems?: Array<AcquisitionItem & { code?: string; registrationNumber?: string }>;
    }
  >
): Promise<Acquisition> {
  try {
    const updateDto: Record<string, unknown> = {};

    if (data.propertyId !== undefined) updateDto.propertyId = data.propertyId;
    if (data.supplierId !== undefined) updateDto.supplierId = data.supplierId;
    if (data.acquisitionDate !== undefined) updateDto.acquisitionDate = data.acquisitionDate;
    if (data.pricingMode !== undefined) updateDto.pricingMode = data.pricingMode;
    if (data.paymentMethod !== undefined) updateDto.paymentMethod = data.paymentMethod;
    if (data.totalPrice !== undefined) updateDto.totalPrice = data.totalPrice;
    if (data.fees !== undefined)
      updateDto.fees = data.fees && data.fees.length > 0 ? data.fees : undefined;
    if (data.transportationFee !== undefined)
      updateDto.transportationFee = data.transportationFee || undefined;
    if (data.handlingFee !== undefined) updateDto.handlingFee = data.handlingFee || undefined;
    if (data.observation !== undefined) updateDto.observation = data.observation || undefined;

    // Map acquisition items if provided
    if (data.acquisitionItems !== undefined) {
      updateDto.acquisitionItems = data.acquisitionItems.map((item) => {
        const itemDto: Record<string, unknown> = {
          price: item.price,
          weight: item.weight,
        };

        // If animalId exists, use it; otherwise use code/registrationNumber
        if (item.animalId && item.animalId !== "") {
          itemDto.animalId = item.animalId;
        } else if (
          "code" in item &&
          "registrationNumber" in item &&
          item.code &&
          item.registrationNumber
        ) {
          itemDto.code = item.code;
          itemDto.registrationNumber = item.registrationNumber;
        }

        // Add optional fields
        if (item.breed) itemDto.breed = item.breed;
        if (item.gender) itemDto.gender = item.gender;
        if (item.birthDate) itemDto.birthDate = item.birthDate;
        if (item.motherId) itemDto.motherId = item.motherId;
        if (item.fatherId) itemDto.fatherId = item.fatherId;
        if (item.motherRegistrationNumber)
          itemDto.motherRegistrationNumber = item.motherRegistrationNumber;
        if (item.fatherRegistrationNumber)
          itemDto.fatherRegistrationNumber = item.fatherRegistrationNumber;
        if (item.purity) itemDto.purity = item.purity;
        if (item.birthObservation) itemDto.birthObservation = item.birthObservation;

        return itemDto;
      });
    }

    const response = await apiClient.put<Acquisition>(`/acquisitions/${acquisitionId}`, updateDto);
    return transformAcquisition(response);
  } catch (error) {
    handleApiError(error, {
      ...acquisitionErrors.update,
      409: "Já existe uma aquisição com este identificador",
    });
  }
}

/**
 * Delete an acquisition via API
 */
export async function deleteAcquisition(acquisitionId: string): Promise<void> {
  try {
    await apiClient.delete(`/acquisitions/${acquisitionId}`);
  } catch (error) {
    handleApiError(error, acquisitionErrors.delete);
  }
}
