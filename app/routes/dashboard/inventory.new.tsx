import { useState } from "react";
import { useNavigate } from "react-router";
import { Button, Alert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addInventoryItem } from "~/services/inventory.service";
import { addInventoryMovement } from "~/services/inventory-movements.service";
import { setNitrogenContent } from "~/services/nitrogen-content.service";
import { addCashFlow } from "~/services/cash-flow.service";
import { addAccountsPayable } from "~/services/accounts-payable.service";
import { addInventoryObservation } from "~/services/inventory-observations.service";
import { getBankAccountsByCompanyId } from "~/services/bank-account.service";
import type {
  InventoryItemFormData,
  InventoryMovementFormData,
  CashFlowFormData,
  AccountsPayableFormData,
} from "~/types";
import { InventoryItemCategory, InventoryMovementType, AccountsPayableStatus } from "~/types";
import { mockCompanies } from "~/mocks/companies";
import { mockProperties } from "~/mocks/properties";
import { mockSuppliers } from "~/mocks/suppliers";
import { useInventoryForm } from "~/hooks/use-inventory-form";
import { InventoryItemForm } from "~/components/dashboard/inventory/inventory-item-form";
import { getCategoryForCashFlow } from "~/utils/inventory-utils";

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

  const { formData, errors, handleChange, validate } = useInventoryForm({
    translations: t,
  });

  const [observationFiles, setObservationFiles] = useState<File[]>([]);
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

      if (
        formData.category === InventoryItemCategory.FERTILIZER &&
        formData.nitrogenContent &&
        formData.nitrogenContent.trim()
      ) {
        const nitrogenKgPerUnit = parseFloat(formData.nitrogenContent);
        if (!isNaN(nitrogenKgPerUnit) && nitrogenKgPerUnit >= 0) {
          setNitrogenContent(newItem.id, nitrogenKgPerUnit);
        }
      }

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
            showInitialStock={true}
            showObservation={true}
            observationFiles={observationFiles}
            onObservationFilesChange={setObservationFiles}
          />

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
