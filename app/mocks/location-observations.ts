import type { LocationObservation, LocationObservationFormData } from "~/types/location-observation";

export type { LocationObservation, LocationObservationFormData };

export const mockLocationObservations: LocationObservation[] = [
  {
    id: "obs-001",
    locationId: "660e8400-e29b-41d4-a716-446655440010",
    observation: "Pasto apresentando boa qualidade de grama. Área necessita de rotação em breve.",
    fileIds: ["file-obs-001-001", "file-obs-001-002"],
    createdAt: "2025-01-15T10:30:00Z",
    createdBy: "user-001",
  },
  {
    id: "obs-002",
    locationId: "660e8400-e29b-41d4-a716-446655440010",
    observation: "Verificação de cercas realizada. Nenhum dano encontrado. Manutenção preventiva agendada para próximo mês.",
    fileIds: ["file-obs-002-001"],
    createdAt: "2025-01-20T14:15:00Z",
    createdBy: "user-001",
  },
  {
    id: "obs-003",
    locationId: "660e8400-e29b-41d4-a716-446655440010",
    observation: "Rotação de pasto realizada com sucesso. Animais transferidos para nova área. Monitoramento da grama na área anterior iniciado.",
    fileIds: ["file-obs-003-001"],
    createdAt: "2025-01-28T09:00:00Z",
    createdBy: "user-002",
  },
  {
    id: "obs-004",
    locationId: "660e8400-e29b-41d4-a716-446655440011",
    observation: "Sistema de irrigação funcionando perfeitamente. Água aplicada conforme planejado.",
    fileIds: [],
    createdAt: "2025-01-18T08:00:00Z",
    createdBy: "user-002",
  },
  {
    id: "obs-005",
    locationId: "660e8400-e29b-41d4-a716-446655440011",
    observation: "Verificação do sistema de irrigação após manutenção. Todos os aspersores funcionando corretamente. Pressão da água dentro dos parâmetros normais.",
    fileIds: ["file-obs-005-001", "file-obs-005-002"],
    createdAt: "2025-02-05T11:30:00Z",
    createdBy: "user-001",
  },
  {
    id: "obs-006",
    locationId: "660e8400-e29b-41d4-a716-446655440011",
    observation: "Aplicação de fertilizante realizada na área sul. Condições climáticas favoráveis para absorção.",
    fileIds: ["file-obs-006-001"],
    createdAt: "2025-02-12T14:20:00Z",
    createdBy: "user-003",
  },
  {
    id: "obs-007",
    locationId: "660e8400-e29b-41d4-a716-446655440012",
    observation: "Reparo de cerca concluído com sucesso. Fotos do antes e depois anexadas.",
    fileIds: ["file-obs-007-001", "file-obs-007-002", "file-obs-007-003"],
    createdAt: "2025-01-22T16:45:00Z",
    createdBy: "user-001",
  },
  {
    id: "obs-008",
    locationId: "660e8400-e29b-41d4-a716-446655440012",
    observation: "Inspeção geral da área realizada. Grama em bom estado, mas algumas áreas precisam de atenção. Planejamento de adubação para próxima semana.",
    fileIds: [],
    createdAt: "2025-02-08T10:15:00Z",
    createdBy: "user-002",
  },
  {
    id: "obs-009",
    locationId: "660e8400-e29b-41d4-a716-446655440013",
    observation: "Análise de solo realizada. Resultados indicam necessidade de adubação complementar.",
    fileIds: ["file-obs-009-001"],
    createdAt: "2025-01-25T11:20:00Z",
    createdBy: "user-003",
  },
  {
    id: "obs-010",
    locationId: "660e8400-e29b-41d4-a716-446655440013",
    observation: "Adubação complementar aplicada conforme recomendação da análise de solo. Espera-se melhoria na qualidade do pasto nas próximas semanas.",
    fileIds: ["file-obs-010-001"],
    createdAt: "2025-02-10T08:30:00Z",
    createdBy: "user-001",
  },
  {
    id: "obs-011",
    locationId: "660e8400-e29b-41d4-a716-446655440014",
    observation: "Confinamento em operação normal. Animais apresentando bom desenvolvimento. Ração sendo fornecida conforme planejado.",
    fileIds: [],
    createdAt: "2025-02-15T07:00:00Z",
    createdBy: "user-001",
  },
  {
    id: "obs-012",
    locationId: "660e8400-e29b-41d4-a716-446655440014",
    observation: "Limpeza e desinfecção do confinamento realizada. Área preparada para novo lote de animais.",
    fileIds: ["file-obs-012-001", "file-obs-012-002"],
    createdAt: "2025-02-20T15:45:00Z",
    createdBy: "user-002",
  },
  {
    id: "obs-013",
    locationId: "660e8400-e29b-41d4-a716-446655440014",
    observation: "Verificação do sistema de ventilação. Todos os ventiladores funcionando corretamente. Temperatura dentro dos parâmetros ideais.",
    fileIds: [],
    createdAt: "2025-02-25T09:20:00Z",
    createdBy: "user-003",
  },
  {
    id: "obs-014",
    locationId: "660e8400-e29b-41d4-a716-446655440015",
    observation: "Semi-confinamento operando normalmente. Animais com acesso ao pasto e suplementação adequada.",
    fileIds: ["file-obs-014-001"],
    createdAt: "2025-02-18T11:00:00Z",
    createdBy: "user-001",
  },
  {
    id: "obs-015",
    locationId: "660e8400-e29b-41d4-a716-446655440016",
    observation: "Curral de manejo limpo e organizado. Equipamentos verificados e em bom estado de conservação.",
    fileIds: [],
    createdAt: "2025-02-12T13:30:00Z",
    createdBy: "user-002",
  },
  {
    id: "obs-016",
    locationId: "660e8400-e29b-41d4-a716-446655440016",
    observation: "Manutenção preventiva realizada nos equipamentos do curral. Substituição de algumas peças desgastadas.",
    fileIds: ["file-obs-016-001"],
    createdAt: "2025-02-22T10:15:00Z",
    createdBy: "user-001",
  },
  {
    id: "obs-017",
    locationId: "660e8400-e29b-41d4-a716-446655440017",
    observation: "Silo de milho verificado. Capacidade atual: 75%. Qualidade do grão armazenado excelente.",
    fileIds: ["file-obs-017-001"],
    createdAt: "2025-02-16T08:45:00Z",
    createdBy: "user-003",
  },
  {
    id: "obs-018",
    locationId: "660e8400-e29b-41d4-a716-446655440017",
    observation: "Carregamento de novo lote de milho no silo. Grãos secos e em perfeito estado. Umidade dentro dos parâmetros ideais.",
    fileIds: ["file-obs-018-001", "file-obs-018-002"],
    createdAt: "2025-02-28T14:00:00Z",
    createdBy: "user-001",
  },
  {
    id: "obs-019",
    locationId: "660e8400-e29b-41d4-a716-446655440018",
    observation: "Celeiro em bom estado. Estrutura verificada, sem sinais de infiltração ou danos.",
    fileIds: [],
    createdAt: "2025-02-21T09:30:00Z",
    createdBy: "user-002",
  },
  {
    id: "obs-020",
    locationId: "660e8400-e29b-41d4-a716-446655440019",
    observation: "Armazém de ração organizado. Estoque atualizado e rotulado corretamente. Controle de pragas realizado.",
    fileIds: ["file-obs-020-001"],
    createdAt: "2025-02-24T11:20:00Z",
    createdBy: "user-001",
  },
  {
    id: "obs-021",
    locationId: "660e8400-e29b-41d4-a716-446655440020",
    observation: "Sala de ordenha limpa e desinfetada. Equipamentos verificados e funcionando perfeitamente.",
    fileIds: ["file-obs-021-001"],
    createdAt: "2025-03-02T06:00:00Z",
    createdBy: "user-002",
  },
  {
    id: "obs-022",
    locationId: "660e8400-e29b-41d4-a716-446655440020",
    observation: "Manutenção preventiva nos equipamentos de ordenha. Substituição de mangueiras e verificação do sistema de refrigeração.",
    fileIds: ["file-obs-022-001", "file-obs-022-002"],
    createdAt: "2025-03-08T13:45:00Z",
    createdBy: "user-003",
  },
  {
    id: "obs-023",
    locationId: "660e8400-e29b-41d4-a716-446655440022",
    observation: "Pasto Central apresentando bom desenvolvimento da grama. Área bem aproveitada pelos animais.",
    fileIds: [],
    createdAt: "2025-02-25T10:00:00Z",
    createdBy: "user-001",
  },
  {
    id: "obs-024",
    locationId: "660e8400-e29b-41d4-a716-446655440022",
    observation: "Aplicação de calcário realizada conforme recomendação técnica. Espera-se melhoria no pH do solo.",
    fileIds: ["file-obs-024-001"],
    createdAt: "2025-03-05T14:30:00Z",
    createdBy: "user-002",
  },
  {
    id: "obs-025",
    locationId: "660e8400-e29b-41d4-a716-446655440023",
    observation: "Pasto Superior com boa cobertura vegetal. Área monitorada regularmente para garantir qualidade.",
    fileIds: [],
    createdAt: "2025-02-28T08:15:00Z",
    createdBy: "user-001",
  },
  {
    id: "obs-026",
    locationId: "660e8400-e29b-41d4-a716-446655440024",
    observation: "Piquete 1 em rotação. Animais transferidos para área de descanso. Grama se recuperando bem.",
    fileIds: ["file-obs-026-001"],
    createdAt: "2025-03-01T09:00:00Z",
    createdBy: "user-002",
  },
  {
    id: "obs-027",
    locationId: "660e8400-e29b-41d4-a716-446655440025",
    observation: "Piquete 2 com boa disponibilidade de forragem. Animais com acesso adequado à água e sombra.",
    fileIds: [],
    createdAt: "2025-03-03T11:30:00Z",
    createdBy: "user-001",
  },
  {
    id: "obs-028",
    locationId: "660e8400-e29b-41d4-a716-446655440026",
    observation: "Campo de Aves preparado para nova semeadura. Solo preparado e adubado adequadamente.",
    fileIds: ["file-obs-028-001"],
    createdAt: "2025-03-06T07:45:00Z",
    createdBy: "user-003",
  },
  {
    id: "obs-029",
    locationId: "660e8400-e29b-41d4-a716-446655440027",
    observation: "Curral limpo e organizado após manejo. Equipamentos guardados corretamente.",
    fileIds: [],
    createdAt: "2025-03-08T12:00:00Z",
    createdBy: "user-001",
  },
  {
    id: "obs-030",
    locationId: "660e8400-e29b-41d4-a716-446655440028",
    observation: "Armazém verificado. Estoque organizado e inventário atualizado. Nenhuma irregularidade encontrada.",
    fileIds: ["file-obs-030-001"],
    createdAt: "2025-03-12T10:20:00Z",
    createdBy: "user-002",
  },
  {
    id: "obs-031",
    locationId: "660e8400-e29b-41d4-a716-446655440030",
    observation: "Pasto Principal com excelente qualidade de grama. Animais apresentando bom ganho de peso.",
    fileIds: [],
    createdAt: "2025-03-15T08:00:00Z",
    createdBy: "user-001",
  },
  {
    id: "obs-032",
    locationId: "660e8400-e29b-41d4-a716-446655440030",
    observation: "Verificação de cercas no Pasto Principal. Alguns pontos necessitam de reparo preventivo.",
    fileIds: ["file-obs-032-001", "file-obs-032-002"],
    createdAt: "2025-03-18T14:15:00Z",
    createdBy: "user-002",
  },
  {
    id: "obs-033",
    locationId: "660e8400-e29b-41d4-a716-446655440031",
    observation: "Pasto Secundário em rotação. Área anterior se recuperando adequadamente.",
    fileIds: [],
    createdAt: "2025-03-14T09:30:00Z",
    createdBy: "user-001",
  },
  {
    id: "obs-034",
    locationId: "660e8400-e29b-41d4-a716-446655440031",
    observation: "Aplicação de herbicida seletivo realizada no Pasto Secundário. Controle de plantas daninhas em andamento.",
    fileIds: ["file-obs-034-001"],
    createdAt: "2025-03-20T11:45:00Z",
    createdBy: "user-003",
  },
  {
    id: "obs-035",
    locationId: "660e8400-e29b-41d4-a716-446655440032",
    observation: "Campo de Cultivo preparado para plantio. Solo analisado e corrigido conforme necessário.",
    fileIds: ["file-obs-035-001", "file-obs-035-002"],
    createdAt: "2025-03-16T07:20:00Z",
    createdBy: "user-001",
  },
  {
    id: "obs-036",
    locationId: "660e8400-e29b-41d4-a716-446655440032",
    observation: "Plantio realizado no Campo de Cultivo. Sementes de alta qualidade utilizadas. Condições climáticas favoráveis.",
    fileIds: ["file-obs-036-001"],
    createdAt: "2025-03-22T13:00:00Z",
    createdBy: "user-002",
  },
  {
    id: "obs-037",
    locationId: "660e8400-e29b-41d4-a716-446655440033",
    observation: "Garagem verificada. Equipamentos e veículos organizados. Nenhum problema identificado.",
    fileIds: [],
    createdAt: "2025-03-19T10:00:00Z",
    createdBy: "user-001",
  },
  {
    id: "obs-038",
    locationId: "660e8400-e29b-41d4-a716-446655440033",
    observation: "Manutenção preventiva realizada na garagem. Limpeza completa e organização dos equipamentos.",
    fileIds: ["file-obs-038-001"],
    createdAt: "2025-03-25T15:30:00Z",
    createdBy: "user-002",
  },
];

export function getLocationObservationsByLocationId(
  locationId: string
): LocationObservation[] {
  return mockLocationObservations.filter((obs) => obs.locationId === locationId);
}

export function getLocationObservationById(
  observationId: string | undefined
): LocationObservation | undefined {
  if (!observationId) return undefined;
  return mockLocationObservations.find((obs) => obs.id === observationId);
}

export function addLocationObservation(
  data: LocationObservationFormData
): LocationObservation {
  const newObservation: LocationObservation = {
    ...data,
    id: `obs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockLocationObservations.push(newObservation);
  return newObservation;
}

export function deleteLocationObservation(observationId: string): boolean {
  const index = mockLocationObservations.findIndex((obs) => obs.id === observationId);
  if (index !== -1) {
    mockLocationObservations.splice(index, 1);
    return true;
  }
  return false;
}

export function updateLocationObservation(
  observationId: string,
  data: Partial<LocationObservationFormData>
): boolean {
  const index = mockLocationObservations.findIndex((obs) => obs.id === observationId);
  if (index !== -1) {
    mockLocationObservations[index] = {
      ...mockLocationObservations[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }
  return false;
}

