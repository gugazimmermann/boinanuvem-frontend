import { useState, useCallback } from "react";
import type { InventoryItemCategory } from "~/types";
import { InventoryItemCategory as Category, PaymentMethod } from "~/types";

export interface InventoryFormData {
  code: string;
  name: string;
  description: string;
  category: InventoryItemCategory;
  customCategory: string;
  unit: string;
  minimumStock: string;
  initialStock: string;
  unitPrice: string;
  supplierId: string;
  hasExpiration: boolean;
  expirationDate: string;
  usageAmount: string;
  usageUnit: string;
  usageBasis: string;
  nitrogenContent: string;
  propertyIds: string[];
  createCashFlowTransaction: boolean;
  paymentMethod: PaymentMethod;
  bankAccountId: string;
  createAccountPayable: boolean;
  dueDate: string;
  accountPayablePaymentMethod: PaymentMethod;
  accountPayableBankAccountId: string;
  observation: string;
}

export interface UseInventoryFormOptions {
  initialData?: Partial<InventoryFormData>;
  translations: {
    inventory: {
      table: {
        code: string;
        name: string;
      };
      new: {
        propertyRequired: string;
        customCategoryRequired: string;
        minimumStockInvalid: string;
        unitPriceInvalid: string;
        initialStockInvalid: string;
        expirationDateRequired: string;
        usageAmountInvalid: string;
        nitrogenContentInvalid?: string;
      };
      movements: {
        new: {
          unitPriceRequired: string;
          paymentMethodRequired: string;
          dueDateRequired: string;
        };
      };
    };
    profile: {
      errors: {
        required: (field: string) => string;
      };
    };
  };
}

const defaultFormData: InventoryFormData = {
  code: "",
  name: "",
  description: "",
  category: Category.CUSTOM,
  customCategory: "",
  unit: "unidade",
  minimumStock: "0",
  initialStock: "0",
  unitPrice: "",
  supplierId: "",
  hasExpiration: false,
  expirationDate: "",
  usageAmount: "",
  usageUnit: "",
  usageBasis: "",
  nitrogenContent: "",
  propertyIds: [],
  createCashFlowTransaction: false,
  paymentMethod: PaymentMethod.PIX,
  bankAccountId: "",
  createAccountPayable: false,
  dueDate: "",
  accountPayablePaymentMethod: PaymentMethod.PIX,
  accountPayableBankAccountId: "",
  observation: "",
};

export function useInventoryForm(options: UseInventoryFormOptions) {
  const { initialData, translations: t } = options;
  const [formData, setFormData] = useState<InventoryFormData>({
    ...defaultFormData,
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback(
    (field: keyof InventoryFormData, value: string | boolean | string[] | PaymentMethod) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      newErrors.code = t.profile.errors.required(t.inventory.table.code);
    }
    if (!formData.name?.trim()) {
      newErrors.name = t.profile.errors.required(t.inventory.table.name);
    }
    if (!formData.propertyIds || formData.propertyIds.length === 0) {
      newErrors.propertyIds = t.inventory.new.propertyRequired;
    }
    if (formData.category === Category.CUSTOM && !formData.customCategory?.trim()) {
      newErrors.customCategory = t.inventory.new.customCategoryRequired;
    }
    const minStock = parseFloat(formData.minimumStock);
    if (isNaN(minStock) || minStock < 0) {
      newErrors.minimumStock = t.inventory.new.minimumStockInvalid;
    }
    if (formData.unitPrice && formData.unitPrice.trim()) {
      const unitPrice = parseFloat(formData.unitPrice);
      if (isNaN(unitPrice) || unitPrice <= 0) {
        newErrors.unitPrice = t.inventory.new.unitPriceInvalid;
      }
    }
    const initialStock =
      formData.initialStock && formData.initialStock.trim() ? parseFloat(formData.initialStock) : 0;
    if (formData.initialStock && formData.initialStock.trim()) {
      if (isNaN(initialStock) || initialStock < 0) {
        newErrors.initialStock = t.inventory.new.initialStockInvalid;
      }
    }
    if (formData.hasExpiration && !formData.expirationDate) {
      newErrors.expirationDate = t.inventory.new.expirationDateRequired;
    }

    if (
      (formData.category === Category.MEDICINES || formData.category === Category.VACCINES) &&
      formData.usageAmount &&
      formData.usageAmount.trim()
    ) {
      const usageAmount = parseFloat(formData.usageAmount);
      if (isNaN(usageAmount) || usageAmount <= 0) {
        newErrors.usageAmount = t.inventory.new.usageAmountInvalid;
      }
    }

    if (
      formData.category === Category.FERTILIZER &&
      formData.nitrogenContent &&
      formData.nitrogenContent.trim()
    ) {
      const nitrogenContent = parseFloat(formData.nitrogenContent);
      if (isNaN(nitrogenContent) || nitrogenContent < 0) {
        newErrors.nitrogenContent =
          t.inventory.new.nitrogenContentInvalid ||
          "Nitrogen content must be greater than or equal to 0";
      }
    }

    if (formData.createCashFlowTransaction && initialStock > 0 && formData.supplierId) {
      if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
        newErrors.unitPrice = t.inventory.movements.new.unitPriceRequired;
      }
      if (!formData.paymentMethod) {
        newErrors.paymentMethod = t.inventory.movements.new.paymentMethodRequired;
      }
    }

    if (formData.createAccountPayable && initialStock > 0 && formData.supplierId) {
      if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
        newErrors.unitPrice = t.inventory.movements.new.unitPriceRequired;
      }
      if (!formData.dueDate) {
        newErrors.dueDate = t.inventory.movements.new.dueDateRequired;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  return {
    formData,
    errors,
    handleChange,
    validate,
    setFormData,
    setErrors,
  };
}
