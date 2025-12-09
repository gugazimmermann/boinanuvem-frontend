import type { ServiceProvider, ServiceProviderFormData } from "~/types";
import { createEntityService } from "./entity-service-factory";

const serviceProviderService = createEntityService<ServiceProvider, ServiceProviderFormData>({
  endpoint: "/service-providers",
  entityName: "prestador de serviço",
  entityNamePlural: "prestadores de serviço",
  supportsCNPJ: true,
});

/**
 * Get all service providers for the current user's company via API
 */
export async function getServiceProviders(): Promise<ServiceProvider[]> {
  return serviceProviderService.getAll();
}

/**
 * Get a single service provider by ID via API
 */
export async function getServiceProviderById(serviceProviderId: string): Promise<ServiceProvider> {
  return serviceProviderService.getById(serviceProviderId);
}

/**
 * Create a new service provider via API
 */
export async function addServiceProvider(data: ServiceProviderFormData): Promise<ServiceProvider> {
  return serviceProviderService.add(data);
}

/**
 * Update a service provider via API
 */
export async function updateServiceProvider(
  serviceProviderId: string,
  data: Partial<ServiceProviderFormData>
): Promise<ServiceProvider> {
  return serviceProviderService.update(serviceProviderId, data);
}

/**
 * Delete a service provider via API
 */
export async function deleteServiceProvider(serviceProviderId: string): Promise<void> {
  return serviceProviderService.remove(serviceProviderId);
}
