import type { SaleItem, SaleFormData } from "~/types";
import type { SaleFormData as SaleFormDataType } from "~/components/dashboard/records/sale-form";

/**
 * Parses a price string (with currency formatting) to a number
 */
export function parsePrice(priceString: string): number {
  return Number.parseFloat(priceString.replaceAll(/[^\d,.-]/g, "").replaceAll(",", ".")) || 0;
}

/**
 * Transforms sale form items to SaleItem format
 */
export function transformSaleItems(saleItems: SaleFormDataType["saleItems"]): SaleItem[] {
  return saleItems.map((item) => ({
    animalId: item.animalId,
    price: parsePrice(item.price),
    weight: Number.parseFloat(item.weight) || 0,
    carcassWeight: item.carcassWeight ? Number.parseFloat(item.carcassWeight) : undefined,
  }));
}

/**
 * Transforms sale form fees to SaleFormData fees format
 */
export function transformSaleFees(fees: SaleFormDataType["fees"]): SaleFormData["fees"] {
  const transformedFees = fees
    .filter((fee) => fee.name.trim() && fee.amount)
    .map((fee) => ({
      id: fee.id,
      name: fee.name.trim(),
      amount: parsePrice(fee.amount),
    }));

  return transformedFees.length > 0 ? transformedFees : undefined;
}

/**
 * Calculates total price from sale items
 */
export function calculateTotalPrice(saleItems: SaleItem[]): number {
  return saleItems.reduce((sum, item) => sum + item.price, 0);
}

/**
 * Transforms sale form data to SaleFormData format for creation
 */
export function transformSaleFormData(formData: SaleFormDataType, companyId: string): SaleFormData {
  const saleItems = transformSaleItems(formData.saleItems);
  const totalPrice = calculateTotalPrice(saleItems);
  const fees = transformSaleFees(formData.fees);

  return {
    companyId,
    propertyId: formData.propertyId,
    buyerId: formData.buyerId,
    saleDate: formData.saleDate,
    saleType: formData.saleType as SaleFormData["saleType"],
    pricingMode: formData.pricingMode as SaleFormData["pricingMode"],
    paymentMethod: formData.paymentMethod as SaleFormData["paymentMethod"],
    totalPrice,
    fees,
    saleItems,
    observation: formData.observation || undefined,
  };
}

/**
 * Transforms sale form data to partial SaleFormData format for updates
 */
export function transformSaleFormDataForUpdate(formData: SaleFormDataType): Partial<SaleFormData> {
  const saleItems = transformSaleItems(formData.saleItems);
  const totalPrice = calculateTotalPrice(saleItems);
  const fees = transformSaleFees(formData.fees);

  return {
    propertyId: formData.propertyId,
    buyerId: formData.buyerId,
    saleDate: formData.saleDate,
    saleType: formData.saleType as SaleFormData["saleType"],
    pricingMode: formData.pricingMode as SaleFormData["pricingMode"],
    paymentMethod: formData.paymentMethod as SaleFormData["paymentMethod"],
    totalPrice,
    fees,
    saleItems,
    observation: formData.observation || undefined,
  };
}
