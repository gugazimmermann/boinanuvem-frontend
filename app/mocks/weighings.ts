import type { Weighing, WeighingFormData } from "~/types";
import { mockAnimals } from "./animals";
import { getBirthByAnimalId } from "./births";
import { getAcquisitionByAnimalId } from "./acquisitions";

export type { Weighing, WeighingFormData };

const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";

function generateWeighingId(index: number): string {
  const base = 446655440100 + index;
  return `ww0e8400-e29b-41d4-a716-${base.toString().padStart(12, "0")}`;
}

const employees = [
  "770e8400-e29b-41d4-a716-446655440010",
  "770e8400-e29b-41d4-a716-446655440011",
  "770e8400-e29b-41d4-a716-446655440012",
];

const serviceProviders = [
  "880e8400-e29b-41d4-a716-446655440010",
  "880e8400-e29b-41d4-a716-446655440011",
];

function getInitialWeight(birthDate: string | undefined, acquisitionDate: string | undefined, gender: "male" | "female" | undefined): number {
  const referenceDate = birthDate || acquisitionDate;
  if (!referenceDate) return 200;
  
  const ref = new Date(referenceDate);
  const now = new Date();
  const ageInMonths = (now.getFullYear() - ref.getFullYear()) * 12 + (now.getMonth() - ref.getMonth());
  
  let baseWeight = 150;
  if (ageInMonths < 6) {
    baseWeight = 150 + (ageInMonths * 20);
  } else if (ageInMonths < 12) {
    baseWeight = 270 + ((ageInMonths - 6) * 15);
  } else if (ageInMonths < 24) {
    baseWeight = 360 + ((ageInMonths - 12) * 10);
  } else {
    baseWeight = 480 + ((ageInMonths - 24) * 5);
  }
  
  if (gender === "male") {
    baseWeight *= 1.15;
  } else if (gender === "female") {
    baseWeight *= 0.95;
  }
  
  return Math.round(baseWeight);
}

function generateWeighingsForAnimal(animal: typeof mockAnimals[0], animalIndex: number): Weighing[] {
  const weighings: Weighing[] = [];
  
  const numWeighings = animalIndex % 10 < 2 ? 2 : Math.min(2 + (animalIndex % 9), 10);
  
  const birth = getBirthByAnimalId(animal.id);
  const acquisition = getAcquisitionByAnimalId(animal.id);
  const gender = birth?.gender || acquisition?.gender;
  const referenceDate = birth?.birthDate || acquisition?.birthDate || animal.createdAt;
  
  const baseWeight = getInitialWeight(birth?.birthDate, acquisition?.birthDate, gender);
  
  const today = new Date();
  const lastWeighingDaysAgo = Math.floor(Math.random() * 60);
  const lastWeighingDate = new Date(today);
  lastWeighingDate.setDate(lastWeighingDate.getDate() - lastWeighingDaysAgo);
  
  for (let i = 0; i < numWeighings; i++) {
    const weighingDate = new Date(lastWeighingDate);
    const weeksBack = i * (2 + Math.floor(Math.random() * 3));
    weighingDate.setDate(weighingDate.getDate() - (weeksBack * 7));
    
    const minDate = new Date(referenceDate);
    if (weighingDate < minDate) {
      weighingDate.setTime(minDate.getTime());
    }
    
    const weightDecrease = i * 12;
    const weightVariation = (animalIndex % 5) - 2;
    const weight = Math.max(200, baseWeight - weightDecrease + weightVariation);
    
    const numEmployees = (i % 2) + 1;
    const employeeIds = employees.slice(0, numEmployees);
    
    const hasServiceProvider = i % 3 === 0;
    const serviceProviderIds = hasServiceProvider ? [serviceProviders[i % serviceProviders.length]] : [];
    
    const observations = [
      "Pesagem mensal de rotina",
      "Pesagem de controle",
      "Pesagem com veterinário presente",
      "Pesagem após suplementação",
      "Pesagem de rotina",
      "Pesagem de acompanhamento",
      "Pesagem pré-venda",
      "Pesagem pós-tratamento",
    ];
    
    weighings.push({
      id: generateWeighingId(animalIndex * 10 + i),
      animalId: animal.id,
      employeeIds,
      serviceProviderIds,
      date: weighingDate.toISOString().split("T")[0],
      weight,
      observation: observations[i % observations.length],
      createdAt: weighingDate.toISOString().split("T")[0],
      companyId: COMPANY_ID,
    });
  }
  
  return weighings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

const allWeighings: Weighing[] = [];
mockAnimals.forEach((animal, index) => {
  const weighings = generateWeighingsForAnimal(animal, index);
  allWeighings.push(...weighings);
});

export const mockWeighings: Weighing[] = allWeighings;

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
