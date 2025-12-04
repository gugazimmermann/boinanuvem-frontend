import { useCallback } from "react";
import { maskCEP, unmaskCEP } from "~/components/site/utils/masks";
import { useCEPLookup, type CEPData } from "~/components/site/hooks";
import { mapCEPDataToAddressForm } from "~/components/site/utils";

export interface AddressFormData {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface UseAddressFormOptions<T extends AddressFormData> {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  debounceMs?: number;
}

export interface UseAddressFormReturn {
  zipCodeLoading: boolean;
  zipCodeError: string | null;
  handleZipCodeChange: (value: string) => void;
}

/**
 * Hook for handling address form fields with CEP lookup and masking.
 * Extracts common CEP lookup and address field handling patterns.
 */
export function useAddressForm<T extends AddressFormData>({
  formData,
  setFormData,
  debounceMs = 800,
}: UseAddressFormOptions<T>): UseAddressFormReturn {
  const handleZipCodeSuccess = useCallback(
    (data: CEPData) => {
      setFormData((prev) => {
        const mappedData = mapCEPDataToAddressForm(data, prev);
        return { ...prev, ...mappedData, zipCode: prev.zipCode };
      });
    },
    [setFormData]
  );

  const { loading: zipCodeLoading, error: zipCodeError } = useCEPLookup(
    unmaskCEP(formData.zipCode || ""),
    {
      debounceMs,
      onSuccess: handleZipCodeSuccess,
    }
  );

  const handleZipCodeChange = useCallback(
    (value: string) => {
      setFormData((prev) => ({ ...prev, zipCode: maskCEP(value) }));
    },
    [setFormData]
  );

  return {
    zipCodeLoading,
    zipCodeError,
    handleZipCodeChange,
  };
}
