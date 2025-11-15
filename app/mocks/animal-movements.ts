import type { AnimalMovement } from "~/types";
import { mockAnimals } from "./animals";
import { mockLocations } from "./locations";
import { mockEmployees } from "./employees";
import { mockServiceProviders } from "./service-providers";

export type { AnimalMovement };

const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";
const FAZENDA_DO_JUCA = "550e8400-e29b-41d4-a716-446655440010";
const SITIO_LIMOEIRO = "550e8400-e29b-41d4-a716-446655440011";
const CHACARA_DO_JUCA = "550e8400-e29b-41d4-a716-446655440012";

const fazendaLocations = mockLocations
  .filter((loc) => loc.propertyId === FAZENDA_DO_JUCA)
  .map((loc) => loc.id);
const sitioLocations = mockLocations
  .filter((loc) => loc.propertyId === SITIO_LIMOEIRO)
  .map((loc) => loc.id);
const chacaraLocations = mockLocations
  .filter((loc) => loc.propertyId === CHACARA_DO_JUCA)
  .map((loc) => loc.id);

const fazendaAnimals = mockAnimals.filter((a) => a.propertyId === FAZENDA_DO_JUCA);
const sitioAnimals = mockAnimals.filter((a) => a.propertyId === SITIO_LIMOEIRO);
const chacaraAnimals = mockAnimals.filter((a) => a.propertyId === CHACARA_DO_JUCA);

function generateMovementId(index: number): string {
  const base = 556655440100 + index;
  return `cc0e8400-e29b-41d4-a716-${base.toString().padStart(12, "0")}`;
}

function getRandomDate(startDate: Date, endDate: Date): string {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const randomTime = start + Math.random() * (end - start);
  const date = new Date(randomTime);
  return date.toISOString().split("T")[0];
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

const mockAnimalMovements: AnimalMovement[] = [];
let movementIndex = 0;

const sampleObservations = [
  "Animais transferidos para nova área de pasto. Todos em bom estado de saúde.",
  "Movimentação realizada para área de quarentena. Monitoramento diário necessário.",
  "Transferência para área de engorda. Animais receberam suplementação alimentar.",
  "Movimentação para área de reprodução. Fêmeas prontas para cobertura.",
  "Animais movidos para área de descanso após período de pastejo intenso.",
  "Transferência realizada com sucesso. Nenhum incidente durante o transporte.",
  "Animais em quarentena por 7 dias. Observação de comportamento e saúde.",
  "Movimentação para área de tratamento. Animais receberão cuidados veterinários.",
  "Transferência para pasto de recuperação. Área anterior em descanso.",
  "Animais movidos para área de pesagem. Controle de ganho de peso.",
  "Movimentação realizada para melhor aproveitamento do pasto.",
  "Transferência para área com melhor disponibilidade de água.",
  "Animais em observação após movimentação. Comportamento normal.",
  "Movimentação para área de manejo. Procedimentos de rotina aplicados.",
  "Transferência realizada conforme planejamento de rotação de pasto.",
];

function createMovement(
  propertyId: string,
  locationId: string,
  animalIds: string[],
  date: string
): AnimalMovement {
  const employeeIds = getRandomElements(
    mockEmployees.filter((e) => e.companyId === COMPANY_ID).map((e) => e.id),
    Math.floor(Math.random() * 3)
  );
  const serviceProviderIds = getRandomElements(
    mockServiceProviders.filter((sp) => sp.companyId === COMPANY_ID).map((sp) => sp.id),
    Math.floor(Math.random() * 2)
  );

  const hasObservation = Math.random() < 0.25;
  const observation = hasObservation ? getRandomElement(sampleObservations) : undefined;

  const hasFiles = Math.random() < 0.15;
  const fileIds = hasFiles
    ? Array.from(
        { length: Math.floor(Math.random() * 3) + 1 },
        (_, i) => `file-${date.replace(/-/g, "")}-${String(i + 1).padStart(3, "0")}`
      )
    : undefined;

  return {
    id: generateMovementId(movementIndex++),
    date,
    companyId: COMPANY_ID,
    propertyId,
    locationId,
    animalIds,
    employeeIds,
    serviceProviderIds,
    observation,
    fileIds,
    createdAt: date,
  };
}

const fazendaAnimalsInFazenda = Math.floor(fazendaAnimals.length * 0.98);
const _fazendaAnimalsInOther = fazendaAnimals.length - fazendaAnimalsInFazenda;

const fazendaAnimalsForFazenda = fazendaAnimals.slice(0, fazendaAnimalsInFazenda);
let animalIndex = 0;
const startDate = new Date("2024-01-01");
const endDate = new Date();

while (animalIndex < fazendaAnimalsForFazenda.length) {
  const batchSize = Math.min(
    Math.floor(Math.random() * 5) + 1,
    fazendaAnimalsForFazenda.length - animalIndex
  );
  const batchAnimals = fazendaAnimalsForFazenda.slice(animalIndex, animalIndex + batchSize);
  const locationId = getRandomElement(fazendaLocations);
  const date = getRandomDate(startDate, endDate);

  mockAnimalMovements.push(
    createMovement(
      FAZENDA_DO_JUCA,
      locationId,
      batchAnimals.map((a) => a.id),
      date
    )
  );

  animalIndex += batchSize;
}

const fazendaAnimalsForOther = fazendaAnimals.slice(fazendaAnimalsInFazenda);
for (const animal of fazendaAnimalsForOther) {
  const otherLocations = Math.random() < 0.5 ? sitioLocations : chacaraLocations;
  const otherPropertyId = Math.random() < 0.5 ? SITIO_LIMOEIRO : CHACARA_DO_JUCA;
  const locationId = getRandomElement(otherLocations);
  const date = getRandomDate(startDate, endDate);

  mockAnimalMovements.push(createMovement(otherPropertyId, locationId, [animal.id], date));
}

const sitioAnimalsInSitio = Math.floor(sitioAnimals.length * 0.98);
const _sitioAnimalsInOther = sitioAnimals.length - sitioAnimalsInSitio;

const sitioAnimalsForSitio = sitioAnimals.slice(0, sitioAnimalsInSitio);
animalIndex = 0;

while (animalIndex < sitioAnimalsForSitio.length) {
  const batchSize = Math.min(
    Math.floor(Math.random() * 3) + 1,
    sitioAnimalsForSitio.length - animalIndex
  );
  const batchAnimals = sitioAnimalsForSitio.slice(animalIndex, animalIndex + batchSize);
  const locationId = getRandomElement(sitioLocations);
  const date = getRandomDate(startDate, endDate);

  mockAnimalMovements.push(
    createMovement(
      SITIO_LIMOEIRO,
      locationId,
      batchAnimals.map((a) => a.id),
      date
    )
  );

  animalIndex += batchSize;
}

const sitioAnimalsForOther = sitioAnimals.slice(sitioAnimalsInSitio);
if (sitioAnimalsForOther.length > 0) {
  const animal = sitioAnimalsForOther[0];
  const otherLocations = Math.random() < 0.5 ? fazendaLocations : chacaraLocations;
  const otherPropertyId = Math.random() < 0.5 ? FAZENDA_DO_JUCA : CHACARA_DO_JUCA;
  const locationId = getRandomElement(otherLocations);
  const date = getRandomDate(startDate, endDate);

  mockAnimalMovements.push(createMovement(otherPropertyId, locationId, [animal.id], date));
}

const chacaraAnimalsInChacara = Math.floor(chacaraAnimals.length * 0.98);
const _chacaraAnimalsInOther = chacaraAnimals.length - chacaraAnimalsInChacara;

const chacaraAnimalsForChacara = chacaraAnimals.slice(0, chacaraAnimalsInChacara);
animalIndex = 0;

while (animalIndex < chacaraAnimalsForChacara.length) {
  const batchSize = Math.min(
    Math.floor(Math.random() * 4) + 1,
    chacaraAnimalsForChacara.length - animalIndex
  );
  const batchAnimals = chacaraAnimalsForChacara.slice(animalIndex, animalIndex + batchSize);
  const locationId = getRandomElement(chacaraLocations);
  const date = getRandomDate(startDate, endDate);

  mockAnimalMovements.push(
    createMovement(
      CHACARA_DO_JUCA,
      locationId,
      batchAnimals.map((a) => a.id),
      date
    )
  );

  animalIndex += batchSize;
}

const chacaraAnimalsForOther = chacaraAnimals.slice(chacaraAnimalsInChacara);
if (chacaraAnimalsForOther.length > 0) {
  const animal = chacaraAnimalsForOther[0];
  const otherLocations = Math.random() < 0.5 ? fazendaLocations : sitioLocations;
  const otherPropertyId = Math.random() < 0.5 ? FAZENDA_DO_JUCA : SITIO_LIMOEIRO;
  const locationId = getRandomElement(otherLocations);
  const date = getRandomDate(startDate, endDate);

  mockAnimalMovements.push(createMovement(otherPropertyId, locationId, [animal.id], date));
}

mockAnimalMovements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export { mockAnimalMovements };

export function getAnimalMovementsByAnimalId(animalId: string): AnimalMovement[] {
  return mockAnimalMovements.filter((movement) => movement.animalIds.includes(animalId));
}

export function getAnimalMovementsByLocationId(locationId: string): AnimalMovement[] {
  return mockAnimalMovements.filter((movement) => movement.locationId === locationId);
}

export function getAnimalMovementsByPropertyId(propertyId: string): AnimalMovement[] {
  return mockAnimalMovements.filter((movement) => movement.propertyId === propertyId);
}

export function getAnimalMovementsByCompanyId(companyId: string): AnimalMovement[] {
  return mockAnimalMovements.filter((movement) => movement.companyId === companyId);
}

export function getAnimalMovementsByEmployeeId(employeeId: string): AnimalMovement[] {
  return mockAnimalMovements.filter((movement) => movement.employeeIds.includes(employeeId));
}

export function getAnimalMovementsByServiceProviderId(serviceProviderId: string): AnimalMovement[] {
  return mockAnimalMovements.filter((movement) =>
    movement.serviceProviderIds.includes(serviceProviderId)
  );
}

export function getAnimalMovementById(movementId: string): AnimalMovement | undefined {
  return mockAnimalMovements.find((movement) => movement.id === movementId);
}

export function getAnimalsByLastMovementLocation(locationId: string): string[] {
  const animalLastMovements = new Map<string, AnimalMovement>();

  for (const movement of mockAnimalMovements) {
    for (const animalId of movement.animalIds) {
      const existing = animalLastMovements.get(animalId);
      if (!existing || new Date(movement.date).getTime() > new Date(existing.date).getTime()) {
        animalLastMovements.set(animalId, movement);
      }
    }
  }

  const result: string[] = [];
  for (const [animalId, movement] of animalLastMovements.entries()) {
    if (movement.locationId === locationId) {
      result.push(animalId);
    }
  }

  return result;
}

export function addAnimalMovement(data: Omit<AnimalMovement, "id" | "createdAt">): AnimalMovement {
  const newMovement: AnimalMovement = {
    ...data,
    id: generateMovementId(mockAnimalMovements.length),
    createdAt: new Date().toISOString().split("T")[0],
    observation: data.observation?.trim() || undefined,
    fileIds: data.fileIds && data.fileIds.length > 0 ? data.fileIds : undefined,
  };
  mockAnimalMovements.push(newMovement);
  mockAnimalMovements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return newMovement;
}

export function deleteAnimalMovement(movementId: string): boolean {
  const index = mockAnimalMovements.findIndex((movement) => movement.id === movementId);
  if (index !== -1) {
    mockAnimalMovements.splice(index, 1);
    return true;
  }
  return false;
}
