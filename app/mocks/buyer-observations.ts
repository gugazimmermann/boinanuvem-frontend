import type { BuyerObservation, BuyerObservationFormData } from "~/types/buyer-observation";

export type { BuyerObservation, BuyerObservationFormData };

export const mockBuyerObservations: BuyerObservation[] = [
  {
    id: "buy-obs-001",
    buyerId: "aa0e8400-e29b-41d4-a716-446655440010",
    observation: "Comprador demonstrou interesse em aumentar volume de compras. Negociação de condições comerciais em andamento.",
    fileIds: ["file-buy-obs-001-001"],
    createdAt: "2025-01-20T10:30:00Z",
    createdBy: "user-001",
  },
  {
    id: "buy-obs-002",
    buyerId: "aa0e8400-e29b-41d4-a716-446655440010",
    observation: "Avaliação de relacionamento comercial realizada. Comprador mantém pagamentos em dia. Parceria de longo prazo estabelecida.",
    fileIds: ["file-buy-obs-002-001", "file-buy-obs-002-002"],
    createdAt: "2025-02-05T14:15:00Z",
    createdBy: "user-001",
  },
  {
    id: "buy-obs-003",
    buyerId: "aa0e8400-e29b-41d4-a716-446655440011",
    observation: "Reunião de alinhamento comercial realizada. Novos produtos apresentados. Comprador demonstrou interesse em expandir portfólio.",
    fileIds: [],
    createdAt: "2025-01-30T08:00:00Z",
    createdBy: "user-002",
  },
  {
    id: "buy-obs-004",
    buyerId: "aa0e8400-e29b-41d4-a716-446655440011",
    observation: "Contrato de compra renovado com condições favoráveis. Comprador comprometido com parceria estratégica.",
    fileIds: ["file-buy-obs-004-001"],
    createdAt: "2025-02-15T11:30:00Z",
    createdBy: "user-001",
  },
];

export function getBuyerObservationsByBuyerId(
  buyerId: string
): BuyerObservation[] {
  return mockBuyerObservations.filter((obs) => obs.buyerId === buyerId);
}

export function getBuyerObservationById(
  observationId: string | undefined
): BuyerObservation | undefined {
  if (!observationId) return undefined;
  return mockBuyerObservations.find((obs) => obs.id === observationId);
}

export function addBuyerObservation(
  data: BuyerObservationFormData
): BuyerObservation {
  const newObservation: BuyerObservation = {
    ...data,
    id: `buy-obs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockBuyerObservations.push(newObservation);
  return newObservation;
}

export function deleteBuyerObservation(observationId: string): boolean {
  const index = mockBuyerObservations.findIndex((obs) => obs.id === observationId);
  if (index !== -1) {
    mockBuyerObservations.splice(index, 1);
    return true;
  }
  return false;
}

export function updateBuyerObservation(
  observationId: string,
  data: Partial<BuyerObservationFormData>
): boolean {
  const index = mockBuyerObservations.findIndex((obs) => obs.id === observationId);
  if (index !== -1) {
    mockBuyerObservations[index] = {
      ...mockBuyerObservations[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }
  return false;
}

