import { AnimalBreed } from "./animal";
import { BirthPurity } from "./birth";

export interface Acquisition extends Record<string, unknown> {
  id: string;
  animalId: string;
  acquisitionDate: string;
  breed?: AnimalBreed;
  gender?: "male" | "female";
  sellerId?: string;
  price?: number;
  observation?: string;
  birthDate?: string;
  motherId?: string;
  fatherId?: string;
  motherRegistrationNumber?: string;
  fatherRegistrationNumber?: string;
  purity?: BirthPurity;
  birthObservation?: string;
  createdAt: string;
  companyId: string;
}

export interface AcquisitionFormData {
  animalId: string;
  acquisitionDate: string;
  breed?: AnimalBreed;
  gender?: "male" | "female";
  sellerId?: string;
  price?: number;
  observation?: string;
  birthDate?: string;
  motherId?: string;
  fatherId?: string;
  motherRegistrationNumber?: string;
  fatherRegistrationNumber?: string;
  purity?: BirthPurity;
  birthObservation?: string;
  companyId: string;
}
