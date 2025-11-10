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
  razaoSocial: string;
  email: string;
  telefone: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
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
    razaoSocial: data.razao_social || "",
    email: data.email || "",
    telefone: formatPhone(data.ddd_telefone_1 || ""),
    rua: data.logradouro || "",
    numero: data.numero || "",
    complemento: data.complemento || "",
    bairro: data.bairro || "",
    cidade: data.municipio || "",
    estado: data.uf || "",
    cep: data.cep ? maskCEP(data.cep) : "",
  };
}

