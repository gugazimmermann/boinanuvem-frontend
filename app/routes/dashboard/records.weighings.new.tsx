import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  Input,
  Button,
  Alert,
  Table,
  type TableColumn,
  type SortDirection,
  Select,
} from "~/components/ui";
import { useTranslation } from "~/i18n";
import { ROUTES } from "~/routes.config";
import { addWeighing, getWeighingsByAnimalId } from "~/services/weighings.service";
import { getAnimalsByCompanyId, getAnimalById } from "~/services/animals.service";
import { getEmployeeById } from "~/services/employees.service";
import { getServiceProviderById } from "~/services/service-providers.service";
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
import { mockEmployees } from "~/mocks/employees";
import { mockServiceProviders } from "~/mocks/service-providers";

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

  const animals = useMemo(() => getAnimalsByCompanyId(companyId), [companyId]);
  const employees = useMemo(
    () => mockEmployees.filter((e) => e.companyId === companyId),
    [companyId]
  );
  const serviceProviders = useMemo(
    () => mockServiceProviders.filter((sp) => sp.companyId === companyId),
    [companyId]
  );

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
  const [alertMessage, setAlertMessage] = useState<{
    title: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);
  const [sessionWeighings, setSessionWeighings] = useState<
    Array<Weighing & { animalCode: string; animalRegistrationNumber: string }>
  >([]);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionCurrentPage, setSessionCurrentPage] = useState(1);
  const [sessionSortState, setSessionSortState] = useState<{
    column: string | null;
    direction: SortDirection;
  }>({ column: null, direction: null });
  const [selectedMedicineId, setSelectedMedicineId] = useState<string>("");
  const itemsPerPage = 20;

  const filteredWeighings = useMemo(() => {
    if (!sessionSearch.trim()) return sessionWeighings;
    const searchLower = sessionSearch.toLowerCase();
    return sessionWeighings.filter((w) => {
      const employeeNames = w.employeeIds
        .map((id) => getEmployeeById(id)?.name)
        .filter(Boolean)
        .join(", ");
      const serviceProviderNames = w.serviceProviderIds
        .map((id) => getServiceProviderById(id)?.name)
        .filter(Boolean)
        .join(", ");
      const responsible = [employeeNames, serviceProviderNames].filter(Boolean).join(", ");

      return (
        w.animalCode.toLowerCase().includes(searchLower) ||
        w.animalRegistrationNumber.toLowerCase().includes(searchLower) ||
        w.weight.toString().includes(searchLower) ||
        responsible.toLowerCase().includes(searchLower) ||
        (w.observation && w.observation.toLowerCase().includes(searchLower))
      );
    });
  }, [sessionWeighings, sessionSearch]);

  const sortedWeighings = useMemo(() => {
    if (!sessionSortState.column || !sessionSortState.direction) {
      return filteredWeighings;
    }
    const sorted = [...filteredWeighings];
    sorted.sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      switch (sessionSortState.column) {
        case "animal":
          aValue = `${a.animalCode} ${a.animalRegistrationNumber}`;
          bValue = `${b.animalCode} ${b.animalRegistrationNumber}`;
          break;
        case "weight":
          aValue = a.weight;
          bValue = b.weight;
          break;
        case "lastWeight": {
          const aAllWeighings = getWeighingsByAnimalId(a.animalId);
          const aSortedWeighings = [...aAllWeighings].sort(
            (w1, w2) => new Date(w2.date).getTime() - new Date(w1.date).getTime()
          );
          const aCurrentIndex = aSortedWeighings.findIndex((w) => w.id === a.id);
          const aPreviousWeighing =
            aCurrentIndex >= 0 && aCurrentIndex < aSortedWeighings.length - 1
              ? aSortedWeighings[aCurrentIndex + 1]
              : null;
          aValue = aPreviousWeighing ? aPreviousWeighing.weight : -1;

          const bAllWeighings = getWeighingsByAnimalId(b.animalId);
          const bSortedWeighings = [...bAllWeighings].sort(
            (w1, w2) => new Date(w2.date).getTime() - new Date(w1.date).getTime()
          );
          const bCurrentIndex = bSortedWeighings.findIndex((w) => w.id === b.id);
          const bPreviousWeighing =
            bCurrentIndex >= 0 && bCurrentIndex < bSortedWeighings.length - 1
              ? bSortedWeighings[bCurrentIndex + 1]
              : null;
          bValue = bPreviousWeighing ? bPreviousWeighing.weight : -1;
          break;
        }
        case "diff": {
          const aAllWeighingsDiff = getWeighingsByAnimalId(a.animalId);
          const aSortedWeighingsDiff = [...aAllWeighingsDiff].sort(
            (w1, w2) => new Date(w2.date).getTime() - new Date(w1.date).getTime()
          );
          const aCurrentIndexDiff = aSortedWeighingsDiff.findIndex((w) => w.id === a.id);
          const aPreviousWeighingDiff =
            aCurrentIndexDiff >= 0 && aCurrentIndexDiff < aSortedWeighingsDiff.length - 1
              ? aSortedWeighingsDiff[aCurrentIndexDiff + 1]
              : null;
          aValue = aPreviousWeighingDiff ? a.weight - aPreviousWeighingDiff.weight : -999999;

          const bAllWeighingsDiff2 = getWeighingsByAnimalId(b.animalId);
          const bSortedWeighingsDiff = [...bAllWeighingsDiff2].sort(
            (w1, w2) => new Date(w2.date).getTime() - new Date(w1.date).getTime()
          );
          const bCurrentIndexDiff = bSortedWeighingsDiff.findIndex((w) => w.id === b.id);
          const bPreviousWeighingDiff =
            bCurrentIndexDiff >= 0 && bCurrentIndexDiff < bSortedWeighingsDiff.length - 1
              ? bSortedWeighingsDiff[bCurrentIndexDiff + 1]
              : null;
          bValue = bPreviousWeighingDiff ? b.weight - bPreviousWeighingDiff.weight : -999999;
          break;
        }
        case "gmd": {
          const aAllWeighingsGmd = getWeighingsByAnimalId(a.animalId);
          const aSortedWeighingsGmd = [...aAllWeighingsGmd].sort(
            (w1, w2) => new Date(w2.date).getTime() - new Date(w1.date).getTime()
          );
          const aCurrentIndexGmd = aSortedWeighingsGmd.findIndex((w) => w.id === a.id);
          const aPreviousWeighingGmd =
            aCurrentIndexGmd >= 0 && aCurrentIndexGmd < aSortedWeighingsGmd.length - 1
              ? aSortedWeighingsGmd[aCurrentIndexGmd + 1]
              : null;
          if (aPreviousWeighingGmd) {
            const aWeightDiff = a.weight - aPreviousWeighingGmd.weight;
            const aDaysDiff = differenceInDays(
              new Date(a.date),
              new Date(aPreviousWeighingGmd.date)
            );
            aValue = aDaysDiff > 0 ? aWeightDiff / aDaysDiff : -999999;
          } else {
            aValue = -999999;
          }

          const bAllWeighingsGmd = getWeighingsByAnimalId(b.animalId);
          const bSortedWeighingsGmd = [...bAllWeighingsGmd].sort(
            (w1, w2) => new Date(w2.date).getTime() - new Date(w1.date).getTime()
          );
          const bCurrentIndexGmd = bSortedWeighingsGmd.findIndex((w) => w.id === b.id);
          const bPreviousWeighingGmd =
            bCurrentIndexGmd >= 0 && bCurrentIndexGmd < bSortedWeighingsGmd.length - 1
              ? bSortedWeighingsGmd[bCurrentIndexGmd + 1]
              : null;
          if (bPreviousWeighingGmd) {
            const bWeightDiff = b.weight - bPreviousWeighingGmd.weight;
            const bDaysDiff = differenceInDays(
              new Date(b.date),
              new Date(bPreviousWeighingGmd.date)
            );
            bValue = bDaysDiff > 0 ? bWeightDiff / bDaysDiff : -999999;
          } else {
            bValue = -999999;
          }
          break;
        }
        case "responsible": {
          const aEmployeeNames = a.employeeIds
            .map((id) => getEmployeeById(id)?.name || "")
            .join(", ");
          const aServiceProviderNames = a.serviceProviderIds
            .map((id) => getServiceProviderById(id)?.name || "")
            .join(", ");
          aValue = [aEmployeeNames, aServiceProviderNames].filter(Boolean).join(", ");
          const bEmployeeNames = b.employeeIds
            .map((id) => getEmployeeById(id)?.name || "")
            .join(", ");
          const bServiceProviderNames = b.serviceProviderIds
            .map((id) => getServiceProviderById(id)?.name || "")
            .join(", ");
          bValue = [bEmployeeNames, bServiceProviderNames].filter(Boolean).join(", ");
          break;
        }
        case "observation":
          aValue = a.observation || "";
          bValue = b.observation || "";
          break;
      }

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
  }, [filteredWeighings, sessionSortState]);

  const totalPages = Math.ceil(sortedWeighings.length / itemsPerPage);
  const startIndex = (sessionCurrentPage - 1) * itemsPerPage;
  const paginatedWeighings = sortedWeighings.slice(startIndex, startIndex + itemsPerPage);

  const sessionTableColumns: TableColumn<(typeof sessionWeighings)[0]>[] = useMemo(
    () => [
      {
        key: "animal",
        label: t.weighings.new.animalLabel || "Animal",
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
        label: t.weighings.new.weightLabel || "Peso (kg)",
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
          const sortedWeighings = [...allWeighings].sort(
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
          const sortedWeighings = [...allWeighings].sort(
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
          const sortedWeighings = [...allWeighings].sort(
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
            parseFloat(gmd) >= 0
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
          const employeeNames = weighing.employeeIds
            .map((id) => getEmployeeById(id)?.name)
            .filter(Boolean)
            .join(", ");
          const serviceProviderNames = weighing.serviceProviderIds
            .map((id) => getServiceProviderById(id)?.name)
            .filter(Boolean)
            .join(", ");
          const responsible = [employeeNames, serviceProviderNames].filter(Boolean).join(", ");
          return <span className="text-gray-700 dark:text-gray-300">{responsible || "-"}</span>;
        },
      },
      {
        key: "observation",
        label: t.weighings.new.observationLabel || "Observação",
        sortable: true,
        render: (_value, weighing) => (
          <span className="text-gray-700 dark:text-gray-300 max-w-xs truncate block">
            {weighing.observation || "-"}
          </span>
        ),
      },
    ],
    [t]
  );

  // Get available medicines and vaccines
  const availableMedicines = useMemo(() => {
    return getInventoryItemsByCategory(InventoryItemCategory.MEDICINES, companyId);
  }, [companyId]);

  const availableVaccines = useMemo(() => {
    return getInventoryItemsByCategory(InventoryItemCategory.VACCINES, companyId);
  }, [companyId]);

  const availableMedicinesVaccines = useMemo(() => {
    return [...availableMedicines, ...availableVaccines];
  }, [availableMedicines, availableVaccines]);

  // Get animal's current location and property
  const animalLocationInfo = useMemo(() => {
    if (!formData.animalId) return { locationId: undefined, propertyId: undefined };
    const animal = getAnimalById(formData.animalId);
    if (!animal) return { locationId: undefined, propertyId: undefined };

    const movements = getAnimalMovementsByAnimalId(animal.id);
    if (movements.length === 0) {
      return { locationId: undefined, propertyId: animal.propertyId };
    }

    const sortedMovements = [...movements].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const latestMovement = sortedMovements[0];
    return {
      locationId: latestMovement.locationId,
      propertyId: latestMovement.propertyId || animal.propertyId,
    };
  }, [formData.animalId]);

  // Calculate dosage function
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

  // Get unit label helper
  const getUnitLabel = (unit: string, quantity: number = 1): string => {
    const unitMap: Record<
      string,
      { singular: keyof typeof t.inventory.units; plural?: keyof typeof t.inventory.units }
    > = {
      unidade: { singular: "unit", plural: "unitPlural" },
      g: { singular: "gram" },
      kg: { singular: "kg" },
      tonelada: { singular: "ton", plural: "tonPlural" },
      ml: { singular: "milliliter" },
      L: { singular: "liter" },
      cm: { singular: "centimeter", plural: "centimeterPlural" },
      m: { singular: "meter", plural: "meterPlural" },
      m2: { singular: "squareMeter", plural: "squareMeterPlural" },
      ha: { singular: "hectare", plural: "hectarePlural" },
      saco: { singular: "bag", plural: "bagPlural" },
      frasco: { singular: "bottle", plural: "bottlePlural" },
      dose: { singular: "dose", plural: "dosePlural" },
      caixa: { singular: "box", plural: "boxPlural" },
      comprimido: { singular: "tablet", plural: "tabletPlural" },
      pilula: { singular: "pill", plural: "pillPlural" },
      ampola: { singular: "ampoule", plural: "ampoulePlural" },
      seringa: { singular: "syringe", plural: "syringePlural" },
      cartucho: { singular: "cartridge", plural: "cartridgePlural" },
      rolo: { singular: "roll", plural: "rollPlural" },
      pacote: { singular: "package", plural: "packagePlural" },
      lata: { singular: "can", plural: "canPlural" },
    };
    const unitInfo = unitMap[unit];
    if (!unitInfo) return unit;

    const isPlural = Math.abs(quantity) !== 1;
    const key = isPlural && unitInfo.plural ? unitInfo.plural : unitInfo.singular;
    return t.inventory.units[key] || unit;
  };

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
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      // Recalculate dosages when weight changes
      if (field === "weight" && prev.appliedMedicines.length > 0) {
        const weight = parseFloat(value as string) || 0;
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

    // Check if already added
    if (formData.appliedMedicines.some((m) => m.itemId === itemId)) {
      setSelectedMedicineId("");
      return;
    }

    const weight = parseFloat(formData.weight) || 0;
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

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.animalId) {
      newErrors.animalId = t.weighings.new.errors.animalRequired;
    }

    if (!formData.date) {
      newErrors.date = t.weighings.new.errors.dateRequired;
    }

    if (!formData.weight) {
      newErrors.weight = t.weighings.new.errors.weightRequired;
    } else {
      const weightNum = parseFloat(formData.weight);
      if (isNaN(weightNum) || weightNum <= 0) {
        newErrors.weight = t.weighings.new.errors.weightInvalid;
      }
    }

    // Validate stock for applied medicines
    if (formData.appliedMedicines.length > 0 && animalLocationInfo.propertyId) {
      for (const applied of formData.appliedMedicines) {
        const item = getInventoryItemById(applied.itemId);
        if (item) {
          const currentStock = getCurrentStock(applied.itemId, animalLocationInfo.propertyId);
          if (currentStock < applied.quantity) {
            newErrors[`medicine_${applied.itemId}`] =
              t.weighings.new.insufficientStock || "Estoque insuficiente";
          }
        }
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
      const weight = parseFloat(formData.weight);
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

      // Create inventory consumption movements for applied medicines/vaccines
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
              description: t.weighings.new.appliedDuringWeighing || "Aplicado durante pesagem",
              unitPrice: item.unitPrice,
            });
          }
        }
      }

      const animal = getAnimalById(formData.animalId);
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
      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5">
          <Alert title={alertMessage.title} variant={alertMessage.variant} />
        </div>
      )}

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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700">
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

            {formData.animalId && formData.weight && parseFloat(formData.weight) > 0 && (
              <div className="border-t border-b border-gray-200 dark:border-gray-700 pt-4 pb-4 mt-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {t.weighings.new.medicinesVaccinesTitle || "Medicamentos e Vacinas"}
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
                          const weight = parseFloat(formData.weight) || 0;
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
                                        {t.weighings.new.calculatedDosage || "Dosagem Calculada"}:
                                      </span>
                                      <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                                        {calculatedDosage.toFixed(2)}{" "}
                                        {getUnitLabel(
                                          item.usageUnit || item.unit,
                                          calculatedDosage
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
                                          const qty = parseFloat(e.target.value) || 0;
                                          updateMedicineQuantity(applied.itemId, qty);
                                        }}
                                        disabled={isSubmitting}
                                        className="w-full"
                                      />
                                    </div>
                                    <div>
                                      <span className="text-gray-600 dark:text-gray-400">
                                        {t.weighings.new.currentStock || "Estoque Atual"}:
                                      </span>
                                      <span
                                        className={`ml-2 font-medium ${
                                          currentStock < applied.quantity
                                            ? "text-red-600 dark:text-red-400"
                                            : "text-gray-900 dark:text-gray-100"
                                        }`}
                                      >
                                        {currentStock.toFixed(2)}{" "}
                                        {getUnitLabel(item.unit, currentStock)}
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
                                  {t.weighings.new.removeMedicineVaccine || "Remover"}
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
                          t.weighings.new.selectMedicineVaccine || "Selecionar Medicamento/Vacina"
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
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t.weighings.new.employeesLabel}
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 max-h-48 overflow-y-auto">
                  {employees.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t.weighings.new.noEmployees}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {employees.map((employee) => (
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
                  {t.weighings.new.serviceProvidersLabel}
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 max-h-48 overflow-y-auto">
                  {serviceProviders.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t.weighings.new.noServiceProviders}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {serviceProviders.map((provider) => (
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
