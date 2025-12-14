export interface AccountsPayableObservation extends Record<string, unknown> {
  id: string;
  accountsPayableId: string;
  observation: string;
  fileIds?: string[];
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface AccountsPayableObservationFormData {
  accountsPayableId: string;
  observation: string;
  fileIds?: string[];
}
