import type { EntityFormData } from "~/hooks/use-entity-form";
import type { BuyerFormData, SupplierFormData, ServiceProviderFormData } from "~/types";

export type EntityType = "buyer" | "supplier" | "service-provider";

export interface EntityData {
  code: string;
  name: string;
  cpf?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  status: "active" | "inactive";
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  propertyIds?: string[];
}

/**
 * Maps entity data to EntityFormData format
 */
export function mapEntityToFormData(entity: EntityData): Partial<EntityFormData> {
  return {
    code: entity.code,
    name: entity.name,
    cpf: entity.cpf || "",
    cnpj: entity.cnpj || "",
    email: entity.email || "",
    phone: entity.phone || "",
    status: entity.status,
    zipCode: entity.zipCode || "",
    street: entity.street || "",
    number: entity.number || "",
    complement: entity.complement || "",
    neighborhood: entity.neighborhood || "",
    city: entity.city || "",
    state: entity.state || "",
    propertyIds: entity.propertyIds || [],
  };
}

/**
 * Maps EntityFormData to entity form data (BuyerFormData, SupplierFormData, or ServiceProviderFormData)
 * All three types have identical structure, so a single function can handle all cases.
 */
export function mapFormDataToEntity(
  data: EntityFormData,
  companyId: string
): BuyerFormData | SupplierFormData | ServiceProviderFormData {
  return {
    code: data.code,
    name: data.name,
    cpf: data.cpf || undefined,
    cnpj: data.cnpj || undefined,
    email: data.email || undefined,
    phone: data.phone || undefined,
    status: data.status,
    companyId,
    propertyIds: data.propertyIds,
    street: data.street || undefined,
    number: data.number || undefined,
    complement: data.complement || undefined,
    neighborhood: data.neighborhood || undefined,
    city: data.city || undefined,
    state: data.state || undefined,
    zipCode: data.zipCode || undefined,
  };
}

/**
 * Maps EntityFormData to partial entity data for updates
 */
export function mapFormDataToEntityUpdate(
  data: EntityFormData,
  _entityType: EntityType
): Partial<BuyerFormData | SupplierFormData | ServiceProviderFormData> {
  const baseData = {
    code: data.code,
    name: data.name,
    cpf: data.cpf || undefined,
    cnpj: data.cnpj || undefined,
    email: data.email || undefined,
    phone: data.phone || undefined,
    status: data.status,
    propertyIds: data.propertyIds,
    street: data.street || undefined,
    number: data.number || undefined,
    complement: data.complement || undefined,
    neighborhood: data.neighborhood || undefined,
    city: data.city || undefined,
    state: data.state || undefined,
    zipCode: data.zipCode || undefined,
  };

  return baseData;
}
