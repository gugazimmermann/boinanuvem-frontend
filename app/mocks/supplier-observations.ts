import type {
  SupplierObservation,
  SupplierObservationFormData,
} from "~/types/supplier-observation";

export type { SupplierObservation, SupplierObservationFormData };

export const mockSupplierObservations: SupplierObservation[] = [
  {
    id: "sup-obs-001",
    supplierId: "990e8400-e29b-41d4-a716-446655440010",
    observation:
      "Fornecedor apresentou excelente qualidade nos produtos entregues. Prazo de entrega respeitado.",
    fileIds: ["file-sup-obs-001-001"],
    createdAt: "2025-01-18T10:30:00Z",
    createdBy: "user-001",
  },
  {
    id: "sup-obs-002",
    supplierId: "990e8400-e29b-41d4-a716-446655440010",
    observation:
      "Reunião de avaliação de desempenho realizada. Fornecedor atendeu todos os critérios de qualidade. Contrato renovado.",
    fileIds: ["file-sup-obs-002-001", "file-sup-obs-002-002"],
    createdAt: "2025-02-08T14:15:00Z",
    createdBy: "user-001",
  },
  {
    id: "sup-obs-003",
    supplierId: "990e8400-e29b-41d4-a716-446655440011",
    observation:
      "Fornecedor demonstrou flexibilidade em negociação de preços. Condições comerciais favoráveis acordadas.",
    fileIds: [],
    createdAt: "2025-01-25T08:00:00Z",
    createdBy: "user-002",
  },
  {
    id: "sup-obs-004",
    supplierId: "990e8400-e29b-41d4-a716-446655440011",
    observation:
      "Avaliação de produtos recebidos. Qualidade dentro dos padrões estabelecidos. Certificados de qualidade anexados.",
    fileIds: ["file-sup-obs-004-001"],
    createdAt: "2025-02-12T11:30:00Z",
    createdBy: "user-001",
  },
];

export function getSupplierObservationsBySupplierId(supplierId: string): SupplierObservation[] {
  return mockSupplierObservations.filter((obs) => obs.supplierId === supplierId);
}

export function getSupplierObservationById(
  observationId: string | undefined
): SupplierObservation | undefined {
  if (!observationId) return undefined;
  return mockSupplierObservations.find((obs) => obs.id === observationId);
}

export function addSupplierObservation(data: SupplierObservationFormData): SupplierObservation {
  const newObservation: SupplierObservation = {
    ...data,
    id: `sup-obs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockSupplierObservations.push(newObservation);
  return newObservation;
}

export function deleteSupplierObservation(observationId: string): boolean {
  const index = mockSupplierObservations.findIndex((obs) => obs.id === observationId);
  if (index !== -1) {
    mockSupplierObservations.splice(index, 1);
    return true;
  }
  return false;
}

export function updateSupplierObservation(
  observationId: string,
  data: Partial<SupplierObservationFormData>
): boolean {
  const index = mockSupplierObservations.findIndex((obs) => obs.id === observationId);
  if (index !== -1) {
    mockSupplierObservations[index] = {
      ...mockSupplierObservations[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }
  return false;
}
