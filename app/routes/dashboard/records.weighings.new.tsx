import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  Input,
  Button,
  FixedAlert,
  Table,
  type TableColumn,
  type SortDirection,
  Select,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ResponsibleSelectionSection } from "~/components/dashboard/shared";
import { ROUTES } from "~/routes.config";
import { addWeighing, getWeighingsByAnimalId } from "~/services/weighings.service";
import { getAnimalsByCompanyId, getAnimalById } from "~/services/animals.service";
import {
  getInventoryItemsByCategory,
  getInventoryItemById,
  getCurrentStock,
} from "~/services/inventory.service";
import { addInventoryMovement } from "~/services/inventory-movements.service";
import { getAnimalMovementsByAnimalId } from "~/services/animal-movements.service";
import type { WeighingFormData, Weighing, InventoryItem } from "~/types";
import { InventoryItemCategory, InventoryMovementType } from "~/types";
import { mockCompanies } from "~/mocks/companies";
import { useAlert } from "~/hooks/use-alert";
import { getUnitLabel } from "~/utils/inventory-utils";
import { useResponsibleEntities } from "~/hooks/use-responsible-entities";

export async function loader({ request }: { request: Request }) {
  const { createRouteGuard } = await import("~/utils/route-guard");
  return createRouteGuard(undefined, "add")({ request });
}

export function meta() {
  return [
    { title: "Registrar Pesagem - Boi na Nuvem" },
    {
      name: "description",
      content: "Registrar nova pesagem de animal",
    },
  ];
}

export default function NewWeighing() {
  const t = useTranslation();
  const navigate = useNavigate();
  const company = mockCompanies[0];
  const companyId = company?.id || "";

  const today = new Date().toISOString().split("T")[0];

  const [animalSearch, setAnimalSearch] = useState("");
  const [animals, setAnimals] = useState<Awaited<ReturnType<typeof getAnimalsByCompanyId>>>([]);
  const { employees, serviceProviders } = useResponsibleEntities({ companyId });

  useEffect(() => {
    const loadAnimals = async () => {
      if (!companyId) return;
      try {
        const animalsData = await getAnimalsByCompanyId(companyId);
        setAnimals(animalsData || []);
      } catch (error) {
        console.error("Failed to load animals:", error);
      }
    };
    loadAnimals();
  }, [companyId]);

  const filteredAnimals = useMemo(() => {
    if (!animalSearch.trim()) return animals;
    const searchLower = animalSearch.toLowerCase();
    return animals.filter(
      (animal) =>
        animal.code.toLowerCase().includes(searchLower) ||
        animal.registrationNumber.toLowerCase().includes(searchLower)
    );
  }, [animals, animalSearch]);

  const [formData, setFormData] = useState<{
    animalId: string;
    date: string;
    weight: string;
    employeeIds: string[];
    serviceProviderIds: string[];
    observation: string;
    appliedMedicines: Array<{ itemId: string; quantity: number }>;
  }>({
    animalId: "",
    date: today,
    weight: "",
    employeeIds: [],
    serviceProviderIds: [],
    observation: "",
    appliedMedicines: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { alertMessage, showAlert } = useAlert();
  type WeighingSessionItem = Weighing & { animalCode: string; animalRegistrationNumber: string };

  const [sessionWeighings, setSessionWeighings] = useState<WeighingSessionItem[]>([]);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionCurrentPage, setSessionCurrentPage] = useState(1);
  const [sessionSortState, setSessionSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: null, direction: null });
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>("");
  const itemsPerPage = 20;

  const formatResponsibleNames = useCallback(
    (employeeIds: string[], serviceProviderIds: string[]) => {
      const getEmployeeName = (id: string) => employees.find((e) => e.id === id)?.name;
      const getServiceProviderName = (id: string) =>
        serviceProviders.find((sp) => sp.id === id)?.name;
      const employeeNames = employeeIds.map(getEmployeeName).filter(Boolean).join(", ");
      const serviceProviderNames = serviceProviderIds
        .map(getServiceProviderName)
        .filter(Boolean)
        .join(", ");
      return [employeeNames, serviceProviderNames].filter(Boolean).join(", ");
    },
    [employees, serviceProviders]
  );

  const filteredWeighings = useMemo(() => {
    if (!sessionSearch.trim()) return sessionWeighings;
    const searchLower = sessionSearch.toLowerCase();
    return sessionWeighings.filter((w) => {
      const responsible = formatResponsibleNames(w.employeeIds, w.serviceProviderIds);

      return (
        w.animalCode.toLowerCase().includes(searchLower) ||
        w.animalRegistrationNumber.toLowerCase().includes(searchLower) ||
        w.weight.toString().includes(searchLower) ||
        responsible.toLowerCase().includes(searchLower) ||
        (w.observation?.toLowerCase().includes(searchLower) ?? false)
      );
    });
  }, [sessionWeighings, sessionSearch, formatResponsibleNames]);

  const getPreviousWeighing = useCallback((weighing: WeighingSessionItem): Weighing | null => {
    const allWeighings = getWeighingsByAnimalId(weighing.animalId);
    const sortedWeighings = allWeighings.toSorted(
      (w1, w2) => new Date(w2.date).getTime() - new Date(w1.date).getTime()
    );
    const currentIndex = sortedWeighings.findIndex((w) => w.id === weighing.id);
    if (currentIndex >= 0 && currentIndex < sortedWeighings.length - 1) {
      return sortedWeighings[currentIndex + 1];
    }
    return null;
  }, []);

  const getGmdValue = useCallback(
    (weighing: WeighingSessionItem): number => {
      const previousWeighing = getPreviousWeighing(weighing);
      if (!previousWeighing) return -999999;
      const weightDiff = weighing.weight - previousWeighing.weight;
      const daysDiff = differenceInDays(new Date(weighing.date), new Date(previousWeighing.date));
      return daysDiff > 0 ? weightDiff / daysDiff : -999999;
    },
    [getPreviousWeighing]
  );

  const getResponsibleNames = useCallback(
    (weighing: WeighingSessionItem): string =>
      formatResponsibleNames(weighing.employeeIds, weighing.serviceProviderIds),
    [formatResponsibleNames]
  );

  const getSortValue = useCallback(
    (weighing: WeighingSessionItem, column: string): string | number => {
      switch (column) {
        case "animal":
          return `${weighing.animalCode} ${weighing.animalRegistrationNumber}`;
        case "weight":
          return weighing.weight;
        case "lastWeight": {
          const previousWeighing = getPreviousWeighing(weighing);
          return previousWeighing ? previousWeighing.weight : -1;
        }
        case "diff": {
          const previousWeighing = getPreviousWeighing(weighing);
          return previousWeighing ? weighing.weight - previousWeighing.weight : -999999;
        }
        case "gmd":
          return getGmdValue(weighing);
        case "responsible":
          return getResponsibleNames(weighing);
        case "observation":
          return weighing.observation || "";
        default:
          return "";
      }
    },
    [getPreviousWeighing, getGmdValue, getResponsibleNames]
  );

  const sortedWeighings = useMemo(() => {
    if (!sessionSortState.column || !sessionSortState.direction) {
      return filteredWeighings;
    }
    const sorted = filteredWeighings.toSorted((a, b) => {
      const aValue = getSortValue(a, sessionSortState.column!);
      const bValue = getSortValue(b, sessionSortState.column!);

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sessionSortState.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return sessionSortState.direction === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
    return sorted;
  }, [filteredWeighings, sessionSortState, getSortValue]);

  const totalPages = Math.ceil(sortedWeighings.length / itemsPerPage);
  const startIndex = (sessionCurrentPage - 1) * itemsPerPage;
  const paginatedWeighings = sortedWeighings.slice(startIndex, startIndex + itemsPerPage);

  const sessionTableColumns: TableColumn<(typeof sessionWeighings)[0]>[] = useMemo(
    () => [
      {
        key: "animal",
        label: t.weighings.new.animalLabel,
        sortable: true,
        render: (_value, weighing) => (
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {weighing.animalCode}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {weighing.animalRegistrationNumber}
            </div>
          </div>
        ),
      },
      {
        key: "weight",
        label: t.weighings.new.weightLabel,
        sortable: true,
        render: (_value, weighing) => (
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {weighing.weight.toFixed(2)}
          </span>
        ),
      },
      {
        key: "lastWeight",
        label: t.weighings.new.lastWeight,
        sortable: true,
        render: (_value, weighing) => {
          const allWeighings = getWeighingsByAnimalId(weighing.animalId);
          const sortedWeighings = allWeighings.toSorted(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          const currentIndex = sortedWeighings.findIndex((w) => w.id === weighing.id);
          const previousWeighing =
            currentIndex >= 0 && currentIndex < sortedWeighings.length - 1
              ? sortedWeighings[currentIndex + 1]
              : null;

          if (!previousWeighing) {
            return <span className="text-gray-700 dark:text-gray-300">-</span>;
          }
          return (
            <span className="text-gray-700 dark:text-gray-300">
              {previousWeighing.weight.toFixed(2)}
            </span>
          );
        },
      },
      {
        key: "diff",
        label: t.weighings.new.difference,
        sortable: true,
        render: (_value, weighing) => {
          const allWeighings = getWeighingsByAnimalId(weighing.animalId);
          const sortedWeighings = allWeighings.toSorted(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          const currentIndex = sortedWeighings.findIndex((w) => w.id === weighing.id);
          const previousWeighing =
            currentIndex >= 0 && currentIndex < sortedWeighings.length - 1
              ? sortedWeighings[currentIndex + 1]
              : null;

          if (!previousWeighing) {
            return <span className="text-gray-700 dark:text-gray-300">-</span>;
          }

          const diff = weighing.weight - previousWeighing.weight;
          const diffFormatted = diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2);
          const colorClass =
            diff >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";

          return <span className={`font-medium ${colorClass}`}>{diffFormatted}</span>;
        },
      },
      {
        key: "gmd",
        label: t.weighings.new.gmd,
        sortable: true,
        render: (_value, weighing) => {
          const allWeighings = getWeighingsByAnimalId(weighing.animalId);
          const sortedWeighings = allWeighings.toSorted(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          const currentIndex = sortedWeighings.findIndex((w) => w.id === weighing.id);
          const previousWeighing =
            currentIndex >= 0 && currentIndex < sortedWeighings.length - 1
              ? sortedWeighings[currentIndex + 1]
              : null;

          if (!previousWeighing) {
            return <span className="text-gray-700 dark:text-gray-300">-</span>;
          }

          const weightDiff = weighing.weight - previousWeighing.weight;
          const daysDiff = differenceInDays(
            new Date(weighing.date),
            new Date(previousWeighing.date)
          );

          if (daysDiff === 0) {
            return <span className="text-gray-700 dark:text-gray-300">-</span>;
          }

          const gmd = (weightDiff / daysDiff).toFixed(2);
          const colorClass =
            Number.parseFloat(gmd) >= 0
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400";

          return <span className={`font-medium ${colorClass}`}>{gmd}</span>;
        },
      },
      {
        key: "responsible",
        label: t.weighings.new.responsible,
        sortable: true,
        render: (_value, weighing) => {
          const responsible = getResponsibleNames(weighing);
          return <span className="text-gray-700 dark:text-gray-300">{responsible || "-"}</span>;
        },
      },
      {
        key: "observation",
        label: t.weighings.new.observationLabel,
        sortable: true,
        render: (_value, weighing) => (
          <span className="text-gray-700 dark:text-gray-300 max-w-xs truncate block">
            {weighing.observation || "-"}
          </span>
        ),
      },
    ],
    [t, getResponsibleNames]
  );

  const availableMedicines = useMemo(() => {
    return getInventoryItemsByCategory(InventoryItemCategory.MEDICINES, companyId);
  }, [companyId]);

  const availableVaccines = useMemo(() => {
    return getInventoryItemsByCategory(InventoryItemCategory.VACCINES, companyId);
  }, [companyId]);

  const availableMedicinesVaccines = useMemo(() => {
    return [...availableMedicines, ...availableVaccines];
  }, [availableMedicines, availableVaccines]);

  const [animalLocationInfo, setAnimalLocationInfo] = useState<{
    locationId?: string;
    propertyId?: string;
  }>({
    locationId: undefined,
    propertyId: undefined,
  });

  useEffect(() => {
    const loadAnimalLocationInfo = async () => {
      if (!formData.animalId) {
        setAnimalLocationInfo({ locationId: undefined, propertyId: undefined });
        return;
      }
      const animal = await getAnimalById(formData.animalId);
      if (!animal) {
        setAnimalLocationInfo({ locationId: undefined, propertyId: undefined });
        return;
      }

      const movements = getAnimalMovementsByAnimalId(animal.id);
      if (movements.length === 0) {
        setAnimalLocationInfo({ locationId: undefined, propertyId: animal.propertyId });
        return;
      }

      const sortedMovements = movements.toSorted(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const latestMovement = sortedMovements[0];
      setAnimalLocationInfo({
        locationId: latestMovement.locationId,
        propertyId: latestMovement.propertyId || animal.propertyId,
      });
    };
    loadAnimalLocationInfo();
  }, [formData.animalId]);

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
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      if (field === "weight" && prev.appliedMedicines.length > 0) {
        const weight = Number.parseFloat(value as string) || 0;
        newData.appliedMedicines = prev.appliedMedicines.map((applied) => {
          const item = getInventoryItemById(applied.itemId);
          if (item) {
            const calculatedDosage = calculateDosage(item, weight);
            return {
              ...applied,
              quantity: calculatedDosage > 0 ? calculatedDosage : applied.quantity,
            };
          }
          return applied;
        });
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
  };

  const addMedicine = (itemId: string) => {
    const item = getInventoryItemById(itemId);
    if (!item) return;

    if (formData.appliedMedicines.some((m) => m.itemId === itemId)) {
      setSelectedMedicineId("");
      return;
    }

    const weight = Number.parseFloat(formData.weight) || 0;
    const calculatedDosage = calculateDosage(item, weight);
    const quantity = calculatedDosage > 0 ? calculatedDosage : 1;

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
    if (!formData.animalId) {
      newErrors.animalId = t.weighings.new.errors.animalRequired;
    }
    if (!formData.date) {
      newErrors.date = t.weighings.new.errors.dateRequired;
    }
    if (formData.weight) {
      const weightNum = Number.parseFloat(formData.weight);
      if (Number.isNaN(weightNum) || weightNum <= 0) {
        newErrors.weight = t.weighings.new.errors.weightInvalid;
      }
    } else {
      newErrors.weight = t.weighings.new.errors.weightRequired;
    }
  };

  const validateMedicineStock = (newErrors: Record<string, string>): void => {
    if (formData.appliedMedicines.length === 0 || !animalLocationInfo.propertyId) return;

    for (const applied of formData.appliedMedicines) {
      const item = getInventoryItemById(applied.itemId);
      if (item) {
        const currentStock = getCurrentStock(applied.itemId, animalLocationInfo.propertyId);
        if (currentStock < applied.quantity) {
          newErrors[`medicine_${applied.itemId}`] = t.weighings.new.insufficientStock;
        }
      }
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    validateBasicFields(newErrors);
    validateMedicineStock(newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const weight = Number.parseFloat(formData.weight);
      const appliedMedicinesData = formData.appliedMedicines.map((applied) => {
        const item = getInventoryItemById(applied.itemId);
        const calculatedDosage = item ? calculateDosage(item, weight) : applied.quantity;
        return {
          itemId: applied.itemId,
          quantity: applied.quantity,
          calculatedDosage,
        };
      });

      const weighingData: WeighingFormData = {
        animalId: formData.animalId,
        date: formData.date,
        weight,
        employeeIds: formData.employeeIds,
        serviceProviderIds: formData.serviceProviderIds,
        observation: formData.observation || undefined,
        appliedMedicines: appliedMedicinesData.length > 0 ? appliedMedicinesData : undefined,
        companyId,
      };
      const newWeighing = addWeighing(weighingData);

      if (formData.appliedMedicines.length > 0 && animalLocationInfo.propertyId) {
        for (const applied of formData.appliedMedicines) {
          const item = getInventoryItemById(applied.itemId);
          if (item) {
            addInventoryMovement({
              itemId: applied.itemId,
              type: InventoryMovementType.CONSUMPTION,
              quantity: applied.quantity,
              date: formData.date,
              propertyId: animalLocationInfo.propertyId,
              locationId: animalLocationInfo.locationId,
              companyId,
              description: t.weighings.new.appliedDuringWeighing,
              unitPrice: item.unitPrice,
            });
          }
        }
      }

      const animal = await getAnimalById(formData.animalId);
      if (animal) {
        setSessionWeighings((prev) => [
          ...prev,
          {
            ...newWeighing,
            animalCode: animal.code,
            animalRegistrationNumber: animal.registrationNumber,
          },
        ]);
      }

      showAlert(t.weighings.new.success, "success");

      setFormData((prev) => ({
        animalId: "",
        date: today,
        weight: "",
        employeeIds: prev.employeeIds,
        serviceProviderIds: prev.serviceProviderIds,
        observation: "",
        appliedMedicines: [],
      }));
      setAnimalSearch("");
      setSelectedMedicineId("");
      setErrors({});
    } catch (error) {
      console.error("Error adding weighing:", error);
      showAlert(t.weighings.new.error, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <FixedAlert alertMessage={alertMessage} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.weighings.new.title}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t.weighings.new.description}
          </p>
        </div>
        <div className="flex gap-3">
          {sessionWeighings.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowSessionModal(true)}
              disabled={isSubmitting}
            >
              {t.weighings.new.viewSession} ({sessionWeighings.length})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.ANIMALS)}
            disabled={isSubmitting}
          >
            {t.common.back}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {t.weighings.new.weighingInfoTitle}
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.weighings.new.animalLabel}
                </label>
                <Input
                  type="text"
                  value={animalSearch}
                  onChange={(e) => setAnimalSearch(e.target.value)}
                  placeholder={t.weighings.new.searchPlaceholder}
                  disabled={isSubmitting}
                />
                <div className="mt-2 border border-gray-300 dark:border-gray-600 rounded-md max-h-48 overflow-y-auto">
                  {filteredAnimals.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 p-4">
                      {t.weighings.new.noAnimals}
                    </p>
                  ) : (
                    <div className="space-y-1 p-2">
                      {filteredAnimals.map((animal) => (
                        <label
                          key={animal.id}
                          className={`flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded ${
                            formData.animalId === animal.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                          }`}
                          aria-label={`Select animal ${animal.code || animal.id}`}
                        >
                          <input
                            type="radio"
                            name="animalId"
                            checked={formData.animalId === animal.id}
                            onChange={() => handleChange("animalId", animal.id)}
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
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {errors.animalId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.animalId}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t.weighings.new.dateLabel}
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  error={errors.date}
                  disabled={isSubmitting}
                  required
                />
                <Input
                  label={t.weighings.new.weightLabel}
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) => handleChange("weight", e.target.value)}
                  error={errors.weight}
                  disabled={isSubmitting}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {formData.animalId && formData.weight && Number.parseFloat(formData.weight) > 0 && (
              <div className="border-t border-b border-gray-200 dark:border-gray-700 pt-4 pb-4 mt-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {t.weighings.new.medicinesVaccinesTitle}
                </h2>

                {availableMedicinesVaccines.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t.weighings.new.noMedicinesVaccinesAvailable ||
                      "Nenhum medicamento ou vacina disponível"}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {formData.appliedMedicines.length > 0 && (
                      <div className="space-y-3">
                        {formData.appliedMedicines.map((applied) => {
                          const item = getInventoryItemById(applied.itemId);
                          if (!item) return null;
                          const weight = Number.parseFloat(formData.weight) || 0;
                          const calculatedDosage = calculateDosage(item, weight);
                          const currentStock = animalLocationInfo.propertyId
                            ? getCurrentStock(applied.itemId, animalLocationInfo.propertyId)
                            : 0;
                          const hasError = errors[`medicine_${applied.itemId}`];

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
                                    <div>
                                      <span className="text-gray-600 dark:text-gray-400">
                                        {t.weighings.new.calculatedDosage}:
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
                                    <div>
                                      <label className="block text-gray-600 dark:text-gray-400 mb-1">
                                        {t.weighings.new.quantityToConsume ||
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
                                        {t.weighings.new.currentStock}:
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
                                  {t.weighings.new.removeMedicineVaccine}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div>
                      <Select
                        label={t.weighings.new.selectMedicineVaccine}
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
                  </div>
                )}
              </div>
            )}

            <ResponsibleSelectionSection
              employees={employees}
              serviceProviders={serviceProviders}
              selectedEmployeeIds={formData.employeeIds}
              selectedServiceProviderIds={formData.serviceProviderIds}
              onToggleEmployee={(id) => toggleSelection("employeeIds", id)}
              onToggleServiceProvider={(id) => toggleSelection("serviceProviderIds", id)}
              disabled={isSubmitting}
              translationKeys={{
                employeesLabel: t.weighings.new.employeesLabel,
                serviceProvidersLabel: t.weighings.new.serviceProvidersLabel,
                noEmployees: t.weighings.new.noEmployees,
                noServiceProviders: t.weighings.new.noServiceProviders,
              }}
              className="mt-4"
            />

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.weighings.new.observationLabel}
              </label>
              <textarea
                value={formData.observation}
                onChange={(e) => handleChange("observation", e.target.value)}
                disabled={isSubmitting}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-200"
                placeholder={t.weighings.new.observationPlaceholder}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.ANIMALS)}
              disabled={isSubmitting}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? t.common.loading : t.weighings.new.addButton}
            </Button>
          </div>
        </form>
      </div>

      {showSessionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-4 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-black/5 dark:bg-black/10 backdrop-blur-sm cursor-pointer"
              onClick={() => {
                setShowSessionModal(false);
                setSessionSearch("");
                setSessionCurrentPage(1);
                setSessionSortState({ column: null, direction: null });
              }}
              aria-hidden="true"
            />

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full border border-gray-200 dark:border-gray-700 relative z-10">
              <div className="px-4 pt-5 pb-4 sm:p-6">
                <div className="sm:flex sm:items-start mb-4">
                  <div className="mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-blue-600 dark:text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                      {(() => {
                        if (sessionWeighings.length === 0) {
                          return t.weighings.new.sessionTitle;
                        }
                        const dates = sessionWeighings.map((w) => new Date(w.date).getTime());
                        const minDate = new Date(Math.min(...dates));
                        const maxDate = new Date(Math.max(...dates));
                        const minDateStr = format(minDate, "dd/MM/yyyy", { locale: ptBR });
                        const maxDateStr = format(maxDate, "dd/MM/yyyy", { locale: ptBR });
                        const dateDisplay =
                          minDateStr === maxDateStr ? minDateStr : `${minDateStr} - ${maxDateStr}`;
                        return `${t.weighings.new.sessionTitle} - ${dateDisplay}`;
                      })()}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {sessionWeighings.length}{" "}
                      {sessionWeighings.length === 1
                        ? t.weighings.new.weighingRegistered
                        : t.weighings.new.weighingsRegistered}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Table
                    columns={sessionTableColumns}
                    data={paginatedWeighings}
                    search={{
                      placeholder: t.weighings.new.sessionSearchPlaceholder,
                      value: sessionSearch,
                      onChange: (value) => {
                        setSessionSearch(value);
                        setSessionCurrentPage(1);
                      },
                    }}
                    pagination={{
                      currentPage: sessionCurrentPage,
                      totalPages: totalPages || 1,
                      onPageChange: (page) => setSessionCurrentPage(page),
                      showInfo: true,
                    }}
                    sortState={sessionSortState}
                    onSort={(column, direction) => {
                      setSessionSortState({ column, direction });
                      setSessionCurrentPage(1);
                    }}
                    emptyState={{
                      title: t.weighings.new.noWeighingsFound,
                      description: sessionSearch
                        ? t.weighings.new.adjustSearchTerms
                        : t.weighings.new.noWeighingsInSession,
                    }}
                    slim={true}
                  />
                </div>
              </div>
              <div className="px-4 py-3 sm:px-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSessionModal(false);
                      setSessionSearch("");
                      setSessionCurrentPage(1);
                      setSessionSortState({ column: null, direction: null });
                    }}
                  >
                    {t.common.cancel}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
