import type { Company } from "~/types";
import { mockCompanies } from "~/mocks/companies";
import { findById, updateEntity } from "./base-service";

/**
 * Get company by ID
 */
export function getCompanyById(companyId: string | undefined): Company | undefined {
  return findById(mockCompanies, companyId);
}

/**
 * Get company by CNPJ
 */
export function getCompanyByCNPJ(cnpj: string): Company | undefined {
  const unmaskedCNPJ = cnpj.replace(/\D/g, "");
  return mockCompanies.find(
    (company) => company.cnpj.replace(/\D/g, "") === unmaskedCNPJ
  );
}

/**
 * Update company
 */
export function updateCompany(cnpj: string, data: Partial<Company>): void {
  const unmaskedCNPJ = cnpj.replace(/\D/g, "");
  const companyIndex = mockCompanies.findIndex(
    (company) => company.cnpj.replace(/\D/g, "") === unmaskedCNPJ
  );
  if (companyIndex !== -1) {
    mockCompanies[companyIndex] = {
      ...mockCompanies[companyIndex],
      ...data,
    };
  }
}

