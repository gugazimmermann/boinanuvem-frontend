export interface LocationObservation {
  id: string;
  locationId: string;
  observation: string;
  fileIds?: string[];
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface LocationObservationFormData {
  locationId: string;
  observation: string;
  fileIds?: string[];
}
