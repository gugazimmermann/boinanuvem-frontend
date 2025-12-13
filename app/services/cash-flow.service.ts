import type { CashFlow, CashFlowFormData } from "~/types";
import { createResourceErrorMessages } from "./error-handlers";
import { buildUpdateDto } from "~/utils/update-dto-builder";
import {
  createListHandler,
  createGetByIdHandler,
  createGetByFilterHandler,
  createCrudHandlers,
} from "./service-helpers";
import { createEntityTransform } from "./transform-helpers";

const cashFlowErrors = createResourceErrorMessages("fluxo de caixa");

/**
 * Transform backend CashFlowResponseDto to frontend CashFlow type
 */
const transformCashFlow = createEntityTransform<CashFlow>({
  dateStringFields: ["date", "paymentDate"],
  dateTimeFields: ["createdAt"],
  amountFields: ["amount"],
});

/**
 * Get all cash flow transactions for the current user's company via API
 */
export const getCashFlowByCompanyId = createListHandler<CashFlow>({
  endpoint: "/cash-flow",
  errorMessages: cashFlowErrors.list,
  transform: transformCashFlow,
});

/**
 * Get a single cash flow transaction by ID via API
 */
export const getCashFlowById = createGetByIdHandler<CashFlow>({
  endpoint: "/cash-flow",
  errorMessages: cashFlowErrors.view,
  transform: transformCashFlow,
  custom403Message: "Você não tem permissão para visualizar esta transação",
});

/**
 * Get cash flow transactions by bank account ID via API
 */
export const getCashFlowByBankAccountId = createGetByFilterHandler<CashFlow>({
  endpoint: "/cash-flow",
  errorMessages: cashFlowErrors.list,
  transform: transformCashFlow,
  filterFn: (t, bankAccountId) => t.bankAccountId === bankAccountId,
});

/**
 * Get cash flow transactions by property ID via API
 */
export const getCashFlowByPropertyId = createGetByFilterHandler<CashFlow>({
  endpoint: "/cash-flow",
  errorMessages: cashFlowErrors.list,
  transform: transformCashFlow,
  filterFn: (t, propertyId) => t.propertyId === propertyId,
});

/**
 * Get cash flow transactions by employee ID via API
 */
export const getCashFlowByEmployeeId = createGetByFilterHandler<CashFlow>({
  endpoint: "/cash-flow",
  errorMessages: cashFlowErrors.list,
  transform: transformCashFlow,
  filterFn: (t, employeeId) => t.employeeId === employeeId,
});

/**
 * Get cash flow transactions by service provider ID via API
 */
export const getCashFlowByServiceProviderId = createGetByFilterHandler<CashFlow>({
  endpoint: "/cash-flow",
  errorMessages: cashFlowErrors.list,
  transform: transformCashFlow,
  filterFn: (t, serviceProviderId) => t.serviceProviderId === serviceProviderId,
});

/**
 * Get cash flow transactions by supplier ID via API
 */
export const getCashFlowBySupplierId = createGetByFilterHandler<CashFlow>({
  endpoint: "/cash-flow",
  errorMessages: cashFlowErrors.list,
  transform: transformCashFlow,
  filterFn: (t, supplierId) => t.supplierId === supplierId,
});

/**
 * Get cash flow transactions by buyer ID via API
 */
export const getCashFlowByBuyerId = createGetByFilterHandler<CashFlow>({
  endpoint: "/cash-flow",
  errorMessages: cashFlowErrors.list,
  transform: transformCashFlow,
  filterFn: (t, buyerId) => t.buyerId === buyerId,
});

const cashFlowCrud = createCrudHandlers<CashFlow, CashFlow, CashFlowFormData>({
  endpoint: "/cash-flow",
  errorMessages: {
    create: cashFlowErrors.create,
    update: cashFlowErrors.update,
    delete: cashFlowErrors.delete,
  },
  transform: transformCashFlow,
  buildCreateDto: (data) => ({
    type: data.type,
    amount: data.amount,
    date: data.date,
    description: data.description,
    category: data.category,
    paymentMethod: data.paymentMethod,
    status: data.status || "completed",
    bankAccountId: data.bankAccountId,
    propertyId: data.propertyId,
    employeeId: data.employeeId,
    serviceProviderId: data.serviceProviderId,
    supplierId: data.supplierId,
    buyerId: data.buyerId,
    paymentDate: data.paymentDate,
    referenceNumber: data.referenceNumber,
  }),
  buildUpdateDto: (data) =>
    buildUpdateDto(data, [
      "type",
      "amount",
      "date",
      "description",
      "category",
      "paymentMethod",
      "status",
      "bankAccountId",
      "propertyId",
      "employeeId",
      "serviceProviderId",
      "supplierId",
      "buyerId",
      "paymentDate",
      "referenceNumber",
    ]),
});

/**
 * Create a new cash flow transaction via API
 */
export const addCashFlow = cashFlowCrud.add;

/**
 * Update a cash flow transaction via API
 */
export const updateCashFlow = cashFlowCrud.update;

/**
 * Delete a cash flow transaction via API
 */
export const deleteCashFlow = cashFlowCrud.remove;
