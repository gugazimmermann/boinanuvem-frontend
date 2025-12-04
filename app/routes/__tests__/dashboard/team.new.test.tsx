import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { meta, default as NewTeamMember } from "../../dashboard/team.new";
import { ROUTES, getTeamPermissionsRoute } from "~/routes.config";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/services/users.service", () => ({
  addUser: vi.fn(() => ({ id: "new-user-1" })),
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
      onSubmit: (data: unknown) => Promise<void>;
      onSuccess: () => void;
      onCancel: () => void;
      successMessage: string;
      errorMessage: string;
    }) => {
      const handleClick = async () => {
        try {
          await onSubmit({ password: "password123" });
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
  unmaskCPF: vi.fn((cpf: string) => cpf),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    team: {
      addModal: {
        title: "Adicionar Membro",
      },
      new: {
        description: "Adicione um novo membro à equipe",
        back: "Voltar",
      },
      success: {
        added: "Membro adicionado com sucesso",
      },
      errors: {
        addFailed: "Erro ao adicionar membro",
      },
    },
  })),
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/equipe/novo"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("team.new", () => {
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
      expect(result[0]).toHaveProperty("title");
      expect(result[0].title).toContain("Adicionar Membro");
    });
  });

  describe("NewTeamMember component", () => {
    it("should render form with correct title", () => {
      render(
        <TestWrapper>
          <NewTeamMember />
        </TestWrapper>
      );

      expect(screen.getByText("Adicionar Membro")).toBeInTheDocument();
    });

    it("should render form with correct description", () => {
      render(
        <TestWrapper>
          <NewTeamMember />
        </TestWrapper>
      );

      expect(screen.getByText("Adicione um novo membro à equipe")).toBeInTheDocument();
    });

    it("should navigate to profile when currentUser is not mainUser", async () => {
      const { useNavigate } = await import("react-router");
      const { useAuth } = await import("~/contexts/auth-context");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(useAuth).mockReturnValue({
        currentUser: {
          id: "user-1",
          mainUser: false,
        },
      } as never);

      render(
        <TestWrapper>
          <NewTeamMember />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.PROFILE);
      });
    });

    it("should call addUser when form is submitted", async () => {
      const { useNavigate } = await import("react-router");
      const { addUser } = await import("~/services/users.service");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewTeamMember />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(addUser).toHaveBeenCalled();
      });
    });

    it("should navigate to permissions route on success", async () => {
      const { useNavigate } = await import("react-router");
      const { addUser } = await import("~/services/users.service");
      const mockNavigate = vi.fn();
      const newUser = { id: "new-user-1" };
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(addUser).mockReturnValue(newUser as never);

      vi.useFakeTimers();

      render(
        <TestWrapper>
          <NewTeamMember />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      const { fireEvent } = await import("@testing-library/react");
      fireEvent.click(submitButton);

      await vi.advanceTimersByTimeAsync(1600);

      expect(mockNavigate).toHaveBeenCalledWith(getTeamPermissionsRoute(newUser.id));

      vi.useRealTimers();
    }, 10000);

    it("should navigate to team list when cancel button is clicked", async () => {
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewTeamMember />
        </TestWrapper>
      );

      const cancelButton = screen.getByTestId("cancel-button");
      await userEvent.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.TEAM);
    });

    it("should navigate to team list when back button is clicked", async () => {
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewTeamMember />
        </TestWrapper>
      );

      const backButton = screen.getByText("Voltar");
      await userEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.TEAM);
    });

    it("should throw error when password is missing", async () => {
      const { useNavigate } = await import("react-router");
      const { addUser } = await import("~/services/users.service");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      const TeamForm = (await import("~/components/dashboard/forms/team-form")).TeamForm;
      vi.mocked(TeamForm).mockImplementation(
        ({ onSubmit }: { onSubmit: (data: unknown) => Promise<void> }) => {
          const handleClick = async () => {
            try {
              await onSubmit({});
            } catch {
              // Error is expected
            }
          };
          return (
            <div data-testid="team-form">
              <button data-testid="submit-button" onClick={handleClick}>
                Submit
              </button>
            </div>
          );
        }
      );

      render(
        <TestWrapper>
          <NewTeamMember />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(addUser).not.toHaveBeenCalled();
      });
    });

    it("should pass correct props to TeamForm", async () => {
      render(
        <TestWrapper>
          <NewTeamMember />
        </TestWrapper>
      );

      const TeamForm = vi.mocked((await import("~/components/dashboard/forms/team-form")).TeamForm);
      const calls = TeamForm.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props).toHaveProperty("onSubmit");
      expect(props).toHaveProperty("onSuccess");
      expect(props).toHaveProperty("onCancel");
      expect(props).toHaveProperty("successMessage");
      expect(props).toHaveProperty("errorMessage");
    });
  });
});
