export enum BirthPurity {
  PO = "po", // Puro de Origem
  PC = "pc", // Puro por Cruza (~96,875% ou mais)
  F1 = "f1", // Primeira Geração Cruzada
  F2 = "f2", // Segunda Geração
  F3 = "f3", // Terceira Geração
  F4 = "f4", // Quarta Geração
  F5 = "f5", // Quinta Geração
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
