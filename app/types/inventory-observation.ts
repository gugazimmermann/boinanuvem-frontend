export interface InventoryObservation {
  id: string;
  itemId: string;
  observation: string;
  fileIds?: string[];
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface InventoryObservationFormData {
  itemId: string;
  observation: string;
  fileIds?: string[];
}
