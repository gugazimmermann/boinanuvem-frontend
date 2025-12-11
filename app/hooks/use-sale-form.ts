import { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "~/i18n";
import { isAnimalSold } from "~/services/sales.service";
import { getWeighingsByAnimalId } from "~/services/weighings.service";
import type { SaleType, PricingMode, SalePaymentMethod } from "~/types";
import { PricingMode as PricingModeEnum } from "~/types";
import { useBaseForm } from "./use-base-form";

function validateBasicFields(
  data: SaleFormData,
  errors: Record<string, string>,
  t: ReturnType<typeof useTranslation>
): void {
  if (!data.propertyId) {
    errors.propertyId = t.sales.errors.propertyRequired;
  }
  if (!data.buyerId) {
    errors.buyerId = t.sales.errors.buyerRequired;
  }
  if (!data.saleType) {
    errors.saleType = t.sales.errors.saleTypeRequired;
  }
  if (!data.pricingMode) {
    errors.pricingMode = t.sales.errors.pricingModeRequired;
  }
  if (!data.paymentMethod) {
    errors.paymentMethod = t.sales.errors.paymentMethodRequired;
  }
}

function validateSaleDate(
  data: SaleFormData,
  errors: Record<string, string>,
  t: ReturnType<typeof useTranslation>
): void {
  if (!data.saleDate) {
    errors.saleDate = t.sales.errors.saleDateRequired;
    return;
  }

  const saleDate = new Date(data.saleDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (saleDate > today) {
    errors.saleDate = t.sales.errors.saleDateFuture;
  }
}

function validateAnimals(
  data: SaleFormData,
  errors: Record<string, string>,
  isEdit: boolean,
  currentSaleAnimalIds: string[],
  t: ReturnType<typeof useTranslation>
): void {
  if (data.selectedAnimalIds.length === 0) {
    errors.selectedAnimalIds = t.sales.errors.animalsRequired;
  }
  // Note: isAnimalSold check is handled in toggleAnimalSelection callback
  // This validation is kept for basic structure but async checks are done elsewhere
}

function validatePricing(
  data: SaleFormData,
  errors: Record<string, string>,
  t: ReturnType<typeof useTranslation>
): void {
  if (data.pricingMode === PricingModeEnum.TOTAL) {
    if (!data.totalPrice) {
      errors.totalPrice = t.sales.errors.totalPriceRequired;
      return;
    }
    const totalPriceNum =
      Number.parseFloat(data.totalPrice.replaceAll(/[^\d,.-]/g, "").replaceAll(",", ".")) || 0;
    if (totalPriceNum <= 0) {
      errors.totalPrice = t.sales.errors.totalPriceInvalid;
    }
  } else if (data.pricingMode === PricingModeEnum.INDIVIDUAL) {
    for (const item of data.saleItems) {
      const priceNum =
        Number.parseFloat(item.price.replaceAll(/[^\d,.-]/g, "").replaceAll(",", ".")) || 0;
      if (!item.price || priceNum <= 0) {
        errors[`price_${item.animalId}`] = t.sales.errors.priceRequired;
      }
    }
  }
}

function validateWeights(
  data: SaleFormData,
  errors: Record<string, string>,
  t: ReturnType<typeof useTranslation>
): void {
  for (const item of data.saleItems) {
    const weightNum = Number.parseFloat(item.weight) || 0;
    if (!item.weight || weightNum <= 0) {
      errors[`weight_${item.animalId}`] = t.sales.errors.weightRequired;
    }
  }
}

export interface SaleFormData {
  propertyId: string;
  buyerId: string;
  saleDate: string;
  saleType: SaleType | "";
  pricingMode: PricingMode | "";
  paymentMethod: SalePaymentMethod | "";
  totalPrice: string;
  fees: Array<{ id: string; name: string; amount: string }>;
  selectedAnimalIds: string[];
  saleItems: Array<{ animalId: string; price: string; weight: string; carcassWeight?: string }>;
  observation: string;
}

export interface UseSaleFormOptions {
  initialData?: Partial<SaleFormData>;
  currentSaleAnimalIds?: string[];
  isEdit?: boolean;
  onSubmit: (data: SaleFormData) => Promise<void> | void;
  onSuccess?: () => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useSaleForm({
  initialData,
  currentSaleAnimalIds = [],
  isEdit = false,
  onSubmit,
  onSuccess,
  successMessage,
  errorMessage,
}: UseSaleFormOptions) {
  const t = useTranslation();
  const feeIdCounter = useRef(0);
  const [animalSearch, setAnimalSearch] = useState("");

  const initialFormData: SaleFormData = {
    propertyId: "",
    buyerId: "",
    saleDate: new Date().toISOString().split("T")[0],
    saleType: "",
    pricingMode: "",
    paymentMethod: "",
    totalPrice: "",
    fees: [],
    selectedAnimalIds: [],
    saleItems: [],
    observation: "",
    ...initialData,
  };

  const baseForm = useBaseForm({
    initialData: initialFormData as unknown as Record<string, unknown>,
    onSubmit: onSubmit as unknown as (data: Record<string, unknown>) => void | Promise<void>,
    onSuccess,
    successMessage,
    errorMessage: errorMessage || t.sales.errors.createFailed,
    validate: (data) => {
      const newErrors: Record<string, string> = {};
      const saleData = data as unknown as SaleFormData;

      validateBasicFields(saleData, newErrors, t);
      validateSaleDate(saleData, newErrors, t);
      validateAnimals(saleData, newErrors, isEdit, currentSaleAnimalIds, t);
      validatePricing(saleData, newErrors, t);
      validateWeights(saleData, newErrors, t);

      return Object.keys(newErrors).length === 0 ? true : newErrors;
    },
  });

  const formData = baseForm.formData as unknown as SaleFormData;
  const selectedAnimalIds = formData.selectedAnimalIds;
  const saleItemsLength = formData.saleItems.length;

  useEffect(() => {
    if (
      Array.isArray(selectedAnimalIds) &&
      selectedAnimalIds.length > 0 &&
      Array.isArray(formData.saleItems) &&
      saleItemsLength === 0
    ) {
      const items = selectedAnimalIds.map((animalId: string) => {
        const weighings = getWeighingsByAnimalId(animalId);
        let weight = "";
        if (weighings.length > 0) {
          const sortedWeighings = weighings.toSorted(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          weight = sortedWeighings[0].weight.toString();
        }
        return {
          animalId,
          price: "",
          weight,
          carcassWeight: "",
        };
      });
      baseForm.setFormData((prev) => ({ ...prev, saleItems: items }));
    }
  }, [selectedAnimalIds, saleItemsLength, baseForm, formData.saleItems]);

  const handleChange = useCallback(
    (field: keyof SaleFormData, value: string | string[]) => {
      baseForm.handleChange(field, value);
    },
    [baseForm]
  );

  const toggleAnimalSelection = useCallback(
    async (animalId: string) => {
      const sold = await isAnimalSold(animalId);
      if (sold && (!isEdit || !currentSaleAnimalIds.includes(animalId))) {
        baseForm.showAlert(t.sales.errors.animalAlreadySold, "error");
        return;
      }

      baseForm.setFormData((prev) => {
        const prevData = prev as unknown as SaleFormData;
        const currentIds = Array.isArray(prevData.selectedAnimalIds)
          ? prevData.selectedAnimalIds
          : [];
        const isSelected = currentIds.includes(animalId);
        let newIds: string[];
        const currentItems = Array.isArray(prevData.saleItems) ? prevData.saleItems : [];
        let newItems = [...currentItems];

        if (isSelected) {
          newIds = currentIds.filter((id: string) => id !== animalId);
          newItems = newItems.filter(
            (item: { animalId: string; price: string; weight: string; carcassWeight?: string }) =>
              item.animalId !== animalId
          );
        } else {
          newIds = [...currentIds, animalId];
          const existingItem = currentItems.find(
            (item: { animalId: string; price: string; weight: string; carcassWeight?: string }) =>
              item.animalId === animalId
          );
          if (!existingItem) {
            const weighings = getWeighingsByAnimalId(animalId);
            let weight = "";
            if (weighings.length > 0) {
              const sortedWeighings = weighings.toSorted(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
              );
              weight = sortedWeighings[0].weight.toString();
            }
            newItems.push({
              animalId,
              price: "",
              weight,
              carcassWeight: "",
            });
          }
        }

        return { ...prev, selectedAnimalIds: newIds, saleItems: newItems };
      });
    },
    [isEdit, currentSaleAnimalIds, baseForm, t]
  );

  const handleSaleItemChange = useCallback(
    (animalId: string, field: "price" | "weight" | "carcassWeight", value: string) => {
      baseForm.setFormData((prev) => {
        const prevData = prev as unknown as SaleFormData;
        const currentItems = Array.isArray(prevData.saleItems) ? prevData.saleItems : [];
        return {
          ...prev,
          saleItems: currentItems.map(
            (item: { animalId: string; price: string; weight: string; carcassWeight?: string }) =>
              item.animalId === animalId ? { ...item, [field]: value } : item
          ),
        };
      });
    },
    [baseForm]
  );

  const handleTotalPriceChange = useCallback(
    (value: string) => {
      baseForm.setFormData((prev) => {
        const prevData = prev as unknown as SaleFormData;
        const newTotalPrice = value;
        const currentItems = Array.isArray(prevData.saleItems) ? prevData.saleItems : [];
        let newItems = [...currentItems];

        if (
          prevData.pricingMode === PricingModeEnum.TOTAL &&
          newTotalPrice &&
          Array.isArray(prevData.selectedAnimalIds) &&
          prevData.selectedAnimalIds.length > 0
        ) {
          const totalPriceNum =
            Number.parseFloat(newTotalPrice.replaceAll(/[^\d,.-]/g, "").replaceAll(",", ".")) || 0;
          const pricePerAnimal = totalPriceNum / prevData.selectedAnimalIds.length;

          newItems = currentItems.map(
            (item: {
              animalId: string;
              price: string;
              weight: string;
              carcassWeight?: string;
            }) => ({
              ...item,
              price: pricePerAnimal.toFixed(2),
            })
          );
        }

        return { ...prev, totalPrice: newTotalPrice, saleItems: newItems };
      });
    },
    [baseForm]
  );

  const handlePricingModeChange = useCallback(
    (value: PricingMode) => {
      baseForm.setFormData((prev) => {
        const prevData = prev as unknown as SaleFormData;
        const currentItems = Array.isArray(prevData.saleItems) ? prevData.saleItems : [];
        let newItems = [...currentItems];
        let newTotalPrice = typeof prevData.totalPrice === "string" ? prevData.totalPrice : "";

        if (
          value === PricingModeEnum.TOTAL &&
          newTotalPrice &&
          Array.isArray(prevData.selectedAnimalIds) &&
          prevData.selectedAnimalIds.length > 0
        ) {
          const totalPriceNum =
            Number.parseFloat(newTotalPrice.replaceAll(/[^\d,.-]/g, "").replaceAll(",", ".")) || 0;
          const pricePerAnimal = totalPriceNum / prevData.selectedAnimalIds.length;
          newItems = currentItems.map(
            (item: {
              animalId: string;
              price: string;
              weight: string;
              carcassWeight?: string;
            }) => ({
              ...item,
              price: pricePerAnimal.toFixed(2),
            })
          );
        } else if (value === PricingModeEnum.INDIVIDUAL) {
          newItems = currentItems.map(
            (item: {
              animalId: string;
              price: string;
              weight: string;
              carcassWeight?: string;
            }) => ({ ...item, price: "" })
          );
          newTotalPrice = "";
        }

        return { ...prev, pricingMode: value, saleItems: newItems, totalPrice: newTotalPrice };
      });
    },
    [baseForm]
  );

  const addFee = useCallback(() => {
    baseForm.setFormData((prev) => ({
      ...prev,
      fees: [
        ...(Array.isArray((prev as unknown as SaleFormData).fees)
          ? (prev as unknown as SaleFormData).fees
          : []),
        {
          id: `fee-${Date.now()}-${++feeIdCounter.current}`,
          name: "",
          amount: "",
        },
      ],
    }));
  }, [baseForm]);

  const removeFee = useCallback(
    (feeId: string) => {
      baseForm.setFormData((prev) => {
        const prevData = prev as unknown as SaleFormData;
        const currentFees = Array.isArray(prevData.fees) ? prevData.fees : [];
        return {
          ...prev,
          fees: currentFees.filter(
            (fee: { id: string; name: string; amount: string }) => fee.id !== feeId
          ),
        };
      });
    },
    [baseForm]
  );

  const updateFee = useCallback(
    (feeId: string, field: "name" | "amount", value: string) => {
      baseForm.setFormData((prev) => {
        const prevData = prev as unknown as SaleFormData;
        const currentFees = Array.isArray(prevData.fees) ? prevData.fees : [];
        return {
          ...prev,
          fees: currentFees.map((fee: { id: string; name: string; amount: string }) =>
            fee.id === feeId ? { ...fee, [field]: value } : fee
          ),
        };
      });
    },
    [baseForm]
  );

  const calculateTotal = useCallback(() => {
    const formData = baseForm.formData as unknown as SaleFormData;
    const saleItems = Array.isArray(formData.saleItems) ? formData.saleItems : [];
    const fees = Array.isArray(formData.fees) ? formData.fees : [];
    const itemsTotal = saleItems.reduce(
      (
        sum: number,
        item: { animalId: string; price: string; weight: string; carcassWeight?: string }
      ) => {
        const price =
          Number.parseFloat(
            String(item.price)
              .replaceAll(/[^\d,.-]/g, "")
              .replaceAll(",", ".")
          ) || 0;
        return sum + price;
      },
      0
    );
    const feesTotal = fees.reduce(
      (sum: number, fee: { id: string; name: string; amount: string }) => {
        const amount =
          Number.parseFloat(
            String(fee.amount)
              .replaceAll(/[^\d,.-]/g, "")
              .replaceAll(",", ".")
          ) || 0;
        return sum + amount;
      },
      0
    );
    return itemsTotal + feesTotal;
  }, [baseForm]);

  return {
    formData: baseForm.formData,
    errors: baseForm.errors,
    isSubmitting: baseForm.isSubmitting,
    alertMessage: baseForm.alertMessage,
    animalSearch,
    setAnimalSearch,
    handleChange,
    toggleAnimalSelection,
    handleSaleItemChange,
    handleTotalPriceChange,
    handlePricingModeChange,
    addFee,
    removeFee,
    updateFee,
    calculateTotal,
    validateForm: () => {
      const result = baseForm.errors;
      return Object.keys(result).length === 0;
    },
    handleSubmit: baseForm.handleSubmit,
    showAlert: baseForm.showAlert,
  };
}
