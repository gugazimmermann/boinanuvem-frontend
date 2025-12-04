import type { Company } from "~/types";
import { mockCompanies } from "~/mocks/companies";
import { findById } from "./base-service";

export function getCompanyById(companyId: string | undefined): Company | undefined {
  return findById(mockCompanies, companyId);
}

export function getCompanyByCNPJ(cnpj: string): Company | undefined {
  const unmaskedCNPJ = cnpj.replaceAll(/\D/g, "");
  return mockCompanies.find((company) => company.cnpj.replaceAll(/\D/g, "") === unmaskedCNPJ);
}

export function updateCompany(cnpj: string, data: Partial<Company>): void {
  const unmaskedCNPJ = cnpj.replaceAll(/\D/g, "");
  const companyIndex = mockCompanies.findIndex(
    (company) => company.cnpj.replaceAll(/\D/g, "") === unmaskedCNPJ
  );
  if (companyIndex !== -1) {
    mockCompanies[companyIndex] = {
      ...mockCompanies[companyIndex],
      ...data,
    };
  }
}
