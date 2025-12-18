import { Input, Select, Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { calculateAcquisitionCostPerArroba } from "~/services/acquisitions.service";
import { maskCurrency, parseCurrency, getCurrencyPlaceholder } from "~/utils/currency-mask";
import { formatCurrency } from "~/utils/formatting";
import { ARROBA_KG } from "~/utils/acquisition-pricing";
import type { PricingMode } from "~/types";
import { PricingMode as PricingModeEnum, AnimalBreed, BirthPurity } from "~/types";
import type { AcquisitionItemFormData } from "~/hooks/use-acquisition-form";

interface AcquisitionItemFormProps {
  readonly item: AcquisitionItemFormData;
  readonly index: number;
  readonly pricingMode: PricingMode | "";
  readonly isSubmitting: boolean;
  readonly errors: Record<string, string>;
  readonly onItemChange: (index: number, field: string, value: string) => void;
  readonly onRemove?: (index: number) => void;
  readonly mode: "new" | "edit"; // "new" allows editing code/registration, "edit" makes them read-only
  readonly translations: {
    readonly animal: string;
    readonly code: string;
    readonly registrationNumber: string;
    readonly weight: string;
    readonly breed: string;
    readonly purity: string;
    readonly gender: string;
    readonly birthDate: string;
    readonly price: string;
    readonly costPerArroba: string;
    readonly weightInArrobas: string;
    readonly calculatedAutomatically: string;
    readonly remove: string;
  };
}

function getInputClassName(
  errorKey: string,
  isEditMode: boolean,
  errors: Record<string, string>
): string {
  if (errors[errorKey]) {
    return "border-red-500";
  }
  if (isEditMode) {
    return "bg-gray-100 dark:bg-gray-700";
  }
  return "";
}

export function AcquisitionItemForm({
  item,
  index,
  pricingMode,
  isSubmitting,
  errors,
  onItemChange,
  onRemove,
  mode,
  translations,
}: AcquisitionItemFormProps) {
  const t = useTranslation();
  const { language } = useLanguage();

  const weight = Number.parseFloat(item.weight) || 0;
  const price = parseCurrency(item.price, language);
  const costPerArroba = weight > 0 ? calculateAcquisitionCostPerArroba(weight, price) : 0;

  const isEditMode = mode === "edit";
  const showRemoveButton = onRemove !== undefined;

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">
          {translations.animal} {index + 1}
        </h4>
        {showRemoveButton && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onRemove?.(index)}
            disabled={isSubmitting}
          >
            {translations.remove}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {translations.code} {!isEditMode && <span className="text-red-500">*</span>}
          </label>
          <Input
            type="text"
            value={item.code}
            onChange={(e) => onItemChange(index, "code", e.target.value)}
            disabled={isSubmitting || isEditMode}
            className={getInputClassName(`code_${index}`, isEditMode, errors)}
          />
          {errors[`code_${index}`] && (
            <p className="text-red-500 text-sm mt-1">{errors[`code_${index}`]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {translations.registrationNumber}{" "}
            {!isEditMode && <span className="text-red-500">*</span>}
          </label>
          <Input
            type="text"
            value={item.registrationNumber}
            onChange={(e) => onItemChange(index, "registrationNumber", e.target.value)}
            disabled={isSubmitting || isEditMode}
            className={getInputClassName(`registrationNumber_${index}`, isEditMode, errors)}
          />
          {errors[`registrationNumber_${index}`] && (
            <p className="text-red-500 text-sm mt-1">{errors[`registrationNumber_${index}`]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {translations.weight} <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            step="0.01"
            value={item.weight}
            onChange={(e) => onItemChange(index, "weight", e.target.value)}
            disabled={isSubmitting}
            className={errors[`weight_${index}`] ? "border-red-500" : ""}
          />
          {errors[`weight_${index}`] && (
            <p className="text-red-500 text-sm mt-1">{errors[`weight_${index}`]}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {translations.breed} {!isEditMode && <span className="text-red-500">*</span>}
          </label>
          <Select
            value={item.breed}
            onChange={(e) => onItemChange(index, "breed", e.target.value)}
            disabled={isSubmitting}
            className={errors[`breed_${index}`] ? "border-red-500" : ""}
            options={[
              { value: "", label: "-" },
              ...Object.values(AnimalBreed).map((breed) => ({
                value: breed,
                label: t.animals.breeds[breed] || breed,
              })),
            ]}
            showPlaceholder={false}
          />
          {errors[`breed_${index}`] && (
            <p className="text-red-500 text-sm mt-1">{errors[`breed_${index}`]}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {translations.purity}
          </label>
          <Select
            value={item.purity || ""}
            onChange={(e) => onItemChange(index, "purity", e.target.value)}
            disabled={isSubmitting}
            options={[
              { value: "", label: "-" },
              ...Object.values(BirthPurity).map((purity) => ({
                value: purity,
                label: t.animals.purity[purity] || purity,
              })),
            ]}
            showPlaceholder={false}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {translations.gender} {!isEditMode && <span className="text-red-500">*</span>}
          </label>
          <Select
            value={item.gender}
            onChange={(e) => onItemChange(index, "gender", e.target.value)}
            disabled={isSubmitting}
            className={errors[`gender_${index}`] ? "border-red-500" : ""}
            options={[
              { value: "", label: "-" },
              { value: "male", label: t.animals.gender.male },
              { value: "female", label: t.animals.gender.female },
            ]}
            showPlaceholder={false}
          />
          {errors[`gender_${index}`] && (
            <p className="text-red-500 text-sm mt-1">{errors[`gender_${index}`]}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {translations.birthDate}
          </label>
          <Input
            type="date"
            value={item.birthDate}
            onChange={(e) => onItemChange(index, "birthDate", e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {weight > 0 && price > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>{translations.costPerArroba}:</strong> {formatCurrency(costPerArroba, language)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {translations.weightInArrobas}: {(weight / ARROBA_KG).toFixed(2)}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pricingMode === PricingModeEnum.INDIVIDUAL && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {translations.price} <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={item.price}
              onChange={(e) => onItemChange(index, "price", maskCurrency(e.target.value, language))}
              disabled={isSubmitting}
              placeholder={getCurrencyPlaceholder(language)}
              className={errors[`price_${index}`] ? "border-red-500" : ""}
            />
            {errors[`price_${index}`] && (
              <p className="text-red-500 text-sm mt-1">{errors[`price_${index}`]}</p>
            )}
          </div>
        )}

        {pricingMode === PricingModeEnum.TOTAL && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {translations.price}
            </label>
            <Input
              type="text"
              value={item.price}
              disabled
              className="bg-gray-100 dark:bg-gray-700"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {translations.calculatedAutomatically}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
