import type { AnimalObservation, AnimalObservationFormData } from "~/types/animal-observation";
import { generateUUID } from "~/utils/uuid";
import { mockWeighings } from "./weighings";
import { mockAnimalMovements } from "./animal-movements";

export type { AnimalObservation, AnimalObservationFormData };

const TODAY = new Date("2025-11-21");

function getRealisticDate(index: number, total: number): string {
  const years = [2020, 2021, 2022, 2023, 2024, 2025];
  const progress = index / total;

  let yearIndex: number;
  if (progress < 0.1) {
    yearIndex = 0;
  } else if (progress < 0.2) {
    yearIndex = 1;
  } else if (progress < 0.4) {
    yearIndex = 2;
  } else if (progress < 0.6) {
    yearIndex = 3;
  } else if (progress < 0.8) {
    yearIndex = 4;
  } else {
    yearIndex = 5;
  }

  const year = years[yearIndex];
  const month = Math.floor(Math.random() * 12) + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = Math.floor(Math.random() * daysInMonth) + 1;
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);

  const date = new Date(year, month - 1, day, hour, minute);
  if (date > TODAY) {
    const daysAgo = Math.floor(Math.random() * 30);
    date.setTime(TODAY.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  }

  return date.toISOString();
}

const observationTemplates = [
  "Animal apresentando bom desenvolvimento. Peso dentro do esperado para a idade.",
  "Verificação de saúde realizada. Animal em perfeito estado. Vacinação em dia.",
  "Animal transferido para novo pasto. Adaptação ocorrendo normalmente.",
  "Animal apresentando excelente ganho de peso. Alimentação adequada.",
  "Verificação de saúde após tratamento. Animal recuperado completamente.",
  "Animal apresentando comportamento normal. Interação com o rebanho adequada.",
  "Pesagem realizada. Ganho de peso dentro do esperado.",
  "Animal em bom estado geral. Pelagem brilhante e comportamento ativo.",
  "Verificação de vacinação. Todas as vacinas em dia conforme calendário.",
  "Animal apresentando bom desenvolvimento. Peso e altura dentro dos parâmetros normais.",
  "Observação de comportamento: animal interagindo normalmente com o rebanho.",
  "Verificação de alimentação: consumo adequado de ração e pasto.",
  "Animal em tratamento preventivo. Acompanhamento veterinário em andamento.",
  "Pesagem mensal realizada. Resultados dentro da expectativa.",
  "Animal apresentando bom apetite e hidratação adequada.",
  "Verificação de casco e unhas. Estado normal, sem necessidade de intervenção.",
  "Animal em período de adaptação. Comportamento dentro do esperado.",
  "Observação de reprodução: animal em período fértil.",
  "Verificação de temperatura e sinais vitais. Todos normais.",
  "Animal em bom estado de saúde. Nenhuma alteração observada.",
];

const baseObservations: AnimalObservation[] = [
  {
    id: generateUUID(),
    animalId: "660e8400-e29b-41d4-a716-446655440001",
    observation: "Animal apresentando bom desenvolvimento. Peso dentro do esperado para a idade.",
    fileIds: ["file-animal-obs-001-001"],
    createdAt: "2025-01-15T10:30:00Z",
    createdBy: "user-001",
  },
  {
    id: generateUUID(),
    animalId: "660e8400-e29b-41d4-a716-446655440001",
    observation: "Verificação de saúde realizada. Animal em perfeito estado. Vacinação em dia.",
    fileIds: ["file-animal-obs-002-001", "file-animal-obs-002-002"],
    createdAt: "2025-01-20T14:15:00Z",
    createdBy: "user-001",
  },
  {
    id: generateUUID(),
    animalId: "660e8400-e29b-41d4-a716-446655440001",
    observation: "Animal transferido para novo pasto. Adaptação ocorrendo normalmente.",
    fileIds: ["file-animal-obs-003-001"],
    createdAt: "2025-01-28T09:00:00Z",
    createdBy: "user-002",
  },
  {
    id: generateUUID(),
    animalId: "660e8400-e29b-41d4-a716-446655440002",
    observation: "Animal apresentando excelente ganho de peso. Alimentação adequada.",
    fileIds: [],
    createdAt: "2025-01-18T08:00:00Z",
    createdBy: "user-002",
  },
  {
    id: generateUUID(),
    animalId: "660e8400-e29b-41d4-a716-446655440002",
    observation: "Verificação de saúde após tratamento. Animal recuperado completamente.",
    fileIds: ["file-animal-obs-005-001", "file-animal-obs-005-002"],
    createdAt: "2025-02-05T11:30:00Z",
    createdBy: "user-001",
  },
  {
    id: generateUUID(),
    animalId: "660e8400-e29b-41d4-a716-446655440003",
    observation: "Animal apresentando comportamento normal. Interação com o rebanho adequada.",
    fileIds: ["file-animal-obs-006-001"],
    createdAt: "2025-02-12T14:20:00Z",
    createdBy: "user-003",
  },
  {
    id: generateUUID(),
    animalId: "660e8400-e29b-41d4-a716-446655440003",
    observation: "Pesagem realizada. Ganho de peso dentro do esperado.",
    fileIds: ["file-animal-obs-007-001", "file-animal-obs-007-002", "file-animal-obs-007-003"],
    createdAt: "2025-02-22T16:45:00Z",
    createdBy: "user-001",
  },
  {
    id: generateUUID(),
    animalId: "660e8400-e29b-41d4-a716-446655440004",
    observation: "Animal em bom estado geral. Pelagem brilhante e comportamento ativo.",
    fileIds: [],
    createdAt: "2025-02-08T10:15:00Z",
    createdBy: "user-002",
  },
  {
    id: generateUUID(),
    animalId: "660e8400-e29b-41d4-a716-446655440004",
    observation: "Verificação de vacinação. Todas as vacinas em dia conforme calendário.",
    fileIds: ["file-animal-obs-009-001"],
    createdAt: "2025-02-25T11:20:00Z",
    createdBy: "user-003",
  },
  {
    id: generateUUID(),
    animalId: "660e8400-e29b-41d4-a716-446655440005",
    observation:
      "Animal apresentando bom desenvolvimento. Peso e altura dentro dos parâmetros normais.",
    fileIds: ["file-animal-obs-010-001"],
    createdAt: "2025-02-10T08:30:00Z",
    createdBy: "user-001",
  },
];

const additionalObservations: AnimalObservation[] = [];
const userIds = ["user-001", "user-002", "user-003"];

// Generate mock animal IDs for observations
const generateMockAnimalIds = (count: number): string[] => {
  return Array.from(
    { length: count },
    (_, i) => `bb0e8400-e29b-41d4-a716-${(446655440100 + i).toString().padStart(12, "0")}`
  );
};

const mockAnimalIds = generateMockAnimalIds(50);

for (let i = 0; i < 50; i++) {
  const animalId = mockAnimalIds[i % mockAnimalIds.length];
  if (!animalId) continue;

  let observationDate: string;
  const alignWithEvent = Math.random() < 0.3;

  if (alignWithEvent) {
    const animalWeighings = mockWeighings.filter((w) => w.animalId === animalId);
    if (animalWeighings.length > 0) {
      const weighing = animalWeighings[Math.floor(Math.random() * animalWeighings.length)];
      const weighingDate = new Date(weighing.date);
      weighingDate.setHours(weighingDate.getHours() + Math.floor(Math.random() * 8));
      observationDate = weighingDate.toISOString();
    } else {
      const animalMovements = mockAnimalMovements.filter((m) => m.animalIds.includes(animalId));
      if (animalMovements.length > 0) {
        const movement = animalMovements[Math.floor(Math.random() * animalMovements.length)];
        const movementDate = new Date(movement.date);
        movementDate.setHours(movementDate.getHours() + Math.floor(Math.random() * 8));
        observationDate = movementDate.toISOString();
      } else {
        observationDate = getRealisticDate(i, 50);
      }
    }
  } else {
    observationDate = getRealisticDate(i, 50);
  }

  if (new Date(observationDate) > TODAY) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(TODAY);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    observationDate = date.toISOString();
  }

  const hasFiles = Math.random() < 0.3;
  const fileIds = hasFiles
    ? Array.from(
        { length: Math.floor(Math.random() * 3) + 1 },
        (_, idx) => `file-animal-obs-${animalId}-${i}-${idx + 1}`
      )
    : [];

  additionalObservations.push({
    id: generateUUID(),
    animalId: animalId,
    observation: observationTemplates[i % observationTemplates.length],
    fileIds: fileIds.length > 0 ? fileIds : undefined,
    createdAt: observationDate,
    createdBy: userIds[i % userIds.length],
  });
}

export const mockAnimalObservations: AnimalObservation[] = [
  ...baseObservations,
  ...additionalObservations,
].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
