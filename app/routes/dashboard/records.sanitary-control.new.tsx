import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Input, Button, FixedAlert, Select } from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ResponsibleSelectionSection } from "~/components/dashboard/shared";
import { ROUTES } from "~/routes.config";
import { addSanitaryControl } from "~/services/sanitary-controls.service";
import { getAnimalsByCompanyId, getAnimalById } from "~/services/animals.service";
import { getWeighingsByAnimalId } from "~/services/weighings.service";
import {
  getInventoryItemsByCategory,
  getInventoryItemById,
  getCurrentStock,
} from "~/services/inventory.service";
import { addInventoryMovement } from "~/services/inventory-movements.service";
import { getAnimalMovementsByAnimalId } from "~/services/animal-movements.service";
import type { InventoryItem, Employee, ServiceProvider } from "~/types";
import { InventoryItemCategory, InventoryMovementType } from "~/types";
import { mockCompanies } from "~/mocks/companies";
import { getEmployees } from "~/services/employees.service";
import { getServiceProviders } from "~/services/service-providers.service";
import { getUnitLabel } from "~/utils/inventory-utils";
import { useAlert } from "~/hooks/use-alert";

export function meta() {
  return [
    { title: "Registrar Controle Sanitário - Boi na Nuvem" },
    {
      name: "description",
      content: "Registrar controle sanitário para animal",
    },
  ];
}

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "add")({ request });
}

export default function NewSanitaryControl() {
  const t = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const company = mockCompanies[0];
  const companyId = company?.id || "";

  const today = new Date().toISOString().split("T")[0];

  const preSelectedAnimalIds = useMemo(() => {
    const state = location.state as { animalId?: string; animalIds?: string[] } | null;
    if (state?.animalIds) return state.animalIds;
    if (state?.animalId) return [state.animalId];
    return [];
  }, [location.state]);

  const [animalSearch, setAnimalSearch] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);

  const animals = useMemo(() => getAnimalsByCompanyId(companyId), [companyId]);

  useEffect(() => {
    const fetchData = async () => {
      if (companyId) {
        try {
          const [employeesData, serviceProvidersData] = await Promise.all([
            getEmployees(),
            getServiceProviders(),
          ]);
          setEmployees(employeesData.filter((e) => e.companyId === companyId));
          setServiceProviders(serviceProvidersData.filter((sp) => sp.companyId === companyId));
        } catch (error) {
          console.error("Failed to load employees or service providers:", error);
        }
      }
    };
    fetchData();
  }, [companyId]);

  const filteredAnimals = useMemo(() => {
    let filtered = animals;

    if (animalSearch.trim()) {
      const searchLower = animalSearch.toLowerCase();
      filtered = animals.filter(
        (animal) =>
          animal.code.toLowerCase().includes(searchLower) ||
          animal.registrationNumber.toLowerCase().includes(searchLower)
      );
    }

    if (preSelectedAnimalIds.length > 0) {
      filtered = [...filtered].sort((a, b) => {
        const aIsSelected = preSelectedAnimalIds.includes(a.id);
        const bIsSelected = preSelectedAnimalIds.includes(b.id);

        if (aIsSelected && !bIsSelected) return -1;
        if (!aIsSelected && bIsSelected) return 1;
        return 0;
      });
    }

    return filtered;
  }, [animals, animalSearch, preSelectedAnimalIds]);

  const [formData, setFormData] = useState<{
    animalIds: string[];
    date: string;
    employeeIds: string[];
    serviceProviderIds: string[];
    observation: string;
    appliedMedicines: Array<{ itemId: string; quantity: number }>;
  }>({
    animalIds: preSelectedAnimalIds,
    date: today,
    employeeIds: [],
    serviceProviderIds: [],
    observation: "",
    appliedMedicines: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { alertMessage, showAlert } = useAlert();
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>("");

  const availableMedicinesVaccines = useMemo(() => {
    const medicines = getInventoryItemsByCategory(InventoryItemCategory.MEDICINES, companyId);
    const vaccines = getInventoryItemsByCategory(InventoryItemCategory.VACCINES, companyId);
    return [...medicines, ...vaccines];
  }, [companyId]);

  const getAnimalLocationInfo = (animalId: string): { locationId: string; propertyId: string } => {
    const animal = getAnimalById(animalId);
    if (!animal) return { locationId: "", propertyId: "" };

    const movements = getAnimalMovementsByAnimalId(animalId);
    if (movements.length === 0) {
      return {
        locationId:
          animal.locationId && typeof animal.locationId === "string" ? animal.locationId : "",
        propertyId:
          animal.propertyId && typeof animal.propertyId === "string" ? animal.propertyId : "",
      };
    }

    const sortedMovements = [...movements].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const latestMovement = sortedMovements[0];
    return {
      locationId:
        latestMovement.locationId && typeof latestMovement.locationId === "string"
          ? latestMovement.locationId
          : "",
      propertyId: latestMovement.propertyId || animal.propertyId || "",
    };
  };

  const getAnimalLatestWeight = (animalId: string): number => {
    const weighings = getWeighingsByAnimalId(animalId);
    if (weighings.length === 0) return 0;
    const sortedWeighings = [...weighings].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sortedWeighings[0]?.weight || 0;
  };

  const calculateDosage = (item: InventoryItem, weight: number): number => {
    if (!item.usageAmount || !item.usageBasis) return 0;
    if (item.usageBasis === "per_kg") {
      return item.usageAmount * weight;
    }
    if (item.usageBasis === "per_animal") {
      return item.usageAmount;
    }
    return 0;
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

  const toggleAnimalSelection = (animalId: string) => {
    setFormData((prev) => {
      const currentIds = prev.animalIds;
      const newIds = currentIds.includes(animalId)
        ? currentIds.filter((id) => id !== animalId)
        : [...currentIds, animalId];
      return { ...prev, animalIds: newIds };
    });
  };

  const toggleSelection = (field: "employeeIds" | "serviceProviderIds", id: string) => {
    setFormData((prev) => {
      const currentIds = prev[field];
      const newIds = currentIds.includes(id)
        ? currentIds.filter((itemId) => itemId !== id)
        : [...currentIds, id];
      return { ...prev, [field]: newIds };
    });
  };

  const addMedicine = (itemId: string) => {
    const item = getInventoryItemById(itemId);
    if (!item) return;

    if (formData.appliedMedicines.some((m) => m.itemId === itemId)) {
      setSelectedMedicineId("");
      return;
    }

    let quantity = 1;
    if (formData.animalIds.length === 1) {
      const animalWeight = getAnimalLatestWeight(formData.animalIds[0]);
      const calculatedDosage = calculateDosage(item, animalWeight);
      quantity = calculatedDosage > 0 ? calculatedDosage : 1;
    }

    setFormData((prev) => ({
      ...prev,
      appliedMedicines: [...prev.appliedMedicines, { itemId, quantity }],
    }));
    setSelectedMedicineId("");
  };

  const removeMedicine = (itemId: string) => {
    setFormData((prev) => ({
      ...prev,
      appliedMedicines: prev.appliedMedicines.filter((m) => m.itemId !== itemId),
    }));
  };

  const updateMedicineQuantity = (itemId: string, quantity: number) => {
    setFormData((prev) => ({
      ...prev,
      appliedMedicines: prev.appliedMedicines.map((m) =>
        m.itemId === itemId ? { ...m, quantity } : m
      ),
    }));
  };

  const validateBasicFields = (newErrors: Record<string, string>): void => {
    if (formData.animalIds.length === 0) {
      newErrors.animalIds = t.medicineAdministrations.new.errors?.animalRequired;
    }
    if (!formData.date) {
      newErrors.date = t.medicineAdministrations.new.errors?.dateRequired;
    }
    if (formData.appliedMedicines.length === 0) {
      newErrors.appliedMedicines =
        t.medicineAdministrations.new.errors?.atLeastOneMedicine ||
        "Pelo menos um medicamento ou vacina deve ser aplicado";
    }
  };

  const validateMedicineStockForAnimal = (
    animalId: string,
    appliedMedicines: Array<{ itemId: string; quantity: number }>,
    newErrors: Record<string, string>
  ): void => {
    const locationInfo = getAnimalLocationInfo(animalId);
    if (!locationInfo.propertyId) return;

    for (const applied of appliedMedicines) {
      const item = getInventoryItemById(applied.itemId);
      if (item) {
        const currentStock = getCurrentStock(applied.itemId, locationInfo.propertyId);
        if (currentStock < applied.quantity) {
          newErrors[`medicine_${applied.itemId}_${animalId}`] =
            t.medicineAdministrations.new.insufficientStock;
        }
      }
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    validateBasicFields(newErrors);

    if (formData.appliedMedicines.length > 0 && formData.animalIds.length > 0) {
      for (const animalId of formData.animalIds) {
        validateMedicineStockForAnimal(animalId, formData.appliedMedicines, newErrors);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const processAppliedMedicines = (animalWeight: number) => {
    return formData.appliedMedicines.map((applied) => {
      const item = getInventoryItemById(applied.itemId);
      const calculatedDosage = item ? calculateDosage(item, animalWeight) : applied.quantity;
      return {
        itemId: applied.itemId,
        quantity: applied.quantity,
        calculatedDosage,
      };
    });
  };

  const recordInventoryMovements = (animalId: string) => {
    const locationInfo = getAnimalLocationInfo(animalId);
    if (!formData.appliedMedicines.length || !locationInfo.propertyId) {
      return;
    }

    for (const applied of formData.appliedMedicines) {
      const item = getInventoryItemById(applied.itemId);
      if (!item) continue;

      addInventoryMovement({
        itemId: applied.itemId,
        type: InventoryMovementType.CONSUMPTION,
        quantity: applied.quantity,
        date: formData.date,
        propertyId: locationInfo.propertyId,
        locationId: locationInfo.locationId ?? undefined,
        companyId,
        description: t.medicineAdministrations.new.appliedDescription,
        unitPrice: item.unitPrice,
      });
    }
  };

  const processAnimalAdministration = (animalId: string) => {
    const animalWeight = getAnimalLatestWeight(animalId);
    const appliedMedicinesData = processAppliedMedicines(animalWeight);

    const administrationData = {
      animalId,
      date: formData.date,
      appliedMedicines: appliedMedicinesData,
      employeeIds: formData.employeeIds,
      serviceProviderIds: formData.serviceProviderIds,
      observation: formData.observation || undefined,
      companyId,
    };
    addSanitaryControl(administrationData);
    recordInventoryMovements(animalId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      for (const animalId of formData.animalIds) {
        processAnimalAdministration(animalId);
      }

      const animalCount = formData.animalIds.length;
      const successMessage =
        animalCount === 1
          ? t.medicineAdministrations.new.success
          : `${animalCount} ${t.medicineAdministrations.new.successMultiple}`;

      showAlert(successMessage, "success");

      setFormData((prev) => ({
        animalIds: preSelectedAnimalIds,
        date: today,
        employeeIds: prev.employeeIds,
        serviceProviderIds: prev.serviceProviderIds,
        observation: "",
        appliedMedicines: [],
      }));
      setAnimalSearch("");
      setSelectedMedicineId("");
      setErrors({});
    } catch (error) {
      console.error("Error adding medicine administration:", error);
      showAlert(t.medicineAdministrations.new.error, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <FixedAlert alertMessage={alertMessage} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t.medicineAdministrations.new.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.medicineAdministrations.new.description ||
              "Registre a administração de medicamentos ou vacinas para um ou mais animais"}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(ROUTES.ANIMALS)}>
          {t.common.back}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.medicineAdministrations.new.animalsLabel}
                {formData.animalIds.length > 0 && (
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    ({formData.animalIds.length}{" "}
                    {formData.animalIds.length === 1 ? "selecionado" : "selecionados"})
                  </span>
                )}
              </label>
              <div className="space-y-2">
                <Input
                  type="text"
                  value={animalSearch}
                  onChange={(e) => setAnimalSearch(e.target.value)}
                  placeholder={t.medicineAdministrations.new.searchAnimal}
                  disabled={isSubmitting}
                />
                <div className="border border-gray-300 dark:border-gray-600 rounded-md max-h-48 overflow-y-auto">
                  {filteredAnimals.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 p-4">
                      {"Nenhum animal disponível"}
                    </p>
                  ) : (
                    <div className="space-y-1 p-2">
                      {filteredAnimals.map((animal) => {
                        const animalWeight = getAnimalLatestWeight(animal.id);
                        return (
                          <label
                            key={animal.id}
                            className={`flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded ${
                              formData.animalIds.includes(animal.id)
                                ? "bg-blue-50 dark:bg-blue-900/20"
                                : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.animalIds.includes(animal.id)}
                              onChange={() => toggleAnimalSelection(animal.id)}
                              disabled={isSubmitting}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {animal.code}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                {animal.registrationNumber}
                              </span>
                              {animalWeight > 0 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                  ({animalWeight.toFixed(2)} kg)
                                </span>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              {errors.animalIds && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.animalIds}</p>
              )}
              {formData.animalIds.length > 0 && (
                <div className="mt-2 space-y-1">
                  {formData.animalIds.map((animalId) => {
                    const animal = getAnimalById(animalId);
                    const weight = getAnimalLatestWeight(animalId);
                    if (!animal) return null;
                    return (
                      <div key={animalId} className="text-xs text-gray-600 dark:text-gray-400">
                        {animal.code}:{" "}
                        {weight > 0
                          ? `${weight.toFixed(2)} kg`
                          : t.medicineAdministrations.new.noWeightRecorded}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t.medicineAdministrations.new.dateLabel}
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                error={errors.date}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          {formData.animalIds.length > 0 && (
            <div className="border-t border-b border-gray-200 dark:border-gray-700 pt-4 pb-4 mt-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {t.medicineAdministrations.new.medicinesVaccinesTitle}
              </h2>

              {availableMedicinesVaccines.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.medicineAdministrations.new.noMedicinesVaccinesAvailable ||
                    "Nenhum medicamento ou vacina disponível"}
                </p>
              ) : (
                <div className="space-y-4">
                  {formData.appliedMedicines.length > 0 && (
                    <div className="space-y-3">
                      {formData.appliedMedicines.map((applied) => {
                        const item = getInventoryItemById(applied.itemId);
                        if (!item) return null;

                        const avgWeight =
                          formData.animalIds.length > 0
                            ? formData.animalIds.reduce(
                                (sum, id) => sum + getAnimalLatestWeight(id),
                                0
                              ) / formData.animalIds.length
                            : 0;
                        const calculatedDosage = calculateDosage(item, avgWeight);

                        const stocks = formData.animalIds
                          .map((animalId) => {
                            const locationInfo = getAnimalLocationInfo(animalId);
                            return locationInfo.propertyId
                              ? getCurrentStock(applied.itemId, locationInfo.propertyId)
                              : 0;
                          })
                          .filter((stock) => stock >= 0);
                        const currentStock = stocks.length > 0 ? Math.min(...stocks) : 0;

                        const hasError =
                          formData.animalIds.some(
                            (animalId) => errors[`medicine_${applied.itemId}_${animalId}`]
                          ) || errors[`medicine_${applied.itemId}`];

                        return (
                          <div
                            key={applied.itemId}
                            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                    {item.name}
                                  </h3>
                                  <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                    {item.category === InventoryItemCategory.MEDICINES
                                      ? t.inventory.categories.medicines
                                      : t.inventory.categories.vaccines}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                  {formData.animalIds.length === 1 ? (
                                    <div>
                                      <span className="text-gray-600 dark:text-gray-400">
                                        {t.medicineAdministrations.new.calculatedDosage ||
                                          "Dosagem Calculada"}
                                        :
                                      </span>
                                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                                        {calculatedDosage.toFixed(2)}{" "}
                                        {getUnitLabel(
                                          item.usageUnit || item.unit,
                                          calculatedDosage,
                                          t
                                        )}
                                      </span>
                                    </div>
                                  ) : (
                                    <div>
                                      <span className="text-gray-600 dark:text-gray-400">
                                        {t.medicineAdministrations.new.dosagePerAnimal ||
                                          "Dosagem será calculada por animal"}
                                        :
                                      </span>
                                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                                        {t.medicineAdministrations.new.basedOnWeight ||
                                          "Baseado no peso de cada animal"}
                                      </span>
                                    </div>
                                  )}
                                  <div>
                                    <label className="block text-gray-600 dark:text-gray-400 mb-1">
                                      {t.medicineAdministrations.new.quantityToConsume ||
                                        "Quantidade a Consumir"}
                                      :
                                    </label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={applied.quantity.toString()}
                                      onChange={(e) => {
                                        const qty = Number.parseFloat(e.target.value) || 0;
                                        updateMedicineQuantity(applied.itemId, qty);
                                      }}
                                      disabled={isSubmitting}
                                      className="w-full"
                                    />
                                  </div>
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {t.medicineAdministrations.new.currentStock ||
                                        "Estoque Atual"}
                                      :
                                    </span>
                                    <span
                                      className={`ml-2 font-medium ${
                                        currentStock < applied.quantity
                                          ? "text-red-600 dark:text-red-400"
                                          : "text-gray-900 dark:text-gray-100"
                                      }`}
                                    >
                                      {currentStock.toFixed(2)}{" "}
                                      {getUnitLabel(item.unit, currentStock, t)}
                                    </span>
                                  </div>
                                </div>
                                {hasError && (
                                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                    {hasError}
                                  </p>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => removeMedicine(applied.itemId)}
                                disabled={isSubmitting}
                                className="ml-4"
                              >
                                {t.medicineAdministrations.new.removeMedicineVaccine}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div>
                    <Select
                      label={
                        t.medicineAdministrations.new.selectMedicineVaccine ||
                        "Selecionar Medicamento/Vacina"
                      }
                      value={selectedMedicineId}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        setSelectedMedicineId(selectedId);
                        if (selectedId) {
                          addMedicine(selectedId);
                        }
                      }}
                      options={availableMedicinesVaccines
                        .filter(
                          (item) => !formData.appliedMedicines.some((m) => m.itemId === item.id)
                        )
                        .map((item) => ({
                          value: item.id,
                          label: `${item.name} (${item.category === InventoryItemCategory.MEDICINES ? t.inventory.categories.medicines : t.inventory.categories.vaccines})`,
                        }))}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.appliedMedicines && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.appliedMedicines}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <ResponsibleSelectionSection
              employees={employees}
              serviceProviders={serviceProviders}
              selectedEmployeeIds={formData.employeeIds}
              selectedServiceProviderIds={formData.serviceProviderIds}
              onToggleEmployee={(id) => toggleSelection("employeeIds", id)}
              onToggleServiceProvider={(id) => toggleSelection("serviceProviderIds", id)}
              disabled={isSubmitting}
              translationKeys={{
                employeesLabel: t.medicineAdministrations.new.employeesLabel,
                serviceProvidersLabel: t.medicineAdministrations.new.serviceProvidersLabel,
                noEmployees: t.medicineAdministrations.new.noEmployees,
                noServiceProviders:
                  t.medicineAdministrations.new.noServiceProviders ||
                  "Nenhum prestador de serviço cadastrado",
              }}
            />
          </div>

          <div className="mt-4">
            <Input
              label={t.medicineAdministrations.new.observationLabel}
              type="textarea"
              value={formData.observation}
              onChange={(e) => handleChange("observation", e.target.value)}
              disabled={isSubmitting}
              placeholder={t.medicineAdministrations.new.observationPlaceholder}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(ROUTES.ANIMALS)}
            disabled={isSubmitting}
          >
            {t.common.cancel}
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {t.medicineAdministrations.new.addButton}
          </Button>
        </div>
      </form>
    </div>
  );
}
