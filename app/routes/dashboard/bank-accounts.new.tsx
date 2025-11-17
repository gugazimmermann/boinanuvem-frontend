import { useState } from "react";
import { useNavigate } from "react-router";
import { Input, Select, Button, Alert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addBankAccount } from "~/services/bank-account.service";
import type { BankAccountFormData, BankAccountType } from "~/types";
import { mockCompanies } from "~/mocks/companies";

export function meta() {
  return [
    { title: "Adicionar Conta Bancária - Boi na Nuvem" },
    {
      name: "description",
      content: "Adicionar nova conta bancária",
    },
  ];
}

export default function NewBankAccount() {
  const t = useTranslation();
  const navigate = useNavigate();
  const company = mockCompanies[0];
  const companyId = company?.id || "";

  const [formData, setFormData] = useState<{
    bankName: string;
    bankCode: string;
    branch: string;
    accountNumber: string;
    accountType: BankAccountType;
    accountHolderName: string;
    status: "active" | "inactive";
  }>({
    bankName: "",
    bankCode: "",
    branch: "",
    accountNumber: "",
    accountType: "checking",
    accountHolderName: "",
    status: "active",
  });

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

    if (!formData.bankName?.trim()) {
      newErrors.bankName = t.profile.errors.required(t.bankAccounts.new.bankNameLabel);
    }
    if (!formData.bankCode?.trim()) {
      newErrors.bankCode = t.profile.errors.required(t.bankAccounts.new.bankCodeLabel);
    }
    if (!formData.branch?.trim()) {
      newErrors.branch = t.profile.errors.required(t.bankAccounts.new.branchLabel);
    }
    if (!formData.accountNumber?.trim()) {
      newErrors.accountNumber = t.profile.errors.required(t.bankAccounts.new.accountNumberLabel);
    }
    if (!formData.accountHolderName?.trim()) {
      newErrors.accountHolderName = t.profile.errors.required(
        t.bankAccounts.new.accountHolderNameLabel
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const bankAccountData: BankAccountFormData = {
        companyId,
        bankName: formData.bankName,
        bankCode: formData.bankCode,
        branch: formData.branch,
        accountNumber: formData.accountNumber,
        accountType: formData.accountType,
        accountHolderName: formData.accountHolderName,
        status: formData.status,
      };
      addBankAccount(bankAccountData);
      showAlert(t.bankAccounts.new.success, "success");
      setTimeout(() => {
        navigate(ROUTES.BANK_ACCOUNTS);
      }, 1500);
    } catch (error) {
      console.error("Error adding bank account:", error);
      showAlert(t.bankAccounts.new.error, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const accountTypeOptions = [
    { value: "checking", label: t.bankAccounts.accountTypes.checking },
    { value: "savings", label: t.bankAccounts.accountTypes.savings },
  ];

  const statusOptions = [
    { value: "active", label: t.bankAccounts.status.active },
    { value: "inactive", label: t.bankAccounts.status.inactive },
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
            {t.bankAccounts.addBankAccount}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.bankAccounts.new.description}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.BANK_ACCOUNTS)}
          disabled={isSubmitting}
        >
          {t.common.back}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input
              label={t.bankAccounts.new.bankNameLabel}
              value={formData.bankName}
              onChange={(e) => handleChange("bankName", e.target.value)}
              error={errors.bankName}
              disabled={isSubmitting}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t.bankAccounts.new.bankCodeLabel}
                value={formData.bankCode}
                onChange={(e) => handleChange("bankCode", e.target.value)}
                error={errors.bankCode}
                disabled={isSubmitting}
                required
              />
              <Input
                label={t.bankAccounts.new.branchLabel}
                value={formData.branch}
                onChange={(e) => handleChange("branch", e.target.value)}
                error={errors.branch}
                disabled={isSubmitting}
                required
              />
            </div>

            <Input
              label={t.bankAccounts.new.accountNumberLabel}
              value={formData.accountNumber}
              onChange={(e) => handleChange("accountNumber", e.target.value)}
              error={errors.accountNumber}
              disabled={isSubmitting}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={t.bankAccounts.new.accountTypeLabel}
                value={formData.accountType}
                onChange={(e) => handleChange("accountType", e.target.value as BankAccountType)}
                error={errors.accountType}
                disabled={isSubmitting}
                required
                options={accountTypeOptions}
              />
              <Select
                label={t.bankAccounts.new.statusLabel}
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value as "active" | "inactive")}
                error={errors.status}
                disabled={isSubmitting}
                required
                options={statusOptions}
              />
            </div>

            <Input
              label={t.bankAccounts.new.accountHolderNameLabel}
              value={formData.accountHolderName}
              onChange={(e) => handleChange("accountHolderName", e.target.value)}
              error={errors.accountHolderName}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.BANK_ACCOUNTS)}
              disabled={isSubmitting}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? t.common.loading : t.bankAccounts.new.addButton}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
