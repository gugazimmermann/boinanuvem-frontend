import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { Button, Input, Alert, Select, FileUpload } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { mockProperties } from "~/mocks/properties";
import { getLocationsByPropertyId } from "~/mocks/locations";
import { getAnimalById } from "~/mocks/animals";
import { addAnimalMovement, getAnimalMovementsByAnimalId } from "~/mocks/animal-movements";
import { mockEmployees } from "~/mocks/employees";
import { mockServiceProviders } from "~/mocks/service-providers";
import { mockCompanies } from "~/mocks/companies";
import type { Animal } from "~/types";

export function meta() {
  return [
    { title: "Adicionar Movimentação de Animais - Boi na Nuvem" },
    {
      name: "description",
      content: "Mover animais entre propriedades e localizações",
    },
  ];
}

export default function NewAnimalMovement() {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useTranslation();

  const animalIds = useMemo(
    () => (location.state?.animalIds as string[]) || [],
    [location.state?.animalIds]
  );

  const [animals, setAnimals] = useState<Animal[]>([]);
  const company = mockCompanies[0];
  const companyId = company?.id || "";

  const [formData, setFormData] = useState<{
    propertyId: string;
    locationId: string;
    date: string;
    employeeIds: string[];
    serviceProviderIds: string[];
    observation: string;
  }>({
    propertyId: "",
    locationId: "",
    date: new Date().toISOString().split("T")[0],
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
    if (animalIds.length > 0) {
      const loadedAnimals = animalIds
        .map((id) => getAnimalById(id))
        .filter((animal): animal is Animal => animal !== null);
      setAnimals(loadedAnimals);

      if (loadedAnimals.length > 0) {
        const getAnimalPropertyId = (animalId: string): string | undefined => {
          const movements = getAnimalMovementsByAnimalId(animalId);
          if (movements.length === 0) return undefined;
          const lastMovement = movements.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];
          return lastMovement.propertyId;
        };

        const firstPropertyId = getAnimalPropertyId(loadedAnimals[0].id);
        if (firstPropertyId) {
          const allSameProperty = loadedAnimals.every(
            (a) => getAnimalPropertyId(a.id) === firstPropertyId
          );
          if (allSameProperty) {
            setFormData((prev) => ({ ...prev, propertyId: firstPropertyId }));
          }
        }
      }
    }
  }, [animalIds]);

  const locations = useMemo(() => {
    if (!formData.propertyId) {
      return [];
    }
    return getLocationsByPropertyId(formData.propertyId);
  }, [formData.propertyId]);

  const showAlert = (
    title: string,
    variant: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setAlertMessage({ title, variant });
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      if (field === "propertyId") {
        newData.locationId = "";
      }
      return newData;
    });
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleSelection = (field: "employeeIds" | "serviceProviderIds", id: string) => {
    setFormData((prev) => {
      const currentIds = prev[field];
      const newIds = currentIds.includes(id)
        ? currentIds.filter((itemId) => itemId !== id)
        : [...currentIds, id];
      return { ...prev, [field]: newIds };
    });
    if (errors[field] || errors.responsible) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        delete newErrors.responsible;
        return newErrors;
      });
    }
  };

  const employees = useMemo(() => {
    return mockEmployees.filter((emp) => emp.companyId === companyId && emp.status === "active");
  }, [companyId]);

  const serviceProviders = useMemo(() => {
    return mockServiceProviders.filter(
      (sp) => sp.companyId === companyId && sp.status === "active"
    );
  }, [companyId]);

  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => a.name.localeCompare(b.name));
  }, [employees]);

  const sortedServiceProviders = useMemo(() => {
    return [...serviceProviders].sort((a, b) => a.name.localeCompare(b.name));
  }, [serviceProviders]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.propertyId?.trim()) {
      newErrors.propertyId = t.animals.edit.propertyRequired;
    }
    if (!formData.date?.trim()) {
      newErrors.date = t.profile.errors.required(t.properties.details.movements.table.date);
    }
    if (formData.employeeIds.length === 0 && formData.serviceProviderIds.length === 0) {
      newErrors.responsible =
        t.properties.details.movements.errors.noResponsible ||
        "Selecione pelo menos um responsável (funcionário ou prestador de serviço)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || animals.length === 0) return;

    setIsSubmitting(true);
    try {
      let successCount = 0;

      for (const animal of animals) {
        const getAnimalPropertyId = (animalId: string): string | undefined => {
          const movements = getAnimalMovementsByAnimalId(animalId);
          if (movements.length === 0) return undefined;
          const lastMovement = movements.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];
          return lastMovement.propertyId;
        };
        const currentPropertyId = getAnimalPropertyId(animal.id);

        if (
          formData.propertyId &&
          (formData.propertyId !== currentPropertyId || formData.locationId)
        ) {
          try {
            const fileIds = files.map((_, index) => `file-${Date.now()}-${index}`);
            const movement = addAnimalMovement({
              animalIds: [animal.id],
              propertyId: formData.propertyId,
              locationId: formData.locationId || "",
              date: formData.date,
              companyId: animal.companyId,
              employeeIds: formData.employeeIds,
              serviceProviderIds: formData.serviceProviderIds,
              observation: formData.observation.trim() || undefined,
              fileIds: fileIds.length > 0 ? fileIds : undefined,
            });
            if (movement) {
              successCount++;
            }
          } catch (error) {
            console.error("Error creating movement:", error);
          }
        } else {
          successCount++;
        }
      }

      if (successCount > 0) {
        showAlert(t.animals.movement.success(successCount, animals.length), "success");
        setTimeout(() => {
          navigate(ROUTES.ANIMALS);
        }, 1500);
      } else {
        showAlert(t.animals.movement.error, "error");
      }
    } catch (error) {
      console.error("Error creating movements:", error);
      showAlert(t.animals.movement.error, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (animalIds.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t.animals.movement.noAnimalsSelected}
          </p>
          <Button variant="outline" onClick={() => navigate(ROUTES.ANIMALS)}>
            {t.team.new.back}
          </Button>
        </div>
      </div>
    );
  }

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
            {t.animals.movement.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.animals.movement.description(animals.length)}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(ROUTES.ANIMALS)} disabled={isSubmitting}>
          {t.team.new.back}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t.animals.movement.selectedAnimals}
          </h2>
          <div className="flex flex-wrap gap-2">
            {animals.map((animal) => (
              <span
                key={animal.id}
                className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              >
                {animal.code} - {animal.registrationNumber}
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={t.animals.edit.propertyLabel}
                value={formData.propertyId}
                onChange={(e) => handleChange("propertyId", e.target.value)}
                error={errors.propertyId}
                disabled={isSubmitting}
                required
                options={[
                  { value: "", label: "-" },
                  ...mockProperties.map((property) => ({
                    value: property.id,
                    label: property.name,
                  })),
                ]}
              />

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

            {formData.propertyId && (
              <Select
                label={t.animals.movement.locationLabel}
                value={formData.locationId}
                onChange={(e) => handleChange("locationId", e.target.value)}
                error={errors.locationId}
                disabled={isSubmitting}
                options={[
                  { value: "", label: t.animals.movement.noLocation },
                  ...locations.map((location) => ({
                    value: location.id,
                    label: location.name,
                  })),
                ]}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.employees.table.name}
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 max-h-48 overflow-y-auto">
                  {sortedEmployees.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t.properties.details.movements.noEmployees ||
                        "Nenhum funcionário disponível"}
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
                  {t.serviceProviders.table.name || "Prestadores de Serviço"}
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 max-h-48 overflow-y-auto">
                  {sortedServiceProviders.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t.properties.details.movements.noServiceProviders ||
                        "Nenhum prestador de serviço disponível"}
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
            {(errors.employeeIds || errors.serviceProviderIds || errors.responsible) && (
              <p className="text-sm text-red-500">
                {errors.employeeIds || errors.serviceProviderIds || errors.responsible}
              </p>
            )}

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
                  errors.observation ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder={
                  t.properties.details.movements.observationPlaceholder ||
                  "Adicione observações sobre esta movimentação..."
                }
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
              helperText={
                t.properties.details.movements.filesHelper ||
                "Você pode fazer upload de múltiplos arquivos"
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.ANIMALS)}
              disabled={isSubmitting}
            >
              {t.profile.company.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? t.common.loading : t.animals.movement.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
