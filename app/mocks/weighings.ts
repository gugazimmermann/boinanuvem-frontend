import type { Weighing, WeighingFormData } from "~/types";

export type { Weighing, WeighingFormData };

export const mockWeighings: Weighing[] = [
  {
    id: "ww0e8400-e29b-41d4-a716-446655440010",
    animalId: "bb0e8400-e29b-41d4-a716-446655440010",
    employeeIds: ["770e8400-e29b-41d4-a716-446655440010"],
    serviceProviderIds: [],
    date: "2025-11-05",
    weight: 465,
    observation: "Pesagem mensal de rotina",
    createdAt: "2025-11-05",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
  },
  {
    id: "ww0e8400-e29b-41d4-a716-446655440011",
    animalId: "bb0e8400-e29b-41d4-a716-446655440010",
    employeeIds: ["770e8400-e29b-41d4-a716-446655440010", "770e8400-e29b-41d4-a716-446655440011"],
    serviceProviderIds: ["880e8400-e29b-41d4-a716-446655440010"],
    date: "2025-10-01",
    weight: 442,
    observation: "Pesagem com veterinário presente",
    createdAt: "2025-10-01",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
  },
  {
    id: "ww0e8400-e29b-41d4-a716-446655440016",
    animalId: "bb0e8400-e29b-41d4-a716-446655440010",
    employeeIds: ["770e8400-e29b-41d4-a716-446655440010"],
    serviceProviderIds: [],
    date: "2025-08-27",
    weight: 425,
    observation: "Pesagem de rotina",
    createdAt: "2025-08-27",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
  },
  {
    id: "ww0e8400-e29b-41d4-a716-446655440012",
    animalId: "bb0e8400-e29b-41d4-a716-446655440011",
    employeeIds: ["770e8400-e29b-41d4-a716-446655440012"],
    serviceProviderIds: [],
    date: "2025-10-30",
    weight: 378,
    observation: "Pesagem mensal",
    createdAt: "2025-10-30",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
  },
  {
    id: "ww0e8400-e29b-41d4-a716-446655440013",
    animalId: "bb0e8400-e29b-41d4-a716-446655440011",
    employeeIds: ["770e8400-e29b-41d4-a716-446655440010"],
    serviceProviderIds: [],
    date: "2025-09-17",
    weight: 362,
    observation: "Pesagem de controle",
    createdAt: "2025-09-17",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
  },
  {
    id: "ww0e8400-e29b-41d4-a716-446655440014",
    animalId: "bb0e8400-e29b-41d4-a716-446655440012",
    employeeIds: ["770e8400-e29b-41d4-a716-446655440010"],
    serviceProviderIds: ["880e8400-e29b-41d4-a716-446655440011"],
    date: "2025-11-08",
    weight: 438,
    observation: "Pesagem após suplementação",
    createdAt: "2025-11-08",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
  },
  {
    id: "ww0e8400-e29b-41d4-a716-446655440015",
    animalId: "bb0e8400-e29b-41d4-a716-446655440012",
    employeeIds: ["770e8400-e29b-41d4-a716-446655440011"],
    serviceProviderIds: [],
    date: "2025-10-15",
    weight: 415,
    observation: "Pesagem de rotina",
    createdAt: "2025-10-15",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
  },
  {
    id: "ww0e8400-e29b-41d4-a716-446655440017",
    animalId: "bb0e8400-e29b-41d4-a716-446655440012",
    employeeIds: ["770e8400-e29b-41d4-a716-446655440012"],
    serviceProviderIds: ["880e8400-e29b-41d4-a716-446655440010"],
    date: "2025-09-12",
    weight: 395,
    observation: "Primeira pesagem do período",
    createdAt: "2025-09-12",
    companyId: "550e8400-e29b-41d4-a716-446655440000",
  },
];

export function getWeighingById(weighingId: string | undefined): Weighing | undefined {
  if (!weighingId) return undefined;
  return mockWeighings.find((weighing) => weighing.id === weighingId);
}

export function getWeighingsByAnimalId(animalId: string): Weighing[] {
  return mockWeighings.filter((weighing) => weighing.animalId === animalId);
}

export function getWeighingsByCompanyId(companyId: string): Weighing[] {
  return mockWeighings.filter((weighing) => weighing.companyId === companyId);
}

export function addWeighing(data: WeighingFormData): Weighing {
  const lastId =
    mockWeighings.length > 0
      ? mockWeighings[mockWeighings.length - 1].id
      : "ww0e8400-e29b-41d4-a716-446655440009";
  const lastPart = lastId.split("-").pop() || "446655440009";
  const lastNumber = parseInt(lastPart, 10);
  const nextNumber = (lastNumber + 1).toString().padStart(12, "0");

  const newWeighing: Weighing = {
    ...data,
    id: `ww0e8400-e29b-41d4-a716-${nextNumber}`,
    createdAt: new Date().toISOString().split("T")[0],
  };
  mockWeighings.push(newWeighing);
  return newWeighing;
}

export function deleteWeighing(weighingId: string): boolean {
  const index = mockWeighings.findIndex((weighing) => weighing.id === weighingId);
  if (index !== -1) {
    mockWeighings.splice(index, 1);
    return true;
  }
  return false;
}

export function updateWeighing(weighingId: string, data: Partial<WeighingFormData>): boolean {
  const index = mockWeighings.findIndex((weighing) => weighing.id === weighingId);
  if (index !== -1) {
    mockWeighings[index] = {
      ...mockWeighings[index],
      ...data,
    };
    return true;
  }
  return false;
}
