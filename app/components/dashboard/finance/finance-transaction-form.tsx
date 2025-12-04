import { Input, Select, FormFieldGroup } from "~/components/ui";
import { CashFlowCategory, PaymentMethod } from "~/types";
import type { AccountsPayableStatus, AccountsReceivableStatus } from "~/types";
import {
  getIncomeCategories,
  getExpenseCategories,
  getPaymentMethods,
  getAccountsPayableStatusOptions,
  getAccountsReceivableStatusOptions,
} from "~/utils/finance-form-helpers";
import type {
  CashFlowFormState,
  AccountsPayableFormState,
  AccountsReceivableFormState,
  FinanceTransactionType,
} from "~/hooks/use-finance-transaction-form";

export interface FinanceTransactionFormProps {
  readonly transactionType: FinanceTransactionType;
  readonly formData: CashFlowFormState | AccountsPayableFormState | AccountsReceivableFormState;
  readonly errors: Record<string, string>;
  readonly isSubmitting: boolean;
  readonly onFieldChange: (field: string, value: string) => void;
  readonly translation: {
    cashFlow?: {
      new?: Record<string, string>;
      edit?: Record<string, string>;
      table?: Record<string, string>;
      categories?: Record<string, string>;
      paymentMethods?: Record<string, string>;
    };
    accountsPayable?: {
      new?: Record<string, string>;
      edit?: Record<string, string>;
      paymentMethods?: Record<string, string>;
      status?: Record<string, string>;
    };
    accountsReceivable?: {
      new?: Record<string, string>;
      edit?: Record<string, string>;
      paymentMethods?: Record<string, string>;
      status?: Record<string, string>;
    };
    profile?: {
      errors?: {
        required?: (label: string) => string;
      };
    };
    bankAccounts?: {
      accountTypes?: {
        checking?: string;
        savings?: string;
      };
    };
    common?: {
      loading?: string;
    };
  };
  readonly properties: Array<{ id: string; name: string }>;
  readonly bankAccounts: Array<{
    id: string;
    bankName: string;
    accountNumber: string;
    accountType: "checking" | "savings";
  }>;
  readonly employees: Array<{ id: string; name: string }>;
  readonly serviceProviders: Array<{ id: string; name: string }>;
  readonly suppliers: Array<{ id: string; name: string }>;
  readonly buyers: Array<{ id: string; name: string }>;
}

export function FinanceTransactionForm({
  transactionType,
  formData,
  errors,
  isSubmitting,
  onFieldChange,
  translation: t,
  properties,
  bankAccounts,
  employees,
  serviceProviders,
  suppliers,
  buyers,
}: FinanceTransactionFormProps) {
  const isCashFlow = transactionType === "cash-flow";
  const isAccountsPayable = transactionType === "accounts-payable";
  const isAccountsReceivable = transactionType === "accounts-receivable";

  const cashFlowData = isCashFlow ? (formData as CashFlowFormState) : null;
  const apData = isAccountsPayable ? (formData as AccountsPayableFormState) : null;
  const arData = isAccountsReceivable ? (formData as AccountsReceivableFormState) : null;

  const getTranslationKey = (key: string): string => {
    if (isCashFlow) {
      return t.cashFlow?.new?.[key] || t.cashFlow?.edit?.[key] || "";
    } else if (isAccountsPayable) {
      return t.accountsPayable?.new?.[key] || t.accountsPayable?.edit?.[key] || "";
    } else {
      return t.accountsReceivable?.new?.[key] || t.accountsReceivable?.edit?.[key] || "";
    }
  };

  const incomeCategories =
    isCashFlow || isAccountsReceivable
      ? getIncomeCategories({ cashFlow: { categories: t.cashFlow?.categories } })
      : [];
  const expenseCategories = getExpenseCategories({
    cashFlow: { categories: t.cashFlow?.categories },
  });
  const paymentMethods = getPaymentMethods({
    cashFlow: { paymentMethods: t.cashFlow?.paymentMethods || {} },
    accountsPayable: { paymentMethods: t.accountsPayable?.paymentMethods || {} },
    accountsReceivable: { paymentMethods: t.accountsReceivable?.paymentMethods || {} },
  });
  const apStatusOptions = isAccountsPayable
    ? getAccountsPayableStatusOptions({
        accountsPayable: { status: t.accountsPayable?.status || {} },
      })
    : [];
  const arStatusOptions = isAccountsReceivable
    ? getAccountsReceivableStatusOptions({
        accountsReceivable: { status: t.accountsReceivable?.status || {} },
      })
    : [];

  return (
    <div className="space-y-4">
      {isCashFlow && (
        <FormFieldGroup columns={2}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {getTranslationKey("typeLabel")} <span className="text-red-500">*</span>
            </label>
            <select
              value={cashFlowData!.type}
              onChange={(e) => {
                const newType = e.target.value as "income" | "expense";
                onFieldChange("type", newType);
                if (newType === "income") {
                  onFieldChange("category", CashFlowCategory.CATTLE_SALES);
                  onFieldChange("supplierId", "");
                  onFieldChange("employeeId", "");
                  onFieldChange("serviceProviderId", "");
                } else {
                  onFieldChange("category", CashFlowCategory.FEED);
                  onFieldChange("buyerId", "");
                  onFieldChange("employeeId", "");
                  onFieldChange("serviceProviderId", "");
                }
              }}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
            >
              <option value="income">{t.cashFlow?.table?.income}</option>
              <option value="expense">{t.cashFlow?.table?.expense}</option>
            </select>
          </div>
          <Input
            label={getTranslationKey("amountLabel")}
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => onFieldChange("amount", e.target.value)}
            error={errors.amount}
            disabled={isSubmitting}
            required
          />
        </FormFieldGroup>
      )}

      {!isCashFlow && (
        <FormFieldGroup columns={2}>
          <Input
            label={getTranslationKey("amountLabel")}
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => onFieldChange("amount", e.target.value)}
            error={errors.amount}
            disabled={isSubmitting}
            required
          />
          <Input
            label={getTranslationKey("dueDateLabel")}
            type="date"
            value={isAccountsPayable ? apData!.dueDate : arData!.dueDate}
            onChange={(e) => onFieldChange("dueDate", e.target.value)}
            error={errors.dueDate}
            disabled={isSubmitting}
            required
          />
        </FormFieldGroup>
      )}

      {isCashFlow && (
        <FormFieldGroup columns={2}>
          <Input
            label={getTranslationKey("dateLabel")}
            type="date"
            value={cashFlowData!.date}
            onChange={(e) => onFieldChange("date", e.target.value)}
            error={errors.date}
            disabled={isSubmitting}
            required
          />
          <Input
            label={getTranslationKey("paymentDateLabel")}
            type="date"
            value={cashFlowData!.paymentDate}
            onChange={(e) => onFieldChange("paymentDate", e.target.value)}
            error={errors.paymentDate}
            disabled={isSubmitting}
          />
        </FormFieldGroup>
      )}

      <Input
        label={getTranslationKey("descriptionLabel")}
        value={formData.description}
        onChange={(e) => onFieldChange("description", e.target.value)}
        error={errors.description}
        disabled={isSubmitting}
        required
      />

      <FormFieldGroup columns={2}>
        <Select
          label={getTranslationKey("categoryLabel")}
          value={formData.category}
          onChange={(e) => {
            const newCategory = e.target.value as CashFlowCategory;
            onFieldChange("category", newCategory);
            if (
              isCashFlow &&
              newCategory !== CashFlowCategory.LABOR &&
              cashFlowData!.type === "expense"
            ) {
              onFieldChange("employeeId", "");
            }
            if (isAccountsPayable && newCategory !== CashFlowCategory.LABOR) {
              onFieldChange("employeeId", "");
            }
          }}
          error={errors.category}
          disabled={isSubmitting}
          required={isCashFlow}
          options={[
            { value: "", label: "-" },
            ...(() => {
              if (isCashFlow && cashFlowData!.type === "income") {
                return incomeCategories;
              }
              if (isAccountsReceivable) {
                return incomeCategories;
              }
              return expenseCategories;
            })(),
          ]}
        />
        <Select
          label={getTranslationKey("paymentMethodLabel")}
          value={formData.paymentMethod}
          onChange={(e) => onFieldChange("paymentMethod", e.target.value as PaymentMethod)}
          error={errors.paymentMethod}
          disabled={isSubmitting}
          required={isCashFlow}
          options={[{ value: "", label: "-" }, ...paymentMethods]}
        />
      </FormFieldGroup>

      {!isCashFlow && (
        <FormFieldGroup columns={2}>
          <Select
            label={getTranslationKey("statusLabel")}
            value={isAccountsPayable ? apData!.status : arData!.status}
            onChange={(e) =>
              onFieldChange(
                "status",
                e.target.value as AccountsPayableStatus | AccountsReceivableStatus
              )
            }
            error={errors.status}
            disabled={isSubmitting}
            required
            options={isAccountsPayable ? apStatusOptions : arStatusOptions}
          />
        </FormFieldGroup>
      )}

      <Select
        label={getTranslationKey("propertyLabel")}
        value={formData.propertyId}
        onChange={(e) => onFieldChange("propertyId", e.target.value)}
        error={errors.propertyId}
        disabled={isSubmitting}
        required
        options={properties.map((property) => ({
          value: property.id,
          label: property.name,
        }))}
      />

      <Select
        label={getTranslationKey("bankAccountLabel")}
        value={formData.bankAccountId}
        onChange={(e) => onFieldChange("bankAccountId", e.target.value)}
        error={errors.bankAccountId}
        disabled={isSubmitting}
        options={[
          { value: "", label: "-" },
          ...bankAccounts.map((account) => ({
            value: account.id,
            label: `${account.bankName} - ${account.accountNumber} (${
              account.accountType === "checking"
                ? t.bankAccounts?.accountTypes?.checking
                : t.bankAccounts?.accountTypes?.savings
            })`,
          })),
        ]}
      />

      {isCashFlow && cashFlowData!.type === "expense" && (
        <Select
          label={getTranslationKey("supplierLabel")}
          value={cashFlowData!.supplierId}
          onChange={(e) => onFieldChange("supplierId", e.target.value)}
          error={errors.supplierId}
          disabled={isSubmitting}
          options={[
            { value: "", label: "-" },
            ...suppliers.map((supplier) => ({
              value: supplier.id,
              label: supplier.name,
            })),
          ]}
        />
      )}

      {isAccountsPayable && (
        <>
          <Select
            label={getTranslationKey("supplierLabel")}
            value={apData!.supplierId}
            onChange={(e) => onFieldChange("supplierId", e.target.value)}
            error={errors.supplierId}
            disabled={isSubmitting}
            options={[
              { value: "", label: "-" },
              ...suppliers.map((supplier) => ({
                value: supplier.id,
                label: supplier.name,
              })),
            ]}
          />
          <Select
            label={getTranslationKey("employeeLabel")}
            value={apData!.employeeId}
            onChange={(e) => onFieldChange("employeeId", e.target.value)}
            error={errors.employeeId}
            disabled={isSubmitting}
            options={[
              { value: "", label: "-" },
              ...employees.map((employee) => ({
                value: employee.id,
                label: employee.name,
              })),
            ]}
          />
          <Select
            label={getTranslationKey("serviceProviderLabel")}
            value={apData!.serviceProviderId}
            onChange={(e) => onFieldChange("serviceProviderId", e.target.value)}
            error={errors.serviceProviderId}
            disabled={isSubmitting}
            options={[
              { value: "", label: "-" },
              ...serviceProviders.map((serviceProvider) => ({
                value: serviceProvider.id,
                label: serviceProvider.name,
              })),
            ]}
          />
        </>
      )}

      {isCashFlow && cashFlowData!.type === "income" && (
        <Select
          label={getTranslationKey("buyerLabel")}
          value={cashFlowData!.buyerId}
          onChange={(e) => onFieldChange("buyerId", e.target.value)}
          error={errors.buyerId}
          disabled={isSubmitting}
          options={[
            { value: "", label: "-" },
            ...buyers.map((buyer) => ({
              value: buyer.id,
              label: buyer.name,
            })),
          ]}
        />
      )}

      {isAccountsReceivable && (
        <Select
          label={getTranslationKey("buyerLabel")}
          value={arData!.buyerId}
          onChange={(e) => onFieldChange("buyerId", e.target.value)}
          error={errors.buyerId}
          disabled={isSubmitting}
          options={[
            { value: "", label: "-" },
            ...buyers.map((buyer) => ({
              value: buyer.id,
              label: buyer.name,
            })),
          ]}
        />
      )}

      {isCashFlow &&
        cashFlowData!.type === "expense" &&
        cashFlowData!.category === CashFlowCategory.LABOR && (
          <Select
            label={getTranslationKey("employeeLabel")}
            value={cashFlowData!.employeeId}
            onChange={(e) => onFieldChange("employeeId", e.target.value)}
            error={errors.employeeId}
            disabled={isSubmitting}
            options={[
              { value: "", label: "-" },
              ...employees.map((employee) => ({
                value: employee.id,
                label: employee.name,
              })),
            ]}
          />
        )}

      {isCashFlow && cashFlowData!.type === "expense" && (
        <Select
          label={getTranslationKey("serviceProviderLabel")}
          value={cashFlowData!.serviceProviderId}
          onChange={(e) => onFieldChange("serviceProviderId", e.target.value)}
          error={errors.serviceProviderId}
          disabled={isSubmitting}
          options={[
            { value: "", label: "-" },
            ...serviceProviders.map((serviceProvider) => ({
              value: serviceProvider.id,
              label: serviceProvider.name,
            })),
          ]}
        />
      )}

      {!isCashFlow && (
        <FormFieldGroup columns={2}>
          <Input
            label={getTranslationKey("paidDateLabel")}
            type="date"
            value={isAccountsPayable ? apData!.paidDate : arData!.paidDate}
            onChange={(e) => onFieldChange("paidDate", e.target.value)}
            error={errors.paidDate}
            disabled={isSubmitting}
          />
          <Input
            label={getTranslationKey("paidAmountLabel")}
            type="number"
            step="0.01"
            min="0"
            value={isAccountsPayable ? apData!.paidAmount : arData!.paidAmount}
            onChange={(e) => onFieldChange("paidAmount", e.target.value)}
            error={errors.paidAmount}
            disabled={isSubmitting}
          />
        </FormFieldGroup>
      )}

      <Input
        label={getTranslationKey("referenceNumberLabel")}
        value={formData.referenceNumber}
        onChange={(e) => onFieldChange("referenceNumber", e.target.value)}
        error={errors.referenceNumber}
        disabled={isSubmitting}
      />
    </div>
  );
}
