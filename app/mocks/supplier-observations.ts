import type {
  SupplierObservation,
  SupplierObservationFormData,
} from "~/types/supplier-observation";
import { generateUUID } from "~/utils/uuid";

export type { SupplierObservation, SupplierObservationFormData };

export const mockSupplierObservations: SupplierObservation[] = [
  {
    id: generateUUID(),
    supplierId: "990e8400-e29b-41d4-a716-446655440010",
    observation:
      "Fornecedor apresentou excelente qualidade nos produtos entregues. Prazo de entrega respeitado.",
    fileIds: ["file-sup-obs-001-001"],
    createdAt: "2025-01-18T10:30:00Z",
    createdBy: "user-001",
  },
  {
    id: generateUUID(),
    supplierId: "990e8400-e29b-41d4-a716-446655440010",
    observation:
      "Reunião de avaliação de desempenho realizada. Fornecedor atendeu todos os critérios de qualidade. Contrato renovado.",
    fileIds: ["file-sup-obs-002-001", "file-sup-obs-002-002"],
    createdAt: "2025-02-08T14:15:00Z",
    createdBy: "user-001",
  },
  {
    id: generateUUID(),
    supplierId: "990e8400-e29b-41d4-a716-446655440011",
    observation:
      "Fornecedor demonstrou flexibilidade em negociação de preços. Condições comerciais favoráveis acordadas.",
    fileIds: [],
    createdAt: "2025-01-25T08:00:00Z",
    createdBy: "user-002",
  },
  {
    id: generateUUID(),
    supplierId: "990e8400-e29b-41d4-a716-446655440011",
    observation:
      "Avaliação de produtos recebidos. Qualidade dentro dos padrões estabelecidos. Certificados de qualidade anexados.",
    fileIds: ["file-sup-obs-004-001"],
    createdAt: "2025-02-12T11:30:00Z",
    createdBy: "user-001",
  },
];
