export interface AnimalMovement {
  id: string;
  date: string;
  companyId: string;
  propertyId: string;
  locationId: string;
  animalIds: string[];
  employeeIds: string[];
  serviceProviderIds: string[];
  observation?: string;
  fileIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}
