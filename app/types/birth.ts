export enum BirthPurity {
  PO = "po",
  PC = "pc",
  F1 = "f1",
  F2 = "f2",
  F3 = "f3",
  F4 = "f4",
  F5 = "f5",
}

import { AnimalBreed } from "./animal";

export interface Birth extends Record<string, unknown> {
  id: string;
  animalId: string;
  birthDate: string;
  breed?: AnimalBreed;
  gender?: "male" | "female";
  motherId?: string;
  fatherId?: string;
  purity?: BirthPurity;
  observation?: string;
  createdAt: string;
  companyId: string;
}

export interface BirthFormData {
  animalId: string;
  birthDate: string;
  breed?: AnimalBreed;
  gender?: "male" | "female";
  motherId?: string;
  fatherId?: string;
  purity?: BirthPurity;
  observation?: string;
  companyId: string;
}
