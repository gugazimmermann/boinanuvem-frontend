import type { AnimalMovement } from "~/types";
import { mockLocations } from "./locations";
import { mockEmployees } from "./employees";
import { generateUUID } from "~/utils/uuid";

export type { AnimalMovement };

const TODAY = new Date("2025-11-21");

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

// Generate mock animal IDs for movements
const generateMockAnimalIds = (propertyId: string, count: number): string[] => {
  const base =
    propertyId === FAZENDA_DO_JUCA
      ? 446655440100
      : propertyId === SITIO_LIMOEIRO
        ? 446655440200
        : 446655440300;
  return Array.from(
    { length: count },
    (_, i) => `bb0e8400-e29b-41d4-a716-${(base + i).toString().padStart(12, "0")}`
  );
};

const fazendaAnimals = generateMockAnimalIds(FAZENDA_DO_JUCA, 20).map((id) => ({
  id,
  propertyId: FAZENDA_DO_JUCA,
  createdAt: "2020-01-01",
  status: "active",
}));
const sitioAnimals = generateMockAnimalIds(SITIO_LIMOEIRO, 10).map((id) => ({
  id,
  propertyId: SITIO_LIMOEIRO,
  createdAt: "2020-01-01",
  status: "active",
}));
const chacaraAnimals = generateMockAnimalIds(CHACARA_DO_JUCA, 10).map((id) => ({
  id,
  propertyId: CHACARA_DO_JUCA,
  createdAt: "2020-01-01",
  status: "active",
}));

function generateMovementId(_index: number): string {
  return generateUUID();
}

function _getRandomDate(startDate: Date, endDate: Date): string {
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
  const serviceProviderIds: string[] = [];

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

function generateMovementsForProperty(
  propertyId: string,
  animals: typeof fazendaAnimals,
  locations: string[],
  _startDate: Date
) {
  animals.forEach((animal) => {
    const numMovements = 2 + Math.floor(Math.random() * 4);
    const animalCreatedDate = new Date(animal.createdAt);

    const firstMovementDate = new Date(animalCreatedDate);
    firstMovementDate.setDate(firstMovementDate.getDate() + Math.floor(Math.random() * 30));

    if (firstMovementDate > TODAY) {
      firstMovementDate.setTime(
        TODAY.getTime() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000
      );
    }

    if (firstMovementDate < animalCreatedDate) {
      firstMovementDate.setTime(animalCreatedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    let currentDate = new Date(firstMovementDate);

    for (let i = 0; i < numMovements; i++) {
      if (i > 0) {
        const daysBetween = 30 + Math.floor(Math.random() * 150);
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + daysBetween);
      }

      if (currentDate > TODAY) break;

      if (currentDate < animalCreatedDate) {
        currentDate = new Date(animalCreatedDate);
        currentDate.setDate(currentDate.getDate() + 7);
        if (currentDate > TODAY) break;
      }

      const locationId = getRandomElement(locations);
      const dateStr = currentDate.toISOString().split("T")[0];

      const moveInBatch = Math.random() < 0.3 && i === 0;
      if (moveInBatch) {
        const batchSize = Math.min(3 + Math.floor(Math.random() * 5), animals.length);
        const batchStart = Math.floor(Math.random() * Math.max(0, animals.length - batchSize));
        const batchAnimals = animals.slice(batchStart, batchStart + batchSize);
        mockAnimalMovements.push(
          createMovement(
            propertyId,
            locationId,
            batchAnimals.map((a) => a.id),
            dateStr
          )
        );
      } else {
        mockAnimalMovements.push(createMovement(propertyId, locationId, [animal.id], dateStr));
      }
    }
  });
}

const startDate = new Date("2020-01-01");

generateMovementsForProperty(FAZENDA_DO_JUCA, fazendaAnimals, fazendaLocations, startDate);

generateMovementsForProperty(SITIO_LIMOEIRO, sitioAnimals, sitioLocations, startDate);

generateMovementsForProperty(CHACARA_DO_JUCA, chacaraAnimals, chacaraLocations, startDate);

mockAnimalMovements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export { mockAnimalMovements };
