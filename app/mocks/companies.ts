import type { CompanyFormData } from "~/components/site/utils/cnpj-utils";

export interface Company extends CompanyFormData {
  id: string;
  latitude?: number;
  longitude?: number;
}

export const mockCompanies: Company[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    cnpj: "36313261000109",
    companyName: "JOSE AUGUSTO DE NEGREIROS LTDA",
    email: "jucaezulma@yahoo.com.br",
    phone: "47999851681",
    street: "Rua Simão Piaz",
    number: "SN",
    complement: "Fazenda do Juca",
    neighborhood: "LIMOEIRO",
    city: "São João do Itaperiú",
    state: "SC",
    zipCode: "88395000",
    latitude: -26.559317100277863,
    longitude: -48.75873810994559,
  },
];

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

