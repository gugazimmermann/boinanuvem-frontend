import type { AccountsReceivable, AccountsReceivableFormData } from "~/types";
import { createResourceErrorMessages } from "./error-handlers";
import { buildUpdateDto } from "~/utils/update-dto-builder";
import {
  createListHandler,
  createGetByIdHandler,
  createGetByFilterHandler,
  createCrudHandlers,
} from "./service-helpers";
import { createEntityTransform } from "./transform-helpers";

const accountsReceivableErrors = createResourceErrorMessages("contas a receber");

/**
 * Transform backend AccountsReceivableResponseDto to frontend AccountsReceivable type
 */
const transformAccountsReceivable = createEntityTransform<AccountsReceivable>({
  dateStringFields: ["dueDate", "paidDate"],
  dateTimeFields: ["createdAt"],
  amountFields: ["amount", "paidAmount"],
});

/**
 * Get all accounts receivable transactions for the current user's company via API
 */
export const getAccountsReceivableByCompanyId = createListHandler<AccountsReceivable>({
  endpoint: "/accounts-receivable",
  errorMessages: accountsReceivableErrors.list,
  transform: transformAccountsReceivable,
});

/**
 * Get a single accounts receivable transaction by ID via API
 */
export const getAccountsReceivableById = createGetByIdHandler<AccountsReceivable>({
  endpoint: "/accounts-receivable",
  errorMessages: accountsReceivableErrors.view,
  transform: transformAccountsReceivable,
  custom403Message: "Você não tem permissão para visualizar esta conta a receber",
});

/**
 * Get accounts receivable transactions by buyer ID via API
 */
export const getAccountsReceivableByBuyerId = createGetByFilterHandler<AccountsReceivable>({
  endpoint: "/accounts-receivable",
  errorMessages: accountsReceivableErrors.list,
  transform: transformAccountsReceivable,
  filterFn: (t, buyerId) => t.buyerId === buyerId,
});

/**
 * Get accounts receivable transactions by property ID via API
 */
export const getAccountsReceivableByPropertyId = createGetByFilterHandler<AccountsReceivable>({
  endpoint: "/accounts-receivable",
  errorMessages: accountsReceivableErrors.list,
  transform: transformAccountsReceivable,
  filterFn: (t, propertyId) => t.propertyId === propertyId,
});

const accountsReceivableCrud = createCrudHandlers<
  AccountsReceivable,
  AccountsReceivable,
  AccountsReceivableFormData
>({
  endpoint: "/accounts-receivable",
  errorMessages: {
    create: accountsReceivableErrors.create,
    update: accountsReceivableErrors.update,
    delete: accountsReceivableErrors.delete,
  },
  transform: transformAccountsReceivable,
  buildCreateDto: (data) => ({
    amount: data.amount,
    dueDate: data.dueDate,
    description: data.description,
    category: data.category,
    paymentMethod: data.paymentMethod,
    status: data.status || "unpaid",
    bankAccountId: data.bankAccountId,
    propertyId: data.propertyId,
    buyerId: data.buyerId,
    paidDate: data.paidDate,
    paidAmount: data.paidAmount,
    referenceNumber: data.referenceNumber,
  }),
  buildUpdateDto: (data) =>
    buildUpdateDto(data, [
      "amount",
      "dueDate",
      "description",
      "category",
      "paymentMethod",
      "status",
      "bankAccountId",
      "propertyId",
      "buyerId",
      "paidDate",
      "paidAmount",
      "referenceNumber",
    ]),
});

/**
 * Create a new accounts receivable transaction via API
 */
export const addAccountsReceivable = accountsReceivableCrud.add;

/**
 * Update an accounts receivable transaction via API
 */
export const updateAccountsReceivable = accountsReceivableCrud.update;

/**
 * Delete an accounts receivable transaction via API
 */
export const deleteAccountsReceivable = accountsReceivableCrud.remove;
