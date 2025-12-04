import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { loader, meta, default as EditProperty } from "../../dashboard/properties.edit.$propertyId";
import { mockProperties } from "~/mocks/properties";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useParams: vi.fn(() => ({ propertyId: mockProperties[0]?.id || "property-1" })),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

vi.mock("~/utils/route-guard", () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve(null)),
}));

vi.mock("~/services/properties.service", () => ({
  getPropertyById: vi.fn((id: string) => mockProperties.find((p) => p.id === id)),
  updateProperty: vi.fn(() => true),
}));

vi.mock("~/hooks/use-property-form", () => ({
  usePropertyForm: vi.fn(
    ({
      initialValues,
      translationKeys: _translationKeys,
      onSubmit,
    }: {
      initialValues?: Partial<{
        code: string;
        name: string;
        city: string;
        state: string;
        areaValue: string;
        areaType: string;
        status: string;
        zipCode: string;
        street: string;
        number: string;
        complement: string;
        neighborhood: string;
      }>;
      translationKeys: { required: (field: string) => string; areaValidationError: string };
      onSubmit: (data: unknown) => void | Promise<void>;
    }) => ({
      formData: initialValues
        ? {
            code: initialValues.code,
            name: initialValues.name,
            city: initialValues.city,
            state: initialValues.state,
            areaValue: initialValues.areaValue,
            areaType: initialValues.areaType,
            status: initialValues.status,
            zipCode: initialValues.zipCode,
            street: initialValues.street,
            number: initialValues.number,
            complement: initialValues.complement,
            neighborhood: initialValues.neighborhood,
          }
        : {
            code: "",
            name: "",
            city: "",
            state: "",
            areaValue: "",
            areaType: "hectares",
            status: "active",
            zipCode: "",
            street: "",
            number: "",
            complement: "",
            neighborhood: "",
          },
      errors: {},
      isSubmitting: false,
      zipCodeLoading: false,
      zipCodeError: null,
      handleChange: vi.fn(),
      handleSubmit: vi.fn(async (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
          await onSubmit({
            code: "001",
            name: "Test Property",
            areaValue: "100",
            areaType: "hectares",
            status: "active",
            zipCode: "12345678",
            street: "Test Street",
            number: "123",
            complement: "",
            neighborhood: "Test Neighborhood",
            city: "Test City",
            state: "TS",
          });
        }
      }),
    })
  ),
}));

vi.mock("~/hooks/use-alert", () => ({
  useAlert: vi.fn(() => ({
    showAlert: vi.fn(),
    AlertDisplay: vi.fn(() => null),
  })),
}));

vi.mock("~/components/dashboard/properties/property-form", () => ({
  PropertyForm: vi.fn(
    ({
      formData,
      errors,
      isSubmitting,
      zipCodeLoading,
      zipCodeError,
      onChange,
      translationKeys: _translationKeys,
    }: {
      formData: Record<string, unknown>;
      errors: Record<string, string>;
      isSubmitting: boolean;
      zipCodeLoading: boolean;
      zipCodeError: string | null;
      onChange: (field: string, value: string) => void;
      translationKeys: Record<string, unknown>;
    }) => (
      <div data-testid="property-form">
        <input
          data-testid="input-code"
          value={String(formData.code || "")}
          onChange={(e) => onChange("code", e.target.value)}
          disabled={isSubmitting}
        />
        <input
          data-testid="input-name"
          value={String(formData.name || "")}
          onChange={(e) => onChange("name", e.target.value)}
          disabled={isSubmitting}
        />
        {zipCodeLoading && <div data-testid="zip-code-loading">Loading...</div>}
        {zipCodeError && <div data-testid="zip-code-error">{zipCodeError}</div>}
        {Object.keys(errors).map((key) => (
          <div key={key} data-testid={`error-${key}`}>
            {errors[key]}
          </div>
        ))}
      </div>
    )
  ),
}));

vi.mock("~/components/dashboard/properties/property-form-layout", () => ({
  PropertyFormLayout: vi.fn(
    ({
      title,
      description,
      backButtonLabel,
      onBack,
      cancelButtonLabel,
      onCancel,
      submitButtonLabel,
      loadingLabel,
      isSubmitting,
      onSubmit,
      alertDisplay,
      formContent,
    }: {
      title: string;
      description: string;
      backButtonLabel: string;
      onBack: () => void;
      cancelButtonLabel: string;
      onCancel: () => void;
      submitButtonLabel: string;
      loadingLabel: string;
      isSubmitting: boolean;
      onSubmit: (e: React.FormEvent) => void;
      alertDisplay: React.ComponentType;
      formContent: React.ReactNode;
    }) => {
      const AlertDisplay = alertDisplay;
      return (
        <div data-testid="property-form-layout">
          <h1>{title}</h1>
          <p>{description}</p>
          {AlertDisplay && <AlertDisplay />}
          {formContent}
          <button onClick={onBack}>{backButtonLabel}</button>
          <button onClick={onCancel}>{cancelButtonLabel}</button>
          <form onSubmit={onSubmit}>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? loadingLabel : submitButtonLabel}
            </button>
          </form>
        </div>
      );
    }
  ),
}));

vi.mock("~/i18n", () => ({
  useTranslation: vi.fn(() => ({
    properties: {
      edit: {
        title: "Editar Propriedade",
        description: "Edite as informações da propriedade",
        save: "Salvar",
        nameLabel: "Nome",
        areaLabel: "Área",
        statusLabel: "Status",
        areaValidationError: "Área deve ser maior que zero",
      },
      table: {
        code: "Código",
        active: "Ativo",
        inactive: "Inativo",
      },
      emptyState: {
        title: "Propriedade não encontrada",
      },
      success: {
        updated: "Propriedade atualizada com sucesso",
      },
      errors: {
        updateFailed: "Erro ao atualizar propriedade",
      },
    },
    profile: {
      errors: {
        required: (field: string) => `${field} é obrigatório`,
      },
      company: {
        cancel: "Cancelar",
        fields: {
          zipCode: "CEP",
          street: "Rua",
          number: "Número",
          complement: "Complemento",
          neighborhood: "Bairro",
          city: "Cidade",
          state: "Estado",
        },
      },
    },
    common: {
      loading: "Carregando...",
    },
    locations: {
      areaType: "Tipo de Área",
      areaTypes: {
        hectares: "Hectares",
        square_meters: "Metros Quadrados",
        square_feet: "Pés Quadrados",
        acres: "Acres",
        square_kilometers: "Quilômetros Quadrados",
        square_miles: "Milhas Quadradas",
      },
    },
    team: {
      new: {
        back: "Voltar",
        searchingAddress: "Buscando endereço...",
      },
    },
  })),
}));

vi.mock("~/routes.config", () => ({
  ROUTES: {
    PROPERTIES: "/dashboard/propriedades",
  },
  getPropertyViewRoute: vi.fn((id: string) => `/dashboard/propriedades/${id}`),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("properties.edit.$propertyId", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    // Restore the mock implementation after resetting
    const { getPropertyById, updateProperty } = await import("~/services/properties.service");
    vi.mocked(getPropertyById).mockImplementation((id: string) =>
      mockProperties.find((p) => p.id === id)
    );
    vi.mocked(updateProperty).mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loader", () => {
    it("should call createRouteGuard", async () => {
      const { createRouteGuard } = await import("~/utils/route-guard");
      const request = new Request("http://localhost/dashboard/propriedades/property-1/editar");

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
      expect(result[0].title).toContain("Editar Propriedade");
    });
  });

  describe("EditProperty component", () => {
    it("should render form with correct title", () => {
      render(
        <TestWrapper>
          <EditProperty />
        </TestWrapper>
      );

      expect(screen.getByText("Editar Propriedade")).toBeInTheDocument();
    });

    it("should render empty state when property is not found", async () => {
      const { useParams } = await import("react-router");
      const { getPropertyById } = await import("~/services/properties.service");

      vi.mocked(useParams).mockReturnValue({ propertyId: "non-existent" });
      vi.mocked(getPropertyById).mockReturnValue(undefined);

      render(
        <TestWrapper>
          <EditProperty />
        </TestWrapper>
      );

      expect(screen.getByText("Propriedade não encontrada")).toBeInTheDocument();
    });

    it("should render property form", () => {
      render(
        <TestWrapper>
          <EditProperty />
        </TestWrapper>
      );

      expect(screen.getByTestId("property-form")).toBeInTheDocument();
    });

    it("should initialize form with property data", () => {
      render(
        <TestWrapper>
          <EditProperty />
        </TestWrapper>
      );

      const property = mockProperties[0];
      const codeInput = screen.getByTestId("input-code");
      expect(codeInput).toHaveValue(property.code);
    });

    it("should handle form submission", async () => {
      const user = userEvent.setup();
      const { updateProperty } = await import("~/services/properties.service");
      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();

      vi.mocked(useAlert).mockReturnValue({
        showAlert: mockShowAlert,
        AlertDisplay: vi.fn(() => null),
      });
      vi.mocked(updateProperty).mockReturnValue(true);

      render(
        <TestWrapper>
          <EditProperty />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Salvar");
      await user.click(submitButton);

      await waitFor(() => {
        expect(updateProperty).toHaveBeenCalled();
      });
    });

    it("should handle successful update", async () => {
      const user = userEvent.setup();
      const { updateProperty } = await import("~/services/properties.service");
      const { useNavigate } = await import("react-router");
      const { useAlert } = await import("~/hooks/use-alert");
      const mockNavigate = vi.fn();
      const mockShowAlert = vi.fn();

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);
      vi.mocked(useAlert).mockReturnValue({
        showAlert: mockShowAlert,
        AlertDisplay: vi.fn(() => null),
      });
      vi.mocked(updateProperty).mockReturnValue(true);

      render(
        <TestWrapper>
          <EditProperty />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Salvar");
      await user.click(submitButton);

      await waitFor(
        () => {
          expect(mockShowAlert).toHaveBeenCalledWith(
            "Propriedade atualizada com sucesso",
            "success"
          );
        },
        { timeout: 2000 }
      );
    });

    it("should handle update failure", async () => {
      const user = userEvent.setup();
      const { updateProperty } = await import("~/services/properties.service");
      const { useAlert } = await import("~/hooks/use-alert");
      const mockShowAlert = vi.fn();

      vi.mocked(useAlert).mockReturnValue({
        showAlert: mockShowAlert,
        AlertDisplay: vi.fn(() => null),
      });
      vi.mocked(updateProperty).mockReturnValue(false);

      render(
        <TestWrapper>
          <EditProperty />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Salvar");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockShowAlert).toHaveBeenCalledWith("Erro ao atualizar propriedade", "error");
      });
    });

    it("should handle navigation back", async () => {
      const user = userEvent.setup();
      const { useNavigate } = await import("react-router");
      const { getPropertyViewRoute } = await import("~/routes.config");
      const mockNavigate = vi.fn();
      const propertyId = mockProperties[0]?.id || "property-1";

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <EditProperty />
        </TestWrapper>
      );

      const backButton = screen.getByText("Voltar");
      await user.click(backButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(getPropertyViewRoute(propertyId));
      });
    });

    it("should handle cancel action", async () => {
      const user = userEvent.setup();
      const { useNavigate } = await import("react-router");
      const { getPropertyViewRoute } = await import("~/routes.config");
      const mockNavigate = vi.fn();
      const propertyId = mockProperties[0]?.id || "property-1";

      vi.mocked(useNavigate).mockReturnValue(mockNavigate);

      render(
        <TestWrapper>
          <EditProperty />
        </TestWrapper>
      );

      const cancelButton = screen.getByText("Cancelar");
      await user.click(cancelButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(getPropertyViewRoute(propertyId));
      });
    });

    it("should disable form when submitting", async () => {
      const { usePropertyForm } = await import("~/hooks/use-property-form");

      vi.mocked(usePropertyForm).mockReturnValue({
        formData: {
          code: "001",
          name: "Test",
          city: "Test City",
          state: "TS",
          areaValue: "100",
          areaType: "hectares",
          status: "active",
          zipCode: "12345678",
          street: "Test Street",
          number: "123",
          complement: "",
          neighborhood: "Test Neighborhood",
        },
        errors: {},
        isSubmitting: true,
        zipCodeLoading: false,
        zipCodeError: null,
        handleChange: vi.fn(),
        handleSubmit: vi.fn(),
      });

      render(
        <TestWrapper>
          <EditProperty />
        </TestWrapper>
      );

      const submitButton = screen.getByText("Carregando...");
      expect(submitButton).toBeDisabled();
    });
  });
});
