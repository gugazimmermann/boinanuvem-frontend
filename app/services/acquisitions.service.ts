import type { Acquisition, AcquisitionFormData } from "~/types";
import { AcquisitionPaymentMethod } from "~/types";
import { mockAcquisitions } from "~/mocks/acquisitions";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";
import { getAnimalById } from "./animals.service";
import { addCashFlow, deleteCashFlow, updateCashFlow } from "./cash-flow.service";
import {
  addAccountsPayable,
  deleteAccountsPayable,
  updateAccountsPayable,
} from "./accounts-payable.service";
import { CashFlowCategory, PaymentMethod } from "~/types";
import { AccountsPayableStatus } from "~/types";
import { getTotalFees } from "~/utils/fees";

const ID_PREFIX = "ac0e8400-e29b-41d4-a716";
const DEFAULT_ID = "ac0e8400-e29b-41d4-a716-446655440009";

const ARROBA_KG = 30; // 1 arroba = 30 kg

/**
 * Calculates cost per arroba for an animal
 * @param weightInKg - Weight of the animal in kilograms
 * @param costPerAnimal - Total cost allocated to this animal
 * @returns Cost per arroba
 */
export function calculateAcquisitionCostPerArroba(
  weightInKg: number,
  costPerAnimal: number
): number {
  if (weightInKg <= 0) return 0;
  const arrobas = weightInKg / ARROBA_KG;
  return arrobas > 0 ? costPerAnimal / arrobas : 0;
}

export function getAcquisitionById(acquisitionId: string | undefined): Acquisition | undefined {
  return findById(mockAcquisitions, acquisitionId);
}

export function getAcquisitionByAnimalId(animalId: string): Acquisition | undefined {
  if (!animalId) return undefined;
  return mockAcquisitions.find((acquisition) =>
    acquisition.acquisitionItems.some((item) => item.animalId === animalId)
  );
}

export function getAcquisitionsByCompanyId(companyId: string): Acquisition[] {
  return findByField(mockAcquisitions, "companyId", companyId);
}

export function getAcquisitionsBySupplierId(supplierId: string): Acquisition[] {
  return findByField(mockAcquisitions, "supplierId", supplierId);
}

export function getAcquisitionsByDateRange(
  companyId: string,
  startDate: string,
  endDate: string
): Acquisition[] {
  return getAcquisitionsByCompanyId(companyId).filter((acquisition) => {
    const acquisitionDate = new Date(acquisition.acquisitionDate);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return acquisitionDate >= start && acquisitionDate <= end;
  });
}

export function addAcquisition(data: AcquisitionFormData): Acquisition {
  // Calculate total cost including fees
  const totalFees = getTotalFees(data.fees, data.transportationFee, undefined, data.handlingFee);
  const totalCost = data.totalPrice + totalFees;
  const animalCount = data.acquisitionItems.length;

  // Distribute cost evenly per animal
  const costPerAnimal = animalCount > 0 ? totalCost / animalCount : 0;

  // Calculate cost per arroba for each animal and update items
  const updatedItems = data.acquisitionItems.map((item) => {
    const costPerArroba = calculateAcquisitionCostPerArroba(item.weight, costPerAnimal);
    return {
      ...item,
      price: costPerAnimal,
      costPerArroba,
    };
  });

  // Create acquisition with updated items
  const acquisitionData: AcquisitionFormData = {
    ...data,
    acquisitionItems: updatedItems,
  };

  const acquisition = createEntity(mockAcquisitions, acquisitionData, ID_PREFIX, DEFAULT_ID);

  // Create financial record based on payment method
  const animalCodes = data.acquisitionItems
    .map((item) => {
      const animal = getAnimalById(item.animalId);
      return animal?.code || item.animalId;
    })
    .join(", ");

  if (data.paymentMethod === AcquisitionPaymentMethod.CASH_FLOW) {
    const cashFlow = addCashFlow({
      companyId: data.companyId,
      type: "expense",
      amount: totalCost,
      date: data.acquisitionDate,
      description: `Aquisição de animais: ${animalCodes}`,
      category: CashFlowCategory.ANIMAL_ACQUISITION,
      paymentMethod: PaymentMethod.CASH,
      status: "completed",
      supplierId: data.supplierId,
      propertyId: data.propertyId,
    });
    acquisition.linkedCashFlowId = cashFlow.id;
  } else {
    const accountsPayable = addAccountsPayable({
      companyId: data.companyId,
      supplierId: data.supplierId,
      amount: totalCost,
      dueDate: data.acquisitionDate,
      description: `Aquisição de animais: ${animalCodes}`,
      category: CashFlowCategory.ANIMAL_ACQUISITION,
      paymentMethod: PaymentMethod.CASH,
      status: AccountsPayableStatus.UNPAID,
      propertyId: data.propertyId,
    });
    acquisition.linkedAccountsPayableId = accountsPayable.id;
  }

  // Update the acquisition with the linked financial record ID
  updateEntity(mockAcquisitions, acquisition.id, acquisition);

  return acquisition;
}

export function updateAcquisition(
  acquisitionId: string,
  data: Partial<AcquisitionFormData>
): boolean {
  const existingAcquisition = getAcquisitionById(acquisitionId);
  if (!existingAcquisition) return false;

  // Recalculate costs if items or prices changed
  let updatedItems = data.acquisitionItems || existingAcquisition.acquisitionItems;
  const totalFees = getTotalFees(
    data.fees || existingAcquisition.fees,
    data.transportationFee || existingAcquisition.transportationFee,
    undefined,
    data.handlingFee || existingAcquisition.handlingFee
  );
  const totalCost = (data.totalPrice || existingAcquisition.totalPrice) + totalFees;

  if (
    data.acquisitionItems ||
    data.totalPrice !== undefined ||
    data.transportationFee !== undefined ||
    data.handlingFee !== undefined
  ) {
    const animalCount = updatedItems.length;
    const costPerAnimal = animalCount > 0 ? totalCost / animalCount : 0;

    updatedItems = updatedItems.map((item) => {
      const costPerArroba = calculateAcquisitionCostPerArroba(item.weight, costPerAnimal);
      return {
        ...item,
        price: costPerAnimal,
        costPerArroba,
      };
    });
  }

  // Handle payment method change
  if (data.paymentMethod && data.paymentMethod !== existingAcquisition.paymentMethod) {
    const animalCodes = updatedItems
      .map((item) => {
        const animal = getAnimalById(item.animalId);
        return animal?.code || item.animalId;
      })
      .join(", ");

    // Delete old financial record
    if (existingAcquisition.linkedCashFlowId) {
      deleteCashFlow(existingAcquisition.linkedCashFlowId);
    }
    if (existingAcquisition.linkedAccountsPayableId) {
      deleteAccountsPayable(existingAcquisition.linkedAccountsPayableId);
    }

    // Create new financial record
    let linkedCashFlowId: string | undefined;
    let linkedAccountsPayableId: string | undefined;

    if (data.paymentMethod === AcquisitionPaymentMethod.CASH_FLOW) {
      const cashFlow = addCashFlow({
        companyId: existingAcquisition.companyId,
        type: "expense",
        amount: totalCost,
        date: data.acquisitionDate || existingAcquisition.acquisitionDate,
        description: `Aquisição de animais: ${animalCodes}`,
        category: CashFlowCategory.ANIMAL_ACQUISITION,
        paymentMethod: PaymentMethod.CASH,
        status: "completed",
        supplierId: data.supplierId || existingAcquisition.supplierId,
        propertyId: data.propertyId || existingAcquisition.propertyId,
      });
      linkedCashFlowId = cashFlow.id;
      linkedAccountsPayableId = undefined;
    } else {
      const accountsPayable = addAccountsPayable({
        companyId: existingAcquisition.companyId,
        supplierId: data.supplierId || existingAcquisition.supplierId,
        amount: totalCost,
        dueDate: data.acquisitionDate || existingAcquisition.acquisitionDate,
        description: `Aquisição de animais: ${animalCodes}`,
        category: CashFlowCategory.ANIMAL_ACQUISITION,
        paymentMethod: PaymentMethod.CASH,
        status: AccountsPayableStatus.UNPAID,
        propertyId: data.propertyId || existingAcquisition.propertyId,
      });
      linkedAccountsPayableId = accountsPayable.id;
      linkedCashFlowId = undefined;
    }

    // Update acquisition with new financial record IDs
    const updateData: Partial<AcquisitionFormData> & {
      linkedCashFlowId?: string;
      linkedAccountsPayableId?: string;
      acquisitionItems?: typeof updatedItems;
    } = {
      ...data,
      linkedCashFlowId,
      linkedAccountsPayableId,
      acquisitionItems: updatedItems,
    };
    return updateEntity(mockAcquisitions, acquisitionId, updateData);
  } else {
    // Update existing financial record if amount changed
    if (
      data.totalPrice !== undefined ||
      data.fees !== undefined ||
      data.transportationFee !== undefined ||
      data.handlingFee !== undefined
    ) {
      const totalFeesAmount = getTotalFees(
        data.fees || existingAcquisition.fees,
        data.transportationFee || existingAcquisition.transportationFee,
        undefined,
        data.handlingFee || existingAcquisition.handlingFee
      );
      const totalAmount = (data.totalPrice || existingAcquisition.totalPrice) + totalFeesAmount;

      if (existingAcquisition.linkedCashFlowId) {
        updateCashFlow(existingAcquisition.linkedCashFlowId, { amount: totalAmount });
      }
      if (existingAcquisition.linkedAccountsPayableId) {
        updateAccountsPayable(existingAcquisition.linkedAccountsPayableId, {
          amount: totalAmount,
        });
      }
    }

    // Update acquisition with new data
    const updateData: Partial<AcquisitionFormData> & {
      acquisitionItems?: typeof updatedItems;
    } = {
      ...data,
      acquisitionItems: updatedItems,
    };
    return updateEntity(mockAcquisitions, acquisitionId, updateData);
  }
}

export function deleteAcquisition(acquisitionId: string): boolean {
  const acquisition = getAcquisitionById(acquisitionId);
  if (!acquisition) return false;

  // Delete linked financial records
  if (acquisition.linkedCashFlowId) {
    deleteCashFlow(acquisition.linkedCashFlowId);
  }
  if (acquisition.linkedAccountsPayableId) {
    deleteAccountsPayable(acquisition.linkedAccountsPayableId);
  }

  // Delete the acquisition
  return deleteEntity(mockAcquisitions, acquisitionId);
}

export function generateAcquisitionId(index: number): string {
  const base = 446655440100 + index;
  return `ac0e8400-e29b-41d4-a716-${base.toString().padStart(12, "0")}`;
}
