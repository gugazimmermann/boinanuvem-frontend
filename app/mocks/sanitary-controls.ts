import type { SanitaryControl } from "~/types/sanitary-control";

const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";

export const mockSanitaryControls: SanitaryControl[] = [
  {
    id: "ma0e8400-e29b-41d4-a716-446655440010",
    animalId: "a0e8400-e29b-41d4-a716-446655440010",
    date: "2025-01-15",
    appliedMedicines: [
      {
        itemId: "ii0e8400-e29b-41d4-a716-446655440011",
        quantity: 1,
        calculatedDosage: 1,
      },
    ],
    employeeIds: [],
    serviceProviderIds: [],
    observation: "Vacinação de rotina",
    companyId: COMPANY_ID,
    createdAt: "2025-01-15",
  },
  {
    id: "ma0e8400-e29b-41d4-a716-446655440011",
    animalId: "a0e8400-e29b-41d4-a716-446655440012",
    date: "2025-02-01",
    appliedMedicines: [
      {
        itemId: "ii0e8400-e29b-41d4-a716-446655440012",
        quantity: 25.5,
        calculatedDosage: 25.5,
      },
    ],
    employeeIds: [],
    serviceProviderIds: [],
    companyId: COMPANY_ID,
    createdAt: "2025-02-01",
  },
];
