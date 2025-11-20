import type {
  InventoryObservation,
  InventoryObservationFormData,
} from "~/types/inventory-observation";
import { generateUUID } from "~/utils/uuid";

export type { InventoryObservation, InventoryObservationFormData };

export const mockInventoryObservations: InventoryObservation[] = [
  {
    id: generateUUID(),
    itemId: "ii0e8400-e29b-41d4-a716-446655440010",
    observation:
      "Verificação de qualidade da ração realizada. Produto dentro dos padrões de qualidade.",
    fileIds: ["file-inventory-obs-001-001"],
    createdAt: "2025-01-15T10:30:00Z",
    createdBy: "user-001",
  },
  {
    id: generateUUID(),
    itemId: "ii0e8400-e29b-41d4-a716-446655440010",
    observation: "Estoque verificado. Quantidade atual adequada para o próximo mês.",
    fileIds: ["file-inventory-obs-002-001", "file-inventory-obs-002-002"],
    createdAt: "2025-01-20T14:15:00Z",
    createdBy: "user-001",
  },
  {
    id: generateUUID(),
    itemId: "ii0e8400-e29b-41d4-a716-446655440011",
    observation: "Vacinas armazenadas corretamente em temperatura adequada. Validade verificada.",
    fileIds: ["file-inventory-obs-003-001"],
    createdAt: "2025-01-28T09:00:00Z",
    createdBy: "user-002",
  },
  {
    id: generateUUID(),
    itemId: "ii0e8400-e29b-41d4-a716-446655440011",
    observation:
      "Aplicação de vacinas realizada conforme calendário. Registro de aplicação anexado.",
    fileIds: ["file-inventory-obs-004-001", "file-inventory-obs-004-002"],
    createdAt: "2025-02-05T11:30:00Z",
    createdBy: "user-001",
  },
  {
    id: generateUUID(),
    itemId: "ii0e8400-e29b-41d4-a716-446655440012",
    observation: "Medicamento verificado. Embalagens íntegras e dentro do prazo de validade.",
    fileIds: ["file-inventory-obs-005-001"],
    createdAt: "2025-02-12T14:20:00Z",
    createdBy: "user-003",
  },
  {
    id: generateUUID(),
    itemId: "ii0e8400-e29b-41d4-a716-446655440012",
    observation:
      "Uso de antibiótico registrado. Tratamento aplicado conforme prescrição veterinária.",
    fileIds: [],
    createdAt: "2025-02-22T16:45:00Z",
    createdBy: "user-001",
  },
  {
    id: generateUUID(),
    itemId: "ii0e8400-e29b-41d4-a716-446655440013",
    observation:
      "Suplemento mineral adicionado à dieta do rebanho. Resultados positivos observados.",
    fileIds: ["file-inventory-obs-007-001"],
    createdAt: "2025-02-08T10:15:00Z",
    createdBy: "user-002",
  },
  {
    id: generateUUID(),
    itemId: "ii0e8400-e29b-41d4-a716-446655440013",
    observation: "Estoque de suplemento verificado. Necessário repor em breve.",
    fileIds: ["file-inventory-obs-008-001", "file-inventory-obs-008-002"],
    createdAt: "2025-02-25T11:20:00Z",
    createdBy: "user-003",
  },
];
