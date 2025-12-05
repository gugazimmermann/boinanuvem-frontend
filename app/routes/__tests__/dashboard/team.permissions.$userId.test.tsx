import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { loader, meta, default as TeamPermissions } from "../../dashboard/team.permissions.$userId";
import { ROUTES } from "~/routes.config";
import { mockUsers } from "~/mocks/users";

// Create stable navigate function to prevent infinite re-renders
const stableNavigate = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({ userId: "user-1" })),
    useNavigate: vi.fn(() => stableNavigate),
  };
});

vi.mock("~/utils/route-guard", () => ({
  requireMainUser: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/users.service", () => ({
  getTeamMembers: vi.fn(),
  updateTeamMemberPermissions: vi.fn(() =>
    Promise.resolve({
      id: "user-1",
      name: "User 1",
      email: "user1@test.com",
      phone: null,
      cpf: null,
      street: null,
      number: null,
      complement: null,
      neighborhood: null,
      city: null,
      state: null,
      zipCode: null,
      mainUser: false,
      status: "active",
      companyId: "company-1",
      permissions: {},
      createdAt: "",
      updatedAt: "",
      company: {},
    })
  ),
}));

// Create stable currentUser to prevent infinite re-renders
const stableCurrentUser = {
  id: "user-1",
  mainUser: true,
};

const stableAuthReturn = {
  currentUser: stableCurrentUser,
};

vi.mock("~/contexts/auth-context", () => ({
  useAuth: vi.fn(() => ({
    ...stableAuthReturn,
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: true,
    refreshTokens: vi.fn(),
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
  })),
}));

// Create stable alert functions to prevent infinite re-renders
const stableShowAlert = vi.fn();
const stableAlertReturn = {
  alertMessage: null,
  showAlert: stableShowAlert,
};

vi.mock("~/hooks/use-alert", () => ({
  useAlert: vi.fn(() => stableAlertReturn),
}));

vi.mock("~/components/ui", () => ({
  Button: vi.fn(
    ({
      children,
      onClick,
      variant,
      disabled,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      variant?: string;
      disabled?: boolean;
    }) => (
      <button onClick={onClick} data-variant={variant} disabled={disabled}>
        {children}
      </button>
    )
  ),
  FixedAlert: vi.fn(() => null),
  Alert: vi.fn(() => null),
}));

// Create a stable translation object to prevent infinite re-renders
const stableTranslation = {
  team: {
    permissions: {
      title: "Permissões do Membro",
      descriptionFor: (name: string) => `Gerenciar permissões de ${name}`,
      selectAll: "Selecionar Tudo",
      actions: {
        view: "Visualizar",
        add: "Adicionar",
        edit: "Editar",
        remove: "Remover",
      },
      resources: {
        property: "Propriedade",
        location: "Localização",
        employee: "Funcionário",
        serviceProvider: "Prestador de Serviço",
        supplier: "Fornecedor",
        buyer: "Comprador",
        inventory: "Estoque",
        animals: "Animais",
        births: "Nascimentos",
        acquisitions: "Aquisições",
        weighings: "Pesagens",
        sales: "Vendas",
        deaths: "Óbitos",
        sanitaryControls: "Controles Sanitários",
        locationMovements: "Movimentações de Localização",
        animalMovements: "Movimentações de Animais",
        breedings: "Reproduções",
        unconfirmedBreedings: "Reproduções Não Confirmadas",
        pregnantCows: "Vacas Prenhes",
        reproductiveIndexes: "Índices Reprodutivos",
        birthForecast: "Previsão de Nascimentos",
        cashFlow: "Fluxo de Caixa",
        accountsPayable: "Contas a Pagar",
        accountsReceivable: "Contas a Receber",
        bankAccounts: "Contas Bancárias",
      },
      registration: "Cadastros",
      records: "Registros",
      breedings: "Reproduções",
      finances: "Finanças",
      savePermissions: "Salvar Permissões",
      success: "Permissões atualizadas com sucesso",
      error: "Erro ao atualizar permissões",
      userNotFound: "Usuário não encontrado",
    },
    addModal: {
      cancel: "Cancelar",
    },
    new: {
      back: "Voltar",
    },
  },
  common: {
    loading: "Carregando...",
  },
};

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => stableTranslation),
}));

vi.mock("~/types/permissions", () => ({
  defaultPermissions: {
    registration: {
      property: { view: false, add: false, edit: false, remove: false },
      location: { view: false, add: false, edit: false, remove: false },
      employee: { view: false, add: false, edit: false, remove: false },
      serviceProvider: { view: false, add: false, edit: false, remove: false },
      supplier: { view: false, add: false, edit: false, remove: false },
      buyer: { view: false, add: false, edit: false, remove: false },
      inventory: { view: false, add: false, edit: false, remove: false },
      animals: { view: false, add: false, edit: false, remove: false },
    },
    records: {
      births: { view: false, add: false, edit: false, remove: false },
      acquisitions: { view: false, add: false, edit: false, remove: false },
      weighings: { view: false, add: false, edit: false, remove: false },
      sales: { view: false, add: false, edit: false, remove: false },
      deaths: { view: false, add: false, edit: false, remove: false },
      sanitaryControls: { view: false, add: false, edit: false, remove: false },
      locationMovements: { view: false, add: false, edit: false, remove: false },
      animalMovements: { view: false, add: false, edit: false, remove: false },
    },
    breedings: {
      breedings: { view: false, add: false, edit: false, remove: false },
      unconfirmedBreedings: { view: false, add: false, edit: false, remove: false },
      pregnantCows: { view: false, add: false, edit: false, remove: false },
      reproductiveIndexes: { view: false, add: false, edit: false, remove: false },
      birthForecast: { view: false, add: false, edit: false, remove: false },
    },
    finances: {
      cashFlow: { view: false, add: false, edit: false, remove: false },
      accountsPayable: { view: false, add: false, edit: false, remove: false },
      accountsReceivable: { view: false, add: false, edit: false, remove: false },
      bankAccounts: { view: false, add: false, edit: false, remove: false },
    },
  },
}));

vi.mock("~/components/dashboard/utils/colors", () => ({
  DASHBOARD_COLORS: {
    primary: "#3B82F6",
  },
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/equipe/user-1/permissoes"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("team.permissions.$userId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call requireMainUser", async () => {
      const { requireMainUser } = await import("~/utils/route-guard");
      const request = new Request("http://localhost/dashboard/equipe/user-1/permissoes");

      await loader({ request });

      expect(requireMainUser).toHaveBeenCalled();
    });
  });

  describe("meta", () => {
    it("should return SEO meta tags", () => {
      const result = meta();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty("title");
      expect(result[0].title).toContain("Permissões do Membro");
    });
  });

  describe("TeamPermissions component", () => {
    it("should render permissions page with correct title", async () => {
      const { useParams } = await import("react-router");
      const { getTeamMembers } = await import("~/services/users.service");
      const nonMainUser = mockUsers.find((u) => !u.mainUser);
      if (nonMainUser) {
        vi.mocked(useParams).mockReturnValue({ userId: nonMainUser.id });
        vi.mocked(getTeamMembers).mockResolvedValue([
          {
            id: nonMainUser.id,
            name: nonMainUser.name || "",
            email: nonMainUser.email || "",
            phone: nonMainUser.phone || null,
            cpf: null,
            street: null,
            number: null,
            complement: null,
            neighborhood: null,
            city: null,
            state: null,
            zipCode: null,
            mainUser: false,
            status: "active",
            companyId: nonMainUser.companyId,
            permissions: nonMainUser.permissions || {},
            createdAt: "",
            updatedAt: "",
            company: {},
          },
        ]);

        render(
          <TestWrapper>
            <TeamPermissions />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText("Permissões do Membro")).toBeInTheDocument();
        });
      }
    });

    it("should render loading state when user is not found initially", async () => {
      const { useParams } = await import("react-router");
      const { getTeamMembers } = await import("~/services/users.service");
      vi.mocked(useParams).mockReturnValue({ userId: "non-existent" });
      vi.mocked(getTeamMembers).mockResolvedValue([]);

      render(
        <TestWrapper>
          <TeamPermissions />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("Carregando...")).toBeInTheDocument();
      });
    });

    it("should navigate to profile when currentUser is not mainUser", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const { useAuth } = await import("~/contexts/auth-context");
      const mockNavigate = vi.fn();
      vi.mocked(useParams).mockReturnValue({ userId: "user-1" });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(useAuth).mockReturnValue({
        currentUser: {
          id: "user-1",
          mainUser: false,
        },
      } as never);

      render(
        <TestWrapper>
          <TeamPermissions />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.PROFILE);
      });
    });

    it("should call updateTeamMemberPermissions when save button is clicked", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const { getTeamMembers, updateTeamMemberPermissions } = await import(
        "~/services/users.service"
      );
      const mockNavigate = vi.fn();
      const nonMainUser = mockUsers.find((u) => !u.mainUser);
      if (nonMainUser) {
        vi.mocked(useParams).mockReturnValue({ userId: nonMainUser.id });
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);
        vi.mocked(getTeamMembers).mockResolvedValue([
          {
            id: nonMainUser.id,
            name: nonMainUser.name || "",
            email: nonMainUser.email || "",
            phone: nonMainUser.phone || null,
            cpf: null,
            street: null,
            number: null,
            complement: null,
            neighborhood: null,
            city: null,
            state: null,
            zipCode: null,
            mainUser: false,
            status: "active",
            companyId: nonMainUser.companyId,
            permissions: nonMainUser.permissions || {},
            createdAt: "",
            updatedAt: "",
            company: {},
          },
        ]);

        render(
          <TestWrapper>
            <TeamPermissions />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText("Salvar Permissões")).toBeInTheDocument();
        });

        const saveButton = screen.getByText("Salvar Permissões");
        await userEvent.click(saveButton);

        await waitFor(
          () => {
            expect(updateTeamMemberPermissions).toHaveBeenCalled();
          },
          { timeout: 2000 }
        );
      }
    });

    it(
      "should navigate to team list on save success",
      { timeout: 15000 },
      async () => {
        const { useParams, useNavigate } = await import("react-router");
        const { getTeamMembers, updateTeamMemberPermissions } = await import(
          "~/services/users.service"
        );
        const mockNavigate = vi.fn();
        const nonMainUser = mockUsers.find((u) => !u.mainUser);
        if (nonMainUser) {
          vi.mocked(useParams).mockReturnValue({ userId: nonMainUser.id });
          vi.mocked(useNavigate).mockReturnValue(mockNavigate);
          vi.mocked(getTeamMembers).mockResolvedValue([
            {
              id: nonMainUser.id,
              name: nonMainUser.name || "",
              email: nonMainUser.email || "",
              phone: nonMainUser.phone || null,
              cpf: null,
              street: null,
              number: null,
              complement: null,
              neighborhood: null,
              city: null,
              state: null,
              zipCode: null,
              mainUser: false,
              status: "active",
              companyId: nonMainUser.companyId,
              permissions: nonMainUser.permissions || {},
              createdAt: "",
              updatedAt: "",
              company: {},
            },
          ]);
          vi.mocked(updateTeamMemberPermissions).mockResolvedValue({
            id: nonMainUser.id,
            name: nonMainUser.name || "",
            email: nonMainUser.email || "",
            phone: nonMainUser.phone || null,
            cpf: null,
            street: null,
            number: null,
            complement: null,
            neighborhood: null,
            city: null,
            state: null,
            zipCode: null,
            mainUser: false,
            status: "active",
            companyId: nonMainUser.companyId,
            permissions: nonMainUser.permissions || {},
            createdAt: "",
            updatedAt: "",
            company: {},
          });

          const user = userEvent.setup();

          render(
            <TestWrapper>
              <TeamPermissions />
            </TestWrapper>
          );

          await waitFor(() => {
            expect(screen.getByText("Salvar Permissões")).toBeInTheDocument();
          });

          const saveButton = screen.getByText("Salvar Permissões");
          await user.click(saveButton);

          await waitFor(
            () => {
              expect(mockNavigate).toHaveBeenCalledWith(ROUTES.TEAM);
            },
            { timeout: 5000 }
          );
        }
      },
      10000
    );

    it(
      "should navigate to team list when cancel button is clicked",
      { timeout: 10000 },
      async () => {
        const { useParams, useNavigate } = await import("react-router");
        const { getTeamMembers } = await import("~/services/users.service");
        const mockNavigate = vi.fn();
        const nonMainUser = mockUsers.find((u) => !u.mainUser);
        if (nonMainUser) {
          vi.mocked(useParams).mockReturnValue({ userId: nonMainUser.id });
          vi.mocked(useNavigate).mockReturnValue(mockNavigate);
          vi.mocked(getTeamMembers).mockResolvedValue([
            {
              id: nonMainUser.id,
              name: nonMainUser.name || "",
              email: nonMainUser.email || "",
              phone: nonMainUser.phone || null,
              cpf: null,
              street: null,
              number: null,
              complement: null,
              neighborhood: null,
              city: null,
              state: null,
              zipCode: null,
              mainUser: false,
              status: "active",
              companyId: nonMainUser.companyId,
              permissions: nonMainUser.permissions || {},
              createdAt: "",
              updatedAt: "",
              company: {},
            },
          ]);

          render(
            <TestWrapper>
              <TeamPermissions />
            </TestWrapper>
          );

          await waitFor(() => {
            expect(screen.getByText("Cancelar")).toBeInTheDocument();
          });

          const cancelButton = screen.getByText("Cancelar");
          await userEvent.click(cancelButton);

          await waitFor(
            () => {
              expect(mockNavigate).toHaveBeenCalledWith(ROUTES.TEAM);
            },
            { timeout: 5000 }
          );
        }
      }
    );

    it("should navigate to team list when back button is clicked", { timeout: 10000 }, async () => {
      const { useParams, useNavigate } = await import("react-router");
      const { getTeamMembers } = await import("~/services/users.service");
      const mockNavigate = vi.fn();
      const nonMainUser = mockUsers.find((u) => !u.mainUser);
      if (nonMainUser) {
        vi.mocked(useParams).mockReturnValue({ userId: nonMainUser.id });
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);
        vi.mocked(getTeamMembers).mockResolvedValue([
          {
            id: nonMainUser.id,
            name: nonMainUser.name || "",
            email: nonMainUser.email || "",
            phone: nonMainUser.phone || null,
            cpf: null,
            street: null,
            number: null,
            complement: null,
            neighborhood: null,
            city: null,
            state: null,
            zipCode: null,
            mainUser: false,
            status: "active",
            companyId: nonMainUser.companyId,
            permissions: nonMainUser.permissions || {},
            createdAt: "",
            updatedAt: "",
            company: {},
          },
        ]);

        render(
          <TestWrapper>
            <TeamPermissions />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText("Voltar")).toBeInTheDocument();
        });

        const backButton = screen.getByText("Voltar");
        await userEvent.click(backButton);

        await waitFor(
          () => {
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.TEAM);
          },
          { timeout: 5000 }
        );
      }
    });

    it(
      "should show alert when user is not found",
      { timeout: 15000 },
      async () => {
        const { useParams, useNavigate } = await import("react-router");
        const { getTeamMembers } = await import("~/services/users.service");
        const mockNavigate = vi.fn();
        stableShowAlert.mockClear();
        vi.mocked(useParams).mockReturnValue({ userId: "non-existent" });
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);
        vi.mocked(getTeamMembers).mockResolvedValue([]);

        render(
          <TestWrapper>
            <TeamPermissions />
          </TestWrapper>
        );

        // The alert should be called when user is not found in team members
        await waitFor(
          () => {
            expect(stableShowAlert).toHaveBeenCalledWith("Usuário não encontrado", "error");
          },
          { timeout: 5000 }
        );

        // Wait for navigation to be called
        await waitFor(
          () => {
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.TEAM);
          },
          { timeout: 5000 }
        );
      },
      10000
    );

    it(
      "should call updateTeamMemberPermissions when save button is clicked and handle saving state",
      { timeout: 10000 },
      async () => {
        const { useParams } = await import("react-router");
        const { getTeamMembers, updateTeamMemberPermissions } = await import(
          "~/services/users.service"
        );
        const nonMainUser = mockUsers.find((u) => !u.mainUser);
        if (nonMainUser) {
          vi.mocked(useParams).mockReturnValue({ userId: nonMainUser.id });
          vi.mocked(getTeamMembers).mockResolvedValue([
            {
              id: nonMainUser.id,
              name: nonMainUser.name || "",
              email: nonMainUser.email || "",
              phone: nonMainUser.phone || null,
              cpf: null,
              street: null,
              number: null,
              complement: null,
              neighborhood: null,
              city: null,
              state: null,
              zipCode: null,
              mainUser: false,
              status: "active",
              companyId: nonMainUser.companyId,
              permissions: nonMainUser.permissions || {},
              createdAt: "",
              updatedAt: "",
              company: {},
            },
          ]);
          vi.mocked(updateTeamMemberPermissions).mockResolvedValue({
            id: nonMainUser.id,
            name: nonMainUser.name || "",
            email: nonMainUser.email || "",
            phone: nonMainUser.phone || null,
            cpf: null,
            street: null,
            number: null,
            complement: null,
            neighborhood: null,
            city: null,
            state: null,
            zipCode: null,
            mainUser: false,
            status: "active",
            companyId: nonMainUser.companyId,
            permissions: nonMainUser.permissions || {},
            createdAt: "",
            updatedAt: "",
            company: {},
          });

          render(
            <TestWrapper>
              <TeamPermissions />
            </TestWrapper>
          );

          await waitFor(() => {
            expect(screen.getByText("Salvar Permissões")).toBeInTheDocument();
          });

          const saveButton = screen.getByText("Salvar Permissões");
          expect(saveButton).not.toBeDisabled();

          const user = userEvent.setup();
          await user.click(saveButton);

          await waitFor(
            () => {
              expect(updateTeamMemberPermissions).toHaveBeenCalled();
            },
            { timeout: 1000 }
          );
        }
      }
    );
  });
});
