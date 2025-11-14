export interface SupplierObservation {
  id: string;
  supplierId: string;
  observation: string;
  fileIds?: string[];
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface SupplierObservationFormData {
  supplierId: string;
  observation: string;
  fileIds?: string[];
}
