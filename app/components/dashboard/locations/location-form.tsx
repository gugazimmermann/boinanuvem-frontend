import { Input, FormFieldGroup } from "~/components/ui";
import { LocationType, AreaType } from "~/types";
import type { LocationFormState } from "~/hooks/use-location-form";
import type { Property } from "~/types";

export interface LocationFormProps {
  readonly formData: LocationFormState;
  readonly errors: Record<string, string>;
  readonly isSubmitting: boolean;
  readonly onFieldChange: (
    field: keyof LocationFormState,
    value: string | LocationType | AreaType
  ) => void;
  readonly translation: {
    locations: {
      table?: {
        code?: string;
        active?: string;
        inactive?: string;
      };
      new?: {
        nameLabel?: string;
        propertyLabel?: string;
        selectProperty?: string;
        locationTypeLabel?: string;
        areaLabel?: string;
        statusLabel?: string;
      };
      edit?: {
        nameLabel?: string;
        propertyLabel?: string;
        selectProperty?: string;
        locationTypeLabel?: string;
        areaLabel?: string;
        statusLabel?: string;
      };
      types?: Record<string, string>;
      areaType?: string;
      areaTypes?: Record<string, string>;
    };
  };
  readonly properties: Property[];
  readonly isEdit?: boolean;
}

export function LocationForm({
  formData,
  errors,
  isSubmitting,
  onFieldChange,
  translation: t,
  properties,
  isEdit = false,
}: LocationFormProps) {
  const getEditTranslationKey = (key: string): string => {
    const edit = t.locations.edit as Record<string, string> | undefined;
    const new_ = t.locations.new as Record<string, string> | undefined;
    return edit?.[key] || new_?.[key] || "";
  };

  const getNewTranslationKey = (key: string): string => {
    const new_ = t.locations.new as Record<string, string> | undefined;
    return new_?.[key] || "";
  };

  const getTranslationKey = isEdit ? getEditTranslationKey : getNewTranslationKey;

  return (
    <div className="space-y-4">
      <FormFieldGroup columns={3}>
        <Input
          label={t.locations.table?.code || "Código"}
          value={formData.code}
          onChange={(e) => onFieldChange("code", e.target.value)}
          error={errors.code}
          disabled={isSubmitting}
          required
        />
        <Input
          label={getTranslationKey("nameLabel")}
          value={formData.name}
          onChange={(e) => onFieldChange("name", e.target.value)}
          error={errors.name}
          disabled={isSubmitting}
          className="md:col-span-2"
          required
        />
      </FormFieldGroup>

      <div>
        <label
          htmlFor="location-form-property"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {getTranslationKey("propertyLabel")} <span className="text-red-500">*</span>
        </label>
        <select
          id="location-form-property"
          value={formData.propertyId}
          onChange={(e) => onFieldChange("propertyId", e.target.value)}
          disabled={isSubmitting}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 ${
            errors.propertyId ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          }`}
        >
          <option value="">{getTranslationKey("selectProperty")}</option>
          {properties.map((property: Property) => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </select>
        {errors.propertyId && <p className="mt-1 text-sm text-red-500">{errors.propertyId}</p>}
      </div>

      <div>
        <label
          htmlFor="location-form-location-type"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {getTranslationKey("locationTypeLabel")} <span className="text-red-500">*</span>
        </label>
        <select
          id="location-form-location-type"
          value={formData.locationType}
          onChange={(e) => onFieldChange("locationType", e.target.value as LocationType)}
          disabled={isSubmitting}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 ${
            errors.locationType ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          }`}
        >
          <option value={LocationType.PASTURE}>{t.locations.types?.pasture}</option>
          <option value={LocationType.BARN}>{t.locations.types?.barn}</option>
          <option value={LocationType.STORAGE}>{t.locations.types?.storage}</option>
          <option value={LocationType.CORRAL}>{t.locations.types?.corral}</option>
          <option value={LocationType.SILO}>{t.locations.types?.silo}</option>
          <option value={LocationType.FIELD}>{t.locations.types?.field}</option>
          <option value={LocationType.PADDOCK}>{t.locations.types?.paddock}</option>
          <option value={LocationType.FEEDLOT}>{t.locations.types?.feedlot}</option>
          <option value={LocationType.SEMI_FEEDLOT}>{t.locations.types?.semi_feedlot}</option>
          <option value={LocationType.MILKING_PARLOR}>{t.locations.types?.milking_parlor}</option>
          <option value={LocationType.WAREHOUSE}>{t.locations.types?.warehouse}</option>
          <option value={LocationType.GARAGE}>{t.locations.types?.garage}</option>
          <option value={LocationType.OFFICE}>{t.locations.types?.office}</option>
          <option value={LocationType.RESIDENCE}>{t.locations.types?.residence}</option>
          <option value={LocationType.OTHER}>{t.locations.types?.other}</option>
        </select>
        {errors.locationType && <p className="mt-1 text-sm text-red-500">{errors.locationType}</p>}
      </div>

      <FormFieldGroup columns={3}>
        <Input
          label={getTranslationKey("areaLabel")}
          type="number"
          step="0.1"
          min="0"
          value={formData.areaValue}
          onChange={(e) => onFieldChange("areaValue", e.target.value)}
          error={errors.areaValue}
          disabled={isSubmitting}
          required
        />
        <div>
          <label
            htmlFor="location-form-area-type"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {t.locations.areaType || "Tipo de Área"} <span className="text-red-500">*</span>
          </label>
          <select
            id="location-form-area-type"
            value={formData.areaType}
            onChange={(e) => onFieldChange("areaType", e.target.value as AreaType)}
            disabled={isSubmitting}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 ${
              errors.areaType ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            }`}
          >
            <option value={AreaType.HECTARES}>{t.locations.areaTypes?.hectares}</option>
            <option value={AreaType.SQUARE_METERS}>{t.locations.areaTypes?.square_meters}</option>
            <option value={AreaType.SQUARE_FEET}>{t.locations.areaTypes?.square_feet}</option>
            <option value={AreaType.ACRES}>{t.locations.areaTypes?.acres}</option>
            <option value={AreaType.SQUARE_KILOMETERS}>
              {t.locations.areaTypes?.square_kilometers}
            </option>
            <option value={AreaType.SQUARE_MILES}>{t.locations.areaTypes?.square_miles}</option>
          </select>
          {errors.areaType && <p className="mt-1 text-sm text-red-500">{errors.areaType}</p>}
        </div>
        <div>
          <label
            htmlFor="location-form-status"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {getTranslationKey("statusLabel")}
          </label>
          <select
            id="location-form-status"
            value={formData.status}
            onChange={(e) => onFieldChange("status", e.target.value as "active" | "inactive")}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
          >
            <option value="active">{t.locations.table?.active}</option>
            <option value="inactive">{t.locations.table?.inactive}</option>
          </select>
        </div>
      </FormFieldGroup>
    </div>
  );
}
