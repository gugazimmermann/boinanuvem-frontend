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
  getUserById: vi.fn((id: string) => {
    return mockUsers.find((u) => u.id === id) || null;
  }),
  updateUser: vi.fn(),
}));

vi.mock("~/contexts/auth-context", () => ({
  useAuth: vi.fn(() => ({
    currentUser: {
      id: "user-1",
      mainUser: true,
    },
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
      const nonMainUser = mockUsers.find((u) => !u.mainUser);
      if (nonMainUser) {
        vi.mocked(useParams).mockReturnValue({ userId: nonMainUser.id });

        render(
          <TestWrapper>
            <EditTeamMember />
          </TestWrapper>
        );

        expect(screen.getByText("Editar Membro")).toBeInTheDocument();
      }
    });

    it("should render form with correct description", async () => {
      const { useParams } = await import("react-router");
      const nonMainUser = mockUsers.find((u) => !u.mainUser);
      if (nonMainUser) {
        vi.mocked(useParams).mockReturnValue({ userId: nonMainUser.id });

        render(
          <TestWrapper>
            <EditTeamMember />
          </TestWrapper>
        );

        expect(screen.getByText("Edite as informações do membro")).toBeInTheDocument();
      }
    });

    it("should render loading state when user is not found", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ userId: "non-existent" });

      render(
        <TestWrapper>
          <EditTeamMember />
        </TestWrapper>
      );

      expect(screen.getByText("Carregando...")).toBeInTheDocument();
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

    it("should call updateUser when form is submitted", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const { updateUser } = await import("~/services/users.service");
      const mockNavigate = vi.fn();
      const nonMainUser = mockUsers.find((u) => !u.mainUser);
      if (nonMainUser) {
        vi.mocked(useParams).mockReturnValue({ userId: nonMainUser.id });
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);

        render(
          <TestWrapper>
            <EditTeamMember />
          </TestWrapper>
        );

        const submitButton = screen.getByTestId("submit-button");
        await userEvent.click(submitButton);

        await waitFor(() => {
          expect(updateUser).toHaveBeenCalled();
        });
      }
    });

    it("should navigate to team list on success", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      const nonMainUser = mockUsers.find((u) => !u.mainUser);
      if (nonMainUser) {
        vi.mocked(useParams).mockReturnValue({ userId: nonMainUser.id });
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);

        vi.useFakeTimers();

        render(
          <TestWrapper>
            <EditTeamMember />
          </TestWrapper>
        );

        const submitButton = screen.getByTestId("submit-button");
        const { fireEvent } = await import("@testing-library/react");
        fireEvent.click(submitButton);

        await vi.advanceTimersByTimeAsync(1600);

        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.TEAM);

        vi.useRealTimers();
      }
    }, 10000);

    it("should navigate to team list when cancel button is clicked", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      const nonMainUser = mockUsers.find((u) => !u.mainUser);
      if (nonMainUser) {
        vi.mocked(useParams).mockReturnValue({ userId: nonMainUser.id });
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);

        render(
          <TestWrapper>
            <EditTeamMember />
          </TestWrapper>
        );

        const cancelButton = screen.getByTestId("cancel-button");
        await userEvent.click(cancelButton);

        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.TEAM);
      }
    });

    it("should navigate to team list when back button is clicked", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      const nonMainUser = mockUsers.find((u) => !u.mainUser);
      if (nonMainUser) {
        vi.mocked(useParams).mockReturnValue({ userId: nonMainUser.id });
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);

        render(
          <TestWrapper>
            <EditTeamMember />
          </TestWrapper>
        );

        const backButton = screen.getByText("Voltar");
        await userEvent.click(backButton);

        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.TEAM);
      }
    });

    it("should pass correct initial data to form", async () => {
      const { useParams } = await import("react-router");
      const nonMainUser = mockUsers.find((u) => !u.mainUser);
      if (nonMainUser) {
        vi.mocked(useParams).mockReturnValue({ userId: nonMainUser.id });

        render(
          <TestWrapper>
            <EditTeamMember />
          </TestWrapper>
        );

        const TeamForm = (await import("~/components/dashboard/forms/team-form")).TeamForm;
        const calls = vi.mocked(TeamForm).mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        const props = calls[0][0];
        expect(props).toHaveProperty("initialData");
        expect(props).toHaveProperty("isEdit", true);
      }
    });

    it("should not call updateUser when userId is missing", async () => {
      const { useParams } = await import("react-router");
      const { updateUser, getUserById } = await import("~/services/users.service");
      vi.mocked(useParams).mockReturnValue({ userId: undefined });
      vi.mocked(getUserById).mockReturnValue(null);

      render(
        <TestWrapper>
          <EditTeamMember />
        </TestWrapper>
      );

      // When userId is undefined, getUserById returns null, so component shows loading state
      expect(screen.getByText("Carregando...")).toBeInTheDocument();
      expect(screen.queryByTestId("submit-button")).not.toBeInTheDocument();
      expect(updateUser).not.toHaveBeenCalled();
    });
  });
});
