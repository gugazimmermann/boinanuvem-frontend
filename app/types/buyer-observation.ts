export interface BuyerObservation {
  id: string;
  buyerId: string;
  observation: string;
  fileIds?: string[];
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface BuyerObservationFormData {
  buyerId: string;
  observation: string;
  fileIds?: string[];
}

