import type { CEPData } from "../hooks/use-cep-lookup";
import { maskCEP } from "./masks";

/**
 * Map CEP API data to address form fields
 */
export interface AddressFormData {
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

/**
 * Transform CEP API data to address form data structure
 */
export function mapCEPDataToAddressForm(
  data: CEPData,
  existingData?: Partial<AddressFormData>
): Partial<AddressFormData> {
  return {
    cep: existingData?.cep || (data.cep ? maskCEP(data.cep) : ""),
    rua: data.street || existingData?.rua || "",
    bairro: data.neighborhood || existingData?.bairro || "",
    cidade: data.city || existingData?.cidade || "",
    estado: data.state || existingData?.estado || "",
    // Preserve existing values for numero and complemento
    numero: existingData?.numero || "",
    complemento: existingData?.complemento || "",
  };
}

