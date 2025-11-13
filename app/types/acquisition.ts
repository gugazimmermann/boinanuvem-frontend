import { AnimalBreed } from "./animal";

export interface Acquisition extends Record<string, unknown> {
  id: string;
  animalId: string;
  acquisitionDate: string;
  breed?: AnimalBreed;
  gender?: "male" | "female";
  sellerId?: string;
  price?: number;
  observation?: string;
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
  companyId: string;
}

