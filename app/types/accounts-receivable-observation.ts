export interface AccountsReceivableObservation {
  id: string;
  accountsReceivableId: string;
  observation: string;
  fileIds?: string[];
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface AccountsReceivableObservationFormData {
  accountsReceivableId: string;
  observation: string;
  fileIds?: string[];
}
