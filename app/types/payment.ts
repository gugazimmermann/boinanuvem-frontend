export enum PaymentStatus {
  PAID = "paid",
  PENDING = "pending",
  FAILED = "failed",
}

export interface Payment extends Record<string, unknown> {
  id: string;
  companyId: string;
  month: string; // date string (YYYY-MM format)
  plan: string; // plan name: "Mínimo", "Básico", "Padrão", "Avançado"
  amount: number;
  status: PaymentStatus;
  invoiceId: string; // for API endpoint
  createdAt: string;
}
