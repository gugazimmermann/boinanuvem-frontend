import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { Input, Select, Button, Alert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES, getAccountsReceivableViewRoute } from "~/routes.config";
import {
  getAccountsReceivableById,
  updateAccountsReceivable,
} from "~/services/accounts-receivable.service";
import { getBankAccountsByCompanyId } from "~/services/bank-account.service";
import { getPropertiesByCompanyId } from "~/services/properties.service";
import type { PaymentMethod, AccountsReceivableStatus, CashFlowCategory } from "~/types";
import { mockCompanies } from "~/mocks/companies";
import {
  PaymentMethod as PMethod,
  AccountsReceivableStatus as ARStatus,
  CashFlowCategory as CFCategory,
} from "~/types";
import { mockBuyers } from "~/mocks/buyers";

export function meta() {
  return [
    { title: "Editar Conta a Receber - Boi na Nuvem" },
    {
      name: "description",
      content: "Editar conta a receber",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "edit")({ request });
}

export default function EditAccountsReceivable() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId: string }>();
  const transaction = getAccountsReceivableById(transactionId);
  const company = mockCompanies[0];
  const bankAccounts = company ? getBankAccountsByCompanyId(company.id) : [];
  const properties = company ? getPropertiesByCompanyId(company.id) : [];

  const [formData, setFormData] = useState<{
    buyerId: string;
    amount: string;
    dueDate: string;
    description: string;
    category: CashFlowCategory;
    paymentMethod: PaymentMethod;
    status: AccountsReceivableStatus;
    paidDate: string;
    paidAmount: string;
    referenceNumber: string;
    bankAccountId: string;
    propertyId: string;
  }>({
    buyerId: "",
    amount: "",
    dueDate: "",
    description: "",
    category: CFCategory.CATTLE_SALES,
    paymentMethod: PMethod.CASH,
    status: ARStatus.UNPAID,
    paidDate: "",
    paidAmount: "",
    referenceNumber: "",
    bankAccountId: "",
    propertyId: "",
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        buyerId: transaction.buyerId || "",
        amount: transaction.amount.toString(),
        dueDate: transaction.dueDate,
        description: transaction.description,
        category: transaction.category || CFCategory.CATTLE_SALES,
        paymentMethod: transaction.paymentMethod || PMethod.CASH,
        status: transaction.status,
        paidDate: transaction.paidDate || "",
        paidAmount: transaction.paidAmount?.toString() || "",
        referenceNumber: transaction.referenceNumber || "",
        bankAccountId: transaction.bankAccountId || "",
        propertyId: transaction.propertyId,
      });
    }
  }, [transaction]);

  const buyers = useMemo(() => {
    if (!formData.propertyId) return mockBuyers;
    return mockBuyers.filter((buy) => buy.propertyIds?.includes(formData.propertyId));
  }, [formData.propertyId]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);

  if (!transaction) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t.accountsReceivable.emptyState.title}
          </p>
          <Button variant="outline" onClick={() => navigate(ROUTES.ACCOUNTS_RECEIVABLE)}>
            {t.common.back}
          </Button>
        </div>
      </div>
    );
  }

  const showAlert = (
    title: string,
    variant: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setAlertMessage({ title, variant });
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      if (field === "propertyId") {
        newData.buyerId = "";
      }
      return newData;
    });
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

    if (!formData.description?.trim()) {
      newErrors.description = t.profile.errors.required(t.accountsReceivable.edit.descriptionLabel);
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = t.profile.errors.required(t.accountsReceivable.edit.amountLabel);
    }
    if (!formData.dueDate) {
      newErrors.dueDate = t.profile.errors.required(t.accountsReceivable.edit.dueDateLabel);
    }
    if (!formData.propertyId) {
      newErrors.propertyId = t.profile.errors.required(t.accountsReceivable.edit.propertyLabel);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      updateAccountsReceivable(transaction.id, {
        buyerId: formData.buyerId || undefined,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        description: formData.description,
        category: formData.category,
        paymentMethod: formData.paymentMethod || undefined,
        status: formData.status,
        paidDate: formData.paidDate || undefined,
        paidAmount: formData.paidAmount ? parseFloat(formData.paidAmount) : undefined,
        referenceNumber: formData.referenceNumber || undefined,
        bankAccountId: formData.bankAccountId || undefined,
        propertyId: formData.propertyId,
      });
      showAlert(t.accountsReceivable.success.updated, "success");
      setTimeout(() => {
        navigate(getAccountsReceivableViewRoute(transaction.id));
      }, 1500);
    } catch (error) {
      console.error("Error updating transaction:", error);
      showAlert(t.accountsReceivable.errors.updateFailed, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethods = [
    { value: PMethod.CASH, label: t.accountsReceivable.paymentMethods.cash },
    { value: PMethod.BANK_TRANSFER, label: t.accountsReceivable.paymentMethods.bank_transfer },
    { value: PMethod.CHECK, label: t.accountsReceivable.paymentMethods.check },
    { value: PMethod.CREDIT_CARD, label: t.accountsReceivable.paymentMethods.credit_card },
    { value: PMethod.DEBIT_CARD, label: t.accountsReceivable.paymentMethods.debit_card },
    { value: PMethod.PIX, label: t.accountsReceivable.paymentMethods.pix },
    { value: PMethod.OTHER, label: t.accountsReceivable.paymentMethods.other },
  ];

  const statusOptions = [
    { value: ARStatus.UNPAID, label: t.accountsReceivable.status.unpaid },
    { value: ARStatus.PAID, label: t.accountsReceivable.status.paid },
    { value: ARStatus.OVERDUE, label: t.accountsReceivable.status.overdue },
    { value: ARStatus.PARTIAL, label: t.accountsReceivable.status.partial },
  ];

  const incomeCategories = [
    { value: CFCategory.CATTLE_SALES, label: t.cashFlow.categories.cattle_sales },
    { value: CFCategory.MILK_SALES, label: t.cashFlow.categories.milk_sales },
    { value: CFCategory.BREEDING_SERVICES, label: t.cashFlow.categories.breeding_services },
    { value: CFCategory.GOVERNMENT_SUBSIDIES, label: t.cashFlow.categories.government_subsidies },
    { value: CFCategory.INSURANCE_CLAIMS, label: t.cashFlow.categories.insurance_claims },
    { value: CFCategory.OTHER_INCOME, label: t.cashFlow.categories.other_income },
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
            {t.accountsReceivable.edit.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.accountsReceivable.edit.description}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(getAccountsReceivableViewRoute(transaction.id))}
          disabled={isSubmitting}
        >
          {t.common.back}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Select
              label={t.accountsReceivable.edit.propertyLabel}
              value={formData.propertyId}
              onChange={(e) => handleChange("propertyId", e.target.value)}
              error={errors.propertyId}
              disabled={isSubmitting}
              required
              options={[
                ...properties.map((property) => ({
                  value: property.id,
                  label: property.name,
                })),
              ]}
            />

            <Select
              label={t.accountsReceivable.edit.buyerLabel}
              value={formData.buyerId}
              onChange={(e) => handleChange("buyerId", e.target.value)}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t.accountsReceivable.edit.amountLabel}
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                error={errors.amount}
                disabled={isSubmitting}
                required
              />
              <Input
                label={t.accountsReceivable.edit.dueDateLabel}
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                error={errors.dueDate}
                disabled={isSubmitting}
                required
              />
            </div>

            <Input
              label={t.accountsReceivable.edit.descriptionLabel}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              error={errors.description}
              disabled={isSubmitting}
              required
            />

            <Select
              label={t.accountsReceivable.edit.categoryLabel}
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value as CashFlowCategory)}
              error={errors.category}
              disabled={isSubmitting}
              options={[{ value: "", label: "-" }, ...incomeCategories]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={t.accountsReceivable.edit.paymentMethodLabel}
                value={formData.paymentMethod}
                onChange={(e) => handleChange("paymentMethod", e.target.value as PaymentMethod)}
                error={errors.paymentMethod}
                disabled={isSubmitting}
                options={[{ value: "", label: "-" }, ...paymentMethods]}
              />
              <Select
                label={t.accountsReceivable.edit.statusLabel}
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value as AccountsReceivableStatus)}
                error={errors.status}
                disabled={isSubmitting}
                required
                options={statusOptions}
              />
            </div>

            <Select
              label={t.accountsReceivable.edit.bankAccountLabel}
              value={formData.bankAccountId}
              onChange={(e) => handleChange("bankAccountId", e.target.value)}
              error={errors.bankAccountId}
              disabled={isSubmitting}
              options={[
                { value: "", label: "-" },
                ...bankAccounts.map((account) => ({
                  value: account.id,
                  label: `${account.bankName} - ${account.accountNumber} (${account.accountType === "checking" ? t.bankAccounts.accountTypes.checking : t.bankAccounts.accountTypes.savings})`,
                })),
              ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t.accountsReceivable.edit.paidDateLabel}
                type="date"
                value={formData.paidDate}
                onChange={(e) => handleChange("paidDate", e.target.value)}
                error={errors.paidDate}
                disabled={isSubmitting}
              />
              <Input
                label={t.accountsReceivable.edit.paidAmountLabel}
                type="number"
                step="0.01"
                min="0"
                value={formData.paidAmount}
                onChange={(e) => handleChange("paidAmount", e.target.value)}
                error={errors.paidAmount}
                disabled={isSubmitting}
              />
            </div>

            <Input
              label={t.accountsReceivable.edit.referenceNumberLabel}
              value={formData.referenceNumber}
              onChange={(e) => handleChange("referenceNumber", e.target.value)}
              error={errors.referenceNumber}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(getAccountsReceivableViewRoute(transaction.id))}
              disabled={isSubmitting}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? t.common.loading : t.accountsReceivable.edit.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
