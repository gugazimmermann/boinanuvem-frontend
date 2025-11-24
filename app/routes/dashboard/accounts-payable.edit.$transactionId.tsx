import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { Input, Select, Button, Alert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES, getAccountsPayableViewRoute } from "~/routes.config";
import { getAccountsPayableById, updateAccountsPayable } from "~/services/accounts-payable.service";
import { getBankAccountsByCompanyId } from "~/services/bank-account.service";
import { getEmployeesByCompanyId } from "~/services/employees.service";
import { getServiceProvidersByCompanyId } from "~/services/service-providers.service";
import { getPropertiesByCompanyId } from "~/services/properties.service";
import type { PaymentMethod, AccountsPayableStatus, CashFlowCategory } from "~/types";
import { mockCompanies } from "~/mocks/companies";
import {
  PaymentMethod as PMethod,
  AccountsPayableStatus as APStatus,
  CashFlowCategory as CFCategory,
} from "~/types";
import { mockSuppliers } from "~/mocks/suppliers";

export function meta() {
  return [
    { title: "Editar Conta a Pagar - Boi na Nuvem" },
    {
      name: "description",
      content: "Editar conta a pagar",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "edit")({ request });
}

export default function EditAccountsPayable() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId: string }>();
  const transaction = getAccountsPayableById(transactionId);
  const company = mockCompanies[0];
  const bankAccounts = company ? getBankAccountsByCompanyId(company.id) : [];
  const properties = company ? getPropertiesByCompanyId(company.id) : [];
  const allEmployees = useMemo(
    () => (company ? getEmployeesByCompanyId(company.id) : []),
    [company]
  );
  const allServiceProviders = useMemo(
    () => (company ? getServiceProvidersByCompanyId(company.id) : []),
    [company]
  );

  const [formData, setFormData] = useState<{
    supplierId: string;
    employeeId: string;
    serviceProviderId: string;
    amount: string;
    dueDate: string;
    description: string;
    category: CashFlowCategory;
    paymentMethod: PaymentMethod;
    status: AccountsPayableStatus;
    paidDate: string;
    paidAmount: string;
    referenceNumber: string;
    bankAccountId: string;
    propertyId: string;
  }>({
    supplierId: "",
    employeeId: "",
    serviceProviderId: "",
    amount: "",
    dueDate: "",
    description: "",
    category: CFCategory.FEED,
    paymentMethod: PMethod.CASH,
    status: APStatus.UNPAID,
    paidDate: "",
    paidAmount: "",
    referenceNumber: "",
    bankAccountId: "",
    propertyId: "",
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        supplierId: transaction.supplierId || "",
        employeeId: transaction.employeeId || "",
        serviceProviderId: transaction.serviceProviderId || "",
        amount: transaction.amount.toString(),
        dueDate: transaction.dueDate,
        description: transaction.description,
        category: transaction.category || CFCategory.FEED,
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

  const employees = useMemo(() => {
    if (!formData.propertyId) return allEmployees;
    return allEmployees.filter((emp) => emp.propertyIds?.includes(formData.propertyId));
  }, [allEmployees, formData.propertyId]);

  const serviceProviders = useMemo(() => {
    if (!formData.propertyId) return allServiceProviders;
    return allServiceProviders.filter((sp) => sp.propertyIds?.includes(formData.propertyId));
  }, [allServiceProviders, formData.propertyId]);

  const suppliers = useMemo(() => {
    if (!formData.propertyId) return mockSuppliers;
    return mockSuppliers.filter((sup) => sup.propertyIds?.includes(formData.propertyId));
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t.accountsPayable.emptyState.title}
          </p>
          <Button variant="outline" onClick={() => navigate(ROUTES.ACCOUNTS_PAYABLE)}>
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
        newData.supplierId = "";
        newData.employeeId = "";
        newData.serviceProviderId = "";
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
      newErrors.description = t.profile.errors.required(t.accountsPayable.edit.descriptionLabel);
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = t.profile.errors.required(t.accountsPayable.edit.amountLabel);
    }
    if (!formData.dueDate) {
      newErrors.dueDate = t.profile.errors.required(t.accountsPayable.edit.dueDateLabel);
    }
    if (!formData.propertyId) {
      newErrors.propertyId = t.profile.errors.required(t.accountsPayable.edit.propertyLabel);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      updateAccountsPayable(transaction.id, {
        supplierId: formData.supplierId || undefined,
        employeeId: formData.employeeId || undefined,
        serviceProviderId: formData.serviceProviderId || undefined,
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
      showAlert(t.accountsPayable.success.updated, "success");
      setTimeout(() => {
        navigate(getAccountsPayableViewRoute(transaction.id));
      }, 1500);
    } catch (error) {
      console.error("Error updating transaction:", error);
      showAlert(t.accountsPayable.errors.updateFailed, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethods = [
    { value: PMethod.CASH, label: t.accountsPayable.paymentMethods.cash },
    { value: PMethod.BANK_TRANSFER, label: t.accountsPayable.paymentMethods.bank_transfer },
    { value: PMethod.CHECK, label: t.accountsPayable.paymentMethods.check },
    { value: PMethod.CREDIT_CARD, label: t.accountsPayable.paymentMethods.credit_card },
    { value: PMethod.DEBIT_CARD, label: t.accountsPayable.paymentMethods.debit_card },
    { value: PMethod.PIX, label: t.accountsPayable.paymentMethods.pix },
    { value: PMethod.OTHER, label: t.accountsPayable.paymentMethods.other },
  ];

  const statusOptions = [
    { value: APStatus.UNPAID, label: t.accountsPayable.status.unpaid },
    { value: APStatus.PAID, label: t.accountsPayable.status.paid },
    { value: APStatus.OVERDUE, label: t.accountsPayable.status.overdue },
    { value: APStatus.PARTIAL, label: t.accountsPayable.status.partial },
  ];

  const expenseCategories = [
    { value: CFCategory.FEED, label: t.cashFlow.categories.feed },
    { value: CFCategory.MEDICINES, label: t.cashFlow.categories.medicines },
    { value: CFCategory.VACCINES, label: t.cashFlow.categories.vaccines },
    { value: CFCategory.VETERINARY, label: t.cashFlow.categories.veterinary },
    { value: CFCategory.INSEMINATION, label: t.cashFlow.categories.insemination },
    { value: CFCategory.LABOR, label: t.cashFlow.categories.labor },
    { value: CFCategory.PASTURE, label: t.cashFlow.categories.pasture },
    { value: CFCategory.TRANSPORTATION, label: t.cashFlow.categories.transportation },
    { value: CFCategory.FUEL, label: t.cashFlow.categories.fuel },
    { value: CFCategory.EQUIPMENT, label: t.cashFlow.categories.equipment },
    { value: CFCategory.MAINTENANCE, label: t.cashFlow.categories.maintenance },
    { value: CFCategory.BUILDINGS, label: t.cashFlow.categories.buildings },
    { value: CFCategory.UTILITIES, label: t.cashFlow.categories.utilities },
    { value: CFCategory.INSURANCE, label: t.cashFlow.categories.insurance },
    { value: CFCategory.TAXES, label: t.cashFlow.categories.taxes },
    { value: CFCategory.RENT_LEASE, label: t.cashFlow.categories.rent_lease },
    { value: CFCategory.ANIMAL_ACQUISITION, label: t.cashFlow.categories.animal_acquisition },
    { value: CFCategory.OTHER_EXPENSES, label: t.cashFlow.categories.other_expenses },
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
            {t.accountsPayable.edit.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.accountsPayable.edit.description}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(getAccountsPayableViewRoute(transaction.id))}
          disabled={isSubmitting}
        >
          {t.common.back}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Select
              label={t.accountsPayable.edit.propertyLabel}
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
              label={t.accountsPayable.edit.supplierLabel}
              value={formData.supplierId}
              onChange={(e) => handleChange("supplierId", e.target.value)}
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
              label={t.accountsPayable.edit.employeeLabel}
              value={formData.employeeId}
              onChange={(e) => handleChange("employeeId", e.target.value)}
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
              label={t.accountsPayable.edit.serviceProviderLabel}
              value={formData.serviceProviderId}
              onChange={(e) => handleChange("serviceProviderId", e.target.value)}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t.accountsPayable.edit.amountLabel}
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
                label={t.accountsPayable.edit.dueDateLabel}
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                error={errors.dueDate}
                disabled={isSubmitting}
                required
              />
            </div>

            <Input
              label={t.accountsPayable.edit.descriptionLabel}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              error={errors.description}
              disabled={isSubmitting}
              required
            />

            <Select
              label={t.accountsPayable.edit.categoryLabel}
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value as CashFlowCategory)}
              error={errors.category}
              disabled={isSubmitting}
              options={[{ value: "", label: "-" }, ...expenseCategories]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={t.accountsPayable.edit.paymentMethodLabel}
                value={formData.paymentMethod}
                onChange={(e) => handleChange("paymentMethod", e.target.value as PaymentMethod)}
                error={errors.paymentMethod}
                disabled={isSubmitting}
                options={[{ value: "", label: "-" }, ...paymentMethods]}
              />
              <Select
                label={t.accountsPayable.edit.statusLabel}
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value as AccountsPayableStatus)}
                error={errors.status}
                disabled={isSubmitting}
                required
                options={statusOptions}
              />
            </div>

            <Select
              label={t.accountsPayable.edit.bankAccountLabel}
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
                label={t.accountsPayable.edit.paidDateLabel}
                type="date"
                value={formData.paidDate}
                onChange={(e) => handleChange("paidDate", e.target.value)}
                error={errors.paidDate}
                disabled={isSubmitting}
              />
              <Input
                label={t.accountsPayable.edit.paidAmountLabel}
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
              label={t.accountsPayable.edit.referenceNumberLabel}
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
              onClick={() => navigate(getAccountsPayableViewRoute(transaction.id))}
              disabled={isSubmitting}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? t.common.loading : t.accountsPayable.edit.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
