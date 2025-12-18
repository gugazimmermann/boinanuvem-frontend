import { Input, Select } from "~/components/ui";
import type { PricingMode } from "~/types";
import {
  PricingMode as PricingModeEnum,
  AcquisitionPaymentMethod as AcquisitionPaymentMethodEnum,
} from "~/types";

interface AcquisitionBasicFieldsProps {
  readonly acquisitionDate: string;
  readonly pricingMode: PricingMode | "";
  readonly paymentMethod: string;
  readonly onDateChange: (value: string) => void;
  readonly onPricingModeChange: (value: PricingMode) => void;
  readonly onPaymentMethodChange: (value: string) => void;
  readonly errors: {
    readonly acquisitionDate?: string;
    readonly pricingMode?: string;
    readonly paymentMethod?: string;
  };
  readonly disabled?: boolean;
  readonly translations: {
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
  };
}

export function AcquisitionBasicFields({
  acquisitionDate,
  pricingMode,
  paymentMethod,
  onDateChange,
  onPricingModeChange,
  onPaymentMethodChange,
  errors,
  disabled,
  translations,
}: AcquisitionBasicFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {translations.acquisitionDate} <span className="text-red-500">*</span>
        </label>
        <Input
          type="date"
          value={acquisitionDate}
          onChange={(e) => onDateChange(e.target.value)}
          disabled={disabled}
          className={errors.acquisitionDate ? "border-red-500" : ""}
        />
        {errors.acquisitionDate && (
          <p className="text-red-500 text-sm mt-1">{errors.acquisitionDate}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {translations.pricingMode} <span className="text-red-500">*</span>
        </label>
        <Select
          value={pricingMode}
          onChange={(e) => onPricingModeChange(e.target.value as PricingMode)}
          disabled={disabled}
          className={errors.pricingMode ? "border-red-500" : ""}
          options={[
            {
              value: "",
              label: translations.selectPricingMode,
            },
            {
              value: PricingModeEnum.INDIVIDUAL,
              label: translations.pricingModes.individual,
            },
            {
              value: PricingModeEnum.TOTAL,
              label: translations.pricingModes.total,
            },
          ]}
          showPlaceholder={false}
        />
        {errors.pricingMode && <p className="text-red-500 text-sm mt-1">{errors.pricingMode}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {translations.paymentMethod} <span className="text-red-500">*</span>
        </label>
        <Select
          value={paymentMethod}
          onChange={(e) => onPaymentMethodChange(e.target.value)}
          disabled={disabled}
          className={errors.paymentMethod ? "border-red-500" : ""}
          options={[
            {
              value: "",
              label: translations.selectPaymentMethod,
            },
            {
              value: AcquisitionPaymentMethodEnum.CASH_FLOW,
              label: translations.paymentMethods.cashFlow,
            },
            {
              value: AcquisitionPaymentMethodEnum.ACCOUNTS_PAYABLE,
              label: translations.paymentMethods.accountsPayable,
            },
          ]}
          showPlaceholder={false}
        />
        {errors.paymentMethod && (
          <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>
        )}
      </div>
    </div>
  );
}
