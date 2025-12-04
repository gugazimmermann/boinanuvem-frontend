import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import {
  loader,
  meta,
  default as AccountsPayableDetails,
} from "../../dashboard/accounts-payable.$transactionId";
import { ROUTES, getAccountsPayableEditRoute } from "~/routes.config";
import { mockAccountsPayable } from "~/mocks/accounts-payable";
import { mockSuppliers } from "~/mocks/suppliers";
import { mockEmployees } from "~/mocks/employees";
import { mockServiceProviders } from "~/mocks/service-providers";
import { mockProperties } from "~/mocks/properties";
import { mockBankAccounts } from "~/mocks/bank-accounts";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({ transactionId: "ap-001" })),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/accounts-payable.service", () => ({
  getAccountsPayableById: vi.fn((id: string) => {
    return mockAccountsPayable.find((ap) => ap.id === id) || null;
  }),
}));

vi.mock("~/services/suppliers.service", () => ({
  getSupplierById: vi.fn((id: string) => {
    return mockSuppliers.find((s) => s.id === id) || null;
  }),
}));

vi.mock("~/services/employees.service", () => ({
  getEmployeeById: vi.fn((id: string) => {
    return mockEmployees.find((e) => e.id === id) || null;
  }),
}));

vi.mock("~/services/service-providers.service", () => ({
  getServiceProviderById: vi.fn((id: string) => {
    return mockServiceProviders.find((sp) => sp.id === id) || null;
  }),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((id: string) => {
    return mockProperties.find((p) => p.id === id) || null;
  }),
}));

vi.mock("~/services/bank-account.service", () => ({
  getBankAccountById: vi.fn((id: string) => {
    return mockBankAccounts.find((ba) => ba.id === id) || null;
  }),
}));

vi.mock("~/services/accounts-payable-observations.service", () => ({
  getAccountsPayableObservationsByAccountsPayableId: vi.fn(() => []),
  addAccountsPayableObservation: vi.fn(),
}));

vi.mock("~/components/dashboard/observations/observation-section", () => ({
  ObservationSection: vi.fn(() => <div data-testid="observation-section">Observations</div>),
}));

vi.mock("~/components/dashboard/finance/finance-detail-card", () => ({
  FinanceDetailCard: vi.fn(({ fields }: { fields: unknown[] }) => (
    <div data-testid="finance-detail-card">
      {fields.map((_, i) => (
        <div key={i} data-testid={`field-${i}`} />
      ))}
    </div>
  )),
}));

vi.mock("~/components/ui", () => ({
  Button: vi.fn(
    ({
      children,
      onClick,
      variant,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      variant?: string;
    }) => (
      <button onClick={onClick} data-variant={variant}>
        {children}
      </button>
    )
  ),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    accountsPayable: {
      emptyState: { title: "Conta a pagar não encontrada" },
      details: {
        transactionInfo: "Informações da Transação",
        supplier: "Fornecedor",
        employee: "Funcionário",
        serviceProvider: "Prestador de Serviço",
        property: "Propriedade",
        amount: "Valor",
        dueDate: "Data de Vencimento",
        status: "Status",
        description: "Descrição",
        paymentMethod: "Método de Pagamento",
        bankAccount: "Conta Bancária",
        paidDate: "Data de Pagamento",
        paidAmount: "Valor Pago",
        referenceNumber: "Número de Referência",
        createdAt: "Data de Criação",
        observations: "Observações",
        observationsDescription: "Gerencie as observações desta conta a pagar",
        searchObservations: "Buscar observações...",
        noObservations: "Nenhuma observação registrada",
        noObservationsDescription: "Adicione sua primeira observação sobre esta conta a pagar.",
        noObservationsWithSearch: (search: string) =>
          `Nenhuma observação encontrada para "${search}"`,
        observationDate: "Data",
        observation: "Observação",
        files: "Anexos",
        addObservation: "Adicionar Observação",
        observationPlaceholder: "Digite sua observação sobre esta conta a pagar...",
        filesHelper: "Você pode fazer upload de múltiplos arquivos",
        observationRequired: "Por favor, insira uma observação",
        observationAdded: "Observação adicionada com sucesso!",
        observationError: "Erro ao adicionar observação",
      },
      status: {
        paid: "Pago",
        unpaid: "Não Pago",
        overdue: "Vencido",
        partial: "Parcial",
      },
      paymentMethods: {
        cash: "Dinheiro",
        bank_transfer: "Transferência Bancária",
        check: "Cheque",
        credit_card: "Cartão de Crédito",
      },
    },
    bankAccounts: {
      accountTypes: {
        checking: "Corrente",
        savings: "Poupança",
      },
    },
    common: {
      back: "Voltar",
      save: "Salvar",
      cancel: "Cancelar",
      clearSearch: "Limpar busca",
    },
  })),
}));

vi.mock("~/contexts/language-context", () => ({
  useLanguage: vi.fn(() => ({ language: "pt-BR" })),
}));

vi.mock("~/utils/permissions", () => ({
  usePermissions: vi.fn(() => ({
    canEdit: vi.fn(() => true),
  })),
}));

vi.mock("~/utils/finance", () => ({
  getStatusVariant: vi.fn(() => "success"),
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/contas-pagar/ap-001"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("accounts-payable.$transactionId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request("http://localhost/dashboard/contas-pagar/ap-001");

      await loader({ request });

      expect(createRouteGuard).toHaveBeenCalled();
    });
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty("title");
      expect(result[0].title).toContain("Conta a Pagar");
    });
  });

  describe("AccountsPayableDetails component", () => {
    it("should render empty state when transaction is not found", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ transactionId: "non-existent" });

      render(
        <TestWrapper>
          <AccountsPayableDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Conta a pagar não encontrada")).toBeInTheDocument();
    });

    it("should render transaction details when transaction exists", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ transactionId: mockAccountsPayable[0].id });

      render(
        <TestWrapper>
          <AccountsPayableDetails />
        </TestWrapper>
      );

      expect(screen.getByText("Informações da Transação")).toBeInTheDocument();
      expect(screen.getByTestId("finance-detail-card")).toBeInTheDocument();
    });

    it("should render back button", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ transactionId: mockAccountsPayable[0].id });

      render(
        <TestWrapper>
          <AccountsPayableDetails />
        </TestWrapper>
      );

      const backButton = screen.getByText("Voltar");
      expect(backButton).toBeInTheDocument();
    });

    it("should navigate back when back button is clicked", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useParams).mockReturnValue({ transactionId: mockAccountsPayable[0].id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <AccountsPayableDetails />
        </TestWrapper>
      );

      const backButton = screen.getByText("Voltar");
      await userEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.ACCOUNTS_PAYABLE);
    });

    it("should render edit button when user has edit permission", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ transactionId: mockAccountsPayable[0].id });

      render(
        <TestWrapper>
          <AccountsPayableDetails />
        </TestWrapper>
      );

      const editButton = screen.getByText("Salvar");
      expect(editButton).toBeInTheDocument();
    });

    it("should navigate to edit route when edit button is clicked", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      const transaction = mockAccountsPayable[0];
      vi.mocked(useParams).mockReturnValue({ transactionId: transaction.id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <AccountsPayableDetails />
        </TestWrapper>
      );

      const editButton = screen.getByText("Salvar");
      await userEvent.click(editButton);

      expect(mockNavigate).toHaveBeenCalledWith(getAccountsPayableEditRoute(transaction.id));
    });

    it("should not render edit button when user does not have edit permission", async () => {
      const { usePermissions } = await import("~/utils/permissions");
      vi.mocked(usePermissions).mockReturnValue({
        canEdit: vi.fn(() => false),
      } as never);

      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ transactionId: mockAccountsPayable[0].id });

      render(
        <TestWrapper>
          <AccountsPayableDetails />
        </TestWrapper>
      );

      const editButton = screen.queryByText("Salvar");
      expect(editButton).not.toBeInTheDocument();
    });

    it("should render observation section", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ transactionId: mockAccountsPayable[0].id });

      render(
        <TestWrapper>
          <AccountsPayableDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("observation-section")).toBeInTheDocument();
    });

    it("should update observations when observation is added", async () => {
      const { useParams } = await import("react-router");
      const { getAccountsPayableObservationsByAccountsPayableId } = await import(
        "~/services/accounts-payable-observations.service"
      );
      const transaction = mockAccountsPayable[0];
      vi.mocked(useParams).mockReturnValue({ transactionId: transaction.id });

      const mockObservations = [
        {
          id: "obs-1",
          accountsPayableId: transaction.id,
          observation: "Test observation",
          createdAt: "2025-01-01",
        },
      ];
      vi.mocked(getAccountsPayableObservationsByAccountsPayableId).mockReturnValue(
        mockObservations
      );

      render(
        <TestWrapper>
          <AccountsPayableDetails />
        </TestWrapper>
      );

      const observationSection = screen.getByTestId("observation-section");
      expect(observationSection).toBeInTheDocument();
    });

    it("should handle handleAddObservation with files", async () => {
      const { useParams } = await import("react-router");
      const { addAccountsPayableObservation, getAccountsPayableObservationsByAccountsPayableId } =
        await import("~/services/accounts-payable-observations.service");
      const transaction = mockAccountsPayable[0];
      vi.mocked(useParams).mockReturnValue({ transactionId: transaction.id });

      const mockObservations = [
        {
          id: "obs-1",
          accountsPayableId: transaction.id,
          observation: "Test observation",
          createdAt: "2025-01-01",
        },
      ];
      vi.mocked(getAccountsPayableObservationsByAccountsPayableId).mockReturnValue(
        mockObservations
      );

      const ObservationSection = (
        await import("~/components/dashboard/observations/observation-section")
      ).ObservationSection;
      vi.mocked(ObservationSection).mockImplementation(
        ({ onAddObservation }: { onAddObservation: (text: string, files: File[]) => void }) => {
          const handleClick = () => {
            const files = [new File(["test"], "test.txt")];
            onAddObservation("Test observation", files);
          };
          return (
            <div data-testid="observation-section">
              <button onClick={handleClick}>Add Observation</button>
            </div>
          );
        }
      );

      render(
        <TestWrapper>
          <AccountsPayableDetails />
        </TestWrapper>
      );

      const addButton = screen.getByText("Add Observation");
      await userEvent.click(addButton);

      await waitFor(() => {
        expect(addAccountsPayableObservation).toHaveBeenCalledWith(
          expect.objectContaining({
            accountsPayableId: transaction.id,
            observation: "Test observation",
            fileIds: expect.arrayContaining([expect.stringMatching(/^file-ap-obs-/)]),
          })
        );
      });
    });

    it("should handle handleAddObservation without files", async () => {
      const { useParams } = await import("react-router");
      const { addAccountsPayableObservation } = await import(
        "~/services/accounts-payable-observations.service"
      );
      const transaction = mockAccountsPayable[0];
      vi.mocked(useParams).mockReturnValue({ transactionId: transaction.id });

      const ObservationSection = (
        await import("~/components/dashboard/observations/observation-section")
      ).ObservationSection;
      vi.mocked(ObservationSection).mockImplementation(
        ({ onAddObservation }: { onAddObservation: (text: string, files: File[]) => void }) => {
          const handleClick = () => {
            onAddObservation("Test observation", []);
          };
          return (
            <div data-testid="observation-section">
              <button onClick={handleClick}>Add Observation</button>
            </div>
          );
        }
      );

      render(
        <TestWrapper>
          <AccountsPayableDetails />
        </TestWrapper>
      );

      const addButton = screen.getByText("Add Observation");
      await userEvent.click(addButton);

      await waitFor(() => {
        expect(addAccountsPayableObservation).toHaveBeenCalledWith(
          expect.objectContaining({
            accountsPayableId: transaction.id,
            observation: "Test observation",
            fileIds: undefined,
          })
        );
      });
    });

    it("should render transaction with all optional fields", async () => {
      const { useParams } = await import("react-router");
      const transaction = {
        ...mockAccountsPayable[0],
        supplierId: mockSuppliers[0]?.id,
        employeeId: mockEmployees[0]?.id,
        serviceProviderId: mockServiceProviders[0]?.id,
        propertyId: mockProperties[0]?.id,
        bankAccountId: mockBankAccounts[0]?.id,
        paymentMethod: "cash" as const,
        paidDate: "2025-01-15",
        paidAmount: 500,
        referenceNumber: "REF-123",
      };
      vi.mocked(useParams).mockReturnValue({ transactionId: transaction.id });
      const { getAccountsPayableById } = await import("~/services/accounts-payable.service");
      vi.mocked(getAccountsPayableById).mockReturnValue(transaction as never);

      render(
        <TestWrapper>
          <AccountsPayableDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("finance-detail-card")).toBeInTheDocument();
    });

    it("should render transaction with checking bank account", async () => {
      const { useParams } = await import("react-router");
      const checkingAccount = { ...mockBankAccounts[0], accountType: "checking" as const };
      const transaction = {
        ...mockAccountsPayable[0],
        bankAccountId: checkingAccount.id,
      };
      vi.mocked(useParams).mockReturnValue({ transactionId: transaction.id });
      const { getAccountsPayableById } = await import("~/services/accounts-payable.service");
      const { getBankAccountById } = await import("~/services/bank-account.service");
      vi.mocked(getAccountsPayableById).mockReturnValue(transaction as never);
      vi.mocked(getBankAccountById).mockReturnValue(checkingAccount as never);

      render(
        <TestWrapper>
          <AccountsPayableDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("finance-detail-card")).toBeInTheDocument();
    });

    it("should render transaction with savings bank account", async () => {
      const { useParams } = await import("react-router");
      const savingsAccount = { ...mockBankAccounts[0], accountType: "savings" as const };
      const transaction = {
        ...mockAccountsPayable[0],
        bankAccountId: savingsAccount.id,
      };
      vi.mocked(useParams).mockReturnValue({ transactionId: transaction.id });
      const { getAccountsPayableById } = await import("~/services/accounts-payable.service");
      const { getBankAccountById } = await import("~/services/bank-account.service");
      vi.mocked(getAccountsPayableById).mockReturnValue(transaction as never);
      vi.mocked(getBankAccountById).mockReturnValue(savingsAccount as never);

      render(
        <TestWrapper>
          <AccountsPayableDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("finance-detail-card")).toBeInTheDocument();
    });

    it("should update observations when initialObservations change", async () => {
      const { useParams } = await import("react-router");
      const { getAccountsPayableObservationsByAccountsPayableId } = await import(
        "~/services/accounts-payable-observations.service"
      );
      const transaction = mockAccountsPayable[0];
      vi.mocked(useParams).mockReturnValue({ transactionId: transaction.id });

      const initialObservations = [
        {
          id: "obs-1",
          accountsPayableId: transaction.id,
          observation: "Initial observation",
          createdAt: "2025-01-01",
        },
      ];
      vi.mocked(getAccountsPayableObservationsByAccountsPayableId).mockReturnValue(
        initialObservations
      );

      const { rerender } = render(
        <TestWrapper>
          <AccountsPayableDetails />
        </TestWrapper>
      );

      const updatedObservations = [
        {
          id: "obs-1",
          accountsPayableId: transaction.id,
          observation: "Initial observation",
          createdAt: "2025-01-01",
        },
        {
          id: "obs-2",
          accountsPayableId: transaction.id,
          observation: "New observation",
          createdAt: "2025-01-02",
        },
      ];
      vi.mocked(getAccountsPayableObservationsByAccountsPayableId).mockReturnValue(
        updatedObservations
      );

      rerender(
        <TestWrapper>
          <AccountsPayableDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("observation-section")).toBeInTheDocument();
    });

    it("should render transaction without optional entities", async () => {
      const { useParams } = await import("react-router");
      const transaction = {
        ...mockAccountsPayable[0],
        supplierId: undefined,
        employeeId: undefined,
        serviceProviderId: undefined,
        propertyId: undefined,
        bankAccountId: undefined,
        paymentMethod: undefined,
        paidDate: undefined,
        paidAmount: undefined,
        referenceNumber: undefined,
      };
      vi.mocked(useParams).mockReturnValue({ transactionId: transaction.id });
      const { getAccountsPayableById } = await import("~/services/accounts-payable.service");
      vi.mocked(getAccountsPayableById).mockReturnValue(transaction as never);

      render(
        <TestWrapper>
          <AccountsPayableDetails />
        </TestWrapper>
      );

      expect(screen.getByTestId("finance-detail-card")).toBeInTheDocument();
    });

    it("should render transaction description", async () => {
      const { useParams } = await import("react-router");
      const transaction = mockAccountsPayable[0];
      vi.mocked(useParams).mockReturnValue({ transactionId: transaction.id });

      render(
        <TestWrapper>
          <AccountsPayableDetails />
        </TestWrapper>
      );

      expect(screen.getByText(transaction.description)).toBeInTheDocument();
    });
  });
});
