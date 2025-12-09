import { describe, it, expect } from "vitest";
import {
  getIncomeCategories,
  getExpenseCategories,
  getPaymentMethods,
  getAccountsPayableStatusOptions,
  getAccountsReceivableStatusOptions,
} from "../finance-form-helpers";
import { CashFlowCategory, PaymentMethod } from "~/types";

describe("getIncomeCategories", () => {
  it("should return all income categories", () => {
    const t = {
      cashFlow: {
        categories: {
          cattle_sales: "Vendas de Gado",
          milk_sales: "Vendas de Leite",
          breeding_services: "Serviços de Reprodução",
          government_subsidies: "Subsídios Governamentais",
          insurance_claims: "Indenizações de Seguro",
          other_income: "Outras Receitas",
        },
      },
    };
    const result = getIncomeCategories(t);
    expect(result).toHaveLength(6);
    expect(result[0].value).toBe(CashFlowCategory.CATTLE_SALES);
    expect(result[0].label).toBe("Vendas de Gado");
  });

  it("should handle missing translations", () => {
    const result = getIncomeCategories({});
    expect(result).toHaveLength(6);
    expect(result[0].label).toBe("");
  });

  it("should handle partial translations", () => {
    const t = {
      cashFlow: {
        categories: {
          cattle_sales: "Vendas de Gado",
        },
      },
    };
    const result = getIncomeCategories(t);
    expect(result[0].label).toBe("Vendas de Gado");
    expect(result[1].label).toBe("");
  });
});

describe("getExpenseCategories", () => {
  it("should return all expense categories", () => {
    const t = {
      cashFlow: {
        categories: {
          feed: "Ração",
          medicines: "Medicamentos",
        },
      },
    };
    const result = getExpenseCategories(t);
    expect(result.length).toBeGreaterThan(6);
    expect(result[0].value).toBe(CashFlowCategory.FEED);
  });

  it("should handle missing translations", () => {
    const result = getExpenseCategories({});
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("getPaymentMethods", () => {
  it("should return all payment methods from cashFlow", () => {
    const t = {
      cashFlow: {
        paymentMethods: {
          cash: "Dinheiro",
          bank_transfer: "Transferência Bancária",
          check: "Cheque",
          credit_card: "Cartão de Crédito",
          debit_card: "Cartão de Débito",
          pix: "PIX",
          other: "Outro",
        },
      },
    };
    const result = getPaymentMethods(t);
    expect(result).toHaveLength(7);
    expect(result[0].value).toBe(PaymentMethod.CASH);
  });

  it("should fall back to accountsPayable paymentMethods", () => {
    const t = {
      accountsPayable: {
        paymentMethods: {
          cash: "Cash",
        },
      },
    };
    const result = getPaymentMethods(t);
    expect(result[0].label).toBe("Cash");
  });

  it("should fall back to accountsReceivable paymentMethods", () => {
    const t = {
      accountsReceivable: {
        paymentMethods: {
          cash: "Cash",
        },
      },
    };
    const result = getPaymentMethods(t);
    expect(result[0].label).toBe("Cash");
  });

  it("should handle missing translations", () => {
    const result = getPaymentMethods({});
    expect(result).toHaveLength(7);
  });
});

describe("getAccountsPayableStatusOptions", () => {
  it("should return all status options", () => {
    const t = {
      accountsPayable: {
        status: {
          unpaid: "Não Pago",
          paid: "Pago",
          overdue: "Vencido",
          partial: "Parcial",
        },
      },
    };
    const result = getAccountsPayableStatusOptions(t);
    expect(result).toHaveLength(4);
    expect(result[0].value).toBe("unpaid");
    expect(result[0].label).toBe("Não Pago");
  });

  it("should handle missing translations", () => {
    const result = getAccountsPayableStatusOptions({});
    expect(result).toHaveLength(4);
    expect(result[0].label).toBe("");
  });
});

describe("getAccountsReceivableStatusOptions", () => {
  it("should return all status options", () => {
    const t = {
      accountsReceivable: {
        status: {
          unpaid: "Não Recebido",
          paid: "Recebido",
          overdue: "Vencido",
          partial: "Parcial",
        },
      },
    };
    const result = getAccountsReceivableStatusOptions(t);
    expect(result).toHaveLength(4);
    expect(result[0].value).toBe("unpaid");
    expect(result[0].label).toBe("Não Recebido");
  });

  it("should handle missing translations", () => {
    const result = getAccountsReceivableStatusOptions({});
    expect(result).toHaveLength(4);
  });
});
