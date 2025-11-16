import type { Company, CompanyFormData } from "~/types";

export type { Company, CompanyFormData };

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
    createdAt: "2025-01-01",
    latitude: -26.559317100277863,
    longitude: -48.75873810994559,
  },
];
