import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Input, Select, Button, Alert, FileUpload } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addCashFlow } from "~/services/cash-flow.service";
import { addCashFlowObservation } from "~/services/cash-flow-observations.service";
import { getBankAccountsByCompanyId } from "~/services/bank-account.service";
import { getEmployeesByCompanyId } from "~/services/employees.service";
import { getServiceProvidersByCompanyId } from "~/services/service-providers.service";
import { getPropertiesByCompanyId } from "~/services/properties.service";
import type { CashFlowFormData, CashFlowCategory, PaymentMethod } from "~/types";
import { mockCompanies } from "~/mocks/companies";
import { mockSuppliers } from "~/mocks/suppliers";
import { mockBuyers } from "~/mocks/buyers";
import { CashFlowCategory as CFCategory, PaymentMethod as PMethod } from "~/types";

export function meta() {
  return [
    { title: "Adicionar Transação - Boi na Nuvem" },
    {
      name: "description",
      content: "Adicionar nova transação de fluxo de caixa",
    },
  ];
}

export default function NewCashFlow() {
  const t = useTranslation();
  const navigate = useNavigate();
  const company = mockCompanies[0];
  const companyId = company?.id || "";

  const [formData, setFormData] = useState<{
    type: "income" | "expense";
    amount: string;
    date: string;
    description: string;
    category: CashFlowCategory;
    paymentMethod: PaymentMethod;
    supplierId: string;
    buyerId: string;
    employeeId: string;
    serviceProviderId: string;
    paymentDate: string;
    referenceNumber: string;
    bankAccountId: string;
    propertyId: string;
    observation: string;
  }>({
    type: "income",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    category: CFCategory.CATTLE_SALES,
    paymentMethod: PMethod.CASH,
    supplierId: "",
    buyerId: "",
    employeeId: "",
    serviceProviderId: "",
    paymentDate: "",
    referenceNumber: "",
    bankAccountId: "",
    propertyId: "",
    observation: "",
  });

  const [observationFiles, setObservationFiles] = useState<File[]>([]);

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
        newData.buyerId = "";
        newData.employeeId = "";
        newData.serviceProviderId = "";
      }
      if (field === "type" && value === "income") {
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
      newErrors.description = t.profile.errors.required(t.cashFlow.new.descriptionLabel);
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = t.profile.errors.required(t.cashFlow.new.amountLabel);
    }
    if (!formData.date) {
      newErrors.date = t.profile.errors.required(t.cashFlow.new.dateLabel);
    }
    if (!formData.propertyId) {
      newErrors.propertyId = t.profile.errors.required(t.cashFlow.new.propertyLabel);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const transactionData: CashFlowFormData = {
        companyId,
        type: formData.type,
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description,
        category: formData.category,
        paymentMethod: formData.paymentMethod,
        status: "completed",
        supplierId: formData.supplierId || undefined,
        buyerId: formData.buyerId || undefined,
        employeeId: formData.employeeId || undefined,
        serviceProviderId: formData.serviceProviderId || undefined,
        paymentDate: formData.paymentDate || undefined,
        referenceNumber: formData.referenceNumber || undefined,
        bankAccountId: formData.bankAccountId || undefined,
        propertyId: formData.propertyId,
      };
      const newTransaction = addCashFlow(transactionData);

      if (formData.observation?.trim()) {
        const fileIds = observationFiles.map(
          (_, index) => `file-cashflow-obs-${Date.now()}-${index}`
        );

        addCashFlowObservation({
          cashFlowId: newTransaction.id,
          observation: formData.observation.trim(),
          fileIds: fileIds.length > 0 ? fileIds : undefined,
        });
      }

      showAlert(t.cashFlow.new.success, "success");
      setTimeout(() => {
        navigate(ROUTES.CASH_FLOW);
      }, 1500);
    } catch (error) {
      console.error("Error adding transaction:", error);
      showAlert(t.cashFlow.new.error, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const incomeCategories = [
    { value: CFCategory.CATTLE_SALES, label: t.cashFlow.categories.cattle_sales },
    { value: CFCategory.MILK_SALES, label: t.cashFlow.categories.milk_sales },
    { value: CFCategory.BREEDING_SERVICES, label: t.cashFlow.categories.breeding_services },
    { value: CFCategory.GOVERNMENT_SUBSIDIES, label: t.cashFlow.categories.government_subsidies },
    { value: CFCategory.INSURANCE_CLAIMS, label: t.cashFlow.categories.insurance_claims },
    { value: CFCategory.OTHER_INCOME, label: t.cashFlow.categories.other_income },
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

  const paymentMethods = [
    { value: PMethod.CASH, label: t.cashFlow.paymentMethods.cash },
    { value: PMethod.BANK_TRANSFER, label: t.cashFlow.paymentMethods.bank_transfer },
    { value: PMethod.CHECK, label: t.cashFlow.paymentMethods.check },
    { value: PMethod.CREDIT_CARD, label: t.cashFlow.paymentMethods.credit_card },
    { value: PMethod.DEBIT_CARD, label: t.cashFlow.paymentMethods.debit_card },
    { value: PMethod.PIX, label: t.cashFlow.paymentMethods.pix },
    { value: PMethod.OTHER, label: t.cashFlow.paymentMethods.other },
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
            {t.cashFlow.addTransaction}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.cashFlow.new.description}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.CASH_FLOW)}
          disabled={isSubmitting}
        >
          {t.common.back}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.cashFlow.new.typeLabel} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    const newType = e.target.value as "income" | "expense";
                    handleChange("type", newType);
                    if (newType === "income") {
                      setFormData((prev) => ({
                        ...prev,
                        category: CFCategory.CATTLE_SALES,
                        supplierId: "",
                        employeeId: "",
                        serviceProviderId: "",
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        category: CFCategory.FEED,
                        buyerId: "",
                        employeeId: "",
                        serviceProviderId: "",
                      }));
                    }
                  }}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                >
                  <option value="income">{t.cashFlow.table.income}</option>
                  <option value="expense">{t.cashFlow.table.expense}</option>
                </select>
              </div>
              <Input
                label={t.cashFlow.new.amountLabel}
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                error={errors.amount}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t.cashFlow.new.dateLabel}
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                error={errors.date}
                disabled={isSubmitting}
                required
              />
              <Input
                label={t.cashFlow.new.paymentDateLabel}
                type="date"
                value={formData.paymentDate}
                onChange={(e) => handleChange("paymentDate", e.target.value)}
                error={errors.paymentDate}
                disabled={isSubmitting}
              />
            </div>

            <Input
              label={t.cashFlow.new.descriptionLabel}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              error={errors.description}
              disabled={isSubmitting}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={t.cashFlow.new.categoryLabel}
                value={formData.category}
                onChange={(e) => {
                  const newCategory = e.target.value as CashFlowCategory;
                  handleChange("category", newCategory);
                  if (newCategory !== CFCategory.LABOR) {
                    setFormData((prev) => ({ ...prev, employeeId: "" }));
                  }
                }}
                error={errors.category}
                disabled={isSubmitting}
                required
                options={[
                  { value: "", label: "-" },
                  ...(formData.type === "income" ? incomeCategories : expenseCategories),
                ]}
              />
              <Select
                label={t.cashFlow.new.paymentMethodLabel}
                value={formData.paymentMethod}
                onChange={(e) => handleChange("paymentMethod", e.target.value as PaymentMethod)}
                error={errors.paymentMethod}
                disabled={isSubmitting}
                required
                options={[{ value: "", label: "-" }, ...paymentMethods]}
              />
            </div>

            <Select
              label={t.cashFlow.new.propertyLabel}
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
              label={t.cashFlow.new.bankAccountLabel}
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

            {formData.type === "expense" && (
              <Select
                label={t.cashFlow.new.supplierLabel}
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
            )}

            {formData.type === "income" && (
              <Select
                label={t.cashFlow.new.buyerLabel}
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
            )}

            {formData.type === "expense" && formData.category === CFCategory.LABOR && (
              <Select
                label={t.cashFlow.new.employeeLabel}
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
            )}

            {formData.type === "expense" && (
              <Select
                label={t.cashFlow.new.serviceProviderLabel}
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
            )}

            <Input
              label={t.cashFlow.new.referenceNumberLabel}
              value={formData.referenceNumber}
              onChange={(e) => handleChange("referenceNumber", e.target.value)}
              error={errors.referenceNumber}
              disabled={isSubmitting}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.cashFlow.details.observation || "Observação"}
              </label>
              <textarea
                value={formData.observation}
                onChange={(e) => handleChange("observation", e.target.value)}
                disabled={isSubmitting}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                placeholder={
                  t.cashFlow.details.observationPlaceholder || "Adicione uma observação (opcional)"
                }
              />
            </div>

            <FileUpload
              label={t.cashFlow.details.files || "Anexos"}
              files={observationFiles}
              onChange={setObservationFiles}
              disabled={isSubmitting}
              multiple={true}
              helperText={
                t.cashFlow.details.filesHelper || "Você pode anexar múltiplos arquivos à observação"
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.CASH_FLOW)}
              disabled={isSubmitting}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? t.common.loading : t.cashFlow.new.addButton}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
