import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Input, Select, Button, FixedAlert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { useAlert } from "~/hooks/use-alert";
import { ROUTES, getAnimalViewRoute } from "~/routes.config";
import { getAnimalById, updateAnimal } from "~/services/animals.service";
import type { AnimalFormData, Property } from "~/types";
import { getProperties } from "~/services/properties.service";
import { createFormMeta } from "~/utils/route-helpers";

export function meta() {
  return createFormMeta("Editar", "Animal", "Editar animal");
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "edit")({ request });
}

export default function EditAnimal() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { animalId } = useParams<{ animalId: string }>();
  const [animal, setAnimal] = useState<Awaited<ReturnType<typeof getAnimalById>> | undefined>(
    undefined
  );
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState<{
    code: string;
    registrationNumber: string;
    acquisitionDate: string;
    status: "active" | "inactive" | "sold";
    propertyId: string;
  }>({
    code: "",
    registrationNumber: "",
    acquisitionDate: "",
    status: "active",
    propertyId: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!animalId) return;
      setIsLoading(true);
      try {
        const [animalData, propertiesData] = await Promise.all([
          getAnimalById(animalId),
          getProperties(),
        ]);
        setAnimal(animalData);
        setProperties(propertiesData);
        if (animalData) {
          setFormData({
            code: animalData.code,
            registrationNumber: animalData.registrationNumber,
            acquisitionDate: animalData.acquisitionDate || "",
            status: animalData.status,
            propertyId: animalData.propertyId || "",
          });
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [animalId]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { alertMessage, showAlert } = useAlert();

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
        t.animals.edit.registrationNumberLabel
      );
    }
    if (!formData.propertyId?.trim()) {
      newErrors.propertyId = t.animals.edit.propertyRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !animalId) return;

    setIsSubmitting(true);
    try {
      const animalData: Partial<AnimalFormData> = {
        code: formData.code,
        registrationNumber: formData.registrationNumber,
        acquisitionDate: formData.acquisitionDate || undefined,
        status: formData.status,
        propertyId: formData.propertyId,
      };
      await updateAnimal(animalId, animalData);
      showAlert(t.animals.success.updated, "success");
      setTimeout(() => {
        navigate(ROUTES.ANIMALS);
      }, 1500);
    } catch (error) {
      console.error("Error updating animal:", error);
      showAlert(t.animals.errors.updateFailed, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.common.loading || "Carregando..."}</p>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
          <p className="text-gray-600 dark:text-gray-400">{t.animals.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.ANIMALS)} className="mt-4">
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FixedAlert alertMessage={alertMessage} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.animals.edit.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.animals.edit.description}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => animalId && navigate(getAnimalViewRoute(animalId))}
          disabled={isSubmitting}
        >
          {t.team.new.back}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
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
                label={t.animals.edit.registrationNumberLabel}
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
                label={t.animals.edit.acquisitionDateLabel}
                type="date"
                value={formData.acquisitionDate}
                onChange={(e) => handleChange("acquisitionDate", e.target.value)}
                error={errors.acquisitionDate}
                disabled={isSubmitting}
              />
            </div>

            <Select
              label={t.animals.edit.propertyLabel}
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
                {t.animals.edit.statusLabel}
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
              onClick={() => animalId && navigate(getAnimalViewRoute(animalId))}
              disabled={isSubmitting}
            >
              {t.profile.company.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? t.common.loading : t.animals.edit.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
