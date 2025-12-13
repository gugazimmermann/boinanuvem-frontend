import type { Acquisition, AcquisitionFormData, AcquisitionItem } from "~/types";
import { apiClient } from "./api-client";
import { handleApiError, createResourceErrorMessages } from "./error-handlers";
import { getTotalFees } from "~/utils/fees";
import { buildUpdateDto } from "~/utils/update-dto-builder";
import {
  createListHandler,
  createGetByIdHandler,
  createGetByFilterHandler,
  createDateRangeFilter,
  createCrudHandlers,
} from "./service-helpers";
import { createEntityTransform } from "./transform-helpers";

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
const transformAcquisition = createEntityTransform<Acquisition>({
  dateStringFields: ["acquisitionDate"],
  dateTimeFields: ["createdAt"],
});

/**
 * Map acquisition item to DTO format (extracted to avoid duplication)
 */
function mapAcquisitionItemToDto(
  item: AcquisitionItem & { code?: string; registrationNumber?: string }
): Record<string, unknown> {
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
}

/**
 * Get all acquisitions for the current user's company via API
 */
export const getAcquisitionsByCompanyId = createListHandler<Acquisition>({
  endpoint: "/acquisitions",
  errorMessages: acquisitionErrors.list,
  transform: transformAcquisition,
});

/**
 * Get a single acquisition by ID via API
 */
export const getAcquisitionById = createGetByIdHandler<Acquisition>({
  endpoint: "/acquisitions",
  errorMessages: acquisitionErrors.view,
  transform: transformAcquisition,
  custom403Message: "Você não tem permissão para visualizar esta aquisição",
});

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
export const getAcquisitionsBySupplierId = createGetByFilterHandler<Acquisition>({
  endpoint: "/acquisitions",
  errorMessages: acquisitionErrors.list,
  transform: transformAcquisition,
  filterFn: (acq, supplierId) => acq.supplierId === supplierId,
});

/**
 * Get acquisitions by date range via API
 */
export const getAcquisitionsByDateRange = createDateRangeFilter<Acquisition>({
  endpoint: "/acquisitions",
  errorMessages: acquisitionErrors.list,
  transform: transformAcquisition,
  dateField: "acquisitionDate",
});

type AcquisitionFormDataWithItems = AcquisitionFormData & {
  acquisitionItems: Array<AcquisitionItem & { code?: string; registrationNumber?: string }>;
};

const acquisitionCrud = createCrudHandlers<Acquisition, Acquisition, AcquisitionFormDataWithItems>({
  endpoint: "/acquisitions",
  errorMessages: {
    create: {
      ...acquisitionErrors.create,
      409: "Já existe uma aquisição com este identificador",
    },
    update: {
      ...acquisitionErrors.update,
      409: "Já existe uma aquisição com este identificador",
    },
    delete: acquisitionErrors.delete,
  },
  transform: transformAcquisition,
  buildCreateDto: (data) => {
    const _totalFees = getTotalFees(data.fees, data.transportationFee, undefined, data.handlingFee);

    return {
      propertyId: data.propertyId,
      supplierId: data.supplierId,
      acquisitionDate: data.acquisitionDate,
      pricingMode: data.pricingMode,
      paymentMethod: data.paymentMethod,
      totalPrice: data.totalPrice,
      fees: data.fees && data.fees.length > 0 ? data.fees : undefined,
      transportationFee: data.transportationFee || undefined,
      handlingFee: data.handlingFee || undefined,
      acquisitionItems: data.acquisitionItems.map(mapAcquisitionItemToDto),
      observation: data.observation || undefined,
    };
  },
  buildUpdateDto: (data) => {
    const updateDto = buildUpdateDto(data, [
      "propertyId",
      "supplierId",
      "acquisitionDate",
      "pricingMode",
      "paymentMethod",
      "totalPrice",
      "observation",
    ]);

    // Handle special cases for fees
    if (data.fees !== undefined) {
      updateDto.fees = data.fees && data.fees.length > 0 ? data.fees : undefined;
    }
    if (data.transportationFee !== undefined) {
      updateDto.transportationFee = data.transportationFee || undefined;
    }
    if (data.handlingFee !== undefined) {
      updateDto.handlingFee = data.handlingFee || undefined;
    }

    // Map acquisition items if provided
    if (data.acquisitionItems !== undefined) {
      updateDto.acquisitionItems = data.acquisitionItems.map(mapAcquisitionItemToDto);
    }

    return updateDto;
  },
});

/**
 * Create a new acquisition via API (backend creates animals automatically for items with code/registrationNumber)
 */
export const addAcquisition = acquisitionCrud.add;

/**
 * Update an acquisition via API
 */
export const updateAcquisition = acquisitionCrud.update;

/**
 * Delete an acquisition via API
 */
export const deleteAcquisition = acquisitionCrud.remove;
