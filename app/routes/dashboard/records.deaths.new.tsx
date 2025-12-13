import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Input, Select, FormPageLayout } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addDeath, getDeathByAnimalId } from "~/services/deaths.service";
import { updateAnimal, getAnimalsByCompanyId } from "~/services/animals.service";
import type { DeathFormData } from "~/types";
import { getBirthByAnimalId, getBirthsByCompanyId } from "~/services/births.service";
import { useAlert } from "~/hooks/use-alert";
import { useAuth } from "~/contexts/auth-context";

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
  const { currentUser } = useAuth();
  const companyId = currentUser?.companyId || "";

  const today = new Date().toISOString().split("T")[0];

  const preSelectedData = useMemo(() => {
    const state = location.state as { animalId?: string } | null;
    return {
      animalId: state?.animalId || "",
    };
  }, [location.state]);

  const [animalSearch, setAnimalSearch] = useState("");
  const [animals, setAnimals] = useState<Awaited<ReturnType<typeof getAnimalsByCompanyId>>>([]);
  const [births, setBirths] = useState<Awaited<ReturnType<typeof getBirthsByCompanyId>>>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!companyId) return;
      try {
        const [animalsData, birthsData] = await Promise.all([
          getAnimalsByCompanyId(companyId),
          getBirthsByCompanyId(companyId),
        ]);
        const activeAnimals = (animalsData || []).filter((animal) => animal.status === "active");
        setAnimals(activeAnimals);
        setBirths(birthsData || []);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    loadData();
  }, [companyId]);

  const birthsMap = useMemo(() => {
    const map = new Map<string, Awaited<ReturnType<typeof getBirthByAnimalId>>>();
    if (births) {
      for (const birth of births) {
        map.set(birth.animalId, birth);
      }
    }
    return map;
  }, [births]);

  const getBirthByAnimalIdLocal = (animalId: string) => {
    return birthsMap.get(animalId);
  };

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
  const { alertMessage, showAlert } = useAlert();

  useEffect(() => {
    if (animals.length > 0 && preSelectedData.animalId) {
      const animal = animals.find((a) => a.id === preSelectedData.animalId);
      if (animal) {
        setFormData((prev) => {
          if (prev.animalId !== preSelectedData.animalId) {
            return { ...prev, animalId: preSelectedData.animalId };
          }
          return prev;
        });
      }
    }
  }, [preSelectedData.animalId, animals]);

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

  const validate = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    if (formData.animalId?.trim()) {
      const existingDeath = await getDeathByAnimalId(formData.animalId);
      if (existingDeath) {
        newErrors.animalId = t.deaths.new.animalAlreadyDead;
      }
    } else {
      newErrors.animalId = t.profile.errors.required(t.deaths.new.animalLabel);
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
    if (!(await validate())) return;

    setIsSubmitting(true);
    try {
      const deathData: DeathFormData = {
        animalId: formData.animalId,
        date: formData.date,
        cause: formData.cause,
        observation: formData.observation || undefined,
        companyId,
      };
      await addDeath(deathData);

      await updateAnimal(formData.animalId, { status: "inactive" });

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

  const formId = "death-form";

  return (
    <FormPageLayout
      title={t.deaths.new.title}
      description={t.deaths.new.description}
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
          label: t.deaths.new.addButton,
          loadingLabel: t.common.loading,
          disabled: isSubmitting,
          isLoading: isSubmitting,
        },
      }}
      formId={formId}
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-6">
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
                      const birth = getBirthByAnimalIdLocal(animal.id);
                      const gender = (() => {
                        if (!birth?.gender) return "";
                        return birth.gender === "male"
                          ? t.animals.gender.male
                          : t.animals.gender.female;
                      })();
                      const labelParts = [animal.code, animal.registrationNumber];
                      if (gender) {
                        labelParts.push(`(${gender})`);
                      }
                      return {
                        value: animal.id,
                        label: labelParts.join(" | "),
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
      </form>
    </FormPageLayout>
  );
}
