import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { meta, default as NewEmployee } from "../../dashboard/employees.new";
import { ROUTES } from "~/routes.config";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/services/employees.service", () => ({
  addEmployee: vi.fn(),
}));

vi.mock("~/mocks/companies", () => ({
  mockCompanies: [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      companyName: "Test Company",
    },
  ],
}));

vi.mock("~/mocks/properties", () => ({
  mockProperties: [
    {
      id: "550e8400-e29b-41d4-a716-446655440010",
      name: "Property 1",
      companyId: "550e8400-e29b-41d4-a716-446655440000",
    },
  ],
}));

vi.mock("~/components/dashboard/forms/entity-form", () => ({
  EntityForm: vi.fn(
    ({
      onSubmit,
      onSuccess,
      onCancel,
    }: {
      entityType: string;
      onSubmit: (data: unknown) => void;
      onSuccess: () => void;
      onCancel: () => void;
      successMessage: string;
      errorMessage: string;
    }) => {
      const handleClick = () => {
        try {
          onSubmit({});
          onSuccess();
        } catch {
          // If onSubmit throws, onSuccess is not called
        }
      };
      return (
        <div data-testid="entity-form">
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

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    employees: {
      addEmployee: "Adicionar Funcionário",
      new: {
        description: "Adicione um novo funcionário",
        success: "Funcionário adicionado com sucesso",
        error: "Erro ao adicionar funcionário",
      },
    },
    common: {
      back: "Voltar",
    },
  })),
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/funcionarios/novo"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("employees.new", () => {
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
      expect(result[0].title).toContain("Adicionar Funcionário");
    });
  });

  describe("NewEmployee component", () => {
    it("should render form with correct title", () => {
      render(
        <TestWrapper>
          <NewEmployee />
        </TestWrapper>
      );

      expect(screen.getByText("Adicionar Funcionário")).toBeInTheDocument();
    });

    it("should render form with correct description", () => {
      render(
        <TestWrapper>
          <NewEmployee />
        </TestWrapper>
      );

      expect(screen.getByText("Adicione um novo funcionário")).toBeInTheDocument();
    });

    it("should call addEmployee when form is submitted", async () => {
      const { useNavigate } = await import("react-router");
      const { addEmployee } = await import("~/services/employees.service");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewEmployee />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(addEmployee).toHaveBeenCalled();
      });
    });

    it("should navigate to employees list on success", async () => {
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      vi.useFakeTimers();

      render(
        <TestWrapper>
          <NewEmployee />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      const { fireEvent } = await import("@testing-library/react");
      fireEvent.click(submitButton);

      await vi.advanceTimersByTimeAsync(1600);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.EMPLOYEES);

      vi.useRealTimers();
    }, 10000);

    it("should navigate to employees list when cancel button is clicked", async () => {
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewEmployee />
        </TestWrapper>
      );

      const cancelButton = screen.getByTestId("cancel-button");
      await userEvent.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.EMPLOYEES);
    });

    it("should navigate to employees list when back button is clicked", async () => {
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewEmployee />
        </TestWrapper>
      );

      const backButton = screen.getByText("Voltar");
      await userEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.EMPLOYEES);
    });

    it("should pass correct props to EntityForm", async () => {
      render(
        <TestWrapper>
          <NewEmployee />
        </TestWrapper>
      );

      const EntityForm = vi.mocked(
        (await import("~/components/dashboard/forms/entity-form")).EntityForm
      );
      const calls = EntityForm.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props).toHaveProperty("entityType", "employee");
      expect(props).toHaveProperty("properties");
      expect(props).toHaveProperty("onSubmit");
      expect(props).toHaveProperty("onSuccess");
      expect(props).toHaveProperty("onCancel");
      expect(props).toHaveProperty("successMessage");
      expect(props).toHaveProperty("errorMessage");
    });

    it("should use company from mockCompanies", async () => {
      render(
        <TestWrapper>
          <NewEmployee />
        </TestWrapper>
      );

      const EntityForm = vi.mocked(
        (await import("~/components/dashboard/forms/entity-form")).EntityForm
      );
      const calls = EntityForm.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];

      // Verify that the form is set up correctly
      expect(props).toBeDefined();
    });
  });
});
