import type { CNPJData } from "../hooks/use-cnpj-lookup";
import { maskPhone, maskCEP, maskCNPJ } from "./masks";

/**
 * Format CNPJ by removing non-numeric characters
 */
export function formatCNPJ(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Format phone number from API response using mask
 * @param fullPhone - Phone number with DDD (e.g., "4799240805")
 * @returns Formatted phone number (e.g., "(47) 99240-805" or "(47) 9924-0805")
 */
export function formatPhone(fullPhone: string): string {
  if (!fullPhone) return "";
  return maskPhone(fullPhone);
}

/**
 * Map CNPJ API data to company form fields
 */
export interface CompanyFormData {
  cnpj: string;
  companyName: string;
  email: string;
  phone: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

/**
 * Transform CNPJ API data to company form data structure
 */
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

