import { Input, Select } from "~/components/ui";
import { useSupplierSearch } from "~/hooks/use-supplier-search";
import type { Supplier } from "~/types";

interface AcquisitionSupplierFieldProps {
  readonly suppliers: Supplier[];
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly error?: string;
  readonly disabled?: boolean;
  readonly translations: {
    readonly supplier: string;
    readonly searchSupplier: string;
    readonly selectSupplier: string;
  };
}

export function AcquisitionSupplierField({
  suppliers,
  value,
  onChange,
  error,
  disabled,
  translations,
}: AcquisitionSupplierFieldProps) {
  const { searchTerm, setSearchTerm, filteredSuppliers } = useSupplierSearch(suppliers);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {translations.supplier} <span className="text-red-500">*</span>
      </label>
      <Input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={translations.searchSupplier}
        disabled={disabled}
        className="mb-2"
      />
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={error ? "border-red-500" : ""}
        options={[
          {
            value: "",
            label: translations.selectSupplier,
          },
          ...filteredSuppliers.map((supplier) => ({
            value: supplier.id,
            label: `${supplier.code} | ${supplier.name}`,
          })),
        ]}
        showPlaceholder={false}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
