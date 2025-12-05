import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { loader, meta, default as EditTeamMember } from "../../dashboard/team.edit.$userId";
import { ROUTES } from "~/routes.config";
import { mockUsers } from "~/mocks/users";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({ userId: "user-1" })),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/utils/route-guard", () => ({
  requireMainUser: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/users.service", () => ({
  getTeamMembers: vi.fn(),
  updateTeamMember: vi.fn(),
}));

vi.mock("~/contexts/auth-context", () => ({
  useAuth: vi.fn(() => ({
    currentUser: {
      id: "user-1",
      mainUser: true,
    },
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: true,
    refreshTokens: vi.fn(),
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
  })),
}));

vi.mock("~/hooks/use-alert", () => ({
  useAlert: vi.fn(() => ({
    alertMessage: null,
    showAlert: vi.fn(),
  })),
}));

vi.mock("~/components/dashboard/forms/team-form", () => ({
  TeamForm: vi.fn(
    ({
      onSubmit,
      onSuccess,
      onCancel,
    }: {
      initialData: unknown;
      isEdit: boolean;
      onSubmit: (data: unknown) => Promise<void>;
      onSuccess: () => void;
      onCancel: () => void;
      successMessage: string;
      errorMessage: string;
    }) => {
      const handleClick = async () => {
        try {
          await onSubmit({});
          onSuccess();
        } catch {
          // If onSubmit throws, onSuccess is not called
        }
      };
      return (
        <div data-testid="team-form">
          <button data-testid="submit-button" onClick={handleClick}>
            Submit
          </button>
          <button data-testid="cancel-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      );
    }
  ),
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

vi.mock("~/components/site/utils/masks", () => ({
  maskPhone: vi.fn((phone: string) => phone),
  maskCPF: vi.fn((cpf: string) => cpf),
  unmaskCPF: vi.fn((cpf: string) => cpf),
  maskCEP: vi.fn((cep: string) => cep),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    team: {
      editModal: {
        title: "Editar Membro",
        description: "Edite as informações do membro",
      },
      success: {
        updated: "Membro atualizado com sucesso",
      },
      errors: {
        updateFailed: "Erro ao atualizar membro",
      },
      new: {
        back: "Voltar",
      },
    },
    common: {
      loading: "Carregando...",
    },
  })),
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/equipe/user-1/editar"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("team.edit.$userId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call requireMainUser", async () => {
      const { requireMainUser } = await import("~/utils/route-guard");
      const request = new Request("http://localhost/dashboard/equipe/user-1/editar");

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
      expect(result[0].title).toContain("Editar Membro");
    });
  });

  describe("EditTeamMember component", () => {
    it("should render form with correct title", async () => {
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
            permissions: {},
            createdAt: "",
            updatedAt: "",
            company: {},
          },
        ]);

        render(
          <TestWrapper>
            <EditTeamMember />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText("Editar Membro")).toBeInTheDocument();
        });
      }
    });

    it("should render form with correct description", async () => {
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
            permissions: {},
            createdAt: "",
            updatedAt: "",
            company: {},
          },
        ]);

        render(
          <TestWrapper>
            <EditTeamMember />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText("Edite as informações do membro")).toBeInTheDocument();
        });
      }
    });

    it("should render loading state when user is not found", async () => {
      const { useParams } = await import("react-router");
      const { getTeamMembers } = await import("~/services/users.service");
      vi.mocked(useParams).mockReturnValue({ userId: "non-existent" });
      vi.mocked(getTeamMembers).mockResolvedValue([]);

      render(
        <TestWrapper>
          <EditTeamMember />
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
          <EditTeamMember />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.PROFILE);
      });
    });

    it("should call updateTeamMember when form is submitted", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const { getTeamMembers, updateTeamMember } = await import("~/services/users.service");
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
            permissions: {},
            createdAt: "",
            updatedAt: "",
            company: {},
          },
        ]);
        vi.mocked(updateTeamMember).mockResolvedValue({
          id: nonMainUser.id,
          name: "Updated",
          email: nonMainUser.email || "",
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
          companyId: nonMainUser.companyId,
          permissions: {},
          createdAt: "",
          updatedAt: "",
          company: {},
        });

        render(
          <TestWrapper>
            <EditTeamMember />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByTestId("submit-button")).toBeInTheDocument();
        });

        const submitButton = screen.getByTestId("submit-button");
        await userEvent.click(submitButton);

        await waitFor(() => {
          expect(updateTeamMember).toHaveBeenCalled();
        });
      }
    });

    it(
      "should navigate to team list on success",
      { timeout: 15000 },
      async () => {
        const { useParams, useNavigate } = await import("react-router");
        const { getTeamMembers, updateTeamMember } = await import("~/services/users.service");
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
              permissions: {},
              createdAt: "",
              updatedAt: "",
              company: {},
            },
          ]);
          vi.mocked(updateTeamMember).mockResolvedValue({
            id: nonMainUser.id,
            name: "Updated",
            email: nonMainUser.email || "",
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
            companyId: nonMainUser.companyId,
            permissions: {},
            createdAt: "",
            updatedAt: "",
            company: {},
          });

          const user = userEvent.setup();

          render(
            <TestWrapper>
              <EditTeamMember />
            </TestWrapper>
          );

          await waitFor(() => {
            expect(screen.getByTestId("submit-button")).toBeInTheDocument();
          });

          const submitButton = screen.getByTestId("submit-button");
          await user.click(submitButton);

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
              permissions: {},
              createdAt: "",
              updatedAt: "",
              company: {},
            },
          ]);

          render(
            <TestWrapper>
              <EditTeamMember />
            </TestWrapper>
          );

          await waitFor(() => {
            expect(screen.getByTestId("cancel-button")).toBeInTheDocument();
          });

          const cancelButton = screen.getByTestId("cancel-button");
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
            permissions: {},
            createdAt: "",
            updatedAt: "",
            company: {},
          },
        ]);

        render(
          <TestWrapper>
            <EditTeamMember />
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

    it("should pass correct initial data to form", { timeout: 10000 }, async () => {
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
            permissions: {},
            createdAt: "",
            updatedAt: "",
            company: {},
          },
        ]);

        render(
          <TestWrapper>
            <EditTeamMember />
          </TestWrapper>
        );

        await waitFor(async () => {
          const TeamForm = (await import("~/components/dashboard/forms/team-form")).TeamForm;
          const calls = vi.mocked(TeamForm).mock.calls;
          expect(calls.length).toBeGreaterThan(0);
          const props = calls[0][0];
          expect(props).toHaveProperty("initialData");
          expect(props).toHaveProperty("isEdit", true);
        });
      }
    });

    it("should show loading state when userId is missing", async () => {
      const { useParams } = await import("react-router");
      const { getTeamMembers } = await import("~/services/users.service");
      vi.mocked(useParams).mockReturnValue({ userId: undefined });
      vi.mocked(getTeamMembers).mockResolvedValue([]);

      render(
        <TestWrapper>
          <EditTeamMember />
        </TestWrapper>
      );

      // When userId is undefined, component shows loading state
      expect(screen.getByText("Carregando...")).toBeInTheDocument();
      expect(screen.queryByTestId("submit-button")).not.toBeInTheDocument();
    });
  });
});
