import { Input, Button, Select } from "~/components/ui";
import { FeeManager } from "~/components/dashboard/records/fee-manager";
import { AcquisitionSupplierField } from "~/components/dashboard/records/acquisition-supplier-field";
import { AcquisitionBasicFields } from "~/components/dashboard/records/acquisition-basic-fields";
import { maskCurrency, parseCurrency, getCurrencyPlaceholder } from "~/utils/currency-mask";
import { formatCurrency } from "~/utils/formatting";
import type { Property, Supplier, PricingMode, Language } from "~/types";
import { PricingMode as PricingModeEnum } from "~/types";
import type { AcquisitionFormData } from "~/hooks/use-acquisition-form";

interface AcquisitionFormLayoutProps {
  readonly formData: AcquisitionFormData;
  readonly properties: Property[];
  readonly suppliers: Supplier[];
  readonly errors: Record<string, string>;
  readonly isSubmitting: boolean;
  readonly totalWithFees: number;
  readonly feesTotal: number;
  readonly language: Language;
  readonly onPropertyChange: (value: string) => void;
  readonly onSupplierChange: (value: string) => void;
  readonly onDateChange: (value: string) => void;
  readonly onPricingModeChange: (value: PricingMode) => void;
  readonly onPaymentMethodChange: (value: string) => void;
  readonly onTotalPriceChange: (value: string) => void;
  readonly onObservationChange: (value: string) => void;
  readonly onAddFee: () => void;
  readonly onRemoveFee: (feeId: string) => void;
  readonly onUpdateFee: (feeId: string, field: "name" | "amount", value: string) => void;
  readonly onCancel: () => void;
  readonly onSubmit: (e: React.FormEvent) => void;
  readonly submitButtonText: string;
  readonly translations: {
    readonly property: string;
    readonly selectProperty: string;
    readonly supplier: string;
    readonly searchSupplier: string;
    readonly selectSupplier: string;
    readonly acquisitionDate: string;
    readonly pricingMode: string;
    readonly selectPricingMode: string;
    readonly paymentMethod: string;
    readonly selectPaymentMethod: string;
    readonly pricingModes: {
      readonly individual: string;
      readonly total: string;
    };
    readonly paymentMethods: {
      readonly cashFlow: string;
      readonly accountsPayable: string;
    };
    readonly totalPrice: string;
    readonly pricePerAnimal: string;
    readonly fees: string;
    readonly addFee: string;
    readonly feeName: string;
    readonly feeNamePlaceholder: string;
    readonly feeAmount: string;
    readonly observation: string;
    readonly total: string;
    readonly cancel: string;
  };
}

export function AcquisitionFormLayout({
  formData,
  properties,
  suppliers,
  errors,
  isSubmitting,
  totalWithFees,
  feesTotal,
  language,
  onPropertyChange,
  onSupplierChange,
  onDateChange,
  onPricingModeChange,
  onPaymentMethodChange,
  onTotalPriceChange,
  onObservationChange,
  onAddFee,
  onRemoveFee,
  onUpdateFee,
  onCancel,
  onSubmit: _onSubmit,
  submitButtonText,
  translations,
}: AcquisitionFormLayoutProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {translations.property} <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.propertyId}
            onChange={(e) => onPropertyChange(e.target.value)}
            disabled={isSubmitting}
            className={errors.propertyId ? "border-red-500" : ""}
            options={[
              {
                value: "",
                label: translations.selectProperty,
              },
              ...properties.map((property) => ({
                value: property.id,
                label: property.name,
              })),
            ]}
            showPlaceholder={false}
          />
          {errors.propertyId && <p className="text-red-500 text-sm mt-1">{errors.propertyId}</p>}
        </div>

        <AcquisitionSupplierField
          suppliers={suppliers}
          value={formData.supplierId}
          onChange={onSupplierChange}
          error={errors.supplierId}
          disabled={isSubmitting}
          translations={{
            supplier: translations.supplier,
            searchSupplier: translations.searchSupplier,
            selectSupplier: translations.selectSupplier,
          }}
        />
      </div>

      <AcquisitionBasicFields
        acquisitionDate={formData.acquisitionDate}
        pricingMode={formData.pricingMode}
        paymentMethod={formData.paymentMethod}
        onDateChange={onDateChange}
        onPricingModeChange={onPricingModeChange}
        onPaymentMethodChange={onPaymentMethodChange}
        errors={{
          acquisitionDate: errors.acquisitionDate,
          pricingMode: errors.pricingMode,
          paymentMethod: errors.paymentMethod,
        }}
        disabled={isSubmitting}
        translations={{
          acquisitionDate: translations.acquisitionDate,
          pricingMode: translations.pricingMode,
          selectPricingMode: translations.selectPricingMode,
          paymentMethod: translations.paymentMethod,
          selectPaymentMethod: translations.selectPaymentMethod,
          pricingModes: translations.pricingModes,
          paymentMethods: translations.paymentMethods,
        }}
      />

      {formData.pricingMode === PricingModeEnum.TOTAL && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {translations.totalPrice} <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.totalPrice}
            onChange={(e) => onTotalPriceChange(maskCurrency(e.target.value, language))}
            disabled={isSubmitting}
            placeholder={getCurrencyPlaceholder(language)}
            className={errors.totalPrice ? "border-red-500" : ""}
          />
          {errors.totalPrice && <p className="text-red-500 text-sm mt-1">{errors.totalPrice}</p>}
          {formData.acquisitionItems.length > 0 && formData.totalPrice && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {translations.pricePerAnimal}:{" "}
              {formatCurrency(
                parseCurrency(formData.totalPrice, language) / formData.acquisitionItems.length,
                language
              )}
            </p>
          )}
        </div>
      )}

      <FeeManager
        fees={formData.fees}
        onAddFee={onAddFee}
        onRemoveFee={onRemoveFee}
        onUpdateFee={onUpdateFee}
        disabled={isSubmitting}
        feesLabel={translations.fees}
        addFeeLabel={translations.addFee}
        feeNameLabel={translations.feeName}
        feeNamePlaceholder={translations.feeNamePlaceholder}
        feeAmountLabel={translations.feeAmount}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {translations.observation}
        </label>
        <textarea
          value={formData.observation}
          onChange={(e) => onObservationChange(e.target.value)}
          disabled={isSubmitting}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
        />
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {translations.total}: {formatCurrency(totalWithFees, language)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {translations.totalPrice}:{" "}
            {formatCurrency(parseCurrency(formData.totalPrice, language), language)}
            {" • "}
            {translations.fees}: {formatCurrency(feesTotal, language)}
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {translations.cancel}
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {submitButtonText}
          </Button>
        </div>
      </div>
    </>
  );
}
