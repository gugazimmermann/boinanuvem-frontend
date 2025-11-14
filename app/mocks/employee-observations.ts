import type {
  EmployeeObservation,
  EmployeeObservationFormData,
} from "~/types/employee-observation";

export type { EmployeeObservation, EmployeeObservationFormData };

export const mockEmployeeObservations: EmployeeObservation[] = [
  {
    id: "emp-obs-001",
    employeeId: "770e8400-e29b-41d4-a716-446655440010",
    observation:
      "Funcionário apresentou excelente desempenho na última colheita. Demonstrou responsabilidade e eficiência.",
    fileIds: ["file-emp-obs-001-001"],
    createdAt: "2025-01-20T10:30:00Z",
    createdBy: "user-001",
  },
  {
    id: "emp-obs-002",
    employeeId: "770e8400-e29b-41d4-a716-446655440010",
    observation: "Participou do treinamento de segurança no trabalho. Certificado anexado.",
    fileIds: ["file-emp-obs-002-001", "file-emp-obs-002-002"],
    createdAt: "2025-02-05T14:15:00Z",
    createdBy: "user-001",
  },
  {
    id: "emp-obs-003",
    employeeId: "770e8400-e29b-41d4-a716-446655440010",
    observation: "Avaliação de desempenho trimestral realizada. Resultados acima da média.",
    fileIds: ["file-emp-obs-003-001"],
    createdAt: "2025-02-28T09:00:00Z",
    createdBy: "user-002",
  },
  {
    id: "emp-obs-004",
    employeeId: "770e8400-e29b-41d4-a716-446655440011",
    observation:
      "Funcionária destacou-se no manejo de animais. Demonstrou conhecimento técnico e cuidado.",
    fileIds: [],
    createdAt: "2025-01-25T08:00:00Z",
    createdBy: "user-002",
  },
  {
    id: "emp-obs-005",
    employeeId: "770e8400-e29b-41d4-a716-446655440011",
    observation: "Reunião de feedback realizada. Pontos positivos e áreas de melhoria discutidos.",
    fileIds: ["file-emp-obs-005-001"],
    createdAt: "2025-02-15T11:30:00Z",
    createdBy: "user-001",
  },
  {
    id: "emp-obs-006",
    employeeId: "770e8400-e29b-41d4-a716-446655440011",
    observation:
      "Participação em curso de capacitação sobre técnicas de irrigação. Aprovada com nota 9.5.",
    fileIds: ["file-emp-obs-006-001"],
    createdAt: "2025-03-10T14:20:00Z",
    createdBy: "user-003",
  },
  {
    id: "emp-obs-007",
    employeeId: "770e8400-e29b-41d4-a716-446655440012",
    observation:
      "Funcionário responsável pela manutenção preventiva de equipamentos. Trabalho realizado com qualidade.",
    fileIds: ["file-emp-obs-007-001", "file-emp-obs-007-002"],
    createdAt: "2025-01-30T16:45:00Z",
    createdBy: "user-001",
  },
  {
    id: "emp-obs-008",
    employeeId: "770e8400-e29b-41d4-a716-446655440012",
    observation:
      "Avaliação de competências técnicas. Conhecimento em maquinário agrícola confirmado.",
    fileIds: [],
    createdAt: "2025-02-18T10:15:00Z",
    createdBy: "user-002",
  },
  {
    id: "emp-obs-009",
    employeeId: "770e8400-e29b-41d4-a716-446655440012",
    observation:
      "Reconhecimento por sugestão de melhoria implementada. Processo otimizado resultou em economia de tempo.",
    fileIds: ["file-emp-obs-009-001"],
    createdAt: "2025-03-05T11:20:00Z",
    createdBy: "user-001",
  },
];

export function getEmployeeObservationsByEmployeeId(employeeId: string): EmployeeObservation[] {
  return mockEmployeeObservations.filter((obs) => obs.employeeId === employeeId);
}

export function getEmployeeObservationById(
  observationId: string | undefined
): EmployeeObservation | undefined {
  if (!observationId) return undefined;
  return mockEmployeeObservations.find((obs) => obs.id === observationId);
}

export function addEmployeeObservation(data: EmployeeObservationFormData): EmployeeObservation {
  const newObservation: EmployeeObservation = {
    ...data,
    id: `emp-obs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockEmployeeObservations.push(newObservation);
  return newObservation;
}

export function deleteEmployeeObservation(observationId: string): boolean {
  const index = mockEmployeeObservations.findIndex((obs) => obs.id === observationId);
  if (index !== -1) {
    mockEmployeeObservations.splice(index, 1);
    return true;
  }
  return false;
}

export function updateEmployeeObservation(
  observationId: string,
  data: Partial<EmployeeObservationFormData>
): boolean {
  const index = mockEmployeeObservations.findIndex((obs) => obs.id === observationId);
  if (index !== -1) {
    mockEmployeeObservations[index] = {
      ...mockEmployeeObservations[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }
  return false;
}
