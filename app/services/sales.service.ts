import type { Sale, SaleFormData } from "~/types";
import { SalePaymentMethod } from "~/types";
import { mockSales } from "~/mocks/sales";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";
import { updateAnimal, getAnimalById } from "./animals.service";
import { addCashFlow, deleteCashFlow, updateCashFlow } from "./cash-flow.service";
import {
  addAccountsReceivable,
  deleteAccountsReceivable,
  updateAccountsReceivable,
} from "./accounts-receivable.service";
import { CashFlowCategory, PaymentMethod } from "~/types";
import { AccountsReceivableStatus } from "~/types";
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

export function isAnimalSold(animalId: string): boolean {
  if (!animalId) return false;
  const animal = getAnimalById(animalId);
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

export function addSale(data: SaleFormData): Sale {
  const sale = createEntity(mockSales, data, ID_PREFIX, DEFAULT_ID);

  data.saleItems.forEach((item) => {
    const animal = getAnimalById(item.animalId);
    if (animal) {
      updateAnimal(item.animalId, { status: "sold" });
    }
  });

  const totalFees = getTotalFees(data.fees, data.transportationFee, data.additionalFees);
  const totalAmount = data.totalPrice + totalFees;
  const animalCodes = data.saleItems
    .map((item) => {
      const animal = getAnimalById(item.animalId);
      return animal?.code || item.animalId;
    })
    .join(", ");

  if (data.paymentMethod === SalePaymentMethod.CASH_FLOW) {
    const cashFlow = addCashFlow({
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
    });
    sale.linkedCashFlowId = cashFlow.id;
  } else {
    const accountsReceivable = addAccountsReceivable({
      companyId: data.companyId,
      buyerId: data.buyerId,
      amount: totalAmount,
      dueDate: data.saleDate,
      description: `Venda de animais: ${animalCodes}`,
      category: CashFlowCategory.CATTLE_SALES,
      paymentMethod: PaymentMethod.CASH,
      status: AccountsReceivableStatus.UNPAID,
      propertyId: data.propertyId,
    });
    sale.linkedAccountsReceivableId = accountsReceivable.id;
  }

  updateEntity(mockSales, sale.id, sale);

  return sale;
}

export function updateSale(saleId: string, data: Partial<SaleFormData>): boolean {
  const existingSale = getSaleById(saleId);
  if (!existingSale) return false;

  const previousAnimalIds = existingSale.saleItems.map((item) => item.animalId);
  const newAnimalIds = data.saleItems
    ? data.saleItems.map((item) => item.animalId)
    : previousAnimalIds;

  const removedAnimalIds = previousAnimalIds.filter((id) => !newAnimalIds.includes(id));
  removedAnimalIds.forEach((animalId) => {
    const animal = getAnimalById(animalId);
    if (animal) {
      updateAnimal(animalId, { status: "active" });
    }
  });

  if (data.saleItems) {
    const addedAnimalIds = newAnimalIds.filter((id) => !previousAnimalIds.includes(id));
    addedAnimalIds.forEach((animalId) => {
      updateAnimal(animalId, { status: "sold" });
    });
  }

  if (data.paymentMethod && data.paymentMethod !== existingSale.paymentMethod) {
    const totalFees = getTotalFees(
      data.fees || existingSale.fees,
      data.transportationFee || existingSale.transportationFee,
      data.additionalFees || existingSale.additionalFees
    );
    const totalAmount = (data.totalPrice || existingSale.totalPrice) + totalFees;

    const animalCodes = (data.saleItems || existingSale.saleItems)
      .map((item) => {
        const animal = getAnimalById(item.animalId);
        return animal?.code || item.animalId;
      })
      .join(", ");

    if (existingSale.linkedCashFlowId) {
      deleteCashFlow(existingSale.linkedCashFlowId);
    }
    if (existingSale.linkedAccountsReceivableId) {
      deleteAccountsReceivable(existingSale.linkedAccountsReceivableId);
    }

    let linkedCashFlowId: string | undefined;
    let linkedAccountsReceivableId: string | undefined;

    if (data.paymentMethod === SalePaymentMethod.CASH_FLOW) {
      const cashFlow = addCashFlow({
        companyId: existingSale.companyId,
        type: "income",
        amount: totalAmount,
        date: data.saleDate || existingSale.saleDate,
        description: `Venda de animais: ${animalCodes}`,
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.CASH,
        status: "completed",
        buyerId: data.buyerId || existingSale.buyerId,
        propertyId: data.propertyId || existingSale.propertyId,
      });
      linkedCashFlowId = cashFlow.id;
      linkedAccountsReceivableId = undefined;
    } else {
      const accountsReceivable = addAccountsReceivable({
        companyId: existingSale.companyId,
        buyerId: data.buyerId || existingSale.buyerId,
        amount: totalAmount,
        dueDate: data.saleDate || existingSale.saleDate,
        description: `Venda de animais: ${animalCodes}`,
        category: CashFlowCategory.CATTLE_SALES,
        paymentMethod: PaymentMethod.CASH,
        status: AccountsReceivableStatus.UNPAID,
        propertyId: data.propertyId || existingSale.propertyId,
      });
      linkedAccountsReceivableId = accountsReceivable.id;
      linkedCashFlowId = undefined;
    }

    const updateData: Partial<SaleFormData> & {
      linkedCashFlowId?: string;
      linkedAccountsReceivableId?: string;
    } = {
      ...data,
      linkedCashFlowId,
      linkedAccountsReceivableId,
    };
    return updateEntity(mockSales, saleId, updateData);
  } else {
    if (
      data.totalPrice !== undefined ||
      data.transportationFee !== undefined ||
      data.additionalFees !== undefined
    ) {
      const totalFees = getTotalFees(
        data.fees || existingSale.fees,
        data.transportationFee || existingSale.transportationFee,
        data.additionalFees || existingSale.additionalFees
      );
      const totalAmount = (data.totalPrice || existingSale.totalPrice) + totalFees;

      if (existingSale.linkedCashFlowId) {
        updateCashFlow(existingSale.linkedCashFlowId, { amount: totalAmount });
      }
      if (existingSale.linkedAccountsReceivableId) {
        updateAccountsReceivable(existingSale.linkedAccountsReceivableId, {
          amount: totalAmount,
        });
      }
    }

    return updateEntity(mockSales, saleId, data);
  }

  return true;
}

export function deleteSale(saleId: string): boolean {
  const sale = getSaleById(saleId);
  if (!sale) return false;

  sale.saleItems.forEach((item) => {
    const animal = getAnimalById(item.animalId);
    if (animal) {
      updateAnimal(item.animalId, { status: "active" });
    }
  });

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
