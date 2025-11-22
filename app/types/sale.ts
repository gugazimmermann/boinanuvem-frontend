export enum SaleType {
  SLAUGHTERHOUSE = "slaughterhouse",
  OTHER_FARM = "other_farm",
  AUCTION = "auction",
}

export enum PricingMode {
  INDIVIDUAL = "individual",
  TOTAL = "total",
}

export enum SalePaymentMethod {
  CASH_FLOW = "cash_flow",
  ACCOUNTS_RECEIVABLE = "accounts_receivable",
}

import type { Fee } from "./fee";

export interface SaleItem {
  animalId: string;
  price: number;
  weight: number;
  carcassWeight?: number;
}

export interface Sale extends Record<string, unknown> {
  id: string;
  companyId: string;
  propertyId: string;
  buyerId: string;
  saleDate: string;
  saleType: SaleType;
  pricingMode: PricingMode;
  paymentMethod: SalePaymentMethod;
  totalPrice: number;
  fees?: Fee[];

  transportationFee?: number;
  additionalFees?: number;
  saleItems: SaleItem[];
  linkedCashFlowId?: string;
  linkedAccountsReceivableId?: string;
  observation?: string;
  createdAt: string;
}

export interface SaleFormData {
  companyId: string;
  propertyId: string;
  buyerId: string;
  saleDate: string;
  saleType: SaleType;
  pricingMode: PricingMode;
  paymentMethod: SalePaymentMethod;
  totalPrice: number;
  fees?: Fee[];

  transportationFee?: number;
  additionalFees?: number;
  saleItems: SaleItem[];
  observation?: string;
}
