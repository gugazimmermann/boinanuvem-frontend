import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { FormPageLayout } from "~/components/dashboard/forms/form-page-layout";
import { ROUTES, getInventoryViewRoute } from "~/routes.config";
import { getInventoryItemById, updateInventoryItem } from "~/services/inventory.service";
import { getBankAccountsByCompanyId } from "~/services/bank-account.service";
import { getNitrogenContent, setNitrogenContent } from "~/services/nitrogen-content.service";
import type {
  BankAccount,
  InventoryItemFormData,
  Property,
  Supplier,
  InventoryItem,
} from "~/types";
import { PaymentMethod } from "~/types";
import { getProperties } from "~/services/properties.service";
import { getSuppliers } from "~/services/suppliers.service";
import { useInventoryForm } from "~/hooks/use-inventory-form";
import { InventoryItemForm } from "~/components/dashboard/inventory/inventory-item-form";
import { useAuth } from "~/contexts/auth-context";
import { useAlert } from "~/hooks/use-alert";
import {
  getUsageFields,
  getCustomCategory,
  getExpirationDate,
  handleNitrogenContent,
} from "~/utils/inventory-form-helpers";

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
  const { currentUser } = useAuth();
  const companyId = currentUser?.companyId || "";
  const [item, setItem] = useState<InventoryItem | undefined>(undefined);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    const loadItem = async () => {
      if (itemId) {
        try {
          const itemData = await getInventoryItemById(itemId);
          setItem(itemData);
        } catch (error) {
          console.error("Failed to load inventory item:", error);
        }
      }
    };
    loadItem();
  }, [itemId]);

  useEffect(() => {
    const loadBankAccounts = async () => {
      if (companyId) {
        try {
          const accounts = await getBankAccountsByCompanyId(companyId);
          setBankAccounts(accounts);
        } catch (error) {
          console.error("Failed to load bank accounts:", error);
        }
      }
    };
    loadBankAccounts();
  }, [companyId]);

  useEffect(() => {
    const fetchData = async () => {
      if (companyId) {
        try {
          const [propertiesData, suppliersData] = await Promise.all([
            getProperties(),
            getSuppliers(),
          ]);
          setProperties(propertiesData.filter((prop) => prop.companyId === companyId));
          setSuppliers(suppliersData.filter((sup) => sup.companyId === companyId));
        } catch (error) {
          console.error("Failed to load properties or suppliers:", error);
        }
      }
    };
    fetchData();
  }, [companyId]);

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
  const { alertMessage, showAlert } = useAlert();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !validate()) return;

    setIsSubmitting(true);
    try {
      const usageFields = getUsageFields(formData);
      const itemData: Partial<InventoryItemFormData> = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category,
        customCategory: getCustomCategory(formData),
        unit: formData.unit,
        minimumStock: Number.parseFloat(formData.minimumStock),
        unitPrice: formData.unitPrice?.trim() ? Number.parseFloat(formData.unitPrice) : undefined,
        supplierId: formData.supplierId || undefined,
        hasExpiration: formData.hasExpiration,
        expirationDate: getExpirationDate(formData),
        ...usageFields,
        propertyIds: formData.propertyIds,
      };
      await updateInventoryItem(item.id, itemData);
      handleNitrogenContent(item.id, formData, setNitrogenContent);

      showAlert(t.inventory.edit.success, "success");
      setTimeout(() => {
        navigate(getInventoryViewRoute(item.id));
      }, 1500);
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
    <FormPageLayout
      alertMessage={alertMessage}
      title={t.inventory.edit.title}
      description={t.inventory.edit.description}
      backButtonLabel={t.common.back}
      onBack={() => navigate(getInventoryViewRoute(item.id))}
      isSubmitting={isSubmitting}
      submitButtonLabel={t.common.save}
      cancelButtonLabel={t.common.cancel}
      onSubmit={handleSubmit}
      onCancel={() => navigate(getInventoryViewRoute(item.id))}
      containerClassName="space-y-8"
      formSpacing="space-y-8"
      titleSize="3xl"
    >
      <InventoryItemForm
        formData={formData}
        errors={errors}
        isSubmitting={isSubmitting}
        onFieldChange={handleChange}
        translations={t}
        suppliers={suppliers}
        properties={properties}
        bankAccounts={bankAccounts}
        showInitialStock={false}
        showObservation={false}
      />
    </FormPageLayout>
  );
}
