import type { ServiceProvider, ServiceProviderFormData } from "~/types";

export type { ServiceProvider, ServiceProviderFormData };

export const mockServiceProviders: ServiceProvider[] = [
  {
    id: "880e8400-e29b-41d4-a716-446655440010",
    code: "001",
    name: "AgroVet Serviços",
    cnpj: "12.345.678/0001-90",
    email: "contato@agrovet.com.br",
    phone: "(47) 33333-3333",
    status: "active",
    createdAt: "2025-01-10",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyIds: ["550e8400-e29b-41d4-a716-446655440010", "550e8400-e29b-41d4-a716-446655440011"],
    street: "Rua das Flores",
    number: "123",
    complement: "Sala 101",
    neighborhood: "Centro",
    city: "Joinville",
    state: "SC",
    zipCode: "89201-000",
  },
  {
    id: "880e8400-e29b-41d4-a716-446655440011",
    code: "002",
    name: "João Veterinário",
    cpf: "111.222.333-44",
    email: "joao.vet@example.com",
    phone: "(47) 44444-4444",
    status: "active",
    createdAt: "2025-02-15",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyIds: ["550e8400-e29b-41d4-a716-446655440010"],
    street: "Avenida Principal",
    number: "456",
    neighborhood: "Jardim América",
    city: "Blumenau",
    state: "SC",
    zipCode: "89010-000",
  },
  {
    id: "880e8400-e29b-41d4-a716-446655440012",
    code: "003",
    name: "AgroTec Consultoria",
    cnpj: "98.765.432/0001-10",
    email: "contato@agrotec.com.br",
    phone: "(47) 55555-5555",
    status: "active",
    createdAt: "2025-03-05",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyIds: ["550e8400-e29b-41d4-a716-446655440011", "550e8400-e29b-41d4-a716-446655440012"],
    street: "Rua Comercial",
    number: "789",
    neighborhood: "Industrial",
    city: "Florianópolis",
    state: "SC",
    zipCode: "88010-000",
  },
];

export function getServiceProviderById(
  serviceProviderId: string | undefined
): ServiceProvider | undefined {
  if (!serviceProviderId) return undefined;
  return mockServiceProviders.find((provider) => provider.id === serviceProviderId);
}

export function getServiceProvidersByCompanyId(companyId: string): ServiceProvider[] {
  return mockServiceProviders.filter((provider) => provider.companyId === companyId);
}

export function getServiceProvidersByPropertyId(propertyId: string): ServiceProvider[] {
  return mockServiceProviders.filter((provider) => provider.propertyIds.includes(propertyId));
}

export function addServiceProvider(data: ServiceProviderFormData): ServiceProvider {
  const lastId =
    mockServiceProviders.length > 0
      ? mockServiceProviders[mockServiceProviders.length - 1].id
      : "880e8400-e29b-41d4-a716-446655440009";
  const lastPart = lastId.split("-").pop() || "446655440009";
  const lastNumber = parseInt(lastPart, 10);
  const nextNumber = (lastNumber + 1).toString().padStart(12, "0");

  const newServiceProvider: ServiceProvider = {
    ...data,
    id: `880e8400-e29b-41d4-a716-${nextNumber}`,
    createdAt: new Date().toISOString().split("T")[0],
  };
  mockServiceProviders.push(newServiceProvider);
  return newServiceProvider;
}

export function deleteServiceProvider(serviceProviderId: string): boolean {
  const index = mockServiceProviders.findIndex((provider) => provider.id === serviceProviderId);
  if (index !== -1) {
    mockServiceProviders.splice(index, 1);
    return true;
  }
  return false;
}

export function updateServiceProvider(
  serviceProviderId: string,
  data: Partial<ServiceProviderFormData>
): boolean {
  const index = mockServiceProviders.findIndex((provider) => provider.id === serviceProviderId);
  if (index !== -1) {
    mockServiceProviders[index] = {
      ...mockServiceProviders[index],
      ...data,
    };
    return true;
  }
  return false;
}
