import { useState } from "react";
import { useNavigate } from "react-router";
import { Input, Select, Button, Alert, FileUpload } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addInventoryItem } from "~/services/inventory.service";
import { addInventoryMovement } from "~/services/inventory-movements.service";
import { addCashFlow } from "~/services/cash-flow.service";
import { addAccountsPayable } from "~/services/accounts-payable.service";
import { addInventoryObservation } from "~/services/inventory-observations.service";
import { getBankAccountsByCompanyId } from "~/services/bank-account.service";
import type {
  InventoryItemFormData,
  InventoryMovementFormData,
  CashFlowFormData,
  AccountsPayableFormData,
  Property,
} from "~/types";
import {
  InventoryItemCategory,
  InventoryMovementType,
  CashFlowCategory,
  PaymentMethod,
  AccountsPayableStatus,
} from "~/types";
import { mockCompanies } from "~/mocks/companies";
import { mockProperties } from "~/mocks/properties";
import { mockSuppliers } from "~/mocks/suppliers";

const getCategoryForCashFlow = (itemCategory: string): CashFlowCategory => {
  switch (itemCategory) {
    case "feed":
      return CashFlowCategory.FEED;
    case "medicines":
      return CashFlowCategory.MEDICINES;
    case "vaccines":
      return CashFlowCategory.VACCINES;
    case "supplements":
    case "vitamins":
      return CashFlowCategory.OTHER_EXPENSES;
    default:
      return CashFlowCategory.OTHER_EXPENSES;
  }
};

export function meta() {
  return [
    { title: "Adicionar Item de Estoque - Boi na Nuvem" },
    {
      name: "description",
      content: "Adicionar novo item de estoque",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function NewInventoryItem() {
  const t = useTranslation();
  const navigate = useNavigate();
  const company = mockCompanies[0];
  const companyId = company?.id || "";
  const bankAccounts = getBankAccountsByCompanyId(companyId);

  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    description: string;
    category: InventoryItemCategory;
    customCategory: string;
    unit: string;
    minimumStock: string;
    initialStock: string;
    unitPrice: string;
    supplierId: string;
    hasExpiration: boolean;
    expirationDate: string;
    usageAmount: string;
    usageUnit: string;
    usageBasis: string;
    propertyIds: string[];
    createCashFlowTransaction: boolean;
    paymentMethod: PaymentMethod;
    bankAccountId: string;
    createAccountPayable: boolean;
    dueDate: string;
    accountPayablePaymentMethod: PaymentMethod;
    accountPayableBankAccountId: string;
    observation: string;
  }>({
    code: "",
    name: "",
    description: "",
    category: InventoryItemCategory.CUSTOM,
    customCategory: "",
    unit: "unidade",
    minimumStock: "0",
    initialStock: "0",
    unitPrice: "",
    supplierId: "",
    hasExpiration: false,
    expirationDate: "",
    usageAmount: "",
    usageUnit: "",
    usageBasis: "",
    propertyIds: [],
    createCashFlowTransaction: false,
    paymentMethod: PaymentMethod.PIX,
    bankAccountId: "",
    createAccountPayable: false,
    dueDate: "",
    accountPayablePaymentMethod: PaymentMethod.PIX,
    accountPayableBankAccountId: "",
    observation: "",
  });

  const [observationFiles, setObservationFiles] = useState<File[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);

  const showAlert = (
    title: string,
    variant: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setAlertMessage({ title, variant });
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  const handleChange = (
    field: keyof typeof formData,
    value: string | boolean | string[] | PaymentMethod
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      newErrors.code = t.profile.errors.required(t.inventory.table.code);
    }
    if (!formData.name?.trim()) {
      newErrors.name = t.profile.errors.required(t.inventory.table.name);
    }
    if (!formData.propertyIds || formData.propertyIds.length === 0) {
      newErrors.propertyIds = t.inventory.new.propertyRequired;
    }
    if (formData.category === InventoryItemCategory.CUSTOM && !formData.customCategory?.trim()) {
      newErrors.customCategory = t.inventory.new.customCategoryRequired;
    }
    const minStock = parseFloat(formData.minimumStock);
    if (isNaN(minStock) || minStock < 0) {
      newErrors.minimumStock = t.inventory.new.minimumStockInvalid;
    }
    if (formData.unitPrice && formData.unitPrice.trim()) {
      const unitPrice = parseFloat(formData.unitPrice);
      if (isNaN(unitPrice) || unitPrice <= 0) {
        newErrors.unitPrice = t.inventory.new.unitPriceInvalid;
      }
    }
    const initialStock =
      formData.initialStock && formData.initialStock.trim() ? parseFloat(formData.initialStock) : 0;
    if (formData.initialStock && formData.initialStock.trim()) {
      if (isNaN(initialStock) || initialStock < 0) {
        newErrors.initialStock = t.inventory.new.initialStockInvalid;
      }
    }
    if (formData.hasExpiration && !formData.expirationDate) {
      newErrors.expirationDate = t.inventory.new.expirationDateRequired;
    }

    // Validate usage method if category is medicines or vaccines
    if (
      (formData.category === InventoryItemCategory.MEDICINES ||
        formData.category === InventoryItemCategory.VACCINES) &&
      formData.usageAmount &&
      formData.usageAmount.trim()
    ) {
      const usageAmount = parseFloat(formData.usageAmount);
      if (isNaN(usageAmount) || usageAmount <= 0) {
        newErrors.usageAmount = t.inventory.new.usageAmountInvalid;
      }
    }

    if (formData.createCashFlowTransaction && initialStock > 0 && formData.supplierId) {
      if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
        newErrors.unitPrice = t.inventory.movements.new.unitPriceRequired;
      }
      if (!formData.paymentMethod) {
        newErrors.paymentMethod = t.inventory.movements.new.paymentMethodRequired;
      }
    }

    if (formData.createAccountPayable && initialStock > 0 && formData.supplierId) {
      if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
        newErrors.unitPrice = t.inventory.movements.new.unitPriceRequired;
      }
      if (!formData.dueDate) {
        newErrors.dueDate = t.inventory.movements.new.dueDateRequired;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const itemData: InventoryItemFormData = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category,
        customCategory:
          formData.category === InventoryItemCategory.CUSTOM && formData.customCategory.trim()
            ? formData.customCategory.trim()
            : undefined,
        unit: formData.unit,
        minimumStock: parseFloat(formData.minimumStock),
        unitPrice:
          formData.unitPrice && formData.unitPrice.trim()
            ? parseFloat(formData.unitPrice)
            : undefined,
        supplierId: formData.supplierId || undefined,
        hasExpiration: formData.hasExpiration,
        expirationDate:
          formData.hasExpiration && formData.expirationDate ? formData.expirationDate : undefined,
        usageAmount:
          (formData.category === InventoryItemCategory.MEDICINES ||
            formData.category === InventoryItemCategory.VACCINES) &&
          formData.usageAmount &&
          formData.usageAmount.trim()
            ? parseFloat(formData.usageAmount)
            : undefined,
        usageUnit:
          (formData.category === InventoryItemCategory.MEDICINES ||
            formData.category === InventoryItemCategory.VACCINES) &&
          formData.usageUnit &&
          formData.usageUnit.trim()
            ? formData.usageUnit.trim()
            : undefined,
        usageBasis:
          (formData.category === InventoryItemCategory.MEDICINES ||
            formData.category === InventoryItemCategory.VACCINES) &&
          formData.usageBasis &&
          formData.usageBasis.trim()
            ? formData.usageBasis.trim()
            : undefined,
        companyId,
        propertyIds: formData.propertyIds,
      };
      const newItem = addInventoryItem(itemData);

      const initialStock =
        formData.initialStock && formData.initialStock.trim()
          ? parseFloat(formData.initialStock)
          : 0;
      let cashFlowId: string | undefined;

      if (initialStock > 0 && formData.propertyIds.length > 0) {
        const unitPrice =
          formData.unitPrice && formData.unitPrice.trim()
            ? parseFloat(formData.unitPrice)
            : newItem.unitPrice || 0;
        const totalAmount = initialStock * unitPrice;

        if (formData.createCashFlowTransaction && formData.supplierId && unitPrice > 0) {
          const cashFlowData: CashFlowFormData = {
            companyId,
            type: "expense",
            amount: totalAmount,
            date: new Date().toISOString().split("T")[0],
            description:
              formData.description.trim() ||
              `${t.inventory.movements.new.purchaseOf} ${newItem.name}`,
            category: getCategoryForCashFlow(formData.category),
            paymentMethod: formData.paymentMethod,
            status: "completed",
            supplierId: formData.supplierId,
            propertyId: formData.propertyIds[0],
            bankAccountId: formData.bankAccountId || undefined,
          };

          const cashFlow = addCashFlow(cashFlowData);
          cashFlowId = cashFlow.id;
        }

        if (formData.createAccountPayable && formData.supplierId && unitPrice > 0) {
          const accountPayableData: AccountsPayableFormData = {
            companyId,
            supplierId: formData.supplierId,
            amount: totalAmount,
            dueDate: formData.dueDate,
            description:
              formData.description.trim() ||
              `${t.inventory.movements.new.purchaseOf} ${newItem.name}`,
            category: getCategoryForCashFlow(formData.category),
            paymentMethod: formData.accountPayablePaymentMethod || undefined,
            status: AccountsPayableStatus.UNPAID,
            propertyId: formData.propertyIds[0],
            bankAccountId: formData.accountPayableBankAccountId || undefined,
          };

          addAccountsPayable(accountPayableData);
        }

        const movementType = formData.supplierId
          ? InventoryMovementType.PURCHASE
          : InventoryMovementType.ADJUSTMENT;
        const movementData: InventoryMovementFormData = {
          itemId: newItem.id,
          type: movementType,
          quantity: initialStock,
          unitPrice: unitPrice > 0 ? unitPrice : undefined,
          date: new Date().toISOString().split("T")[0],
          description: formData.description.trim() || t.inventory.new.initialStockDescription,
          supplierId: formData.supplierId || undefined,
          cashFlowId,
          propertyId: formData.propertyIds[0],
          companyId,
          expirationDate:
            formData.hasExpiration && formData.expirationDate ? formData.expirationDate : undefined,
        };
        addInventoryMovement(movementData);
      }

      // Create observation if provided
      if (formData.observation?.trim()) {
        const fileIds = observationFiles.map(
          (_, index) => `file-inventory-obs-${Date.now()}-${index}`
        );

        addInventoryObservation({
          itemId: newItem.id,
          observation: formData.observation.trim(),
          fileIds: fileIds.length > 0 ? fileIds : undefined,
        });
      }

      showAlert(t.inventory.new.success, "success");
      setTimeout(() => {
        navigate(ROUTES.INVENTORY);
      }, 1500);
    } catch (error) {
      console.error("Error adding inventory item:", error);
      showAlert(t.inventory.new.error, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = Object.values(InventoryItemCategory).map((category) => ({
    value: category,
    label:
      category === InventoryItemCategory.CUSTOM
        ? t.inventory.categories.custom
        : t.inventory.categories[category as keyof typeof t.inventory.categories] || category,
  }));

  const unitOptions = [
    { value: "unidade", label: t.inventory.units.unit },
    { value: "g", label: t.inventory.units.gram },
    { value: "kg", label: t.inventory.units.kg },
    { value: "tonelada", label: t.inventory.units.ton },
    { value: "ml", label: t.inventory.units.milliliter },
    { value: "L", label: t.inventory.units.liter },
    { value: "cm", label: t.inventory.units.centimeter },
    { value: "m", label: t.inventory.units.meter },
    { value: "m2", label: t.inventory.units.squareMeter },
    { value: "ha", label: t.inventory.units.hectare },
    { value: "saco", label: t.inventory.units.bag },
    { value: "frasco", label: t.inventory.units.bottle },
    { value: "dose", label: t.inventory.units.dose },
    { value: "caixa", label: t.inventory.units.box },
    { value: "comprimido", label: t.inventory.units.tablet },
    { value: "pilula", label: t.inventory.units.pill },
    { value: "ampola", label: t.inventory.units.ampoule },
    { value: "seringa", label: t.inventory.units.syringe },
    { value: "cartucho", label: t.inventory.units.cartridge },
    { value: "rolo", label: t.inventory.units.roll },
    { value: "pacote", label: t.inventory.units.package },
    { value: "lata", label: t.inventory.units.can },
  ];

  const usageUnitOptions = [
    { value: "unidade", label: t.inventory.units.unit },
    { value: "ml", label: t.inventory.units.milliliter },
    { value: "L", label: t.inventory.units.liter },
    { value: "dose", label: t.inventory.units.dose },
    { value: "frasco", label: t.inventory.units.bottle },
    { value: "ampola", label: t.inventory.units.ampoule },
    { value: "seringa", label: t.inventory.units.syringe },
    { value: "comprimido", label: t.inventory.units.tablet },
    { value: "pilula", label: t.inventory.units.pill },
    { value: "g", label: t.inventory.units.gram },
    { value: "kg", label: t.inventory.units.kg },
  ];

  const usageBasisOptions = [
    {
      value: "per_animal",
      label: t.inventory.new.usageBasisOptions?.perAnimal || "por animal",
    },
    {
      value: "per_kg",
      label: t.inventory.new.usageBasisOptions?.perKg || "por kg",
    },
  ];

  return (
    <div className="space-y-6">
      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
          <Alert title={alertMessage.title} variant={alertMessage.variant} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.inventory.addItem}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.inventory.new.description}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.INVENTORY)}
          disabled={isSubmitting}
        >
          {t.common.back}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={t.inventory.table.code}
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                error={errors.code}
                disabled={isSubmitting}
                required
              />
              <Input
                label={t.inventory.table.name}
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
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
                onChange={(e) => handleChange("description", e.target.value)}
                disabled={isSubmitting}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 resize-none ${
                  errors.description ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={t.inventory.table.category}
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value as InventoryItemCategory)}
                options={categoryOptions}
                error={errors.category}
                disabled={isSubmitting}
                required
              />
              {formData.category === InventoryItemCategory.CUSTOM && (
                <Input
                  label={t.inventory.new.customCategoryLabel}
                  value={formData.customCategory}
                  onChange={(e) => handleChange("customCategory", e.target.value)}
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
                onChange={(e) => handleChange("unit", e.target.value)}
                options={unitOptions}
                error={errors.unit}
                disabled={isSubmitting}
                required
              />
              <Input
                label={t.inventory.new.unitPriceLabel}
                type="number"
                value={formData.unitPrice}
                onChange={(e) => handleChange("unitPrice", e.target.value)}
                error={errors.unitPrice}
                disabled={isSubmitting}
                min="0"
                step="0.01"
                placeholder={t.inventory.new.unitPricePlaceholder}
              />
            </div>

            {(formData.category === InventoryItemCategory.MEDICINES ||
              formData.category === InventoryItemCategory.VACCINES) && (
              <div className="space-y-4 border-t border-b border-gray-200 dark:border-gray-700 pt-4 pb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.inventory.new.usageMethod}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label={t.inventory.new.usageAmount}
                    type="number"
                    value={formData.usageAmount}
                    onChange={(e) => handleChange("usageAmount", e.target.value)}
                    error={errors.usageAmount}
                    disabled={isSubmitting}
                    min="0"
                    step="0.01"
                    placeholder="1"
                  />
                  <Select
                    label={t.inventory.new.usageUnit}
                    value={formData.usageUnit}
                    onChange={(e) => handleChange("usageUnit", e.target.value)}
                    options={usageUnitOptions}
                    error={errors.usageUnit}
                    disabled={isSubmitting}
                  />
                  <Select
                    label={t.inventory.new.usageBasis}
                    value={formData.usageBasis}
                    onChange={(e) => handleChange("usageBasis", e.target.value)}
                    options={usageBasisOptions}
                    error={errors.usageBasis}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}

            <Input
              label={t.inventory.new.initialStockLabel}
              type="number"
              value={formData.initialStock}
              onChange={(e) => handleChange("initialStock", e.target.value)}
              error={errors.initialStock}
              disabled={isSubmitting}
              min="0"
              step="0.01"
              placeholder={t.inventory.new.initialStockPlaceholder}
            />

            <Select
              label={t.inventory.table.supplier}
              value={formData.supplierId}
              onChange={(e) => handleChange("supplierId", e.target.value)}
              options={[
                { value: "", label: t.common.select },
                ...mockSuppliers.map((supplier) => ({
                  value: supplier.id,
                  label: supplier.name,
                })),
              ]}
              error={errors.supplierId}
              disabled={isSubmitting}
            />

            {formData.supplierId && (
              <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="createCashFlowTransaction"
                    checked={formData.createCashFlowTransaction}
                    onChange={(e) => handleChange("createCashFlowTransaction", e.target.checked)}
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
                      onChange={(e) =>
                        handleChange("paymentMethod", e.target.value as PaymentMethod)
                      }
                      options={Object.values(PaymentMethod).map((method) => ({
                        value: method,
                        label:
                          t.cashFlow.paymentMethods[
                            method as keyof typeof t.cashFlow.paymentMethods
                          ] || method,
                      }))}
                      error={errors.paymentMethod}
                      disabled={isSubmitting}
                      required
                    />
                    <Select
                      label={t.inventory.movements.new.bankAccount}
                      value={formData.bankAccountId}
                      onChange={(e) => handleChange("bankAccountId", e.target.value)}
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
                    onChange={(e) => handleChange("createAccountPayable", e.target.checked)}
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
                      onChange={(e) => handleChange("dueDate", e.target.value)}
                      error={errors.dueDate}
                      disabled={isSubmitting}
                      required
                    />
                    <Select
                      label={t.inventory.movements.new.paymentMethod}
                      value={formData.accountPayablePaymentMethod}
                      onChange={(e) =>
                        handleChange("accountPayablePaymentMethod", e.target.value as PaymentMethod)
                      }
                      options={Object.values(PaymentMethod).map((method) => ({
                        value: method,
                        label:
                          t.cashFlow.paymentMethods[
                            method as keyof typeof t.cashFlow.paymentMethods
                          ] || method,
                      }))}
                      error={errors.accountPayablePaymentMethod}
                      disabled={isSubmitting}
                    />
                    <Select
                      label={t.inventory.movements.new.bankAccount}
                      value={formData.accountPayableBankAccountId}
                      onChange={(e) => handleChange("accountPayableBankAccountId", e.target.value)}
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
                  const selectedIds = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  );
                  handleChange("propertyIds", selectedIds);
                }}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 min-h-[100px] ${
                  errors.propertyIds ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {mockProperties.map((property: Property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
              {errors.propertyIds && (
                <p className="mt-1 text-sm text-red-500">{errors.propertyIds}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="hasExpiration"
                  checked={formData.hasExpiration}
                  onChange={(e) => handleChange("hasExpiration", e.target.checked)}
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
                onChange={(e) => handleChange("minimumStock", e.target.value)}
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
                onChange={(e) => handleChange("expirationDate", e.target.value)}
                error={errors.expirationDate}
                disabled={isSubmitting || !formData.hasExpiration}
                required={formData.hasExpiration}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Observação
              </label>
              <textarea
                value={formData.observation}
                onChange={(e) => handleChange("observation", e.target.value)}
                disabled={isSubmitting}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                placeholder="Adicione uma observação (opcional)"
              />
            </div>

            <FileUpload
              label="Anexos"
              files={observationFiles}
              onChange={setObservationFiles}
              disabled={isSubmitting}
              multiple={true}
              helperText="Você pode anexar múltiplos arquivos à observação"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.INVENTORY)}
              disabled={isSubmitting}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {t.common.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
