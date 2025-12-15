export interface AnimalMovement {
  id: string;
  date: string;
  companyId: string;
  propertyId: string;
  locationId: string | null;
  animalIds: string[];
  employeeIds: string[];
  serviceProviderIds: string[];
  observation?: string | null;
  fileIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}
