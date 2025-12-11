import type { Sale, SaleFormData } from "~/types";
import {
  SalePaymentMethod,
  CashFlowCategory,
  PaymentMethod,
  AccountsReceivableStatus,
} from "~/types";
import { mockSales } from "~/mocks/sales";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";
import { updateAnimal, getAnimalById } from "./animals.service";
import { addCashFlow, deleteCashFlow, updateCashFlow } from "./cash-flow.service";
import {
  addAccountsReceivable,
  deleteAccountsReceivable,
  updateAccountsReceivable,
} from "./accounts-receivable.service";
import { getTotalFees } from "~/utils/fees";

const ID_PREFIX = "sa0e8400-e29b-41d4-a716";
const DEFAULT_ID = "sa0e8400-e29b-41d4-a716-446655440009";

export function getSaleById(saleId: string | undefined): Sale | undefined {
  return findById(mockSales, saleId);
}

export function getSalesByCompanyId(companyId: string): Sale[] {
  return findByField(mockSales, "companyId", companyId);
}

export function getSalesByBuyerId(buyerId: string): Sale[] {
  return findByField(mockSales, "buyerId", buyerId);
}

export function getSalesByAnimalId(animalId: string): Sale[] {
  if (!animalId) return [];
  return mockSales.filter((sale) => sale.saleItems.some((item) => item.animalId === animalId));
}

export async function isAnimalSold(animalId: string): Promise<boolean> {
  if (!animalId) return false;
  const animal = await getAnimalById(animalId);
  return animal?.status === "sold";
}

export function getSalesByDateRange(companyId: string, startDate: string, endDate: string): Sale[] {
  return getSalesByCompanyId(companyId).filter((sale) => {
    const saleDate = new Date(sale.saleDate);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return saleDate >= start && saleDate <= end;
  });
}

export function getSalesBySaleType(companyId: string, saleType: string): Sale[] {
  return getSalesByCompanyId(companyId).filter((sale) => sale.saleType === saleType);
}

export async function addSale(data: SaleFormData): Promise<Sale> {
  const sale = createEntity(mockSales, data, ID_PREFIX, DEFAULT_ID);

  // Update animal statuses to "sold"
  for (const item of data.saleItems) {
    const animal = await getAnimalById(item.animalId);
    if (animal) {
      await updateAnimal(item.animalId, { status: "sold" });
    }
  }

  const totalFees = getTotalFees(data.fees, data.transportationFee, data.additionalFees);
  const totalAmount = data.totalPrice + totalFees;

  // Get animal codes for description
  const animalCodesPromises = data.saleItems.map(async (item) => {
    const animal = await getAnimalById(item.animalId);
    return animal?.code || item.animalId;
  });
  const animalCodesArray = await Promise.all(animalCodesPromises);
  const animalCodes = animalCodesArray.join(", ");

  if (data.paymentMethod === SalePaymentMethod.CASH_FLOW) {
    const cashFlow = await Promise.resolve(
      addCashFlow({
        companyId: data.companyId,
        type: "income",
        amount: totalAmount,
        date: data.saleDate,
        description: `Venda de animais: ${animalCodes}`,
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.CASH,
        status: "completed",
        buyerId: data.buyerId,
        propertyId: data.propertyId,
      })
    );
    sale.linkedCashFlowId = cashFlow.id;
    sale.linkedAccountsReceivableId = undefined;
  } else {
    const accountsReceivable = await Promise.resolve(
      addAccountsReceivable({
        companyId: data.companyId,
        buyerId: data.buyerId,
        amount: totalAmount,
        dueDate: data.saleDate,
        description: `Venda de animais: ${animalCodes}`,
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.CASH,
        status: AccountsReceivableStatus.UNPAID,
        propertyId: data.propertyId,
      })
    );
    sale.linkedAccountsReceivableId = accountsReceivable.id;
    sale.linkedCashFlowId = undefined;
  }

  // Update the sale in the array directly to preserve linked IDs
  const saleIndex = mockSales.findIndex((s) => s.id === sale.id);
  if (saleIndex !== -1) {
    mockSales[saleIndex] = sale;
  }

  return sale;
}

async function updateAnimalStatuses(
  previousIds: string[],
  newIds: string[],
  status: "active" | "sold"
): Promise<void> {
  const removedIds = previousIds.filter((id) => !newIds.includes(id));
  for (const animalId of removedIds) {
    const animal = await getAnimalById(animalId);
    if (animal) {
      await updateAnimal(animalId, { status });
    }
  }
}

async function getAnimalCodes(saleItems: (typeof mockSales)[0]["saleItems"]): Promise<string> {
  const codesPromises = saleItems.map(async (item) => {
    const animal = await getAnimalById(item.animalId);
    return animal?.code || item.animalId;
  });
  const codes = await Promise.all(codesPromises);
  return codes.join(", ");
}

function calculateTotalAmount(data: Partial<SaleFormData>, existingSale: Sale): number {
  const totalFees = getTotalFees(
    data.fees ?? existingSale.fees,
    data.transportationFee ?? existingSale.transportationFee,
    data.additionalFees ?? existingSale.additionalFees
  );
  return (data.totalPrice ?? existingSale.totalPrice) + totalFees;
}

async function handlePaymentMethodChange(
  existingSale: Sale,
  paymentMethod: SalePaymentMethod,
  data: Partial<SaleFormData>,
  saleItems: typeof existingSale.saleItems,
  totalAmount: number,
  animalCodes: string
): Promise<{ linkedCashFlowId?: string; linkedAccountsReceivableId?: string }> {
  if (existingSale.linkedCashFlowId) {
    deleteCashFlow(existingSale.linkedCashFlowId);
  }
  if (existingSale.linkedAccountsReceivableId) {
    deleteAccountsReceivable(existingSale.linkedAccountsReceivableId);
  }

  if (paymentMethod === SalePaymentMethod.CASH_FLOW) {
    const cashFlow = addCashFlow({
      companyId: existingSale.companyId,
      type: "income",
      amount: totalAmount,
      date: data.saleDate ?? existingSale.saleDate,
      description: `Venda de animais: ${animalCodes}`,
      category: CashFlowCategory.CATTLE_SALES,
      paymentMethod: PaymentMethod.CASH,
      status: "completed",
      buyerId: data.buyerId ?? existingSale.buyerId,
      propertyId: data.propertyId ?? existingSale.propertyId,
    });
    return { linkedCashFlowId: cashFlow.id, linkedAccountsReceivableId: undefined };
  }

  const accountsReceivable = addAccountsReceivable({
    companyId: existingSale.companyId,
    buyerId: data.buyerId ?? existingSale.buyerId,
    amount: totalAmount,
    dueDate: data.saleDate ?? existingSale.saleDate,
    description: `Venda de animais: ${animalCodes}`,
    category: CashFlowCategory.CATTLE_SALES,
    paymentMethod: PaymentMethod.CASH,
    status: AccountsReceivableStatus.UNPAID,
    propertyId: data.propertyId ?? existingSale.propertyId,
  });
  return { linkedCashFlowId: undefined, linkedAccountsReceivableId: accountsReceivable.id };
}

async function updateLinkedFinancialRecords(
  existingSale: Sale,
  totalAmount: number
): Promise<void> {
  if (existingSale.linkedCashFlowId) {
    updateCashFlow(existingSale.linkedCashFlowId, { amount: totalAmount });
  }
  if (existingSale.linkedAccountsReceivableId) {
    updateAccountsReceivable(existingSale.linkedAccountsReceivableId, {
      amount: totalAmount,
    });
  }
}

export async function updateSale(saleId: string, data: Partial<SaleFormData>): Promise<boolean> {
  const existingSale = getSaleById(saleId);
  if (!existingSale) return false;

  const previousAnimalIds = existingSale.saleItems.map((item) => item.animalId);
  const newAnimalIds = data.saleItems
    ? data.saleItems.map((item) => item.animalId)
    : previousAnimalIds;

  // Set removed animals back to "active"
  await updateAnimalStatuses(previousAnimalIds, newAnimalIds, "active");
  // Set newly added animals to "sold"
  if (data.saleItems) {
    await updateAnimalStatuses(newAnimalIds, previousAnimalIds, "sold");
  }

  const saleItems = data.saleItems ?? existingSale.saleItems;
  const hasPaymentMethodChange =
    data.paymentMethod && data.paymentMethod !== existingSale.paymentMethod;

  if (hasPaymentMethodChange && data.paymentMethod) {
    const totalAmount = calculateTotalAmount(data, existingSale);
    const animalCodes = await getAnimalCodes(saleItems);
    const financialLinks = await handlePaymentMethodChange(
      existingSale,
      data.paymentMethod,
      data,
      saleItems,
      totalAmount,
      animalCodes
    );

    const updateData: Partial<SaleFormData> & {
      linkedCashFlowId?: string;
      linkedAccountsReceivableId?: string;
    } = {
      ...data,
      ...financialLinks,
    };
    return updateEntity(mockSales, saleId, updateData);
  }

  const hasPriceChange =
    data.totalPrice !== undefined ||
    data.transportationFee !== undefined ||
    data.additionalFees !== undefined;

  if (hasPriceChange) {
    const totalAmount = calculateTotalAmount(data, existingSale);
    await updateLinkedFinancialRecords(existingSale, totalAmount);
  }

  return updateEntity(mockSales, saleId, data);
}

export async function deleteSale(saleId: string): Promise<boolean> {
  const sale = getSaleById(saleId);
  if (!sale) return false;

  for (const item of sale.saleItems) {
    const animal = await getAnimalById(item.animalId);
    if (animal) {
      await updateAnimal(item.animalId, { status: "active" });
    }
  }

  if (sale.linkedCashFlowId) {
    deleteCashFlow(sale.linkedCashFlowId);
  }
  if (sale.linkedAccountsReceivableId) {
    deleteAccountsReceivable(sale.linkedAccountsReceivableId);
  }

  return deleteEntity(mockSales, saleId);
}

export function generateSaleId(index: number): string {
  const base = 446655440100 + index;
  return `${ID_PREFIX}-${base.toString().padStart(12, "0")}`;
}
