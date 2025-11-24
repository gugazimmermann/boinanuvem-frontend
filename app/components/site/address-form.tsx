import { useCallback } from "react";
import type { AddressFormData, CEPData } from "~/types";
import { AuthInput, AuthSelect } from "./ui";
import { useCEPLookup } from "./hooks";
import { mapCEPDataToAddressForm, maskCEP, unmaskCEP } from "./utils";
import { BRAZILIAN_STATES } from "~/utils/brazilian-states";
import { useTranslation } from "~/i18n/use-translation";

interface AddressFormProps {
  data: AddressFormData;
  onChange: (field: keyof AddressFormData, value: string) => void;
  errors?: Partial<Record<keyof AddressFormData, string>>;
  zipCodeError?: string;
  zipCodeLoading?: boolean;
  showNumber?: boolean;
  showComplement?: boolean;
  onZipCodeSuccess?: (data: CEPData) => void;
}

export function AddressForm({
  data,
  onChange,
  errors = {},
  zipCodeError,
  zipCodeLoading,
  showNumber = true,
  showComplement = true,
  onZipCodeSuccess,
}: AddressFormProps) {
  const t = useTranslation();

  const handleZipCodeSuccess = useCallback(
    (cepData: CEPData) => {
      if (onZipCodeSuccess) {
        onZipCodeSuccess(cepData);
      } else {
        const mappedData = mapCEPDataToAddressForm(cepData, data);
        Object.entries(mappedData).forEach(([key, value]) => {
          if (key !== "zipCode" && value !== undefined && value !== "") {
            onChange(key as keyof AddressFormData, String(value));
          }
        });
      }
    },
    [data, onChange, onZipCodeSuccess]
  );

  const { loading: cepLoading } = useCEPLookup(unmaskCEP(data.zipCode), {
    debounceMs: 800,
    onSuccess: handleZipCodeSuccess,
    enabled: !onZipCodeSuccess, // Only use internal hook if no external handler provided
  });

  const handleZipCodeChange = (value: string) => {
    const maskedValue = maskCEP(value);
    onChange("zipCode", maskedValue);
  };

  const isLoading = (onZipCodeSuccess ? zipCodeLoading : cepLoading) || zipCodeLoading;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <AuthInput
            type="text"
            placeholder="CEP"
            aria-label={t.common.ariaLabels.zipCode}
            className="mt-0"
            value={data.zipCode}
            onChange={(e) => handleZipCodeChange(e.target.value)}
            error={zipCodeError || errors.zipCode}
            required
          />
          {isLoading && <p className="mt-1 text-xs text-blue-500">{t.common.searchingAddress}</p>}
        </div>
        <div className="md:col-span-2">
          <AuthInput
            type="text"
            placeholder="Rua"
            aria-label={t.common.ariaLabels.street}
            className="mt-0"
            value={data.street}
            onChange={(e) => onChange("street", e.target.value)}
            error={errors.street}
            required
          />
        </div>
      </div>

      {showNumber && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <AuthInput
              type="text"
              placeholder="Número"
              aria-label={t.common.ariaLabels.number}
              className="mt-0"
              value={data.number}
              onChange={(e) => onChange("number", e.target.value)}
            />
          </div>
          {showComplement && (
            <div className="md:col-span-2">
              <AuthInput
                type="text"
                placeholder="Complemento"
                aria-label={t.common.ariaLabels.complement}
                className="mt-0"
                value={data.complement}
                onChange={(e) => onChange("complement", e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <AuthInput
            type="text"
            placeholder="Bairro"
            aria-label={t.common.ariaLabels.neighborhood}
            className="mt-0"
            value={data.neighborhood}
            onChange={(e) => onChange("neighborhood", e.target.value)}
            error={errors.neighborhood}
            required
          />
        </div>
        <div>
          <AuthInput
            type="text"
            placeholder="Cidade"
            aria-label={t.common.ariaLabels.city}
            className="mt-0"
            value={data.city}
            onChange={(e) => onChange("city", e.target.value)}
            error={errors.city}
            required
          />
        </div>
        <div>
          <AuthSelect
            aria-label={t.common.ariaLabels.state}
            className="mt-0"
            value={data.state}
            onChange={(e) => onChange("state", e.target.value)}
            error={errors.state}
            options={BRAZILIAN_STATES.map((state) => ({
              value: state.code,
              label: state.code,
            }))}
            required
          />
        </div>
      </div>
    </>
  );
}
