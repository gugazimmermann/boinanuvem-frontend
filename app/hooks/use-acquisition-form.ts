import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import type { Language, PricingMode } from "~/types";
import { PricingMode as PricingModeEnum } from "~/types";
import { parseCurrency } from "~/utils/currency-mask";
import { formatCurrency } from "~/utils/formatting";
import {
  calculateFeesTotal,
  calculateItemsTotal,
  calculateItemPrice as calculateItemPriceUtil,
  updateItemPricesForTotalMode,
} from "~/utils/acquisition-pricing";
import type { AcquisitionFee } from "~/utils/acquisition-pricing";

export type AcquisitionItemFormData = {
  uiId: string;
  animalId: string;
  code: string;
  registrationNumber: string;
  price: string;
  weight: string;
  breed: string;
  gender: "male" | "female" | "";
  birthDate: string;
  motherId: string;
  fatherId: string;
  motherRegistrationNumber: string;
  fatherRegistrationNumber: string;
  purity?: string;
  birthObservation: string;
};

export type AcquisitionFormData = {
  propertyId: string;
  supplierId: string;
  acquisitionDate: string;
  pricingMode: PricingMode | "";
  paymentMethod: string;
  totalPrice: string;
  fees: AcquisitionFee[];
  acquisitionItems: AcquisitionItemFormData[];
  observation: string;
};

interface UseAcquisitionFormOptions {
  initialFormData: AcquisitionFormData;
  language: Language;
  allowAddItems?: boolean; // For edit mode, items are pre-loaded and can't be added
}

export function useAcquisitionForm({
  initialFormData,
  language,
  allowAddItems = true,
}: UseAcquisitionFormOptions) {
  const [formData, setFormData] = useState<AcquisitionFormData>(initialFormData);
  const feeIdCounter = useRef(0);
  const acquisitionItemIdCounter = useRef(0);

  // Helper function to update form data with initial data
  const updateFormDataFromInitial = useCallback(() => {
    if (initialFormData) {
      setFormData(initialFormData);
    }
  }, [initialFormData]);

  // Helper function to sync item prices in TOTAL mode
  const syncItemPricesForTotalMode = useCallback(
    (prev: AcquisitionFormData): AcquisitionFormData => {
      if (prev.pricingMode !== PricingModeEnum.TOTAL) return prev;
      if (!prev.totalPrice) return prev;
      if (prev.acquisitionItems.length === 0) return prev;

      const total = parseCurrency(prev.totalPrice, language);
      const fees = calculateFeesTotal(prev.fees, language);
      const totalWithFeesLocal = total + fees;
      if (totalWithFeesLocal <= 0) return prev;

      const perAnimal = totalWithFeesLocal / prev.acquisitionItems.length;
      const formatted = formatCurrency(perAnimal, language);

      const alreadySynced = prev.acquisitionItems.every((it) => it.price === formatted);
      if (alreadySynced) return prev;

      return {
        ...prev,
        acquisitionItems: prev.acquisitionItems.map((it) => ({ ...it, price: formatted })),
      };
    },
    [language]
  );

  // Update form data when initialFormData changes (for edit mode)
  useEffect(() => {
    // Use setTimeout to avoid synchronous setState in effect
    setTimeout(updateFormDataFromInitial, 0);
  }, [updateFormDataFromInitial]);

  // When pricing mode is TOTAL, the per-animal price is derived from totalPrice.
  // Keep it in sync when totalPrice/fees or number of items changes.
  useEffect(() => {
    // Use setTimeout to avoid synchronous setState in effect
    setTimeout(() => {
      setFormData(syncItemPricesForTotalMode);
    }, 0);
  }, [
    formData.pricingMode,
    formData.totalPrice,
    formData.fees,
    formData.acquisitionItems.length,
    syncItemPricesForTotalMode,
  ]);

  const handleAcquisitionItemChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const newItems = [...prev.acquisitionItems];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, acquisitionItems: newItems };
    });
  };

  const addNewAnimalItem = () => {
    if (!allowAddItems) return;

    setFormData((prev) => {
      const isTotalMode = prev.pricingMode === PricingModeEnum.TOTAL;
      const nextLength = prev.acquisitionItems.length + 1;

      // Calculate initial price for new item in TOTAL mode (including fees)
      let price = "";
      if (isTotalMode && prev.totalPrice) {
        const fees = calculateFeesTotal(prev.fees, language);
        const totalWithFees = parseCurrency(prev.totalPrice, language) + fees;
        price = formatCurrency(totalWithFees / nextLength, language);
      }

      const newItem: AcquisitionItemFormData = {
        uiId: `acq-item-${Date.now()}-${++acquisitionItemIdCounter.current}`,
        animalId: "",
        code: "",
        registrationNumber: "",
        price,
        weight: "",
        breed: "",
        gender: "" as "male" | "female" | "",
        birthDate: "",
        motherId: "",
        fatherId: "",
        motherRegistrationNumber: "",
        fatherRegistrationNumber: "",
        birthObservation: "",
      };

      const nextItems = [...prev.acquisitionItems, newItem];
      // In TOTAL mode, recalculate all prices to include fees
      if (isTotalMode && prev.totalPrice && nextItems.length > 0) {
        const updatedItems = updateItemPricesForTotalMode(
          nextItems,
          prev.totalPrice,
          prev.fees,
          language
        );
        return { ...prev, acquisitionItems: updatedItems };
      }

      return { ...prev, acquisitionItems: nextItems };
    });
  };

  const removeAnimalItem = (index: number) => {
    setFormData((prev) => {
      const nextItems = prev.acquisitionItems.filter((_, i) => i !== index);
      if (prev.pricingMode === PricingModeEnum.TOTAL && prev.totalPrice && nextItems.length > 0) {
        const updatedItems = updateItemPricesForTotalMode(
          nextItems,
          prev.totalPrice,
          prev.fees,
          language
        );
        return { ...prev, acquisitionItems: updatedItems };
      }
      return { ...prev, acquisitionItems: nextItems };
    });
  };

  // Helper to calculate price per animal in TOTAL mode
  const calculatePricePerAnimal = (totalPrice: string, itemCount: number): string => {
    if (!totalPrice || itemCount === 0) return "";
    const totalPriceNum = parseCurrency(totalPrice, language);
    const pricePerAnimal = totalPriceNum / itemCount;
    return formatCurrency(pricePerAnimal, language);
  };

  // Helper to update item prices for TOTAL mode
  const updateItemsForTotalPrice = (
    items: AcquisitionItemFormData[],
    totalPrice: string
  ): AcquisitionItemFormData[] => {
    if (items.length === 0 || !totalPrice) return items;
    const pricePerAnimal = calculatePricePerAnimal(totalPrice, items.length);
    return items.map((item) => ({ ...item, price: pricePerAnimal }));
  };

  const handleTotalPriceChange = (value: string) => {
    setFormData((prev) => {
      const newItems =
        prev.pricingMode === PricingModeEnum.TOTAL && value && prev.acquisitionItems.length > 0
          ? updateItemsForTotalPrice(prev.acquisitionItems, value)
          : prev.acquisitionItems;

      return { ...prev, totalPrice: value, acquisitionItems: newItems };
    });
  };

  const handlePricingModeChange = (value: PricingMode) => {
    setFormData((prev) => {
      let newItems = [...prev.acquisitionItems];
      let newTotalPrice = prev.totalPrice;

      if (value === PricingModeEnum.TOTAL && prev.totalPrice && prev.acquisitionItems.length > 0) {
        newItems = updateItemsForTotalPrice(prev.acquisitionItems, prev.totalPrice);
      } else if (value === PricingModeEnum.INDIVIDUAL) {
        // For new mode, clear prices; for edit mode, keep existing
        if (allowAddItems) {
          newItems = prev.acquisitionItems.map((item) => ({ ...item, price: "" }));
          newTotalPrice = "";
        } else {
          newTotalPrice = "";
        }
      }

      return { ...prev, pricingMode: value, acquisitionItems: newItems, totalPrice: newTotalPrice };
    });
  };

  const addFee = () => {
    setFormData((prev) => ({
      ...prev,
      fees: [
        ...prev.fees,
        {
          id: `fee-${Date.now()}-${++feeIdCounter.current}`,
          name: "",
          amount: "",
        },
      ],
    }));
  };

  const removeFee = (feeId: string) => {
    setFormData((prev) => ({
      ...prev,
      fees: prev.fees.filter((fee) => fee.id !== feeId),
    }));
  };

  const updateFee = (feeId: string, field: "name" | "amount", value: string) => {
    setFormData((prev) => ({
      ...prev,
      fees: prev.fees.map((fee) => (fee.id === feeId ? { ...fee, [field]: value } : fee)),
    }));
  };

  const calculateItemPrice = (item: AcquisitionItemFormData): number => {
    return calculateItemPriceUtil(
      item,
      formData.pricingMode,
      formData.totalPrice,
      formData.acquisitionItems,
      language
    );
  };

  const processFees = () => {
    return formData.fees
      .filter((fee) => fee.name.trim() && fee.amount)
      .map((fee) => ({
        id: fee.id,
        name: fee.name.trim(),
        amount: parseCurrency(fee.amount, language),
      }));
  };

  const feesTotal = useMemo(
    () => calculateFeesTotal(formData.fees, language),
    [formData.fees, language]
  );

  const itemsTotal = useMemo(
    () =>
      calculateItemsTotal(
        formData.acquisitionItems,
        formData.pricingMode,
        formData.totalPrice,
        language
      ),
    [formData.acquisitionItems, formData.pricingMode, formData.totalPrice, language]
  );

  const totalWithFees = itemsTotal + feesTotal;

  return {
    formData,
    setFormData,
    handleAcquisitionItemChange,
    addNewAnimalItem,
    removeAnimalItem,
    handleTotalPriceChange,
    handlePricingModeChange,
    addFee,
    removeFee,
    updateFee,
    calculateItemPrice,
    processFees,
    feesTotal,
    itemsTotal,
    totalWithFees,
  };
}
