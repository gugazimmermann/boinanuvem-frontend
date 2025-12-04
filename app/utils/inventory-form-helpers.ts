import { InventoryItemCategory } from "~/types";

export interface InventoryFormData {
  category: InventoryItemCategory;
  customCategory: string;
  hasExpiration: boolean;
  expirationDate: string;
  usageAmount?: string;
  usageUnit?: string;
  usageBasis?: string;
  nitrogenContent?: string;
}

export function isMedicineOrVaccine(category: InventoryItemCategory): boolean {
  return (
    category === InventoryItemCategory.MEDICINES || category === InventoryItemCategory.VACCINES
  );
}

export function getUsageFields(formData: InventoryFormData): {
  usageAmount?: number;
  usageUnit?: string;
  usageBasis?: string;
} {
  if (!isMedicineOrVaccine(formData.category)) {
    return {
      usageAmount: undefined,
      usageUnit: undefined,
      usageBasis: undefined,
    };
  }
  return {
    usageAmount: formData.usageAmount?.trim() ? Number.parseFloat(formData.usageAmount) : undefined,
    usageUnit: formData.usageUnit?.trim() ? formData.usageUnit.trim() : undefined,
    usageBasis: formData.usageBasis?.trim() ? formData.usageBasis.trim() : undefined,
  };
}

export function getCustomCategory(formData: InventoryFormData): string | undefined {
  if (formData.category === InventoryItemCategory.CUSTOM && formData.customCategory.trim()) {
    return formData.customCategory.trim();
  }
  return undefined;
}

export function getExpirationDate(formData: InventoryFormData): string | undefined {
  if (formData.hasExpiration && formData.expirationDate) {
    return formData.expirationDate;
  }
  return undefined;
}

export function handleNitrogenContent(
  itemId: string,
  formData: InventoryFormData,
  setNitrogenContent: (itemId: string, nitrogenKgPerUnit: number) => void
): void {
  if (formData.category === InventoryItemCategory.FERTILIZER && formData.nitrogenContent?.trim()) {
    const nitrogenKgPerUnit = Number.parseFloat(formData.nitrogenContent);
    if (!Number.isNaN(nitrogenKgPerUnit) && nitrogenKgPerUnit >= 0) {
      setNitrogenContent(itemId, nitrogenKgPerUnit);
    }
  }
}

export function getInitialStock(initialStock?: string): number {
  if (initialStock?.trim()) {
    const stock = Number.parseFloat(initialStock);
    return Number.isNaN(stock) ? 0 : stock;
  }
  return 0;
}
