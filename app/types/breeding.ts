export type BreedingMethod = "natural" | "artificial_insemination";

export interface Breeding extends Record<string, unknown> {
  id: string;
  animalId: string;
  date: string;
  method: BreedingMethod;
  bullId?: string;
  attemptNumber?: number;
  semenCode?: string;
  employeeIds: string[];
  serviceProviderIds: string[];
  observation?: string;
  confirmed?: boolean;
  createdAt: string;
  companyId: string;
}

export interface BreedingFormData {
  animalId: string;
  date: string;
  method: BreedingMethod;
  bullId?: string;
  attemptNumber?: number;
  semenCode?: string;
  employeeIds: string[];
  serviceProviderIds: string[];
  observation?: string;
  confirmed?: boolean;
  companyId: string;
}
