import { differenceInMonths, differenceInDays, format } from "date-fns";
import type { Locale } from "date-fns";
import type { ReactNode } from "react";
import type {
  Animal,
  TableColumn,
  Language,
  Property,
  AcquisitionItem,
  Weighing,
  Breeding,
} from "~/types";
import { BirthPurity } from "~/types";
import { getBirthByAnimalId } from "~/services/births.service";
import { getWeighingsByAnimalId } from "~/services/weighings.service";
import { formatDate } from "~/utils/formatting";

type StatusBadgeVariant = "success" | "default" | "warning";

function BreedingStatusCell({
  birth,
  acquisitionItem,
  breedings,
  StatusBadgeComponent,
  translations,
}: Readonly<{
  animalId: string;
  birth: Awaited<ReturnType<typeof getBirthByAnimalId>> | undefined;
  acquisitionItem: AcquisitionItem | undefined;
  breedings?: Breeding[];
  StatusBadgeComponent: React.ComponentType<{ label: string; variant: StatusBadgeVariant }>;
  translations: {
    table: {
      breedingStatusPregnant: string;
    };
  };
}>) {
  const gender = birth?.gender || acquisitionItem?.gender;
  if (!gender || gender !== "female") {
    return <span className="text-gray-700 dark:text-gray-300">-</span>;
  }

  if (!breedings || breedings.length === 0) {
    return <span className="text-gray-700 dark:text-gray-300">-</span>;
  }

  const hasConfirmed = breedings.some((b) => b.confirmed === true);

  if (hasConfirmed) {
    return (
      <StatusBadgeComponent label={translations.table.breedingStatusPregnant} variant="success" />
    );
  } else {
    return (
      <StatusBadgeComponent label={translations.table.breedingStatusPregnant} variant="warning" />
    );
  }
}

export interface AnimalTableColumnsOptions {
  language: Language;
  dateLocale: Locale;
  propertiesMap?: Map<string, Property>;
  birthsMap?: Map<string, Awaited<ReturnType<typeof getBirthByAnimalId>>>;
  acquisitionItemsMap?: Map<string, AcquisitionItem>;
  acquisitionDateByAnimalId?: Map<string, string>;
  weighingsMap?: Map<string, Weighing[]>;
  breedingsMap?: Map<string, Breeding[]>;
  translations: {
    table: {
      registration: string;
      breed: string;
      purity: string;
      gender: string;
      birthDate: string;
      acquisitionDate: string;
      weight: string;
      weightInArrobas: string;
      lastWeighingDate: string;
      gmd: string;
      properties?: string;
      breedingStatus: string;
      breedingStatusPregnant: string;
      status: string;
      active: string;
      inactive: string;
      sold?: string;
    };
    breeds: Record<string, string>;
    purity: Record<string, string>;
    gender: Record<string, string>;
    common: {
      month: string;
      months: string;
      daysAgo: (days: number) => string;
      dailyAverageGain: string;
    };
  };
  formatDateFn?: (date: Date | string, language?: Language) => string;
  TooltipComponent?: React.ComponentType<{
    content: string;
    position?: "top" | "bottom";
    children: ReactNode;
  }>;
  StatusBadgeComponent: React.ComponentType<{
    label: string;
    variant: StatusBadgeVariant;
  }>;
  includeProperties?: boolean;
  includeActions?: boolean;
  actionsColumn?: TableColumn<Animal>;
  onStatusRender?: (animal: Animal) => {
    label: string;
    variant: StatusBadgeVariant;
  };
}

export function createAnimalTableColumns(
  options: AnimalTableColumnsOptions
): TableColumn<Animal>[] {
  const {
    propertiesMap,
    birthsMap,
    acquisitionItemsMap,
    acquisitionDateByAnimalId,
    weighingsMap,
    breedingsMap,
    language,
    dateLocale,
    translations,
    formatDateFn = formatDate,
    TooltipComponent,
    StatusBadgeComponent,
    includeProperties = false,
    includeActions = false,
    actionsColumn,
    onStatusRender,
  } = options;

  const Tooltip = TooltipComponent || (({ children }: { children: ReactNode }) => <>{children}</>);

  const getBirthByAnimalIdLocal = (animalId: string) => {
    return birthsMap?.get(animalId);
  };

  const getAcquisitionItemByAnimalIdLocal = (animalId: string) => {
    return acquisitionItemsMap?.get(animalId);
  };

  const getAcquisitionDateByAnimalIdLocal = (animalId: string) => {
    return acquisitionDateByAnimalId?.get(animalId);
  };

  const getWeighingsByAnimalIdLocal = (animalId: string): Weighing[] => {
    return weighingsMap?.get(animalId) ?? [];
  };

  const getBreedingsByAnimalIdLocal = (animalId: string): Breeding[] => {
    return breedingsMap?.get(animalId) ?? [];
  };

  const getLastWeighing = (weighings: Weighing[]): Weighing | undefined => {
    const sorted = [...weighings].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sorted[0];
  };

  const columns: TableColumn<Animal>[] = [
    {
      key: "code",
      label: translations.table.registration,
      sortable: true,
      render: (_, row) => (
        <div>
          <h2 className="font-medium text-gray-800 dark:text-gray-200">{row.code}</h2>
          <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
            {row.registrationNumber}
          </p>
        </div>
      ),
    },
    {
      key: "breed",
      label: translations.table.breed,
      sortable: true,
      render: (_, row) => {
        const birth = getBirthByAnimalIdLocal(row.id);
        const acquisitionItem = getAcquisitionItemByAnimalIdLocal(row.id);
        // For animals with birth records, only use birth breed
        // For animals without birth records, use acquisition breed
        const breed = birth?.breed || (birth ? undefined : acquisitionItem?.breed);
        if (!breed) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {translations.breeds[breed] || breed}
          </span>
        );
      },
    },
    {
      key: "purity",
      label: translations.table.purity,
      sortable: true,
      render: (_, row) => {
        const birth = getBirthByAnimalIdLocal(row.id);
        const acquisitionItem = getAcquisitionItemByAnimalIdLocal(row.id);

        // For animals with birth records, only use birth purity and parents
        // For animals without birth records, use acquisition purity and parents
        const purity = birth?.purity || (birth ? undefined : acquisitionItem?.purity);
        const hasParents = birth
          ? Boolean(birth.motherId || birth.fatherId)
          : Boolean(acquisitionItem?.motherId || acquisitionItem?.fatherId);

        // Fallback: if there's no explicit purity AND no genealogy data, default to PO.
        const resolvedPurity = purity || (hasParents ? undefined : BirthPurity.PO);
        if (!resolvedPurity) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {translations.purity[resolvedPurity] ?? String(resolvedPurity)}
          </span>
        );
      },
    },
    {
      key: "gender",
      label: translations.table.gender,
      sortable: true,
      render: (_, row) => {
        const birth = getBirthByAnimalIdLocal(row.id);
        const acquisitionItem = getAcquisitionItemByAnimalIdLocal(row.id);
        // For animals with birth records, only use birth gender
        // For animals without birth records, use acquisition gender
        const gender = birth?.gender || (birth ? undefined : acquisitionItem?.gender);
        if (!gender) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {translations.gender[gender] ?? "-"}
          </span>
        );
      },
    },
    {
      key: "birthDate",
      label: translations.table.birthDate,
      sortable: true,
      render: (_, row) => {
        const birth = getBirthByAnimalIdLocal(row.id);
        const acquisitionItem = getAcquisitionItemByAnimalIdLocal(row.id);
        // For animals with birth records, only use birth date
        // For animals without birth records, use acquisition birth date
        const birthDateValue = birth?.birthDate || (birth ? undefined : acquisitionItem?.birthDate);
        if (!birthDateValue) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }

        const birthDate = new Date(birthDateValue);
        const today = new Date();
        const months = differenceInMonths(today, birthDate);
        const dateFormat = language === "en" ? "MM/dd/yyyy" : "dd/MM/yyyy";
        const formattedDate =
          formatDateFn === formatDate
            ? formatDateFn(birthDate, language)
            : format(birthDate, dateFormat, { locale: dateLocale });

        return (
          <Tooltip
            content={`${months} ${months === 1 ? translations.common.month : translations.common.months}`}
          >
            <span className="text-gray-700 dark:text-gray-300 border-b border-dotted border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
              {formattedDate}
            </span>
          </Tooltip>
        );
      },
    },
    {
      key: "acquisitionDate",
      label: translations.table.acquisitionDate,
      sortable: true,
      render: (_, row) => {
        // Only show acquisition date if the animal doesn't have a birth record
        // Animals registered via birth should not show acquisition date
        const birth = getBirthByAnimalIdLocal(row.id);
        if (birth) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }

        const acquisitionDateValue =
          getAcquisitionDateByAnimalIdLocal(row.id) || row.acquisitionDate;
        if (!acquisitionDateValue) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }

        const acquisitionDate = new Date(acquisitionDateValue);
        const today = new Date();
        const months = differenceInMonths(today, acquisitionDate);
        const dateFormat = language === "en" ? "MM/dd/yyyy" : "dd/MM/yyyy";
        const formattedDate =
          formatDateFn === formatDate
            ? formatDateFn(acquisitionDate, language)
            : format(acquisitionDate, dateFormat, { locale: dateLocale });

        return (
          <Tooltip
            content={`${months} ${months === 1 ? translations.common.month : translations.common.months}`}
          >
            <span className="text-gray-700 dark:text-gray-300 border-b border-dotted border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
              {formattedDate}
            </span>
          </Tooltip>
        );
      },
    },
    {
      key: "weight",
      label: translations.table.weight,
      sortable: true,
      render: (_, row) => {
        const weighingsArray: Awaited<ReturnType<typeof getWeighingsByAnimalId>> =
          getWeighingsByAnimalIdLocal(row.id);
        const lastWeighing = getLastWeighing(weighingsArray);
        const birth = getBirthByAnimalIdLocal(row.id);
        const acquisitionItem = getAcquisitionItemByAnimalIdLocal(row.id);
        // For animals with birth records, don't use acquisition weight as fallback
        // For animals without birth records, use acquisition weight as fallback
        const weight = lastWeighing?.weight ?? (birth ? undefined : acquisitionItem?.weight);
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {typeof weight === "number" ? `${weight}` : "-"}
          </span>
        );
      },
    },
    {
      key: "weightInArrobas",
      label: translations.table.weightInArrobas,
      sortable: true,
      render: (_, row) => {
        const weighingsArray: Awaited<ReturnType<typeof getWeighingsByAnimalId>> =
          getWeighingsByAnimalIdLocal(row.id);
        const lastWeighing = getLastWeighing(weighingsArray);
        const birth = getBirthByAnimalIdLocal(row.id);
        const acquisitionItem = getAcquisitionItemByAnimalIdLocal(row.id);
        // For animals with birth records, don't use acquisition weight as fallback
        // For animals without birth records, use acquisition weight as fallback
        const weight = lastWeighing?.weight ?? (birth ? undefined : acquisitionItem?.weight);
        const weightInArrobas = typeof weight === "number" ? (weight / 30).toFixed(2) : null;
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {weightInArrobas ? `${weightInArrobas}` : "-"}
          </span>
        );
      },
    },
    {
      key: "lastWeighingDate",
      label: translations.table.lastWeighingDate,
      sortable: true,
      render: (_, row) => {
        const weighingsArray: Awaited<ReturnType<typeof getWeighingsByAnimalId>> =
          getWeighingsByAnimalIdLocal(row.id);
        const lastWeighing = getLastWeighing(weighingsArray);
        const birth = getBirthByAnimalIdLocal(row.id);
        const acquisitionItem = getAcquisitionItemByAnimalIdLocal(row.id);

        // For animals with birth records, only use birth date as fallback
        // For animals without birth records, use acquisition date as fallback
        const acquisitionDateFallback = birth
          ? undefined
          : getAcquisitionDateByAnimalIdLocal(row.id) || row.acquisitionDate;
        const birthDateFallback = birth?.birthDate || acquisitionItem?.birthDate;

        const referenceDateValue =
          lastWeighing?.date || acquisitionDateFallback || birthDateFallback;

        if (!referenceDateValue) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }

        const dateFormat = language === "en" ? "MM/dd/yyyy" : "dd/MM/yyyy";
        const formattedDate =
          formatDateFn === formatDate
            ? formatDateFn(new Date(referenceDateValue), language)
            : format(new Date(referenceDateValue), dateFormat, { locale: dateLocale });
        const today = new Date();
        const weighingDate = new Date(referenceDateValue);
        const daysAgo = differenceInDays(today, weighingDate);
        const tooltipText = translations.common.daysAgo(daysAgo);

        return (
          <Tooltip content={tooltipText}>
            <span className="text-gray-700 dark:text-gray-300 border-b border-dotted border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
              {formattedDate}
            </span>
          </Tooltip>
        );
      },
    },
    {
      key: "gmd",
      label: (
        <span
          title={translations.common.dailyAverageGain}
          className="border-b border-dotted border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-help"
        >
          {translations.table.gmd}
        </span>
      ),
      sortable: true,
      render: (_, row) => {
        const weighingsArray: Awaited<ReturnType<typeof getWeighingsByAnimalId>> =
          getWeighingsByAnimalIdLocal(row.id);
        const sortedWeighings = [...weighingsArray].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Only compute GMD when we have at least 2 weighings.
        if (sortedWeighings.length < 2) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }

        const lastWeighing = sortedWeighings[0];
        const previousWeighing = sortedWeighings[1];
        const weightDifference = lastWeighing.weight - previousWeighing.weight;
        const daysDifference = differenceInDays(
          new Date(lastWeighing.date),
          new Date(previousWeighing.date)
        );

        if (daysDifference <= 0) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }

        const gpd = (weightDifference / daysDifference).toFixed(2);
        return <span className="text-gray-700 dark:text-gray-300">{gpd}</span>;
      },
    },
  ];

  const additionalColumns: TableColumn<Animal>[] = [
    ...(includeProperties && translations.table.properties
      ? [
          {
            key: "properties",
            label: translations.table.properties,
            sortable: false,
            render: (_: unknown, row: Animal) => {
              const property = propertiesMap?.get(row.propertyId);
              return (
                <span className="text-gray-700 dark:text-gray-300">
                  {property ? property.name : "-"}
                </span>
              );
            },
          },
        ]
      : []),
    {
      key: "breedingStatus",
      label: translations.table.breedingStatus,
      sortable: false,
      render: (_, row) => (
        <BreedingStatusCell
          animalId={row.id}
          birth={getBirthByAnimalIdLocal(row.id)}
          acquisitionItem={getAcquisitionItemByAnimalIdLocal(row.id)}
          breedings={getBreedingsByAnimalIdLocal(row.id)}
          StatusBadgeComponent={StatusBadgeComponent}
          translations={translations}
        />
      ),
    },
    {
      key: "status",
      label: translations.table.status,
      sortable: true,
      render: (_, row) => {
        if (onStatusRender) {
          const status = onStatusRender(row);
          return <StatusBadgeComponent label={status.label} variant={status.variant} />;
        }

        let label: string = translations.table.active;
        let variant: StatusBadgeVariant = "success";
        if (row.status === "inactive") {
          label = translations.table.inactive;
          variant = "default";
        } else if (row.status === "sold" && translations.table.sold) {
          label = translations.table.sold;
          variant = "warning";
        }
        return <StatusBadgeComponent label={label} variant={variant} />;
      },
    },
    ...(includeActions && actionsColumn ? [actionsColumn] : []),
  ];

  return [...columns, ...additionalColumns];
}
