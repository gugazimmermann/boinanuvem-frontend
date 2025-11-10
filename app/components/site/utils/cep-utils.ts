import type { CEPData } from "../hooks/use-cep-lookup";
import { maskCEP } from "./masks";

/**
 * Map CEP API data to address form fields
 */
export interface AddressFormData {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

/**
 * Transform CEP API data to address form data structure
 */
export function mapCEPDataToAddressForm(
  data: CEPData,
  existingData?: Partial<AddressFormData>
): Partial<AddressFormData> {
  return {
    zipCode: existingData?.zipCode || (data.cep ? maskCEP(data.cep) : ""),
    street: data.street || existingData?.street || "",
    neighborhood: data.neighborhood || existingData?.neighborhood || "",
    city: data.city || existingData?.city || "",
    state: data.state || existingData?.state || "",
    number: existingData?.number || "",
    complement: existingData?.complement || "",
  };
}

