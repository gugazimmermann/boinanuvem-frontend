import { useMemo, useState, useEffect, useCallback } from "react";
import { Input, Button, Alert, Select, FormFieldGroup } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useLanguage } from "~/contexts/language-context";
import { formatCurrency } from "~/utils/currency";
import { maskCurrency, getCurrencyPlaceholder } from "~/utils/currency-mask";
import { isAnimalSold } from "~/services/sales.service";
import { useSaleForm, type SaleFormData } from "~/hooks/use-sale-form";
import type { PricingMode, Property, Buyer, Animal } from "~/types";

export type { SaleFormData } from "~/hooks/use-sale-form";
import {
  SaleType as SaleTypeEnum,
  PricingMode as PricingModeEnum,
  SalePaymentMethod as SalePaymentMethodEnum,
} from "~/types";
import { FeeManager } from "~/components/dashboard/records/fee-manager";

export interface SaleFormProps {
  readonly initialData?: Partial<SaleFormData>;
  readonly animals: Animal[];
  readonly buyers: Buyer[];
  readonly properties: Property[];
  readonly currentSaleAnimalIds?: string[];
  readonly isEdit?: boolean;
  readonly onSubmit: (data: SaleFormData) => Promise<void> | void;
  readonly onSuccess?: () => void;
  readonly onCancel: () => void;
  readonly successMessage?: string;
  readonly errorMessage?: string;
  readonly submitButtonText?: string;
  readonly cancelButtonText?: string;
  readonly title?: string;
  readonly description?: string;
}

export function SaleForm({
  initialData,
  animals,
  buyers,
  properties,
  currentSaleAnimalIds = [],
  isEdit = false,
  onSubmit,
  onSuccess,
  onCancel,
  successMessage,
  errorMessage,
  submitButtonText,
  cancelButtonText,
  title,
  description,
}: SaleFormProps) {
  const t = useTranslation();
  const { language } = useLanguage();
  const [soldAnimalIds, setSoldAnimalIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadSoldAnimals = async () => {
      const soldIds = new Set<string>();
      await Promise.all(
        animals.map(async (animal) => {
          const sold = await isAnimalSold(animal.id);
          if (sold) {
            soldIds.add(animal.id);
          }
        })
      );
      setSoldAnimalIds(soldIds);
    };
    if (animals.length > 0) {
      loadSoldAnimals();
    }
  }, [animals]);

  const animalsMap = useMemo(() => {
    const map = new Map<string, Animal>();
    for (const animal of animals) {
      map.set(animal.id, animal);
    }
    return map;
  }, [animals]);

  const getAnimalByIdLocal = (animalId: string) => {
    return animalsMap.get(animalId);
  };

  const {
    formData,
    errors,
    isSubmitting,
    alertMessage,
    animalSearch,
    setAnimalSearch,
    handleChange: baseHandleChange,
    toggleAnimalSelection,
    handleSaleItemChange,
    handleTotalPriceChange,
    handlePricingModeChange,
    addFee,
    removeFee,
    updateFee,
    calculateTotal,
    handleSubmit,
  } = useSaleForm({
    initialData,
    currentSaleAnimalIds,
    isEdit,
    onSubmit,
    onSuccess,
    successMessage,
    errorMessage,
  });

  // Custom handler for property change that clears selected animals
  const handlePropertyChange = useCallback(
    (propertyId: string) => {
      baseHandleChange("propertyId", propertyId);
      // Clear selected animals and sale items when property changes
      if (propertyId !== formData.propertyId) {
        baseHandleChange("selectedAnimalIds", []);
        baseHandleChange("saleItems", []);
      }
    },
    [baseHandleChange, formData.propertyId]
  );

  const filteredAnimals = useMemo(() => {
    // If no property is selected, show no animals
    if (!formData.propertyId) {
      return [];
    }

    let filtered = animals;

    // Filter by property
    filtered = filtered.filter((animal) => animal.propertyId === formData.propertyId);

    // Filter by search term
    if (animalSearch?.trim()) {
      const searchLower = animalSearch.toLowerCase();
      filtered = filtered.filter(
        (animal) =>
          animal.code.toLowerCase().includes(searchLower) ||
          animal.registrationNumber.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [animals, animalSearch, formData.propertyId]);

  const toSafeString = (value: unknown): string => {
    if (typeof value === "string") return value;
    if (value == null) return "";
    if (typeof value === "object") return "";
    // Explicitly handle remaining primitive types
    if (
      typeof value === "number" ||
      typeof value === "boolean" ||
      typeof value === "bigint" ||
      typeof value === "symbol"
    ) {
      return String(value);
    }
    return "";
  };

  return (
    <div className="space-y-8">
      {alertMessage && <Alert variant={alertMessage.variant} title={alertMessage.title} />}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        {(title || description) && (
          <div className="mb-6">
            {title && <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>}
            {description && <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <FormFieldGroup columns={2}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.sales.form.property} <span className="text-red-500">*</span>
              </label>
              <Select
                value={toSafeString(formData.propertyId)}
                onChange={(e) => handlePropertyChange(e.target.value)}
                disabled={isSubmitting}
                className={errors.propertyId ? "border-red-500" : ""}
                options={[
                  { value: "", label: t.sales.form.selectProperty },
                  ...properties.map((property) => ({
                    value: property.id,
                    label: property.name,
                  })),
                ]}
                showPlaceholder={false}
              />
              {errors.propertyId && (
                <p className="text-red-500 text-sm mt-1">{errors.propertyId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.sales.form.buyer} <span className="text-red-500">*</span>
              </label>
              <Select
                value={toSafeString(formData.buyerId)}
                onChange={(e) => baseHandleChange("buyerId", e.target.value)}
                disabled={isSubmitting}
                className={errors.buyerId ? "border-red-500" : ""}
                options={[
                  { value: "", label: t.sales.form.selectBuyer },
                  ...buyers.map((buyer) => ({
                    value: buyer.id,
                    label: buyer.name,
                  })),
                ]}
                showPlaceholder={false}
              />
              {errors.buyerId && <p className="text-red-500 text-sm mt-1">{errors.buyerId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.sales.form.saleDate} <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={toSafeString(formData.saleDate)}
                onChange={(e) => baseHandleChange("saleDate", e.target.value)}
                disabled={isSubmitting}
                className={errors.saleDate ? "border-red-500" : ""}
              />
              {errors.saleDate && <p className="text-red-500 text-sm mt-1">{errors.saleDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.sales.form.saleType} <span className="text-red-500">*</span>
              </label>
              <Select
                value={toSafeString(formData.saleType)}
                onChange={(e) => baseHandleChange("saleType", e.target.value)}
                disabled={isSubmitting}
                className={errors.saleType ? "border-red-500" : ""}
                options={[
                  { value: "", label: t.sales.form.selectSaleType },
                  {
                    value: SaleTypeEnum.SLAUGHTERHOUSE,
                    label: t.sales.saleTypes.slaughterhouse,
                  },
                  {
                    value: SaleTypeEnum.OTHER_FARM,
                    label: t.sales.saleTypes.otherFarm,
                  },
                  {
                    value: SaleTypeEnum.AUCTION,
                    label: t.sales.saleTypes.auction,
                  },
                ]}
                showPlaceholder={false}
              />
              {errors.saleType && <p className="text-red-500 text-sm mt-1">{errors.saleType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.sales.form.pricingMode} <span className="text-red-500">*</span>
              </label>
              <Select
                value={toSafeString(formData.pricingMode)}
                onChange={(e) => handlePricingModeChange(e.target.value as PricingMode)}
                disabled={isSubmitting}
                className={errors.pricingMode ? "border-red-500" : ""}
                options={[
                  { value: "", label: t.sales.form.selectPricingMode },
                  {
                    value: PricingModeEnum.INDIVIDUAL,
                    label: t.sales.pricingModes.individual,
                  },
                  {
                    value: PricingModeEnum.TOTAL,
                    label: t.sales.pricingModes.total,
                  },
                ]}
                showPlaceholder={false}
              />
              {errors.pricingMode && (
                <p className="text-red-500 text-sm mt-1">{errors.pricingMode}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.sales.form.paymentMethod} <span className="text-red-500">*</span>
              </label>
              <Select
                value={toSafeString(formData.paymentMethod)}
                onChange={(e) => baseHandleChange("paymentMethod", e.target.value)}
                disabled={isSubmitting}
                className={errors.paymentMethod ? "border-red-500" : ""}
                options={[
                  { value: "", label: t.sales.form.selectPaymentMethod },
                  {
                    value: SalePaymentMethodEnum.CASH_FLOW,
                    label: t.sales.paymentMethods.cashFlow,
                  },
                  {
                    value: SalePaymentMethodEnum.ACCOUNTS_RECEIVABLE,
                    label: t.sales.paymentMethods.accountsReceivable,
                  },
                ]}
                showPlaceholder={false}
              />
              {errors.paymentMethod && (
                <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>
              )}
            </div>
          </FormFieldGroup>

          {formData.pricingMode === PricingModeEnum.TOTAL && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.sales.form.totalPrice} <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={toSafeString(formData.totalPrice)}
                onChange={(e) => handleTotalPriceChange(maskCurrency(e.target.value, language))}
                disabled={isSubmitting}
                placeholder={getCurrencyPlaceholder(language)}
                className={errors.totalPrice ? "border-red-500" : ""}
              />
              {errors.totalPrice && (
                <p className="text-red-500 text-sm mt-1">{errors.totalPrice}</p>
              )}
              {Array.isArray(formData.selectedAnimalIds) &&
              formData.selectedAnimalIds.length > 0 &&
              formData.totalPrice ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t.sales.form.pricePerAnimal}:{" "}
                  {formatCurrency(
                    (Number.parseFloat(
                      String(formData.totalPrice as string)
                        .replaceAll(/[^\d,.-]/g, "")
                        .replaceAll(",", ".")
                    ) || 0) / (formData.selectedAnimalIds?.length || 1),
                    language
                  )}
                </p>
              ) : null}
            </div>
          )}

          <FeeManager
            fees={Array.isArray(formData.fees) ? formData.fees : []}
            onAddFee={addFee}
            onRemoveFee={removeFee}
            onUpdateFee={updateFee}
            disabled={isSubmitting}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.sales.form.animals} <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={animalSearch}
              onChange={(e) => setAnimalSearch(e.target.value)}
              placeholder={t.sales.form.searchAnimals}
              disabled={isSubmitting}
            />
            <div className="mt-2 border border-gray-300 dark:border-gray-600 rounded-md max-h-48 overflow-y-auto">
              {filteredAnimals.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 p-4">
                  {t.sales.form.noAnimals}
                </p>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredAnimals.map((animal) => {
                    const isSold =
                      soldAnimalIds.has(animal.id) &&
                      (!isEdit || !currentSaleAnimalIds.includes(animal.id));
                    return (
                      <label
                        key={animal.id}
                        className={`flex items-center space-x-3 p-2 rounded ${(() => {
                          if (isSold) {
                            return "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800";
                          }
                          if (
                            Array.isArray(formData.selectedAnimalIds) &&
                            formData.selectedAnimalIds.includes(animal.id)
                          ) {
                            return "bg-blue-50 dark:bg-blue-900/20 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30";
                          }
                          return "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50";
                        })()}`}
                        aria-label={`Select animal ${animal.code}`}
                      >
                        <input
                          type="checkbox"
                          checked={
                            Array.isArray(formData.selectedAnimalIds) &&
                            formData.selectedAnimalIds.includes(animal.id)
                          }
                          onChange={() => toggleAnimalSelection(animal.id)}
                          disabled={isSubmitting || isSold}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {animal.code}
                            </span>
                            {isSold && (
                              <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
                                {t.sales.form.sold}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-0">
                            {animal.registrationNumber}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            {errors.selectedAnimalIds && (
              <p className="text-red-500 text-sm mt-1">{errors.selectedAnimalIds}</p>
            )}
          </div>

          {Array.isArray(formData.selectedAnimalIds) && formData.selectedAnimalIds.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {t.sales.form.saleItems}
              </h3>
              <div className="space-y-4">
                {Array.isArray(formData.saleItems) &&
                  formData.saleItems.map(
                    (item: {
                      animalId: string;
                      price: string;
                      weight: string;
                      carcassWeight?: string;
                    }) => {
                      const animal = getAnimalByIdLocal(item.animalId);
                      return (
                        <div
                          key={item.animalId}
                          className="border border-gray-300 dark:border-gray-600 rounded-md p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {animal?.code}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                {animal?.registrationNumber}
                              </span>
                            </div>
                          </div>
                          <FormFieldGroup columns={3}>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t.sales.form.weight} <span className="text-red-500">*</span>
                              </label>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.weight}
                                onChange={(e) =>
                                  handleSaleItemChange(item.animalId, "weight", e.target.value)
                                }
                                disabled={isSubmitting}
                                placeholder="0.00"
                                className={
                                  errors[`weight_${item.animalId}`] ? "border-red-500" : ""
                                }
                              />
                              {errors[`weight_${item.animalId}`] && (
                                <p className="text-red-500 text-sm mt-1">
                                  {errors[`weight_${item.animalId}`]}
                                </p>
                              )}
                            </div>
                            {formData.pricingMode === PricingModeEnum.INDIVIDUAL && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  {t.sales.form.price} <span className="text-red-500">*</span>
                                </label>
                                <Input
                                  type="text"
                                  value={item.price}
                                  onChange={(e) =>
                                    handleSaleItemChange(
                                      item.animalId,
                                      "price",
                                      maskCurrency(e.target.value, language)
                                    )
                                  }
                                  disabled={isSubmitting}
                                  placeholder={getCurrencyPlaceholder(language)}
                                  className={
                                    errors[`price_${item.animalId}`] ? "border-red-500" : ""
                                  }
                                />
                                {errors[`price_${item.animalId}`] && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {errors[`price_${item.animalId}`]}
                                  </p>
                                )}
                              </div>
                            )}
                            {formData.pricingMode === PricingModeEnum.TOTAL && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  {t.sales.form.price}
                                </label>
                                <Input
                                  type="text"
                                  value={item.price}
                                  disabled
                                  className="bg-gray-100 dark:bg-gray-700"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {t.sales.form.calculatedAutomatically}
                                </p>
                              </div>
                            )}
                            {formData.saleType === SaleTypeEnum.SLAUGHTERHOUSE && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  {t.sales.form.carcassWeight}
                                </label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={item.carcassWeight || ""}
                                  onChange={(e) =>
                                    handleSaleItemChange(
                                      item.animalId,
                                      "carcassWeight",
                                      e.target.value
                                    )
                                  }
                                  disabled={isSubmitting}
                                  placeholder="0.00"
                                />
                              </div>
                            )}
                          </FormFieldGroup>
                        </div>
                      );
                    }
                  )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.sales.form.observation}
            </label>
            <textarea
              value={toSafeString(formData.observation)}
              onChange={(e) => baseHandleChange("observation", e.target.value)}
              disabled={isSubmitting}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-md p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t.sales.form.total}
              </span>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(calculateTotal(), language)}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              {cancelButtonText || t.common?.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {(() => {
                if (isSubmitting) return t.common?.saving;
                if (submitButtonText) return submitButtonText;
                return isEdit ? t.sales.form.update : t.sales.form.submit;
              })()}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
