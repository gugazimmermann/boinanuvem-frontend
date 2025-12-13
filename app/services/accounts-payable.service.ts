import type { AccountsPayable, AccountsPayableFormData } from "~/types";
import { createResourceErrorMessages } from "./error-handlers";
import { buildUpdateDto } from "~/utils/update-dto-builder";
import {
  createListHandler,
  createGetByIdHandler,
  createGetByFilterHandler,
  createCrudHandlers,
} from "./service-helpers";
import { createEntityTransform } from "./transform-helpers";

const accountsPayableErrors = createResourceErrorMessages("contas a pagar");

/**
 * Transform backend AccountsPayableResponseDto to frontend AccountsPayable type
 */
const transformAccountsPayable = createEntityTransform<AccountsPayable>({
  dateStringFields: ["dueDate", "paidDate"],
  dateTimeFields: ["createdAt"],
  amountFields: ["amount", "paidAmount"],
});

/**
 * Get all accounts payable transactions for the current user's company via API
 */
export const getAccountsPayableByCompanyId = createListHandler<AccountsPayable>({
  endpoint: "/accounts-payable",
  errorMessages: accountsPayableErrors.list,
  transform: transformAccountsPayable,
});

/**
 * Get a single accounts payable transaction by ID via API
 */
export const getAccountsPayableById = createGetByIdHandler<AccountsPayable>({
  endpoint: "/accounts-payable",
  errorMessages: accountsPayableErrors.view,
  transform: transformAccountsPayable,
  custom403Message: "Você não tem permissão para visualizar esta conta a pagar",
});

/**
 * Get accounts payable transactions by supplier ID via API
 */
export const getAccountsPayableBySupplierId = createGetByFilterHandler<AccountsPayable>({
  endpoint: "/accounts-payable",
  errorMessages: accountsPayableErrors.list,
  transform: transformAccountsPayable,
  filterFn: (t, supplierId) => t.supplierId === supplierId,
});

/**
 * Get accounts payable transactions by property ID via API
 */
export const getAccountsPayableByPropertyId = createGetByFilterHandler<AccountsPayable>({
  endpoint: "/accounts-payable",
  errorMessages: accountsPayableErrors.list,
  transform: transformAccountsPayable,
  filterFn: (t, propertyId) => t.propertyId === propertyId,
});

/**
 * Get accounts payable transactions by employee ID via API
 */
export const getAccountsPayableByEmployeeId = createGetByFilterHandler<AccountsPayable>({
  endpoint: "/accounts-payable",
  errorMessages: accountsPayableErrors.list,
  transform: transformAccountsPayable,
  filterFn: (t, employeeId) => t.employeeId === employeeId,
});

/**
 * Get accounts payable transactions by service provider ID via API
 */
export const getAccountsPayableByServiceProviderId = createGetByFilterHandler<AccountsPayable>({
  endpoint: "/accounts-payable",
  errorMessages: accountsPayableErrors.list,
  transform: transformAccountsPayable,
  filterFn: (t, serviceProviderId) => t.serviceProviderId === serviceProviderId,
});

const accountsPayableCrud = createCrudHandlers<
  AccountsPayable,
  AccountsPayable,
  AccountsPayableFormData
>({
  endpoint: "/accounts-payable",
  errorMessages: {
    create: accountsPayableErrors.create,
    update: accountsPayableErrors.update,
    delete: accountsPayableErrors.delete,
  },
  transform: transformAccountsPayable,
  buildCreateDto: (data) => ({
    amount: data.amount,
    dueDate: data.dueDate,
    description: data.description,
    category: data.category,
    paymentMethod: data.paymentMethod,
    status: data.status || "unpaid",
    bankAccountId: data.bankAccountId,
    propertyId: data.propertyId,
    supplierId: data.supplierId,
    employeeId: data.employeeId,
    serviceProviderId: data.serviceProviderId,
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
      "supplierId",
      "employeeId",
      "serviceProviderId",
      "paidDate",
      "paidAmount",
      "referenceNumber",
    ]),
});

/**
 * Create a new accounts payable transaction via API
 */
export const addAccountsPayable = accountsPayableCrud.add;

/**
 * Update an accounts payable transaction via API
 */
export const updateAccountsPayable = accountsPayableCrud.update;

/**
 * Delete an accounts payable transaction via API
 */
export const deleteAccountsPayable = accountsPayableCrud.remove;
