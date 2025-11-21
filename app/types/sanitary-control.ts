export interface SanitaryControl extends Record<string, unknown> {
  id: string;
  animalId: string;
  date: string;
  appliedMedicines: Array<{ itemId: string; quantity: number; calculatedDosage: number }>;
  employeeIds: string[];
  serviceProviderIds: string[];
  observation?: string;
  companyId: string;
  createdAt: string;
}

export interface SanitaryControlFormData {
  animalId: string;
  date: string;
  appliedMedicines: Array<{ itemId: string; quantity: number; calculatedDosage: number }>;
  employeeIds: string[];
  serviceProviderIds: string[];
  observation?: string;
  companyId: string;
}
