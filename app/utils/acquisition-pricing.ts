import type { Language, PricingMode } from "~/types";
import { PricingMode as PricingModeEnum } from "~/types";
import { parseCurrency } from "~/utils/currency-mask";
import { formatCurrency } from "~/utils/formatting";

export const ARROBA_KG = 30;

export interface AcquisitionFee {
  id: string;
  name: string;
  amount: string;
}

/**
 * Calculates the total fees amount from an array of fees
 */
export function calculateFeesTotal(fees: AcquisitionFee[], language: Language): number {
  return fees.reduce((sum, fee) => sum + parseCurrency(fee.amount, language), 0);
}

/**
 * Calculates the price per animal when using TOTAL pricing mode
 */
export function calculatePricePerAnimal(
  totalPrice: string,
  fees: AcquisitionFee[],
  itemCount: number,
  language: Language
): number {
  if (itemCount === 0) return 0;
  const total = parseCurrency(totalPrice, language);
  const feesTotal = calculateFeesTotal(fees, language);
  return (total + feesTotal) / itemCount;
}

/**
 * Updates item prices when switching to TOTAL pricing mode or when total price changes
 */
export function updateItemPricesForTotalMode<T extends { price: string }>(
  items: T[],
  totalPrice: string,
  fees: AcquisitionFee[],
  language: Language
): T[] {
  if (items.length === 0 || !totalPrice) return items;

  const pricePerAnimal = calculatePricePerAnimal(totalPrice, fees, items.length, language);
  const formatted = formatCurrency(pricePerAnimal, language);

  return items.map((item) => ({ ...item, price: formatted }));
}

/**
 * Calculates the price for a single acquisition item based on pricing mode
 */
export function calculateItemPrice(
  item: { price: string },
  pricingMode: PricingMode | "",
  totalPrice: string,
  items: Array<{ price: string }>,
  language: Language
): number {
  if (pricingMode === PricingModeEnum.TOTAL) {
    const totalPriceNum = parseCurrency(totalPrice, language);
    return totalPriceNum / Math.max(1, items.length);
  }
  return parseCurrency(item.price, language);
}

/**
 * Calculates the total price of all items based on pricing mode
 */
export function calculateItemsTotal(
  items: Array<{ price: string }>,
  pricingMode: PricingMode | "",
  totalPrice: string,
  language: Language
): number {
  if (pricingMode === PricingModeEnum.TOTAL) {
    return parseCurrency(totalPrice, language);
  }
  return items.reduce((sum, item) => sum + parseCurrency(item.price, language), 0);
}
