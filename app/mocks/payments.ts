import type { Payment } from "~/types/payment";
import { PaymentStatus } from "~/types/payment";
import { mockCompanies } from "./companies";

const company = mockCompanies[0];

// Generate payments for the last 12 months
const generatePayments = (): Payment[] => {
  const payments: Payment[] = [];
  const plans = ["Mínimo", "Básico", "Padrão", "Avançado"];
  const planAmounts: Record<string, number> = {
    Mínimo: 49.9,
    Básico: 99.0,
    Padrão: 149.9,
    Avançado: 249.9,
  };

  const today = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    // Vary the plan and status
    const planIndex = i % plans.length;
    const plan = plans[planIndex];
    const amount = planAmounts[plan];

    // Most recent payments are paid, older ones vary
    let status: PaymentStatus;
    if (i === 0) {
      status = PaymentStatus.PAID; // Current month - paid
    } else if (i === 1) {
      status = PaymentStatus.PENDING; // Last month - pending
    } else if (i === 2) {
      status = PaymentStatus.FAILED; // Two months ago - failed
    } else {
      status = PaymentStatus.PAID; // Older payments - mostly paid
    }

    payments.push({
      id: `payment-${String(i + 1).padStart(3, "0")}`,
      companyId: company?.id || "",
      month,
      plan,
      amount,
      status,
      invoiceId: `invoice-${String(i + 1).padStart(3, "0")}`,
      createdAt: date.toISOString().split("T")[0],
    });
  }

  return payments;
};

export const mockPayments: Payment[] = generatePayments();
