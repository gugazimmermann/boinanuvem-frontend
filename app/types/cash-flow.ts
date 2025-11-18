export enum CashFlowCategory {
  CATTLE_SALES = "cattle_sales",
  MILK_SALES = "milk_sales",
  BREEDING_SERVICES = "breeding_services",
  GOVERNMENT_SUBSIDIES = "government_subsidies",
  INSURANCE_CLAIMS = "insurance_claims",
  OTHER_INCOME = "other_income",

  FEED = "feed",
  MEDICINES = "medicines",
  VACCINES = "vaccines",
  VETERINARY = "veterinary",
  INSEMINATION = "insemination",
  LABOR = "labor",
  PASTURE = "pasture",
  TRANSPORTATION = "transportation",
  FUEL = "fuel",
  EQUIPMENT = "equipment",
  MAINTENANCE = "maintenance",
  BUILDINGS = "buildings",
  UTILITIES = "utilities",
  INSURANCE = "insurance",
  TAXES = "taxes",
  RENT_LEASE = "rent_lease",
  ANIMAL_ACQUISITION = "animal_acquisition",
  OTHER_EXPENSES = "other_expenses",
}

export enum PaymentMethod {
  CASH = "cash",
  BANK_TRANSFER = "bank_transfer",
  CHECK = "check",
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  PIX = "pix",
  OTHER = "other",
}

export type CashFlowType = "income" | "expense";

export interface CashFlow extends Record<string, unknown> {
  id: string;
  companyId: string;
  type: CashFlowType;
  amount: number;
  date: string;
  description: string;
  category: CashFlowCategory;
  paymentMethod: PaymentMethod;
  status: "completed";
  supplierId?: string;
  buyerId?: string;
  employeeId?: string;
  serviceProviderId?: string;
  paymentDate?: string;
  referenceNumber?: string;
  observation?: string;
  fileIds?: string[];
  bankAccountId?: string;
  propertyId: string;
  createdAt: string;
}

export interface CashFlowFormData {
  companyId: string;
  type: CashFlowType;
  amount: number;
  date: string;
  description: string;
  category: CashFlowCategory;
  paymentMethod: PaymentMethod;
  status: "completed";
  supplierId?: string;
  buyerId?: string;
  employeeId?: string;
  serviceProviderId?: string;
  paymentDate?: string;
  referenceNumber?: string;
  observation?: string;
  fileIds?: string[];
  bankAccountId?: string;
  propertyId: string;
}
