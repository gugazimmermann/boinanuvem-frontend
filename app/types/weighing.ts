export interface Weighing extends Record<string, unknown> {
  id: string;
  animalId: string;
  employeeIds: string[];
  serviceProviderIds: string[];
  date: string;
  weight: number;
  observation?: string;
  appliedMedicines?: Array<{ itemId: string; quantity: number; calculatedDosage: number }>;
  createdAt: string;
  companyId: string;
}

export interface WeighingFormData {
  animalId: string;
  employeeIds: string[];
  serviceProviderIds: string[];
  date: string;
  weight: number;
  observation?: string;
  appliedMedicines?: Array<{ itemId: string; quantity: number; calculatedDosage: number }>;
  companyId: string;
}
