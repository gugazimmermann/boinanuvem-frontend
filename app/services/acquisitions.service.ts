import type { Acquisition, AcquisitionFormData, AcquisitionItem } from "~/types";
import {
  AcquisitionPaymentMethod,
  CashFlowCategory,
  PaymentMethod,
  AccountsPayableStatus,
} from "~/types";
import { mockAcquisitions } from "~/mocks/acquisitions";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";
import { getAnimalById } from "./animals.service";
import { addCashFlow, deleteCashFlow, updateCashFlow } from "./cash-flow.service";
import {
  addAccountsPayable,
  deleteAccountsPayable,
  updateAccountsPayable,
} from "./accounts-payable.service";
import { getTotalFees } from "~/utils/fees";

const ID_PREFIX = "ac0e8400-e29b-41d4-a716";
const DEFAULT_ID = "ac0e8400-e29b-41d4-a716-446655440009";

const ARROBA_KG = 30;

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
  const totalFees = getTotalFees(data.fees, data.transportationFee, undefined, data.handlingFee);
  const totalCost = data.totalPrice + totalFees;
  const animalCount = data.acquisitionItems.length;

  const costPerAnimal = animalCount > 0 ? totalCost / animalCount : 0;

  const updatedItems = data.acquisitionItems.map((item) => {
    const costPerArroba = calculateAcquisitionCostPerArroba(item.weight, costPerAnimal);
    // Explicitly construct the item without spreading to avoid any price conflicts
    return {
      animalId: item.animalId,
      weight: item.weight,
      price: costPerAnimal,
      costPerArroba,
      // Include other optional fields if they exist
      ...(item.breed && { breed: item.breed }),
      ...(item.gender && { gender: item.gender }),
      ...(item.birthDate && { birthDate: item.birthDate }),
      ...(item.motherId && { motherId: item.motherId }),
      ...(item.fatherId && { fatherId: item.fatherId }),
      ...(item.motherRegistrationNumber && {
        motherRegistrationNumber: item.motherRegistrationNumber,
      }),
      ...(item.fatherRegistrationNumber && {
        fatherRegistrationNumber: item.fatherRegistrationNumber,
      }),
      ...(item.purity && { purity: item.purity }),
      ...(item.birthObservation && { birthObservation: item.birthObservation }),
    };
  });

  const acquisitionData: AcquisitionFormData = {
    ...data,
    acquisitionItems: updatedItems,
  };

  const acquisition = createEntity(mockAcquisitions, acquisitionData, ID_PREFIX, DEFAULT_ID);

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
    acquisition.linkedAccountsReceivableId = accountsPayable.id;
  }

  // Update the acquisition in the array to ensure all fields are properly set
  updateEntity(mockAcquisitions, acquisition.id, {
    ...acquisition,
    acquisitionItems: updatedItems, // Ensure we use the updated items with correct prices
  });

  // Return the updated acquisition from the array to ensure we have the latest data
  const updatedAcquisition = getAcquisitionById(acquisition.id);
  return updatedAcquisition || acquisition;
}

function updateAcquisitionItems(items: AcquisitionItem[], totalCost: number): AcquisitionItem[] {
  const animalCount = items.length;
  const costPerAnimal = animalCount > 0 ? totalCost / animalCount : 0;
  return items.map((item) => {
    const costPerArroba = calculateAcquisitionCostPerArroba(item.weight, costPerAnimal);
    return {
      ...item,
      price: costPerAnimal,
      costPerArroba,
    };
  });
}

function handlePaymentMethodChange(
  existingAcquisition: Acquisition,
  updatedItems: AcquisitionItem[],
  totalCost: number,
  data: Partial<AcquisitionFormData>
): { linkedCashFlowId?: string; linkedAccountsPayableId?: string } {
  const animalCodes = updatedItems
    .map((item) => {
      const animal = getAnimalById(item.animalId);
      return animal?.code || item.animalId;
    })
    .join(", ");

  if (existingAcquisition.linkedCashFlowId) {
    deleteCashFlow(existingAcquisition.linkedCashFlowId);
  }
  if (existingAcquisition.linkedAccountsPayableId) {
    deleteAccountsPayable(existingAcquisition.linkedAccountsPayableId);
  }

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
    return { linkedCashFlowId: cashFlow.id, linkedAccountsPayableId: undefined };
  }

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
  return { linkedCashFlowId: undefined, linkedAccountsPayableId: accountsPayable.id };
}

export function updateAcquisition(
  acquisitionId: string,
  data: Partial<AcquisitionFormData>
): boolean {
  const existingAcquisition = getAcquisitionById(acquisitionId);
  if (!existingAcquisition) return false;

  const items = data.acquisitionItems || existingAcquisition.acquisitionItems;
  const totalFees = getTotalFees(
    data.fees ?? existingAcquisition.fees,
    data.transportationFee ?? existingAcquisition.transportationFee,
    undefined,
    data.handlingFee ?? existingAcquisition.handlingFee
  );
  const totalCost = (data.totalPrice ?? existingAcquisition.totalPrice) + totalFees;

  const updatedItems = updateAcquisitionItems(items, totalCost);

  if (data.paymentMethod && data.paymentMethod !== existingAcquisition.paymentMethod) {
    const { linkedCashFlowId, linkedAccountsPayableId } = handlePaymentMethodChange(
      existingAcquisition,
      updatedItems,
      totalCost,
      data
    );

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
    if (
      data.totalPrice !== undefined ||
      data.fees !== undefined ||
      data.transportationFee !== undefined ||
      data.handlingFee !== undefined
    ) {
      const totalFeesAmount = getTotalFees(
        data.fees ?? existingAcquisition.fees,
        data.transportationFee ?? existingAcquisition.transportationFee,
        undefined,
        data.handlingFee ?? existingAcquisition.handlingFee
      );
      const totalAmount = (data.totalPrice ?? existingAcquisition.totalPrice) + totalFeesAmount;

      if (existingAcquisition.linkedCashFlowId) {
        updateCashFlow(existingAcquisition.linkedCashFlowId, { amount: totalAmount });
      }
      if (existingAcquisition.linkedAccountsPayableId) {
        updateAccountsPayable(existingAcquisition.linkedAccountsPayableId, {
          amount: totalAmount,
        });
      }
    }

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

  if (acquisition.linkedCashFlowId) {
    deleteCashFlow(acquisition.linkedCashFlowId);
  }
  if (acquisition.linkedAccountsPayableId) {
    deleteAccountsPayable(acquisition.linkedAccountsPayableId);
  }

  return deleteEntity(mockAcquisitions, acquisitionId);
}

export function generateAcquisitionId(index: number): string {
  const base = 446655440100 + index;
  return `ac0e8400-e29b-41d4-a716-${base.toString().padStart(12, "0")}`;
}
