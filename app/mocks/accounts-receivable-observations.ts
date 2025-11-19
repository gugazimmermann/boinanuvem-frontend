import type {
  AccountsReceivableObservation,
  AccountsReceivableObservationFormData,
} from "~/types/accounts-receivable-observation";
import { generateUUID } from "~/utils/uuid";

export type { AccountsReceivableObservation, AccountsReceivableObservationFormData };

export const mockAccountsReceivableObservations: AccountsReceivableObservation[] = [
  {
    id: generateUUID(),
    accountsReceivableId: "ar0e8400-e29b-41d4-a716-446655440010",
    observation: "Aguardando pagamento",
    fileIds: [],
    createdAt: "2025-11-05T10:00:00Z",
    createdBy: "user-001",
  },
  {
    id: generateUUID(),
    accountsReceivableId: "ar0e8400-e29b-41d4-a716-446655440011",
    observation: "Pagamento recebido antecipadamente",
    fileIds: [],
    createdAt: "2025-11-01T10:00:00Z",
    createdBy: "user-001",
  },
  {
    id: generateUUID(),
    accountsReceivableId: "ar0e8400-e29b-41d4-a716-446655440016",
    observation: "Pagamento mensal de produção leiteira",
    fileIds: [],
    createdAt: "2025-11-01T10:00:00Z",
    createdBy: "user-001",
  },
  {
    id: generateUUID(),
    accountsReceivableId: "ar0e8400-e29b-41d4-a716-446655440017",
    observation: "Aguardando pagamento",
    fileIds: [],
    createdAt: "2025-11-10T10:00:00Z",
    createdBy: "user-001",
  },
  {
    id: generateUUID(),
    accountsReceivableId: "ar0e8400-e29b-41d4-a716-446655440019",
    observation: "Venda a comprador não cadastrado",
    fileIds: [],
    createdAt: "2025-11-12T10:00:00Z",
    createdBy: "user-001",
  },
  {
    id: generateUUID(),
    accountsReceivableId: "ar0e8400-e29b-41d4-a716-446655440012",
    observation: "Vencida - seguindo com cobrança",
    fileIds: [],
    createdAt: "2025-09-28T10:00:00Z",
    createdBy: "user-001",
  },
  {
    id: generateUUID(),
    accountsReceivableId: "ar0e8400-e29b-41d4-a716-446655440014",
    observation: "Pagamento parcial - restante até 25/10",
    fileIds: [],
    createdAt: "2025-10-15T10:00:00Z",
    createdBy: "user-001",
  },
  {
    id: generateUUID(),
    accountsReceivableId: "ar0e8400-e29b-41d4-a716-446655440023",
    observation: "Vencida - aguardando pagamento",
    fileIds: [],
    createdAt: "2025-10-25T10:00:00Z",
    createdBy: "user-001",
  },
  {
    id: generateUUID(),
    accountsReceivableId: "ar0e8400-e29b-41d4-a716-446655440024",
    observation: "Vencida - seguindo com cobrança",
    fileIds: [],
    createdAt: "2025-10-05T10:00:00Z",
    createdBy: "user-001",
  },
  {
    id: generateUUID(),
    accountsReceivableId: "ar0e8400-e29b-41d4-a716-446655440013",
    observation: "Venda a comprador não cadastrado",
    fileIds: [],
    createdAt: "2025-11-10T10:00:00Z",
    createdBy: "user-001",
  },
  {
    id: generateUUID(),
    accountsReceivableId: "ar0e8400-e29b-41d4-a716-446655440038",
    observation: "Aguardando pagamento",
    fileIds: [],
    createdAt: "2025-11-25T10:00:00Z",
    createdBy: "user-001",
  },
];
