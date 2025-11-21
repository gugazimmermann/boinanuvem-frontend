import type { AccountsPayable, AccountsPayableFormData } from "~/types";
import { AccountsPayableStatus, PaymentMethod, CashFlowCategory } from "~/types";
import { mockBankAccounts } from "./bank-accounts";
import { mockEmployees } from "./employees";
import { mockServiceProviders } from "./service-providers";
import { mockProperties } from "./properties";

export type { AccountsPayable, AccountsPayableFormData };

// Today is November 21, 2025
const TODAY = new Date("2025-11-21");

const COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";
const SUPPLIER_1 = "990e8400-e29b-41d4-a716-446655440010";
const SUPPLIER_2 = "990e8400-e29b-41d4-a716-446655440011";
const SUPPLIER_3 = "990e8400-e29b-41d4-a716-446655440012";

const BANK_ACCOUNT_BB = mockBankAccounts[0].id;
const BANK_ACCOUNT_BRADESCO = mockBankAccounts[1].id;
const BANK_ACCOUNT_CEF = mockBankAccounts[2].id;
const PROPERTY_1 = mockProperties[0]?.id || "";
const PROPERTY_2 = mockProperties[1]?.id || "";

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

const accountsPayableTransactions: AccountsPayable[] = [
  {
    id: "ap0e8400-e29b-41d4-a716-446655440010",
    companyId: COMPANY_ID,
    supplierId: SUPPLIER_1,
    amount: 5000.0,
    dueDate: "2025-11-20",
    description: "Fatura de ração - novembro",
    category: CashFlowCategory.FEED,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    bankAccountId: BANK_ACCOUNT_BB,
    status: AccountsPayableStatus.UNPAID,
    referenceNumber: "FAT-2025-001",
    propertyId: PROPERTY_1,
    createdAt: "2025-11-05",
  },
  {
    id: "ap0e8400-e29b-41d4-a716-446655440011",
    companyId: COMPANY_ID,
    supplierId: SUPPLIER_2,
    amount: 3200.0,
    dueDate: "2025-11-10",
    description: "Fatura de medicamentos veterinários",
    category: CashFlowCategory.MEDICINES,
    paymentMethod: PaymentMethod.PIX,
    bankAccountId: BANK_ACCOUNT_BRADESCO,
    serviceProviderId: mockServiceProviders[0].id,
    status: AccountsPayableStatus.PAID,
    paidDate: "2025-11-08",
    paidAmount: 3200.0,
    referenceNumber: "FAT-2025-002",
    propertyId: PROPERTY_1,
    createdAt: "2025-11-01",
  },
  {
    id: "ap0e8400-e29b-41d4-a716-446655440013",
    companyId: COMPANY_ID,
    amount: 2800.0,
    dueDate: "2025-11-25",
    description: "Salário funcionário - novembro",
    category: CashFlowCategory.LABOR,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    status: AccountsPayableStatus.UNPAID,
    employeeId: mockEmployees[1].id,
    bankAccountId: BANK_ACCOUNT_BB,
    referenceNumber: "FAT-2025-004",
    propertyId: PROPERTY_2,
    createdAt: "2025-11-08",
  },
  {
    id: "ap0e8400-e29b-41d4-a716-446655440015",
    companyId: COMPANY_ID,
    supplierId: SUPPLIER_2,
    amount: 4500.0,
    dueDate: "2025-12-05",
    description: "Fatura de suplementos",
    category: CashFlowCategory.FEED,
    paymentMethod: PaymentMethod.CHECK,
    status: AccountsPayableStatus.UNPAID,
    referenceNumber: "FAT-2025-006",
    propertyId: PROPERTY_2,
    createdAt: "2025-11-12",
  },
  {
    id: "ap0e8400-e29b-41d4-a716-446655440016",
    companyId: COMPANY_ID,
    supplierId: SUPPLIER_1,
    amount: 6800.0,
    dueDate: "2025-11-28",
    description: "Fatura de vacinas - novembro",
    category: CashFlowCategory.VACCINES,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    bankAccountId: BANK_ACCOUNT_BB,
    status: AccountsPayableStatus.UNPAID,
    referenceNumber: "FAT-2025-007",
    propertyId: PROPERTY_1,
    createdAt: "2025-11-10",
  },
  {
    id: "ap0e8400-e29b-41d4-a716-446655440017",
    companyId: COMPANY_ID,
    amount: 3200.0,
    dueDate: "2025-11-30",
    description: "Salário funcionário - novembro",
    category: CashFlowCategory.LABOR,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    status: AccountsPayableStatus.UNPAID,
    employeeId: mockEmployees[2].id,
    bankAccountId: BANK_ACCOUNT_CEF,
    referenceNumber: "FAT-2025-008",
    propertyId: PROPERTY_1,
    createdAt: "2025-11-15",
  },
  {
    id: "ap0e8400-e29b-41d4-a716-446655440018",
    companyId: COMPANY_ID,
    supplierId: SUPPLIER_3,
    amount: 5200.0,
    dueDate: "2025-11-15",
    description: "Fatura de equipamentos agrícolas",
    category: CashFlowCategory.EQUIPMENT,
    paymentMethod: PaymentMethod.PIX,
    bankAccountId: BANK_ACCOUNT_BRADESCO,
    status: AccountsPayableStatus.PAID,
    paidDate: "2025-11-14",
    paidAmount: 5200.0,
    referenceNumber: "FAT-2025-009",
    propertyId: PROPERTY_2,
    createdAt: "2025-11-01",
  },
  {
    id: "ap0e8400-e29b-41d4-a716-446655440019",
    companyId: COMPANY_ID,
    serviceProviderId: mockServiceProviders[1].id,
    amount: 1800.0,
    dueDate: "2025-11-22",
    description: "Consulta veterinária - novembro",
    category: CashFlowCategory.VETERINARY,
    paymentMethod: PaymentMethod.CASH,
    status: AccountsPayableStatus.UNPAID,
    referenceNumber: "FAT-2025-010",
    propertyId: PROPERTY_1,
    createdAt: "2025-11-12",
  },

  {
    id: "ap0e8400-e29b-41d4-a716-446655440012",
    companyId: COMPANY_ID,
    supplierId: SUPPLIER_3,
    amount: 15000.0,
    dueDate: "2025-10-15",
    description: "Fatura de equipamentos agrícolas",
    category: CashFlowCategory.EQUIPMENT,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    bankAccountId: BANK_ACCOUNT_CEF,
    status: AccountsPayableStatus.OVERDUE,
    referenceNumber: "FAT-2025-003",
    propertyId: PROPERTY_2,
    createdAt: "2025-10-01",
  },
  {
    id: "ap0e8400-e29b-41d4-a716-446655440014",
    companyId: COMPANY_ID,
    supplierId: SUPPLIER_1,
    amount: 10000.0,
    dueDate: "2025-10-30",
    description: "Fatura de ração - outubro",
    category: CashFlowCategory.FEED,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    bankAccountId: BANK_ACCOUNT_BB,
    status: AccountsPayableStatus.PARTIAL,
    paidDate: "2025-10-28",
    paidAmount: 5000.0,
    referenceNumber: "FAT-2025-005",
    propertyId: PROPERTY_1,
    createdAt: "2025-10-20",
  },
  {
    id: "ap0e8400-e29b-41d4-a716-446655440020",
    companyId: COMPANY_ID,
    supplierId: SUPPLIER_2,
    amount: 4200.0,
    dueDate: "2025-10-10",
    description: "Fatura de medicamentos - outubro",
    category: CashFlowCategory.MEDICINES,
    paymentMethod: PaymentMethod.PIX,
    bankAccountId: BANK_ACCOUNT_BRADESCO,
    status: AccountsPayableStatus.PAID,
    paidDate: "2025-10-09",
    paidAmount: 4200.0,
    referenceNumber: "FAT-2025-011",
    propertyId: PROPERTY_2,
    createdAt: "2025-10-01",
  },
  {
    id: "ap0e8400-e29b-41d4-a716-446655440021",
    companyId: COMPANY_ID,
    amount: 7500.0,
    dueDate: "2025-10-25",
    description: "Salários funcionários - outubro",
    category: CashFlowCategory.LABOR,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    status: AccountsPayableStatus.PAID,
    employeeId: mockEmployees[0].id,
    bankAccountId: BANK_ACCOUNT_CEF,
    paidDate: "2025-10-25",
    paidAmount: 7500.0,
    referenceNumber: "FAT-2025-012",
    propertyId: PROPERTY_1,
    createdAt: "2025-10-20",
  },
  {
    id: "ap0e8400-e29b-41d4-a716-446655440022",
    companyId: COMPANY_ID,
    supplierId: SUPPLIER_1,
    amount: 3800.0,
    dueDate: "2025-10-05",
    description: "Fatura de ração - setembro",
    category: CashFlowCategory.FEED,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    bankAccountId: BANK_ACCOUNT_BB,
    status: AccountsPayableStatus.OVERDUE,
    referenceNumber: "FAT-2025-013",
    propertyId: PROPERTY_2,
    createdAt: "2025-09-25",
  },
  {
    id: "ap0e8400-e29b-41d4-a716-446655440023",
    companyId: COMPANY_ID,
    serviceProviderId: mockServiceProviders[0].id,
    amount: 1500.0,
    dueDate: "2025-10-20",
    description: "Inseminação artificial - outubro",
    category: CashFlowCategory.INSEMINATION,
    paymentMethod: PaymentMethod.CASH,
    status: AccountsPayableStatus.PAID,
    paidDate: "2025-10-20",
    paidAmount: 1500.0,
    referenceNumber: "FAT-2025-014",
    propertyId: PROPERTY_1,
    createdAt: "2025-10-15",
  },
  {
    id: "ap0e8400-e29b-41d4-a716-446655440024",
    companyId: COMPANY_ID,
    supplierId: SUPPLIER_3,
    amount: 2800.0,
    dueDate: "2025-10-28",
    description: "Fatura de manutenção de equipamentos",
    category: CashFlowCategory.MAINTENANCE,
    paymentMethod: PaymentMethod.CREDIT_CARD,
    status: AccountsPayableStatus.PAID,
    paidDate: "2025-10-27",
    paidAmount: 2800.0,
    referenceNumber: "FAT-2025-015",
    propertyId: PROPERTY_2,
    createdAt: "2025-10-20",
  },

  {
    id: "ap0e8400-e29b-41d4-a716-446655440025",
    companyId: COMPANY_ID,
    supplierId: SUPPLIER_1,
    amount: 4800.0,
    dueDate: "2025-09-20",
    description: "Fatura de ração - setembro",
    category: CashFlowCategory.FEED,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    bankAccountId: BANK_ACCOUNT_BB,
    status: AccountsPayableStatus.PAID,
    paidDate: "2025-09-19",
    paidAmount: 4800.0,
    referenceNumber: "FAT-2025-016",
    propertyId: PROPERTY_1,
    createdAt: "2025-09-10",
  },
  {
    id: "ap0e8400-e29b-41d4-a716-446655440026",
    companyId: COMPANY_ID,
    amount: 2400.0,
    dueDate: "2025-09-18",
    description: "Salário funcionário - setembro",
    category: CashFlowCategory.LABOR,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    status: AccountsPayableStatus.PAID,
    employeeId: mockEmployees[1].id,
    bankAccountId: BANK_ACCOUNT_CEF,
    paidDate: "2025-09-18",
    paidAmount: 2400.0,
    referenceNumber: "FAT-2025-017",
    propertyId: PROPERTY_2,
    createdAt: "2025-09-15",
  },
  {
    id: "ap0e8400-e29b-41d4-a716-446655440027",
    companyId: COMPANY_ID,
    supplierId: SUPPLIER_2,
    amount: 3600.0,
    dueDate: "2025-09-12",
    description: "Fatura de medicamentos - setembro",
    category: CashFlowCategory.MEDICINES,
    paymentMethod: PaymentMethod.PIX,
    bankAccountId: BANK_ACCOUNT_BRADESCO,
    status: AccountsPayableStatus.PAID,
    paidDate: "2025-09-11",
    paidAmount: 3600.0,
    referenceNumber: "FAT-2025-018",
    propertyId: PROPERTY_1,
    createdAt: "2025-09-05",
  },
  {
    id: "ap0e8400-e29b-41d4-a716-446655440028",
    companyId: COMPANY_ID,
    serviceProviderId: mockServiceProviders[1].id,
    amount: 1950.0,
    dueDate: "2025-09-22",
    description: "Consulta veterinária - emergência",
    category: CashFlowCategory.VETERINARY,
    paymentMethod: PaymentMethod.CASH,
    status: AccountsPayableStatus.PAID,
    paidDate: "2025-09-22",
    paidAmount: 1950.0,
    referenceNumber: "FAT-2025-019",
    propertyId: PROPERTY_2,
    createdAt: "2025-09-20",
  },
  {
    id: "ap0e8400-e29b-41d4-a716-446655440029",
    companyId: COMPANY_ID,
    supplierId: SUPPLIER_3,
    amount: 5500.0,
    dueDate: "2025-09-30",
    description: "Fatura de equipamentos",
    category: CashFlowCategory.EQUIPMENT,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    bankAccountId: BANK_ACCOUNT_CEF,
    status: AccountsPayableStatus.PAID,
    paidDate: "2025-09-29",
    paidAmount: 5500.0,
    referenceNumber: "FAT-2025-020",
    propertyId: PROPERTY_1,
    createdAt: "2025-09-20",
  },

  {
    id: "ap0e8400-e29b-41d4-a716-446655440030",
    companyId: COMPANY_ID,
    supplierId: SUPPLIER_1,
    amount: 5200.0,
    dueDate: "2025-08-20",
    description: "Fatura de ração - agosto",
    category: CashFlowCategory.FEED,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    bankAccountId: BANK_ACCOUNT_BB,
    status: AccountsPayableStatus.PAID,
    paidDate: "2025-08-19",
    paidAmount: 5200.0,
    referenceNumber: "FAT-2025-021",
    propertyId: PROPERTY_2,
    createdAt: "2025-08-10",
  },
  {
    id: "ap0e8400-e29b-41d4-a716-446655440031",
    companyId: COMPANY_ID,
    amount: 7500.0,
    dueDate: "2025-08-20",
    description: "Salários funcionários - agosto",
    category: CashFlowCategory.LABOR,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    status: AccountsPayableStatus.PAID,
    employeeId: mockEmployees[0].id,
    bankAccountId: BANK_ACCOUNT_CEF,
    paidDate: "2025-08-20",
    paidAmount: 7500.0,
    referenceNumber: "FAT-2025-022",
    propertyId: PROPERTY_1,
    createdAt: "2025-08-15",
  },
  {
    id: "ap0e8400-e29b-41d4-a716-446655440032",
    companyId: COMPANY_ID,
    supplierId: SUPPLIER_2,
    amount: 2800.0,
    dueDate: "2025-08-18",
    description: "Fatura de medicamentos - agosto",
    category: CashFlowCategory.MEDICINES,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    bankAccountId: BANK_ACCOUNT_BB,
    status: AccountsPayableStatus.PAID,
    paidDate: "2025-08-17",
    paidAmount: 2800.0,
    referenceNumber: "FAT-2025-023",
    propertyId: PROPERTY_2,
    createdAt: "2025-08-05",
  },
  {
    id: "ap0e8400-e29b-41d4-a716-446655440033",
    companyId: COMPANY_ID,
    supplierId: SUPPLIER_3,
    amount: 3600.0,
    dueDate: "2025-08-15",
    description: "Fatura de manutenção de cercas",
    category: CashFlowCategory.MAINTENANCE,
    paymentMethod: PaymentMethod.CREDIT_CARD,
    status: AccountsPayableStatus.PAID,
    paidDate: "2025-08-14",
    paidAmount: 3600.0,
    referenceNumber: "FAT-2025-024",
    propertyId: PROPERTY_1,
    createdAt: "2025-08-10",
  },
  {
    id: "ap0e8400-e29b-41d4-a716-446655440034",
    companyId: COMPANY_ID,
    serviceProviderId: mockServiceProviders[0].id,
    amount: 1500.0,
    dueDate: "2025-08-25",
    description: "Inseminação artificial - agosto",
    category: CashFlowCategory.INSEMINATION,
    paymentMethod: PaymentMethod.CASH,
    status: AccountsPayableStatus.PAID,
    paidDate: "2025-08-25",
    paidAmount: 1500.0,
    referenceNumber: "FAT-2025-025",
    propertyId: PROPERTY_2,
    createdAt: "2025-08-20",
  },

  {
    id: "ap0e8400-e29b-41d4-a716-446655440035",
    companyId: COMPANY_ID,
    supplierId: SUPPLIER_1,
    amount: 4200.0,
    dueDate: "2025-07-20",
    description: "Fatura de ração - julho",
    category: CashFlowCategory.FEED,
    paymentMethod: PaymentMethod.PIX,
    bankAccountId: BANK_ACCOUNT_BRADESCO,
    status: AccountsPayableStatus.PAID,
    paidDate: "2025-07-19",
    paidAmount: 4200.0,
    referenceNumber: "FAT-2025-026",
    propertyId: PROPERTY_1,
    createdAt: "2025-07-10",
  },
  {
    id: "ap0e8400-e29b-41d4-a716-446655440036",
    companyId: COMPANY_ID,
    amount: 3200.0,
    dueDate: "2025-07-15",
    description: "Salário funcionário - julho",
    category: CashFlowCategory.LABOR,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    status: AccountsPayableStatus.PAID,
    employeeId: mockEmployees[2].id,
    bankAccountId: BANK_ACCOUNT_CEF,
    paidDate: "2025-07-15",
    paidAmount: 3200.0,
    referenceNumber: "FAT-2025-027",
    propertyId: PROPERTY_2,
    createdAt: "2025-07-10",
  },
  {
    id: "ap0e8400-e29b-41d4-a716-446655440037",
    companyId: COMPANY_ID,
    supplierId: SUPPLIER_2,
    amount: 2500.0,
    dueDate: "2025-07-10",
    description: "Fatura de medicamentos - julho",
    category: CashFlowCategory.MEDICINES,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    bankAccountId: BANK_ACCOUNT_BB,
    status: AccountsPayableStatus.PAID,
    paidDate: "2025-07-09",
    paidAmount: 2500.0,
    referenceNumber: "FAT-2025-028",
    propertyId: PROPERTY_1,
    createdAt: "2025-07-05",
  },

  {
    id: "ap0e8400-e29b-41d4-a716-446655440038",
    companyId: COMPANY_ID,
    supplierId: SUPPLIER_1,
    amount: 5500.0,
    dueDate: "2025-12-10",
    description: "Fatura de ração - dezembro",
    category: CashFlowCategory.FEED,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    bankAccountId: BANK_ACCOUNT_BB,
    status: AccountsPayableStatus.UNPAID,
    referenceNumber: "FAT-2025-029",
    propertyId: PROPERTY_1,
    createdAt: "2025-11-25",
  },
  {
    id: "ap0e8400-e29b-41d4-a716-446655440039",
    companyId: COMPANY_ID,
    amount: 8500.0,
    dueDate: "2025-12-25",
    description: "Salários funcionários - dezembro",
    category: CashFlowCategory.LABOR,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    status: AccountsPayableStatus.UNPAID,
    employeeId: mockEmployees[0].id,
    bankAccountId: BANK_ACCOUNT_CEF,
    referenceNumber: "FAT-2025-030",
    propertyId: PROPERTY_2,
    createdAt: "2025-11-28",
  },
];

// Generate dates for all transactions
const transactionsWithDates = accountsPayableTransactions.map((transaction, index) => {
  const newDate = getRealisticDate(index, accountsPayableTransactions.length);
  const dueDate = new Date(newDate);
  dueDate.setDate(dueDate.getDate() + (15 + Math.floor(Math.random() * 15))); // Due 15-30 days after creation

  // If paid, payment date should be between creation and due date (or slightly after)
  let paidDate: string | undefined;
  if (transaction.status === AccountsPayableStatus.PAID && transaction.paidDate) {
    const paymentDaysAfter = Math.floor(Math.random() * 35);
    const paymentDateObj = new Date(newDate);
    paymentDateObj.setDate(paymentDateObj.getDate() + paymentDaysAfter);
    if (paymentDateObj > TODAY) {
      paymentDateObj.setTime(
        TODAY.getTime() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000
      );
    }
    paidDate = paymentDateObj.toISOString().split("T")[0];
  }

  return {
    ...transaction,
    dueDate: dueDate.toISOString().split("T")[0],
    paidDate,
    createdAt: newDate,
    referenceNumber:
      transaction.referenceNumber?.replace(/2025/g, newDate.substring(0, 4)) ||
      transaction.referenceNumber,
  };
});

// Sort by due date (most recent first)
transactionsWithDates.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

export const mockAccountsPayable: AccountsPayable[] = transactionsWithDates;
