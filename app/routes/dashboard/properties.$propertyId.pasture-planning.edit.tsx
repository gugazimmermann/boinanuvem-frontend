import { useState } from "react";
import { useParams } from "react-router";
import { Button, FixedAlert, PasturePlanningTable } from "~/components/ui";
import type { PasturePlanningMonth } from "~/types/property";
import { usePropertyEdit } from "~/hooks/use-property-edit";
import type { Property } from "~/types";

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

type PasturePlanningFormProps = {
  property: Property;
  propertyId: string;
  isSubmitting: boolean;
  alertMessage: ReturnType<typeof usePropertyEdit>["alertMessage"];
  navigateToView: () => void;
  updateProperty: (data: Partial<Property>) => Promise<void>;
  t: ReturnType<typeof usePropertyEdit>["t"];
};

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

function PasturePlanningForm({
  property,
  propertyId,
  isSubmitting,
  alertMessage,
  navigateToView,
  updateProperty,
  t,
}: Readonly<PasturePlanningFormProps>) {
  const [pasturePlanning, setPasturePlanning] = useState<PasturePlanningMonth[]>(() =>
    property.pasturePlanning && property.pasturePlanning.length > 0
      ? property.pasturePlanning
      : generateDefaultPasturePlanning()
  );
  const [hasBeenModified, setHasBeenModified] = useState(
    property.pasturePlanningModifiedByUser || false
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateMonth = (
    month: (typeof pasturePlanning)[0],
    index: number,
    newErrors: Record<string, string>
  ): void => {
    const minTemp = month.min;
    const maxTemp = month.max;
    const precipitation = month.precipitation;

    if (Number.isNaN(minTemp)) {
      newErrors[`pasturePlanning.${index}.min`] = t.profile.errors.required(
        t.properties.details.pasturePlanning.minTemp
      );
    } else if (minTemp < -50 || minTemp > 50) {
      newErrors[`pasturePlanning.${index}.min`] = t.properties.edit.validation.temperatureRange;
    }

    if (Number.isNaN(maxTemp)) {
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

    if (Number.isNaN(precipitation)) {
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
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (pasturePlanning) {
      for (let index = 0; index < pasturePlanning.length; index++) {
        validateMonth(pasturePlanning[index], index, newErrors);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !propertyId) return;

    await updateProperty({
      pasturePlanning,
      pasturePlanningModifiedByUser: hasBeenModified,
    });
  };

  return (
    <div className="space-y-8">
      <FixedAlert alertMessage={alertMessage} />

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
        <Button variant="outline" onClick={navigateToView} disabled={isSubmitting}>
          {t.common.back}
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
              onClick={navigateToView}
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

export default function EditPasturePlanning() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const { property, isLoading, isSubmitting, alertMessage, updateProperty, navigateToView, t } =
    usePropertyEdit({ propertyId });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (!property || !propertyId) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">{t.properties.emptyState.title}</p>
          <Button variant="outline" onClick={navigateToView} className="mt-4">
            {t.common.back}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PasturePlanningForm
      key={property.id}
      property={property}
      propertyId={propertyId}
      isSubmitting={isSubmitting}
      alertMessage={alertMessage}
      navigateToView={navigateToView}
      updateProperty={updateProperty}
      t={t}
    />
  );
}
