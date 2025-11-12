import type { CEPData, AddressFormData } from "~/types";
import { maskCEP } from "./masks";

export type { AddressFormData };

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
