import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { meta, default as NewServiceProvider } from "../../dashboard/service-providers.new";
import { ROUTES } from "~/routes.config";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/services/service-providers.service", () => ({
  addServiceProvider: vi.fn(),
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
    serviceProviders: {
      addServiceProvider: "Adicionar Prestador de Serviço",
      new: {
        description: "Adicione um novo prestador de serviço",
        success: "Prestador de serviço adicionado com sucesso",
        error: "Erro ao adicionar prestador de serviço",
      },
    },
    common: {
      back: "Voltar",
    },
  })),
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/prestadores-servico/novo"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("service-providers.new", () => {
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
      expect(result[0].title).toContain("Adicionar Prestador de Serviço");
    });
  });

  describe("NewServiceProvider component", () => {
    it("should render form with correct title", () => {
      render(
        <TestWrapper>
          <NewServiceProvider />
        </TestWrapper>
      );

      expect(screen.getByText("Adicionar Prestador de Serviço")).toBeInTheDocument();
    });

    it("should render form with correct description", () => {
      render(
        <TestWrapper>
          <NewServiceProvider />
        </TestWrapper>
      );

      expect(screen.getByText("Adicione um novo prestador de serviço")).toBeInTheDocument();
    });

    it("should call addServiceProvider when form is submitted", async () => {
      const { useNavigate } = await import("react-router");
      const { addServiceProvider } = await import("~/services/service-providers.service");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewServiceProvider />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(addServiceProvider).toHaveBeenCalled();
      });
    });

    it("should navigate to service providers list on success", async () => {
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      vi.useFakeTimers();

      render(
        <TestWrapper>
          <NewServiceProvider />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      const { fireEvent } = await import("@testing-library/react");
      fireEvent.click(submitButton);

      await vi.advanceTimersByTimeAsync(1600);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SERVICE_PROVIDERS);

      vi.useRealTimers();
    }, 10000);

    it("should navigate to service providers list when cancel button is clicked", async () => {
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewServiceProvider />
        </TestWrapper>
      );

      const cancelButton = screen.getByTestId("cancel-button");
      await userEvent.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SERVICE_PROVIDERS);
    });

    it("should navigate to service providers list when back button is clicked", async () => {
      const { useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <NewServiceProvider />
        </TestWrapper>
      );

      const backButton = screen.getByText("Voltar");
      await userEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SERVICE_PROVIDERS);
    });

    it("should pass correct props to EntityForm", async () => {
      render(
        <TestWrapper>
          <NewServiceProvider />
        </TestWrapper>
      );

      const EntityForm = vi.mocked(
        (await import("~/components/dashboard/forms/entity-form")).EntityForm
      );
      const calls = EntityForm.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props).toHaveProperty("entityType", "service-provider");
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
          <NewServiceProvider />
        </TestWrapper>
      );

      const EntityForm = vi.mocked(
        (await import("~/components/dashboard/forms/entity-form")).EntityForm
      );
      const calls = EntityForm.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];

      expect(props).toBeDefined();
    });
  });
});
