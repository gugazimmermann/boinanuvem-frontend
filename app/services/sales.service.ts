import type { Sale, SaleFormData } from "~/types";
import {
  SalePaymentMethod,
  CashFlowCategory,
  PaymentMethod,
  AccountsReceivableStatus,
} from "~/types";
import { apiClient } from "./api-client";
import { handleApiError, createResourceErrorMessages } from "./error-handlers";
import { updateAnimal, getAnimalById } from "./animals.service";
import { addCashFlow, deleteCashFlow, updateCashFlow } from "./cash-flow.service";
import {
  addAccountsReceivable,
  deleteAccountsReceivable,
  updateAccountsReceivable,
} from "./accounts-receivable.service";
import { getTotalFees } from "~/utils/fees";
import {
  createListHandler,
  createGetByIdHandler,
  createGetByFilterHandler,
  createDateRangeFilter,
} from "./service-helpers";
import { createEntityTransform } from "./transform-helpers";

const salesErrors = createResourceErrorMessages("vendas");

/**
 * Transform backend SaleResponseDto to frontend Sale type
 */
const transformSale = createEntityTransform<Sale>({
  dateStringFields: ["saleDate"],
  dateTimeFields: ["createdAt"],
  amountFields: [],
  customTransform: (sale) => ({
    ...sale,
    saleItems: sale.saleItems.map((item) => ({
      animalId: item.animalId,
      price: typeof item.price === "number" ? item.price : Number.parseFloat(String(item.price)),
      weight:
        typeof item.weight === "number" ? item.weight : Number.parseFloat(String(item.weight)),
      carcassWeight: (() => {
        if (item.carcassWeight === undefined || item.carcassWeight === null) {
          return undefined;
        }
        if (typeof item.carcassWeight === "number") {
          return item.carcassWeight;
        }
        return Number.parseFloat(String(item.carcassWeight));
      })(),
    })),
  }),
});

/**
 * Transform SaleFormData to CreateSaleDto format
 */
function transformSaleFormDataToDto(data: SaleFormData) {
  return {
    propertyId: data.propertyId,
    buyerId: data.buyerId,
    saleDate: data.saleDate,
    saleType: data.saleType,
    pricingMode: data.pricingMode,
    paymentMethod: data.paymentMethod,
    totalPrice:
      typeof data.totalPrice === "number"
        ? data.totalPrice
        : Number.parseFloat(String(data.totalPrice)) || 0,
    fees: data.fees?.map((fee) => ({
      id: fee.id,
      name: fee.name,
      amount:
        typeof fee.amount === "number" ? fee.amount : Number.parseFloat(String(fee.amount)) || 0,
    })),
    transportationFee: data.transportationFee,
    additionalFees: data.additionalFees,
    saleItems: data.saleItems.map((item) => ({
      animalId: item.animalId,
      price:
        typeof item.price === "number" ? item.price : Number.parseFloat(String(item.price)) || 0,
      weight:
        typeof item.weight === "number" ? item.weight : Number.parseFloat(String(item.weight)) || 0,
      carcassWeight: (() => {
        if (!item.carcassWeight) {
          return undefined;
        }
        if (typeof item.carcassWeight === "number") {
          return item.carcassWeight;
        }
        return Number.parseFloat(String(item.carcassWeight));
      })(),
    })),
    observation: data.observation,
  };
}

/**
 * Get all sales for the current user's company via API
 */
export const getSalesByCompanyId = createListHandler<Sale>({
  endpoint: "/sales",
  errorMessages: salesErrors.list,
  transform: transformSale,
});

/**
 * Get a single sale by ID via API
 */
export const getSaleById = createGetByIdHandler<Sale>({
  endpoint: "/sales",
  errorMessages: salesErrors.view,
  transform: transformSale,
  custom403Message: "Você não tem permissão para visualizar esta venda",
});

/**
 * Get sales by buyer ID
 */
export const getSalesByBuyerId = createGetByFilterHandler<Sale>({
  endpoint: "/sales",
  errorMessages: salesErrors.list,
  transform: transformSale,
  filterFn: (sale, buyerId) => sale.buyerId === buyerId,
});

/**
 * Get sales by animal ID via API
 */
export async function getSalesByAnimalId(animalId: string): Promise<Sale[]> {
  if (!animalId) return [];
  try {
    const sales = await apiClient.get<Sale[]>(`/sales/animal/${animalId}`);
    return sales.map(transformSale);
  } catch (error) {
    try {
      handleApiError(error, salesErrors.list);
    } catch {
      return [];
    }
  }
}

/**
 * Check if an animal is sold
 */
export async function isAnimalSold(animalId: string): Promise<boolean> {
  if (!animalId) return false;
  const animal = await getAnimalById(animalId);
  return animal?.status === "sold";
}

/**
 * Get sales by date range
 */
export const getSalesByDateRange = createDateRangeFilter<Sale>({
  endpoint: "/sales",
  errorMessages: salesErrors.list,
  transform: transformSale,
  dateField: "saleDate",
});

/**
 * Get sales by sale type
 */
export const getSalesBySaleType = createGetByFilterHandler<Sale>({
  endpoint: "/sales",
  errorMessages: salesErrors.list,
  transform: transformSale,
  filterFn: (sale, saleType) => sale.saleType === saleType,
});

/**
 * Create a new sale via API
 */
export async function addSale(data: SaleFormData): Promise<Sale> {
  try {
    const createDto = transformSaleFormDataToDto(data);
    const sale = await apiClient.post<Sale>("/sales", createDto);
    const transformedSale = transformSale(sale);

    const totalFees = getTotalFees(data.fees, data.transportationFee, data.additionalFees);
    const totalAmount = data.totalPrice + totalFees;

    // Get animal codes for description
    const animalCodesPromises = data.saleItems.map(async (item) => {
      const animal = await getAnimalById(item.animalId);
      return animal?.code || item.animalId;
    });
    const animalCodesArray = await Promise.all(animalCodesPromises);
    const animalCodes = animalCodesArray.join(", ");

    // Update animal statuses to "sold"
    const animalIds = data.saleItems.map((item) => item.animalId);
    await updateAddedAnimalsStatus(animalIds);

    // Create linked financial records if needed
    if (data.paymentMethod === SalePaymentMethod.CASH_FLOW) {
      const _cashFlow = await addCashFlow({
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
      // Note: The backend doesn't support updating linkedCashFlowId after creation
      // This would need to be handled differently or the backend updated
    } else {
      const _accountsReceivable = await addAccountsReceivable({
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
      // Note: The backend doesn't support updating linkedAccountsReceivableId after creation
      // This would need to be handled differently or the backend updated
    }

    return transformedSale;
  } catch (error) {
    handleApiError(error, {
      ...salesErrors.create,
      400: "Dados inválidos. Verifique se os animais estão disponíveis para venda",
    });
  }
}

/**
 * Update animal statuses when animals are removed from sale
 */
async function updateRemovedAnimalsStatus(removedIds: string[]): Promise<void> {
  for (const animalId of removedIds) {
    const animal = await getAnimalById(animalId);
    if (animal) {
      await updateAnimal(animalId, { status: "active" });
    }
  }
}

/**
 * Update animal statuses when animals are added to sale
 */
async function updateAddedAnimalsStatus(addedIds: string[]): Promise<void> {
  for (const animalId of addedIds) {
    const animal = await getAnimalById(animalId);
    if (animal) {
      await updateAnimal(animalId, { status: "sold" });
    }
  }
}

/**
 * Build update DTO from partial sale form data
 */
function buildSaleUpdateDto(
  data: Partial<SaleFormData>
): Partial<ReturnType<typeof transformSaleFormDataToDto>> {
  const updateDto: Partial<ReturnType<typeof transformSaleFormDataToDto>> = {};
  if (data.propertyId !== undefined) updateDto.propertyId = data.propertyId;
  if (data.buyerId !== undefined) updateDto.buyerId = data.buyerId;
  if (data.saleDate !== undefined) updateDto.saleDate = data.saleDate;
  if (data.saleType !== undefined) updateDto.saleType = data.saleType;
  if (data.pricingMode !== undefined) updateDto.pricingMode = data.pricingMode;
  if (data.paymentMethod !== undefined) updateDto.paymentMethod = data.paymentMethod;
  if (data.totalPrice !== undefined) updateDto.totalPrice = data.totalPrice;
  if (data.fees !== undefined) updateDto.fees = data.fees;
  if (data.transportationFee !== undefined) updateDto.transportationFee = data.transportationFee;
  if (data.additionalFees !== undefined) updateDto.additionalFees = data.additionalFees;
  if (data.saleItems !== undefined) {
    updateDto.saleItems = data.saleItems.map((item) => ({
      animalId: item.animalId,
      price: item.price,
      weight: item.weight,
      carcassWeight: item.carcassWeight,
    }));
  }
  if (data.observation !== undefined) updateDto.observation = data.observation;
  return updateDto;
}

/**
 * Update linked financial records if prices changed
 */
async function updateLinkedFinancialRecords(
  existingSale: Sale,
  data: Partial<SaleFormData>,
  totalAmount: number
): Promise<void> {
  if (existingSale.linkedCashFlowId) {
    await updateCashFlow(existingSale.linkedCashFlowId, { amount: totalAmount });
  }
  if (existingSale.linkedAccountsReceivableId) {
    await updateAccountsReceivable(existingSale.linkedAccountsReceivableId, {
      amount: totalAmount,
    });
  }
}

/**
 * Update an existing sale via API
 */
export async function updateSale(saleId: string, data: Partial<SaleFormData>): Promise<boolean> {
  try {
    const existingSale = await getSaleById(saleId);
    if (!existingSale) {
      throw new Error("Venda não encontrada");
    }

    const previousAnimalIds = existingSale.saleItems.map((item) => item.animalId);
    const newAnimalIds = data.saleItems
      ? data.saleItems.map((item) => item.animalId)
      : previousAnimalIds;

    // Set removed animals back to "active"
    const removedIds = previousAnimalIds.filter((id) => !newAnimalIds.includes(id));
    await updateRemovedAnimalsStatus(removedIds);

    // Set newly added animals to "sold"
    if (data.saleItems) {
      const addedIds = newAnimalIds.filter((id) => !previousAnimalIds.includes(id));
      await updateAddedAnimalsStatus(addedIds);
    }

    // Transform update data
    const updateDto = buildSaleUpdateDto(data);
    await apiClient.put<Sale>(`/sales/${saleId}`, updateDto);

    // Update linked financial records if prices changed
    const hasPriceChange =
      data.totalPrice !== undefined ||
      data.transportationFee !== undefined ||
      data.additionalFees !== undefined;

    if (hasPriceChange) {
      const totalFees = getTotalFees(
        data.fees ?? existingSale.fees,
        data.transportationFee ?? existingSale.transportationFee,
        data.additionalFees ?? existingSale.additionalFees
      );
      const totalAmount = (data.totalPrice ?? existingSale.totalPrice) + totalFees;
      await updateLinkedFinancialRecords(existingSale, data, totalAmount);
    }

    return true;
  } catch (error) {
    handleApiError(error, {
      ...salesErrors.update,
      400: "Dados inválidos. Verifique os campos preenchidos",
    });
  }
}

/**
 * Delete a sale via API
 */
export async function deleteSale(saleId: string): Promise<boolean> {
  try {
    const sale = await getSaleById(saleId);
    if (!sale) {
      throw new Error("Venda não encontrada");
    }

    // Set animals back to "active"
    for (const item of sale.saleItems) {
      const animal = await getAnimalById(item.animalId);
      if (animal) {
        await updateAnimal(item.animalId, { status: "active" });
      }
    }

    // Delete linked financial records
    if (sale.linkedCashFlowId) {
      await deleteCashFlow(sale.linkedCashFlowId);
    }
    if (sale.linkedAccountsReceivableId) {
      await deleteAccountsReceivable(sale.linkedAccountsReceivableId);
    }

    await apiClient.delete(`/sales/${saleId}`);
    return true;
  } catch (error) {
    handleApiError(error, salesErrors.delete);
  }
}
