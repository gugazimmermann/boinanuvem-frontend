import type { InventoryItem, Language } from "~/types";
import { InventoryItemCategory } from "~/types";
import { getSupplierById } from "~/services/suppliers.service";
import { getPropertyById } from "~/services/properties.service";
import { getUnitLabel, formatInventoryDate } from "~/utils/inventory-utils";

export interface InventoryItemDetailsProps {
  readonly item: InventoryItem;
  readonly currentStock: number;
  readonly isLowStock: boolean;
  readonly isExpiring: boolean;
  readonly translations: {
    inventory: {
      table: {
        code: string;
        name: string;
        description: string;
        category: string;
        unit: string;
        supplier: string;
        currentStock: string;
        minimumStock: string;
        expirationDate: string;
        lowStock: string;
        expiring: string;
      };
      categories: Record<string, string>;
      new: {
        usageMethod: string;
        usageBasisOptions?: {
          perAnimal: string;
          perKg: string;
        };
      };
      details: {
        itemInfo: string;
        stockInfo: string;
        properties: string;
      };
      units: Record<string, string>;
    };
  };
  readonly language: Language;
  readonly onSupplierClick?: (supplierId: string) => void;
}

export function InventoryItemDetails({
  item,
  currentStock,
  isLowStock,
  isExpiring,
  translations: t,
  language,
  onSupplierClick,
}: InventoryItemDetailsProps) {
  const supplier = item.supplierId ? getSupplierById(item.supplierId) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-blue-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t.inventory.details.itemInfo}
          </h2>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {t.inventory.table.code}
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{item.code}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {t.inventory.table.name}
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{item.name}</p>
          </div>
          {item.description && (
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.inventory.table.description}
              </p>
              <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{item.description}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {t.inventory.table.category}
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
              {item.category === InventoryItemCategory.CUSTOM
                ? item.customCategory || t.inventory.categories.custom
                : t.inventory.categories[item.category as keyof typeof t.inventory.categories] ||
                  item.category}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {t.inventory.table.unit}
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
              {getUnitLabel(item.unit, 1, t)}
            </p>
          </div>
          {(item.category === InventoryItemCategory.MEDICINES ||
            item.category === InventoryItemCategory.VACCINES) &&
            item.usageAmount &&
            item.usageUnit &&
            item.usageBasis && (
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.inventory.new.usageMethod}
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                  {item.usageAmount} {getUnitLabel(item.usageUnit, item.usageAmount, t)}{" "}
                  {(() => {
                    if (item.usageBasis === "per_animal") {
                      return t.inventory.new.usageBasisOptions?.perAnimal || "por animal";
                    }
                    if (item.usageBasis === "per_kg") {
                      return t.inventory.new.usageBasisOptions?.perKg || "por kg";
                    }
                    return item.usageBasis;
                  })()}
                </p>
              </div>
            )}
          {supplier && (
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.inventory.table.supplier}
              </p>
              {onSupplierClick ? (
                <button
                  onClick={() => onSupplierClick(supplier.id)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1"
                >
                  {supplier.name}
                </button>
              ) : (
                <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{supplier.name}</p>
              )}
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {t.inventory.details.properties}
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              {item.propertyIds && item.propertyIds.length > 0 ? (
                item.propertyIds.map((propertyId: string) => {
                  const property = getPropertyById(propertyId);
                  return property ? (
                    <span
                      key={propertyId}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {property.name}
                    </span>
                  ) : null;
                })
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-1 w-12 bg-green-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t.inventory.details.stockInfo}
          </h2>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {t.inventory.table.currentStock}
            </p>
            <p
              className={`text-2xl font-bold mt-1 ${isLowStock ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-gray-100"}`}
            >
              {currentStock} {getUnitLabel(item.unit, currentStock, t)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {t.inventory.table.minimumStock}
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
              {item.minimumStock} {getUnitLabel(item.unit, item.minimumStock, t)}
            </p>
          </div>
          {item.hasExpiration && item.expirationDate && (
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t.inventory.table.expirationDate}
              </p>
              <p
                className={`text-sm mt-1 ${isExpiring ? "text-orange-600 dark:text-orange-400 font-medium" : "text-gray-900 dark:text-gray-100"}`}
              >
                {formatInventoryDate(item.expirationDate, language)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
