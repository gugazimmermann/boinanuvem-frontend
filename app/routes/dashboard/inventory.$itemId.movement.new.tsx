import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Input, Select, Button, FixedAlert, FileUpload } from "~/components/ui";
import { useTranslation } from "~/i18n";
import {
  ResponsibleSelectionSection,
  ObservationField,
  FormActions,
} from "~/components/dashboard/shared";
import { ROUTES, getInventoryViewRoute } from "~/routes.config";
import { getInventoryItemById } from "~/services/inventory.service";
import { addInventoryMovement } from "~/services/inventory-movements.service";
import { addCashFlow } from "~/services/cash-flow.service";
import { addAccountsPayable } from "~/services/accounts-payable.service";
import { getSuppliersByCompanyId } from "~/services/suppliers.service";
import { getPropertiesByCompanyId } from "~/services/properties.service";
import { getBankAccountsByCompanyId } from "~/services/bank-account.service";
import { getLocationsByPropertyId } from "~/services/locations.service";
import { getEmployeesByPropertyId } from "~/services/employees.service";
import { getServiceProvidersByPropertyId } from "~/services/service-providers.service";
import type {
  InventoryMovementFormData,
  CashFlowFormData,
  AccountsPayableFormData,
  Property,
} from "~/types";
import { InventoryMovementType, PaymentMethod, AccountsPayableStatus } from "~/types";
import { mockCompanies } from "~/mocks/companies";
import { getCategoryForCashFlow, getUnitLabel } from "~/utils/inventory-utils";
import { useInventoryMovementForm } from "~/hooks/use-inventory-movement-form";

type FormData = {
  type: InventoryMovementType;
  quantity: string;
  unitPrice: string;
  date: string;
  description: string;
  observation: string;
  supplierId: string;
  propertyId: string;
  locationId: string;
  expirationDate: string;
  createCashFlowTransaction: boolean;
  paymentMethod: PaymentMethod;
  bankAccountId: string;
  createAccountPayable: boolean;
  dueDate: string;
  accountPayablePaymentMethod: PaymentMethod;
  accountPayableBankAccountId: string;
  employeeIds: string[];
  serviceProviderIds: string[];
};

function validateCashFlowTransaction(
  data: FormData,
  errors: Record<string, string>,
  t: ReturnType<typeof useTranslation>
): void {
  if (!data.unitPrice || Number.parseFloat(data.unitPrice) <= 0) {
    errors.unitPrice = t.inventory.movements.new.unitPriceRequired;
  }
  if (!data.paymentMethod) {
    errors.paymentMethod = t.inventory.movements.new.paymentMethodRequired;
  }
}

function validateAccountPayable(
  data: FormData,
  errors: Record<string, string>,
  t: ReturnType<typeof useTranslation>
): void {
  if (!data.unitPrice || Number.parseFloat(data.unitPrice) <= 0) {
    errors.unitPrice = t.inventory.movements.new.unitPriceRequired;
  }
  if (!data.dueDate) {
    errors.dueDate = t.inventory.movements.new.dueDateRequired;
  }
}

export function meta() {
  return [
    { title: "Nova Movimentação de Estoque - Boi na Nuvem" },
    {
      name: "description",
      content: "Adicionar nova movimentação de estoque",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "view")({ request });
}

export default function NewInventoryMovement() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { itemId } = useParams<{ itemId: string }>();
  const item = getInventoryItemById(itemId);
  const company = mockCompanies[0];
  const companyId = company?.id || "";
  const properties = getPropertiesByCompanyId(companyId);
  const suppliers = getSuppliersByCompanyId(companyId);
  const bankAccounts = getBankAccountsByCompanyId(companyId);

  const initialFormData: FormData = {
    type: InventoryMovementType.PURCHASE,
    quantity: "",
    unitPrice: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    observation: "",
    supplierId: "",
    propertyId: properties[0]?.id || "",
    locationId: "",
    expirationDate: "",
    createCashFlowTransaction: false,
    paymentMethod: PaymentMethod.PIX,
    bankAccountId: "",
    createAccountPayable: false,
    dueDate: "",
    accountPayablePaymentMethod: PaymentMethod.PIX,
    accountPayableBankAccountId: "",
    employeeIds: [],
    serviceProviderIds: [],
  };

  const {
    formData,
    setFormData,
    files,
    setFiles,
    errors,
    isSubmitting,
    alertMessage,
    handleChange: baseHandleChange,
    toggleSelection,
    handleSubmit: baseHandleSubmit,
  } = useInventoryMovementForm<FormData>({
    initialData: initialFormData,
    translationKeys: {
      quantityRequired: t.inventory.movements.new.quantityRequired,
      dateRequired: t.inventory.movements.new.dateRequired,
    },
    validate: (data: FormData) => {
      const newErrors: Record<string, string> = {};

      // Basic validations
      if (!data.propertyId) {
        newErrors.propertyId = t.inventory.movements.new.propertyRequired;
      }

      if (data.type === InventoryMovementType.PURCHASE && !data.supplierId) {
        newErrors.supplierId = t.inventory.movements.new.supplierRequired;
      }

      // Cash flow transaction validations
      if (data.createCashFlowTransaction) {
        validateCashFlowTransaction(data, newErrors, t);
      }

      // Account payable validations
      if (data.createAccountPayable && data.type === InventoryMovementType.PURCHASE) {
        validateAccountPayable(data, newErrors, t);
      }

      // Expiration date validations
      if (
        item?.hasExpiration &&
        data.type === InventoryMovementType.PURCHASE &&
        !data.expirationDate
      ) {
        newErrors.expirationDate = t.inventory.movements.new.expirationDateRequired;
      }

      return Object.keys(newErrors).length === 0 ? true : newErrors;
    },
    onSubmit: async (data: FormData, fileIds: string[]) => {
      if (!item) return;

      let cashFlowId: string | undefined;

      const quantity = Number.parseFloat(data.quantity);
      const unitPrice = data.unitPrice?.trim()
        ? Number.parseFloat(data.unitPrice)
        : item.unitPrice || 0;
      const totalAmount = quantity * unitPrice;

      if (data.createCashFlowTransaction && data.type === InventoryMovementType.PURCHASE) {
        const cashFlowData: CashFlowFormData = {
          companyId,
          type: "expense",
          amount: totalAmount,
          date: data.date,
          description: data.description || `${t.inventory.movements.new.purchaseOf} ${item.name}`,
          category: getCategoryForCashFlow(item.category),
          paymentMethod: data.paymentMethod,
          status: "completed",
          supplierId: data.supplierId || undefined,
          propertyId: data.propertyId,
          bankAccountId: data.bankAccountId || undefined,
        };

        const cashFlow = addCashFlow(cashFlowData);
        cashFlowId = cashFlow.id;
      }

      if (data.createAccountPayable && data.type === InventoryMovementType.PURCHASE) {
        const accountPayableData: AccountsPayableFormData = {
          companyId,
          supplierId: data.supplierId || undefined,
          amount: totalAmount,
          dueDate: data.dueDate,
          description: data.description || `${t.inventory.movements.new.purchaseOf} ${item.name}`,
          category: getCategoryForCashFlow(item.category),
          paymentMethod: data.accountPayablePaymentMethod || undefined,
          status: AccountsPayableStatus.UNPAID,
          propertyId: data.propertyId,
          bankAccountId: data.accountPayableBankAccountId || undefined,
        };

        addAccountsPayable(accountPayableData);
      }

      const movementData: InventoryMovementFormData = {
        itemId: item.id,
        type: data.type,
        quantity: Number.parseFloat(data.quantity),
        unitPrice: data.unitPrice?.trim()
          ? Number.parseFloat(data.unitPrice)
          : item.unitPrice || undefined,
        date: data.date,
        description: data.description || undefined,
        supplierId: data.supplierId || undefined,
        cashFlowId,
        propertyId: data.propertyId,
        companyId,
        locationId: data.locationId || undefined,
        expirationDate: data.expirationDate || undefined,
        employeeIds: data.employeeIds.length > 0 ? data.employeeIds : undefined,
        serviceProviderIds:
          data.serviceProviderIds.length > 0 ? data.serviceProviderIds : undefined,
        observation: data.observation.trim() || undefined,
        fileIds: fileIds.length > 0 ? fileIds : undefined,
      };

      addInventoryMovement(movementData);
    },
    onSuccess: () => {
      if (item) {
        setTimeout(() => {
          navigate(getInventoryViewRoute(item.id));
        }, 1500);
      }
    },
    successMessage: t.inventory.movements.new.success,
    errorMessage: t.inventory.movements.new.error,
  });

  const selectedProperty = properties.find((p) => p.id === formData.propertyId);
  const employees = selectedProperty ? getEmployeesByPropertyId(selectedProperty.id) : [];
  const serviceProviders = selectedProperty
    ? getServiceProvidersByPropertyId(selectedProperty.id)
    : [];

  useEffect(() => {
    if (item) {
      setFormData((prev) => {
        const updates: Partial<FormData> = {};
        if (item.supplierId && !prev.supplierId) {
          updates.supplierId = item.supplierId;
        }
        if (item.propertyIds && item.propertyIds.length > 0 && !prev.propertyId) {
          updates.propertyId = item.propertyIds[0];
        }
        if (item.unitPrice && !prev.unitPrice) {
          updates.unitPrice = item.unitPrice.toString();
        }
        return { ...prev, ...updates };
      });
    }
  }, [item, setFormData]);

  useEffect(() => {
    if (formData.propertyId) {
      setFormData((prev) => ({
        ...prev,
        locationId: "",
        employeeIds: [],
        serviceProviderIds: [],
      }));
    }
  }, [formData.propertyId, setFormData]);

  const handleChange = (
    field: keyof FormData,
    value: string | boolean | PaymentMethod | string[]
  ) => {
    baseHandleChange(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    await baseHandleSubmit(e);
  };

  if (!item) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.inventory.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.INVENTORY)}>
            {t.common.back}
          </Button>
        </div>
      </div>
    );
  }

  const movementTypeOptions = [
    { value: InventoryMovementType.PURCHASE, label: t.inventory.movements.types.purchase },
    { value: InventoryMovementType.CONSUMPTION, label: t.inventory.movements.types.consumption },
    { value: InventoryMovementType.ADJUSTMENT, label: t.inventory.movements.types.adjustment },
    { value: InventoryMovementType.SALE, label: t.inventory.movements.types.sale },
    { value: InventoryMovementType.TRANSFER, label: t.inventory.movements.types.transfer },
  ];

  const paymentMethodOptions = Object.values(PaymentMethod).map((method) => ({
    value: method,
    label: t.cashFlow.paymentMethods[method as keyof typeof t.cashFlow.paymentMethods] || method,
  }));

  const isPurchase = formData.type === InventoryMovementType.PURCHASE;

  return (
    <div className="space-y-8">
      <FixedAlert alertMessage={alertMessage} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t.inventory.movements.addMovement}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.inventory.movements.new.description(item.name)}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(getInventoryViewRoute(item.id))}
          disabled={isSubmitting}
        >
          {t.common.back}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={t.inventory.movements.table.type}
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value as InventoryMovementType)}
                options={movementTypeOptions}
                error={errors.type}
                disabled={isSubmitting}
                required
              />
              <Input
                label={t.inventory.movements.table.date}
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                error={errors.date}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t.inventory.movements.table.quantity}
                type="number"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
                error={errors.quantity}
                disabled={isSubmitting}
                min="0.01"
                step="0.01"
                required
                helperText={`${t.inventory.movements.new.unit}: ${getUnitLabel(item.unit, 1, t)}`}
              />
              <Input
                label={t.inventory.movements.table.unitPrice}
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

            {isPurchase && (
              <Select
                label={t.inventory.movements.table.supplier}
                value={formData.supplierId}
                onChange={(e) => handleChange("supplierId", e.target.value)}
                options={[
                  { value: "", label: t.common.select },
                  ...suppliers.map((supplier) => ({
                    value: supplier.id,
                    label: supplier.name,
                  })),
                ]}
                error={errors.supplierId}
                disabled={isSubmitting}
                required
              />
            )}

            <Select
              label={t.inventory.movements.table.property}
              value={formData.propertyId}
              onChange={(e) => {
                handleChange("propertyId", e.target.value);

                handleChange("locationId", "");
              }}
              options={[
                { value: "", label: t.common.select },
                ...properties.map((property: Property) => ({
                  value: property.id,
                  label: property.name,
                })),
              ]}
              error={errors.propertyId}
              disabled={isSubmitting}
              required
            />

            {formData.type === InventoryMovementType.CONSUMPTION && formData.propertyId && (
              <Select
                label={t.locations.title}
                value={formData.locationId}
                onChange={(e) => handleChange("locationId", e.target.value)}
                options={[
                  { value: "", label: t.common.select },
                  ...getLocationsByPropertyId(formData.propertyId).map((location) => ({
                    value: location.id,
                    label: location.name,
                  })),
                ]}
                error={errors.locationId}
                disabled={isSubmitting}
              />
            )}

            {formData.propertyId && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {t.properties.details.movements.table.responsible}
                </h3>
                <ResponsibleSelectionSection
                  employees={employees}
                  serviceProviders={serviceProviders}
                  selectedEmployeeIds={formData.employeeIds}
                  selectedServiceProviderIds={formData.serviceProviderIds}
                  onToggleEmployee={(id) => toggleSelection("employeeIds", id)}
                  onToggleServiceProvider={(id) => toggleSelection("serviceProviderIds", id)}
                  disabled={isSubmitting}
                  translationKeys={{
                    employeesLabel: t.employees.title,
                    serviceProvidersLabel: t.serviceProviders.title,
                    noEmployees: t.properties.details.movements.noEmployees,
                    noServiceProviders: t.properties.details.movements.noServiceProviders,
                  }}
                />
              </div>
            )}

            {item.hasExpiration && isPurchase && (
              <Input
                label={t.inventory.movements.table.expirationDate}
                type="date"
                value={formData.expirationDate}
                onChange={(e) => handleChange("expirationDate", e.target.value)}
                error={errors.expirationDate}
                disabled={isSubmitting}
                required
              />
            )}

            <ObservationField
              label={t.inventory.movements.table.description || "Descrição"}
              value={formData.description}
              onChange={(value) => handleChange("description", value)}
              error={errors.description}
              disabled={isSubmitting}
              rows={3}
            />

            <ObservationField
              label={t.properties.details.movements.observation}
              value={formData.observation}
              onChange={(value) => handleChange("observation", value)}
              error={errors.observation}
              disabled={isSubmitting}
              placeholder={
                t.properties.details.movements.observationPlaceholder ||
                "Adicione observações sobre esta movimentação..."
              }
            />

            <FileUpload
              label={t.properties.details.movements.files}
              files={files}
              onChange={setFiles}
              disabled={isSubmitting}
              multiple={true}
              helperText={
                t.properties.details.movements.filesHelper ||
                "Você pode fazer upload de múltiplos arquivos"
              }
            />

            {isPurchase && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="createCashFlowTransaction"
                    checked={formData.createCashFlowTransaction}
                    onChange={(e) => handleChange("createCashFlowTransaction", e.target.checked)}
                    disabled={isSubmitting}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor="createCashFlowTransaction"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
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
                      options={paymentMethodOptions}
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
                    disabled={isSubmitting}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor="createAccountPayable"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
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
                      options={paymentMethodOptions}
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
          </div>

          <FormActions
            onCancel={() => navigate(getInventoryViewRoute(item.id))}
            isSubmitting={isSubmitting}
            cancelLabel={t.common.cancel}
            submitLabel={t.common.save}
            loadingLabel={t.common.loading}
            className="border-t-0 pt-0"
          />
        </form>
      </div>
    </div>
  );
}
