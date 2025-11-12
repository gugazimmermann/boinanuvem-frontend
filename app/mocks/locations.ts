import type { Area, Location, LocationFormData } from "~/types";
import { AreaType, LocationType } from "~/types";

export { AreaType, LocationType };
export type { Area, Location, LocationFormData };

export const mockLocations: Location[] = [
  // Fazenda do Juca - 12 locations
  {
    id: "660e8400-e29b-41d4-a716-446655440010",
    code: "001",
    name: "Pasto Norte",
    locationType: LocationType.PASTURE,
    area: { value: 28.5, type: AreaType.HECTARES },
    status: "active",
    createdAt: "2024-01-20",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440010",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440011",
    code: "002",
    name: "Pasto Sul",
    locationType: LocationType.PASTURE,
    area: { value: 32.0, type: AreaType.HECTARES },
    status: "active",
    createdAt: "2024-01-22",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440010",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440012",
    code: "003",
    name: "Pasto Leste",
    locationType: LocationType.PASTURE,
    area: { value: 25.0, type: AreaType.HECTARES },
    status: "active",
    createdAt: "2024-01-25",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440010",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440013",
    code: "004",
    name: "Pasto Oeste",
    locationType: LocationType.PASTURE,
    area: { value: 20.5, type: AreaType.HECTARES },
    status: "active",
    createdAt: "2024-01-28",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440010",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440014",
    code: "005",
    name: "Confinamento Principal",
    locationType: LocationType.FEEDLOT,
    area: { value: 2.5, type: AreaType.HECTARES },
    status: "active",
    createdAt: "2024-02-01",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440010",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440015",
    code: "006",
    name: "Semi-confinamento",
    locationType: LocationType.SEMI_FEEDLOT,
    area: { value: 5.0, type: AreaType.HECTARES },
    status: "active",
    createdAt: "2024-02-05",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440010",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440016",
    code: "007",
    name: "Curral de Manejo",
    locationType: LocationType.CORRAL,
    area: { value: 320, type: AreaType.SQUARE_METERS },
    status: "active",
    createdAt: "2024-02-10",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440010",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440017",
    code: "008",
    name: "Silo de Milho",
    locationType: LocationType.SILO,
    area: { value: 50, type: AreaType.SQUARE_METERS },
    status: "active",
    createdAt: "2024-02-15",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440010",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440018",
    code: "009",
    name: "Celeiro",
    locationType: LocationType.BARN,
    area: { value: 300, type: AreaType.SQUARE_METERS },
    status: "active",
    createdAt: "2024-02-20",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440010",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440019",
    code: "010",
    name: "Armazém de Ração",
    locationType: LocationType.STORAGE,
    area: { value: 85, type: AreaType.SQUARE_METERS },
    status: "active",
    createdAt: "2024-02-25",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440010",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440020",
    code: "011",
    name: "Sala de Ordenha",
    locationType: LocationType.MILKING_PARLOR,
    area: { value: 220, type: AreaType.SQUARE_METERS },
    status: "active",
    createdAt: "2024-03-01",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440010",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440021",
    code: "012",
    name: "Escritório",
    locationType: LocationType.OFFICE,
    area: { value: 40, type: AreaType.SQUARE_METERS },
    status: "active",
    createdAt: "2024-03-05",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440010",
  },
  // Sítio Limoeiro - 8 locations
  {
    id: "660e8400-e29b-41d4-a716-446655440022",
    code: "013",
    name: "Pasto Central",
    locationType: LocationType.PASTURE,
    area: { value: 22.5, type: AreaType.HECTARES },
    status: "active",
    createdAt: "2024-02-20",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440011",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440023",
    code: "014",
    name: "Pasto Superior",
    locationType: LocationType.PASTURE,
    area: { value: 18.0, type: AreaType.HECTARES },
    status: "active",
    createdAt: "2024-02-22",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440011",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440024",
    code: "015",
    name: "Piquete 1",
    locationType: LocationType.PADDOCK,
    area: { value: 12.0, type: AreaType.HECTARES },
    status: "active",
    createdAt: "2024-02-25",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440011",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440025",
    code: "016",
    name: "Piquete 2",
    locationType: LocationType.PADDOCK,
    area: { value: 10.5, type: AreaType.HECTARES },
    status: "active",
    createdAt: "2024-02-28",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440011",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440026",
    code: "017",
    name: "Campo de Aves",
    locationType: LocationType.FIELD,
    area: { value: 8.0, type: AreaType.HECTARES },
    status: "active",
    createdAt: "2024-03-01",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440011",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440027",
    code: "018",
    name: "Curral",
    locationType: LocationType.CORRAL,
    area: { value: 180, type: AreaType.SQUARE_METERS },
    status: "active",
    createdAt: "2024-03-05",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440011",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440028",
    code: "019",
    name: "Armazém",
    locationType: LocationType.STORAGE,
    area: { value: 600, type: AreaType.SQUARE_METERS },
    status: "active",
    createdAt: "2024-03-10",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440011",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440029",
    code: "020",
    name: "Residência",
    locationType: LocationType.RESIDENCE,
    area: { value: 180, type: AreaType.SQUARE_METERS },
    status: "active",
    createdAt: "2024-03-12",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440011",
  },
  // Chácara do Juca - 4 locations
  {
    id: "660e8400-e29b-41d4-a716-446655440030",
    code: "021",
    name: "Pasto Principal",
    locationType: LocationType.PASTURE,
    area: { value: 20.0, type: AreaType.HECTARES },
    status: "active",
    createdAt: "2024-03-10",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440012",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440031",
    code: "022",
    name: "Pasto Secundário",
    locationType: LocationType.PASTURE,
    area: { value: 15.5, type: AreaType.HECTARES },
    status: "active",
    createdAt: "2024-03-12",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440012",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440032",
    code: "023",
    name: "Campo de Cultivo",
    locationType: LocationType.FIELD,
    area: { value: 8.0, type: AreaType.HECTARES },
    status: "active",
    createdAt: "2024-03-15",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440012",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440033",
    code: "024",
    name: "Garagem",
    locationType: LocationType.GARAGE,
    area: { value: 100, type: AreaType.SQUARE_METERS },
    status: "active",
    createdAt: "2024-03-18",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
    propertyId: "550e8400-e29b-41d4-a716-446655440012",
  },
];

export function getLocationById(locationId: string | undefined): Location | undefined {
  if (!locationId) return undefined;
  return mockLocations.find((location) => location.id === locationId);
}

export function getLocationsByPropertyId(propertyId: string): Location[] {
  return mockLocations.filter((location) => location.propertyId === propertyId);
}

export function getLocationsByCompanyId(companyId: string): Location[] {
  return mockLocations.filter((location) => location.companyId === companyId);
}

export function addLocation(data: LocationFormData): Location {
  const lastId =
    mockLocations.length > 0
      ? mockLocations[mockLocations.length - 1].id
      : "660e8400-e29b-41d4-a716-446655440009";
  const lastPart = lastId.split("-").pop() || "446655440009";
  const lastNumber = parseInt(lastPart, 10);
  const nextNumber = (lastNumber + 1).toString().padStart(12, "0");

  const newLocation: Location = {
    ...data,
    id: `660e8400-e29b-41d4-a716-${nextNumber}`,
    createdAt: new Date().toISOString().split("T")[0],
  };
  mockLocations.push(newLocation);
  return newLocation;
}

export function deleteLocation(locationId: string): boolean {
  const index = mockLocations.findIndex((location) => location.id === locationId);
  if (index !== -1) {
    mockLocations.splice(index, 1);
    return true;
  }
  return false;
}

export function updateLocation(locationId: string, data: Partial<LocationFormData>): boolean {
  const index = mockLocations.findIndex((location) => location.id === locationId);
  if (index !== -1) {
    mockLocations[index] = {
      ...mockLocations[index],
      ...data,
    };
    return true;
  }
  return false;
}
