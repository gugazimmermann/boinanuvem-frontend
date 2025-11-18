import type { ServiceProvider, ServiceProviderFormData } from "~/types";
import { mockServiceProviders } from "~/mocks/service-providers";
import {
  findById,
  findByField,
  findByFieldIncludes,
  createEntity,
  updateEntity,
  deleteEntity,
} from "./base-service";

const ID_PREFIX = "880e8400-e29b-41d4-a716";
const DEFAULT_ID = "880e8400-e29b-41d4-a716-446655440009";

export function getServiceProviderById(
  serviceProviderId: string | undefined
): ServiceProvider | undefined {
  return findById(mockServiceProviders, serviceProviderId);
}

export function getServiceProvidersByCompanyId(companyId: string): ServiceProvider[] {
  return findByField(mockServiceProviders, "companyId", companyId);
}

export function getServiceProvidersByPropertyId(propertyId: string): ServiceProvider[] {
  return findByFieldIncludes(mockServiceProviders, "propertyIds", propertyId);
}

export function addServiceProvider(data: ServiceProviderFormData): ServiceProvider {
  return createEntity(mockServiceProviders, data, ID_PREFIX, DEFAULT_ID);
}

export function updateServiceProvider(
  serviceProviderId: string,
  data: Partial<ServiceProviderFormData>
): boolean {
  return updateEntity(mockServiceProviders, serviceProviderId, data);
}

export function deleteServiceProvider(serviceProviderId: string): boolean {
  return deleteEntity(mockServiceProviders, serviceProviderId);
}
