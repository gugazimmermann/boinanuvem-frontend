import { Input } from "~/components/ui";
import { useCEPLookup } from "~/components/site/hooks/use-cep-lookup";
import { mapCEPDataToAddressForm } from "~/components/site/utils/cep-utils";
import { maskCEP, unmaskCEP } from "~/components/site/utils/masks";
import { useTranslation } from "~/i18n";
import type { AddressFormData } from "~/components/site/utils/cep-utils";

interface AddressFormProps {
  data: Partial<AddressFormData>;
  errors: Record<string, string>;
  onChange: (field: keyof AddressFormData, value: string) => void;
  disabled?: boolean;
}

export function AddressForm({ data, errors, onChange, disabled = false }: AddressFormProps) {
  const t = useTranslation();
  const fieldLabels = t.profile.company.fields;

  const handleZipCodeSuccess = (cepData: Parameters<typeof mapCEPDataToAddressForm>[0]) => {
    const mappedData = mapCEPDataToAddressForm(cepData, data);
    Object.entries(mappedData).forEach(([key, value]) => {
      if (value && key !== "zipCode") {
        onChange(key as keyof AddressFormData, value);
      }
    });
  };

  const { loading: zipCodeLoading } = useCEPLookup(unmaskCEP(data.zipCode || ""), {
    debounceMs: 800,
    onSuccess: handleZipCodeSuccess,
  });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-1">
          <Input
            label={fieldLabels.zipCode}
            value={data.zipCode || ""}
            onChange={(e) => onChange("zipCode", maskCEP(e.target.value))}
            error={errors.zipCode}
            disabled={disabled}
            placeholder="00000-000"
            maxLength={10}
          />
        </div>
        <div className="md:col-span-2">
          <Input
            label={fieldLabels.street}
            value={data.street || ""}
            onChange={(e) => onChange("street", e.target.value)}
            error={errors.street}
            disabled={disabled || zipCodeLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Input
            label={fieldLabels.number}
            value={data.number || ""}
            onChange={(e) => onChange("number", e.target.value)}
            error={errors.number}
            disabled={disabled || zipCodeLoading}
          />
        </div>
        <div className="md:col-span-2">
          <Input
            label={fieldLabels.complement}
            value={data.complement || ""}
            onChange={(e) => onChange("complement", e.target.value)}
            error={errors.complement}
            disabled={disabled || zipCodeLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Input
            label={fieldLabels.neighborhood}
            value={data.neighborhood || ""}
            onChange={(e) => onChange("neighborhood", e.target.value)}
            error={errors.neighborhood}
            disabled={disabled || zipCodeLoading}
          />
        </div>
        <div>
          <Input
            label={fieldLabels.city}
            value={data.city || ""}
            onChange={(e) => onChange("city", e.target.value)}
            error={errors.city}
            disabled={disabled || zipCodeLoading}
          />
        </div>
        <div>
          <Input
            label={fieldLabels.state}
            value={data.state || ""}
            onChange={(e) => onChange("state", e.target.value)}
            error={errors.state}
            disabled={disabled || zipCodeLoading}
            maxLength={2}
          />
        </div>
      </div>
    </div>
  );
}
