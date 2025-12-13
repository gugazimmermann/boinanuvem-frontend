import { useMemo, useState, useEffect } from "react";
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

  const [currentStock, setCurrentStock] = useState<number>(0);

  useEffect(() => {
    const loadCurrentStock = async () => {
      if (!item) {
        setCurrentStock(0);
        return;
      }
      try {
        const stock = await getCurrentStock(item.id, propertyId);
        setCurrentStock(stock);
      } catch (error) {
        console.error("Failed to load current stock:", error);
        setCurrentStock(0);
      }
    };
    loadCurrentStock();
  }, [item, propertyId]);

  const isLowStock = useMemo(() => {
    if (!item) return false;
    return currentStock < item.minimumStock;
  }, [item, currentStock]);

  const isExpiring = useMemo(() => {
    if (!item) return false;
    return isExpiringSoon(item.expirationDate, daysThreshold);
  }, [item, daysThreshold]);

  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    const loadLowStockItems = async () => {
      if (!items) {
        setLowStockItems([]);
        return;
      }
      try {
        const items = await getLowStockItems(companyId);
        setLowStockItems(items);
      } catch (error) {
        console.error("Failed to load low stock items:", error);
        setLowStockItems([]);
      }
    };
    loadLowStockItems();
  }, [items, companyId]);

  const [expiringItems, setExpiringItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    const loadExpiringItems = async () => {
      if (!items) {
        setExpiringItems([]);
        return;
      }
      try {
        const items = await getExpiringItems(companyId, daysThreshold);
        setExpiringItems(items);
      } catch (error) {
        console.error("Failed to load expiring items:", error);
        setExpiringItems([]);
      }
    };
    loadExpiringItems();
  }, [items, companyId, daysThreshold]);

  return {
    currentStock,
    isLowStock,
    isExpiring,
    lowStockItems,
    expiringItems,
  };
}
