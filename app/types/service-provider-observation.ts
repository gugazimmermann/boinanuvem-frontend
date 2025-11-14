export interface ServiceProviderObservation {
  id: string;
  serviceProviderId: string;
  observation: string;
  fileIds?: string[];
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface ServiceProviderObservationFormData {
  serviceProviderId: string;
  observation: string;
  fileIds?: string[];
}

