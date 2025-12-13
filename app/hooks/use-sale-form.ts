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

  const createSaleItemFromAnimalId = useCallback(async (animalId: string) => {
    const weighings = await getWeighingsByAnimalId(animalId);
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
  }, []);

  useEffect(() => {
    const loadWeighings = async () => {
      if (
        Array.isArray(selectedAnimalIds) &&
        selectedAnimalIds.length > 0 &&
        Array.isArray(formData.saleItems) &&
        saleItemsLength === 0
      ) {
        const itemsPromises = selectedAnimalIds.map(createSaleItemFromAnimalId);
        const items = await Promise.all(itemsPromises);
        baseForm.setFormData((prev) => ({ ...prev, saleItems: items }));
      }
    };
    loadWeighings();
  }, [
    selectedAnimalIds,
    saleItemsLength,
    baseForm,
    formData.saleItems,
    createSaleItemFromAnimalId,
  ]);

  const handleChange = useCallback(
    (field: keyof SaleFormData, value: string | string[]) => {
      baseForm.handleChange(field, value);
    },
    [baseForm]
  );

  const getLatestWeight = useCallback(async (animalId: string): Promise<string> => {
    const weighings = await getWeighingsByAnimalId(animalId);
    if (weighings.length === 0) return "";
    const sortedWeighings = weighings.toSorted(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sortedWeighings[0].weight.toString();
  }, []);

  const removeAnimalFromSelection = useCallback(
    (animalId: string, currentIds: string[], currentItems: SaleFormData["saleItems"]) => {
      const newIds = currentIds.filter((id: string) => id !== animalId);
      const newItems = currentItems.filter(
        (item: { animalId: string; price: string; weight: string; carcassWeight?: string }) =>
          item.animalId !== animalId
      );
      return { newIds, newItems };
    },
    []
  );

  const addAnimalToSelection = useCallback(
    async (animalId: string, currentIds: string[], currentItems: SaleFormData["saleItems"]) => {
      const newIds = [...currentIds, animalId];
      const existingItem = currentItems.find(
        (item: { animalId: string; price: string; weight: string; carcassWeight?: string }) =>
          item.animalId === animalId
      );
      if (existingItem) {
        return { newIds, newItems: currentItems };
      }

      const weight = await getLatestWeight(animalId);
      const newItems = [
        ...currentItems,
        {
          animalId,
          price: "",
          weight,
          carcassWeight: "",
        },
      ];
      return { newIds, newItems };
    },
    [getLatestWeight]
  );

  const toggleAnimalSelection = useCallback(
    async (animalId: string) => {
      const sold = await isAnimalSold(animalId);
      if (sold && (!isEdit || !currentSaleAnimalIds.includes(animalId))) {
        baseForm.showAlert(t.sales.errors.animalAlreadySold, "error");
        return;
      }

      const prevData = baseForm.formData as unknown as SaleFormData;
      const currentIds = Array.isArray(prevData.selectedAnimalIds)
        ? prevData.selectedAnimalIds
        : [];
      const isSelected = currentIds.includes(animalId);
      const currentItems = Array.isArray(prevData.saleItems) ? prevData.saleItems : [];

      const { newIds, newItems } = isSelected
        ? removeAnimalFromSelection(animalId, currentIds, currentItems)
        : await addAnimalToSelection(animalId, currentIds, currentItems);

      baseForm.setFormData((prev) => ({ ...prev, selectedAnimalIds: newIds, saleItems: newItems }));
    },
    [isEdit, currentSaleAnimalIds, baseForm, t, removeAnimalFromSelection, addAnimalToSelection]
  );

  const calculatePricePerAnimal = useCallback(
    (totalPriceStr: string, animalCount: number): number => {
      const totalPriceNum =
        Number.parseFloat(totalPriceStr.replaceAll(/[^\d,.-]/g, "").replaceAll(",", ".")) || 0;
      return animalCount > 0 ? totalPriceNum / animalCount : 0;
    },
    []
  );

  const distributeTotalPriceToItems = useCallback(
    (
      currentItems: SaleFormData["saleItems"],
      pricePerAnimal: number
    ): SaleFormData["saleItems"] => {
      return currentItems.map((item) => ({
        ...item,
        price: pricePerAnimal.toFixed(2),
      }));
    },
    []
  );

  const clearIndividualPrices = useCallback(
    (currentItems: SaleFormData["saleItems"]): SaleFormData["saleItems"] => {
      return currentItems.map((item) => ({ ...item, price: "" }));
    },
    []
  );

  const updateSaleItemInList = useCallback(
    (
      items: SaleFormData["saleItems"],
      animalId: string,
      field: "price" | "weight" | "carcassWeight",
      value: string
    ): SaleFormData["saleItems"] => {
      return items.map((item) => (item.animalId === animalId ? { ...item, [field]: value } : item));
    },
    []
  );

  const handleSaleItemChange = useCallback(
    (animalId: string, field: "price" | "weight" | "carcassWeight", value: string) => {
      baseForm.setFormData((prev) => {
        const prevData = prev as unknown as SaleFormData;
        const currentItems = Array.isArray(prevData.saleItems) ? prevData.saleItems : [];
        return {
          ...prev,
          saleItems: updateSaleItemInList(currentItems, animalId, field, value),
        };
      });
    },
    [baseForm, updateSaleItemInList]
  );

  const calculateNewItemsForTotalPrice = useCallback(
    (
      currentItems: SaleFormData["saleItems"],
      selectedAnimalIds: string[],
      pricingMode: PricingMode | "",
      value: string
    ): SaleFormData["saleItems"] => {
      const shouldDistributePrice =
        pricingMode === PricingModeEnum.TOTAL && value && selectedAnimalIds.length > 0;

      return shouldDistributePrice
        ? distributeTotalPriceToItems(
            currentItems,
            calculatePricePerAnimal(value, selectedAnimalIds.length)
          )
        : currentItems;
    },
    [calculatePricePerAnimal, distributeTotalPriceToItems]
  );

  const handleTotalPriceChange = useCallback(
    (value: string) => {
      baseForm.setFormData((prev) => {
        const prevData = prev as unknown as SaleFormData;
        const currentItems = Array.isArray(prevData.saleItems) ? prevData.saleItems : [];
        const selectedAnimalIds = Array.isArray(prevData.selectedAnimalIds)
          ? prevData.selectedAnimalIds
          : [];

        const newItems = calculateNewItemsForTotalPrice(
          currentItems,
          selectedAnimalIds,
          prevData.pricingMode,
          value
        );

        return { ...prev, totalPrice: value, saleItems: newItems };
      });
    },
    [baseForm, calculateNewItemsForTotalPrice]
  );

  const calculateItemsAndPriceForPricingMode = useCallback(
    (
      value: PricingMode,
      currentItems: SaleFormData["saleItems"],
      selectedAnimalIds: string[],
      currentTotalPrice: string
    ): { newItems: SaleFormData["saleItems"]; newTotalPrice: string } => {
      if (value === PricingModeEnum.TOTAL && currentTotalPrice && selectedAnimalIds.length > 0) {
        const pricePerAnimal = calculatePricePerAnimal(currentTotalPrice, selectedAnimalIds.length);
        return {
          newItems: distributeTotalPriceToItems(currentItems, pricePerAnimal),
          newTotalPrice: currentTotalPrice,
        };
      }
      if (value === PricingModeEnum.INDIVIDUAL) {
        return {
          newItems: clearIndividualPrices(currentItems),
          newTotalPrice: "",
        };
      }
      return {
        newItems: currentItems,
        newTotalPrice: currentTotalPrice,
      };
    },
    [calculatePricePerAnimal, distributeTotalPriceToItems, clearIndividualPrices]
  );

  const handlePricingModeChange = useCallback(
    (value: PricingMode) => {
      baseForm.setFormData((prev) => {
        const prevData = prev as unknown as SaleFormData;
        const currentItems = Array.isArray(prevData.saleItems) ? prevData.saleItems : [];
        const selectedAnimalIds = Array.isArray(prevData.selectedAnimalIds)
          ? prevData.selectedAnimalIds
          : [];
        const currentTotalPrice =
          typeof prevData.totalPrice === "string" ? prevData.totalPrice : "";

        const { newItems, newTotalPrice } = calculateItemsAndPriceForPricingMode(
          value,
          currentItems,
          selectedAnimalIds,
          currentTotalPrice
        );

        return { ...prev, pricingMode: value, saleItems: newItems, totalPrice: newTotalPrice };
      });
    },
    [baseForm, calculateItemsAndPriceForPricingMode]
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

  const filterFeeById = useCallback(
    (fees: SaleFormData["fees"], feeId: string): SaleFormData["fees"] => {
      return fees.filter((fee) => fee.id !== feeId);
    },
    []
  );

  const removeFee = useCallback(
    (feeId: string) => {
      baseForm.setFormData((prev) => {
        const prevData = prev as unknown as SaleFormData;
        const currentFees = Array.isArray(prevData.fees) ? prevData.fees : [];
        return {
          ...prev,
          fees: filterFeeById(currentFees, feeId),
        };
      });
    },
    [baseForm, filterFeeById]
  );

  const updateFeeInList = useCallback(
    (
      fees: SaleFormData["fees"],
      feeId: string,
      field: "name" | "amount",
      value: string
    ): SaleFormData["fees"] => {
      return fees.map((fee) => (fee.id === feeId ? { ...fee, [field]: value } : fee));
    },
    []
  );

  const updateFee = useCallback(
    (feeId: string, field: "name" | "amount", value: string) => {
      baseForm.setFormData((prev) => {
        const prevData = prev as unknown as SaleFormData;
        const currentFees = Array.isArray(prevData.fees) ? prevData.fees : [];
        return {
          ...prev,
          fees: updateFeeInList(currentFees, feeId, field, value),
        };
      });
    },
    [baseForm, updateFeeInList]
  );

  const parsePriceString = useCallback((priceStr: string): number => {
    return Number.parseFloat(priceStr.replaceAll(/[^\d,.-]/g, "").replaceAll(",", ".")) || 0;
  }, []);

  const calculateItemsTotal = useCallback(
    (saleItems: SaleFormData["saleItems"]): number => {
      return saleItems.reduce((sum, item) => sum + parsePriceString(item.price), 0);
    },
    [parsePriceString]
  );

  const calculateFeesTotal = useCallback(
    (fees: SaleFormData["fees"]): number => {
      return fees.reduce((sum, fee) => sum + parsePriceString(fee.amount), 0);
    },
    [parsePriceString]
  );

  const calculateTotal = useCallback(() => {
    const formData = baseForm.formData as unknown as SaleFormData;
    const saleItems = Array.isArray(formData.saleItems) ? formData.saleItems : [];
    const fees = Array.isArray(formData.fees) ? formData.fees : [];
    const itemsTotal = calculateItemsTotal(saleItems);
    const feesTotal = calculateFeesTotal(fees);
    return itemsTotal + feesTotal;
  }, [baseForm, calculateItemsTotal, calculateFeesTotal]);

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
