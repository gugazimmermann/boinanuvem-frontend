import { differenceInMonths, differenceInDays, format } from "date-fns";
import type { Locale } from "date-fns";
import type { Animal, TableColumn, Language, Property } from "~/types";
import { getBirthByAnimalId } from "~/services/births.service";
import { getWeighingsByAnimalId } from "~/services/weighings.service";
import { getBreedingsByAnimalId } from "~/services/breedings.service";
import { formatDate } from "~/utils/formatting";
import type { ReactNode } from "react";

type StatusBadgeVariant = "success" | "default" | "warning";

export interface AnimalTableColumnsOptions {
  language: Language;
  dateLocale: Locale;
  propertiesMap?: Map<string, Property>;
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
    position?: string;
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
        const birth = getBirthByAnimalId(row.id);
        if (!birth?.breed) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {translations.breeds[birth.breed] || birth.breed}
          </span>
        );
      },
    },
    {
      key: "purity",
      label: translations.table.purity,
      sortable: true,
      render: (_, row) => {
        const birth = getBirthByAnimalId(row.id);
        if (!birth?.purity) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {translations.purity[birth.purity]}
          </span>
        );
      },
    },
    {
      key: "gender",
      label: translations.table.gender,
      sortable: true,
      render: (_, row) => {
        const birth = getBirthByAnimalId(row.id);
        if (!birth?.gender) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {birth.gender ? translations.gender[birth.gender] : "-"}
          </span>
        );
      },
    },
    {
      key: "birthDate",
      label: translations.table.birthDate,
      sortable: true,
      render: (_, row) => {
        const birth = getBirthByAnimalId(row.id);
        if (!birth?.birthDate) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }

        const birthDate = new Date(birth.birthDate);
        const today = new Date();
        const months = differenceInMonths(today, birthDate);
        const dateFormat = language === "en" ? "MM/dd/yyyy" : "dd/MM/yyyy";
        const formattedDate =
          formatDateFn === formatDate
            ? formatDateFn(birthDate, language)
            : format(birthDate, dateFormat, { locale: dateLocale });

        return (
          <Tooltip content={formattedDate}>
            <span className="text-gray-700 dark:text-gray-300 border-b border-dotted border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
              {months} {months === 1 ? translations.common.month : translations.common.months}
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
        if (!row.acquisitionDate) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }

        const acquisitionDate = new Date(row.acquisitionDate);
        const today = new Date();
        const months = differenceInMonths(today, acquisitionDate);
        const dateFormat = language === "en" ? "MM/dd/yyyy" : "dd/MM/yyyy";
        const formattedDate =
          formatDateFn === formatDate
            ? formatDateFn(acquisitionDate, language)
            : format(acquisitionDate, dateFormat, { locale: dateLocale });

        return (
          <Tooltip content={formattedDate}>
            <span className="text-gray-700 dark:text-gray-300 border-b border-dotted border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
              {months} {months === 1 ? translations.common.month : translations.common.months}
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
        const weighings = getWeighingsByAnimalId(row.id);
        const sortedWeighings = weighings.toSorted(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const lastWeighing = sortedWeighings[0];
        return (
          <span className="text-gray-700 dark:text-gray-300">
            {lastWeighing ? `${lastWeighing.weight}` : "-"}
          </span>
        );
      },
    },
    {
      key: "weightInArrobas",
      label: translations.table.weightInArrobas,
      sortable: true,
      render: (_, row) => {
        const weighings = getWeighingsByAnimalId(row.id);
        const sortedWeighings = weighings.toSorted(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const lastWeighing = sortedWeighings[0];
        const weightInArrobas = lastWeighing ? (lastWeighing.weight / 30).toFixed(2) : null;
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
        const weighings = getWeighingsByAnimalId(row.id);
        const sortedWeighings = weighings.toSorted(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const lastWeighing = sortedWeighings[0];
        if (!lastWeighing) return <span className="text-gray-700 dark:text-gray-300">-</span>;

        const dateFormat = language === "en" ? "MM/dd/yyyy" : "dd/MM/yyyy";
        const formattedDate =
          formatDateFn === formatDate
            ? formatDateFn(new Date(lastWeighing.date), language)
            : format(new Date(lastWeighing.date), dateFormat, { locale: dateLocale });
        const today = new Date();
        const weighingDate = new Date(lastWeighing.date);
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
        <Tooltip content={translations.common.dailyAverageGain} position="bottom">
          <span className="border-b border-dotted border-gray-400 dark:border-gray-500 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-help">
            {translations.table.gmd}
          </span>
        </Tooltip>
      ),
      sortable: true,
      render: (_, row) => {
        const weighings = getWeighingsByAnimalId(row.id);
        const sortedWeighings = weighings.toSorted(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

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

        if (daysDifference === 0) {
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
      render: (_, row) => {
        const birth = getBirthByAnimalId(row.id);
        if (!birth?.gender || birth.gender !== "female") {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }
        const breedings = getBreedingsByAnimalId(row.id);
        if (breedings.length === 0) {
          return <span className="text-gray-700 dark:text-gray-300">-</span>;
        }
        const hasConfirmed = breedings.some((b) => b.confirmed === true);

        if (hasConfirmed) {
          return (
            <StatusBadgeComponent
              label={translations.table.breedingStatusPregnant}
              variant="success"
            />
          );
        } else {
          return (
            <StatusBadgeComponent
              label={translations.table.breedingStatusPregnant}
              variant="warning"
            />
          );
        }
      },
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
