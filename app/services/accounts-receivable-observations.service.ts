import type {
  AccountsReceivableObservation,
  AccountsReceivableObservationFormData,
} from "~/types/accounts-receivable-observation";
import { createResourceErrorMessages } from "./error-handlers";
import { buildUpdateDto } from "~/utils/update-dto-builder";
import {
  createListHandler,
  createGetByIdHandler,
  createGetByFilterHandler,
  createCrudHandlers,
} from "./service-helpers";
import { createEntityTransform } from "./transform-helpers";

const accountsReceivableObservationErrors = createResourceErrorMessages(
  "observação de conta a receber"
);

/**
 * Transform backend AccountsReceivableObservationResponseDto to frontend AccountsReceivableObservation type
 */
const transformAccountsReceivableObservation = createEntityTransform<AccountsReceivableObservation>(
  {
    dateTimeFields: ["createdAt", "updatedAt"],
  }
);

/**
 * Get all accounts receivable observations via API
 */
export const getAccountsReceivableObservations = createListHandler<AccountsReceivableObservation>({
  endpoint: "/accounts-receivable-observations",
  errorMessages: accountsReceivableObservationErrors.list,
  transform: transformAccountsReceivableObservation,
});

/**
 * Get accounts receivable observations by accounts receivable ID via API
 */
export const getAccountsReceivableObservationsByAccountsReceivableId =
  createGetByFilterHandler<AccountsReceivableObservation>({
    endpoint: "/accounts-receivable-observations",
    errorMessages: accountsReceivableObservationErrors.list,
    transform: transformAccountsReceivableObservation,
    filterFn: (obs, accountsReceivableId) => obs.accountsReceivableId === accountsReceivableId,
  });

/**
 * Get a single accounts receivable observation by ID via API
 */
export const getAccountsReceivableObservationById =
  createGetByIdHandler<AccountsReceivableObservation>({
    endpoint: "/accounts-receivable-observations",
    errorMessages: accountsReceivableObservationErrors.view,
    transform: transformAccountsReceivableObservation,
    custom403Message: "Você não tem permissão para visualizar esta observação",
  });

const accountsReceivableObservationCrud = createCrudHandlers<
  AccountsReceivableObservation,
  AccountsReceivableObservation,
  AccountsReceivableObservationFormData
>({
  endpoint: "/accounts-receivable-observations",
  errorMessages: {
    create: accountsReceivableObservationErrors.create,
    update: accountsReceivableObservationErrors.update,
    delete: accountsReceivableObservationErrors.delete,
  },
  transform: transformAccountsReceivableObservation,
  buildCreateDto: (data) => ({
    accountsReceivableId: data.accountsReceivableId,
    observation: data.observation,
    fileIds: data.fileIds,
  }),
  buildUpdateDto: (data) =>
    buildUpdateDto(data, ["accountsReceivableId", "observation", "fileIds"]),
});

/**
 * Create a new accounts receivable observation via API
 */
export const addAccountsReceivableObservation = accountsReceivableObservationCrud.add;

/**
 * Update an accounts receivable observation via API
 */
export const updateAccountsReceivableObservation = async (
  observationId: string,
  data: Partial<AccountsReceivableObservationFormData>
): Promise<AccountsReceivableObservation> => {
  return accountsReceivableObservationCrud.update(observationId, data);
};

/**
 * Delete an accounts receivable observation via API
 */
export const deleteAccountsReceivableObservation = async (observationId: string): Promise<void> => {
  return accountsReceivableObservationCrud.remove(observationId);
};
