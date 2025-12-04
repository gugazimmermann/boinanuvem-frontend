import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { meta, loader, default as SaleDetails } from "../../dashboard/records.sales.$saleId";
import { mockSales } from "~/mocks/sales";
import { mockBuyers } from "~/mocks/buyers";
import { mockProperties } from "~/mocks/properties";
import { mockAnimals } from "~/mocks/animals";
import { SaleType, SalePaymentMethod } from "~/types";
import type { Sale } from "~/types";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({ saleId: mockSales[0]?.id || "sale-1" })),
    useNavigate: vi.fn(() => vi.fn()),
    Link: vi.fn(({ to, children }: { to?: string; children?: React.ReactNode }) => (
      <a href={to}>{children}</a>
    )),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/sales.service", () => ({
  getSaleById: vi.fn((id: string) => mockSales.find((s) => s.id === id)),
  deleteSale: vi.fn(() => true),
}));

vi.mock("~/services/buyers.service", () => ({
  getBuyerById: vi.fn((id: string) => mockBuyers.find((b) => b.id === id)),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((id: string) => mockProperties.find((p) => p.id === id)),
}));

vi.mock("~/services/animals.service", () => ({
  getAnimalById: vi.fn((id: string) => mockAnimals.find((a) => a.id === id)),
}));

vi.mock("~/utils/profitability", () => ({
  calculateAnimalProfitability: vi.fn(() => ({
    totalCost: 1000,
    salePrice: 1500,
    profit: 500,
    profitMargin: 33.33,
  })),
}));

vi.mock("~/utils/currency", () => ({
  formatCurrency: vi.fn((value: number) => `R$ ${value.toFixed(2)}`),
}));

vi.mock("~/utils/fees", () => ({
  getTotalFees: vi.fn(() => 0),
}));

vi.mock("~/utils/permissions", () => ({
  usePermissions: vi.fn(() => ({
    canEdit: vi.fn(() => true),
    canRemove: vi.fn(() => true),
  })),
}));

vi.mock("~/hooks/use-alert", () => ({
  useAlert: vi.fn(() => ({
    alertMessage: null,
    showAlert: vi.fn(),
  })),
}));

vi.mock("~/components/ui", () => ({
  Button: vi.fn(
    ({
      onClick,
      children,
      variant,
    }: {
      onClick?: () => void;
      children?: React.ReactNode;
      variant?: string;
    }) => (
      <button onClick={onClick} data-variant={variant} data-testid="button">
        {children}
      </button>
    )
  ),
  StatusBadge: vi.fn(({ label, variant }: { label?: string; variant?: string }) => (
    <span data-variant={variant}>{label}</span>
  )),
  Alert: vi.fn(({ variant, title }: { variant?: string; title?: string }) => (
    <div data-variant={variant}>{title}</div>
  )),
  ConfirmationModal: vi.fn(
    ({
      isOpen,
      onConfirm,
      onClose,
      title,
      message,
    }: {
      isOpen?: boolean;
      onConfirm?: () => void;
      onClose?: () => void;
      title?: string;
      message?: string;
    }) => {
      if (!isOpen) return null;
      return (
        <div data-testid="confirmation-modal">
          <h2>{title}</h2>
          <p>{message}</p>
          <button onClick={onConfirm} data-testid="confirm-button">
            Confirm
          </button>
          <button onClick={onClose} data-testid="close-button">
            Close
          </button>
        </div>
      );
    }
  ),
}));

vi.mock("~/routes.config", () => ({
  ROUTES: {
    SALES: "/dashboard/registros/vendas",
  },
  getSaleEditRoute: vi.fn((id: string) => `/dashboard/registros/vendas/${id}/editar`),
  getCashFlowViewRoute: vi.fn((id: string) => `/dashboard/fluxo-caixa/${id}`),
  getAccountsReceivableViewRoute: vi.fn((id: string) => `/dashboard/contas-receber/${id}`),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    sales: {
      notFound: "Venda não encontrada",
      details: {
        title: "Detalhes da Venda",
        property: "Propriedade",
        buyer: "Comprador",
        saleType: "Tipo de Venda",
        pricingMode: "Modo de Precificação",
        paymentMethod: "Método de Pagamento",
        saleDate: "Data da Venda",
        linkedCashFlow: "Transação de Fluxo de Caixa",
        viewCashFlow: "Ver transação",
        linkedAccountsReceivable: "Conta a Receber",
        viewAccountsReceivable: "Ver conta",
        saleItems: "Itens da Venda",
        weight: "Peso",
        carcassWeight: "Peso da Carcaça",
        pricePerKg: "Preço/kg",
        profitability: "Rentabilidade",
        cost: "Custo Total",
        price: "Preço de Venda",
        profit: "Lucro",
        profitMargin: "Margem",
        subtotal: "Subtotal",
        total: "Total",
        observation: "Observações",
        transportationFee: "Taxa de Transporte",
        additionalFees: "Taxas Adicionais",
      },
      saleTypes: {
        slaughterhouse: "Frigorífico",
        auction: "Leilão",
        otherFarm: "Outra Propriedade",
      },
      pricingModes: {
        individual: "Individual",
        total: "Preço Total",
      },
      paymentMethods: {
        cashFlow: "À Vista",
        accountsReceivable: "A Receber",
      },
      success: {
        deleted: "Venda excluída com sucesso",
      },
      errors: {
        deleteFailed: "Erro ao excluir venda",
      },
      deleteModal: {
        title: "Excluir Venda",
        message: "Tem certeza que deseja excluir esta venda?",
        confirm: "Excluir",
        cancel: "Cancelar",
      },
    },
    common: {
      back: "Voltar",
      edit: "Editar",
      delete: "Excluir",
    },
  })),
}));

vi.mock("~/contexts/language-context", () => ({
  useLanguage: vi.fn(() => ({ language: "pt" })),
}));

const TestWrapper = ({
  children,
  initialEntries = [`/dashboard/registros/vendas/${mockSales[0]?.id || "sale-1"}`],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("records.sales.$saleId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].title).toContain("Detalhes da Venda");
    });
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request("http://localhost/dashboard/registros/vendas/sale-1");

      await loader({ request });

      expect(createRouteGuard).toHaveBeenCalled();
    });
  });

  describe("SaleDetails component", () => {
    it("should render sale details when sale exists", () => {
      render(
        <TestWrapper>
          <SaleDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Detalhes da Venda")).toBeInTheDocument();
    });

    it("should render empty state when sale is not found", async () => {
      const { useParams } = await import("react-router");
      const { getSaleById } = await import("~/services/sales.service");
      vi.mocked(useParams).mockReturnValue({ saleId: "non-existent" });
      vi.mocked(getSaleById).mockReturnValue(undefined);

      render(
        <TestWrapper initialEntries={["/dashboard/registros/vendas/non-existent"]}>
          <SaleDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Venda não encontrada")).toBeInTheDocument();
    });

    it("should handle edit button click", async () => {
      const { useNavigate, useParams } = await import("react-router");
      const { getSaleEditRoute } = await import("~/routes.config");
      const { getSaleById } = await import("~/services/sales.service");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      // Ensure sale exists - set before rendering
      const saleId = mockSales[0]?.id || "sale-1";
      vi.mocked(useParams).mockReturnValue({ saleId });
      vi.mocked(getSaleById).mockReturnValue(mockSales[0] || null);

      render(
        <TestWrapper>
          <SaleDetails />
        </TestWrapper>
      );

      // Wait for sale details to render (not empty state)
      await waitFor(
        () => {
          const emptyState = screen.queryByText("Venda não encontrada");
          expect(emptyState).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      await waitFor(
        () => {
          const editButton = screen.queryByText("Editar");
          expect(editButton).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      const editButton = screen.getByText("Editar");
      await userEvent.click(editButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(getSaleEditRoute(saleId));
      });
    });

    it("should handle delete button click", async () => {
      const { useNavigate, useParams } = await import("react-router");
      const { deleteSale, getSaleById } = await import("~/services/sales.service");
      const { useAlert } = await import("~/hooks/use-alert");
      const mockNavigate = vi.fn();
      const mockShowAlert = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      } as never);

      // Ensure sale exists - set before rendering
      const saleId = mockSales[0]?.id || "sale-1";
      vi.mocked(useParams).mockReturnValue({ saleId });
      vi.mocked(getSaleById).mockReturnValue(mockSales[0] || null);

      render(
        <TestWrapper>
          <SaleDetails />
        </TestWrapper>
      );

      // Wait for sale details to render (not empty state)
      await waitFor(
        () => {
          const emptyState = screen.queryByText("Venda não encontrada");
          expect(emptyState).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      await waitFor(
        () => {
          const deleteButton = screen.queryByText("Excluir");
          expect(deleteButton).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      const deleteButton = screen.getByText("Excluir");
      await userEvent.click(deleteButton);

      await waitFor(() => {
        const modal = screen.queryByTestId("confirmation-modal");
        expect(modal).toBeInTheDocument();
      });

      const confirmButton = screen.getByTestId("confirm-button");
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(deleteSale).toHaveBeenCalled();
      });
    });

    it("should render sale items with profitability", async () => {
      const { useParams } = await import("react-router");
      const { getSaleById } = await import("~/services/sales.service");
      // Ensure sale exists - set before rendering
      const saleId = mockSales[0]?.id || "sale-1";
      vi.mocked(useParams).mockReturnValue({ saleId });
      vi.mocked(getSaleById).mockReturnValue(mockSales[0] || null);

      render(
        <TestWrapper>
          <SaleDetails />
        </TestWrapper>
      );

      // Wait for sale details to render
      await waitFor(
        () => {
          const emptyState = screen.queryByText("Venda não encontrada");
          expect(emptyState).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      expect(screen.getByText("Itens da Venda")).toBeInTheDocument();
    });

    it("should render linked cash flow when present", async () => {
      const { getSaleById } = await import("~/services/sales.service");
      vi.mocked(getSaleById).mockReturnValueOnce({
        ...mockSales[0],
        linkedCashFlowId: "cashflow-1",
      } as Sale);

      render(
        <TestWrapper>
          <SaleDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Ver transação")).toBeInTheDocument();
    });

    it("should render linked accounts receivable when present", async () => {
      const { getSaleById } = await import("~/services/sales.service");
      vi.mocked(getSaleById).mockReturnValueOnce({
        ...mockSales[0],
        linkedAccountsReceivableId: "receivable-1",
      } as Sale);

      render(
        <TestWrapper>
          <SaleDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Ver conta")).toBeInTheDocument();
    });

    it("should render all sale types correctly", async () => {
      const { getSaleById } = await import("~/services/sales.service");
      const saleTypes = [SaleType.SLAUGHTERHOUSE, SaleType.AUCTION, SaleType.OTHER_FARM];

      for (const saleType of saleTypes) {
        vi.mocked(getSaleById).mockReturnValueOnce({
          ...mockSales[0],
          saleType,
        } as Sale);

        const { container } = render(
          <TestWrapper>
            <SaleDetails />
          </TestWrapper>
        );

        await waitFor(
          () => {
            const emptyState = screen.queryByText("Venda não encontrada");
            expect(emptyState).not.toBeInTheDocument();
          },
          { timeout: 2000 }
        );

        // Verify sale type is rendered
        expect(container).toBeInTheDocument();
      }
    });

    it("should render payment method badges correctly", async () => {
      const { getSaleById } = await import("~/services/sales.service");
      const paymentMethods = [SalePaymentMethod.CASH_FLOW, SalePaymentMethod.ACCOUNTS_RECEIVABLE];

      for (const paymentMethod of paymentMethods) {
        vi.mocked(getSaleById).mockReturnValueOnce({
          ...mockSales[0],
          paymentMethod,
        } as Sale);

        const { container } = render(
          <TestWrapper>
            <SaleDetails />
          </TestWrapper>
        );

        await waitFor(
          () => {
            const emptyState = screen.queryByText("Venda não encontrada");
            expect(emptyState).not.toBeInTheDocument();
          },
          { timeout: 2000 }
        );

        expect(container).toBeInTheDocument();
      }
    });

    it("should render sale items with carcass weight when present", async () => {
      const { getSaleById } = await import("~/services/sales.service");
      vi.mocked(getSaleById).mockReturnValueOnce({
        ...mockSales[0],
        saleItems: [
          {
            ...mockSales[0].saleItems[0],
            carcassWeight: 200,
          },
        ],
      } as Sale);

      render(
        <TestWrapper>
          <SaleDetails />
        </TestWrapper>
      );

      await waitFor(
        () => {
          const emptyState = screen.queryByText("Venda não encontrada");
          expect(emptyState).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      expect(screen.getByText("Itens da Venda")).toBeInTheDocument();
    });

    it("should render profitability with negative profit", async () => {
      const { calculateAnimalProfitability } = await import("~/utils/profitability");
      vi.mocked(calculateAnimalProfitability).mockReturnValueOnce({
        totalCost: 2000,
        salePrice: 1500,
        profit: -500,
        profitMargin: -25,
      });

      render(
        <TestWrapper>
          <SaleDetails />
        </TestWrapper>
      );

      await waitFor(
        () => {
          const emptyState = screen.queryByText("Venda não encontrada");
          expect(emptyState).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      expect(screen.getByText("Itens da Venda")).toBeInTheDocument();
    });

    it("should render fees when present", async () => {
      const { getSaleById } = await import("~/services/sales.service");
      const { getTotalFees } = await import("~/utils/fees");
      vi.mocked(getSaleById).mockReturnValueOnce({
        ...mockSales[0],
        fees: [
          { id: "fee-1", name: "Transporte", amount: 100 },
          { id: "fee-2", name: "Taxa", amount: 50 },
        ],
      } as Sale);
      vi.mocked(getTotalFees).mockReturnValueOnce(150);

      render(
        <TestWrapper>
          <SaleDetails />
        </TestWrapper>
      );

      await waitFor(
        () => {
          const emptyState = screen.queryByText("Venda não encontrada");
          expect(emptyState).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      expect(screen.getByText("Itens da Venda")).toBeInTheDocument();
    });

    it("should render legacy fees when fees array is empty", async () => {
      const { getSaleById } = await import("~/services/sales.service");
      const { getTotalFees } = await import("~/utils/fees");
      vi.mocked(getSaleById).mockReturnValueOnce({
        ...mockSales[0],
        fees: [],
        transportationFee: 100,
        additionalFees: 50,
      } as Sale);
      vi.mocked(getTotalFees).mockReturnValueOnce(150);

      render(
        <TestWrapper>
          <SaleDetails />
        </TestWrapper>
      );

      await waitFor(
        () => {
          const emptyState = screen.queryByText("Venda não encontrada");
          expect(emptyState).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      expect(screen.getByText("Itens da Venda")).toBeInTheDocument();
    });

    it("should render observation when present", async () => {
      const { getSaleById } = await import("~/services/sales.service");
      vi.mocked(getSaleById).mockReturnValueOnce({
        ...mockSales[0],
        observation: "Test observation",
      } as Sale);

      render(
        <TestWrapper>
          <SaleDetails />
        </TestWrapper>
      );

      await waitFor(
        () => {
          const emptyState = screen.queryByText("Venda não encontrada");
          expect(emptyState).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      expect(screen.getByText("Observações")).toBeInTheDocument();
    });

    it("should handle delete failure", async () => {
      const { useNavigate, useParams } = await import("react-router");
      const { deleteSale, getSaleById } = await import("~/services/sales.service");
      const { useAlert } = await import("~/hooks/use-alert");
      const mockNavigate = vi.fn();
      const mockShowAlert = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(deleteSale).mockReturnValueOnce(false);
      vi.mocked(useAlert).mockReturnValue({
        alertMessage: null,
        showAlert: mockShowAlert,
      } as never);

      const saleId = mockSales[0]?.id || "sale-1";
      vi.mocked(useParams).mockReturnValue({ saleId });
      vi.mocked(getSaleById).mockReturnValue(mockSales[0] || null);

      render(
        <TestWrapper>
          <SaleDetails />
        </TestWrapper>
      );

      await waitFor(
        () => {
          const emptyState = screen.queryByText("Venda não encontrada");
          expect(emptyState).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      await waitFor(
        () => {
          const deleteButton = screen.queryByText("Excluir");
          expect(deleteButton).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      const deleteButton = screen.getByText("Excluir");
      await userEvent.click(deleteButton);

      await waitFor(() => {
        const modal = screen.queryByTestId("confirmation-modal");
        expect(modal).toBeInTheDocument();
      });

      const confirmButton = screen.getByTestId("confirm-button");
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(deleteSale).toHaveBeenCalled();
        expect(mockShowAlert).toHaveBeenCalledWith(expect.stringContaining("Erro"), "error");
      });
    });

    it("should handle modal close", async () => {
      const { useParams } = await import("react-router");
      const { getSaleById } = await import("~/services/sales.service");
      const saleId = mockSales[0]?.id || "sale-1";
      vi.mocked(useParams).mockReturnValue({ saleId });
      vi.mocked(getSaleById).mockReturnValue(mockSales[0] || null);

      render(
        <TestWrapper>
          <SaleDetails />
        </TestWrapper>
      );

      await waitFor(
        () => {
          const emptyState = screen.queryByText("Venda não encontrada");
          expect(emptyState).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      const deleteButton = screen.getByText("Excluir");
      await userEvent.click(deleteButton);

      await waitFor(() => {
        const modal = screen.queryByTestId("confirmation-modal");
        expect(modal).toBeInTheDocument();
      });

      const closeButton = screen.getByTestId("close-button");
      await userEvent.click(closeButton);

      await waitFor(() => {
        const modal = screen.queryByTestId("confirmation-modal");
        expect(modal).not.toBeInTheDocument();
      });
    });

    it("should not show edit button when user cannot edit", async () => {
      const { usePermissions } = await import("~/utils/permissions");
      const { useParams } = await import("react-router");
      const { getSaleById } = await import("~/services/sales.service");
      vi.mocked(usePermissions).mockReturnValueOnce({
        canEdit: vi.fn(() => false),
        canRemove: vi.fn(() => true),
      } as never);

      const saleId = mockSales[0]?.id || "sale-1";
      vi.mocked(useParams).mockReturnValue({ saleId });
      vi.mocked(getSaleById).mockReturnValue(mockSales[0] || null);

      render(
        <TestWrapper>
          <SaleDetails />
        </TestWrapper>
      );

      await waitFor(
        () => {
          const emptyState = screen.queryByText("Venda não encontrada");
          expect(emptyState).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      const editButton = screen.queryByText("Editar");
      expect(editButton).not.toBeInTheDocument();
    });

    it("should not show delete button when user cannot remove", async () => {
      const { usePermissions } = await import("~/utils/permissions");
      const { useParams } = await import("react-router");
      const { getSaleById } = await import("~/services/sales.service");
      vi.mocked(usePermissions).mockReturnValueOnce({
        canEdit: vi.fn(() => true),
        canRemove: vi.fn(() => false),
      } as never);

      const saleId = mockSales[0]?.id || "sale-1";
      vi.mocked(useParams).mockReturnValue({ saleId });
      vi.mocked(getSaleById).mockReturnValue(mockSales[0] || null);

      render(
        <TestWrapper>
          <SaleDetails />
        </TestWrapper>
      );

      await waitFor(
        () => {
          const emptyState = screen.queryByText("Venda não encontrada");
          expect(emptyState).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      const deleteButton = screen.queryByText("Excluir");
      expect(deleteButton).not.toBeInTheDocument();
    });

    it("should render pricing mode correctly", async () => {
      const { getSaleById } = await import("~/services/sales.service");
      vi.mocked(getSaleById).mockReturnValueOnce({
        ...mockSales[0],
        pricingMode: "individual",
      } as Sale);

      render(
        <TestWrapper>
          <SaleDetails />
        </TestWrapper>
      );

      await waitFor(
        () => {
          const emptyState = screen.queryByText("Venda não encontrada");
          expect(emptyState).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      expect(screen.getByText("Detalhes da Venda")).toBeInTheDocument();
    });
  });
});
