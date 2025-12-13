import { useState, useEffect } from "react";
import { getBankAccountsByCompanyId } from "~/services/bank-account.service";
import { useNavigate } from "react-router";
import { useTranslation } from "~/i18n";
import { FormPageLayout } from "~/components/dashboard/forms/form-page-layout";
import { ROUTES } from "~/routes.config";
import { addInventoryItem } from "~/services/inventory.service";
import { addInventoryMovement } from "~/services/inventory-movements.service";
import { addInventoryObservation } from "~/services/inventory-observations.service";
import { setNitrogenContent } from "~/services/nitrogen-content.service";
import { addCashFlow } from "~/services/cash-flow.service";
import { addAccountsPayable } from "~/services/accounts-payable.service";
import type {
  BankAccount,
  InventoryItemFormData,
  InventoryMovementFormData,
  CashFlowFormData,
  AccountsPayableFormData,
  Property,
  Supplier,
  InventoryItemCategory,
} from "~/types";
import { InventoryMovementType, AccountsPayableStatus } from "~/types";
import { useAuth } from "~/contexts/auth-context";
import { getProperties } from "~/services/properties.service";
import { getSuppliers } from "~/services/suppliers.service";
import { useInventoryForm } from "~/hooks/use-inventory-form";
import { InventoryItemForm } from "~/components/dashboard/inventory/inventory-item-form";
import { getCategoryForCashFlow } from "~/utils/inventory-utils";
import { useAlert } from "~/hooks/use-alert";
import {
  getUsageFields,
  getCustomCategory,
  getExpirationDate,
  handleNitrogenContent,
  getInitialStock,
} from "~/utils/inventory-form-helpers";

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
  const { currentUser } = useAuth();
  const companyId = currentUser?.companyId || "";
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

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

  const { formData, errors, handleChange, validate } = useInventoryForm({
    translations: t,
  });

  const [observationFiles, setObservationFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const { alertMessage, showAlert } = useAlert();

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const [propertiesData, suppliersData] = await Promise.all([
          getProperties(),
          getSuppliers(),
        ]);
        setProperties(propertiesData.filter((p) => p.companyId === companyId));
        setSuppliers(suppliersData.filter((s) => s.companyId === companyId));
      } catch (error) {
        console.error("Failed to load properties or suppliers:", error);
      }
    };

    fetchEntities();
  }, [companyId]);

  const createCashFlowTransaction = async (
    item: { category: InventoryItemCategory },
    totalAmount: number
  ): Promise<string | undefined> => {
    if (!formData.createCashFlowTransaction) return undefined;

    const cashFlowData: CashFlowFormData = {
      companyId,
      type: "expense",
      amount: totalAmount,
      date: new Date().toISOString().split("T")[0],
      description: formData.description.trim() || t.inventory.new.initialStockDescription,
      category: getCategoryForCashFlow(item.category),
      paymentMethod: formData.paymentMethod,
      status: "completed",
      supplierId: formData.supplierId,
      propertyId: formData.propertyIds[0],
      bankAccountId: formData.bankAccountId || undefined,
    };
    const cashFlow = await addCashFlow(cashFlowData);
    return cashFlow.id;
  };

  const createAccountPayableTransaction = (
    item: { category: InventoryItemCategory },
    totalAmount: number
  ): void => {
    if (!formData.createAccountPayable) return;

    const accountPayableData: AccountsPayableFormData = {
      companyId,
      supplierId: formData.supplierId,
      amount: totalAmount,
      dueDate: formData.dueDate,
      description: formData.description.trim() || t.inventory.new.initialStockDescription,
      category: getCategoryForCashFlow(item.category),
      paymentMethod: formData.accountPayablePaymentMethod,
      status: AccountsPayableStatus.UNPAID,
      propertyId: formData.propertyIds[0],
      bankAccountId: formData.accountPayableBankAccountId || undefined,
    };
    addAccountsPayable(accountPayableData);
  };

  const handleInitialStockTransactions = async (
    item: { id: string; name: string; category: InventoryItemCategory; unitPrice?: number },
    initialStock: number
  ): Promise<string | undefined> => {
    if (initialStock <= 0 || !formData.supplierId) {
      return undefined;
    }

    const unitPrice = formData.unitPrice?.trim()
      ? Number.parseFloat(formData.unitPrice)
      : item.unitPrice || 0;

    if (unitPrice <= 0) {
      return undefined;
    }

    const totalAmount = initialStock * unitPrice;
    const cashFlowId = createCashFlowTransaction(item, totalAmount);
    createAccountPayableTransaction(item, totalAmount);

    return cashFlowId;
  };

  const createInitialStockMovement = (
    item: { id: string; unitPrice?: number },
    initialStock: number,
    cashFlowId: string | undefined
  ): void => {
    if (initialStock <= 0 || formData.propertyIds.length === 0) return;

    const unitPrice = formData.unitPrice?.trim()
      ? Number.parseFloat(formData.unitPrice)
      : item.unitPrice || 0;
    const movementType = formData.supplierId
      ? InventoryMovementType.PURCHASE
      : InventoryMovementType.ADJUSTMENT;

    const movementData: InventoryMovementFormData = {
      itemId: item.id,
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
  };

  const createObservation = (itemId: string): void => {
    if (!formData.observation?.trim()) return;

    const fileIds = observationFiles.map((_, index) => `file-inventory-obs-${Date.now()}-${index}`);

    addInventoryObservation({
      itemId,
      observation: formData.observation.trim(),
      fileIds: fileIds.length > 0 ? fileIds : undefined,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const usageFields = getUsageFields(formData);
      const itemData: InventoryItemFormData = {
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
        companyId,
        propertyIds: formData.propertyIds,
      };
      const newItem = await addInventoryItem(itemData);

      handleNitrogenContent(newItem.id, formData, setNitrogenContent);

      const initialStock = getInitialStock(formData.initialStock);
      const cashFlowId = await handleInitialStockTransactions(newItem, initialStock);
      createInitialStockMovement(newItem, initialStock, cashFlowId);
      createObservation(newItem.id);

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
    <FormPageLayout
      alertMessage={alertMessage}
      title={t.inventory.addItem}
      description={t.inventory.new.description}
      backButtonLabel={t.common.back}
      onBack={() => navigate(ROUTES.INVENTORY)}
      isSubmitting={isSubmitting}
      submitButtonLabel={t.common.save}
      cancelButtonLabel={t.common.cancel}
      onSubmit={handleSubmit}
      onCancel={() => navigate(ROUTES.INVENTORY)}
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
        showInitialStock={true}
        showObservation={true}
        observationFiles={observationFiles}
        onObservationFilesChange={setObservationFiles}
      />
    </FormPageLayout>
  );
}
