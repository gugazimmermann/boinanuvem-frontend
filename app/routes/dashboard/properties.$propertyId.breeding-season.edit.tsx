import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Button, FixedAlert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { getPropertyViewRoute } from "~/routes.config";
import { getPropertyById, updateProperty } from "~/services/properties.service";
import { useAlert } from "~/hooks/use-alert";

export function meta() {
  return [
    { title: "Editar Estação de Monta - Boi na Nuvem" },
    {
      name: "description",
      content: "Editar estação de monta da propriedade",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "edit")({ request });
}

const ALL_MONTHS = [
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
] as const;

export default function EditBreedingSeason() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { propertyId } = useParams<{ propertyId: string }>();
  const property = getPropertyById(propertyId);

  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [hasBeenModified, setHasBeenModified] = useState(false);

  useEffect(() => {
    if (property) {
      const initial = property.breedingMonths || [];
      setSelectedMonths(initial);
      setHasBeenModified(property.breedingSeasonModifiedByUser || false);
    }
  }, [property]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { alertMessage, showAlert } = useAlert();

  const handleMonthToggle = (month: string) => {
    setSelectedMonths((prev) => {
      if (prev.includes(month)) {
        return prev.filter((m) => m !== month);
      } else {
        return [...prev, month];
      }
    });
    setHasBeenModified(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId) return;

    setIsSubmitting(true);
    try {
      const success = updateProperty(propertyId, {
        breedingMonths: selectedMonths,
        breedingSeasonModifiedByUser: hasBeenModified,
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
      console.error("Error updating breeding season:", error);
      showAlert(t.properties.errors.updateFailed, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!property) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">{t.properties.emptyState.title}</p>
          <Button
            variant="outline"
            onClick={() => navigate(getPropertyViewRoute(propertyId!))}
            className="mt-4"
          >
            {t.common.back}
          </Button>
        </div>
      </div>
    );
  }

  const monthOrder = [...ALL_MONTHS];
  const sortedSelectedMonths = [...selectedMonths].sort(
    (a, b) =>
      monthOrder.indexOf(a as (typeof ALL_MONTHS)[number]) -
      monthOrder.indexOf(b as (typeof ALL_MONTHS)[number])
  );

  return (
    <div className="space-y-6">
      <FixedAlert alertMessage={alertMessage} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.properties.details.pasturePlanning.breedingSeason.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.properties.edit.description}
          </p>
          {!hasBeenModified && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {t.properties.details.pasturePlanning.breedingSeason.aiGeneratedNote}
              </p>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => propertyId && navigate(getPropertyViewRoute(propertyId))}
          disabled={isSubmitting}
        >
          {t.common.back}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                {t.properties.details.pasturePlanning.breedingSeason.title}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {ALL_MONTHS.map((month) => {
                  const isSelected = selectedMonths.includes(month);
                  const monthTranslation =
                    t.properties.details.pasturePlanning.breedingSeason.months[month] || month;
                  return (
                    <label
                      key={month}
                      className={`
                        flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all
                        ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400"
                            : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                        }
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleMonthToggle(month)}
                        disabled={isSubmitting}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:focus:ring-blue-400"
                      />
                      <span
                        className={`ml-3 text-sm font-medium ${
                          isSelected
                            ? "text-blue-800 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {monthTranslation}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {selectedMonths.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.properties.details.pasturePlanning.breedingSeason.title}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {sortedSelectedMonths.map((month) => {
                    const monthTranslation =
                      t.properties.details.pasturePlanning.breedingSeason.months[
                        month as keyof typeof t.properties.details.pasturePlanning.breedingSeason.months
                      ] || month;
                    return (
                      <span
                        key={month}
                        className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-md text-sm font-medium"
                      >
                        {monthTranslation}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
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
