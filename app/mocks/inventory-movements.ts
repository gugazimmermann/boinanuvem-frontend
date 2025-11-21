import type { InventoryMovement, InventoryMovementFormData } from "~/types";
import { InventoryMovementType } from "~/types";

export type { InventoryMovement, InventoryMovementFormData };

const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";
const FAZENDA_DO_JUCA = "550e8400-e29b-41d4-a716-446655440010";
const _SITIO_LIMOEIRO = "550e8400-e29b-41d4-a716-446655440011";
const _CHACARA_DO_JUCA = "550e8400-e29b-41d4-a716-446655440012";
const SUPPLIER_AGROFORNECEDORA = "990e8400-e29b-41d4-a716-446655440010";
const SUPPLIER_CARLOS = "990e8400-e29b-41d4-a716-446655440011";
const SUPPLIER_AGROSUPRIMENTOS = "990e8400-e29b-41d4-a716-446655440012";

// Item IDs from inventory.ts
const RACAO_PREMIUM = "ii0e8400-e29b-41d4-a716-446655440010";
const VACINA_AFTOSA = "ii0e8400-e29b-41d4-a716-446655440011";
const ANTIBIOTICO = "ii0e8400-e29b-41d4-a716-446655440012";
const SUPLEMENTO_MINERAL = "ii0e8400-e29b-41d4-a716-446655440013";
const VITAMINA_AD = "ii0e8400-e29b-41d4-a716-446655440014";

// Cash flow IDs (some linked to purchases)
const CASH_FLOW_RACAO = "cc0e8400-e29b-41d4-a716-446655440011";
const CASH_FLOW_VACINA = "cc0e8400-e29b-41d4-a716-446655440012";

// Location IDs from locations.ts
const PASTO_NORTE = "660e8400-e29b-41d4-a716-446655440010";
const PASTO_SUL = "660e8400-e29b-41d4-a716-446655440011";
const CONFINAMENTO_PRINCIPAL = "660e8400-e29b-41d4-a716-446655440014";

export const mockInventoryMovements: InventoryMovement[] = [
  {
    id: "im0e8400-e29b-41d4-a716-446655440010",
    itemId: RACAO_PREMIUM,
    type: InventoryMovementType.PURCHASE,
    quantity: 2000,
    unitPrice: 1.75,
    date: "2025-11-10",
    description: "Compra de ração premium - 2 toneladas",
    supplierId: SUPPLIER_AGROFORNECEDORA,
    cashFlowId: CASH_FLOW_RACAO,
    propertyId: FAZENDA_DO_JUCA,
    companyId: COMPANY_ID,
    createdAt: "2025-11-10",
  },
  {
    id: "im0e8400-e29b-41d4-a716-446655440011",
    itemId: RACAO_PREMIUM,
    type: InventoryMovementType.CONSUMPTION,
    quantity: 500,
    date: "2025-11-15",
    description: "Consumo de ração para alimentação do rebanho",
    propertyId: FAZENDA_DO_JUCA,
    companyId: COMPANY_ID,
    locationId: PASTO_NORTE,
    createdAt: "2025-11-15",
  },
  {
    id: "im0e8400-e29b-41d4-a716-446655440012",
    itemId: VACINA_AFTOSA,
    type: InventoryMovementType.PURCHASE,
    quantity: 200,
    unitPrice: 8.5,
    date: "2025-11-12",
    description: "Compra de vacinas contra febre aftosa",
    supplierId: SUPPLIER_AGROSUPRIMENTOS,
    cashFlowId: CASH_FLOW_VACINA,
    propertyId: FAZENDA_DO_JUCA,
    companyId: COMPANY_ID,
    expirationDate: "2025-12-31",
    createdAt: "2025-11-12",
  },
  {
    id: "im0e8400-e29b-41d4-a716-446655440013",
    itemId: VACINA_AFTOSA,
    type: InventoryMovementType.CONSUMPTION,
    quantity: 50,
    date: "2025-11-20",
    description: "Aplicação de vacinas no rebanho",
    propertyId: FAZENDA_DO_JUCA,
    companyId: COMPANY_ID,
    locationId: PASTO_NORTE,
    createdAt: "2025-11-20",
  },
  {
    id: "im0e8400-e29b-41d4-a716-446655440014",
    itemId: ANTIBIOTICO,
    type: InventoryMovementType.PURCHASE,
    quantity: 50,
    unitPrice: 45.0,
    date: "2025-11-08",
    description: "Compra de antibióticos veterinários",
    supplierId: SUPPLIER_CARLOS,
    propertyId: FAZENDA_DO_JUCA,
    companyId: COMPANY_ID,
    expirationDate: "2025-06-30",
    createdAt: "2025-11-08",
  },
  {
    id: "im0e8400-e29b-41d4-a716-446655440015",
    itemId: ANTIBIOTICO,
    type: InventoryMovementType.CONSUMPTION,
    quantity: 10,
    date: "2025-11-18",
    description: "Uso de antibióticos para tratamento de animais",
    propertyId: FAZENDA_DO_JUCA,
    companyId: COMPANY_ID,
    locationId: PASTO_SUL,
    createdAt: "2025-11-18",
  },
  {
    id: "im0e8400-e29b-41d4-a716-446655440016",
    itemId: SUPLEMENTO_MINERAL,
    type: InventoryMovementType.PURCHASE,
    quantity: 500,
    unitPrice: 2.2,
    date: "2025-11-05",
    description: "Compra de suplemento mineral",
    supplierId: SUPPLIER_AGROFORNECEDORA,
    propertyId: FAZENDA_DO_JUCA,
    companyId: COMPANY_ID,
    createdAt: "2025-11-05",
  },
  {
    id: "im0e8400-e29b-41d4-a716-446655440017",
    itemId: SUPLEMENTO_MINERAL,
    type: InventoryMovementType.CONSUMPTION,
    quantity: 150,
    date: "2025-11-22",
    description: "Consumo de suplemento mineral",
    propertyId: FAZENDA_DO_JUCA,
    companyId: COMPANY_ID,
    locationId: CONFINAMENTO_PRINCIPAL,
    createdAt: "2025-11-22",
  },
  {
    id: "im0e8400-e29b-41d4-a716-446655440018",
    itemId: RACAO_PREMIUM,
    type: InventoryMovementType.ADJUSTMENT,
    quantity: -50,
    date: "2025-11-25",
    description: "Ajuste de estoque - perda por umidade",
    propertyId: FAZENDA_DO_JUCA,
    companyId: COMPANY_ID,
    createdAt: "2025-11-25",
  },
  {
    id: "im0e8400-e29b-41d4-a716-446655440019",
    itemId: VITAMINA_AD,
    type: InventoryMovementType.PURCHASE,
    quantity: 30,
    unitPrice: 25.0,
    date: "2025-11-14",
    description: "Compra de complexo vitamínico",
    supplierId: SUPPLIER_AGROSUPRIMENTOS,
    propertyId: FAZENDA_DO_JUCA,
    companyId: COMPANY_ID,
    expirationDate: "2025-08-15",
    createdAt: "2025-11-14",
  },
];
