import type { InventoryMovement, InventoryMovementFormData } from "~/types";
import { InventoryMovementType } from "~/types";

export type { InventoryMovement, InventoryMovementFormData };

// Today is November 21, 2025
const TODAY = new Date("2025-11-21");

const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";
const FAZENDA_DO_JUCA = "550e8400-e29b-41d4-a716-446655440010";
const SITIO_LIMOEIRO = "550e8400-e29b-41d4-a716-446655440011";
const CHACARA_DO_JUCA = "550e8400-e29b-41d4-a716-446655440012";
const SUPPLIER_AGROFORNECEDORA = "990e8400-e29b-41d4-a716-446655440010";
const SUPPLIER_CARLOS = "990e8400-e29b-41d4-a716-446655440011";
const SUPPLIER_AGROSUPRIMENTOS = "990e8400-e29b-41d4-a716-446655440012";

// Helper to generate realistic dates across 2020-2025
function getRealisticDate(index: number, total: number): string {
  const years = [2020, 2021, 2022, 2023, 2024, 2025];
  const progress = index / total;

  let yearIndex: number;
  if (progress < 0.05) {
    yearIndex = 0;
  } else if (progress < 0.15) {
    yearIndex = 1;
  } else if (progress < 0.3) {
    yearIndex = 2;
  } else if (progress < 0.5) {
    yearIndex = 3;
  } else if (progress < 0.75) {
    yearIndex = 4;
  } else {
    yearIndex = 5;
  }

  const year = years[yearIndex];
  const month = Math.floor(Math.random() * 12) + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const day = Math.floor(Math.random() * daysInMonth) + 1;

  const date = new Date(year, month - 1, day);
  if (date > TODAY) {
    const daysAgo = Math.floor(Math.random() * 30);
    date.setTime(TODAY.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  }

  return date.toISOString().split("T")[0];
}

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

const inventoryMovements: InventoryMovement[] = [
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

// Generate more movements with realistic dates
const additionalMovements: InventoryMovement[] = [];
const items = [RACAO_PREMIUM, VACINA_AFTOSA, ANTIBIOTICO, SUPLEMENTO_MINERAL, VITAMINA_AD];
const suppliers = [SUPPLIER_AGROFORNECEDORA, SUPPLIER_CARLOS, SUPPLIER_AGROSUPRIMENTOS];
const locations = [PASTO_NORTE, PASTO_SUL, CONFINAMENTO_PRINCIPAL];
const properties = [FAZENDA_DO_JUCA, SITIO_LIMOEIRO, CHACARA_DO_JUCA];

// Generate 30 more movements (purchases and consumptions)
for (let i = 0; i < 30; i++) {
  const itemId = items[i % items.length];
  const isPurchase = i % 3 === 0; // Every 3rd is a purchase
  const date = getRealisticDate(i, 30);
  const dateObj = new Date(date);

  if (isPurchase) {
    // Purchase movement
    const supplierId = suppliers[i % suppliers.length];
    const propertyId = properties[i % properties.length];
    const quantity = [500, 1000, 2000, 50, 100, 200][i % 6];
    const unitPrice =
      itemId === RACAO_PREMIUM
        ? 1.5 + Math.random() * 0.5
        : itemId === VACINA_AFTOSA
          ? 7 + Math.random() * 2
          : itemId === ANTIBIOTICO
            ? 40 + Math.random() * 10
            : itemId === SUPLEMENTO_MINERAL
              ? 2 + Math.random() * 0.5
              : 20 + Math.random() * 10;

    // Expiration date for items with expiration (6-12 months after purchase)
    let expirationDate: string | undefined;
    if (itemId === VACINA_AFTOSA || itemId === ANTIBIOTICO || itemId === VITAMINA_AD) {
      const expDate = new Date(dateObj);
      expDate.setMonth(expDate.getMonth() + 6 + Math.floor(Math.random() * 6));
      expirationDate = expDate.toISOString().split("T")[0];
    }

    additionalMovements.push({
      id: `im0e8400-e29b-41d4-a716-${(446655440020 + i).toString().padStart(12, "0")}`,
      itemId,
      type: InventoryMovementType.PURCHASE,
      quantity,
      unitPrice: Math.round(unitPrice * 100) / 100,
      date,
      description: `Compra de ${itemId === RACAO_PREMIUM ? "ração" : itemId === VACINA_AFTOSA ? "vacinas" : itemId === ANTIBIOTICO ? "antibióticos" : itemId === SUPLEMENTO_MINERAL ? "suplemento mineral" : "vitaminas"}`,
      supplierId,
      propertyId,
      companyId: COMPANY_ID,
      expirationDate,
      createdAt: date,
    });
  } else {
    // Consumption movement
    const propertyId = properties[i % properties.length];
    const locationId = locations[i % locations.length];
    const quantity = [50, 100, 150, 200, 250, 300][i % 6];

    additionalMovements.push({
      id: `im0e8400-e29b-41d4-a716-${(446655440020 + i).toString().padStart(12, "0")}`,
      itemId,
      type: InventoryMovementType.CONSUMPTION,
      quantity,
      date,
      description: `Consumo de ${itemId === RACAO_PREMIUM ? "ração" : itemId === VACINA_AFTOSA ? "vacinas" : itemId === ANTIBIOTICO ? "antibióticos" : itemId === SUPLEMENTO_MINERAL ? "suplemento mineral" : "vitaminas"}`,
      propertyId,
      companyId: COMPANY_ID,
      locationId,
      createdAt: date,
    });
  }
}

// Combine and sort by date
const allMovements = [...inventoryMovements, ...additionalMovements];
allMovements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const mockInventoryMovements: InventoryMovement[] = allMovements;
