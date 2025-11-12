import { useState } from "react";
import { useNavigate } from "react-router";
import { Input, Button, Alert } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addLocation } from "~/mocks/locations";
import type { LocationFormData } from "~/types";
import { AreaType, LocationType } from "~/types";
import { mockProperties, getPropertyById } from "~/mocks/properties";

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

  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    locationType: LocationType;
    areaValue: string;
    areaType: AreaType;
    status: "active" | "inactive";
    propertyId: string;
  }>({
    code: "",
    name: "",
    locationType: LocationType.PASTURE,
    areaValue: "",
    areaType: AreaType.HECTARES,
    status: "active",
    propertyId: "",
  });

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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code?.trim()) {
      newErrors.code = t.profile.errors.required(t.locations.table.code);
    }
    if (!formData.name?.trim()) {
      newErrors.name = t.profile.errors.required(t.locations.new.nameLabel);
    }
    if (!formData.locationType) {
      newErrors.locationType = t.profile.errors.required(t.locations.new.locationTypeLabel);
    }
    if (!formData.propertyId?.trim()) {
      newErrors.propertyId = t.profile.errors.required(t.locations.new.propertyLabel);
    }
    if (!formData.areaValue?.trim()) {
      newErrors.areaValue = t.profile.errors.required(t.locations.new.areaLabel);
    } else {
      const areaNum = parseFloat(formData.areaValue);
      if (isNaN(areaNum) || areaNum <= 0) {
        newErrors.areaValue = t.locations.new.areaValidationError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const property = getPropertyById(formData.propertyId);
      if (!property) {
        showAlert(t.locations.new.propertyNotFound, "error");
        setIsSubmitting(false);
        return;
      }

      const locationData: LocationFormData = {
        code: formData.code,
        name: formData.name,
        locationType: formData.locationType,
        area: {
          value: parseFloat(formData.areaValue),
          type: formData.areaType,
        },
        status: formData.status,
        companyId: property.companyId,
        propertyId: formData.propertyId,
      };
      addLocation(locationData);
      showAlert(t.locations.new.success, "success");
      setTimeout(() => {
        navigate(ROUTES.LOCATIONS);
      }, 1500);
    } catch (error) {
      console.error("Error adding location:", error);
      showAlert(t.locations.new.error, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
          <Alert title={alertMessage.title} variant={alertMessage.variant} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.locations.addLocation}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.locations.new.description}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.LOCATIONS)}
          disabled={isSubmitting}
        >
          {t.common.back}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={t.locations.table.code}
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                error={errors.code}
                disabled={isSubmitting}
                required
              />
              <Input
                label={t.locations.new.nameLabel}
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                error={errors.name}
                disabled={isSubmitting}
                className="md:col-span-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.locations.new.propertyLabel} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.propertyId}
                onChange={(e) => handleChange("propertyId", e.target.value)}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 ${
                  errors.propertyId ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value="">{t.locations.new.selectProperty}</option>
                {mockProperties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
              {errors.propertyId && (
                <p className="mt-1 text-sm text-red-500">{errors.propertyId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.locations.new.locationTypeLabel} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.locationType}
                onChange={(e) => handleChange("locationType", e.target.value as LocationType)}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 ${
                  errors.locationType ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <option value={LocationType.PASTURE}>{t.locations.types.pasture}</option>
                <option value={LocationType.BARN}>{t.locations.types.barn}</option>
                <option value={LocationType.STORAGE}>{t.locations.types.storage}</option>
                <option value={LocationType.CORRAL}>{t.locations.types.corral}</option>
                <option value={LocationType.SILO}>{t.locations.types.silo}</option>
                <option value={LocationType.FIELD}>{t.locations.types.field}</option>
                <option value={LocationType.PADDOCK}>{t.locations.types.paddock}</option>
                <option value={LocationType.FEEDLOT}>{t.locations.types.feedlot}</option>
                <option value={LocationType.SEMI_FEEDLOT}>{t.locations.types.semi_feedlot}</option>
                <option value={LocationType.MILKING_PARLOR}>
                  {t.locations.types.milking_parlor}
                </option>
                <option value={LocationType.WAREHOUSE}>{t.locations.types.warehouse}</option>
                <option value={LocationType.GARAGE}>{t.locations.types.garage}</option>
                <option value={LocationType.OFFICE}>{t.locations.types.office}</option>
                <option value={LocationType.RESIDENCE}>{t.locations.types.residence}</option>
                <option value={LocationType.OTHER}>{t.locations.types.other}</option>
              </select>
              {errors.locationType && (
                <p className="mt-1 text-sm text-red-500">{errors.locationType}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={t.locations.new.areaLabel}
                type="number"
                step="0.1"
                min="0"
                value={formData.areaValue}
                onChange={(e) => handleChange("areaValue", e.target.value)}
                error={errors.areaValue}
                disabled={isSubmitting}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.locations.areaType} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.areaType}
                  onChange={(e) => handleChange("areaType", e.target.value as AreaType)}
                  disabled={isSubmitting}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 ${
                    errors.areaType ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <option value={AreaType.HECTARES}>{t.locations.areaTypes.hectares}</option>
                  <option value={AreaType.SQUARE_METERS}>
                    {t.locations.areaTypes.square_meters}
                  </option>
                  <option value={AreaType.SQUARE_FEET}>{t.locations.areaTypes.square_feet}</option>
                  <option value={AreaType.ACRES}>{t.locations.areaTypes.acres}</option>
                  <option value={AreaType.SQUARE_KILOMETERS}>
                    {t.locations.areaTypes.square_kilometers}
                  </option>
                  <option value={AreaType.SQUARE_MILES}>
                    {t.locations.areaTypes.square_miles}
                  </option>
                </select>
                {errors.areaType && <p className="mt-1 text-sm text-red-500">{errors.areaType}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.locations.new.statusLabel}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value as "active" | "inactive")}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                >
                  <option value="active">{t.locations.table.active}</option>
                  <option value="inactive">{t.locations.table.inactive}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.LOCATIONS)}
              disabled={isSubmitting}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? t.common.loading : t.locations.new.addButton}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
