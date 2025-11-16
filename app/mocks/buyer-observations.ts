import type { BuyerObservation, BuyerObservationFormData } from "~/types/buyer-observation";
import { generateUUID } from "~/utils/uuid";

export type { BuyerObservation, BuyerObservationFormData };

export const mockBuyerObservations: BuyerObservation[] = [
  {
    id: generateUUID(),
    buyerId: "aa0e8400-e29b-41d4-a716-446655440010",
    observation:
      "Comprador demonstrou interesse em aumentar volume de compras. Negociação de condições comerciais em andamento.",
    fileIds: ["file-buy-obs-001-001"],
    createdAt: "2025-01-20T10:30:00Z",
    createdBy: "user-001",
  },
  {
    id: generateUUID(),
    buyerId: "aa0e8400-e29b-41d4-a716-446655440010",
    observation:
      "Avaliação de relacionamento comercial realizada. Comprador mantém pagamentos em dia. Parceria de longo prazo estabelecida.",
    fileIds: ["file-buy-obs-002-001", "file-buy-obs-002-002"],
    createdAt: "2025-02-05T14:15:00Z",
    createdBy: "user-001",
  },
  {
    id: generateUUID(),
    buyerId: "aa0e8400-e29b-41d4-a716-446655440011",
    observation:
      "Reunião de alinhamento comercial realizada. Novos produtos apresentados. Comprador demonstrou interesse em expandir portfólio.",
    fileIds: [],
    createdAt: "2025-01-30T08:00:00Z",
    createdBy: "user-002",
  },
  {
    id: generateUUID(),
    buyerId: "aa0e8400-e29b-41d4-a716-446655440011",
    observation:
      "Contrato de compra renovado com condições favoráveis. Comprador comprometido com parceria estratégica.",
    fileIds: ["file-buy-obs-004-001"],
    createdAt: "2025-02-15T11:30:00Z",
    createdBy: "user-001",
  },
];
