import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { meta, default as UserProfileView } from "../../dashboard/profile.$userId";
import { mockUsers } from "~/mocks/users";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({ userId: mockUsers[0]?.id || "user-1" })),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/components/dashboard/profile", () => ({
  UserProfile: vi.fn(
    ({
      userId,
      readOnly,
      onEdit,
      onSave,
    }: {
      userId?: string;
      readOnly: boolean;
      onEdit: () => void;
      onSave: (data: unknown) => Promise<void>;
    }) => (
      <div data-testid="user-profile">
        <div data-testid="user-id">{userId}</div>
        <div data-testid="read-only">{readOnly ? "true" : "false"}</div>
        <button data-testid="edit-button" onClick={onEdit}>
          Edit
        </button>
        <button
          data-testid="save-button"
          onClick={() => onSave({ name: "Test", email: "test@test.com", phone: "123" })}
        >
          Save
        </button>
      </div>
    )
  ),
}));

vi.mock("~/services/users.service", () => ({
  updateTeamMember: vi.fn(
    (_userId: string, _data: { name: string; email: string; phone: string }) => {
      return Promise.resolve({
        id: _userId,
        name: _data.name,
        email: _data.email,
        phone: _data.phone || null,
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
      });
    }
  ),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    profile: {
      user: {
        title: "Perfil do Usuário",
      },
    },
    team: {
      title: "Equipe",
    },
  })),
}));

vi.mock("~/routes.config", () => ({
  ROUTES: {
    TEAM: "/dashboard/equipe",
  },
}));

vi.mock("~/components/ui", () => ({
  Button: vi.fn(
    ({
      children,
      onClick,
      variant,
      leftIcon,
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      variant?: string;
      leftIcon?: React.ReactNode;
    }) => (
      <button onClick={onClick} data-variant={variant} data-testid="back-button">
        {leftIcon}
        {children}
      </button>
    )
  ),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("profile.$userId", () => {
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
      expect(result[0].title).toContain("Perfil do Usuário");
      expect(result[1]).toHaveProperty("name", "description");
    });
  });

  describe("UserProfileView component", () => {
    it("should render user profile with correct title", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ userId: mockUsers[0]?.id || "user-1" });

      render(
        <TestWrapper>
          <UserProfileView />
        </TestWrapper>
      );

      expect(screen.getByText("Perfil do Usuário")).toBeInTheDocument();
    });

    it("should render UserProfile component", () => {
      render(
        <TestWrapper>
          <UserProfileView />
        </TestWrapper>
      );

      expect(screen.getByTestId("user-profile")).toBeInTheDocument();
    });

    it("should pass userId to UserProfile component", () => {
      render(
        <TestWrapper>
          <UserProfileView />
        </TestWrapper>
      );

      const userIdElement = screen.getByTestId("user-id");
      expect(userIdElement).toBeInTheDocument();
    });

    it("should pass readOnly=true to UserProfile component", () => {
      render(
        <TestWrapper>
          <UserProfileView />
        </TestWrapper>
      );

      const readOnlyElement = screen.getByTestId("read-only");
      expect(readOnlyElement).toHaveTextContent("true");
    });

    it("should render back button", () => {
      render(
        <TestWrapper>
          <UserProfileView />
        </TestWrapper>
      );

      const backButton = screen.getByTestId("back-button");
      expect(backButton).toBeInTheDocument();
    });

    it("should navigate to team page when back button is clicked", async () => {
      const user = userEvent.setup();
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <UserProfileView />
        </TestWrapper>
      );

      const backButton = screen.getByTestId("back-button");
      await user.click(backButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/equipe");
      });
    });

    it("should handle save action", async () => {
      const user = userEvent.setup();
      const { updateTeamMember } = await import("~/services/users.service");
      const mockUpdateTeamMember = vi.mocked(updateTeamMember);

      render(
        <TestWrapper>
          <UserProfileView />
        </TestWrapper>
      );

      const saveButton = screen.getByTestId("save-button");
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateTeamMember).toHaveBeenCalled();
      });
    });

    it("should handle save with correct data", async () => {
      const user = userEvent.setup();
      const { useParams } = await import("react-router");
      const { updateTeamMember } = await import("~/services/users.service");
      const userId = mockUsers[0]?.id || "user-1";

      vi.mocked(useParams).mockReturnValue({ userId });
      const mockUpdateTeamMember = vi.mocked(updateTeamMember);

      render(
        <TestWrapper>
          <UserProfileView />
        </TestWrapper>
      );

      const saveButton = screen.getByTestId("save-button");
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateTeamMember).toHaveBeenCalledWith(
          userId,
          expect.objectContaining({
            name: "Test",
            email: "test@test.com",
            phone: "123",
          })
        );
      });
    });

    it("should handle missing userId gracefully", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ userId: undefined });

      render(
        <TestWrapper>
          <UserProfileView />
        </TestWrapper>
      );

      // Component should still render
      expect(screen.getByTestId("user-profile")).toBeInTheDocument();
    });

    it("should handle onEdit callback", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserProfileView />
        </TestWrapper>
      );

      const editButton = screen.getByTestId("edit-button");
      await user.click(editButton);

      // The onEdit callback should be called (it's an empty function in the component)
      expect(editButton).toBeInTheDocument();
    });
  });
});
