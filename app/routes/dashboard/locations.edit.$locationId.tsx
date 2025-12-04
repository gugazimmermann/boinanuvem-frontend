import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { Button, FixedAlert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES, getLocationViewRoute } from "~/routes.config";
import { getLocationById, updateLocation } from "~/services/locations.service";
import { getPropertyById } from "~/services/properties.service";
import type { LocationFormData } from "~/types";
import { mockProperties } from "~/mocks/properties";
import { useLocationForm } from "~/hooks/use-location-form";
import { LocationForm } from "~/components/dashboard/locations/location-form";

export function meta() {
  return [
    { title: "Editar Localização - Boi na Nuvem" },
    {
      name: "description",
      content: "Editar localização rural",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "edit")({ request });
}

export default function EditLocation() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { locationId } = useParams<{ locationId: string }>();
  const location = getLocationById(locationId);

  const initialData = useMemo(() => {
    if (!location) return undefined;
    return {
      code: location.code,
      name: location.name,
      locationType: location.locationType,
      areaValue: location.area.value.toString(),
      areaType: location.area.type,
      status: location.status,
      propertyId: location.propertyId,
    };
  }, [location]);

  const {
    formData,
    errors,
    isSubmitting,
    alertMessage,
    handleChange,
    handleSubmit: baseHandleSubmit,
    showAlert,
  } = useLocationForm({
    initialData,
    translationKeys: {
      codeLabel: t.locations.table.code,
      nameLabel: t.locations.edit.nameLabel,
      locationTypeLabel: t.locations.edit.locationTypeLabel,
      areaLabel: t.locations.edit.areaLabel,
      propertyLabel: t.locations.edit.propertyLabel,
      areaValidationError: t.locations.edit.areaValidationError,
    },
    translation: t,
    onSubmit: (data: LocationFormData) => {
      if (!locationId) return;

      const property = getPropertyById(formData.propertyId);
      if (!property) {
        throw new Error(t.locations.edit.propertyNotFound);
      }

      const locationData: Partial<LocationFormData> = {
        code: data.code,
        name: data.name,
        locationType: data.locationType,
        area: data.area,
        status: data.status,
        companyId: property.companyId,
        propertyId: data.propertyId,
      };
      const success = updateLocation(locationId, locationData);
      if (!success) {
        throw new Error(t.locations.errors.updateFailed);
      }
    },
    onSuccess: () => {
      setTimeout(() => {
        navigate(ROUTES.LOCATIONS);
      }, 1500);
    },
    successMessage: t.locations.success.updated,
    errorMessage: t.locations.errors.updateFailed,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await baseHandleSubmit(e);
    } catch (error) {
      if (error instanceof Error) {
        showAlert(error.message, "error");
      }
    }
  };

  if (!location) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">{t.locations.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.LOCATIONS)} className="mt-4">
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <FixedAlert alertMessage={alertMessage} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t.locations.edit.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.locations.edit.description}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => locationId && navigate(getLocationViewRoute(locationId))}
          disabled={isSubmitting}
        >
          {t.team.new.back}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <LocationForm
              formData={formData}
              errors={errors}
              isSubmitting={isSubmitting}
              onFieldChange={handleChange}
              translation={t}
              properties={mockProperties}
              isEdit={true}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => locationId && navigate(getLocationViewRoute(locationId))}
              disabled={isSubmitting}
            >
              {t.profile.company.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? t.common.loading : t.locations.edit.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
