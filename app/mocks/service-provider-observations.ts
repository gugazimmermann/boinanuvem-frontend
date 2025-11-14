import type { ServiceProviderObservation, ServiceProviderObservationFormData } from "~/types/service-provider-observation";

export type { ServiceProviderObservation, ServiceProviderObservationFormData };

export const mockServiceProviderObservations: ServiceProviderObservation[] = [
  {
    id: "sp-obs-001",
    serviceProviderId: "880e8400-e29b-41d4-a716-446655440010",
    observation: "Prestador de serviço demonstrou excelente profissionalismo na última manutenção. Equipamentos entregues em perfeito estado.",
    fileIds: ["file-sp-obs-001-001"],
    createdAt: "2025-01-22T10:30:00Z",
    createdBy: "user-001",
  },
  {
    id: "sp-obs-002",
    serviceProviderId: "880e8400-e29b-41d4-a716-446655440010",
    observation: "Avaliação de desempenho realizada. Prestador atendeu todos os requisitos contratuais. Renovação de contrato recomendada.",
    fileIds: ["file-sp-obs-002-001", "file-sp-obs-002-002"],
    createdAt: "2025-02-10T14:15:00Z",
    createdBy: "user-001",
  },
  {
    id: "sp-obs-003",
    serviceProviderId: "880e8400-e29b-41d4-a716-446655440010",
    observation: "Reunião de alinhamento realizada. Novos procedimentos discutidos e acordados. Prestador demonstrou flexibilidade e comprometimento.",
    fileIds: [],
    createdAt: "2025-02-25T09:00:00Z",
    createdBy: "user-002",
  },
  {
    id: "sp-obs-004",
    serviceProviderId: "880e8400-e29b-41d4-a716-446655440011",
    observation: "Serviço de consultoria realizado com qualidade. Relatório técnico detalhado e recomendações implementadas com sucesso.",
    fileIds: ["file-sp-obs-004-001"],
    createdAt: "2025-01-28T08:00:00Z",
    createdBy: "user-002",
  },
  {
    id: "sp-obs-005",
    serviceProviderId: "880e8400-e29b-41d4-a716-446655440011",
    observation: "Treinamento de equipe realizado pelo prestador. Participantes avaliaram positivamente. Certificados emitidos.",
    fileIds: ["file-sp-obs-005-001"],
    createdAt: "2025-02-18T11:30:00Z",
    createdBy: "user-001",
  },
];

export function getServiceProviderObservationsByServiceProviderId(
  serviceProviderId: string
): ServiceProviderObservation[] {
  return mockServiceProviderObservations.filter((obs) => obs.serviceProviderId === serviceProviderId);
}

export function getServiceProviderObservationById(
  observationId: string | undefined
): ServiceProviderObservation | undefined {
  if (!observationId) return undefined;
  return mockServiceProviderObservations.find((obs) => obs.id === observationId);
}

export function addServiceProviderObservation(
  data: ServiceProviderObservationFormData
): ServiceProviderObservation {
  const newObservation: ServiceProviderObservation = {
    ...data,
    id: `sp-obs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockServiceProviderObservations.push(newObservation);
  return newObservation;
}

export function deleteServiceProviderObservation(observationId: string): boolean {
  const index = mockServiceProviderObservations.findIndex((obs) => obs.id === observationId);
  if (index !== -1) {
    mockServiceProviderObservations.splice(index, 1);
    return true;
  }
  return false;
}

export function updateServiceProviderObservation(
  observationId: string,
  data: Partial<ServiceProviderObservationFormData>
): boolean {
  const index = mockServiceProviderObservations.findIndex((obs) => obs.id === observationId);
  if (index !== -1) {
    mockServiceProviderObservations[index] = {
      ...mockServiceProviderObservations[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }
  return false;
}

