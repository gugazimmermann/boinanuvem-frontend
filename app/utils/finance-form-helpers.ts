import { CashFlowCategory, PaymentMethod } from "~/types";
import type { AccountsPayableStatus, AccountsReceivableStatus } from "~/types";

export interface CategoryOption {
  value: CashFlowCategory;
  label: string;
}

export interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
}

export interface StatusOption {
  value: AccountsPayableStatus | AccountsReceivableStatus;
  label: string;
}

export function getIncomeCategories(t: {
  cashFlow?: { categories?: Record<string, string> };
}): CategoryOption[] {
  const categories = t.cashFlow?.categories || {};
  return [
    { value: CashFlowCategory.CATTLE_SALES, label: categories.cattle_sales || "" },
    { value: CashFlowCategory.MILK_SALES, label: categories.milk_sales || "" },
    { value: CashFlowCategory.BREEDING_SERVICES, label: categories.breeding_services || "" },
    {
      value: CashFlowCategory.GOVERNMENT_SUBSIDIES,
      label: categories.government_subsidies || "",
    },
    { value: CashFlowCategory.INSURANCE_CLAIMS, label: categories.insurance_claims || "" },
    { value: CashFlowCategory.OTHER_INCOME, label: categories.other_income || "" },
  ];
}

export function getExpenseCategories(t: {
  cashFlow?: { categories?: Record<string, string> };
}): CategoryOption[] {
  const categories = t.cashFlow?.categories || {};
  return [
    { value: CashFlowCategory.FEED, label: categories.feed || "" },
    { value: CashFlowCategory.MEDICINES, label: categories.medicines || "" },
    { value: CashFlowCategory.VACCINES, label: categories.vaccines || "" },
    { value: CashFlowCategory.VETERINARY, label: categories.veterinary || "" },
    { value: CashFlowCategory.INSEMINATION, label: categories.insemination || "" },
    { value: CashFlowCategory.LABOR, label: categories.labor || "" },
    { value: CashFlowCategory.PASTURE, label: categories.pasture || "" },
    { value: CashFlowCategory.TRANSPORTATION, label: categories.transportation || "" },
    { value: CashFlowCategory.FUEL, label: categories.fuel || "" },
    { value: CashFlowCategory.EQUIPMENT, label: categories.equipment || "" },
    { value: CashFlowCategory.MAINTENANCE, label: categories.maintenance || "" },
    { value: CashFlowCategory.BUILDINGS, label: categories.buildings || "" },
    { value: CashFlowCategory.UTILITIES, label: categories.utilities || "" },
    { value: CashFlowCategory.INSURANCE, label: categories.insurance || "" },
    { value: CashFlowCategory.TAXES, label: categories.taxes || "" },
    { value: CashFlowCategory.RENT_LEASE, label: categories.rent_lease || "" },
    {
      value: CashFlowCategory.ANIMAL_ACQUISITION,
      label: categories.animal_acquisition || "",
    },
    { value: CashFlowCategory.OTHER_EXPENSES, label: categories.other_expenses || "" },
  ];
}

export function getPaymentMethods(t: {
  cashFlow?: { paymentMethods: Record<string, string> };
  accountsPayable?: { paymentMethods: Record<string, string> };
  accountsReceivable?: { paymentMethods: Record<string, string> };
}): PaymentMethodOption[] {
  const paymentMethods =
    t.cashFlow?.paymentMethods ||
    t.accountsPayable?.paymentMethods ||
    t.accountsReceivable?.paymentMethods ||
    {};

  return [
    { value: PaymentMethod.CASH, label: paymentMethods.cash },
    { value: PaymentMethod.BANK_TRANSFER, label: paymentMethods.bank_transfer },
    { value: PaymentMethod.CHECK, label: paymentMethods.check },
    { value: PaymentMethod.CREDIT_CARD, label: paymentMethods.credit_card },
    { value: PaymentMethod.DEBIT_CARD, label: paymentMethods.debit_card },
    { value: PaymentMethod.PIX, label: paymentMethods.pix },
    { value: PaymentMethod.OTHER, label: paymentMethods.other },
  ];
}

export function getAccountsPayableStatusOptions(t: {
  accountsPayable?: { status?: Record<string, string> };
}): StatusOption[] {
  const status = t.accountsPayable?.status || {};
  return [
    { value: "unpaid" as AccountsPayableStatus, label: status.unpaid || "" },
    { value: "paid" as AccountsPayableStatus, label: status.paid || "" },
    { value: "overdue" as AccountsPayableStatus, label: status.overdue || "" },
    { value: "partial" as AccountsPayableStatus, label: status.partial || "" },
  ];
}

export function getAccountsReceivableStatusOptions(t: {
  accountsReceivable?: { status?: Record<string, string> };
}): StatusOption[] {
  const status = t.accountsReceivable?.status || {};
  return [
    { value: "unpaid" as AccountsReceivableStatus, label: status.unpaid || "" },
    { value: "paid" as AccountsReceivableStatus, label: status.paid || "" },
    { value: "overdue" as AccountsReceivableStatus, label: status.overdue || "" },
    { value: "partial" as AccountsReceivableStatus, label: status.partial || "" },
  ];
}
