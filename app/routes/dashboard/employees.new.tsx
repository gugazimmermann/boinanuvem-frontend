import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { Input, Select, Button, Alert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { maskCEP, unmaskCEP, maskCPF, maskPhone } from "~/components/site/utils/masks";
import { useCEPLookup, type CEPData } from "~/components/site/hooks";
import { mapCEPDataToAddressForm } from "~/components/site/utils";
import { ROUTES } from "~/routes.config";
import { addEmployee } from "~/mocks/employees";
import type { EmployeeFormData } from "~/types";
import { mockCompanies } from "~/mocks/companies";
import { mockProperties } from "~/mocks/properties";
import { BRAZILIAN_STATES } from "~/utils/brazilian-states";

export function meta() {
  return [
    { title: "Adicionar Funcionário - Boi na Nuvem" },
    {
      name: "description",
      content: "Adicionar novo funcionário",
    },
  ];
}

export default function NewEmployee() {
  const t = useTranslation();
  const navigate = useNavigate();
  const company = mockCompanies[0];
  const companyId = company?.id || "";

  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    cpf: string;
    email: string;
    phone: string;
    status: "active" | "inactive";
    zipCode: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    propertyIds: string[];
  }>({
    code: "",
    name: "",
    cpf: "",
    email: "",
    phone: "",
    status: "active",
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    propertyIds: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);

  const handleZipCodeSuccess = useCallback((data: CEPData) => {
    setFormData((prev) => {
      const mappedData = mapCEPDataToAddressForm(data, prev);
      return { ...prev, ...mappedData, zipCode: prev.zipCode };
    });
  }, []);

  const { loading: zipCodeLoading, error: zipCodeError } = useCEPLookup(
    unmaskCEP(formData.zipCode || ""),
    {
      debounceMs: 800,
      onSuccess: handleZipCodeSuccess,
    }
  );

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
    if (field === "zipCode") {
      setFormData((prev) => ({ ...prev, [field]: maskCEP(value) }));
    } else if (field === "cpf") {
      setFormData((prev) => ({ ...prev, [field]: maskCPF(value) }));
    } else if (field === "phone") {
      setFormData((prev) => ({ ...prev, [field]: maskPhone(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
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

    if (!formData.code?.trim()) {
      newErrors.code = t.profile.errors.required(t.employees.table.code);
    }
    if (!formData.name?.trim()) {
      newErrors.name = t.profile.errors.required(t.employees.new.nameLabel);
    }
    if (!formData.propertyIds || formData.propertyIds.length === 0) {
      newErrors.propertyIds = t.employees.new.propertiesRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const employeeData: EmployeeFormData = {
        code: formData.code,
        name: formData.name,
        cpf: formData.cpf || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        status: formData.status,
        companyId,
        propertyIds: formData.propertyIds,
        street: formData.street || undefined,
        number: formData.number || undefined,
        complement: formData.complement || undefined,
        neighborhood: formData.neighborhood || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.zipCode || undefined,
      };
      addEmployee(employeeData);
      showAlert(t.employees.new.success, "success");
      setTimeout(() => {
        navigate(ROUTES.EMPLOYEES);
      }, 1500);
    } catch (error) {
      console.error("Error adding employee:", error);
      showAlert(t.employees.new.error, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            {t.employees.addEmployee}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.employees.new.description}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.EMPLOYEES)}
          disabled={isSubmitting}
        >
          {t.common.back}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={t.employees.table.code}
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                error={errors.code}
                disabled={isSubmitting}
                required
              />
              <Input
                label={t.employees.new.nameLabel}
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                error={errors.name}
                disabled={isSubmitting}
                className="md:col-span-2"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={t.employees.new.cpfLabel}
                value={formData.cpf}
                onChange={(e) => handleChange("cpf", e.target.value)}
                error={errors.cpf}
                disabled={isSubmitting}
                placeholder="000.000.000-00"
                maxLength={14}
              />
              <Input
                label={t.employees.new.emailLabel}
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                error={errors.email}
                disabled={isSubmitting}
                className="md:col-span-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={t.employees.new.phoneLabel}
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                error={errors.phone}
                disabled={isSubmitting}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.employees.new.propertiesLabel} <span className="text-red-500">*</span>
              </label>
              <select
                multiple
                value={formData.propertyIds}
                onChange={(e) => {
                  const selectedIds = Array.from(e.target.selectedOptions, (option) => option.value);
                  setFormData((prev) => ({ ...prev, propertyIds: selectedIds }));
                }}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 min-h-[100px] ${
                  errors.propertyIds ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {mockProperties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
              {errors.propertyIds && (
                <p className="mt-1 text-sm text-red-500">{errors.propertyIds}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t.employees.new.propertiesHint}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  label={t.profile.company.fields.zipCode}
                  value={formData.zipCode}
                  onChange={(e) => handleChange("zipCode", e.target.value)}
                  error={errors.zipCode || zipCodeError || undefined}
                  disabled={isSubmitting || zipCodeLoading}
                  placeholder="00000-000"
                  maxLength={10}
                />
                {zipCodeLoading && (
                  <p className="mt-1 text-xs text-blue-500 dark:text-blue-400">
                    {t.team.new.searchingAddress}
                  </p>
                )}
              </div>
              <Input
                label={t.profile.company.fields.street}
                value={formData.street}
                onChange={(e) => handleChange("street", e.target.value)}
                error={errors.street}
                disabled={isSubmitting || zipCodeLoading}
                className="md:col-span-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={t.profile.company.fields.number}
                value={formData.number}
                onChange={(e) => handleChange("number", e.target.value)}
                error={errors.number}
                disabled={isSubmitting}
              />
              <Input
                label={t.profile.company.fields.complement}
                value={formData.complement}
                onChange={(e) => handleChange("complement", e.target.value)}
                error={errors.complement}
                disabled={isSubmitting}
                className="md:col-span-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={t.profile.company.fields.neighborhood}
                value={formData.neighborhood}
                onChange={(e) => handleChange("neighborhood", e.target.value)}
                error={errors.neighborhood}
                disabled={isSubmitting || zipCodeLoading}
              />
              <Input
                label={t.profile.company.fields.city}
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                error={errors.city}
                disabled={isSubmitting || zipCodeLoading}
              />
              <Select
                label={t.profile.company.fields.state}
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                error={errors.state}
                disabled={isSubmitting || zipCodeLoading}
                options={BRAZILIAN_STATES.map((state) => ({
                  value: state.code,
                  label: state.code,
                }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.employees.new.statusLabel}
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value as "active" | "inactive")}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
              >
                <option value="active">{t.employees.table.active}</option>
                <option value="inactive">{t.employees.table.inactive}</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.EMPLOYEES)}
              disabled={isSubmitting}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? t.common.loading : t.employees.new.addButton}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

