export interface Property {
  id: string;
  code: string;
  name: string;
  area: number;
  status: "active" | "inactive";
  createdAt: string;
  companyId: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

export const mockProperties: Property[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    code: "001",
    name: "Fazenda do Juca",
    area: 150.5,
    status: "active",
    createdAt: "2024-01-15",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    street: "Rua Simão Piaz",
    number: "SN",
    complement: "Fazenda do Juca",
    neighborhood: "LIMOEIRO",
    city: "São João do Itaperiú",
    state: "SC",
    zipCode: "88395000",
    latitude: -26.559317100277863,
    longitude: -48.75873810994559,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440011",
    code: "002",
    name: "Sítio Limoeiro",
    area: 85.2,
    status: "active",
    createdAt: "2024-02-20",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    street: "Rua Simão Piaz",
    number: "SN",
    complement: "Sítio Limoeiro",
    neighborhood: "LIMOEIRO",
    city: "São João do Itaperiú",
    state: "SC",
    zipCode: "88395000",
    latitude: -26.560000000000000,
    longitude: -48.759000000000000,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440012",
    code: "003",
    name: "Chácara do Juca",
    area: 45.8,
    status: "active",
    createdAt: "2024-03-10",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    street: "Rua Simão Piaz",
    number: "SN",
    complement: "Chácara do Juca",
    neighborhood: "LIMOEIRO",
    city: "São João do Itaperiú",
    state: "SC",
    zipCode: "88395000",
    latitude: -26.561000000000000,
    longitude: -48.760000000000000,
  },
];

export function getPropertyById(propertyId: string | undefined): Property | undefined {
  if (!propertyId) return undefined;
  return mockProperties.find((property) => property.id === propertyId);
}

export function getPropertiesByCompanyId(companyId: string): Property[] {
  return mockProperties.filter((property) => property.companyId === companyId);
}

export interface PropertyFormData {
  code: string;
  name: string;
  area: number;
  status: "active" | "inactive";
  companyId: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

export function addProperty(data: PropertyFormData): Property {
  const lastId = mockProperties.length > 0 
    ? mockProperties[mockProperties.length - 1].id 
    : "550e8400-e29b-41d4-a716-446655440009";
  const lastPart = lastId.split("-").pop() || "446655440009";
  const lastNumber = parseInt(lastPart, 10);
  const nextNumber = (lastNumber + 1).toString().padStart(12, "0");
  
  const newProperty: Property = {
    ...data,
    id: `550e8400-e29b-41d4-a716-${nextNumber}`,
    createdAt: new Date().toISOString().split("T")[0],
  };
  mockProperties.push(newProperty);
  return newProperty;
}

export function deleteProperty(propertyId: string): boolean {
  const index = mockProperties.findIndex((property) => property.id === propertyId);
  if (index !== -1) {
    mockProperties.splice(index, 1);
    return true;
  }
  return false;
}

export function updateProperty(propertyId: string, data: Partial<PropertyFormData>): boolean {
  const index = mockProperties.findIndex((property) => property.id === propertyId);
  if (index !== -1) {
    mockProperties[index] = {
      ...mockProperties[index],
      ...data,
    };
    return true;
  }
  return false;
}

