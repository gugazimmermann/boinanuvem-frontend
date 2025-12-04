import { useNavigate } from "react-router";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addProperty } from "~/services/properties.service";
import type { PropertyFormData } from "~/types";
import { mockCompanies } from "~/mocks/companies";
import {
  PropertyForm,
  type PropertyFormValues,
} from "~/components/dashboard/properties/property-form";
import { usePropertyForm } from "~/hooks/use-property-form";
import { useAlert } from "~/hooks/use-alert";
import { PropertyFormLayout } from "~/components/dashboard/properties/property-form-layout";

export function meta() {
  return [
    { title: "Adicionar Propriedade - Boi na Nuvem" },
    {
      name: "description",
      content: "Adicionar nova propriedade rural",
    },
  ];
}

export default function NewProperty() {
  const t = useTranslation();
  const navigate = useNavigate();
  const company = mockCompanies[0];
  const companyId = company?.id || "";
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
    translationKeys: {
      required: (field: string) => t.profile.errors.required(field),
      areaValidationError: t.properties.new.areaValidationError,
    },
    onSubmit: async (data: PropertyFormValues) => {
      const propertyData: PropertyFormData = {
        code: data.code,
        name: data.name,
        area: {
          value: Number.parseFloat(data.areaValue),
          type: data.areaType,
        },
        status: data.status,
        companyId,
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
      };
      addProperty(propertyData);
      showAlert(t.properties.new.success, "success");
      setTimeout(() => {
        navigate(ROUTES.PROPERTIES);
      }, 1500);
    },
  });

  return (
    <PropertyFormLayout
      title={t.properties.addProperty}
      description={t.properties.new.description}
      backButtonLabel={t.common.back}
      onBack={() => navigate(ROUTES.PROPERTIES)}
      cancelButtonLabel={t.common.cancel}
      onCancel={() => navigate(ROUTES.PROPERTIES)}
      submitButtonLabel={t.properties.new.addButton}
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
            nameLabel: t.properties.new.nameLabel,
            zipCode: t.profile.company.fields.zipCode,
            street: t.profile.company.fields.street,
            number: t.profile.company.fields.number,
            complement: t.profile.company.fields.complement,
            neighborhood: t.profile.company.fields.neighborhood,
            city: t.profile.company.fields.city,
            state: t.profile.company.fields.state,
            areaLabel: t.properties.new.areaLabel,
            areaType: t.locations.areaType,
            statusLabel: t.properties.new.statusLabel,
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
