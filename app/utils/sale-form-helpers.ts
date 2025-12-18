import type { SaleItem, SaleFormData, Language } from "~/types";
import type { SaleFormData as SaleFormDataType } from "~/components/dashboard/records/sale-form";
import { parseCurrency } from "~/utils/currency-mask";

/**
 * Parses a price string (with currency formatting) to a number
 */
export function parsePrice(priceString: string, language: Language = "pt"): number {
  return parseCurrency(priceString, language);
}

/**
 * Transforms sale form items to SaleItem format
 */
export function transformSaleItems(
  saleItems: SaleFormDataType["saleItems"],
  language: Language = "pt"
): SaleItem[] {
  return saleItems.map((item) => ({
    animalId: item.animalId,
    price: parsePrice(item.price, language),
    weight: Number.parseFloat(item.weight) || 0,
    carcassWeight: item.carcassWeight ? Number.parseFloat(item.carcassWeight) : undefined,
  }));
}

/**
 * Transforms sale form fees to SaleFormData fees format
 */
export function transformSaleFees(
  fees: SaleFormDataType["fees"],
  language: Language = "pt"
): SaleFormData["fees"] {
  const transformedFees = fees
    .filter((fee) => fee.name.trim() && fee.amount)
    .map((fee) => ({
      id: fee.id,
      name: fee.name.trim(),
      amount: parsePrice(fee.amount, language),
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
export function transformSaleFormData(
  formData: SaleFormDataType,
  companyId: string,
  language: Language = "pt"
): SaleFormData {
  const saleItems = transformSaleItems(formData.saleItems, language);
  const totalPrice = calculateTotalPrice(saleItems);
  const fees = transformSaleFees(formData.fees, language);

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
export function transformSaleFormDataForUpdate(
  formData: SaleFormDataType,
  language: Language = "pt"
): Partial<SaleFormData> {
  const saleItems = transformSaleItems(formData.saleItems, language);
  const totalPrice = calculateTotalPrice(saleItems);
  const fees = transformSaleFees(formData.fees, language);

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
