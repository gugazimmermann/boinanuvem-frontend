import type { Property, PropertyFormData } from "~/types";
import { mockProperties } from "~/mocks/properties";
import { findById, findByField, createEntity, updateEntity, deleteEntity } from "./base-service";

const ID_PREFIX = "550e8400-e29b-41d4-a716";
const DEFAULT_ID = "550e8400-e29b-41d4-a716-446655440009";

export function getPropertyById(propertyId: string | undefined): Property | undefined {
  return findById(mockProperties, propertyId);
}

export function getPropertiesByCompanyId(companyId: string): Property[] {
  return findByField(mockProperties, "companyId", companyId);
}

export function addProperty(data: PropertyFormData): Property {
  return createEntity(mockProperties, data, ID_PREFIX, DEFAULT_ID);
}

export function updateProperty(propertyId: string, data: Partial<PropertyFormData>): boolean {
  return updateEntity(mockProperties, propertyId, data);
}

export function deleteProperty(propertyId: string): boolean {
  return deleteEntity(mockProperties, propertyId);
}
