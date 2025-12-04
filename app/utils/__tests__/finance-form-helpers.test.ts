import { describe, it, expect } from "vitest";
import {
  getIncomeCategories,
  getExpenseCategories,
  getPaymentMethods,
  getAccountsPayableStatusOptions,
  getAccountsReceivableStatusOptions,
} from "../finance-form-helpers";
import { CashFlowCategory, PaymentMethod } from "~/types";

describe("finance-form-helpers", () => {
  describe("getIncomeCategories", () => {
    it("should return all income categories with translations", () => {
      const t = {
        cashFlow: {
          categories: {
            cattle_sales: "Vendas de Gado",
            milk_sales: "Vendas de Leite",
            breeding_services: "Serviços de Reprodução",
            government_subsidies: "Subsídios Governamentais",
            insurance_claims: "Sinistros de Seguro",
            other_income: "Outras Receitas",
          },
        },
      };

      const result = getIncomeCategories(t);

      expect(result).toHaveLength(6);
      expect(result[0]).toEqual({
        value: CashFlowCategory.CATTLE_SALES,
        label: "Vendas de Gado",
      });
      expect(result[1]).toEqual({
        value: CashFlowCategory.MILK_SALES,
        label: "Vendas de Leite",
      });
      expect(result[2]).toEqual({
        value: CashFlowCategory.BREEDING_SERVICES,
        label: "Serviços de Reprodução",
      });
      expect(result[3]).toEqual({
        value: CashFlowCategory.GOVERNMENT_SUBSIDIES,
        label: "Subsídios Governamentais",
      });
      expect(result[4]).toEqual({
        value: CashFlowCategory.INSURANCE_CLAIMS,
        label: "Sinistros de Seguro",
      });
      expect(result[5]).toEqual({
        value: CashFlowCategory.OTHER_INCOME,
        label: "Outras Receitas",
      });
    });

    it("should return empty labels when translations are missing", () => {
      const t = {};

      const result = getIncomeCategories(t);

      expect(result).toHaveLength(6);
      expect(result[0].label).toBe("");
      expect(result[1].label).toBe("");
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
    it("should return all expense categories with translations", () => {
      const t = {
        cashFlow: {
          categories: {
            feed: "Ração",
            medicines: "Medicamentos",
            vaccines: "Vacinas",
            veterinary: "Veterinário",
            insemination: "Inseminação",
            labor: "Mão de Obra",
            pasture: "Pastagem",
            transportation: "Transporte",
            fuel: "Combustível",
            equipment: "Equipamentos",
            maintenance: "Manutenção",
            buildings: "Construções",
            utilities: "Utilidades",
            insurance: "Seguro",
            taxes: "Impostos",
            rent_lease: "Aluguel/Locação",
            animal_acquisition: "Aquisição de Animais",
            other_expenses: "Outras Despesas",
          },
        },
      };

      const result = getExpenseCategories(t);

      expect(result).toHaveLength(18);
      expect(result[0]).toEqual({
        value: CashFlowCategory.FEED,
        label: "Ração",
      });
      expect(result[17]).toEqual({
        value: CashFlowCategory.OTHER_EXPENSES,
        label: "Outras Despesas",
      });
    });

    it("should return empty labels when translations are missing", () => {
      const t = {};

      const result = getExpenseCategories(t);

      expect(result).toHaveLength(18);
      expect(result[0].label).toBe("");
    });
  });

  describe("getPaymentMethods", () => {
    it("should return all payment methods from cashFlow translations", () => {
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
      expect(result[0]).toEqual({
        value: PaymentMethod.CASH,
        label: "Dinheiro",
      });
      expect(result[1]).toEqual({
        value: PaymentMethod.BANK_TRANSFER,
        label: "Transferência Bancária",
      });
    });

    it("should fallback to accountsPayable paymentMethods", () => {
      const t = {
        accountsPayable: {
          paymentMethods: {
            cash: "Cash",
            bank_transfer: "Bank Transfer",
          },
        },
      };

      const result = getPaymentMethods(t);

      expect(result[0].label).toBe("Cash");
      expect(result[1].label).toBe("Bank Transfer");
    });

    it("should fallback to accountsReceivable paymentMethods", () => {
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

    it("should return empty labels when no translations are provided", () => {
      const t = {};

      const result = getPaymentMethods(t);

      expect(result).toHaveLength(7);
      expect(result[0].label).toBeUndefined();
    });
  });

  describe("getAccountsPayableStatusOptions", () => {
    it("should return all status options with translations", () => {
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
      expect(result[0]).toEqual({
        value: "unpaid",
        label: "Não Pago",
      });
      expect(result[1]).toEqual({
        value: "paid",
        label: "Pago",
      });
      expect(result[2]).toEqual({
        value: "overdue",
        label: "Vencido",
      });
      expect(result[3]).toEqual({
        value: "partial",
        label: "Parcial",
      });
    });

    it("should return empty labels when translations are missing", () => {
      const t = {};

      const result = getAccountsPayableStatusOptions(t);

      expect(result).toHaveLength(4);
      expect(result[0].label).toBe("");
    });
  });

  describe("getAccountsReceivableStatusOptions", () => {
    it("should return all status options with translations", () => {
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
      expect(result[0]).toEqual({
        value: "unpaid",
        label: "Não Recebido",
      });
      expect(result[1]).toEqual({
        value: "paid",
        label: "Recebido",
      });
      expect(result[2]).toEqual({
        value: "overdue",
        label: "Vencido",
      });
      expect(result[3]).toEqual({
        value: "partial",
        label: "Parcial",
      });
    });

    it("should return empty labels when translations are missing", () => {
      const t = {};

      const result = getAccountsReceivableStatusOptions(t);

      expect(result).toHaveLength(4);
      expect(result[0].label).toBe("");
    });
  });
});
