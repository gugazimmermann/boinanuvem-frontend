import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Input, Select, Button, Alert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addDeath, getDeathByAnimalId } from "~/services/deaths.service";
import { updateAnimal } from "~/services/animals.service";
import type { DeathFormData } from "~/types";
import { mockCompanies } from "~/mocks/companies";
import { getAnimalsByCompanyId, getAnimalById } from "~/services/animals.service";
import { getBirthByAnimalId } from "~/services/births.service";

export function meta() {
  return [
    { title: "Registrar Óbito - Boi na Nuvem" },
    {
      name: "description",
      content: "Registrar novo óbito de animal",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "add")({ request });
}

export default function NewDeath() {
  const t = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const company = mockCompanies[0];
  const companyId = company?.id || "";

  const today = new Date().toISOString().split("T")[0];

  const preSelectedData = useMemo(() => {
    const state = location.state as { animalId?: string } | null;
    return {
      animalId: state?.animalId || "",
    };
  }, [location.state]);

  const [animalSearch, setAnimalSearch] = useState("");

  const animals = useMemo(() => {
    return getAnimalsByCompanyId(companyId).filter((animal) => animal.status === "active");
  }, [companyId]);

  const filteredAnimals = useMemo(() => {
    if (!animalSearch.trim()) return animals;
    const searchLower = animalSearch.toLowerCase();
    return animals.filter(
      (animal) =>
        animal.code.toLowerCase().includes(searchLower) ||
        animal.registrationNumber.toLowerCase().includes(searchLower)
    );
  }, [animals, animalSearch]);

  const [formData, setFormData] = useState<{
    animalId: string;
    date: string;
    cause: string;
    observation: string;
  }>({
    animalId: preSelectedData.animalId,
    date: today,
    cause: "",
    observation: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);

  useEffect(() => {
    if (animals.length > 0 && preSelectedData.animalId) {
      const animal = getAnimalById(preSelectedData.animalId);
      if (animal && animals.some((a) => a.id === preSelectedData.animalId)) {
        setFormData((prev) => {
          if (prev.animalId !== preSelectedData.animalId) {
            return { ...prev, animalId: preSelectedData.animalId };
          }
          return prev;
        });
      }
    }
  }, [preSelectedData.animalId, animals]);

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

    if (!formData.animalId?.trim()) {
      newErrors.animalId = t.profile.errors.required(t.deaths.new.animalLabel);
    } else {
      const existingDeath = getDeathByAnimalId(formData.animalId);
      if (existingDeath) {
        newErrors.animalId = t.deaths.new.animalAlreadyDead;
      }
    }

    if (!formData.date?.trim()) {
      newErrors.date = t.profile.errors.required(t.deaths.new.dateLabel);
    }

    if (!formData.cause?.trim()) {
      newErrors.cause = t.profile.errors.required(t.deaths.new.causeLabel);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const deathData: DeathFormData = {
        animalId: formData.animalId,
        date: formData.date,
        cause: formData.cause,
        observation: formData.observation || undefined,
        companyId,
      };
      addDeath(deathData);

      updateAnimal(formData.animalId, { status: "inactive" });

      showAlert(t.deaths.new.success, "success");
      setTimeout(() => {
        navigate(ROUTES.ANIMALS);
      }, 1500);
    } catch (error) {
      console.error("Error adding death:", error);
      showAlert(t.deaths.new.error, "error");
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
            {t.deaths.new.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.deaths.new.description}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(ROUTES.ANIMALS)} disabled={isSubmitting}>
          {t.common.back}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {t.deaths.new.deathInfoTitle}
              </h2>
              <div className="space-y-4">
                <div>
                  <Input
                    label={t.deaths.new.animalLabel}
                    value={animalSearch}
                    onChange={(e) => setAnimalSearch(e.target.value)}
                    placeholder={t.deaths.new.searchPlaceholder}
                    disabled={isSubmitting}
                  />
                  <Select
                    value={formData.animalId}
                    onChange={(e) => handleChange("animalId", e.target.value)}
                    error={errors.animalId}
                    disabled={isSubmitting}
                    required
                    className="mt-2"
                    options={[
                      { value: "", label: "-" },
                      ...filteredAnimals.map((animal) => {
                        const birth = getBirthByAnimalId(animal.id);
                        const gender = birth?.gender
                          ? birth.gender === "male"
                            ? t.animals.gender.male
                            : t.animals.gender.female
                          : "";
                        return {
                          value: animal.id,
                          label: `${animal.code} | ${animal.registrationNumber}${gender ? ` (${gender})` : ""}`,
                        };
                      }),
                    ]}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t.deaths.new.dateLabel}
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                    error={errors.date}
                    disabled={isSubmitting}
                    required
                  />
                  <Input
                    label={t.deaths.new.causeLabel}
                    value={formData.cause}
                    onChange={(e) => handleChange("cause", e.target.value)}
                    error={errors.cause}
                    disabled={isSubmitting}
                    placeholder={t.deaths.new.causePlaceholder}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.deaths.new.observationLabel}
                  </label>
                  <textarea
                    value={formData.observation}
                    onChange={(e) => handleChange("observation", e.target.value)}
                    disabled={isSubmitting}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                    placeholder={t.deaths.new.observationPlaceholder}
                  />
                </div>
              </div>
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
              {isSubmitting ? t.common.loading : t.deaths.new.addButton}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
