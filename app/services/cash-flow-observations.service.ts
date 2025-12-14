import type {
  CashFlowObservation,
  CashFlowObservationFormData,
} from "~/types/cash-flow-observation";
import { createResourceErrorMessages } from "./error-handlers";
import { buildUpdateDto } from "~/utils/update-dto-builder";
import {
  createListHandler,
  createGetByIdHandler,
  createGetByFilterHandler,
  createCrudHandlers,
} from "./service-helpers";
import { createEntityTransform } from "./transform-helpers";

const cashFlowObservationErrors = createResourceErrorMessages("observação de fluxo de caixa");

/**
 * Transform backend CashFlowObservationResponseDto to frontend CashFlowObservation type
 */
const transformCashFlowObservation = createEntityTransform<CashFlowObservation>({
  dateTimeFields: ["createdAt", "updatedAt"],
});

/**
 * Get all cash flow observations via API
 */
export const getCashFlowObservations = createListHandler<CashFlowObservation>({
  endpoint: "/cash-flow-observations",
  errorMessages: cashFlowObservationErrors.list,
  transform: transformCashFlowObservation,
});

/**
 * Get cash flow observations by cash flow ID via API
 */
export const getCashFlowObservationsByCashFlowId = createGetByFilterHandler<CashFlowObservation>({
  endpoint: "/cash-flow-observations",
  errorMessages: cashFlowObservationErrors.list,
  transform: transformCashFlowObservation,
  filterFn: (obs, cashFlowId) => obs.cashFlowId === cashFlowId,
});

/**
 * Get a single cash flow observation by ID via API
 */
export const getCashFlowObservationById = createGetByIdHandler<CashFlowObservation>({
  endpoint: "/cash-flow-observations",
  errorMessages: cashFlowObservationErrors.view,
  transform: transformCashFlowObservation,
  custom403Message: "Você não tem permissão para visualizar esta observação",
});

const cashFlowObservationCrud = createCrudHandlers<
  CashFlowObservation,
  CashFlowObservation,
  CashFlowObservationFormData
>({
  endpoint: "/cash-flow-observations",
  errorMessages: {
    create: cashFlowObservationErrors.create,
    update: cashFlowObservationErrors.update,
    delete: cashFlowObservationErrors.delete,
  },
  transform: transformCashFlowObservation,
  buildCreateDto: (data) => ({
    cashFlowId: data.cashFlowId,
    observation: data.observation,
    fileIds: data.fileIds,
  }),
  buildUpdateDto: (data) => buildUpdateDto(data, ["cashFlowId", "observation", "fileIds"]),
});

/**
 * Create a new cash flow observation via API
 */
export const addCashFlowObservation = cashFlowObservationCrud.add;

/**
 * Update a cash flow observation via API
 */
export const updateCashFlowObservation = async (
  observationId: string,
  data: Partial<CashFlowObservationFormData>
): Promise<CashFlowObservation> => {
  return cashFlowObservationCrud.update(observationId, data);
};

/**
 * Delete a cash flow observation via API
 */
export const deleteCashFlowObservation = async (observationId: string): Promise<void> => {
  return cashFlowObservationCrud.remove(observationId);
};
