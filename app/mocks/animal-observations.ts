import type { AnimalObservation, AnimalObservationFormData } from "~/types/animal-observation";

export type { AnimalObservation, AnimalObservationFormData };

export const mockAnimalObservations: AnimalObservation[] = [
  {
    id: "animal-obs-001",
    animalId: "660e8400-e29b-41d4-a716-446655440001",
    observation: "Animal apresentando bom desenvolvimento. Peso dentro do esperado para a idade.",
    fileIds: ["file-animal-obs-001-001"],
    createdAt: "2025-01-15T10:30:00Z",
    createdBy: "user-001",
  },
  {
    id: "animal-obs-002",
    animalId: "660e8400-e29b-41d4-a716-446655440001",
    observation: "Verificação de saúde realizada. Animal em perfeito estado. Vacinação em dia.",
    fileIds: ["file-animal-obs-002-001", "file-animal-obs-002-002"],
    createdAt: "2025-01-20T14:15:00Z",
    createdBy: "user-001",
  },
  {
    id: "animal-obs-003",
    animalId: "660e8400-e29b-41d4-a716-446655440001",
    observation: "Animal transferido para novo pasto. Adaptação ocorrendo normalmente.",
    fileIds: ["file-animal-obs-003-001"],
    createdAt: "2025-01-28T09:00:00Z",
    createdBy: "user-002",
  },
  {
    id: "animal-obs-004",
    animalId: "660e8400-e29b-41d4-a716-446655440002",
    observation: "Animal apresentando excelente ganho de peso. Alimentação adequada.",
    fileIds: [],
    createdAt: "2025-01-18T08:00:00Z",
    createdBy: "user-002",
  },
  {
    id: "animal-obs-005",
    animalId: "660e8400-e29b-41d4-a716-446655440002",
    observation: "Verificação de saúde após tratamento. Animal recuperado completamente.",
    fileIds: ["file-animal-obs-005-001", "file-animal-obs-005-002"],
    createdAt: "2025-02-05T11:30:00Z",
    createdBy: "user-001",
  },
  {
    id: "animal-obs-006",
    animalId: "660e8400-e29b-41d4-a716-446655440003",
    observation: "Animal apresentando comportamento normal. Interação com o rebanho adequada.",
    fileIds: ["file-animal-obs-006-001"],
    createdAt: "2025-02-12T14:20:00Z",
    createdBy: "user-003",
  },
  {
    id: "animal-obs-007",
    animalId: "660e8400-e29b-41d4-a716-446655440003",
    observation: "Pesagem realizada. Ganho de peso dentro do esperado.",
    fileIds: ["file-animal-obs-007-001", "file-animal-obs-007-002", "file-animal-obs-007-003"],
    createdAt: "2025-02-22T16:45:00Z",
    createdBy: "user-001",
  },
  {
    id: "animal-obs-008",
    animalId: "660e8400-e29b-41d4-a716-446655440004",
    observation: "Animal em bom estado geral. Pelagem brilhante e comportamento ativo.",
    fileIds: [],
    createdAt: "2025-02-08T10:15:00Z",
    createdBy: "user-002",
  },
  {
    id: "animal-obs-009",
    animalId: "660e8400-e29b-41d4-a716-446655440004",
    observation: "Verificação de vacinação. Todas as vacinas em dia conforme calendário.",
    fileIds: ["file-animal-obs-009-001"],
    createdAt: "2025-02-25T11:20:00Z",
    createdBy: "user-003",
  },
  {
    id: "animal-obs-010",
    animalId: "660e8400-e29b-41d4-a716-446655440005",
    observation:
      "Animal apresentando bom desenvolvimento. Peso e altura dentro dos parâmetros normais.",
    fileIds: ["file-animal-obs-010-001"],
    createdAt: "2025-02-10T08:30:00Z",
    createdBy: "user-001",
  },
];

export function getAnimalObservationsByAnimalId(animalId: string): AnimalObservation[] {
  return mockAnimalObservations.filter((obs) => obs.animalId === animalId);
}

export function getAnimalObservationById(
  observationId: string | undefined
): AnimalObservation | undefined {
  if (!observationId) return undefined;
  return mockAnimalObservations.find((obs) => obs.id === observationId);
}

export function addAnimalObservation(data: AnimalObservationFormData): AnimalObservation {
  const newObservation: AnimalObservation = {
    ...data,
    id: `animal-obs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockAnimalObservations.push(newObservation);
  return newObservation;
}

export function deleteAnimalObservation(observationId: string): boolean {
  const index = mockAnimalObservations.findIndex((obs) => obs.id === observationId);
  if (index !== -1) {
    mockAnimalObservations.splice(index, 1);
    return true;
  }
  return false;
}

export function updateAnimalObservation(
  observationId: string,
  data: Partial<AnimalObservationFormData>
): boolean {
  const index = mockAnimalObservations.findIndex((obs) => obs.id === observationId);
  if (index !== -1) {
    mockAnimalObservations[index] = {
      ...mockAnimalObservations[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }
  return false;
}
