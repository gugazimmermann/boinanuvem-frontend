import type { Language } from "~/types";
import { InventoryItemCategory, CashFlowCategory } from "~/types";
import { formatDate } from "./formatting";

export function getUnitLabel(
  unit: string,
  quantity: number,
  translations: {
    inventory: {
      units: Record<string, string>;
    };
  }
): string {
  const unitMap: Record<
    string,
    {
      singular: keyof typeof translations.inventory.units;
      plural?: keyof typeof translations.inventory.units;
    }
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
  return translations.inventory.units[key] || unit;
}

export function isExpiringSoon(expirationDate?: string, daysThreshold: number = 30): boolean {
  if (!expirationDate) return false;
  const today = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= daysThreshold;
}

export function getCategoryForCashFlow(itemCategory: string): CashFlowCategory {
  switch (itemCategory) {
    case InventoryItemCategory.FEED:
      return CashFlowCategory.FEED;
    case InventoryItemCategory.MEDICINES:
      return CashFlowCategory.MEDICINES;
    case InventoryItemCategory.VACCINES:
      return CashFlowCategory.VACCINES;
    case InventoryItemCategory.SUPPLEMENTS:
    case InventoryItemCategory.VITAMINS:
      return CashFlowCategory.OTHER_EXPENSES;
    default:
      return CashFlowCategory.OTHER_EXPENSES;
  }
}

export function getInventoryUnitOptions(translations: {
  inventory: {
    units: Record<string, string>;
  };
}): Array<{ value: string; label: string }> {
  return [
    { value: "unidade", label: translations.inventory.units.unit },
    { value: "g", label: translations.inventory.units.gram },
    { value: "kg", label: translations.inventory.units.kg },
    { value: "tonelada", label: translations.inventory.units.ton },
    { value: "ml", label: translations.inventory.units.milliliter },
    { value: "L", label: translations.inventory.units.liter },
    { value: "cm", label: translations.inventory.units.centimeter },
    { value: "m", label: translations.inventory.units.meter },
    { value: "m2", label: translations.inventory.units.squareMeter },
    { value: "ha", label: translations.inventory.units.hectare },
    { value: "saco", label: translations.inventory.units.bag },
    { value: "frasco", label: translations.inventory.units.bottle },
    { value: "dose", label: translations.inventory.units.dose },
    { value: "caixa", label: translations.inventory.units.box },
    { value: "comprimido", label: translations.inventory.units.tablet },
    { value: "pilula", label: translations.inventory.units.pill },
    { value: "ampola", label: translations.inventory.units.ampoule },
    { value: "seringa", label: translations.inventory.units.syringe },
    { value: "cartucho", label: translations.inventory.units.cartridge },
    { value: "rolo", label: translations.inventory.units.roll },
    { value: "pacote", label: translations.inventory.units.package },
    { value: "lata", label: translations.inventory.units.can },
  ];
}

export function getUsageUnitOptions(translations: {
  inventory: {
    units: Record<string, string>;
  };
}): Array<{ value: string; label: string }> {
  return [
    { value: "unidade", label: translations.inventory.units.unit },
    { value: "ml", label: translations.inventory.units.milliliter },
    { value: "L", label: translations.inventory.units.liter },
    { value: "dose", label: translations.inventory.units.dose },
    { value: "frasco", label: translations.inventory.units.bottle },
    { value: "ampola", label: translations.inventory.units.ampoule },
    { value: "seringa", label: translations.inventory.units.syringe },
    { value: "comprimido", label: translations.inventory.units.tablet },
    { value: "pilula", label: translations.inventory.units.pill },
    { value: "g", label: translations.inventory.units.gram },
    { value: "kg", label: translations.inventory.units.kg },
  ];
}

export function getInventoryCategoryOptions(translations: {
  inventory: {
    categories: Record<string, string>;
  };
}): Array<{ value: InventoryItemCategory; label: string }> {
  return Object.values(InventoryItemCategory).map((category) => ({
    value: category,
    label:
      category === InventoryItemCategory.CUSTOM
        ? translations.inventory.categories.custom
        : translations.inventory.categories[
            category as keyof typeof translations.inventory.categories
          ] || category,
  }));
}

export function getUsageBasisOptions(translations: {
  inventory: {
    new: {
      usageBasisOptions: {
        perAnimal: string;
        perKg: string;
      };
    };
  };
}): Array<{ value: string; label: string }> {
  return [
    {
      value: "per_animal",
      label: translations.inventory.new.usageBasisOptions.perAnimal,
    },
    {
      value: "per_kg",
      label: translations.inventory.new.usageBasisOptions.perKg,
    },
  ];
}

export function formatInventoryDate(dateString: string, language: Language = "pt"): string {
  return formatDate(dateString, language);
}
