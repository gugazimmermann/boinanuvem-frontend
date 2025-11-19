import type {
  AccountsPayableObservation,
  AccountsPayableObservationFormData,
} from "~/types/accounts-payable-observation";
import { mockAccountsPayableObservations } from "~/mocks/accounts-payable-observations";
import { findById, findByField, deleteEntity } from "./base-service";
import { generateUUID } from "~/utils/uuid";

export function getAccountsPayableObservationsByAccountsPayableId(
  accountsPayableId: string
): AccountsPayableObservation[] {
  return findByField(mockAccountsPayableObservations, "accountsPayableId", accountsPayableId);
}

export function getAccountsPayableObservationById(
  observationId: string | undefined
): AccountsPayableObservation | undefined {
  return findById(mockAccountsPayableObservations, observationId);
}

export function addAccountsPayableObservation(
  data: AccountsPayableObservationFormData
): AccountsPayableObservation {
  const newObservation: AccountsPayableObservation = {
    ...data,
    id: generateUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockAccountsPayableObservations.push(newObservation);
  return newObservation;
}

export function deleteAccountsPayableObservation(observationId: string): boolean {
  return deleteEntity(mockAccountsPayableObservations, observationId);
}

export function updateAccountsPayableObservation(
  observationId: string,
  data: Partial<AccountsPayableObservationFormData>
): boolean {
  const index = mockAccountsPayableObservations.findIndex((obs) => obs.id === observationId);
  if (index !== -1) {
    mockAccountsPayableObservations[index] = {
      ...mockAccountsPayableObservations[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }
  return false;
}
