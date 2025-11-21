export enum InventoryItemCategory {
  TOOLS = "tools",
  FEED = "feed",
  SUPPLEMENTS = "supplements",
  VITAMINS = "vitamins",
  MEDICINES = "medicines",
  VACCINES = "vaccines",
  CUSTOM = "custom",
}

export enum InventoryMovementType {
  PURCHASE = "purchase",
  SALE = "sale",
  ADJUSTMENT = "adjustment",
  CONSUMPTION = "consumption",
  TRANSFER = "transfer",
}

export interface InventoryItem extends Record<string, unknown> {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: InventoryItemCategory;
  customCategory?: string;
  unit: string;
  minimumStock: number;
  unitPrice?: number;
  supplierId?: string;
  hasExpiration: boolean;
  expirationDate?: string;
  companyId: string;
  propertyIds: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface InventoryItemFormData {
  code: string;
  name: string;
  description?: string;
  category: InventoryItemCategory;
  customCategory?: string;
  unit: string;
  minimumStock: number;
  unitPrice?: number;
  supplierId?: string;
  hasExpiration: boolean;
  expirationDate?: string;
  companyId: string;
  propertyIds: string[];
}

export interface InventoryMovement extends Record<string, unknown> {
  id: string;
  itemId: string;
  type: InventoryMovementType;
  quantity: number;
  unitPrice?: number;
  date: string;
  description?: string;
  supplierId?: string;
  cashFlowId?: string;
  propertyId: string;
  companyId: string;
  locationId?: string;
  expirationDate?: string;
  createdAt: string;
}

export interface InventoryMovementFormData {
  itemId: string;
  type: InventoryMovementType;
  quantity: number;
  unitPrice?: number;
  date: string;
  description?: string;
  supplierId?: string;
  cashFlowId?: string;
  propertyId: string;
  companyId: string;
  locationId?: string;
  expirationDate?: string;
  createCashFlowTransaction?: boolean;
}
