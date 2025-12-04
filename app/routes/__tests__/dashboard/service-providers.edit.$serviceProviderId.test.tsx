import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import {
  loader,
  meta,
  default as EditServiceProvider,
} from "../../dashboard/service-providers.edit.$serviceProviderId";
import { ROUTES, getServiceProviderViewRoute } from "~/routes.config";
import { mockServiceProviders } from "~/mocks/service-providers";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({ serviceProviderId: "880e8400-e29b-41d4-a716-446655440010" })),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/service-providers.service", () => ({
  getServiceProviderById: vi.fn((id: string) => {
    return mockServiceProviders.find((sp) => sp.id === id) || null;
  }),
  updateServiceProvider: vi.fn(() => true),
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
      initialData: unknown;
      onSubmit: (data: unknown) => Promise<void>;
      onSuccess: () => void;
      onCancel: () => void;
      successMessage: string;
      errorMessage: string;
      isEdit: boolean;
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
      edit: {
        title: "Editar Prestador de Serviço",
        description: "Edite as informações do prestador de serviço",
      },
      success: {
        updated: "Prestador de serviço atualizado com sucesso",
      },
      errors: {
        updateFailed: "Erro ao atualizar prestador de serviço",
      },
      emptyState: {
        title: "Prestador de serviço não encontrado",
      },
    },
    team: {
      new: {
        back: "Voltar",
      },
    },
  })),
}));

const TestWrapper = ({
  children,
  initialEntries = ["/dashboard/prestadores-servico/880e8400-e29b-41d4-a716-446655440010/editar"],
}: {
  children: React.ReactNode;
  initialEntries?: string[];
}) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;

describe("service-providers.edit.$serviceProviderId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request(
        "http://localhost/dashboard/prestadores-servico/880e8400-e29b-41d4-a716-446655440010/editar"
      );

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
      expect(result[0].title).toContain("Editar Prestador de Serviço");
    });
  });

  describe("EditServiceProvider component", () => {
    it("should render form with correct title", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });

      render(
        <TestWrapper>
          <EditServiceProvider />
        </TestWrapper>
      );

      expect(screen.getByText("Editar Prestador de Serviço")).toBeInTheDocument();
    });

    it("should render form with correct description", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: mockServiceProviders[0].id });

      render(
        <TestWrapper>
          <EditServiceProvider />
        </TestWrapper>
      );

      expect(screen.getByText("Edite as informações do prestador de serviço")).toBeInTheDocument();
    });

    it("should render empty state when service provider is not found", async () => {
      const { useParams } = await import("react-router");
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: "non-existent" });

      render(
        <TestWrapper>
          <EditServiceProvider />
        </TestWrapper>
      );

      expect(screen.getByText("Prestador de serviço não encontrado")).toBeInTheDocument();
    });

    it("should call updateServiceProvider when form is submitted", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const { updateServiceProvider } = await import("~/services/service-providers.service");
      const mockNavigate = vi.fn();
      const serviceProvider = mockServiceProviders[0];
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: serviceProvider.id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <EditServiceProvider />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(updateServiceProvider).toHaveBeenCalled();
      });
    });

    it("should navigate to service providers list on success", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      const serviceProvider = mockServiceProviders[0];
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: serviceProvider.id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      vi.useFakeTimers();

      render(
        <TestWrapper>
          <EditServiceProvider />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");
      const { fireEvent } = await import("@testing-library/react");
      fireEvent.click(submitButton);

      await vi.advanceTimersByTimeAsync(1600);

      expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SERVICE_PROVIDERS);

      vi.useRealTimers();
    }, 10000);

    it("should navigate to view route when cancel button is clicked", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      const serviceProvider = mockServiceProviders[0];
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: serviceProvider.id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <EditServiceProvider />
        </TestWrapper>
      );

      const cancelButton = screen.getByTestId("cancel-button");
      await userEvent.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith(getServiceProviderViewRoute(serviceProvider.id));
    });

    it("should navigate to view route when back button is clicked", async () => {
      const { useParams, useNavigate } = await import("react-router");
      const mockNavigate = vi.fn();
      const serviceProvider = mockServiceProviders[0];
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: serviceProvider.id });
      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <EditServiceProvider />
        </TestWrapper>
      );

      const backButton = screen.getByText("Voltar");
      await userEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(getServiceProviderViewRoute(serviceProvider.id));
    });

    it("should pass correct initial data to form", async () => {
      const { useParams } = await import("react-router");
      const serviceProvider = mockServiceProviders[0];
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: serviceProvider.id });

      render(
        <TestWrapper>
          <EditServiceProvider />
        </TestWrapper>
      );

      const EntityForm = (await import("~/components/dashboard/forms/entity-form")).EntityForm;
      const calls = vi.mocked(EntityForm).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const props = calls[0][0];
      expect(props).toHaveProperty("entityType", "service-provider");
      expect(props).toHaveProperty("initialData");
      expect(props).toHaveProperty("isEdit", true);
    });

    it("should handle updateServiceProvider failure", async () => {
      const { useParams } = await import("react-router");
      const { updateServiceProvider } = await import("~/services/service-providers.service");
      const serviceProvider = mockServiceProviders[0];
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: serviceProvider.id });
      vi.mocked(updateServiceProvider).mockReturnValue(false);

      render(
        <TestWrapper>
          <EditServiceProvider />
        </TestWrapper>
      );

      const submitButton = screen.getByTestId("submit-button");

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(updateServiceProvider).toHaveBeenCalled();
      });

      expect(updateServiceProvider).toHaveBeenCalled();
    });

    it("should not call updateServiceProvider when serviceProviderId is missing", async () => {
      const { useParams } = await import("react-router");
      const { updateServiceProvider } = await import("~/services/service-providers.service");
      vi.mocked(useParams).mockReturnValue({ serviceProviderId: undefined });

      render(
        <TestWrapper>
          <EditServiceProvider />
        </TestWrapper>
      );

      // When serviceProviderId is undefined, the component shows empty state (no form)
      expect(screen.getByText("Prestador de serviço não encontrado")).toBeInTheDocument();
      expect(screen.queryByTestId("submit-button")).not.toBeInTheDocument();
      expect(updateServiceProvider).not.toHaveBeenCalled();
    });
  });
});
