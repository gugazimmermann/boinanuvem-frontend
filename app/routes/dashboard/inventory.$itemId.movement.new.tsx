import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Input, Select, Button, Alert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES, getInventoryViewRoute } from "~/routes.config";
import { getInventoryItemById } from "~/services/inventory.service";
import { addInventoryMovement } from "~/services/inventory-movements.service";
import { addCashFlow } from "~/services/cash-flow.service";
import { addAccountsPayable } from "~/services/accounts-payable.service";
import { getSuppliersByCompanyId } from "~/services/suppliers.service";
import { getPropertiesByCompanyId } from "~/services/properties.service";
import { getBankAccountsByCompanyId } from "~/services/bank-account.service";
import { getLocationsByPropertyId } from "~/services/locations.service";
import type {
  InventoryMovementFormData,
  CashFlowFormData,
  AccountsPayableFormData,
  Property,
} from "~/types";
import { InventoryMovementType, PaymentMethod, AccountsPayableStatus } from "~/types";
import { mockCompanies } from "~/mocks/companies";
import { getCategoryForCashFlow, getUnitLabel } from "~/utils/inventory-utils";

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

  const [formData, setFormData] = useState<{
    type: InventoryMovementType;
    quantity: string;
    unitPrice: string;
    date: string;
    description: string;
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
  }>({
    type: InventoryMovementType.PURCHASE,
    quantity: "",
    unitPrice: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
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
  });

  useEffect(() => {
    if (item) {
      setFormData((prev) => {
        const updates: Partial<typeof formData> = {};
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
  }, [item]);

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

  const handleChange = (field: keyof typeof formData, value: string | boolean | PaymentMethod) => {
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

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = t.inventory.movements.new.quantityRequired;
    }
    if (!formData.date) {
      newErrors.date = t.inventory.movements.new.dateRequired;
    }

    if (!formData.propertyId) {
      newErrors.propertyId = t.inventory.movements.new.propertyRequired;
    }
    if (formData.type === InventoryMovementType.PURCHASE && !formData.supplierId) {
      newErrors.supplierId = t.inventory.movements.new.supplierRequired;
    }
    if (formData.createCashFlowTransaction) {
      if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
        newErrors.unitPrice = t.inventory.movements.new.unitPriceRequired;
      }
      if (!formData.paymentMethod) {
        newErrors.paymentMethod = t.inventory.movements.new.paymentMethodRequired;
      }
    }
    if (formData.createAccountPayable && formData.type === InventoryMovementType.PURCHASE) {
      if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
        newErrors.unitPrice = t.inventory.movements.new.unitPriceRequired;
      }
      if (!formData.dueDate) {
        newErrors.dueDate = t.inventory.movements.new.dueDateRequired;
      }
    }
    if (
      item?.hasExpiration &&
      formData.type === InventoryMovementType.PURCHASE &&
      !formData.expirationDate
    ) {
      newErrors.expirationDate = t.inventory.movements.new.expirationDateRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !validate()) return;

    setIsSubmitting(true);
    try {
      let cashFlowId: string | undefined;

      const quantity = parseFloat(formData.quantity);
      const unitPrice =
        formData.unitPrice && formData.unitPrice.trim()
          ? parseFloat(formData.unitPrice)
          : item.unitPrice || 0;
      const totalAmount = quantity * unitPrice;

      if (formData.createCashFlowTransaction && formData.type === InventoryMovementType.PURCHASE) {
        const cashFlowData: CashFlowFormData = {
          companyId,
          type: "expense",
          amount: totalAmount,
          date: formData.date,
          description:
            formData.description || `${t.inventory.movements.new.purchaseOf} ${item.name}`,
          category: getCategoryForCashFlow(item.category),
          paymentMethod: formData.paymentMethod,
          status: "completed",
          supplierId: formData.supplierId || undefined,
          propertyId: formData.propertyId,
          bankAccountId: formData.bankAccountId || undefined,
        };

        const cashFlow = addCashFlow(cashFlowData);
        cashFlowId = cashFlow.id;
      }

      if (formData.createAccountPayable && formData.type === InventoryMovementType.PURCHASE) {
        const accountPayableData: AccountsPayableFormData = {
          companyId,
          supplierId: formData.supplierId || undefined,
          amount: totalAmount,
          dueDate: formData.dueDate,
          description:
            formData.description || `${t.inventory.movements.new.purchaseOf} ${item.name}`,
          category: getCategoryForCashFlow(item.category),
          paymentMethod: formData.accountPayablePaymentMethod || undefined,
          status: AccountsPayableStatus.UNPAID,
          propertyId: formData.propertyId,
          bankAccountId: formData.accountPayableBankAccountId || undefined,
        };

        addAccountsPayable(accountPayableData);
      }

      const movementData: InventoryMovementFormData = {
        itemId: item.id,
        type: formData.type,
        quantity: parseFloat(formData.quantity),
        unitPrice:
          formData.unitPrice && formData.unitPrice.trim()
            ? parseFloat(formData.unitPrice)
            : item.unitPrice || undefined,
        date: formData.date,
        description: formData.description || undefined,
        supplierId: formData.supplierId || undefined,
        cashFlowId,
        propertyId: formData.propertyId,
        companyId,
        locationId: formData.locationId || undefined,
        expirationDate: formData.expirationDate || undefined,
      };

      addInventoryMovement(movementData);
      showAlert(t.inventory.movements.new.success, "success");
      setTimeout(() => {
        navigate(getInventoryViewRoute(item.id));
      }, 1500);
    } catch (error) {
      console.error("Error adding inventory movement:", error);
      showAlert(t.inventory.movements.new.error, "error");
    } finally {
      setIsSubmitting(false);
    }
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
      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
          <Alert title={alertMessage.title} variant={alertMessage.variant} />
        </div>
      )}

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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.inventory.movements.table.description}
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

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(getInventoryViewRoute(item.id))}
              disabled={isSubmitting}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? t.common.loading : t.common.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
