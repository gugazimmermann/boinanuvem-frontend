import { useMemo } from "react";
import type { InventoryItem } from "~/types";
import { getCurrentStock, getLowStockItems, getExpiringItems } from "~/services/inventory.service";
import { isExpiringSoon } from "~/utils/inventory-utils";

export interface UseInventoryStockOptions {
  item?: InventoryItem;
  items?: InventoryItem[];
  companyId: string;
  propertyId?: string;
  daysThreshold?: number;
}

export function useInventoryStock(options: UseInventoryStockOptions) {
  const { item, items, companyId, propertyId, daysThreshold = 30 } = options;

  const currentStock = useMemo(() => {
    if (!item) return 0;
    return getCurrentStock(item.id, propertyId);
  }, [item, propertyId]);

  const isLowStock = useMemo(() => {
    if (!item) return false;
    return currentStock < item.minimumStock;
  }, [item, currentStock]);

  const isExpiring = useMemo(() => {
    if (!item) return false;
    return isExpiringSoon(item.expirationDate, daysThreshold);
  }, [item, daysThreshold]);

  const lowStockItems = useMemo(() => {
    if (!items) return [];
    return getLowStockItems(companyId);
  }, [items, companyId]);

  const expiringItems = useMemo(() => {
    if (!items) return [];
    return getExpiringItems(companyId, daysThreshold);
  }, [items, companyId, daysThreshold]);

  return {
    currentStock,
    isLowStock,
    isExpiring,
    lowStockItems,
    expiringItems,
  };
}
