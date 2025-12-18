import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Button, Input, FixedAlert, Select, FileUpload } from "~/components/ui";
import { useTranslation } from "~/i18n";
import {
  ResponsibleSelectionSection,
  ObservationField,
  FormActions,
} from "~/components/dashboard/shared";
import { ROUTES } from "~/routes.config";
import { getProperties } from "~/services/properties.service";
import { getLocations } from "~/services/locations.service";
import type { Location, Employee, ServiceProvider, Animal, Property } from "~/types";
import { getAnimalById, getAnimalsByCompanyId } from "~/services/animals.service";
import {
  addAnimalMovement,
  getAnimalMovementsByAnimalId,
} from "~/services/animal-movements.service";
import { getEmployees } from "~/services/employees.service";
import { getServiceProviders } from "~/services/service-providers.service";
import { useAuth } from "~/contexts/auth-context";
import { useMovementForm, type MovementFormBaseData } from "~/hooks/use-movement-form";
import { useAlert } from "~/hooks/use-alert";

export function meta() {
  return [
    { title: "Adicionar Movimentação de Animais - Boi na Nuvem" },
    {
      name: "description",
      content: "Mover animais entre propriedades e localizações",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "add")({ request });
}

const getAnimalPropertyId = async (animalId: string): Promise<string | undefined> => {
  const movements = await getAnimalMovementsByAnimalId(animalId);
  if (movements.length === 0) return undefined;
  const sortedMovements = movements.toSorted(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastMovement = sortedMovements[0];
  return lastMovement.propertyId;
};

export default function NewAnimalMovement() {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useTranslation();

  const animalIds = useMemo(
    () => (location.state?.animalIds as string[]) || [],
    [location.state?.animalIds]
  );

  const destinationPropertyId = useMemo(
    () => (location.state?.destinationPropertyId as string | undefined) || "",
    [location.state?.destinationPropertyId]
  );
  const destinationLocationId = useMemo(
    () => (location.state?.destinationLocationId as string | undefined) || "",
    [location.state?.destinationLocationId]
  );

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [allCompanyAnimals, setAllCompanyAnimals] = useState<Animal[]>([]);
  const [animalSearchValue, setAnimalSearchValue] = useState("");
  const [selectedAnimalIds, setSelectedAnimalIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadAnimals = async () => {
      if (animalIds.length === 0) {
        setAnimals([]);
        return;
      }
      try {
        const animalsPromises = animalIds.map((id) => getAnimalById(id));
        const animalsData = await Promise.all(animalsPromises);
        setAnimals(animalsData.filter((animal): animal is Animal => animal !== null));
      } catch (error) {
        console.error("Failed to load animals:", error);
        setAnimals([]);
      }
    };
    loadAnimals();
  }, [animalIds]);

  const { currentUser } = useAuth();
  const companyId = currentUser?.companyId || "";
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [allServiceProviders, setAllServiceProviders] = useState<ServiceProvider[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locationsData, employeesData, serviceProvidersData, propertiesData] =
          await Promise.all([
            getLocations(),
            getEmployees(),
            getServiceProviders(),
            getProperties(),
          ]);
        setAllLocations(locationsData);
        // Filter by companyId and active status
        setAllEmployees(
          employeesData.filter((emp) => emp.companyId === companyId && emp.status === "active")
        );
        setAllServiceProviders(
          serviceProvidersData.filter((sp) => sp.companyId === companyId && sp.status === "active")
        );
        setAllProperties(propertiesData.filter((prop) => prop.companyId === companyId));
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    fetchData();
  }, [companyId]);

  useEffect(() => {
    const loadCompanyAnimals = async () => {
      if (!companyId) return;
      try {
        const animalsData = await getAnimalsByCompanyId(companyId);
        setAllCompanyAnimals(animalsData || []);
      } catch (error) {
        console.error("Failed to load company animals:", error);
        setAllCompanyAnimals([]);
      }
    };
    void loadCompanyAnimals();
  }, [companyId]);

  type AnimalMovementFormData = MovementFormBaseData & {
    propertyId: string;
    locationId: string;
  };

  const movementForm = useMovementForm<AnimalMovementFormData>({
    initialData: {
      propertyId: destinationPropertyId || "",
      locationId: destinationLocationId || "",
    },
    onSubmit: async () => {
      // Custom submit logic handled separately
    },
    validate: (data) => {
      const newErrors: Record<string, string> = {};
      if (!data.propertyId?.trim()) {
        newErrors.propertyId = t.animals.edit.propertyRequired;
      }
      if (!data.date?.trim()) {
        newErrors.date = t.profile.errors.required(t.properties.details.movements.table.date);
      }
      if (data.employeeIds.length === 0 && data.serviceProviderIds.length === 0) {
        newErrors.responsible =
          t.properties.details.movements.errors.noResponsible ||
          "Selecione pelo menos um responsável (funcionário ou prestador de serviço)";
      }
      if (animalIds.length === 0 && selectedAnimalIds.size === 0) {
        newErrors.animals = t.animals.movement.noAnimalsSelected;
      }
      return Object.keys(newErrors).length === 0 ? true : newErrors;
    },
  });

  const {
    formData,
    setFormData,
    files,
    setFiles,
    errors,
    isSubmitting,
    alertMessage,
    handleChange,
    toggleSelection,
  } = movementForm;
  const { showAlert: showAlertMessage } = useAlert();

  useEffect(() => {
    const inferPropertyFromMovements = async () => {
      if (animals.length === 0) return;

      const firstPropertyId = await getAnimalPropertyId(animals[0].id);
      if (!firstPropertyId) return;

      const allSameResults = await Promise.all(
        animals.map(async (a) => {
          const propertyId = await getAnimalPropertyId(a.id);
          return propertyId === firstPropertyId;
        })
      );

      const allSameProperty = allSameResults.every(Boolean);

      if (allSameProperty && formData.propertyId !== firstPropertyId) {
        setFormData((prev) => ({ ...prev, propertyId: firstPropertyId }));
      }
    };

    inferPropertyFromMovements();
  }, [animals, setFormData, formData.propertyId]);

  useEffect(() => {
    if (!destinationPropertyId) return;
    if (formData.propertyId !== destinationPropertyId) {
      setFormData((prev) => ({ ...prev, propertyId: destinationPropertyId }));
    }
    // only set location if destination matches the selected property
    if (destinationLocationId && formData.locationId !== destinationLocationId) {
      setFormData((prev) => ({ ...prev, locationId: destinationLocationId }));
    }
  }, [
    destinationPropertyId,
    destinationLocationId,
    formData.propertyId,
    formData.locationId,
    setFormData,
  ]);

  const locations = useMemo(() => {
    if (!formData.propertyId) {
      return [];
    }
    return allLocations.filter((loc) => loc.propertyId === formData.propertyId);
  }, [formData.propertyId, allLocations]);

  const handleFormChange = (field: string, value: string) => {
    handleChange(field as keyof AnimalMovementFormData, value);
    if (field === "propertyId") {
      setFormData((prev) => ({ ...prev, locationId: "" }));
    }
  };

  // employees and serviceProviders are now loaded via useEffect above
  const employees = allEmployees;
  const serviceProviders = allServiceProviders;

  const sortedEmployees = useMemo(() => {
    return [...employees].toSorted((a, b) => a.name.localeCompare(b.name));
  }, [employees]);

  const sortedServiceProviders = useMemo(() => {
    return [...serviceProviders].toSorted((a, b) => a.name.localeCompare(b.name));
  }, [serviceProviders]);

  const validateForm = (): boolean => {
    const validationErrors: Record<string, string> = {};
    if (!formData.propertyId?.trim()) {
      validationErrors.propertyId = t.animals.edit.propertyRequired;
    }
    if (!formData.date?.trim()) {
      validationErrors.date = t.profile.errors.required(t.properties.details.movements.table.date);
    }
    if (formData.employeeIds.length === 0 && formData.serviceProviderIds.length === 0) {
      validationErrors.responsible =
        t.properties.details.movements.errors.noResponsible ||
        "Selecione pelo menos um responsável (funcionário ou prestador de serviço)";
    }
    if (animalIds.length === 0 && selectedAnimalIds.size === 0) {
      validationErrors.animals = t.animals.movement.noAnimalsSelected;
    }
    return Object.keys(validationErrors).length === 0;
  };

  const createMovementForAnimal = async (animal: Animal): Promise<boolean> => {
    const currentPropertyId = await getAnimalPropertyId(animal.id);
    const shouldCreateMovement =
      formData.propertyId && (formData.propertyId !== currentPropertyId || formData.locationId);

    if (!shouldCreateMovement) {
      return true;
    }

    try {
      const fileIds = files.map((_, index) => `file-${Date.now()}-${index}`);
      const movement = await addAnimalMovement({
        animalIds: [animal.id],
        propertyId: formData.propertyId,
        locationId: formData.locationId || null,
        date: formData.date,
        companyId: animal.companyId,
        employeeIds: formData.employeeIds.length > 0 ? formData.employeeIds : [],
        serviceProviderIds:
          formData.serviceProviderIds.length > 0 ? formData.serviceProviderIds : [],
        observation: formData.observation.trim() || undefined,
        fileIds: fileIds.length > 0 ? fileIds : undefined,
      });
      return !!movement;
    } catch (error) {
      console.error("Error creating movement:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (animals.length === 0) return;

    if (!validateForm()) {
      return;
    }

    let successCount = 0;
    for (const animal of animals) {
      if (await createMovementForAnimal(animal)) {
        successCount++;
      }
    }

    if (successCount > 0) {
      showAlertMessage(t.animals.movement.success(successCount, animals.length), "success");
      setTimeout(() => {
        navigate(ROUTES.ANIMALS);
      }, 1500);
    } else {
      showAlertMessage(t.animals.movement.error, "error");
    }
  };

  const handleAnimalCheckboxChange = (checked: boolean, animalId: string, animal: Animal) => {
    setSelectedAnimalIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(animalId);
      } else {
        next.delete(animalId);
      }
      return next;
    });
    setAnimals((prev) => {
      const exists = prev.some((x) => x.id === animalId);
      if (checked) {
        return exists ? prev : [...prev, animal];
      }
      return prev.filter((x) => x.id !== animalId);
    });
  };

  const selectableAnimals = useMemo(() => {
    const search = animalSearchValue.trim().toLowerCase();
    const base = allCompanyAnimals;
    if (!search) return base;
    return base.filter((a) => {
      return (
        a.code.toLowerCase().includes(search) || a.registrationNumber.toLowerCase().includes(search)
      );
    });
  }, [allCompanyAnimals, animalSearchValue]);

  const effectiveAnimals = animals;
  const isSelectingAnimalsInForm = animalIds.length === 0;

  return (
    <div className="space-y-6">
      <FixedAlert alertMessage={alertMessage} />

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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        {isSelectingAnimalsInForm ? (
          <div className="mb-6 space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t.animals.movement.selectedAnimals}
            </h2>
            <Input
              label={t.animals.searchPlaceholder}
              value={animalSearchValue}
              onChange={(e) => setAnimalSearchValue(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="max-h-64 overflow-auto rounded-md border border-gray-200 dark:border-gray-700">
              {selectableAnimals.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                  {t.animals.emptyState.title}
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {selectableAnimals.slice(0, 200).map((a) => {
                    const checked = selectedAnimalIds.has(a.id);
                    return (
                      <label
                        key={a.id}
                        className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            handleAnimalCheckboxChange(e.target.checked, a.id, a);
                          }}
                          disabled={isSubmitting}
                        />
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {a.code} - {a.registrationNumber}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
            {errors.animals && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.animals}</p>
            )}
          </div>
        ) : (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t.animals.movement.selectedAnimals}
            </h2>
            <div className="flex flex-wrap gap-2">
              {effectiveAnimals.map((animal) => (
                <span
                  key={animal.id}
                  className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  {animal.code} - {animal.registrationNumber}
                </span>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={t.animals.edit.propertyLabel}
                value={formData.propertyId}
                onChange={(e) => handleFormChange("propertyId", e.target.value)}
                error={errors.propertyId}
                disabled={isSubmitting}
                required
                options={[
                  { value: "", label: "-" },

                  ...allProperties.map((property: Property) => ({
                    value: property.id,
                    label: property.name,
                  })),
                ]}
              />

              <Input
                label={t.properties.details.movements.table.date}
                type="date"
                value={formData.date}
                onChange={(e) => handleFormChange("date", e.target.value)}
                error={errors.date}
                disabled={isSubmitting}
                required
              />
            </div>

            {formData.propertyId && (
              <Select
                label={t.animals.movement.locationLabel}
                value={formData.locationId}
                onChange={(e) => handleFormChange("locationId", e.target.value)}
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

            <ResponsibleSelectionSection
              employees={sortedEmployees}
              serviceProviders={sortedServiceProviders}
              selectedEmployeeIds={formData.employeeIds}
              selectedServiceProviderIds={formData.serviceProviderIds}
              onToggleEmployee={(id) => toggleSelection("employeeIds", id)}
              onToggleServiceProvider={(id) => toggleSelection("serviceProviderIds", id)}
              error={errors.employeeIds || errors.serviceProviderIds || errors.responsible}
              disabled={isSubmitting}
              translationKeys={{
                employeesLabel: t.employees.table.name,
                serviceProvidersLabel: t.serviceProviders.table.name,
                noEmployees:
                  t.properties.details.movements.noEmployees || "Nenhum funcionário disponível",
                noServiceProviders:
                  t.properties.details.movements.noServiceProviders ||
                  "Nenhum prestador de serviço disponível",
              }}
            />

            <ObservationField
              label={t.properties.details.movements.observation}
              value={formData.observation}
              onChange={(value) => handleFormChange("observation", value)}
              error={errors.observation}
              disabled={isSubmitting}
              placeholder={
                t.properties.details.movements.observationPlaceholder ||
                "Adicione observações sobre esta movimentação..."
              }
            />

            <FileUpload
              label={t.properties.details.movements.files}
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

          <FormActions
            onCancel={() => navigate(ROUTES.ANIMALS)}
            isSubmitting={isSubmitting}
            cancelLabel={t.profile.company.cancel}
            submitLabel={t.animals.movement.save}
            loadingLabel={t.common.loading}
          />
        </form>
      </div>
    </div>
  );
}
