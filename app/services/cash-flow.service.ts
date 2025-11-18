import type { CashFlow, CashFlowFormData } from "~/types";
import { mockCashFlow } from "~/mocks/cash-flow";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";

const ID_PREFIX = "cc0e8400-e29b-41d4-a716";
const DEFAULT_ID = "cc0e8400-e29b-41d4-a716-446655440009";

export function getCashFlowById(transactionId: string | undefined): CashFlow | undefined {
  return findById(mockCashFlow, transactionId);
}

export function getCashFlowByCompanyId(companyId: string): CashFlow[] {
  return findByField(mockCashFlow, "companyId", companyId);
}

export function getCashFlowByBankAccountId(bankAccountId: string): CashFlow[] {
  return findByField(mockCashFlow, "bankAccountId", bankAccountId);
}

export function getCashFlowByPropertyId(propertyId: string): CashFlow[] {
  return findByField(mockCashFlow, "propertyId", propertyId);
}

export function getCashFlowByEmployeeId(employeeId: string): CashFlow[] {
  return findByField(mockCashFlow, "employeeId", employeeId);
}

export function getCashFlowByServiceProviderId(serviceProviderId: string): CashFlow[] {
  return findByField(mockCashFlow, "serviceProviderId", serviceProviderId);
}

export function getCashFlowBySupplierId(supplierId: string): CashFlow[] {
  return findByField(mockCashFlow, "supplierId", supplierId);
}

export function getCashFlowByBuyerId(buyerId: string): CashFlow[] {
  return findByField(mockCashFlow, "buyerId", buyerId);
}

export function addCashFlow(data: CashFlowFormData): CashFlow {
  return createEntity(mockCashFlow, data, ID_PREFIX, DEFAULT_ID);
}

export function updateCashFlow(transactionId: string, data: Partial<CashFlowFormData>): boolean {
  return updateEntity(mockCashFlow, transactionId, data);
}

export function deleteCashFlow(transactionId: string): boolean {
  return deleteEntity(mockCashFlow, transactionId);
}
