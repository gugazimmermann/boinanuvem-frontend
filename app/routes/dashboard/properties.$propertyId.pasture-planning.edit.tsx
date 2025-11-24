import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Button, Alert, PasturePlanningTable } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { getPropertyViewRoute } from "~/routes.config";
import { getPropertyById, updateProperty } from "~/services/properties.service";
import type { PasturePlanningMonth } from "~/types/property";

export function meta() {
  return [
    { title: "Editar Planejamento de Pastagem - Boi na Nuvem" },
    {
      name: "description",
      content: "Editar dados de planejamento de pastagem da propriedade",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "edit")({ request });
}

export default function EditPasturePlanning() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { propertyId } = useParams<{ propertyId: string }>();
  const property = getPropertyById(propertyId);

  const generateDefaultPasturePlanning = (): PasturePlanningMonth[] => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months.map((month) => ({
      month,
      min: 0,
      max: 0,
      precipitation: 0,
      classification: "Medium" as const,
    }));
  };

  const [pasturePlanning, setPasturePlanning] = useState<PasturePlanningMonth[]>(
    generateDefaultPasturePlanning()
  );
  const [hasBeenModified, setHasBeenModified] = useState(false);

  useEffect(() => {
    if (property) {
      const initial =
        property.pasturePlanning && property.pasturePlanning.length > 0
          ? property.pasturePlanning
          : generateDefaultPasturePlanning();
      setPasturePlanning(initial);
      setHasBeenModified(property.pasturePlanningModifiedByUser || false);
    }
  }, [property]);

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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (pasturePlanning) {
      pasturePlanning.forEach((month, index) => {
        const minTemp = month.min;
        const maxTemp = month.max;
        const precipitation = month.precipitation;

        if (isNaN(minTemp)) {
          newErrors[`pasturePlanning.${index}.min`] = t.profile.errors.required(
            t.properties.details.pasturePlanning.minTemp
          );
        } else if (minTemp < -50 || minTemp > 50) {
          newErrors[`pasturePlanning.${index}.min`] = t.properties.edit.validation.temperatureRange;
        }

        if (isNaN(maxTemp)) {
          newErrors[`pasturePlanning.${index}.max`] = t.profile.errors.required(
            t.properties.details.pasturePlanning.maxTemp
          );
        } else if (maxTemp < -50 || maxTemp > 50) {
          newErrors[`pasturePlanning.${index}.max`] = t.properties.edit.validation.temperatureRange;
        }

        if (minTemp > maxTemp) {
          newErrors[`pasturePlanning.${index}.min`] =
            t.properties.edit.validation.minTempGreaterThanMax;
        }

        if (isNaN(precipitation)) {
          newErrors[`pasturePlanning.${index}.precipitation`] = t.profile.errors.required(
            t.properties.details.pasturePlanning.precipitation
          );
        } else if (precipitation < 0) {
          newErrors[`pasturePlanning.${index}.precipitation`] =
            t.properties.edit.validation.precipitationNonNegative;
        }

        if (!month.classification) {
          newErrors[`pasturePlanning.${index}.classification`] = t.profile.errors.required(
            t.properties.details.pasturePlanning.forage
          );
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !propertyId) return;

    setIsSubmitting(true);
    try {
      const success = updateProperty(propertyId, {
        pasturePlanning,
        pasturePlanningModifiedByUser: hasBeenModified,
      });
      if (success) {
        showAlert(t.properties.success.updated, "success");
        setTimeout(() => {
          navigate(getPropertyViewRoute(propertyId));
        }, 1500);
      } else {
        showAlert(t.properties.errors.updateFailed, "error");
      }
    } catch (error) {
      console.error("Error updating pasture planning:", error);
      showAlert(t.properties.errors.updateFailed, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!property) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">{t.properties.emptyState.title}</p>
          <Button
            variant="outline"
            onClick={() => navigate(getPropertyViewRoute(propertyId!))}
            className="mt-4"
          >
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
          <Alert title={alertMessage.title} variant={alertMessage.variant} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t.properties.details.pasturePlanning.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.properties.edit.description}
          </p>
          {!hasBeenModified && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {t.properties.details.pasturePlanning.aiGeneratedNote}
              </p>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => propertyId && navigate(getPropertyViewRoute(propertyId))}
          disabled={isSubmitting}
        >
          {t.team.new.back}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <PasturePlanningTable
              data={pasturePlanning}
              onChange={(data) => {
                setPasturePlanning(data);
                setHasBeenModified(true);
              }}
              errors={errors}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => propertyId && navigate(getPropertyViewRoute(propertyId))}
              disabled={isSubmitting}
            >
              {t.profile.company.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? t.common.loading : t.properties.edit.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
