import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { meta, default as NewSupplier } from "../../dashboard/suppliers.new";
import { ROUTES } from "~/routes.config";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/services/suppliers.service", () => ({
  addSupplier: vi.fn(),
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
    suppliers: {
      addSupplier: "Adicionar Fornecedor",
      new: {
        description: "Adicione um novo fornecedor",
        success: "Fornecedor adicionado com sucesso",
        error: "Erro ao adicionar fornecedor",
      },
    },
    common: {
      back: "Voltar",
    },
  })),
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/fornecedores/novo"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("suppliers.new", () => {
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
      expect(result[0].title).toContain("Adicionar Fornecedor");
    });
  });

  describe("NewSupplier component", () => {
    it("should render form with correct title", () => {
      render(
        <TestWrapper>
          <NewSupplier />
        </TestWrapper>
      );

      expect(screen.getByText("Adicionar Fornecedor")).toBeInTheDocument();
    });

    it("should render form with correct description", () => {
      render(
        <TestWrapper>
          <NewSupplier />
        </TestWrapper>
      );

      expect(screen.getByText("Adicione um novo fornecedor")).toBeInTheDocument();
    });

    it("should call addSupplier when form is submitted", async () => {
      const { useNavigate } = await import("react-router");
      const { addSupplier } = await import("~/services/suppliers.service");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewSupplier />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(addSupplier).toHaveBeenCalled();
      });
    });

    it("should navigate to suppliers list on success", async () => {
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      vi.useFakeTimers();

      render(
        <TestWrapper>
          <NewSupplier />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      const { fireEvent } = await import("@testing-library/react");
      fireEvent.click(submitButton);

      await vi.advanceTimersByTimeAsync(1600);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SUPPLIERS);

      vi.useRealTimers();
    }, 10000);

    it("should navigate to suppliers list when cancel button is clicked", async () => {
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewSupplier />
        </TestWrapper>
      );

      const cancelButton = screen.getByTestId("cancel-button");
      await userEvent.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SUPPLIERS);
    });

    it("should navigate to suppliers list when back button is clicked", async () => {
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewSupplier />
        </TestWrapper>
      );

      const backButton = screen.getByText("Voltar");
      await userEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SUPPLIERS);
    });

    it("should pass correct props to EntityForm", async () => {
      render(
        <TestWrapper>
          <NewSupplier />
        </TestWrapper>
      );

      const EntityForm = vi.mocked(
        (await import("~/components/dashboard/forms/entity-form")).EntityForm
      );
      const calls = EntityForm.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props).toHaveProperty("entityType", "supplier");
      expect(props).toHaveProperty("properties");
      expect(props).toHaveProperty("onSubmit");
      expect(props).toHaveProperty("onSuccess");
      expect(props).toHaveProperty("onCancel");
      expect(props).toHaveProperty("successMessage");
      expect(props).toHaveProperty("errorMessage");
    });
  });
});
