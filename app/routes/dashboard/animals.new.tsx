import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Input, Select, FormPageLayout } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addAnimal } from "~/services/animals.service";
import type { AnimalFormData, Property } from "~/types";
import { mockCompanies } from "~/mocks/companies";
import { getProperties } from "~/services/properties.service";
import { createFormMeta } from "~/utils/route-helpers";
import { useAlert } from "~/hooks/use-alert";

export function meta() {
  return createFormMeta("Adicionar", "Animal", "Adicionar novo animal");
}

export default function NewAnimal() {
  const t = useTranslation();
  const navigate = useNavigate();
  const company = mockCompanies[0];
  const companyId = company?.id || "";
  const [properties, setProperties] = useState<Property[]>([]);
  const { alertMessage, showAlert } = useAlert();

  useEffect(() => {
    const fetchProperties = async () => {
      if (companyId) {
        try {
          const propertiesData = await getProperties();
          setProperties(propertiesData.filter((prop) => prop.companyId === companyId));
        } catch (error) {
          console.error("Failed to load properties:", error);
        }
      }
    };
    fetchProperties();
  }, [companyId]);

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

  const formId = "animal-form";

  return (
    <FormPageLayout
      title={t.animals.addAnimal}
      description={t.animals.new.description}
      alert={alertMessage}
      backButton={{
        label: t.common.back,
        onClick: () => {
          navigate(ROUTES.ANIMALS);
        },
        disabled: isSubmitting,
      }}
      footer={{
        cancelButton: {
          label: t.common.cancel,
          onClick: () => {
            navigate(ROUTES.ANIMALS);
          },
          disabled: isSubmitting,
        },
        submitButton: {
          label: t.animals.new.addButton,
          loadingLabel: t.common.loading,
          disabled: isSubmitting,
          isLoading: isSubmitting,
        },
      }}
      formId={formId}
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-8">
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

              ...properties.map((property: Property) => ({
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
      </form>
    </FormPageLayout>
  );
}
