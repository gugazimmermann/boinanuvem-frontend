import { Input, Select, FileUpload } from "~/components/ui";
import type { InventoryItemCategory, Property, Supplier, BankAccount } from "~/types";
import { InventoryItemCategory as Category, PaymentMethod } from "~/types";
import type { InventoryFormData } from "~/hooks/use-inventory-form";
import {
  getInventoryUnitOptions,
  getInventoryCategoryOptions,
  getUsageUnitOptions,
  getUsageBasisOptions,
} from "~/utils/inventory-utils";

export interface InventoryItemFormProps {
  formData: InventoryFormData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  onFieldChange: (
    field: keyof InventoryFormData,
    value: string | boolean | string[] | PaymentMethod
  ) => void;
  translations: {
    inventory: {
      table: {
        code: string;
        name: string;
        description: string;
        category: string;
        unit: string;
        supplier: string;
        minimumStock: string;
        expirationDate: string;
        hasExpiration: string;
      };
      categories: Record<string, string>;
      units: Record<string, string>;
      new: {
        customCategoryLabel: string;
        unitPriceLabel: string;
        unitPricePlaceholder: string;
        initialStockLabel: string;
        initialStockPlaceholder: string;
        propertyLabel: string;
        usageMethod: string;
        usageAmount: string;
        usageUnit: string;
        usageBasis: string;
        nitrogenContent?: string;
        nitrogenContentLabel?: string;
        usageBasisOptions: {
          perAnimal: string;
          perKg: string;
        };
      };
      movements: {
        new: {
          createCashFlowTransaction: string;
          createAccountPayable: string;
          paymentMethod: string;
          bankAccount: string;
          dueDate: string;
        };
      };
    };
    common: {
      select: string;
    };
    cashFlow: {
      paymentMethods: Record<string, string>;
    };
    bankAccounts: {
      accountTypes: {
        checking: string;
        savings: string;
      };
    };
  };
  suppliers: Supplier[];
  properties: Property[];
  bankAccounts: BankAccount[];
  showInitialStock?: boolean;
  showObservation?: boolean;
  observationFiles?: File[];
  onObservationFilesChange?: (files: File[]) => void;
}

export function InventoryItemForm({
  formData,
  errors,
  isSubmitting,
  onFieldChange,
  translations: t,
  suppliers,
  properties,
  bankAccounts,
  showInitialStock = true,
  showObservation = false,
  observationFiles = [],
  onObservationFilesChange,
}: InventoryItemFormProps) {
  const categoryOptions = getInventoryCategoryOptions({
    inventory: { categories: t.inventory.categories },
  });

  const unitOptions = getInventoryUnitOptions({
    inventory: { units: t.inventory.units },
  });

  const usageUnitOptions = getUsageUnitOptions({
    inventory: { units: t.inventory.units },
  });

  const usageBasisOptions = getUsageBasisOptions({
    inventory: { new: { usageBasisOptions: t.inventory.new.usageBasisOptions } },
  });

  const paymentMethodOptions = Object.values(PaymentMethod).map((method) => ({
    value: method,
    label: t.cashFlow.paymentMethods[method as keyof typeof t.cashFlow.paymentMethods] || method,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label={t.inventory.table.code}
          value={formData.code}
          onChange={(e) => onFieldChange("code", e.target.value)}
          error={errors.code}
          disabled={isSubmitting}
          required
        />
        <Input
          label={t.inventory.table.name}
          value={formData.name}
          onChange={(e) => onFieldChange("name", e.target.value)}
          error={errors.name}
          disabled={isSubmitting}
          className="md:col-span-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t.inventory.table.description}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onFieldChange("description", e.target.value)}
          disabled={isSubmitting}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 resize-none ${
            errors.description ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          }`}
        />
        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label={t.inventory.table.category}
          value={formData.category}
          onChange={(e) => onFieldChange("category", e.target.value as InventoryItemCategory)}
          options={categoryOptions}
          error={errors.category}
          disabled={isSubmitting}
          required
        />
        {formData.category === Category.CUSTOM && (
          <Input
            label={t.inventory.new.customCategoryLabel}
            value={formData.customCategory}
            onChange={(e) => onFieldChange("customCategory", e.target.value)}
            error={errors.customCategory}
            disabled={isSubmitting}
            required
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label={t.inventory.table.unit}
          value={formData.unit}
          onChange={(e) => onFieldChange("unit", e.target.value)}
          options={unitOptions}
          error={errors.unit}
          disabled={isSubmitting}
          required
        />
        <Input
          label={t.inventory.new.unitPriceLabel}
          type="number"
          value={formData.unitPrice}
          onChange={(e) => onFieldChange("unitPrice", e.target.value)}
          error={errors.unitPrice}
          disabled={isSubmitting}
          min="0"
          step="0.01"
          placeholder={t.inventory.new.unitPricePlaceholder}
        />
      </div>

      {formData.category === Category.FERTILIZER && (
        <div className="space-y-4 border-t border-b border-gray-200 dark:border-gray-700 pt-4 pb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.inventory.new.nitrogenContent || "Nitrogen Content"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t.inventory.new.nitrogenContentLabel || "Nitrogen Content (kg per unit)"}
              type="number"
              value={formData.nitrogenContent}
              onChange={(e) => onFieldChange("nitrogenContent", e.target.value)}
              error={errors.nitrogenContent}
              disabled={isSubmitting}
              min="0"
              step="0.01"
              placeholder="e.g., 10 (kg of nitrogen per unit)"
            />
          </div>
        </div>
      )}

      {(formData.category === Category.MEDICINES || formData.category === Category.VACCINES) && (
        <div className="space-y-4 border-t border-b border-gray-200 dark:border-gray-700 pt-4 pb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.inventory.new.usageMethod}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label={t.inventory.new.usageAmount}
              type="number"
              value={formData.usageAmount}
              onChange={(e) => onFieldChange("usageAmount", e.target.value)}
              error={errors.usageAmount}
              disabled={isSubmitting}
              min="0"
              step="0.01"
              placeholder="1"
            />
            <Select
              label={t.inventory.new.usageUnit}
              value={formData.usageUnit}
              onChange={(e) => onFieldChange("usageUnit", e.target.value)}
              options={usageUnitOptions}
              error={errors.usageUnit}
              disabled={isSubmitting}
            />
            <Select
              label={t.inventory.new.usageBasis}
              value={formData.usageBasis}
              onChange={(e) => onFieldChange("usageBasis", e.target.value)}
              options={usageBasisOptions}
              error={errors.usageBasis}
              disabled={isSubmitting}
            />
          </div>
        </div>
      )}

      {showInitialStock && (
        <Input
          label={t.inventory.new.initialStockLabel}
          type="number"
          value={formData.initialStock}
          onChange={(e) => onFieldChange("initialStock", e.target.value)}
          error={errors.initialStock}
          disabled={isSubmitting}
          min="0"
          step="0.01"
          placeholder={t.inventory.new.initialStockPlaceholder}
        />
      )}

      <Select
        label={t.inventory.table.supplier}
        value={formData.supplierId}
        onChange={(e) => onFieldChange("supplierId", e.target.value)}
        options={[
          { value: "", label: t.common.select },
          ...suppliers.map((supplier) => ({
            value: supplier.id,
            label: supplier.name,
          })),
        ]}
        error={errors.supplierId}
        disabled={isSubmitting}
      />

      {formData.supplierId && showInitialStock && (
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="createCashFlowTransaction"
              checked={formData.createCashFlowTransaction}
              onChange={(e) => onFieldChange("createCashFlowTransaction", e.target.checked)}
              disabled={isSubmitting || parseFloat(formData.initialStock || "0") === 0}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="createCashFlowTransaction"
              className={`text-sm font-medium ${
                parseFloat(formData.initialStock || "0") === 0
                  ? "text-gray-400 dark:text-gray-500"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {t.inventory.movements.new.createCashFlowTransaction}
            </label>
          </div>

          {formData.createCashFlowTransaction && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={t.inventory.movements.new.paymentMethod}
                value={formData.paymentMethod}
                onChange={(e) => onFieldChange("paymentMethod", e.target.value as PaymentMethod)}
                options={paymentMethodOptions}
                error={errors.paymentMethod}
                disabled={isSubmitting}
                required
              />
              <Select
                label={t.inventory.movements.new.bankAccount}
                value={formData.bankAccountId}
                onChange={(e) => onFieldChange("bankAccountId", e.target.value)}
                options={[
                  { value: "", label: t.common.select },
                  ...bankAccounts.map((account) => ({
                    value: account.id,
                    label: `${account.bankName} - ${account.accountNumber} (${account.accountType === "checking" ? t.bankAccounts.accountTypes.checking : t.bankAccounts.accountTypes.savings})`,
                  })),
                ]}
                error={errors.bankAccountId}
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="createAccountPayable"
              checked={formData.createAccountPayable}
              onChange={(e) => onFieldChange("createAccountPayable", e.target.checked)}
              disabled={isSubmitting || parseFloat(formData.initialStock || "0") === 0}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="createAccountPayable"
              className={`text-sm font-medium ${
                parseFloat(formData.initialStock || "0") === 0
                  ? "text-gray-400 dark:text-gray-500"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {t.inventory.movements.new.createAccountPayable}
            </label>
          </div>

          {formData.createAccountPayable && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={t.inventory.movements.new.dueDate}
                type="date"
                value={formData.dueDate}
                onChange={(e) => onFieldChange("dueDate", e.target.value)}
                error={errors.dueDate}
                disabled={isSubmitting}
                required
              />
              <Select
                label={t.inventory.movements.new.paymentMethod}
                value={formData.accountPayablePaymentMethod}
                onChange={(e) =>
                  onFieldChange("accountPayablePaymentMethod", e.target.value as PaymentMethod)
                }
                options={paymentMethodOptions}
                error={errors.accountPayablePaymentMethod}
                disabled={isSubmitting}
              />
              <Select
                label={t.inventory.movements.new.bankAccount}
                value={formData.accountPayableBankAccountId}
                onChange={(e) => onFieldChange("accountPayableBankAccountId", e.target.value)}
                options={[
                  { value: "", label: t.common.select },
                  ...bankAccounts.map((account) => ({
                    value: account.id,
                    label: `${account.bankName} - ${account.accountNumber} (${account.accountType === "checking" ? t.bankAccounts.accountTypes.checking : t.bankAccounts.accountTypes.savings})`,
                  })),
                ]}
                error={errors.accountPayableBankAccountId}
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t.inventory.new.propertyLabel} <span className="text-red-500">*</span>
        </label>
        <select
          multiple
          value={formData.propertyIds}
          onChange={(e) => {
            const selectedIds = Array.from(e.target.selectedOptions, (option) => option.value);
            onFieldChange("propertyIds", selectedIds);
          }}
          disabled={isSubmitting}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 min-h-[100px] ${
            errors.propertyIds ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          }`}
        >
          {properties.map((property: Property) => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </select>
        {errors.propertyIds && <p className="mt-1 text-sm text-red-500">{errors.propertyIds}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="hasExpiration"
            checked={formData.hasExpiration}
            onChange={(e) => onFieldChange("hasExpiration", e.target.checked)}
            disabled={isSubmitting}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="hasExpiration"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t.inventory.table.hasExpiration}
          </label>
        </div>
        <Input
          label={t.inventory.table.minimumStock}
          type="number"
          value={formData.minimumStock}
          onChange={(e) => onFieldChange("minimumStock", e.target.value)}
          error={errors.minimumStock}
          disabled={isSubmitting}
          min="0"
          step="0.01"
          required
        />
        <Input
          label={t.inventory.table.expirationDate}
          type="date"
          value={formData.expirationDate}
          onChange={(e) => onFieldChange("expirationDate", e.target.value)}
          error={errors.expirationDate}
          disabled={isSubmitting || !formData.hasExpiration}
          required={formData.hasExpiration}
        />
      </div>

      {showObservation && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observação
            </label>
            <textarea
              value={formData.observation}
              onChange={(e) => onFieldChange("observation", e.target.value)}
              disabled={isSubmitting}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
              placeholder="Adicione uma observação (opcional)"
            />
          </div>

          {onObservationFilesChange && (
            <FileUpload
              label="Anexos"
              files={observationFiles}
              onChange={onObservationFilesChange}
              disabled={isSubmitting}
              multiple={true}
              helperText="Você pode anexar múltiplos arquivos à observação"
            />
          )}
        </>
      )}
    </div>
  );
}
