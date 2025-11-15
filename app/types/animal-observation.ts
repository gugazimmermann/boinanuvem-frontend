export interface AnimalObservation {
  id: string;
  animalId: string;
  observation: string;
  fileIds?: string[];
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface AnimalObservationFormData {
  animalId: string;
  observation: string;
  fileIds?: string[];
}
