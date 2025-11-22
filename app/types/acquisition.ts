import { AnimalBreed } from "./animal";
import { BirthPurity } from "./birth";
import { PricingMode } from "./sale";
import type { Fee } from "./fee";

export enum AcquisitionPaymentMethod {
  CASH_FLOW = "cash_flow",
  ACCOUNTS_PAYABLE = "accounts_payable",
}

export interface AcquisitionItem {
  animalId: string;
  price: number;
  weight: number;
  costPerArroba: number;
  breed?: AnimalBreed;
  gender?: "male" | "female";
  birthDate?: string;
  motherId?: string;
  fatherId?: string;
  motherRegistrationNumber?: string;
  fatherRegistrationNumber?: string;
  purity?: BirthPurity;
  birthObservation?: string;
}

export interface Acquisition extends Record<string, unknown> {
  id: string;
  companyId: string;
  propertyId: string;
  supplierId: string;
  acquisitionDate: string;
  pricingMode: PricingMode;
  paymentMethod: AcquisitionPaymentMethod;
  totalPrice: number;
  fees?: Fee[];
  // Legacy fields for backward compatibility
  transportationFee?: number;
  handlingFee?: number;
  acquisitionItems: AcquisitionItem[];
  linkedCashFlowId?: string;
  linkedAccountsPayableId?: string;
  observation?: string;
  createdAt: string;
}

export interface AcquisitionFormData {
  companyId: string;
  propertyId: string;
  supplierId: string;
  acquisitionDate: string;
  pricingMode: PricingMode;
  paymentMethod: AcquisitionPaymentMethod;
  totalPrice: number;
  fees?: Fee[];
  // Legacy fields for backward compatibility
  transportationFee?: number;
  handlingFee?: number;
  acquisitionItems: AcquisitionItem[];
  observation?: string;
}
