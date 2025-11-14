import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { Button, Input, Alert, FileUpload } from "~/components/ui";
import { useTranslation } from "~/i18n";
import {
  getPropertyViewRoute,
  getLocationViewRoute,
  getEmployeeViewRoute,
  getServiceProviderViewRoute,
} from "~/routes.config";
import { getPropertyById } from "~/mocks/properties";
import { getLocationsByPropertyId, getLocationById } from "~/mocks/locations";
import { getEmployeesByPropertyId, getEmployeeById } from "~/mocks/employees";
import { getServiceProvidersByPropertyId, getServiceProviderById } from "~/mocks/service-providers";
import { addLocationMovement } from "~/mocks/location-movements";
import { LocationMovementType } from "~/types";

export function meta() {
  return [
    { title: "Adicionar Movimentação - Boi na Nuvem" },
    {
      name: "description",
      content: "Adicionar nova movimentação",
    },
  ];
}

export default function NewMovement() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const t = useTranslation();
  const property = getPropertyById(propertyId);
  const locationIdParam = searchParams.get("locationId");
  const employeeIdParam = searchParams.get("employeeId");
  const serviceProviderIdParam = searchParams.get("serviceProviderId");

  const [formData, setFormData] = useState<{
    type: LocationMovementType;
    date: string;
    locationIds: string[];
    employeeIds: string[];
    serviceProviderIds: string[];
    observation: string;
  }>({
    type: LocationMovementType.OTHER,
    date: new Date().toISOString().split("T")[0],
    locationIds: [],
    employeeIds: [],
    serviceProviderIds: [],
    observation: "",
  });

  const [files, setFiles] = useState<File[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);

  useEffect(() => {
    if (property) {
      const allLocations = getLocationsByPropertyId(property.id);
      const allEmployees = getEmployeesByPropertyId(property.id);
      const allServiceProviders = getServiceProvidersByPropertyId(property.id);

      const locationExists =
        locationIdParam && allLocations.some((loc) => loc.id === locationIdParam);
      const employeeExists =
        employeeIdParam && allEmployees.some((emp) => emp.id === employeeIdParam);
      const serviceProviderExists =
        serviceProviderIdParam &&
        allServiceProviders.some((prov) => prov.id === serviceProviderIdParam);

      setFormData((prev) => ({
        ...prev,
        locationIds: locationExists && locationIdParam ? [locationIdParam] : prev.locationIds,
        employeeIds: employeeExists && employeeIdParam ? [employeeIdParam] : prev.employeeIds,
        serviceProviderIds:
          serviceProviderExists && serviceProviderIdParam
            ? [serviceProviderIdParam]
            : prev.serviceProviderIds,
      }));
    }
  }, [property, locationIdParam, employeeIdParam, serviceProviderIdParam]);

  if (!property) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t.properties.emptyState.title}</p>
          <Button variant="outline" onClick={() => navigate("/dashboard/propriedades")}>
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

  const allLocations = getLocationsByPropertyId(property.id);

  const locationExists = locationIdParam && allLocations.some((loc) => loc.id === locationIdParam);
  const sortedLocations =
    locationExists && locationIdParam
      ? [
          ...allLocations.filter((loc) => loc.id === locationIdParam),
          ...allLocations.filter((loc) => loc.id !== locationIdParam),
        ]
      : allLocations;

  const allEmployees = getEmployeesByPropertyId(property.id);
  const allServiceProviders = getServiceProvidersByPropertyId(property.id);

  const employeeExists = employeeIdParam && allEmployees.some((emp) => emp.id === employeeIdParam);
  const sortedEmployees =
    employeeExists && employeeIdParam
      ? [
          ...allEmployees.filter((emp) => emp.id === employeeIdParam),
          ...allEmployees.filter((emp) => emp.id !== employeeIdParam),
        ]
      : allEmployees;

  const serviceProviderExists =
    serviceProviderIdParam &&
    allServiceProviders.some((prov) => prov.id === serviceProviderIdParam);
  const sortedServiceProviders =
    serviceProviderExists && serviceProviderIdParam
      ? [
          ...allServiceProviders.filter((prov) => prov.id === serviceProviderIdParam),
          ...allServiceProviders.filter((prov) => prov.id !== serviceProviderIdParam),
        ]
      : allServiceProviders;

  const showAlert = (
    title: string,
    variant: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setAlertMessage({ title, variant });
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  const handleChange = (field: keyof typeof formData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleSelection = (
    field: "locationIds" | "employeeIds" | "serviceProviderIds",
    id: string
  ) => {
    setFormData((prev) => {
      const currentIds = prev[field];
      const newIds = currentIds.includes(id)
        ? currentIds.filter((itemId) => itemId !== id)
        : [...currentIds, id];
      return { ...prev, [field]: newIds };
    });
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

    if (!formData.type) {
      newErrors.type = t.profile.errors.required(t.properties.details.movements.table.type);
    }
    if (!formData.date?.trim()) {
      newErrors.date = t.profile.errors.required(t.properties.details.movements.table.date);
    }
    if (formData.locationIds.length === 0) {
      newErrors.locationIds = t.profile.errors.required(
        t.properties.details.movements.table.locations
      );
    }
    if (formData.employeeIds.length === 0 && formData.serviceProviderIds.length === 0) {
      newErrors.responsible = t.properties.details.movements.errors.noResponsible;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const fileIds = files.map((_, index) => `file-${Date.now()}-${index}`);

      const movementData = {
        companyId: property.companyId,
        propertyId: property.id,
        locationIds: formData.locationIds,
        employeeIds: formData.employeeIds,
        serviceProviderIds: formData.serviceProviderIds,
        type: formData.type,
        date: formData.date,
        observation: formData.observation.trim() || undefined,
        fileIds: fileIds.length > 0 ? fileIds : undefined,
      };
      addLocationMovement(movementData);
      showAlert(t.properties.details.movements.success, "success");
      setTimeout(() => {
        if (locationIdParam && locationExists) {
          navigate(`${getLocationViewRoute(locationIdParam)}?tab=movements`);
        } else if (employeeIdParam && employeeExists) {
          navigate(`${getEmployeeViewRoute(employeeIdParam)}?tab=movements`);
        } else if (serviceProviderIdParam && serviceProviderExists) {
          navigate(`${getServiceProviderViewRoute(serviceProviderIdParam)}?tab=movements`);
        } else {
          navigate(`${getPropertyViewRoute(property.id)}?tab=movements`);
        }
      }, 1500);
    } catch (error) {
      console.error("Error adding movement:", error);
      showAlert(t.properties.details.movements.error, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const movementTypeOptions = Object.values(LocationMovementType).map((type) => ({
    value: type,
    label:
      t.properties.details.movements.types[
        type as keyof typeof t.properties.details.movements.types
      ] || type,
  }));

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
            {t.properties.details.movements.add}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {(() => {
              if (locationIdParam && getLocationById(locationIdParam)) {
                return `${getLocationById(locationIdParam)?.name} • ${property.name}`;
              }
              if (employeeIdParam && getEmployeeById(employeeIdParam)) {
                return `${getEmployeeById(employeeIdParam)?.name} • ${property.name}`;
              }
              if (serviceProviderIdParam && getServiceProviderById(serviceProviderIdParam)) {
                return `${getServiceProviderById(serviceProviderIdParam)?.name} • ${property.name}`;
              }
              return property.name;
            })()}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            if (locationIdParam && locationExists) {
              navigate(`${getLocationViewRoute(locationIdParam)}?tab=movements`);
            } else if (employeeIdParam && employeeExists) {
              navigate(`${getEmployeeViewRoute(employeeIdParam)}?tab=movements`);
            } else if (serviceProviderIdParam && serviceProviderExists) {
              navigate(`${getServiceProviderViewRoute(serviceProviderIdParam)}?tab=movements`);
            } else {
              navigate(`${getPropertyViewRoute(property.id)}?tab=movements`);
            }
          }}
          disabled={isSubmitting}
        >
          {t.common.back}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.properties.details.movements.table.type} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value as LocationMovementType)}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 ${
                  errors.type ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {movementTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type}</p>}
            </div>

            <Input
              label={t.properties.details.movements.table.date}
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              error={errors.date}
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.properties.details.movements.table.locations}{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 max-h-48 overflow-y-auto">
              {sortedLocations.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.properties.details.movements.noLocations}
                </p>
              ) : (
                <div className="space-y-2">
                  {sortedLocations.map((location) => (
                    <label
                      key={location.id}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.locationIds.includes(location.id)}
                        onChange={() => toggleSelection("locationIds", location.id)}
                        disabled={isSubmitting}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {location.name} ({location.code})
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {errors.locationIds && (
              <p className="mt-1 text-sm text-red-500">{errors.locationIds}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.employees.table.name}
              </label>
              <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 max-h-48 overflow-y-auto">
                {sortedEmployees.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t.properties.details.movements.noEmployees}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {sortedEmployees.map((employee) => (
                      <label
                        key={employee.id}
                        className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={formData.employeeIds.includes(employee.id)}
                          onChange={() => toggleSelection("employeeIds", employee.id)}
                          disabled={isSubmitting}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {employee.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.serviceProviders.table.name}
              </label>
              <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 max-h-48 overflow-y-auto">
                {sortedServiceProviders.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t.properties.details.movements.noServiceProviders}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {sortedServiceProviders.map((provider) => (
                      <label
                        key={provider.id}
                        className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={formData.serviceProviderIds.includes(provider.id)}
                          onChange={() => toggleSelection("serviceProviderIds", provider.id)}
                          disabled={isSubmitting}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {provider.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          {errors.responsible && <p className="text-sm text-red-500">{errors.responsible}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.properties.details.movements.observation || "Observação"}
            </label>
            <textarea
              value={formData.observation}
              onChange={(e) => handleChange("observation", e.target.value)}
              disabled={isSubmitting}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200 resize-none ${
                errors.observation
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder={t.properties.details.movements.observationPlaceholder || "Adicione observações sobre esta movimentação..."}
            />
            {errors.observation && (
              <p className="mt-1 text-sm text-red-500">{errors.observation}</p>
            )}
          </div>

          <FileUpload
            label={t.properties.details.movements.files || "Anexos"}
            files={files}
            onChange={setFiles}
            disabled={isSubmitting}
            multiple={true}
            helperText={t.properties.details.movements.filesHelper || "Você pode fazer upload de múltiplos arquivos"}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (locationIdParam) {
                  navigate(`${getLocationViewRoute(locationIdParam)}?tab=movements`);
                } else {
                  navigate(`${getPropertyViewRoute(property.id)}?tab=movements`);
                }
              }}
              disabled={isSubmitting}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {t.common.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
