import { useState } from "react";
import { useNavigate } from "react-router";
import { Input, Select, Button, Alert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addAnimal } from "~/mocks/animals";
import type { AnimalFormData } from "~/types";
import { mockCompanies } from "~/mocks/companies";
import { mockProperties } from "~/mocks/properties";

export function meta() {
  return [
    { title: "Adicionar Animal - Boi na Nuvem" },
    {
      name: "description",
      content: "Adicionar novo animal",
    },
  ];
}

export default function NewAnimal() {
  const t = useTranslation();
  const navigate = useNavigate();
  const company = mockCompanies[0];
  const companyId = company?.id || "";

  const [formData, setFormData] = useState<{
    code: string;
    registrationNumber: string;
    acquisitionDate: string;
    status: "active" | "inactive";
    propertyId: string;
  }>({
    code: "",
    registrationNumber: "",
    acquisitionDate: "",
    status: "active",
    propertyId: "",
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

    if (!formData.code?.trim()) {
      newErrors.code = t.profile.errors.required(t.animals.table.code);
    }
    if (!formData.registrationNumber?.trim()) {
      newErrors.registrationNumber = t.profile.errors.required(
        t.animals.new.registrationNumberLabel
      );
    }
    if (!formData.propertyId?.trim()) {
      newErrors.propertyId = t.animals.new.propertyRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const animalData: AnimalFormData = {
        code: formData.code,
        registrationNumber: formData.registrationNumber,
        acquisitionDate: formData.acquisitionDate || undefined,
        status: formData.status,
        companyId,
        propertyId: formData.propertyId,
      };
      addAnimal(animalData);
      showAlert(t.animals.new.success, "success");
      setTimeout(() => {
        navigate(ROUTES.ANIMALS);
      }, 1500);
    } catch (error) {
      console.error("Error adding animal:", error);
      showAlert(t.animals.new.error, "error");
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
            {t.animals.addAnimal}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.animals.new.description}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(ROUTES.ANIMALS)} disabled={isSubmitting}>
          {t.common.back}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={t.animals.table.code}
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                error={errors.code}
                disabled={isSubmitting}
                required
              />
              <Input
                label={t.animals.new.registrationNumberLabel}
                value={formData.registrationNumber}
                onChange={(e) => handleChange("registrationNumber", e.target.value)}
                error={errors.registrationNumber}
                disabled={isSubmitting}
                className="md:col-span-2"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t.animals.new.acquisitionDateLabel}
                type="date"
                value={formData.acquisitionDate}
                onChange={(e) => handleChange("acquisitionDate", e.target.value)}
                error={errors.acquisitionDate}
                disabled={isSubmitting}
              />
            </div>

            <Select
              label={t.animals.new.propertyLabel}
              value={formData.propertyId}
              onChange={(e) => handleChange("propertyId", e.target.value)}
              error={errors.propertyId}
              disabled={isSubmitting}
              required
              options={[
                { value: "", label: "-" },
                ...mockProperties.map((property) => ({
                  value: property.id,
                  label: property.name,
                })),
              ]}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.animals.new.statusLabel}
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value as "active" | "inactive")}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
              >
                <option value="active">{t.animals.table.active}</option>
                <option value="inactive">{t.animals.table.inactive}</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.ANIMALS)}
              disabled={isSubmitting}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? t.common.loading : t.animals.new.addButton}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
