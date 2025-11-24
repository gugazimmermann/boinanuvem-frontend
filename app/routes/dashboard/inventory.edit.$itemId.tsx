import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button, Alert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES, getInventoryViewRoute } from "~/routes.config";
import { getInventoryItemById, updateInventoryItem } from "~/services/inventory.service";
import { getNitrogenContent, setNitrogenContent } from "~/services/nitrogen-content.service";
import type { InventoryItemFormData } from "~/types";
import { InventoryItemCategory, PaymentMethod } from "~/types";
import { mockProperties } from "~/mocks/properties";
import { mockSuppliers } from "~/mocks/suppliers";
import { useInventoryForm } from "~/hooks/use-inventory-form";
import { InventoryItemForm } from "~/components/dashboard/inventory/inventory-item-form";
import { mockCompanies } from "~/mocks/companies";
import { getBankAccountsByCompanyId } from "~/services/bank-account.service";

export function meta() {
  return [
    { title: "Editar Item de Estoque - Boi na Nuvem" },
    {
      name: "description",
      content: "Editar item de estoque",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "edit")({ request });
}

export default function EditInventoryItem() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { itemId } = useParams<{ itemId: string }>();
  const item = getInventoryItemById(itemId);
  const company = mockCompanies[0];
  const companyId = company?.id || "";
  const bankAccounts = getBankAccountsByCompanyId(companyId);

  const { formData, errors, handleChange, validate, setFormData } = useInventoryForm({
    translations: t,
  });

  useEffect(() => {
    if (item) {
      const nitrogenContent = getNitrogenContent(item.id);
      setFormData({
        code: item.code,
        name: item.name,
        description: item.description || "",
        category: item.category,
        customCategory: item.customCategory || "",
        unit: item.unit,
        minimumStock: item.minimumStock.toString(),
        initialStock: "0",
        unitPrice: item.unitPrice?.toString() || "",
        supplierId: item.supplierId || "",
        hasExpiration: item.hasExpiration,
        expirationDate: item.expirationDate || "",
        usageAmount: item.usageAmount?.toString() || "",
        usageUnit: item.usageUnit || "",
        usageBasis: item.usageBasis || "",
        nitrogenContent: nitrogenContent > 0 ? nitrogenContent.toString() : "",
        propertyIds: item.propertyIds || [],
        createCashFlowTransaction: false,
        paymentMethod: PaymentMethod.PIX,
        bankAccountId: "",
        createAccountPayable: false,
        dueDate: "",
        accountPayablePaymentMethod: PaymentMethod.PIX,
        accountPayableBankAccountId: "",
        observation: "",
      });
    }
  }, [item, setFormData]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !validate()) return;

    setIsSubmitting(true);
    try {
      const itemData: Partial<InventoryItemFormData> = {
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
        propertyIds: formData.propertyIds,
      };
      const success = updateInventoryItem(item.id, itemData);
      if (success) {
        if (
          formData.category === InventoryItemCategory.FERTILIZER &&
          formData.nitrogenContent &&
          formData.nitrogenContent.trim()
        ) {
          const nitrogenKgPerUnit = parseFloat(formData.nitrogenContent);
          if (!isNaN(nitrogenKgPerUnit) && nitrogenKgPerUnit >= 0) {
            setNitrogenContent(item.id, nitrogenKgPerUnit);
          }
        }

        showAlert(t.inventory.edit.success, "success");
        setTimeout(() => {
          navigate(getInventoryViewRoute(item.id));
        }, 1500);
      } else {
        showAlert(t.inventory.edit.error, "error");
      }
    } catch (error) {
      console.error("Error updating inventory item:", error);
      showAlert(t.inventory.edit.error, "error");
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
            {t.inventory.edit.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.inventory.edit.description}
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
          <InventoryItemForm
            formData={formData}
            errors={errors}
            isSubmitting={isSubmitting}
            onFieldChange={handleChange}
            translations={t}
            suppliers={mockSuppliers}
            properties={mockProperties}
            bankAccounts={bankAccounts}
            showInitialStock={false}
            showObservation={false}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(getInventoryViewRoute(item.id))}
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
