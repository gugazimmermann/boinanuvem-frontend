import type { Locale } from "date-fns";
import type React from "react";
import type {
  Animal,
  TableColumn,
  Language,
  AcquisitionItem,
  Property,
  Weighing,
  Breeding,
} from "~/types";
import type { UserPermissions } from "~/types/permissions";
import { getBirthByAnimalId } from "~/services/births.service";
import { formatDate } from "~/utils/formatting";
import type { AnimalTableColumnsOptions } from "./animal-table-columns";
import { createAnimalTableColumns } from "./animal-table-columns";
import type { TranslationKey, Translations } from "~/i18n";
import { getAnimalEditRoute } from "~/routes.config";
import { TableActionButtons } from "~/components/ui";

/**
 * Build animal table translations object from translation keys
 * This function centralizes translation mapping to avoid duplication
 */
export function buildAnimalTableTranslations(
  t: TranslationKey | Translations[keyof Translations]
): AnimalTableColumnsOptions["translations"] {
  const translations: AnimalTableColumnsOptions["translations"] = {
    table: {
      registration: t.animals.table.registration,
      breed: t.animals.table.breed,
      purity: t.animals.table.purity,
      gender: t.animals.table.gender,
      birthDate: t.animals.table.birthDate,
      acquisitionDate: t.animals.table.acquisitionDate,
      weight: t.animals.table.weight,
      weightInArrobas: t.animals.table.weightInArrobas,
      lastWeighingDate: t.animals.table.lastWeighingDate,
      gmd: t.animals.table.gmd,
      breedingStatus: t.animals.table.breedingStatus,
      breedingStatusPregnant: t.animals.table.breedingStatusPregnant,
      status: t.animals.table.status,
      active: t.animals.table.active,
      inactive: t.animals.table.inactive,
    },
    breeds: t.animals.breeds,
    purity: t.animals.purity,
    gender: t.animals.gender,
    common: {
      month: t.common.month,
      months: t.common.months,
      daysAgo: t.common.daysAgo,
      dailyAverageGain: t.common.dailyAverageGain,
    },
  };

  // Add optional fields if they exist in translations
  if (t.animals.table.properties) {
    translations.table.properties = t.animals.table.properties;
  }
  if (t.animals.table.sold) {
    translations.table.sold = t.animals.table.sold;
  }

  return translations;
}

export interface GetAnimalTableColumnsConfigParams {
  t: TranslationKey | Translations[keyof Translations];
  language: Language;
  dateLocale: Locale;
  birthsMap: Map<string, Awaited<ReturnType<typeof getBirthByAnimalId>>>;
  acquisitionItemsMap?: Map<string, AcquisitionItem>;
  acquisitionDateByAnimalId?: Map<string, string>;
  weighingsMap?: Map<string, Weighing[]>;
  breedingsMap?: Map<string, Breeding[]>;
  propertiesMap?: Map<string, Property>;
  TooltipComponent: React.ComponentType<{
    content: string;
    position?: "top" | "bottom";
    children: React.ReactNode;
  }>;
  StatusBadgeComponent: React.ComponentType<{
    label: string;
    variant: "success" | "default" | "warning";
  }>;
  navigate: (path: string) => void;
  handleDeleteAnimalClick: (animal: Animal) => void;
  canEdit: (section: keyof UserPermissions, resource: string) => boolean;
  canRemove: (section: keyof UserPermissions, resource: string) => boolean;
  includeProperties?: boolean;
  includeActions?: boolean;
  onStatusRender?: (animal: Animal) => {
    label: string;
    variant: "success" | "default" | "warning";
  };
}

export function getAnimalTableColumnsConfig(
  params: GetAnimalTableColumnsConfigParams
): AnimalTableColumnsOptions {
  const {
    t,
    language,
    dateLocale,
    birthsMap,
    acquisitionItemsMap,
    acquisitionDateByAnimalId,
    weighingsMap,
    breedingsMap,
    propertiesMap,
    TooltipComponent,
    StatusBadgeComponent,
    navigate,
    handleDeleteAnimalClick,
    canEdit,
    canRemove,
    includeProperties = false,
    includeActions = true,
    onStatusRender,
  } = params;

  const translations = buildAnimalTableTranslations(t);

  const result: AnimalTableColumnsOptions = {
    language,
    dateLocale,
    propertiesMap,
    birthsMap,
    acquisitionItemsMap,
    acquisitionDateByAnimalId,
    weighingsMap,
    breedingsMap,
    translations,
    formatDateFn: formatDate,
    TooltipComponent: TooltipComponent as React.ComponentType<{
      content: string;
      position?: "top" | "bottom";
      children: React.ReactNode;
    }>,
    StatusBadgeComponent,
    includeProperties,
    includeActions,
  };

  if (includeActions) {
    result.actionsColumn = {
      key: "actions",
      label: "",
      headerClassName: "relative",
      render: (_, row) => (
        <TableActionButtons
          onEdit={() => navigate(getAnimalEditRoute(row.id))}
          onDelete={() => handleDeleteAnimalClick(row)}
          canEdit={canEdit("registration", "animals")}
          canDelete={canRemove("registration", "animals")}
        />
      ),
    };
  }

  if (onStatusRender) {
    result.onStatusRender = onStatusRender;
  }

  return result;
}

export function createAnimalTableColumnsWithConfig(
  params: GetAnimalTableColumnsConfigParams
): TableColumn<Animal>[] {
  const config = getAnimalTableColumnsConfig(params);
  return createAnimalTableColumns(config);
}
