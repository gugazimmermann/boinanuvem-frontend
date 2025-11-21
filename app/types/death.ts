export interface Death extends Record<string, unknown> {
  id: string;
  animalId: string;
  date: string;
  cause: string;
  observation?: string;
  createdAt: string;
  companyId: string;
}

export interface DeathFormData {
  animalId: string;
  date: string;
  cause: string;
  observation?: string;
  companyId: string;
}
