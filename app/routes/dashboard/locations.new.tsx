import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FormPageLayout } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addLocation } from "~/services/locations.service";
import { getProperties } from "~/services/properties.service";
import type { LocationFormData, Property } from "~/types";
import { useLocationForm } from "~/hooks/use-location-form";
import { LocationForm } from "~/components/dashboard/locations/location-form";
import { useAlert } from "~/hooks/use-alert";

export function meta() {
  return [
    { title: "Adicionar Localização - Boi na Nuvem" },
    {
      name: "description",
      content: "Adicionar nova localização rural",
    },
  ];
}

export default function NewLocation() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);

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

  const {
    formData,
    errors,
    isSubmitting,
    alertMessage,
    handleChange,
    handleSubmit: baseHandleSubmit,
    showAlert: _showFormAlert,
  } = useLocationForm({
    translationKeys: {
      codeLabel: t.locations.table.code,
      nameLabel: t.locations.new.nameLabel,
      locationTypeLabel: t.locations.new.locationTypeLabel,
      areaLabel: t.locations.new.areaLabel,
      propertyLabel: t.locations.new.propertyLabel,
      areaValidationError: t.locations.new.areaValidationError,
    },
    translation: t,
    onSubmit: (data: LocationFormData) => {
      void (async () => {
        const property = properties.find((p) => p.id === formData.propertyId);
        if (!property) {
          throw new Error(t.locations.new.propertyNotFound);
        }

        const locationData: LocationFormData = {
          ...data,
          companyId: property.companyId,
        };

        try {
          await addLocation(locationData);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : t.locations.new.error;
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
    successMessage: t.locations.new.success,
    errorMessage: t.locations.new.error,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await baseHandleSubmit(e);
    } catch (error) {
      if (error instanceof Error && error.message === t.locations.new.propertyNotFound) {
        showAlert(t.locations.new.propertyNotFound, "error");
      }
    }
  };

  const formId = "location-form";

  return (
    <FormPageLayout
      title={t.locations.addLocation}
      description={t.locations.new.description}
      alert={alertMessage}
      backButton={{
        label: t.common.back,
        onClick: () => {
          navigate(ROUTES.LOCATIONS);
        },
        disabled: isSubmitting,
      }}
      footer={{
        cancelButton: {
          label: t.common.cancel,
          onClick: () => {
            navigate(ROUTES.LOCATIONS);
          },
          disabled: isSubmitting,
        },
        submitButton: {
          label: t.locations.new.addButton,
          loadingLabel: t.common.loading,
          disabled: isSubmitting,
          isLoading: isSubmitting,
        },
      }}
      formId={formId}
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <LocationForm
            formData={formData}
            errors={errors}
            isSubmitting={isSubmitting || isLoadingProperties}
            onFieldChange={handleChange}
            translation={t}
            properties={properties}
          />
        </div>
      </form>
    </FormPageLayout>
  );
}
