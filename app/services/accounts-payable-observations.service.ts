import type {
  AccountsPayableObservation,
  AccountsPayableObservationFormData,
} from "~/types/accounts-payable-observation";
import { createResourceErrorMessages } from "./error-handlers";
import { buildUpdateDto } from "~/utils/update-dto-builder";
import {
  createListHandler,
  createGetByIdHandler,
  createGetByFilterHandler,
  createCrudHandlers,
} from "./service-helpers";
import { createEntityTransform } from "./transform-helpers";

const accountsPayableObservationErrors = createResourceErrorMessages("observação de conta a pagar");

/**
 * Transform backend AccountsPayableObservationResponseDto to frontend AccountsPayableObservation type
 */
const transformAccountsPayableObservation = createEntityTransform<AccountsPayableObservation>({
  dateTimeFields: ["createdAt", "updatedAt"],
});

/**
 * Get all accounts payable observations via API
 */
export const getAccountsPayableObservations = createListHandler<AccountsPayableObservation>({
  endpoint: "/accounts-payable-observations",
  errorMessages: accountsPayableObservationErrors.list,
  transform: transformAccountsPayableObservation,
});

/**
 * Get accounts payable observations by accounts payable ID via API
 */
export const getAccountsPayableObservationsByAccountsPayableId =
  createGetByFilterHandler<AccountsPayableObservation>({
    endpoint: "/accounts-payable-observations",
    errorMessages: accountsPayableObservationErrors.list,
    transform: transformAccountsPayableObservation,
    filterFn: (obs, accountsPayableId) => obs.accountsPayableId === accountsPayableId,
  });

/**
 * Get a single accounts payable observation by ID via API
 */
export const getAccountsPayableObservationById = createGetByIdHandler<AccountsPayableObservation>({
  endpoint: "/accounts-payable-observations",
  errorMessages: accountsPayableObservationErrors.view,
  transform: transformAccountsPayableObservation,
  custom403Message: "Você não tem permissão para visualizar esta observação",
});

const accountsPayableObservationCrud = createCrudHandlers<
  AccountsPayableObservation,
  AccountsPayableObservation,
  AccountsPayableObservationFormData
>({
  endpoint: "/accounts-payable-observations",
  errorMessages: {
    create: accountsPayableObservationErrors.create,
    update: accountsPayableObservationErrors.update,
    delete: accountsPayableObservationErrors.delete,
  },
  transform: transformAccountsPayableObservation,
  buildCreateDto: (data) => ({
    accountsPayableId: data.accountsPayableId,
    observation: data.observation,
    fileIds: data.fileIds,
  }),
  buildUpdateDto: (data) => buildUpdateDto(data, ["accountsPayableId", "observation", "fileIds"]),
});

/**
 * Create a new accounts payable observation via API
 */
export const addAccountsPayableObservation = accountsPayableObservationCrud.add;

/**
 * Update an accounts payable observation via API
 */
export const updateAccountsPayableObservation = async (
  observationId: string,
  data: Partial<AccountsPayableObservationFormData>
): Promise<AccountsPayableObservation> => {
  return accountsPayableObservationCrud.update(observationId, data);
};

/**
 * Delete an accounts payable observation via API
 */
export const deleteAccountsPayableObservation = async (observationId: string): Promise<void> => {
  return accountsPayableObservationCrud.remove(observationId);
};
