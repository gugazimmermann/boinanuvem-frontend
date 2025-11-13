import type { Property, PropertyFormData } from "~/types";
import { AreaType } from "~/types";

export type { Property, PropertyFormData };

export const mockProperties: Property[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    code: "001",
    name: "Fazenda do Juca",
    area: {
      value: 150.5,
      type: AreaType.HECTARES,
    },
    status: "active",
    createdAt: "2025-01-15",
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
    pasturePlanning: [
      {
        month: "January",
        min: 22.34,
        max: 27.92,
        precipitation: 207.87,
        classification: "Excellent",
      },
      {
        month: "February",
        min: 22.42,
        max: 27.98,
        precipitation: 187.72,
        classification: "Excellent",
      },
      {
        month: "March",
        min: 21.66,
        max: 27.02,
        precipitation: 146.97,
        classification: "Excellent",
      },
      {
        month: "April",
        min: 19.41,
        max: 25.09,
        precipitation: 106.01,
        classification: "Excellent",
      },
      {
        month: "May",
        min: 16.58,
        max: 22.39,
        precipitation: 104.95,
        classification: "Good",
      },
      {
        month: "June",
        min: 14.56,
        max: 20.66,
        precipitation: 109.53,
        classification: "Good",
      },
      {
        month: "July",
        min: 13.76,
        max: 20.01,
        precipitation: 80.18,
        classification: "Good",
      },
      {
        month: "August",
        min: 14.47,
        max: 20.58,
        precipitation: 90.39,
        classification: "Good",
      },
      {
        month: "September",
        min: 16.36,
        max: 21.96,
        precipitation: 105.63,
        classification: "Good",
      },
      {
        month: "October",
        min: 18.19,
        max: 23.21,
        precipitation: 140.11,
        classification: "Good",
      },
      {
        month: "November",
        min: 19.51,
        max: 24.69,
        precipitation: 142.2,
        classification: "Excellent",
      },
      {
        month: "December",
        min: 21.25,
        max: 26.67,
        precipitation: 153.41,
        classification: "Excellent",
      },
    ],
    breedingMonths: ["April", "May", "June", "July", "February", "March"],
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440011",
    code: "002",
    name: "Sítio Limoeiro",
    area: {
      value: 85.2,
      type: AreaType.HECTARES,
    },
    status: "active",
    createdAt: "2025-02-20",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    street: "Rua Simão Piaz",
    number: "SN",
    complement: "Sítio Limoeiro",
    neighborhood: "LIMOEIRO",
    city: "São João do Itaperiú",
    state: "SC",
    zipCode: "88395000",
    latitude: -26.56,
    longitude: -48.759,
    pasturePlanning: [
      {
        month: "January",
        min: 21.5,
        max: 27.2,
        precipitation: 195.3,
        classification: "Excellent",
      },
      {
        month: "February",
        min: 21.8,
        max: 27.5,
        precipitation: 175.8,
        classification: "Excellent",
      },
      {
        month: "March",
        min: 21.2,
        max: 26.8,
        precipitation: 142.5,
        classification: "Excellent",
      },
      {
        month: "April",
        min: 19.1,
        max: 24.8,
        precipitation: 98.5,
        classification: "Good",
      },
      {
        month: "May",
        min: 16.2,
        max: 22.1,
        precipitation: 95.2,
        classification: "Good",
      },
      {
        month: "June",
        min: 14.3,
        max: 20.4,
        precipitation: 102.1,
        classification: "Good",
      },
      {
        month: "July",
        min: 13.5,
        max: 19.8,
        precipitation: 75.6,
        classification: "Good",
      },
      {
        month: "August",
        min: 14.2,
        max: 20.3,
        precipitation: 85.9,
        classification: "Good",
      },
      {
        month: "September",
        min: 16.1,
        max: 21.7,
        precipitation: 98.2,
        classification: "Good",
      },
      {
        month: "October",
        min: 18.0,
        max: 23.0,
        precipitation: 135.4,
        classification: "Good",
      },
      {
        month: "November",
        min: 19.3,
        max: 24.5,
        precipitation: 138.7,
        classification: "Excellent",
      },
      {
        month: "December",
        min: 21.0,
        max: 26.4,
        precipitation: 148.9,
        classification: "Excellent",
      },
    ],
    breedingMonths: ["April", "May", "June", "July", "February", "March"],
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440012",
    code: "003",
    name: "Chácara do Juca",
    area: {
      value: 45.8,
      type: AreaType.HECTARES,
    },
    status: "active",
    createdAt: "2025-03-10",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    street: "Rua Simão Piaz",
    number: "SN",
    complement: "Chácara do Juca",
    neighborhood: "LIMOEIRO",
    city: "São João do Itaperiú",
    state: "SC",
    zipCode: "88395000",
    latitude: -26.561,
    longitude: -48.76,
    pasturePlanning: [
      {
        month: "January",
        min: 22.1,
        max: 27.8,
        precipitation: 201.2,
        classification: "Excellent",
      },
      {
        month: "February",
        min: 22.3,
        max: 28.1,
        precipitation: 182.4,
        classification: "Excellent",
      },
      {
        month: "March",
        min: 21.5,
        max: 27.1,
        precipitation: 149.8,
        classification: "Excellent",
      },
      {
        month: "April",
        min: 19.3,
        max: 25.2,
        precipitation: 103.5,
        classification: "Good",
      },
      {
        month: "May",
        min: 16.4,
        max: 22.5,
        precipitation: 101.2,
        classification: "Good",
      },
      {
        month: "June",
        min: 14.4,
        max: 20.7,
        precipitation: 107.8,
        classification: "Good",
      },
      {
        month: "July",
        min: 13.6,
        max: 20.2,
        precipitation: 78.5,
        classification: "Good",
      },
      {
        month: "August",
        min: 14.3,
        max: 20.7,
        precipitation: 88.9,
        classification: "Good",
      },
      {
        month: "September",
        min: 16.2,
        max: 22.1,
        precipitation: 103.1,
        classification: "Good",
      },
      {
        month: "October",
        min: 18.1,
        max: 23.4,
        precipitation: 137.8,
        classification: "Good",
      },
      {
        month: "November",
        min: 19.4,
        max: 24.8,
        precipitation: 140.5,
        classification: "Excellent",
      },
      {
        month: "December",
        min: 21.1,
        max: 26.8,
        precipitation: 151.2,
        classification: "Excellent",
      },
    ],
    breedingMonths: ["April", "May", "June", "July", "February", "March"],
  },
];

export function getPropertyById(propertyId: string | undefined): Property | undefined {
  if (!propertyId) return undefined;
  return mockProperties.find((property) => property.id === propertyId);
}

export function getPropertiesByCompanyId(companyId: string): Property[] {
  return mockProperties.filter((property) => property.companyId === companyId);
}

export function addProperty(data: PropertyFormData): Property {
  const lastId =
    mockProperties.length > 0
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
