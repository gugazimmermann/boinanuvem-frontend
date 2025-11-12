import type { CNPJData } from "~/types";
import type { CompanyFormData } from "~/types";
import { maskPhone, maskCEP, maskCNPJ } from "./masks";

export type { CompanyFormData };

export function formatCNPJ(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatPhone(fullPhone: string): string {
  if (!fullPhone) return "";
  return maskPhone(fullPhone);
}

export function mapCNPJDataToCompanyForm(
  data: CNPJData,
  existingData?: Partial<CompanyFormData>
): CompanyFormData {
  return {
    cnpj: existingData?.cnpj || (data.cnpj ? maskCNPJ(data.cnpj) : ""),
    companyName: data.razao_social || "",
    email: data.email || "",
    phone: formatPhone(data.ddd_telefone_1 || ""),
    street: data.logradouro || "",
    number: data.numero || "",
    complement: data.complemento || "",
    neighborhood: data.bairro || "",
    city: data.municipio || "",
    state: data.uf || "",
    zipCode: data.cep ? maskCEP(data.cep) : "",
  };
}
