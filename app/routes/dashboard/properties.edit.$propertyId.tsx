import { useNavigate, useParams } from "react-router";
import { Button } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES, getPropertyViewRoute } from "~/routes.config";
import { getPropertyById, updateProperty } from "~/services/properties.service";
import type { PropertyFormData } from "~/types";
import {
  PropertyForm,
  type PropertyFormValues,
} from "~/components/dashboard/properties/property-form";
import { usePropertyForm } from "~/hooks/use-property-form";
import { useAlert } from "~/hooks/use-alert";
import { PropertyFormLayout } from "~/components/dashboard/properties/property-form-layout";

export function meta() {
  return [
    { title: "Editar Propriedade - Boi na Nuvem" },
    {
      name: "description",
      content: "Editar propriedade rural",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "edit")({ request });
}

export default function EditProperty() {
  const t = useTranslation();
  const navigate = useNavigate();
  const { propertyId } = useParams<{ propertyId: string }>();
  const property = getPropertyById(propertyId);
  const { showAlert, AlertDisplay } = useAlert();

  const {
    formData,
    errors,
    isSubmitting,
    zipCodeLoading,
    zipCodeError,
    handleChange,
    handleSubmit,
  } = usePropertyForm({
    initialValues: property
      ? {
          code: property.code,
          name: property.name,
          city: property.city,
          state: property.state,
          areaValue: property.area.value.toString(),
          areaType: property.area.type,
          status: property.status,
          zipCode: property.zipCode,
          street: property.street,
          number: property.number,
          complement: property.complement,
          neighborhood: property.neighborhood,
        }
      : undefined,
    translationKeys: {
      required: (field: string) => t.profile.errors.required(field),
      areaValidationError: t.properties.edit.areaValidationError,
    },
    onSubmit: async (data: PropertyFormValues) => {
      if (!propertyId) return;
      const propertyData: Partial<PropertyFormData> = {
        code: data.code,
        name: data.name,
        area: {
          value: Number.parseFloat(data.areaValue),
          type: data.areaType,
        },
        status: data.status,
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
      };
      const success = updateProperty(propertyId, propertyData);
      if (success) {
        showAlert(t.properties.success.updated, "success");
        setTimeout(() => {
          navigate(ROUTES.PROPERTIES);
        }, 1500);
      } else {
        showAlert(t.properties.errors.updateFailed, "error");
      }
    },
  });

  if (!property) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">{t.properties.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate(ROUTES.PROPERTIES)} className="mt-4">
            {t.common.back}
          </Button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    if (propertyId) navigate(getPropertyViewRoute(propertyId));
  };

  return (
    <PropertyFormLayout
      title={t.properties.edit.title}
      description={t.properties.edit.description}
      backButtonLabel={t.team.new.back}
      onBack={handleBack}
      cancelButtonLabel={t.profile.company.cancel}
      onCancel={handleBack}
      submitButtonLabel={t.properties.edit.save}
      loadingLabel={t.common.loading}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      alertDisplay={AlertDisplay}
      formContent={
        <PropertyForm
          formData={formData as unknown as PropertyFormValues}
          errors={errors}
          isSubmitting={isSubmitting}
          zipCodeLoading={zipCodeLoading}
          zipCodeError={zipCodeError}
          onChange={handleChange}
          translationKeys={{
            code: t.properties.table.code,
            nameLabel: t.properties.edit.nameLabel,
            zipCode: t.profile.company.fields.zipCode,
            street: t.profile.company.fields.street,
            number: t.profile.company.fields.number,
            complement: t.profile.company.fields.complement,
            neighborhood: t.profile.company.fields.neighborhood,
            city: t.profile.company.fields.city,
            state: t.profile.company.fields.state,
            areaLabel: t.properties.edit.areaLabel,
            areaType: t.locations.areaType,
            statusLabel: t.properties.edit.statusLabel,
            active: t.properties.table.active,
            inactive: t.properties.table.inactive,
            searchingAddress: t.team.new.searchingAddress,
            areaTypes: {
              hectares: t.locations.areaTypes.hectares,
              square_meters: t.locations.areaTypes.square_meters,
              square_feet: t.locations.areaTypes.square_feet,
              acres: t.locations.areaTypes.acres,
              square_kilometers: t.locations.areaTypes.square_kilometers,
              square_miles: t.locations.areaTypes.square_miles,
            },
          }}
        />
      }
    />
  );
}
