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
 * Parse a numeric value from unknown type (number, string, or other)
 */
function parseNumericValue(value: unknown, defaultValue: number = 0): number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return Number.parseFloat(value);
  }
  return defaultValue;
}

/**
 * Normalize an acquisition item from raw backend data
 */
function normalizeAcquisitionItem(item: unknown): AcquisitionItem | null {
  if (!item || typeof item !== "object") return null;
  const obj = item as Record<string, unknown>;

  const animalId = typeof obj.animalId === "string" ? obj.animalId : "";
  const price = parseNumericValue(obj.price, 0);
  const weight = parseNumericValue(obj.weight, 0);
  const providedCostPerArroba = parseNumericValue(obj.costPerArroba, Number.NaN);

  const safeWeight = Number.isFinite(weight) ? weight : 0;
  const safePrice = Number.isFinite(price) ? price : 0;
  const costPerArroba = Number.isFinite(providedCostPerArroba)
    ? providedCostPerArroba
    : calculateAcquisitionCostPerArroba(safeWeight, safePrice);

  return {
    animalId,
    price: Number.isFinite(price) ? price : 0,
    weight: Number.isFinite(weight) ? weight : 0,
    costPerArroba: Number.isFinite(costPerArroba) ? costPerArroba : 0,
    breed: obj.breed as AcquisitionItem["breed"],
    gender: obj.gender as AcquisitionItem["gender"],
    birthDate: obj.birthDate as AcquisitionItem["birthDate"],
    motherId: obj.motherId as AcquisitionItem["motherId"],
    fatherId: obj.fatherId as AcquisitionItem["fatherId"],
    motherRegistrationNumber:
      obj.motherRegistrationNumber as AcquisitionItem["motherRegistrationNumber"],
    fatherRegistrationNumber:
      obj.fatherRegistrationNumber as AcquisitionItem["fatherRegistrationNumber"],
    purity: obj.purity as AcquisitionItem["purity"],
    birthObservation: obj.birthObservation as AcquisitionItem["birthObservation"],
  };
}

/**
 * Convert backend Date to frontend string format
 */
const transformAcquisition = createEntityTransform<Acquisition>({
  dateStringFields: ["acquisitionDate"],
  dateTimeFields: ["createdAt"],
  amountFields: ["totalPrice", "transportationFee", "handlingFee"],
  customTransform: (acq) => {
    const acquisitionItemsRaw = (acq as unknown as { acquisitionItems?: unknown }).acquisitionItems;
    const acquisitionItems = Array.isArray(acquisitionItemsRaw) ? acquisitionItemsRaw : [];

    const normalizedItems = acquisitionItems
      .map(normalizeAcquisitionItem)
      .filter((x): x is AcquisitionItem => x !== null);

    return {
      ...acq,
      acquisitionItems: normalizedItems,
    };
  },
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
    // Prefer backend endpoint optimized for this lookup (and avoids scanning all acquisitions)
    // allow404=true means 404s return undefined instead of throwing (expected for animals without acquisitions)
    const acquisition = (await apiClient.get<Acquisition>(
      `/acquisitions/animal/${animalId}`,
      undefined,
      { allow404: true }
    )) as Acquisition | undefined;
    return acquisition ? transformAcquisition(acquisition) : undefined;
  } catch (error) {
    try {
      // If user doesn't have permission to view acquisitions, fallback to an animals endpoint
      // that returns acquisition data but is guarded by animals:view.
      if (
        error instanceof Error &&
        "status" in error &&
        (error as unknown as { status?: number }).status === 403
      ) {
        const acquisition = (await apiClient.get<Acquisition>(
          `/animals/${animalId}/acquisition`,
          undefined,
          { allow404: true }
        )) as Acquisition | undefined;
        return acquisition ? transformAcquisition(acquisition) : undefined;
      }

      handleApiError(error, {
        ...acquisitionErrors.list,
        403: "Você não tem permissão para visualizar aquisições",
        404: "Aquisição não encontrada para este animal",
      });
    } catch {
      return undefined;
    }
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
