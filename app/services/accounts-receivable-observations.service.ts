import type {
  AccountsReceivableObservation,
  AccountsReceivableObservationFormData,
} from "~/types/accounts-receivable-observation";
import { mockAccountsReceivableObservations } from "~/mocks/accounts-receivable-observations";
import { findById, findByField, deleteEntity } from "./base-service";
import { generateUUID } from "~/utils/uuid";

export function getAccountsReceivableObservationsByAccountsReceivableId(
  accountsReceivableId: string
): AccountsReceivableObservation[] {
  return findByField(
    mockAccountsReceivableObservations,
    "accountsReceivableId",
    accountsReceivableId
  );
}

export function getAccountsReceivableObservationById(
  observationId: string | undefined
): AccountsReceivableObservation | undefined {
  return findById(mockAccountsReceivableObservations, observationId);
}

export function addAccountsReceivableObservation(
  data: AccountsReceivableObservationFormData
): AccountsReceivableObservation {
  const newObservation: AccountsReceivableObservation = {
    ...data,
    id: generateUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockAccountsReceivableObservations.push(newObservation);
  return newObservation;
}

export function deleteAccountsReceivableObservation(observationId: string): boolean {
  return deleteEntity(mockAccountsReceivableObservations, observationId);
}

export function updateAccountsReceivableObservation(
  observationId: string,
  data: Partial<AccountsReceivableObservationFormData>
): boolean {
  const index = mockAccountsReceivableObservations.findIndex((obs) => obs.id === observationId);
  if (index !== -1) {
    mockAccountsReceivableObservations[index] = {
      ...mockAccountsReceivableObservations[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }
  return false;
}
