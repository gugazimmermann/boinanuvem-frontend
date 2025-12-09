import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { Button, FixedAlert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES, getLocationViewRoute } from "~/routes.config";
import { getLocationById, updateLocation } from "~/services/locations.service";
import { getProperties } from "~/services/properties.service";
import type { Location, LocationFormData, Property } from "~/types";
import { useLocationForm } from "~/hooks/use-location-form";
import { LocationForm } from "~/components/dashboard/locations/location-form";
import { useAlert } from "~/hooks/use-alert";

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
  const { showAlert } = useAlert();
  const [location, setLocation] = useState<Location | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);

  useEffect(() => {
    const fetchLocation = async () => {
      if (!locationId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getLocationById(locationId);
        setLocation(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t.locations.errors.loadFailed;
        showAlert(errorMessage, "error");
        console.error("Failed to load location:", error);
        setTimeout(() => {
          navigate(ROUTES.LOCATIONS);
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocation();
  }, [locationId, navigate, showAlert, t]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoadingProperties(true);
        const data = await getProperties();
        setProperties(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t.locations.errors.loadFailed;
        showAlert(errorMessage, "error");
        console.error("Failed to load properties:", error);
      } finally {
        setIsLoadingProperties(false);
      }
    };

    fetchProperties();
  }, [showAlert, t]);

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
    showAlert: _showFormAlert,
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
      void (async () => {
        if (!locationId) return;

        const property = properties.find((p) => p.id === formData.propertyId);
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

        try {
          await updateLocation(locationId, locationData);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : t.locations.errors.updateFailed;
          showAlert(errorMessage, "error");
          throw error;
        }
      })();
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

  if (isLoading || isLoadingProperties) {
    return (
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">{t.common.loading}</p>
        </div>
      </div>
    );
  }

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
              properties={properties}
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
